from fastapi import APIRouter, HTTPException, status, Depends, Query
from datetime import datetime, timezone
from typing import List, Optional
import uuid

from models.audit import (
    AuditLog, AuditLogCreate, AuditLogResponse,
    AuditLogUpdate, AuditStatus, AuditType, AuditPriority, AuditFinding
)
from utils.auth import get_current_user, require_auditor, require_any_authenticated, require_brand
from utils.database import audits_collection, batches_collection
from utils.activity_logger import log_activity

router = APIRouter(prefix="/audits", tags=["Audits"])


@router.post("/", response_model=AuditLogResponse, status_code=status.HTTP_201_CREATED)
async def create_audit(
    audit_data: AuditLogCreate,
    current_user: dict = Depends(require_auditor)
):
    """Create a new audit (Auditor only)."""
    # Verify batch exists
    batch = await batches_collection.find_one({
        "id": audit_data.batch_id,
        "is_deleted": {"$ne": True}
    })
    
    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Batch not found"
        )
    
    # Generate unique audit number
    audit_number = f"AUD-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"
    
    audit = AuditLog(
        id=str(uuid.uuid4()),
        audit_number=audit_number,
        batch_id=audit_data.batch_id,
        auditor_id=current_user["user_id"],
        manufacturer_id=batch["manufacturer_id"],
        brand_id=batch.get("brand_id"),
        audit_type=audit_data.audit_type,
        priority=audit_data.priority,
        scheduled_date=audit_data.scheduled_date,
        notes=audit_data.notes,
        status=AuditStatus.SCHEDULED,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    
    audit_dict = audit.model_dump()
    audit_dict['scheduled_date'] = audit_dict['scheduled_date'].isoformat()
    audit_dict['created_at'] = audit_dict['created_at'].isoformat()
    audit_dict['updated_at'] = audit_dict['updated_at'].isoformat()
    
    await audits_collection.insert_one(audit_dict)
    
    # Update batch status
    await batches_collection.update_one(
        {"id": audit_data.batch_id},
        {
            "$set": {
                "status": "audit_pending",
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    # Log activity
    await log_activity(
        user_id=current_user["user_id"],
        user_email=current_user["email"],
        user_role=current_user["role"],
        action="create",
        entity_type="audit",
        entity_id=audit.id,
        description=f"Audit scheduled: {audit_number}",
        metadata={"batch_id": audit_data.batch_id, "audit_type": audit_data.audit_type.value}
    )
    
    return AuditLogResponse(
        id=audit.id,
        audit_number=audit.audit_number,
        batch_id=audit.batch_id,
        auditor_id=audit.auditor_id,
        manufacturer_id=audit.manufacturer_id,
        brand_id=audit.brand_id,
        audit_type=audit.audit_type,
        priority=audit.priority,
        status=audit.status,
        scheduled_date=audit.scheduled_date,
        started_at=audit.started_at,
        completed_at=audit.completed_at,
        findings=audit.findings,
        compliance_score=audit.compliance_score,
        risk_level=audit.risk_level,
        report_url=audit.report_url,
        certificate_url=audit.certificate_url,
        notes=audit.notes,
        created_at=audit.created_at
    )


@router.post("/request", response_model=AuditLogResponse, status_code=status.HTTP_201_CREATED)
async def request_audit(
    batch_id: str,
    audit_type: AuditType = AuditType.COMPLIANCE_CHECK,
    notes: Optional[str] = None,
    current_user: dict = Depends(require_brand)
):
    """Request an audit for a batch (Brand only)."""
    # Verify batch exists and belongs to the brand
    batch = await batches_collection.find_one({
        "id": batch_id,
        "brand_id": current_user["user_id"],
        "is_deleted": {"$ne": True}
    })
    
    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Batch not found or access denied"
        )
    
    # Generate unique audit number
    audit_number = f"AUD-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"
    
    audit = AuditLog(
        id=str(uuid.uuid4()),
        audit_number=audit_number,
        batch_id=batch_id,
        auditor_id="pending_assignment",  # Will be assigned by admin
        manufacturer_id=batch["manufacturer_id"],
        brand_id=current_user["user_id"],
        audit_type=audit_type,
        priority=AuditPriority.MEDIUM,
        scheduled_date=datetime.now(timezone.utc),
        notes=notes,
        status=AuditStatus.SCHEDULED,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    
    audit_dict = audit.model_dump()
    audit_dict['scheduled_date'] = audit_dict['scheduled_date'].isoformat()
    audit_dict['created_at'] = audit_dict['created_at'].isoformat()
    audit_dict['updated_at'] = audit_dict['updated_at'].isoformat()
    
    await audits_collection.insert_one(audit_dict)
    
    # Log activity
    await log_activity(
        user_id=current_user["user_id"],
        user_email=current_user["email"],
        user_role=current_user["role"],
        action="create",
        entity_type="audit",
        entity_id=audit.id,
        description=f"Audit requested by brand: {audit_number}",
        metadata={"batch_id": batch_id, "audit_type": audit_type.value}
    )
    
    return AuditLogResponse(
        id=audit.id,
        audit_number=audit.audit_number,
        batch_id=audit.batch_id,
        auditor_id=audit.auditor_id,
        manufacturer_id=audit.manufacturer_id,
        brand_id=audit.brand_id,
        audit_type=audit.audit_type,
        priority=audit.priority,
        status=audit.status,
        scheduled_date=audit.scheduled_date,
        started_at=audit.started_at,
        completed_at=audit.completed_at,
        findings=audit.findings,
        compliance_score=audit.compliance_score,
        risk_level=audit.risk_level,
        report_url=audit.report_url,
        certificate_url=audit.certificate_url,
        notes=audit.notes,
        created_at=audit.created_at
    )


@router.get("/", response_model=List[AuditLogResponse])
async def get_audits(
    batch_id: Optional[str] = None,
    status: Optional[AuditStatus] = None,
    audit_type: Optional[AuditType] = None,
    priority: Optional[AuditPriority] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: dict = Depends(require_any_authenticated)
):
    """Get audits based on user role and filters."""
    query = {"is_deleted": {"$ne": True}}
    
    if current_user["role"] == "auditor":
        query["auditor_id"] = current_user["user_id"]
    elif current_user["role"] == "manufacturer":
        query["manufacturer_id"] = current_user["user_id"]
    elif current_user["role"] == "brand":
        query["brand_id"] = current_user["user_id"]
    
    if batch_id:
        query["batch_id"] = batch_id
    if status:
        query["status"] = status.value
    if audit_type:
        query["audit_type"] = audit_type.value
    if priority:
        query["priority"] = priority.value
    
    audits = await audits_collection.find(query).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    result = []
    for a in audits:
        scheduled_date = a.get("scheduled_date")
        if isinstance(scheduled_date, str):
            scheduled_date = datetime.fromisoformat(scheduled_date.replace('Z', '+00:00'))
        
        started_at = a.get("started_at")
        if isinstance(started_at, str):
            started_at = datetime.fromisoformat(started_at.replace('Z', '+00:00'))
        
        completed_at = a.get("completed_at")
        if isinstance(completed_at, str):
            completed_at = datetime.fromisoformat(completed_at.replace('Z', '+00:00'))
        
        created_at = a.get("created_at")
        if isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
        
        result.append(AuditLogResponse(
            id=a["id"],
            audit_number=a["audit_number"],
            batch_id=a["batch_id"],
            auditor_id=a["auditor_id"],
            manufacturer_id=a["manufacturer_id"],
            brand_id=a.get("brand_id"),
            audit_type=a["audit_type"],
            priority=a["priority"],
            status=a["status"],
            scheduled_date=scheduled_date,
            started_at=started_at,
            completed_at=completed_at,
            findings=a.get("findings", []),
            compliance_score=a.get("compliance_score", 0),
            risk_level=a.get("risk_level", "medium"),
            report_url=a.get("report_url"),
            certificate_url=a.get("certificate_url"),
            notes=a.get("notes"),
            created_at=created_at
        ))
    
    return result


@router.get("/assigned", response_model=List[AuditLogResponse])
async def get_assigned_audits(current_user: dict = Depends(require_auditor)):
    """Get audits assigned to the current auditor."""
    audits = await audits_collection.find({
        "auditor_id": current_user["user_id"],
        "status": {"$in": ["scheduled", "in_progress", "pending_review"]},
        "is_deleted": {"$ne": True}
    }).sort("scheduled_date", 1).to_list(100)
    
    result = []
    for a in audits:
        scheduled_date = a.get("scheduled_date")
        if isinstance(scheduled_date, str):
            scheduled_date = datetime.fromisoformat(scheduled_date.replace('Z', '+00:00'))
        
        created_at = a.get("created_at")
        if isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
        
        result.append(AuditLogResponse(
            id=a["id"],
            audit_number=a["audit_number"],
            batch_id=a["batch_id"],
            auditor_id=a["auditor_id"],
            manufacturer_id=a["manufacturer_id"],
            brand_id=a.get("brand_id"),
            audit_type=a["audit_type"],
            priority=a["priority"],
            status=a["status"],
            scheduled_date=scheduled_date,
            started_at=a.get("started_at"),
            completed_at=a.get("completed_at"),
            findings=a.get("findings", []),
            compliance_score=a.get("compliance_score", 0),
            risk_level=a.get("risk_level", "medium"),
            report_url=a.get("report_url"),
            certificate_url=a.get("certificate_url"),
            notes=a.get("notes"),
            created_at=created_at
        ))
    
    return result


@router.get("/{audit_id}", response_model=AuditLogResponse)
async def get_audit(audit_id: str, current_user: dict = Depends(require_any_authenticated)):
    """Get audit by ID."""
    query = {"id": audit_id, "is_deleted": {"$ne": True}}
    
    if current_user["role"] == "auditor":
        query["auditor_id"] = current_user["user_id"]
    elif current_user["role"] == "manufacturer":
        query["manufacturer_id"] = current_user["user_id"]
    elif current_user["role"] == "brand":
        query["brand_id"] = current_user["user_id"]
    
    audit = await audits_collection.find_one(query)
    
    if not audit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Audit not found"
        )
    
    scheduled_date = audit.get("scheduled_date")
    if isinstance(scheduled_date, str):
        scheduled_date = datetime.fromisoformat(scheduled_date.replace('Z', '+00:00'))
    
    started_at = audit.get("started_at")
    if isinstance(started_at, str):
        started_at = datetime.fromisoformat(started_at.replace('Z', '+00:00'))
    
    completed_at = audit.get("completed_at")
    if isinstance(completed_at, str):
        completed_at = datetime.fromisoformat(completed_at.replace('Z', '+00:00'))
    
    created_at = audit.get("created_at")
    if isinstance(created_at, str):
        created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
    
    return AuditLogResponse(
        id=audit["id"],
        audit_number=audit["audit_number"],
        batch_id=audit["batch_id"],
        auditor_id=audit["auditor_id"],
        manufacturer_id=audit["manufacturer_id"],
        brand_id=audit.get("brand_id"),
        audit_type=audit["audit_type"],
        priority=audit["priority"],
        status=audit["status"],
        scheduled_date=scheduled_date,
        started_at=started_at,
        completed_at=completed_at,
        findings=audit.get("findings", []),
        compliance_score=audit.get("compliance_score", 0),
        risk_level=audit.get("risk_level", "medium"),
        report_url=audit.get("report_url"),
        certificate_url=audit.get("certificate_url"),
        notes=audit.get("notes"),
        created_at=created_at
    )


@router.post("/{audit_id}/start", response_model=AuditLogResponse)
async def start_audit(audit_id: str, current_user: dict = Depends(require_auditor)):
    """Start an audit (Auditor only)."""
    audit = await audits_collection.find_one({
        "id": audit_id,
        "auditor_id": current_user["user_id"],
        "status": "scheduled",
        "is_deleted": {"$ne": True}
    })
    
    if not audit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Audit not found or cannot be started"
        )
    
    await audits_collection.update_one(
        {"id": audit_id},
        {
            "$set": {
                "status": "in_progress",
                "started_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    # Log activity
    await log_activity(
        user_id=current_user["user_id"],
        user_email=current_user["email"],
        user_role=current_user["role"],
        action="update",
        entity_type="audit",
        entity_id=audit_id,
        description=f"Audit started: {audit['audit_number']}"
    )
    
    return await get_audit(audit_id, current_user)


@router.post("/{audit_id}/finding")
async def add_finding(
    audit_id: str,
    category: str,
    description: str,
    severity: str,
    recommendation: Optional[str] = None,
    current_user: dict = Depends(require_auditor)
):
    """Add a finding to an audit (Auditor only)."""
    audit = await audits_collection.find_one({
        "id": audit_id,
        "auditor_id": current_user["user_id"],
        "status": "in_progress",
        "is_deleted": {"$ne": True}
    })
    
    if not audit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Audit not found or not in progress"
        )
    
    finding = {
        "finding_id": str(uuid.uuid4()),
        "category": category,
        "description": description,
        "severity": severity,
        "recommendation": recommendation,
        "is_resolved": False
    }
    
    await audits_collection.update_one(
        {"id": audit_id},
        {
            "$push": {"findings": finding},
            "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}
        }
    )
    
    return {"message": "Finding added", "finding": finding}


@router.post("/{audit_id}/approve", response_model=AuditLogResponse)
async def approve_audit(
    audit_id: str,
    compliance_score: float,
    notes: Optional[str] = None,
    current_user: dict = Depends(require_auditor)
):
    """Approve an audit (Auditor only)."""
    audit = await audits_collection.find_one({
        "id": audit_id,
        "auditor_id": current_user["user_id"],
        "status": {"$in": ["in_progress", "pending_review"]},
        "is_deleted": {"$ne": True}
    })
    
    if not audit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Audit not found or cannot be approved"
        )
    
    # Determine risk level based on compliance score
    risk_level = "low" if compliance_score >= 80 else ("medium" if compliance_score >= 60 else "high")
    
    await audits_collection.update_one(
        {"id": audit_id},
        {
            "$set": {
                "status": "approved",
                "compliance_score": compliance_score,
                "risk_level": risk_level,
                "completed_at": datetime.now(timezone.utc).isoformat(),
                "notes": notes if notes else audit.get("notes"),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    # Update batch status
    await batches_collection.update_one(
        {"id": audit["batch_id"]},
        {
            "$set": {
                "status": "audit_approved",
                "compliance_score": compliance_score,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    # Log activity
    await log_activity(
        user_id=current_user["user_id"],
        user_email=current_user["email"],
        user_role=current_user["role"],
        action="approve",
        entity_type="audit",
        entity_id=audit_id,
        description=f"Audit approved: {audit['audit_number']} with score {compliance_score}",
        metadata={"compliance_score": compliance_score, "risk_level": risk_level}
    )
    
    return await get_audit(audit_id, current_user)


@router.post("/{audit_id}/reject", response_model=AuditLogResponse)
async def reject_audit(
    audit_id: str,
    reason: str,
    current_user: dict = Depends(require_auditor)
):
    """Reject an audit (Auditor only)."""
    audit = await audits_collection.find_one({
        "id": audit_id,
        "auditor_id": current_user["user_id"],
        "status": {"$in": ["in_progress", "pending_review"]},
        "is_deleted": {"$ne": True}
    })
    
    if not audit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Audit not found or cannot be rejected"
        )
    
    await audits_collection.update_one(
        {"id": audit_id},
        {
            "$set": {
                "status": "rejected",
                "risk_level": "high",
                "completed_at": datetime.now(timezone.utc).isoformat(),
                "notes": f"{audit.get('notes', '')}\n\nRejection Reason: {reason}",
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    # Update batch status
    await batches_collection.update_one(
        {"id": audit["batch_id"]},
        {
            "$set": {
                "status": "audit_rejected",
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    # Log activity
    await log_activity(
        user_id=current_user["user_id"],
        user_email=current_user["email"],
        user_role=current_user["role"],
        action="reject",
        entity_type="audit",
        entity_id=audit_id,
        description=f"Audit rejected: {audit['audit_number']}",
        metadata={"reason": reason}
    )
    
    return await get_audit(audit_id, current_user)
