from fastapi import APIRouter, HTTPException, status, Depends, Query
from fastapi.responses import StreamingResponse
from datetime import datetime, timezone
from typing import List, Optional
import uuid
import io
import csv

from utils.auth import get_current_user, require_any_authenticated
from utils.database import (
    batches_collection, transactions_collection, materials_collection,
    production_collection, shipments_collection, audits_collection
)
from utils.activity_logger import log_activity

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/batch-traceability/{batch_id}")
async def get_batch_traceability_report(
    batch_id: str,
    current_user: dict = Depends(require_any_authenticated)
):
    """Generate batch traceability report."""
    # Get batch
    batch = await batches_collection.find_one({"id": batch_id, "is_deleted": {"$ne": True}})
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    # Get materials
    materials = await materials_collection.find({"batch_id": batch_id, "is_deleted": {"$ne": True}}).to_list(100)
    
    # Get production logs
    production = await production_collection.find({"batch_id": batch_id, "is_deleted": {"$ne": True}}).sort("created_at", 1).to_list(100)
    
    # Get shipments
    shipments = await shipments_collection.find({"batch_id": batch_id, "is_deleted": {"$ne": True}}).to_list(100)
    
    # Get transactions
    transactions = await transactions_collection.find({"batch_id": batch_id, "is_deleted": {"$ne": True}}).sort("created_at", 1).to_list(100)
    
    # Get audits
    audits = await audits_collection.find({"batch_id": batch_id, "is_deleted": {"$ne": True}}).to_list(100)
    
    # Build traceability chain
    parent_chain = []
    current_parent_id = batch.get("parent_batch_id")
    while current_parent_id:
        parent = await batches_collection.find_one({"id": current_parent_id})
        if parent:
            parent_chain.append({
                "batch_number": parent["batch_number"],
                "product_name": parent["product_name"],
                "quantity": parent["quantity"]
            })
            current_parent_id = parent.get("parent_batch_id")
        else:
            break
    
    # Log activity
    await log_activity(
        user_id=current_user["user_id"],
        user_email=current_user["email"],
        user_role=current_user["role"],
        action="export",
        entity_type="report",
        entity_id=batch_id,
        description=f"Batch traceability report generated for {batch['batch_number']}"
    )
    
    return {
        "report_type": "batch_traceability",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "generated_by": current_user["email"],
        "batch": {
            "id": batch["id"],
            "batch_number": batch["batch_number"],
            "product_name": batch["product_name"],
            "material_type": batch["material_type"],
            "quantity": batch["quantity"],
            "unit": batch["unit"],
            "status": batch["status"],
            "compliance_score": batch.get("compliance_score", 0),
            "created_at": batch["created_at"]
        },
        "parent_chain": list(reversed(parent_chain)),
        "materials": [{
            "material_name": m["material_name"],
            "supplier_name": m["supplier_name"],
            "quantity": m["quantity"],
            "lot_number": m["lot_number"],
            "quality_grade": m["quality_grade"],
            "certification": m.get("certification")
        } for m in materials],
        "production": [{
            "stage": p["stage"],
            "status": p["status"],
            "input_quantity": p["input_quantity"],
            "output_quantity": p.get("output_quantity", 0),
            "yield_percentage": p.get("yield_percentage", 0),
            "quality_score": p.get("quality_score", 0)
        } for p in production],
        "shipments": [{
            "shipment_number": s["shipment_number"],
            "status": s["status"],
            "quantity": s["quantity"],
            "carrier_name": s["carrier_name"],
            "destination_address": s["destination_address"]
        } for s in shipments],
        "audits": [{
            "audit_number": a["audit_number"],
            "audit_type": a["audit_type"],
            "status": a["status"],
            "compliance_score": a.get("compliance_score", 0),
            "risk_level": a.get("risk_level", "unknown")
        } for a in audits],
        "transactions": [{
            "transaction_number": t["transaction_number"],
            "type": t["transaction_type"],
            "quantity": t["quantity"],
            "status": t["status"],
            "created_at": t["created_at"]
        } for t in transactions]
    }


@router.get("/material-balance")
async def get_material_balance_report(
    manufacturer_id: Optional[str] = None,
    current_user: dict = Depends(require_any_authenticated)
):
    """Generate material balance summary report."""
    query = {"is_deleted": {"$ne": True}}
    
    if current_user["role"] == "manufacturer":
        query["manufacturer_id"] = current_user["user_id"]
    elif manufacturer_id and current_user["role"] in ["admin", "auditor"]:
        query["manufacturer_id"] = manufacturer_id
    
    batches = await batches_collection.find(query).to_list(1000)
    
    report = {
        "report_type": "material_balance",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "summary": {
            "total_batches": len(batches),
            "total_input": 0,
            "total_output": 0,
            "total_wastage": 0,
            "total_balance": 0
        },
        "batches": []
    }
    
    for batch in batches:
        input_qty = batch.get("input_quantity", 0)
        output_qty = batch.get("output_quantity", 0)
        wastage_qty = batch.get("wastage_quantity", 0)
        balance_qty = batch.get("balance_quantity", 0)
        
        report["summary"]["total_input"] += input_qty
        report["summary"]["total_output"] += output_qty
        report["summary"]["total_wastage"] += wastage_qty
        report["summary"]["total_balance"] += balance_qty
        
        variance = input_qty - output_qty - wastage_qty - balance_qty
        
        report["batches"].append({
            "batch_number": batch["batch_number"],
            "product_name": batch["product_name"],
            "status": batch["status"],
            "input_quantity": input_qty,
            "output_quantity": output_qty,
            "wastage_quantity": wastage_qty,
            "balance_quantity": balance_qty,
            "variance": variance,
            "unit": batch["unit"]
        })
    
    return report


@router.get("/compliance-certificate/{batch_id}")
async def generate_compliance_certificate(
    batch_id: str,
    current_user: dict = Depends(require_any_authenticated)
):
    """Generate compliance certificate for a batch."""
    # Get batch
    batch = await batches_collection.find_one({"id": batch_id, "is_deleted": {"$ne": True}})
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    # Get latest approved audit
    audit = await audits_collection.find_one({
        "batch_id": batch_id,
        "status": "approved",
        "is_deleted": {"$ne": True}
    }, sort=[("completed_at", -1)])
    
    if not audit:
        raise HTTPException(status_code=400, detail="No approved audit found for this batch")
    
    certificate = {
        "certificate_type": "compliance",
        "certificate_number": f"CERT-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "batch": {
            "batch_number": batch["batch_number"],
            "product_name": batch["product_name"],
            "material_type": batch["material_type"],
            "quantity": batch["quantity"],
            "unit": batch["unit"]
        },
        "audit": {
            "audit_number": audit["audit_number"],
            "audit_type": audit["audit_type"],
            "completed_at": audit.get("completed_at"),
            "compliance_score": audit.get("compliance_score", 0),
            "risk_level": audit.get("risk_level", "unknown")
        },
        "compliance_status": "COMPLIANT" if audit.get("compliance_score", 0) >= 70 else "NON-COMPLIANT",
        "valid_until": None,  # Would be set based on business rules
        "certifications": batch.get("certifications", [])
    }
    
    # Log activity
    await log_activity(
        user_id=current_user["user_id"],
        user_email=current_user["email"],
        user_role=current_user["role"],
        action="export",
        entity_type="report",
        entity_id=batch_id,
        description=f"Compliance certificate generated for {batch['batch_number']}"
    )
    
    return certificate


@router.get("/export/batches")
async def export_batches_csv(
    status: Optional[str] = None,
    current_user: dict = Depends(require_any_authenticated)
):
    """Export batches to CSV."""
    query = {"is_deleted": {"$ne": True}}
    
    if current_user["role"] == "manufacturer":
        query["manufacturer_id"] = current_user["user_id"]
    elif current_user["role"] == "brand":
        query["brand_id"] = current_user["user_id"]
    
    if status:
        query["status"] = status
    
    batches = await batches_collection.find(query).to_list(10000)
    
    # Create CSV
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow([
        "Batch Number", "Product Name", "Material Type", "Quantity", "Unit",
        "Status", "Input Qty", "Output Qty", "Wastage Qty", "Balance Qty",
        "Compliance Score", "Created At"
    ])
    
    # Data
    for batch in batches:
        writer.writerow([
            batch["batch_number"],
            batch["product_name"],
            batch["material_type"],
            batch["quantity"],
            batch["unit"],
            batch["status"],
            batch.get("input_quantity", 0),
            batch.get("output_quantity", 0),
            batch.get("wastage_quantity", 0),
            batch.get("balance_quantity", 0),
            batch.get("compliance_score", 0),
            batch["created_at"]
        ])
    
    output.seek(0)
    
    # Log activity
    await log_activity(
        user_id=current_user["user_id"],
        user_email=current_user["email"],
        user_role=current_user["role"],
        action="export",
        entity_type="report",
        entity_id="batches",
        description=f"Exported {len(batches)} batches to CSV"
    )
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=batches_export_{datetime.now().strftime('%Y%m%d')}.csv"}
    )


@router.get("/export/transactions")
async def export_transactions_csv(
    batch_id: Optional[str] = None,
    current_user: dict = Depends(require_any_authenticated)
):
    """Export transactions to CSV."""
    query = {"is_deleted": {"$ne": True}}
    
    if current_user["role"] == "manufacturer":
        query["manufacturer_id"] = current_user["user_id"]
    
    if batch_id:
        query["batch_id"] = batch_id
    
    transactions = await transactions_collection.find(query).to_list(10000)
    
    # Create CSV
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow([
        "Transaction Number", "Batch ID", "Type", "Quantity", "Unit",
        "Status", "Created At"
    ])
    
    # Data
    for txn in transactions:
        writer.writerow([
            txn["transaction_number"],
            txn["batch_id"],
            txn["transaction_type"],
            txn["quantity"],
            txn["unit"],
            txn["status"],
            txn["created_at"]
        ])
    
    output.seek(0)
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=transactions_export_{datetime.now().strftime('%Y%m%d')}.csv"}
    )


@router.get("/analytics/overview")
async def get_analytics_overview(current_user: dict = Depends(require_any_authenticated)):
    """Get analytics overview for dashboard graphs."""
    query = {"is_deleted": {"$ne": True}}
    
    if current_user["role"] == "manufacturer":
        query["manufacturer_id"] = current_user["user_id"]
    elif current_user["role"] == "brand":
        query["brand_id"] = current_user["user_id"]
    
    # Batch creation over time (last 30 days grouped by day)
    batch_trend_pipeline = [
        {"$match": query},
        {"$addFields": {
            "created_date": {"$dateFromString": {"dateString": "$created_at"}}
        }},
        {"$group": {
            "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$created_date"}},
            "count": {"$sum": 1}
        }},
        {"$sort": {"_id": 1}},
        {"$limit": 30}
    ]
    batch_trend = await batches_collection.aggregate(batch_trend_pipeline).to_list(30)
    
    # Status distribution
    status_pipeline = [
        {"$match": query},
        {"$group": {"_id": "$status", "count": {"$sum": 1}}}
    ]
    status_dist = await batches_collection.aggregate(status_pipeline).to_list(20)
    
    # Material type distribution
    material_pipeline = [
        {"$match": query},
        {"$group": {"_id": "$material_type", "count": {"$sum": 1}}}
    ]
    material_dist = await batches_collection.aggregate(material_pipeline).to_list(20)
    
    # Yield analysis
    yield_pipeline = [
        {"$match": {"is_deleted": {"$ne": True}, "yield_percentage": {"$gt": 0}}},
        {"$group": {
            "_id": "$stage",
            "avg_yield": {"$avg": "$yield_percentage"},
            "min_yield": {"$min": "$yield_percentage"},
            "max_yield": {"$max": "$yield_percentage"}
        }}
    ]
    yield_analysis = await production_collection.aggregate(yield_pipeline).to_list(20)
    
    return {
        "batch_trend": [{"date": b["_id"], "count": b["count"]} for b in batch_trend],
        "status_distribution": [{"status": s["_id"], "count": s["count"]} for s in status_dist],
        "material_distribution": [{"type": m["_id"], "count": m["count"]} for m in material_dist],
        "yield_analysis": [{
            "stage": y["_id"],
            "avg_yield": round(y["avg_yield"], 2),
            "min_yield": round(y["min_yield"], 2),
            "max_yield": round(y["max_yield"], 2)
        } for y in yield_analysis]
    }
