from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Optional, List
from datetime import datetime, timezone
from enum import Enum
import uuid


class SupplierStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    LOCKED = "locked"


class RiskCategory(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class CertificationType(str, Enum):
    GOTS = "gots"  # Global Organic Textile Standard
    OEKO_TEX = "oeko_tex"
    FAIR_TRADE = "fair_trade"
    ISO_9001 = "iso_9001"
    ISO_14001 = "iso_14001"
    BCI = "bci"  # Better Cotton Initiative
    GRS = "grs"  # Global Recycled Standard
    WRAP = "wrap"
    SA8000 = "sa8000"
    SEDEX = "sedex"
    HIGG = "higg"
    OTHER = "other"


class ProductCategory(str, Enum):
    RAW_MATERIALS = "raw_materials"
    YARN = "yarn"
    FABRIC = "fabric"
    GARMENTS = "garments"
    ACCESSORIES = "accessories"
    PACKAGING = "packaging"
    DYEING = "dyeing"
    PRINTING = "printing"
    FINISHING = "finishing"


class AuditStatus(str, Enum):
    NOT_AUDITED = "not_audited"
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    PASSED = "passed"
    FAILED = "failed"
    CONDITIONAL = "conditional"


class SupplierBase(BaseModel):
    company_name: str
    factory_address: str
    country: str
    contact_person: str
    email: EmailStr
    phone: str
    certification_types: List[CertificationType] = Field(default_factory=list)
    audit_status: AuditStatus = AuditStatus.NOT_AUDITED
    production_capacity: Optional[str] = None  # e.g., "10000 units/month"
    product_categories: List[ProductCategory] = Field(default_factory=list)


class SupplierCreate(SupplierBase):
    initial_compliance_score: float = 0
    risk_category: RiskCategory = RiskCategory.MEDIUM


class Supplier(SupplierBase):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    supplier_id: str = Field(default_factory=lambda: f"SUP-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:6].upper()}")
    user_id: Optional[str] = None  # Linked user account
    status: SupplierStatus = SupplierStatus.ACTIVE
    compliance_score: float = 0
    risk_category: RiskCategory = RiskCategory.MEDIUM
    
    # Documents
    documents: List[dict] = Field(default_factory=list)
    
    # Performance metrics (calculated)
    on_time_delivery_rate: float = 0
    audit_pass_rate: float = 0
    rejection_rate: float = 0
    total_pos: int = 0
    completed_pos: int = 0
    
    # Audit history
    last_audit_date: Optional[datetime] = None
    next_audit_due: Optional[datetime] = None
    
    # Lock info
    is_locked: bool = False
    locked_by: Optional[str] = None
    locked_at: Optional[datetime] = None
    lock_reason: Optional[str] = None
    
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_by: str = ""
    
    # Soft delete
    is_deleted: bool = False


class SupplierResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    supplier_id: str
    user_id: Optional[str]
    company_name: str
    factory_address: str
    country: str
    contact_person: str
    email: EmailStr
    phone: str
    certification_types: List[CertificationType]
    audit_status: AuditStatus
    production_capacity: Optional[str]
    product_categories: List[ProductCategory]
    status: SupplierStatus
    compliance_score: float
    risk_category: RiskCategory
    on_time_delivery_rate: float
    audit_pass_rate: float
    rejection_rate: float
    total_pos: int
    completed_pos: int
    last_audit_date: Optional[datetime]
    is_locked: bool
    created_at: datetime


class SupplierUpdate(BaseModel):
    company_name: Optional[str] = None
    factory_address: Optional[str] = None
    country: Optional[str] = None
    contact_person: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    certification_types: Optional[List[CertificationType]] = None
    audit_status: Optional[AuditStatus] = None
    production_capacity: Optional[str] = None
    product_categories: Optional[List[ProductCategory]] = None
    status: Optional[SupplierStatus] = None
    compliance_score: Optional[float] = None
    risk_category: Optional[RiskCategory] = None


class SupplierPerformanceMetrics(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    supplier_id: str
    period_start: datetime
    period_end: datetime
    
    # Metrics
    compliance_percentage: float = 0
    on_time_delivery_percentage: float = 0
    audit_pass_rate: float = 0
    rejection_rate: float = 0
    risk_level: RiskCategory = RiskCategory.MEDIUM
    
    # Counts
    total_pos: int = 0
    completed_pos: int = 0
    delayed_pos: int = 0
    rejected_shipments: int = 0
    
    # Calculated at
    calculated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
