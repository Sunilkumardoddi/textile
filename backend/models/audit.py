from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime, timezone
from enum import Enum
import uuid


class AuditStatus(str, Enum):
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    PENDING_REVIEW = "pending_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    REQUIRES_ACTION = "requires_action"
    COMPLETED = "completed"


class AuditType(str, Enum):
    BATCH_VERIFICATION = "batch_verification"
    COMPLIANCE_CHECK = "compliance_check"
    QUALITY_AUDIT = "quality_audit"
    SUPPLIER_AUDIT = "supplier_audit"
    CERTIFICATION_AUDIT = "certification_audit"
    RANDOM_INSPECTION = "random_inspection"


class AuditPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class AuditLogBase(BaseModel):
    batch_id: str
    audit_type: AuditType
    priority: AuditPriority = AuditPriority.MEDIUM
    scheduled_date: datetime
    notes: Optional[str] = None


class AuditLogCreate(AuditLogBase):
    pass


class AuditFinding(BaseModel):
    finding_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    category: str
    description: str
    severity: str
    recommendation: Optional[str] = None
    is_resolved: bool = False


class AuditLog(AuditLogBase):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    audit_number: str = Field(default_factory=lambda: f"AUD-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}")
    auditor_id: str
    manufacturer_id: str
    brand_id: Optional[str] = None
    status: AuditStatus = AuditStatus.SCHEDULED
    
    # Audit details
    findings: List[AuditFinding] = Field(default_factory=list)
    compliance_score: float = 0
    risk_level: str = "medium"
    
    # Dates
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    
    # Documents
    report_url: Optional[str] = None
    certificate_url: Optional[str] = None
    
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # Soft delete
    is_deleted: bool = False


class AuditLogResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    audit_number: str
    batch_id: str
    auditor_id: str
    manufacturer_id: str
    brand_id: Optional[str]
    audit_type: AuditType
    priority: AuditPriority
    status: AuditStatus
    scheduled_date: datetime
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    findings: List[AuditFinding]
    compliance_score: float
    risk_level: str
    report_url: Optional[str]
    certificate_url: Optional[str]
    notes: Optional[str]
    created_at: datetime


class AuditLogUpdate(BaseModel):
    status: Optional[AuditStatus] = None
    compliance_score: Optional[float] = None
    risk_level: Optional[str] = None
    notes: Optional[str] = None
    report_url: Optional[str] = None
    certificate_url: Optional[str] = None
