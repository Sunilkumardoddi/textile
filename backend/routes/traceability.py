"""
Traceability & Sustainability API Routes
"""
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, Query
from typing import List, Optional
from datetime import datetime, timezone
import uuid
import os

from models.traceability import (
    TraceabilityRecord, TraceabilityRecordCreate, TraceabilityRecordResponse,
    TraceabilityAlert, TraceabilityAlertCreate, TraceabilityStatus,
    SupplyChainStage, SupplierTier, StageData, TierSupplier,
    MaterialDetails, SustainabilityDocument, DocumentType, DocumentStatus,
    AlertType, AlertSeverity, SeasonTraceabilitySummary,
    SupplyChainUpdate, TierSupplierAdd, DocumentUpload
)
from utils.auth import get_current_user, require_any_authenticated, require_brand, require_admin
from utils.database import db

router = APIRouter(prefix="/traceability", tags=["Traceability & Sustainability"])

# Collections
traceability_collection = db.traceability_records
alerts_collection = db.traceability_alerts
pos_collection = db.purchase_orders
seasons_collection = db.seasons
suppliers_collection = db.suppliers

# Upload directory
UPLOAD_DIR = "/app/backend/uploads"
os.makedirs(f"{UPLOAD_DIR}/sustainability_docs", exist_ok=True)


def calculate_traceability_score(record: dict) -> float:
    """Calculate traceability score based on completeness."""
    score = 0.0
    max_score = 100.0
    
    # Supply chain completeness (50 points)
    supply_chain = record.get("supply_chain", [])
    stages_completed = sum(1 for s in supply_chain if s.get("completed"))
    total_stages = 5  # fiber, yarn, fabric, garment, dispatch
    if total_stages > 0:
        score += (stages_completed / total_stages) * 50
    
    # Supplier mapping (20 points)
    tier_suppliers = record.get("tier_suppliers", [])
    if len(tier_suppliers) >= 3:
        score += 20
    elif len(tier_suppliers) >= 2:
        score += 15
    elif len(tier_suppliers) >= 1:
        score += 10
    
    # Material details (15 points)
    material = record.get("material_details")
    if material:
        score += 15
    
    # Documents (15 points)
    documents = record.get("documents", [])
    verified_docs = sum(1 for d in documents if d.get("status") == "verified")
    if verified_docs >= 3:
        score += 15
    elif verified_docs >= 2:
        score += 10
    elif verified_docs >= 1:
        score += 5
    
    return min(score, max_score)


def calculate_compliance_score(record: dict) -> float:
    """Calculate compliance score based on certifications and documents."""
    score = 0.0
    
    documents = record.get("documents", [])
    if not documents:
        return 0.0
    
    verified = sum(1 for d in documents if d.get("status") == "verified")
    pending = sum(1 for d in documents if d.get("status") == "pending")
    expired = sum(1 for d in documents if d.get("status") == "expired")
    
    total = len(documents)
    if total > 0:
        # Verified docs contribute positively
        score = (verified / total) * 100
        # Expired docs reduce score
        score -= (expired / total) * 30
    
    return max(0, min(100, score))


def determine_status(score: float, has_alerts: bool) -> TraceabilityStatus:
    """Determine traceability status based on score and alerts."""
    if score >= 90 and not has_alerts:
        return TraceabilityStatus.VERIFIED
    elif score >= 70:
        return TraceabilityStatus.COMPLETE
    elif score >= 30:
        return TraceabilityStatus.PARTIAL
    else:
        return TraceabilityStatus.MISSING


async def generate_alerts(record: dict) -> List[dict]:
    """Generate alerts for missing or problematic data."""
    alerts = []
    po_id = record.get("po_id")
    po_number = record.get("po_number")
    
    # Check supply chain completeness
    supply_chain = record.get("supply_chain", [])
    completed_stages = [s.get("stage") for s in supply_chain if s.get("completed")]
    all_stages = ["fiber", "yarn", "fabric", "garment", "dispatch"]
    missing_stages = [s for s in all_stages if s not in completed_stages]
    
    if len(missing_stages) >= 3:
        alerts.append({
            "id": str(uuid.uuid4()),
            "po_id": po_id,
            "po_number": po_number,
            "alert_type": AlertType.MISSING_DATA.value,
            "severity": AlertSeverity.HIGH.value,
            "title": "Critical: Missing Supply Chain Data",
            "description": f"Missing data for stages: {', '.join(missing_stages)}",
            "is_resolved": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    elif missing_stages:
        alerts.append({
            "id": str(uuid.uuid4()),
            "po_id": po_id,
            "po_number": po_number,
            "alert_type": AlertType.INCOMPLETE_MAPPING.value,
            "severity": AlertSeverity.MEDIUM.value,
            "title": "Incomplete Supply Chain Mapping",
            "description": f"Missing data for stages: {', '.join(missing_stages)}",
            "is_resolved": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    
    # Check for expired certifications
    documents = record.get("documents", [])
    for doc in documents:
        expiry = doc.get("expiry_date")
        if expiry:
            if isinstance(expiry, str):
                expiry = datetime.fromisoformat(expiry.replace('Z', '+00:00'))
            if expiry < datetime.now(timezone.utc):
                alerts.append({
                    "id": str(uuid.uuid4()),
                    "po_id": po_id,
                    "po_number": po_number,
                    "alert_type": AlertType.EXPIRED_CERT.value,
                    "severity": AlertSeverity.HIGH.value,
                    "title": f"Expired Certification: {doc.get('title')}",
                    "description": f"Certificate expired on {expiry.strftime('%Y-%m-%d')}",
                    "is_resolved": False,
                    "created_at": datetime.now(timezone.utc).isoformat()
                })
    
    # Check supplier mapping
    tier_suppliers = record.get("tier_suppliers", [])
    if len(tier_suppliers) == 0:
        alerts.append({
            "id": str(uuid.uuid4()),
            "po_id": po_id,
            "po_number": po_number,
            "alert_type": AlertType.INCOMPLETE_MAPPING.value,
            "severity": AlertSeverity.HIGH.value,
            "title": "No Supplier Mapping",
            "description": "No tier-wise suppliers have been mapped for this PO",
            "is_resolved": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    
    return alerts


# ==================== TRACEABILITY RECORD ROUTES ====================

@router.post("/po/{po_id}", response_model=TraceabilityRecordResponse)
async def create_or_get_traceability(
    po_id: str,
    current_user: dict = Depends(require_any_authenticated)
):
    """Get or create traceability record for a PO."""
    # Check if record exists
    existing = await traceability_collection.find_one({"po_id": po_id}, {"_id": 0})
    if existing:
        return TraceabilityRecordResponse(**existing)
    
    # Get PO details
    po = await pos_collection.find_one({"$or": [{"id": po_id}, {"po_number": po_id}]}, {"_id": 0})
    if not po:
        raise HTTPException(status_code=404, detail="PO not found")
    
    # Get season if available
    season_id = po.get("season_id")
    season_code = None
    if season_id:
        season = await seasons_collection.find_one({"id": season_id}, {"_id": 0})
        if season:
            season_code = season.get("season_code")
    
    # Create new traceability record with default stages
    default_stages = [
        StageData(stage=SupplyChainStage.FIBER, completed=False).model_dump(),
        StageData(stage=SupplyChainStage.YARN, completed=False).model_dump(),
        StageData(stage=SupplyChainStage.FABRIC, completed=False).model_dump(),
        StageData(stage=SupplyChainStage.GARMENT, completed=False).model_dump(),
        StageData(stage=SupplyChainStage.DISPATCH, completed=False).model_dump(),
    ]
    
    record = {
        "id": str(uuid.uuid4()),
        "po_id": po["id"],
        "po_number": po["po_number"],
        "season_id": season_id,
        "season_code": season_code,
        "brand_id": po["brand_id"],
        "supply_chain": default_stages,
        "tier_suppliers": [],
        "material_details": None,
        "documents": [],
        "status": TraceabilityStatus.MISSING.value,
        "traceability_score": 0.0,
        "compliance_score": 0.0,
        "alerts": [],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": None
    }
    
    await traceability_collection.insert_one(record)
    return TraceabilityRecordResponse(**record)


@router.get("/po/{po_id}", response_model=TraceabilityRecordResponse)
async def get_traceability(
    po_id: str,
    current_user: dict = Depends(require_any_authenticated)
):
    """Get full traceability record for a PO."""
    record = await traceability_collection.find_one({
        "$or": [{"po_id": po_id}, {"po_number": po_id}]
    }, {"_id": 0})
    
    if not record:
        # Auto-create if doesn't exist
        return await create_or_get_traceability(po_id, current_user)
    
    return TraceabilityRecordResponse(**record)


@router.put("/po/{po_id}/supply-chain")
async def update_supply_chain(
    po_id: str,
    updates: List[SupplyChainUpdate],
    current_user: dict = Depends(require_any_authenticated)
):
    """Update supply chain stages for a PO."""
    record = await traceability_collection.find_one({"po_id": po_id}, {"_id": 0})
    if not record:
        raise HTTPException(status_code=404, detail="Traceability record not found. Create it first.")
    
    # Update stages
    existing_stages = {s["stage"]: s for s in record.get("supply_chain", [])}
    
    for update in updates:
        stage_data = update.model_dump()
        stage_data["stage"] = update.stage.value
        if update.supplier_tier:
            stage_data["supplier_tier"] = update.supplier_tier.value
        if update.completion_date:
            stage_data["completion_date"] = update.completion_date.isoformat()
        existing_stages[update.stage.value] = stage_data
    
    updated_chain = list(existing_stages.values())
    
    # Recalculate scores
    record["supply_chain"] = updated_chain
    trace_score = calculate_traceability_score(record)
    compliance_score = calculate_compliance_score(record)
    
    # Generate alerts
    alerts = await generate_alerts(record)
    alert_ids = [a["id"] for a in alerts]
    
    # Store alerts
    if alerts:
        await alerts_collection.insert_many(alerts)
    
    status = determine_status(trace_score, len(alerts) > 0)
    
    await traceability_collection.update_one(
        {"po_id": po_id},
        {
            "$set": {
                "supply_chain": updated_chain,
                "traceability_score": trace_score,
                "compliance_score": compliance_score,
                "status": status.value,
                "alerts": alert_ids,
                "updated_at": datetime.now(timezone.utc).isoformat(),
                "last_updated_by": current_user["user_id"]
            }
        }
    )
    
    return {
        "message": "Supply chain updated",
        "traceability_score": trace_score,
        "status": status.value,
        "alerts_generated": len(alerts)
    }


@router.put("/po/{po_id}/suppliers")
async def update_tier_suppliers(
    po_id: str,
    suppliers: List[TierSupplierAdd],
    current_user: dict = Depends(require_any_authenticated)
):
    """Update tier-wise supplier mapping for a PO."""
    record = await traceability_collection.find_one({"po_id": po_id}, {"_id": 0})
    if not record:
        raise HTTPException(status_code=404, detail="Traceability record not found")
    
    # Convert to dict
    suppliers_data = []
    for s in suppliers:
        data = s.model_dump()
        data["tier"] = s.tier.value
        data["stages_handled"] = [stage.value for stage in s.stages_handled]
        suppliers_data.append(data)
    
    # Recalculate scores
    record["tier_suppliers"] = suppliers_data
    trace_score = calculate_traceability_score(record)
    
    await traceability_collection.update_one(
        {"po_id": po_id},
        {
            "$set": {
                "tier_suppliers": suppliers_data,
                "traceability_score": trace_score,
                "updated_at": datetime.now(timezone.utc).isoformat(),
                "last_updated_by": current_user["user_id"]
            }
        }
    )
    
    return {"message": f"Added {len(suppliers)} tier suppliers", "traceability_score": trace_score}


@router.put("/po/{po_id}/materials")
async def update_material_details(
    po_id: str,
    material_type: str = Form(...),
    composition: str = Form(...),
    gsm: Optional[int] = Form(None),
    width_cm: Optional[int] = Form(None),
    weave_type: Optional[str] = Form(None),
    color: Optional[str] = Form(None),
    finish: Optional[str] = Form(None),
    origin_country: Optional[str] = Form(None),
    certifications: Optional[str] = Form(None),  # Comma-separated
    sustainability_tags: Optional[str] = Form(None),  # Comma-separated
    current_user: dict = Depends(require_any_authenticated)
):
    """Update material details for a PO."""
    record = await traceability_collection.find_one({"po_id": po_id}, {"_id": 0})
    if not record:
        raise HTTPException(status_code=404, detail="Traceability record not found")
    
    material_data = {
        "material_type": material_type,
        "composition": composition,
        "gsm": gsm,
        "width_cm": width_cm,
        "weave_type": weave_type,
        "color": color,
        "finish": finish,
        "origin_country": origin_country,
        "certifications": [c.strip() for c in certifications.split(",")] if certifications else [],
        "sustainability_tags": [t.strip() for t in sustainability_tags.split(",")] if sustainability_tags else []
    }
    
    # Recalculate scores
    record["material_details"] = material_data
    trace_score = calculate_traceability_score(record)
    
    await traceability_collection.update_one(
        {"po_id": po_id},
        {
            "$set": {
                "material_details": material_data,
                "traceability_score": trace_score,
                "updated_at": datetime.now(timezone.utc).isoformat(),
                "last_updated_by": current_user["user_id"]
            }
        }
    )
    
    return {"message": "Material details updated", "traceability_score": trace_score}


# ==================== DOCUMENT ROUTES ====================

@router.post("/po/{po_id}/documents")
async def upload_document(
    po_id: str,
    document_type: DocumentType = Form(...),
    title: str = Form(...),
    description: Optional[str] = Form(None),
    issued_by: Optional[str] = Form(None),
    certificate_number: Optional[str] = Form(None),
    issue_date: Optional[str] = Form(None),
    expiry_date: Optional[str] = Form(None),
    file: UploadFile = File(...),
    current_user: dict = Depends(require_any_authenticated)
):
    """Upload a sustainability/compliance document for a PO."""
    record = await traceability_collection.find_one({"po_id": po_id}, {"_id": 0})
    if not record:
        raise HTTPException(status_code=404, detail="Traceability record not found")
    
    # Save file
    doc_id = str(uuid.uuid4())
    ext = file.filename.split(".")[-1] if "." in file.filename else "pdf"
    filename = f"{doc_id}.{ext}"
    file_path = f"{UPLOAD_DIR}/sustainability_docs/{filename}"
    
    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)
    
    # Determine initial status based on expiry
    status = DocumentStatus.PENDING.value
    if expiry_date:
        exp_dt = datetime.fromisoformat(expiry_date)
        if exp_dt < datetime.now(timezone.utc):
            status = DocumentStatus.EXPIRED.value
    
    doc_data = {
        "id": doc_id,
        "document_type": document_type.value,
        "title": title,
        "description": description,
        "file_url": f"/uploads/sustainability_docs/{filename}",
        "file_name": file.filename,
        "file_size": len(content),
        "issued_by": issued_by,
        "certificate_number": certificate_number,
        "issue_date": issue_date,
        "expiry_date": expiry_date,
        "status": status,
        "uploaded_by": current_user["user_id"],
        "uploaded_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Update record
    documents = record.get("documents", [])
    documents.append(doc_data)
    
    record["documents"] = documents
    compliance_score = calculate_compliance_score(record)
    trace_score = calculate_traceability_score(record)
    
    await traceability_collection.update_one(
        {"po_id": po_id},
        {
            "$push": {"documents": doc_data},
            "$set": {
                "compliance_score": compliance_score,
                "traceability_score": trace_score,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    return {
        "message": "Document uploaded",
        "document_id": doc_id,
        "compliance_score": compliance_score
    }


@router.put("/po/{po_id}/documents/{doc_id}/verify")
async def verify_document(
    po_id: str,
    doc_id: str,
    status: DocumentStatus,
    notes: Optional[str] = None,
    current_user: dict = Depends(require_brand)
):
    """Verify or update document status (Brand/Admin only)."""
    record = await traceability_collection.find_one({"po_id": po_id}, {"_id": 0})
    if not record:
        raise HTTPException(status_code=404, detail="Traceability record not found")
    
    documents = record.get("documents", [])
    doc_found = False
    
    for doc in documents:
        if doc["id"] == doc_id:
            doc["status"] = status.value
            doc["verification_notes"] = notes
            doc["verified_by"] = current_user["user_id"]
            doc["verified_at"] = datetime.now(timezone.utc).isoformat()
            doc_found = True
            break
    
    if not doc_found:
        raise HTTPException(status_code=404, detail="Document not found")
    
    record["documents"] = documents
    compliance_score = calculate_compliance_score(record)
    
    await traceability_collection.update_one(
        {"po_id": po_id},
        {
            "$set": {
                "documents": documents,
                "compliance_score": compliance_score,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    return {"message": f"Document status updated to {status.value}", "compliance_score": compliance_score}


@router.get("/po/{po_id}/documents")
async def get_documents(
    po_id: str,
    current_user: dict = Depends(require_any_authenticated)
):
    """Get all documents for a PO."""
    record = await traceability_collection.find_one({"po_id": po_id}, {"_id": 0})
    if not record:
        raise HTTPException(status_code=404, detail="Traceability record not found")
    
    return record.get("documents", [])


# ==================== SEASON TRACEABILITY ====================

@router.get("/season/{season_id}")
async def get_season_traceability(
    season_id: str,
    current_user: dict = Depends(require_any_authenticated)
):
    """Get aggregated traceability data for a season."""
    # Get season
    season = await seasons_collection.find_one({"id": season_id}, {"_id": 0})
    if not season:
        raise HTTPException(status_code=404, detail="Season not found")
    
    # Get all POs for this season or brand
    po_query = {"season_id": season_id}
    if current_user["role"] == "brand":
        po_query["brand_id"] = current_user["user_id"]
    
    pos = await pos_collection.find(po_query, {"_id": 0}).to_list(1000)
    po_ids = [po["id"] for po in pos]
    
    if not po_ids:
        return SeasonTraceabilitySummary(
            season_id=season_id,
            season_code=season.get("season_code", ""),
            total_pos=0,
            traceable_pos=0,
            partial_pos=0,
            missing_pos=0,
            verified_pos=0,
            traceability_percentage=0,
            compliance_percentage=0,
            total_suppliers=0,
            compliant_suppliers=0,
            tier_1_suppliers=0,
            tier_2_suppliers=0,
            tier_3_suppliers=0,
            active_alerts=0,
            expired_certifications=0,
            pending_verifications=0
        )
    
    # Get traceability records
    records = await traceability_collection.find({"po_id": {"$in": po_ids}}, {"_id": 0}).to_list(1000)
    
    # Calculate aggregates
    status_counts = {"complete": 0, "partial": 0, "missing": 0, "verified": 0}
    total_trace_score = 0
    total_compliance_score = 0
    all_suppliers = set()
    tier_counts = {"tier_1": set(), "tier_2": set(), "tier_3": set()}
    expired_certs = 0
    pending_docs = 0
    
    for r in records:
        status = r.get("status", "missing")
        status_counts[status] = status_counts.get(status, 0) + 1
        total_trace_score += r.get("traceability_score", 0)
        total_compliance_score += r.get("compliance_score", 0)
        
        # Count suppliers by tier
        for s in r.get("tier_suppliers", []):
            all_suppliers.add(s.get("supplier_id"))
            tier = s.get("tier", "tier_1")
            tier_counts[tier].add(s.get("supplier_id"))
        
        # Count document statuses
        for doc in r.get("documents", []):
            if doc.get("status") == "expired":
                expired_certs += 1
            elif doc.get("status") == "pending":
                pending_docs += 1
    
    # Count active alerts
    active_alerts = await alerts_collection.count_documents({
        "po_id": {"$in": po_ids},
        "is_resolved": False
    })
    
    total_pos = len(pos)
    records_count = len(records) if records else 1
    
    return SeasonTraceabilitySummary(
        season_id=season_id,
        season_code=season.get("season_code", ""),
        total_pos=total_pos,
        traceable_pos=status_counts.get("complete", 0) + status_counts.get("verified", 0),
        partial_pos=status_counts.get("partial", 0),
        missing_pos=total_pos - len(records) + status_counts.get("missing", 0),
        verified_pos=status_counts.get("verified", 0),
        traceability_percentage=round((total_trace_score / records_count) if records_count > 0 else 0, 1),
        compliance_percentage=round((total_compliance_score / records_count) if records_count > 0 else 0, 1),
        total_suppliers=len(all_suppliers),
        compliant_suppliers=len([s for s in all_suppliers if s]),  # Simplified
        tier_1_suppliers=len(tier_counts["tier_1"]),
        tier_2_suppliers=len(tier_counts["tier_2"]),
        tier_3_suppliers=len(tier_counts["tier_3"]),
        active_alerts=active_alerts,
        expired_certifications=expired_certs,
        pending_verifications=pending_docs
    )


@router.get("/season/{season_id}/pos")
async def get_season_pos_traceability(
    season_id: str,
    status: Optional[TraceabilityStatus] = None,
    supplier_id: Optional[str] = None,
    limit: int = 50,
    skip: int = 0,
    current_user: dict = Depends(require_any_authenticated)
):
    """Get all POs with traceability status for a season."""
    # Get POs for season
    po_query = {"season_id": season_id}
    if current_user["role"] == "brand":
        po_query["brand_id"] = current_user["user_id"]
    
    pos = await pos_collection.find(po_query, {"_id": 0}).skip(skip).limit(limit).to_list(limit)
    
    result = []
    for po in pos:
        # Get traceability record
        trace = await traceability_collection.find_one({"po_id": po["id"]}, {"_id": 0})
        
        # Count active alerts
        alert_count = 0
        if trace:
            alert_count = await alerts_collection.count_documents({
                "po_id": po["id"],
                "is_resolved": False
            })
        
        # Filter by status if provided
        trace_status = trace.get("status", "missing") if trace else "missing"
        if status and trace_status != status.value:
            continue
        
        result.append({
            "po_id": po["id"],
            "po_number": po["po_number"],
            "supplier_name": po.get("supplier_name", ""),
            "delivery_date": po.get("delivery_date"),
            "po_status": po.get("status"),
            "traceability_status": trace_status,
            "traceability_score": trace.get("traceability_score", 0) if trace else 0,
            "compliance_score": trace.get("compliance_score", 0) if trace else 0,
            "alert_count": alert_count,
            "has_alerts": alert_count > 0
        })
    
    return result


# ==================== ALERTS ====================

@router.get("/alerts")
async def get_alerts(
    po_id: Optional[str] = None,
    season_id: Optional[str] = None,
    severity: Optional[AlertSeverity] = None,
    resolved: Optional[bool] = False,
    limit: int = 50,
    current_user: dict = Depends(require_any_authenticated)
):
    """Get traceability alerts."""
    query = {"is_resolved": resolved}
    
    if po_id:
        query["po_id"] = po_id
    
    if season_id:
        # Get PO IDs for season
        pos = await pos_collection.find({"season_id": season_id}, {"_id": 0, "id": 1}).to_list(1000)
        po_ids = [po["id"] for po in pos]
        query["po_id"] = {"$in": po_ids}
    
    if severity:
        query["severity"] = severity.value
    
    alerts = await alerts_collection.find(query, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
    return alerts


@router.put("/alerts/{alert_id}/resolve")
async def resolve_alert(
    alert_id: str,
    notes: Optional[str] = None,
    current_user: dict = Depends(require_any_authenticated)
):
    """Resolve an alert."""
    result = await alerts_collection.update_one(
        {"id": alert_id},
        {
            "$set": {
                "is_resolved": True,
                "resolved_by": current_user["user_id"],
                "resolved_at": datetime.now(timezone.utc).isoformat(),
                "resolution_notes": notes
            }
        }
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    return {"message": "Alert resolved"}


# ==================== QUICK STATS ====================

@router.get("/stats/overview")
async def get_traceability_overview(
    current_user: dict = Depends(require_any_authenticated)
):
    """Get overall traceability statistics."""
    query = {}
    if current_user["role"] == "brand":
        query["brand_id"] = current_user["user_id"]
    
    # Total records
    total = await traceability_collection.count_documents(query)
    
    # By status
    status_pipeline = [
        {"$match": query},
        {"$group": {"_id": "$status", "count": {"$sum": 1}}}
    ]
    status_stats = await traceability_collection.aggregate(status_pipeline).to_list(10)
    
    # Average scores
    score_pipeline = [
        {"$match": query},
        {"$group": {
            "_id": None,
            "avg_traceability": {"$avg": "$traceability_score"},
            "avg_compliance": {"$avg": "$compliance_score"}
        }}
    ]
    score_stats = await traceability_collection.aggregate(score_pipeline).to_list(1)
    
    # Active alerts
    alert_query = {"is_resolved": False}
    if current_user["role"] == "brand":
        # Get user's PO IDs
        pos = await pos_collection.find({"brand_id": current_user["user_id"]}, {"_id": 0, "id": 1}).to_list(1000)
        po_ids = [po["id"] for po in pos]
        alert_query["po_id"] = {"$in": po_ids}
    
    active_alerts = await alerts_collection.count_documents(alert_query)
    
    return {
        "total_records": total,
        "by_status": {s["_id"]: s["count"] for s in status_stats},
        "avg_traceability_score": round(score_stats[0]["avg_traceability"], 1) if score_stats else 0,
        "avg_compliance_score": round(score_stats[0]["avg_compliance"], 1) if score_stats else 0,
        "active_alerts": active_alerts
    }
