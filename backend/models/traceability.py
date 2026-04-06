"""
Traceability & Sustainability Models for Textile ERP
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime
from enum import Enum
import uuid


class SupplyChainStage(str, Enum):
    FIBER = "fiber"
    YARN = "yarn"
    FABRIC = "fabric"
    GARMENT = "garment"
    DISPATCH = "dispatch"


class SupplierTier(str, Enum):
    TIER_1 = "tier_1"  # Direct supplier (Garment manufacturer)
    TIER_2 = "tier_2"  # Fabric supplier
    TIER_3 = "tier_3"  # Yarn/Fiber supplier


class TraceabilityStatus(str, Enum):
    COMPLETE = "complete"     # All data available
    PARTIAL = "partial"       # Some data missing
    MISSING = "missing"       # Critical data missing
    VERIFIED = "verified"     # Audited and verified


class DocumentStatus(str, Enum):
    VERIFIED = "verified"
    PENDING = "pending"
    EXPIRED = "expired"
    REJECTED = "rejected"


class DocumentType(str, Enum):
    ORGANIC_CERT = "organic_certification"
    RECYCLED_CERT = "recycled_certification"
    GOTS_CERT = "gots_certification"
    OEKO_TEX = "oeko_tex_certification"
    GRS_CERT = "grs_certification"
    SOCIAL_COMPLIANCE = "social_compliance"
    AUDIT_REPORT = "audit_report"
    TEST_REPORT = "test_report"
    MATERIAL_SPEC = "material_specification"
    OTHER = "other"


class AlertSeverity(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class AlertType(str, Enum):
    MISSING_DATA = "missing_data"
    EXPIRED_CERT = "expired_certification"
    INCOMPLETE_MAPPING = "incomplete_mapping"
    COMPLIANCE_RISK = "compliance_risk"
    PENDING_VERIFICATION = "pending_verification"


# Supply Chain Stage Data
class StageData(BaseModel):
    stage: SupplyChainStage
    supplier_id: Optional[str] = None
    supplier_name: Optional[str] = None
    supplier_tier: Optional[SupplierTier] = None
    location: Optional[str] = None
    country: Optional[str] = None
    completed: bool = False
    completion_date: Optional[datetime] = None
    materials_used: Optional[List[str]] = None
    batch_numbers: Optional[List[str]] = None
    certifications: Optional[List[str]] = None
    notes: Optional[str] = None


# Material Details
class MaterialDetails(BaseModel):
    material_type: str  # Cotton, Polyester, etc.
    composition: str  # e.g., "100% Organic Cotton"
    gsm: Optional[int] = None
    width_cm: Optional[int] = None
    weave_type: Optional[str] = None
    color: Optional[str] = None
    finish: Optional[str] = None
    origin_country: Optional[str] = None
    certifications: List[str] = []
    sustainability_tags: List[str] = []  # organic, recycled, fair-trade


# Tier-wise Supplier Mapping
class TierSupplier(BaseModel):
    supplier_id: str
    supplier_name: str
    tier: SupplierTier
    role: str  # e.g., "Fabric Mill", "Yarn Supplier", "Garment Factory"
    country: str
    certifications: List[str] = []
    compliance_score: Optional[float] = None
    stages_handled: List[SupplyChainStage] = []
    contact_person: Optional[str] = None
    contact_email: Optional[str] = None


# Sustainability Document
class SustainabilityDocument(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    document_type: DocumentType
    title: str
    description: Optional[str] = None
    file_url: str
    file_name: str
    file_size: Optional[int] = None
    issued_by: Optional[str] = None  # Certifying body
    certificate_number: Optional[str] = None
    issue_date: Optional[datetime] = None
    expiry_date: Optional[datetime] = None
    status: DocumentStatus = DocumentStatus.PENDING
    verification_notes: Optional[str] = None
    verified_by: Optional[str] = None
    verified_at: Optional[datetime] = None


# Traceability Record (PO Level)
class TraceabilityRecordBase(BaseModel):
    po_id: str
    po_number: str
    season_id: Optional[str] = None
    season_code: Optional[str] = None
    brand_id: str


class TraceabilityRecordCreate(TraceabilityRecordBase):
    pass


class TraceabilityRecord(TraceabilityRecordBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    supply_chain: List[StageData] = []
    tier_suppliers: List[TierSupplier] = []
    material_details: Optional[MaterialDetails] = None
    documents: List[SustainabilityDocument] = []
    status: TraceabilityStatus = TraceabilityStatus.MISSING
    traceability_score: float = 0.0  # 0-100
    compliance_score: float = 0.0  # 0-100
    alerts: List[str] = []  # Alert IDs
    last_updated_by: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now())
    updated_at: Optional[datetime] = None


class TraceabilityRecordResponse(TraceabilityRecord):
    pass


# Traceability Alert
class TraceabilityAlertBase(BaseModel):
    po_id: str
    po_number: str
    alert_type: AlertType
    severity: AlertSeverity
    title: str
    description: str


class TraceabilityAlertCreate(TraceabilityAlertBase):
    pass


class TraceabilityAlert(TraceabilityAlertBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    is_resolved: bool = False
    resolved_by: Optional[str] = None
    resolved_at: Optional[datetime] = None
    resolution_notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now())


# Season Traceability Summary
class SeasonTraceabilitySummary(BaseModel):
    season_id: str
    season_code: str
    total_pos: int
    traceable_pos: int
    partial_pos: int
    missing_pos: int
    verified_pos: int
    traceability_percentage: float
    compliance_percentage: float
    total_suppliers: int
    compliant_suppliers: int
    tier_1_suppliers: int
    tier_2_suppliers: int
    tier_3_suppliers: int
    active_alerts: int
    expired_certifications: int
    pending_verifications: int


# Document Upload Request
class DocumentUpload(BaseModel):
    po_id: str
    document_type: DocumentType
    title: str
    description: Optional[str] = None
    issued_by: Optional[str] = None
    certificate_number: Optional[str] = None
    issue_date: Optional[datetime] = None
    expiry_date: Optional[datetime] = None


# Supply Chain Update
class SupplyChainUpdate(BaseModel):
    stage: SupplyChainStage
    supplier_id: Optional[str] = None
    supplier_name: Optional[str] = None
    supplier_tier: Optional[SupplierTier] = None
    location: Optional[str] = None
    country: Optional[str] = None
    completed: bool = False
    completion_date: Optional[datetime] = None
    materials_used: Optional[List[str]] = None
    batch_numbers: Optional[List[str]] = None
    certifications: Optional[List[str]] = None
    notes: Optional[str] = None


# Tier Supplier Add
class TierSupplierAdd(BaseModel):
    supplier_id: str
    supplier_name: str
    tier: SupplierTier
    role: str
    country: str
    certifications: List[str] = []
    stages_handled: List[SupplyChainStage] = []


# Filters
class TraceabilityFilter(BaseModel):
    season_id: Optional[str] = None
    status: Optional[TraceabilityStatus] = None
    supplier_id: Optional[str] = None
    material_type: Optional[str] = None
    compliance_min: Optional[float] = None
    has_alerts: Optional[bool] = None
