"""
Supply Chain Command Center API Routes
Provides supplier-specific, season-wise performance and activity views
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
from collections import defaultdict

from utils.auth import get_current_user, require_brand
from utils.database import db

router = APIRouter(prefix="/command-center", tags=["Supply Chain Command Center"])

# Collections
pos_collection = db.purchase_orders
suppliers_collection = db.suppliers
users_collection = db.users
production_reports_collection = db.production_reports
quality_reports_collection = db.quality_reports
inspection_reports_collection = db.inspection_reports
fabric_test_reports_collection = db.fabric_test_reports
trims_reports_collection = db.trims_reports
dispatches_collection = db.dispatches
invoices_collection = db.invoices
traceability_collection = db.traceability
report_alerts_collection = db.report_alerts
incoming_alerts_collection = db.incoming_alerts


async def get_supplier_pos(supplier_id: str, season_id: Optional[str] = None, brand_id: Optional[str] = None) -> List[dict]:
    """Get all POs for a supplier, optionally filtered by season."""
    query = {"supplier_id": supplier_id, "is_deleted": {"$ne": True}}
    if season_id:
        query["season_id"] = season_id
    if brand_id:
        query["brand_id"] = brand_id
    
    return await pos_collection.find(query, {"_id": 0}).to_list(500)


@router.get("/suppliers")
async def get_command_center_suppliers(
    current_user: dict = Depends(require_brand)
):
    """Get list of suppliers for the command center dropdown."""
    # Get suppliers that have POs with this brand
    pos = await pos_collection.find(
        {"brand_id": current_user["user_id"], "is_deleted": {"$ne": True}},
        {"_id": 0, "supplier_id": 1, "supplier_name": 1}
    ).to_list(500)
    
    # Get unique suppliers
    supplier_map = {}
    for po in pos:
        sid = po.get("supplier_id")
        if sid and sid not in supplier_map:
            supplier_map[sid] = {
                "id": sid,
                "name": po.get("supplier_name", "Unknown Supplier")
            }
    
    # Enrich with supplier details
    suppliers = []
    for sid, info in supplier_map.items():
        supplier = await suppliers_collection.find_one({"id": sid}, {"_id": 0})
        if supplier:
            suppliers.append({
                "id": sid,
                "name": supplier.get("company_name", info["name"]),
                "country": supplier.get("country", ""),
                "risk_category": supplier.get("risk_category", "low"),
                "compliance_score": supplier.get("compliance_score", 0)
            })
        else:
            suppliers.append(info)
    
    return sorted(suppliers, key=lambda x: x["name"])


@router.get("/supplier/{supplier_id}/overview")
async def get_supplier_overview(
    supplier_id: str,
    season_id: Optional[str] = None,
    current_user: dict = Depends(require_brand)
):
    """Get complete supplier overview for command center."""
    pos = await get_supplier_pos(supplier_id, season_id, current_user["user_id"])
    
    if not pos:
        return {
            "supplier_id": supplier_id,
            "season_id": season_id,
            "total_pos": 0,
            "active_pos": 0,
            "completed_pos": 0,
            "delayed_pos": 0,
            "total_value": 0,
            "total_quantity": 0,
            "po_status_breakdown": {},
            "production_progress": 0,
            "quality_score": 0,
            "delivery_on_time_rate": 0
        }
    
    po_ids = [po["id"] for po in pos]
    
    # PO Status breakdown
    status_counts = defaultdict(int)
    total_value = 0
    total_quantity = 0
    
    for po in pos:
        status_counts[po.get("status", "unknown")] += 1
        total_value += po.get("total_amount", 0)
        for item in po.get("line_items", []):
            total_quantity += item.get("quantity", 0)
    
    # Count delayed (check delivery date vs today)
    today = datetime.now(timezone.utc)
    delayed = 0
    for po in pos:
        if po.get("status") not in ["delivered", "completed", "cancelled"]:
            delivery_date = po.get("delivery_date")
            if delivery_date:
                if isinstance(delivery_date, str):
                    try:
                        delivery_date = datetime.fromisoformat(delivery_date.replace('Z', '+00:00'))
                    except:
                        continue
                if delivery_date < today:
                    delayed += 1
    
    # Production reports for progress calculation
    production_reports = await production_reports_collection.find(
        {"po_id": {"$in": po_ids}},
        {"_id": 0, "actual_output": 1, "target_output": 1}
    ).to_list(1000)
    
    total_target = sum(r.get("target_output", 0) for r in production_reports)
    total_actual = sum(r.get("actual_output", 0) for r in production_reports)
    production_progress = (total_actual / total_target * 100) if total_target > 0 else 0
    
    # Quality reports for quality score
    quality_reports = await quality_reports_collection.find(
        {"po_id": {"$in": po_ids}},
        {"_id": 0, "dhu_percentage": 1}
    ).to_list(1000)
    
    avg_dhu = sum(r.get("dhu_percentage", 0) for r in quality_reports) / len(quality_reports) if quality_reports else 0
    quality_score = max(0, 100 - (avg_dhu * 10))  # Convert DHU to score (lower DHU = higher score)
    
    # Delivery performance
    dispatches = await dispatches_collection.find(
        {"po_id": {"$in": po_ids}, "status": {"$in": ["delivered", "partially_delivered"]}},
        {"_id": 0, "delivery_status": 1}
    ).to_list(500)
    
    on_time = sum(1 for d in dispatches if d.get("delivery_status") == "on_time")
    delivery_rate = (on_time / len(dispatches) * 100) if dispatches else 0
    
    return {
        "supplier_id": supplier_id,
        "season_id": season_id,
        "total_pos": len(pos),
        "active_pos": status_counts.get("in_production", 0) + status_counts.get("accepted", 0),
        "completed_pos": status_counts.get("completed", 0) + status_counts.get("delivered", 0),
        "delayed_pos": delayed,
        "cancelled_pos": status_counts.get("cancelled", 0),
        "total_value": round(total_value, 2),
        "total_quantity": total_quantity,
        "po_status_breakdown": dict(status_counts),
        "production_progress": round(production_progress, 1),
        "quality_score": round(quality_score, 1),
        "delivery_on_time_rate": round(delivery_rate, 1)
    }


@router.get("/supplier/{supplier_id}/production")
async def get_supplier_production(
    supplier_id: str,
    season_id: Optional[str] = None,
    current_user: dict = Depends(require_brand)
):
    """Get production status and metrics for a supplier."""
    pos = await get_supplier_pos(supplier_id, season_id, current_user["user_id"])
    po_ids = [po["id"] for po in pos]
    
    if not po_ids:
        return {
            "overall_progress": 0,
            "total_target": 0,
            "total_actual": 0,
            "wip_quantity": 0,
            "daily_output_trend": [],
            "production_by_po": []
        }
    
    # Get all production reports
    reports = await production_reports_collection.find(
        {"po_id": {"$in": po_ids}},
        {"_id": 0}
    ).sort("date", -1).to_list(1000)
    
    # Calculate totals
    total_target = sum(r.get("target_output", 0) for r in reports)
    total_actual = sum(r.get("actual_output", 0) for r in reports)
    total_wip = sum(r.get("wip_quantity", 0) for r in reports[-10:])  # Recent WIP
    
    overall_progress = (total_actual / total_target * 100) if total_target > 0 else 0
    
    # Daily output trend (last 14 days)
    daily_data = defaultdict(lambda: {"target": 0, "actual": 0})
    for r in reports:
        date = r.get("date", "")[:10]  # Get date part only
        if date:
            daily_data[date]["target"] += r.get("target_output", 0)
            daily_data[date]["actual"] += r.get("actual_output", 0)
    
    daily_trend = [
        {"date": date, "target": data["target"], "actual": data["actual"]}
        for date, data in sorted(daily_data.items())[-14:]
    ]
    
    # Production by PO
    po_production = defaultdict(lambda: {"target": 0, "actual": 0, "efficiency": 0})
    for r in reports:
        po_id = r.get("po_id")
        po_production[po_id]["target"] += r.get("target_output", 0)
        po_production[po_id]["actual"] += r.get("actual_output", 0)
    
    production_by_po = []
    for po in pos[:10]:  # Top 10 POs
        prod = po_production.get(po["id"], {"target": 0, "actual": 0})
        efficiency = (prod["actual"] / prod["target"] * 100) if prod["target"] > 0 else 0
        production_by_po.append({
            "po_id": po["id"],
            "po_number": po.get("po_number", ""),
            "target": prod["target"],
            "actual": prod["actual"],
            "efficiency": round(efficiency, 1)
        })
    
    return {
        "overall_progress": round(overall_progress, 1),
        "total_target": total_target,
        "total_actual": total_actual,
        "wip_quantity": total_wip,
        "efficiency": round((total_actual / total_target * 100) if total_target > 0 else 0, 1),
        "daily_output_trend": daily_trend,
        "production_by_po": production_by_po
    }


@router.get("/supplier/{supplier_id}/quality")
async def get_supplier_quality(
    supplier_id: str,
    season_id: Optional[str] = None,
    current_user: dict = Depends(require_brand)
):
    """Get quality metrics for a supplier."""
    pos = await get_supplier_pos(supplier_id, season_id, current_user["user_id"])
    po_ids = [po["id"] for po in pos]
    
    if not po_ids:
        return {
            "average_dhu": 0,
            "quality_score": 0,
            "total_defects": 0,
            "critical_defects": 0,
            "dhu_trend": [],
            "defect_breakdown": [],
            "quality_by_po": []
        }
    
    # Get quality reports
    reports = await quality_reports_collection.find(
        {"po_id": {"$in": po_ids}},
        {"_id": 0}
    ).sort("date", -1).to_list(1000)
    
    if not reports:
        return {
            "average_dhu": 0,
            "quality_score": 100,
            "total_defects": 0,
            "critical_defects": 0,
            "dhu_trend": [],
            "defect_breakdown": [],
            "quality_by_po": []
        }
    
    # Calculate averages
    total_dhu = sum(r.get("dhu_percentage", 0) for r in reports)
    avg_dhu = total_dhu / len(reports)
    quality_score = max(0, 100 - (avg_dhu * 10))
    
    # Defect totals
    total_defects = sum(
        r.get("major_defects", 0) + r.get("minor_defects", 0) + r.get("critical_defects", 0)
        for r in reports
    )
    critical_defects = sum(r.get("critical_defects", 0) for r in reports)
    
    # DHU trend (last 14 days)
    dhu_by_date = defaultdict(list)
    for r in reports:
        date = r.get("date", "")[:10]
        if date:
            dhu_by_date[date].append(r.get("dhu_percentage", 0))
    
    dhu_trend = [
        {"date": date, "dhu": round(sum(vals) / len(vals), 2)}
        for date, vals in sorted(dhu_by_date.items())[-14:]
    ]
    
    # Defect breakdown by type
    defect_types = defaultdict(int)
    for r in reports:
        for defect in r.get("defects", []):
            defect_types[defect.get("type", "Other")] += defect.get("count", 0)
    
    defect_breakdown = [
        {"type": dtype, "count": count}
        for dtype, count in sorted(defect_types.items(), key=lambda x: -x[1])[:10]
    ]
    
    # Quality by PO
    po_quality = defaultdict(lambda: {"dhu_sum": 0, "count": 0})
    for r in reports:
        po_id = r.get("po_id")
        po_quality[po_id]["dhu_sum"] += r.get("dhu_percentage", 0)
        po_quality[po_id]["count"] += 1
    
    quality_by_po = []
    for po in pos[:10]:
        q = po_quality.get(po["id"], {"dhu_sum": 0, "count": 1})
        avg = q["dhu_sum"] / q["count"] if q["count"] > 0 else 0
        quality_by_po.append({
            "po_id": po["id"],
            "po_number": po.get("po_number", ""),
            "average_dhu": round(avg, 2),
            "quality_score": round(max(0, 100 - (avg * 10)), 1)
        })
    
    return {
        "average_dhu": round(avg_dhu, 2),
        "quality_score": round(quality_score, 1),
        "total_defects": total_defects,
        "critical_defects": critical_defects,
        "major_defects": sum(r.get("major_defects", 0) for r in reports),
        "minor_defects": sum(r.get("minor_defects", 0) for r in reports),
        "dhu_trend": dhu_trend,
        "defect_breakdown": defect_breakdown,
        "quality_by_po": quality_by_po
    }


@router.get("/supplier/{supplier_id}/delivery")
async def get_supplier_delivery(
    supplier_id: str,
    season_id: Optional[str] = None,
    current_user: dict = Depends(require_brand)
):
    """Get delivery performance for a supplier."""
    pos = await get_supplier_pos(supplier_id, season_id, current_user["user_id"])
    po_ids = [po["id"] for po in pos]
    
    if not po_ids:
        return {
            "total_deliveries": 0,
            "on_time_deliveries": 0,
            "delayed_deliveries": 0,
            "on_time_rate": 0,
            "average_delay_hours": 0,
            "average_transit_hours": 0,
            "delivery_trend": [],
            "delay_analysis": []
        }
    
    # Get dispatches
    dispatches = await dispatches_collection.find(
        {"po_id": {"$in": po_ids}},
        {"_id": 0}
    ).sort("dispatch_date", -1).to_list(500)
    
    # Filter to delivered only
    delivered = [d for d in dispatches if d.get("status") in ["delivered", "partially_delivered"]]
    
    if not delivered:
        return {
            "total_deliveries": 0,
            "on_time_deliveries": 0,
            "delayed_deliveries": 0,
            "on_time_rate": 0,
            "average_delay_hours": 0,
            "average_transit_hours": 0,
            "delivery_trend": [],
            "delay_analysis": []
        }
    
    on_time = sum(1 for d in delivered if d.get("delivery_status") == "on_time")
    slight_delay = sum(1 for d in delivered if d.get("delivery_status") == "slight_delay")
    critical_delay = sum(1 for d in delivered if d.get("delivery_status") == "critical_delay")
    
    avg_delay = sum(d.get("delay_hours", 0) for d in delivered) / len(delivered)
    avg_transit = sum(d.get("actual_transit_hours", 0) for d in delivered if d.get("actual_transit_hours")) / max(1, len([d for d in delivered if d.get("actual_transit_hours")]))
    
    # Delivery trend by week
    delivery_by_week = defaultdict(lambda: {"total": 0, "on_time": 0})
    for d in delivered:
        date_str = d.get("actual_delivery_date") or d.get("dispatch_date")
        if date_str:
            try:
                date = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
                week = date.strftime("%Y-W%W")
                delivery_by_week[week]["total"] += 1
                if d.get("delivery_status") == "on_time":
                    delivery_by_week[week]["on_time"] += 1
            except:
                pass
    
    delivery_trend = [
        {
            "week": week,
            "total": data["total"],
            "on_time": data["on_time"],
            "on_time_rate": round(data["on_time"] / data["total"] * 100, 1) if data["total"] > 0 else 0
        }
        for week, data in sorted(delivery_by_week.items())[-8:]
    ]
    
    # Delay analysis by reason
    delay_reasons = defaultdict(int)
    for d in delivered:
        if d.get("delay_hours", 0) > 0:
            reason = d.get("delay_reason", "Unknown")
            delay_reasons[reason] += 1
    
    delay_analysis = [
        {"reason": reason, "count": count}
        for reason, count in sorted(delay_reasons.items(), key=lambda x: -x[1])[:5]
    ]
    
    return {
        "total_deliveries": len(delivered),
        "on_time_deliveries": on_time,
        "slight_delay_deliveries": slight_delay,
        "critical_delay_deliveries": critical_delay,
        "delayed_deliveries": slight_delay + critical_delay,
        "on_time_rate": round(on_time / len(delivered) * 100, 1),
        "average_delay_hours": round(avg_delay, 1),
        "average_transit_hours": round(avg_transit, 1),
        "delivery_trend": delivery_trend,
        "delay_analysis": delay_analysis,
        "pending_dispatches": len([d for d in dispatches if d.get("status") in ["dispatched", "in_transit", "out_for_delivery"]])
    }


@router.get("/supplier/{supplier_id}/compliance")
async def get_supplier_compliance(
    supplier_id: str,
    season_id: Optional[str] = None,
    current_user: dict = Depends(require_brand)
):
    """Get compliance and traceability status for a supplier."""
    pos = await get_supplier_pos(supplier_id, season_id, current_user["user_id"])
    po_ids = [po["id"] for po in pos]
    
    if not po_ids:
        return {
            "traceability_completion": 0,
            "average_traceability_score": 0,
            "average_compliance_score": 0,
            "certified_pos": 0,
            "risk_indicators": [],
            "traceability_by_po": []
        }
    
    # Get traceability records
    traceability_records = await traceability_collection.find(
        {"po_id": {"$in": po_ids}},
        {"_id": 0}
    ).to_list(500)
    
    if not traceability_records:
        return {
            "traceability_completion": 0,
            "average_traceability_score": 0,
            "average_compliance_score": 0,
            "certified_pos": 0,
            "risk_indicators": [],
            "traceability_by_po": []
        }
    
    # Calculate scores
    avg_trace_score = sum(r.get("traceability_score", 0) for r in traceability_records) / len(traceability_records)
    avg_compliance = sum(r.get("compliance_score", 0) for r in traceability_records) / len(traceability_records)
    
    # Completion rate (traceability_score > 70 = complete)
    completed = sum(1 for r in traceability_records if r.get("traceability_score", 0) >= 70)
    completion_rate = completed / len(traceability_records) * 100
    
    # Certified POs (compliance_score > 80)
    certified = sum(1 for r in traceability_records if r.get("compliance_score", 0) >= 80)
    
    # Risk indicators
    risk_indicators = []
    low_trace = sum(1 for r in traceability_records if r.get("traceability_score", 0) < 50)
    if low_trace > 0:
        risk_indicators.append({"type": "Low Traceability", "count": low_trace, "severity": "high"})
    
    low_compliance = sum(1 for r in traceability_records if r.get("compliance_score", 0) < 50)
    if low_compliance > 0:
        risk_indicators.append({"type": "Compliance Issues", "count": low_compliance, "severity": "high"})
    
    # Traceability by PO
    trace_by_po = {r["po_id"]: r for r in traceability_records}
    traceability_by_po = []
    for po in pos[:10]:
        trace = trace_by_po.get(po["id"], {})
        traceability_by_po.append({
            "po_id": po["id"],
            "po_number": po.get("po_number", ""),
            "traceability_score": trace.get("traceability_score", 0),
            "compliance_score": trace.get("compliance_score", 0),
            "status": "complete" if trace.get("traceability_score", 0) >= 70 else "incomplete"
        })
    
    return {
        "traceability_completion": round(completion_rate, 1),
        "average_traceability_score": round(avg_trace_score, 1),
        "average_compliance_score": round(avg_compliance, 1),
        "certified_pos": certified,
        "total_pos_with_traceability": len(traceability_records),
        "risk_indicators": risk_indicators,
        "traceability_by_po": traceability_by_po
    }


@router.get("/supplier/{supplier_id}/reports")
async def get_supplier_reports_summary(
    supplier_id: str,
    season_id: Optional[str] = None,
    current_user: dict = Depends(require_brand)
):
    """Get reports summary for a supplier."""
    pos = await get_supplier_pos(supplier_id, season_id, current_user["user_id"])
    po_ids = [po["id"] for po in pos]
    
    if not po_ids:
        return {
            "total_reports": 0,
            "pending_reports": 0,
            "approved_reports": 0,
            "rejected_reports": 0,
            "reports_by_type": {},
            "recent_reports": []
        }
    
    # Count reports by type
    production_count = await production_reports_collection.count_documents({"po_id": {"$in": po_ids}})
    quality_count = await quality_reports_collection.count_documents({"po_id": {"$in": po_ids}})
    inspection_count = await inspection_reports_collection.count_documents({"po_id": {"$in": po_ids}})
    fabric_test_count = await fabric_test_reports_collection.count_documents({"po_id": {"$in": po_ids}})
    trims_count = await trims_reports_collection.count_documents({"po_id": {"$in": po_ids}})
    
    total = production_count + quality_count + inspection_count + fabric_test_count + trims_count
    
    # Get status counts (from production reports as example)
    all_reports = []
    
    prod_reports = await production_reports_collection.find(
        {"po_id": {"$in": po_ids}},
        {"_id": 0, "id": 1, "po_number": 1, "date": 1, "status": 1}
    ).sort("date", -1).limit(50).to_list(50)
    for r in prod_reports:
        r["type"] = "production"
    all_reports.extend(prod_reports)
    
    quality_reports = await quality_reports_collection.find(
        {"po_id": {"$in": po_ids}},
        {"_id": 0, "id": 1, "po_number": 1, "date": 1, "status": 1}
    ).sort("date", -1).limit(50).to_list(50)
    for r in quality_reports:
        r["type"] = "quality"
    all_reports.extend(quality_reports)
    
    inspection_reports = await inspection_reports_collection.find(
        {"po_id": {"$in": po_ids}},
        {"_id": 0, "id": 1, "po_number": 1, "date": 1, "status": 1}
    ).sort("date", -1).limit(50).to_list(50)
    for r in inspection_reports:
        r["type"] = "inspection"
    all_reports.extend(inspection_reports)
    
    # Count by status
    pending = sum(1 for r in all_reports if r.get("status") in ["submitted", "pending"])
    approved = sum(1 for r in all_reports if r.get("status") == "approved")
    rejected = sum(1 for r in all_reports if r.get("status") == "rejected")
    
    # Recent reports
    recent = sorted(all_reports, key=lambda x: x.get("date", ""), reverse=True)[:10]
    
    return {
        "total_reports": total,
        "pending_reports": pending,
        "approved_reports": approved,
        "rejected_reports": rejected,
        "reports_by_type": {
            "production": production_count,
            "quality": quality_count,
            "inspection": inspection_count,
            "fabric_test": fabric_test_count,
            "trims": trims_count
        },
        "recent_reports": recent
    }


@router.get("/supplier/{supplier_id}/alerts")
async def get_supplier_alerts(
    supplier_id: str,
    season_id: Optional[str] = None,
    current_user: dict = Depends(require_brand)
):
    """Get active alerts for a supplier."""
    pos = await get_supplier_pos(supplier_id, season_id, current_user["user_id"])
    po_ids = [po["id"] for po in pos]
    
    if not po_ids:
        return {
            "total_alerts": 0,
            "critical_alerts": 0,
            "alerts": []
        }
    
    # Get report alerts
    report_alerts = await report_alerts_collection.find(
        {"po_id": {"$in": po_ids}, "is_resolved": False},
        {"_id": 0}
    ).sort("created_at", -1).limit(20).to_list(20)
    
    # Get incoming alerts
    incoming_alerts = await incoming_alerts_collection.find(
        {"po_id": {"$in": po_ids}, "is_resolved": False},
        {"_id": 0}
    ).sort("created_at", -1).limit(20).to_list(20)
    
    all_alerts = []
    
    for a in report_alerts:
        all_alerts.append({
            "id": a.get("id"),
            "type": a.get("alert_type", "report"),
            "severity": a.get("severity", "medium"),
            "title": a.get("title", "Report Alert"),
            "description": a.get("description", ""),
            "po_id": a.get("po_id"),
            "po_number": a.get("po_number"),
            "created_at": a.get("created_at"),
            "source": "reports"
        })
    
    for a in incoming_alerts:
        all_alerts.append({
            "id": a.get("id"),
            "type": a.get("alert_type", "delivery"),
            "severity": a.get("severity", "medium"),
            "title": a.get("title", "Delivery Alert"),
            "description": a.get("description", ""),
            "po_id": a.get("po_id"),
            "po_number": a.get("po_number"),
            "created_at": a.get("created_at"),
            "source": "incoming"
        })
    
    # Sort by severity and date
    severity_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    all_alerts.sort(key=lambda x: (severity_order.get(x.get("severity"), 4), x.get("created_at", "")), reverse=True)
    
    critical = sum(1 for a in all_alerts if a.get("severity") in ["critical", "high"])
    
    return {
        "total_alerts": len(all_alerts),
        "critical_alerts": critical,
        "alerts": all_alerts[:20]
    }


@router.get("/supplier/{supplier_id}/kpis")
async def get_supplier_kpis(
    supplier_id: str,
    season_id: Optional[str] = None,
    current_user: dict = Depends(require_brand)
):
    """Get KPI summary cards data for a supplier."""
    # Get all metrics
    overview = await get_supplier_overview(supplier_id, season_id, current_user)
    production = await get_supplier_production(supplier_id, season_id, current_user)
    quality = await get_supplier_quality(supplier_id, season_id, current_user)
    delivery = await get_supplier_delivery(supplier_id, season_id, current_user)
    compliance = await get_supplier_compliance(supplier_id, season_id, current_user)
    reports = await get_supplier_reports_summary(supplier_id, season_id, current_user)
    alerts = await get_supplier_alerts(supplier_id, season_id, current_user)
    
    return {
        "kpis": {
            "total_pos": overview.get("total_pos", 0),
            "active_pos": overview.get("active_pos", 0),
            "total_value": overview.get("total_value", 0),
            "production_progress": production.get("overall_progress", 0),
            "production_efficiency": production.get("efficiency", 0),
            "quality_score": quality.get("quality_score", 0),
            "average_dhu": quality.get("average_dhu", 0),
            "on_time_delivery_rate": delivery.get("on_time_rate", 0),
            "traceability_score": compliance.get("average_traceability_score", 0),
            "compliance_score": compliance.get("average_compliance_score", 0),
            "pending_reports": reports.get("pending_reports", 0),
            "active_alerts": alerts.get("total_alerts", 0),
            "critical_alerts": alerts.get("critical_alerts", 0)
        },
        "trends": {
            "production": production.get("daily_output_trend", []),
            "quality": quality.get("dhu_trend", []),
            "delivery": delivery.get("delivery_trend", [])
        },
        "alerts": alerts.get("alerts", [])[:5]
    }
