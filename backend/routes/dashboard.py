from fastapi import APIRouter, HTTPException, status, Depends, Query
from datetime import datetime, timezone
from typing import List, Optional

from utils.auth import get_current_user, require_any_authenticated, require_admin
from utils.database import (
    users_collection, batches_collection, transactions_collection,
    audits_collection, materials_collection, production_collection,
    shipments_collection, activities_collection, alerts_collection, db
)

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

# Collections
suppliers_collection = db.suppliers
pos_collection = db.purchase_orders


@router.get("/admin")
async def get_admin_dashboard(current_user: dict = Depends(require_admin)):
    """Get admin dashboard data."""
    # User stats
    user_pipeline = [
        {"$match": {"is_deleted": {"$ne": True}}},
        {"$group": {
            "_id": "$role",
            "count": {"$sum": 1},
            "active": {"$sum": {"$cond": [{"$eq": ["$status", "active"]}, 1, 0]}},
            "pending": {"$sum": {"$cond": [{"$eq": ["$status", "pending"]}, 1, 0]}}
        }}
    ]
    user_stats = await users_collection.aggregate(user_pipeline).to_list(10)
    
    # Transaction stats
    transaction_count = await transactions_collection.count_documents({"is_deleted": {"$ne": True}})
    pending_transactions = await transactions_collection.count_documents({"status": "pending", "is_deleted": {"$ne": True}})
    
    # Batch stats
    batch_pipeline = [
        {"$match": {"is_deleted": {"$ne": True}}},
        {"$group": {
            "_id": "$status",
            "count": {"$sum": 1}
        }}
    ]
    batch_stats = await batches_collection.aggregate(batch_pipeline).to_list(20)
    
    # Audit stats
    audit_pipeline = [
        {"$match": {"is_deleted": {"$ne": True}}},
        {"$group": {
            "_id": "$status",
            "count": {"$sum": 1}
        }}
    ]
    audit_stats = await audits_collection.aggregate(audit_pipeline).to_list(10)
    
    # Material flow
    material_count = await materials_collection.count_documents({"is_deleted": {"$ne": True}})
    total_material_qty = await materials_collection.aggregate([
        {"$match": {"is_deleted": {"$ne": True}}},
        {"$group": {"_id": None, "total": {"$sum": "$quantity"}}}
    ]).to_list(1)
    
    # Pending approvals
    pending_users = await users_collection.count_documents({"status": "pending", "is_deleted": {"$ne": True}})
    
    # Active alerts
    active_alerts = await alerts_collection.count_documents({"status": "active"})
    
    # Supplier stats
    supplier_stats = await suppliers_collection.aggregate([
        {"$match": {"is_deleted": {"$ne": True}}},
        {"$group": {
            "_id": None,
            "total": {"$sum": 1},
            "active": {"$sum": {"$cond": [{"$eq": ["$status", "active"]}, 1, 0]}},
            "high_risk": {"$sum": {"$cond": [{"$in": ["$risk_category", ["high", "critical"]]}, 1, 0]}},
            "locked": {"$sum": {"$cond": [{"$eq": ["$is_locked", True]}, 1, 0]}}
        }}
    ]).to_list(1)
    sup_stats = supplier_stats[0] if supplier_stats else {"total": 0, "active": 0, "high_risk": 0, "locked": 0}
    
    # PO stats
    po_stats = await pos_collection.aggregate([
        {"$match": {"is_deleted": {"$ne": True}}},
        {"$group": {
            "_id": "$status",
            "count": {"$sum": 1}
        }}
    ]).to_list(20)
    
    # Delayed POs (past delivery date but not completed)
    delayed_pos = await pos_collection.count_documents({
        "delivery_date": {"$lt": datetime.now(timezone.utc).isoformat()},
        "status": {"$nin": ["completed", "delivered", "cancelled"]},
        "is_deleted": {"$ne": True}
    })
    
    return {
        "users": {
            "by_role": {stat["_id"]: {"total": stat["count"], "active": stat["active"], "pending": stat["pending"]} for stat in user_stats},
            "pending_approvals": pending_users
        },
        "transactions": {
            "total": transaction_count,
            "pending": pending_transactions
        },
        "batches": {
            "by_status": {stat["_id"]: stat["count"] for stat in batch_stats}
        },
        "audits": {
            "by_status": {stat["_id"]: stat["count"] for stat in audit_stats}
        },
        "materials": {
            "total_entries": material_count,
            "total_quantity": total_material_qty[0]["total"] if total_material_qty else 0
        },
        "alerts": {
            "active": active_alerts
        },
        "suppliers": {
            "total": sup_stats.get("total", 0),
            "active": sup_stats.get("active", 0),
            "high_risk": sup_stats.get("high_risk", 0),
            "locked": sup_stats.get("locked", 0)
        },
        "purchase_orders": {
            "by_status": {stat["_id"]: stat["count"] for stat in po_stats},
            "delayed": delayed_pos
        }
    }


@router.get("/manufacturer")
async def get_manufacturer_dashboard(current_user: dict = Depends(require_any_authenticated)):
    """Get manufacturer dashboard data."""
    if current_user["role"] not in ["admin", "manufacturer"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    user_id = current_user["user_id"]
    
    # Batch stats
    batch_pipeline = [
        {"$match": {"manufacturer_id": user_id, "is_deleted": {"$ne": True}}},
        {"$group": {
            "_id": "$status",
            "count": {"$sum": 1},
            "total_quantity": {"$sum": "$quantity"}
        }}
    ]
    batch_stats = await batches_collection.aggregate(batch_pipeline).to_list(20)
    
    # Recent batches
    recent_batches = await batches_collection.find(
        {"manufacturer_id": user_id, "is_deleted": {"$ne": True}}
    ).sort("created_at", -1).limit(5).to_list(5)
    
    # Material stats
    material_count = await materials_collection.count_documents({"manufacturer_id": user_id, "is_deleted": {"$ne": True}})
    
    # Production stats
    production_pipeline = [
        {"$match": {"manufacturer_id": user_id, "is_deleted": {"$ne": True}}},
        {"$group": {
            "_id": "$stage",
            "count": {"$sum": 1},
            "avg_yield": {"$avg": "$yield_percentage"}
        }}
    ]
    production_stats = await production_collection.aggregate(production_pipeline).to_list(20)
    
    # Shipment stats
    shipment_pipeline = [
        {"$match": {"manufacturer_id": user_id, "is_deleted": {"$ne": True}}},
        {"$group": {
            "_id": "$status",
            "count": {"$sum": 1}
        }}
    ]
    shipment_stats = await shipments_collection.aggregate(shipment_pipeline).to_list(10)
    
    # Pending audits
    pending_audits = await audits_collection.count_documents({
        "manufacturer_id": user_id,
        "status": {"$in": ["scheduled", "in_progress"]},
        "is_deleted": {"$ne": True}
    })
    
    return {
        "batches": {
            "by_status": {stat["_id"]: {"count": stat["count"], "quantity": stat["total_quantity"]} for stat in batch_stats},
            "recent": [{
                "id": b["id"],
                "batch_number": b["batch_number"],
                "product_name": b["product_name"],
                "status": b["status"],
                "quantity": b["quantity"]
            } for b in recent_batches]
        },
        "materials": {
            "total_entries": material_count
        },
        "production": {
            "by_stage": {stat["_id"]: {"count": stat["count"], "avg_yield": round(stat.get("avg_yield", 0), 2)} for stat in production_stats}
        },
        "shipments": {
            "by_status": {stat["_id"]: stat["count"] for stat in shipment_stats}
        },
        "audits": {
            "pending": pending_audits
        }
    }


@router.get("/brand")
async def get_brand_dashboard(current_user: dict = Depends(require_any_authenticated)):
    """Get brand dashboard data."""
    if current_user["role"] not in ["admin", "brand"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    user_id = current_user["user_id"]
    
    # Batches assigned to brand
    batch_pipeline = [
        {"$match": {"brand_id": user_id, "is_deleted": {"$ne": True}}},
        {"$group": {
            "_id": "$status",
            "count": {"$sum": 1}
        }}
    ]
    batch_stats = await batches_collection.aggregate(batch_pipeline).to_list(20)
    
    # Recent shipments
    recent_shipments = await shipments_collection.find(
        {"destination_brand_id": user_id, "is_deleted": {"$ne": True}}
    ).sort("created_at", -1).limit(5).to_list(5)
    
    # Audit requests
    audit_pipeline = [
        {"$match": {"brand_id": user_id, "is_deleted": {"$ne": True}}},
        {"$group": {
            "_id": "$status",
            "count": {"$sum": 1}
        }}
    ]
    audit_stats = await audits_collection.aggregate(audit_pipeline).to_list(10)
    
    # Compliance summary
    compliance_batches = await batches_collection.find(
        {"brand_id": user_id, "compliance_score": {"$gt": 0}, "is_deleted": {"$ne": True}},
        {"compliance_score": 1}
    ).to_list(100)
    
    avg_compliance = 0
    if compliance_batches:
        avg_compliance = sum(b["compliance_score"] for b in compliance_batches) / len(compliance_batches)
    
    return {
        "batches": {
            "by_status": {stat["_id"]: stat["count"] for stat in batch_stats}
        },
        "shipments": {
            "recent": [{
                "id": s["id"],
                "shipment_number": s["shipment_number"],
                "batch_id": s["batch_id"],
                "status": s["status"],
                "quantity": s["quantity"]
            } for s in recent_shipments]
        },
        "audits": {
            "by_status": {stat["_id"]: stat["count"] for stat in audit_stats}
        },
        "compliance": {
            "average_score": round(avg_compliance, 2),
            "total_assessed": len(compliance_batches)
        }
    }


@router.get("/auditor")
async def get_auditor_dashboard(current_user: dict = Depends(require_any_authenticated)):
    """Get auditor dashboard data."""
    if current_user["role"] not in ["admin", "auditor"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    user_id = current_user["user_id"]
    
    # Assigned audits
    audit_pipeline = [
        {"$match": {"auditor_id": user_id, "is_deleted": {"$ne": True}}},
        {"$group": {
            "_id": "$status",
            "count": {"$sum": 1}
        }}
    ]
    audit_stats = await audits_collection.aggregate(audit_pipeline).to_list(10)
    
    # Pending audits
    pending_audits = await audits_collection.find(
        {"auditor_id": user_id, "status": {"$in": ["scheduled", "in_progress"]}, "is_deleted": {"$ne": True}}
    ).sort("scheduled_date", 1).limit(10).to_list(10)
    
    # Completed audits this month
    start_of_month = datetime.now(timezone.utc).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    completed_this_month = await audits_collection.count_documents({
        "auditor_id": user_id,
        "status": {"$in": ["approved", "rejected"]},
        "completed_at": {"$gte": start_of_month.isoformat()},
        "is_deleted": {"$ne": True}
    })
    
    # Average compliance score of approved audits
    approved_audits = await audits_collection.find(
        {"auditor_id": user_id, "status": "approved", "is_deleted": {"$ne": True}},
        {"compliance_score": 1}
    ).to_list(100)
    
    avg_score = 0
    if approved_audits:
        avg_score = sum(a.get("compliance_score", 0) for a in approved_audits) / len(approved_audits)
    
    return {
        "audits": {
            "by_status": {stat["_id"]: stat["count"] for stat in audit_stats},
            "pending": [{
                "id": a["id"],
                "audit_number": a["audit_number"],
                "batch_id": a["batch_id"],
                "audit_type": a["audit_type"],
                "priority": a["priority"],
                "scheduled_date": a["scheduled_date"]
            } for a in pending_audits],
            "completed_this_month": completed_this_month
        },
        "performance": {
            "average_compliance_score": round(avg_score, 2),
            "total_approved": len(approved_audits)
        }
    }



@router.get("/supplier")
async def get_supplier_dashboard(current_user: dict = Depends(require_any_authenticated)):
    """Get supplier dashboard data."""
    if current_user["role"] not in ["admin", "supplier"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get supplier profile
    supplier = await suppliers_collection.find_one({"user_id": current_user["user_id"], "is_deleted": {"$ne": True}})
    
    if not supplier and current_user["role"] == "supplier":
        return {
            "profile": None,
            "purchase_orders": {"by_status": {}, "total": 0},
            "message": "Supplier profile not linked. Contact admin."
        }
    
    supplier_ids = [supplier["id"], supplier["supplier_id"]] if supplier else []
    
    # PO stats for this supplier
    po_query = {"supplier_id": {"$in": supplier_ids}, "is_deleted": {"$ne": True}} if supplier else {"is_deleted": {"$ne": True}}
    
    if current_user["role"] == "admin":
        po_query = {"is_deleted": {"$ne": True}}
    
    po_pipeline = [
        {"$match": po_query},
        {"$group": {
            "_id": "$status",
            "count": {"$sum": 1},
            "total_value": {"$sum": "$total_amount"}
        }}
    ]
    po_stats = await pos_collection.aggregate(po_pipeline).to_list(20)
    
    # Recent POs
    recent_pos = await pos_collection.find(po_query).sort("created_at", -1).limit(5).to_list(5)
    
    # Awaiting acceptance
    awaiting = await pos_collection.count_documents({**po_query, "status": "awaiting_acceptance"})
    
    return {
        "profile": {
            "supplier_id": supplier["supplier_id"] if supplier else None,
            "company_name": supplier["company_name"] if supplier else None,
            "compliance_score": supplier.get("compliance_score", 0) if supplier else 0,
            "risk_category": supplier.get("risk_category", "medium") if supplier else "medium",
            "status": supplier.get("status", "unknown") if supplier else "unknown"
        } if supplier else None,
        "purchase_orders": {
            "by_status": {stat["_id"]: {"count": stat["count"], "value": stat["total_value"]} for stat in po_stats},
            "total": sum(stat["count"] for stat in po_stats),
            "total_value": sum(stat["total_value"] for stat in po_stats),
            "awaiting_acceptance": awaiting,
            "recent": [{
                "id": po["id"],
                "po_number": po["po_number"],
                "brand_name": po.get("brand_name", ""),
                "status": po["status"],
                "total_amount": po.get("total_amount", 0),
                "delivery_date": po.get("delivery_date")
            } for po in recent_pos]
        },
        "performance": {
            "on_time_delivery_rate": supplier.get("on_time_delivery_rate", 0) if supplier else 0,
            "audit_pass_rate": supplier.get("audit_pass_rate", 0) if supplier else 0,
            "rejection_rate": supplier.get("rejection_rate", 0) if supplier else 0,
            "total_pos": supplier.get("total_pos", 0) if supplier else 0,
            "completed_pos": supplier.get("completed_pos", 0) if supplier else 0
        }
    }


@router.get("/activity")
async def get_activity_log(
    entity_type: Optional[str] = None,
    action: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: dict = Depends(require_any_authenticated)
):
    """Get activity logs."""
    query = {}
    
    # Non-admins can only see their own activity
    if current_user["role"] != "admin":
        query["user_id"] = current_user["user_id"]
    
    if entity_type:
        query["entity_type"] = entity_type
    if action:
        query["action"] = action
    
    activities = await activities_collection.find(query).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    return [{
        "id": a["id"],
        "user_id": a["user_id"],
        "user_email": a["user_email"],
        "user_role": a["user_role"],
        "action": a["action"],
        "entity_type": a["entity_type"],
        "entity_id": a["entity_id"],
        "description": a["description"],
        "created_at": a["created_at"]
    } for a in activities]


@router.get("/alerts")
async def get_alerts(
    status: Optional[str] = None,
    severity: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: dict = Depends(require_any_authenticated)
):
    """Get alerts for current user."""
    query = {
        "$or": [
            {"target_user_ids": current_user["user_id"]},
            {"target_roles": current_user["role"]}
        ]
    }
    
    if status:
        query["status"] = status
    if severity:
        query["severity"] = severity
    
    alerts = await alerts_collection.find(query).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    return [{
        "id": a["id"],
        "alert_number": a["alert_number"],
        "alert_type": a["alert_type"],
        "severity": a["severity"],
        "title": a["title"],
        "message": a["message"],
        "status": a["status"],
        "entity_type": a.get("entity_type"),
        "entity_id": a.get("entity_id"),
        "created_at": a["created_at"]
    } for a in alerts]
