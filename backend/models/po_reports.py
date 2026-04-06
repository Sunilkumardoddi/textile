"""
PO Reports Management Models for Textile ERP
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from enum import Enum
import uuid


class ReportType(str, Enum):
    PRODUCTION = "production"  # DPR - Daily Production Report
    QUALITY = "quality"  # DQR - Daily Quality Report
    INSPECTION = "inspection"  # Final Inspection Report
    FABRIC_TEST = "fabric_test"  # Fabric Test Reports
    TRIMS = "trims"  # Trims & Accessories Reports


class ReportStatus(str, Enum):
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    REJECTED = "rejected"


class DefectSeverity(str, Enum):
    CRITICAL = "critical"
    MAJOR = "major"
    MINOR = "minor"


class InspectionResult(str, Enum):
    PASS = "pass"
    FAIL = "fail"
    CONDITIONAL = "conditional"


class AQLLevel(str, Enum):
    LEVEL_1 = "1.0"
    LEVEL_1_5 = "1.5"
    LEVEL_2_5 = "2.5"
    LEVEL_4 = "4.0"
    LEVEL_6_5 = "6.5"


class AlertType(str, Enum):
    MISSING_REPORT = "missing_report"
    QUALITY_THRESHOLD = "quality_threshold"
    FAILED_INSPECTION = "failed_inspection"
    DELAYED_SUBMISSION = "delayed_submission"
    HIGH_DEFECT_RATE = "high_defect_rate"


class AlertSeverity(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


# ==================== FILE ATTACHMENT ====================

class FileAttachment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    file_name: str
    file_url: str
    file_type: str  # pdf, xlsx, jpg, png
    file_size: Optional[int] = None
    uploaded_at: datetime = Field(default_factory=lambda: datetime.now())


# ==================== PRODUCTION REPORT (DPR) ====================

class ProductionLine(BaseModel):
    line_number: str
    style_name: Optional[str] = None
    target_qty: int
    actual_qty: int
    wip_qty: int = 0
    efficiency_percentage: float = 0.0
    operators_count: Optional[int] = None
    working_hours: Optional[float] = None
    remarks: Optional[str] = None


class ProductionReportBase(BaseModel):
    po_id: str
    po_number: str
    supplier_id: str
    supplier_name: str
    report_date: date
    style: Optional[str] = None


class ProductionReportCreate(ProductionReportBase):
    lines: List[ProductionLine]
    total_target: int
    total_actual: int
    total_wip: int = 0
    overall_efficiency: float = 0.0
    remarks: Optional[str] = None
    attachments: List[str] = []  # File IDs


class ProductionReport(ProductionReportBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    report_type: ReportType = ReportType.PRODUCTION
    lines: List[ProductionLine] = []
    total_target: int = 0
    total_actual: int = 0
    total_wip: int = 0
    overall_efficiency: float = 0.0
    cumulative_target: int = 0
    cumulative_actual: int = 0
    cumulative_efficiency: float = 0.0
    remarks: Optional[str] = None
    attachments: List[FileAttachment] = []
    status: ReportStatus = ReportStatus.SUBMITTED
    review_comments: Optional[str] = None
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    submitted_by: str = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now())
    updated_at: Optional[datetime] = None


# ==================== QUALITY REPORT (DQR) ====================

class DefectEntry(BaseModel):
    defect_name: str
    defect_code: Optional[str] = None
    severity: DefectSeverity
    quantity: int
    operation: Optional[str] = None
    corrective_action: Optional[str] = None


class QualityReportBase(BaseModel):
    po_id: str
    po_number: str
    supplier_id: str
    supplier_name: str
    report_date: date
    style: Optional[str] = None
    inspection_type: str = "inline"  # inline, endline, roving


class QualityReportCreate(QualityReportBase):
    pieces_inspected: int
    pieces_passed: int
    pieces_rejected: int
    defects: List[DefectEntry]
    dhu_percentage: float  # Defects per Hundred Units
    remarks: Optional[str] = None
    attachments: List[str] = []


class QualityReport(QualityReportBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    report_type: ReportType = ReportType.QUALITY
    pieces_inspected: int = 0
    pieces_passed: int = 0
    pieces_rejected: int = 0
    defects: List[DefectEntry] = []
    total_defects: int = 0
    major_defects: int = 0
    minor_defects: int = 0
    critical_defects: int = 0
    dhu_percentage: float = 0.0
    rejection_rate: float = 0.0
    remarks: Optional[str] = None
    attachments: List[FileAttachment] = []
    status: ReportStatus = ReportStatus.SUBMITTED
    review_comments: Optional[str] = None
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    submitted_by: str = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now())
    updated_at: Optional[datetime] = None


# ==================== FINAL INSPECTION REPORT ====================

class InspectionFinding(BaseModel):
    category: str  # workmanship, measurement, packaging, etc.
    description: str
    severity: DefectSeverity
    quantity: int
    images: List[str] = []  # Image URLs


class InspectionReportBase(BaseModel):
    po_id: str
    po_number: str
    supplier_id: str
    supplier_name: str
    inspection_date: date
    style: Optional[str] = None
    inspector_name: Optional[str] = None
    inspector_company: Optional[str] = None


class InspectionReportCreate(InspectionReportBase):
    lot_size: int
    sample_size: int
    aql_level: AQLLevel
    result: InspectionResult
    approved_qty: int
    rejected_qty: int
    findings: List[InspectionFinding]
    comments: Optional[str] = None
    attachments: List[str] = []


class InspectionReport(InspectionReportBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    report_type: ReportType = ReportType.INSPECTION
    lot_size: int = 0
    sample_size: int = 0
    aql_level: AQLLevel = AQLLevel.LEVEL_2_5
    result: InspectionResult = InspectionResult.PASS
    approved_qty: int = 0
    rejected_qty: int = 0
    findings: List[InspectionFinding] = []
    total_defects: int = 0
    defect_rate: float = 0.0
    comments: Optional[str] = None
    images: List[str] = []
    attachments: List[FileAttachment] = []
    status: ReportStatus = ReportStatus.SUBMITTED
    review_comments: Optional[str] = None
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    submitted_by: str = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now())
    updated_at: Optional[datetime] = None


# ==================== FABRIC TEST REPORT ====================

class FabricTestResult(BaseModel):
    test_name: str  # GSM, Shrinkage, Color Fastness, Composition
    test_method: Optional[str] = None
    specification: str  # Expected value/range
    actual_result: str
    unit: Optional[str] = None
    status: str = "pass"  # pass, fail, borderline
    remarks: Optional[str] = None


class FabricTestReportBase(BaseModel):
    po_id: str
    po_number: str
    supplier_id: str
    supplier_name: str
    test_date: date
    style: Optional[str] = None
    fabric_type: Optional[str] = None
    lab_name: Optional[str] = None
    lab_report_number: Optional[str] = None


class FabricTestReportCreate(FabricTestReportBase):
    tests: List[FabricTestResult]
    overall_result: InspectionResult
    comments: Optional[str] = None
    attachments: List[str] = []


class FabricTestReport(FabricTestReportBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    report_type: ReportType = ReportType.FABRIC_TEST
    tests: List[FabricTestResult] = []
    tests_passed: int = 0
    tests_failed: int = 0
    overall_result: InspectionResult = InspectionResult.PASS
    comments: Optional[str] = None
    attachments: List[FileAttachment] = []
    status: ReportStatus = ReportStatus.SUBMITTED
    review_comments: Optional[str] = None
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    submitted_by: str = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now())
    updated_at: Optional[datetime] = None


# ==================== TRIMS & ACCESSORIES REPORT ====================

class TrimsTestResult(BaseModel):
    item_name: str  # Button, Zipper, Label, etc.
    test_name: str  # Strength, Durability, Color Fastness
    specification: str
    actual_result: str
    status: str = "pass"
    remarks: Optional[str] = None


class TrimsReportBase(BaseModel):
    po_id: str
    po_number: str
    supplier_id: str
    supplier_name: str
    test_date: date
    style: Optional[str] = None


class TrimsReportCreate(TrimsReportBase):
    items_tested: List[TrimsTestResult]
    overall_result: InspectionResult
    compliance_certificates: List[str] = []  # Certificate file IDs
    comments: Optional[str] = None
    attachments: List[str] = []


class TrimsReport(TrimsReportBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    report_type: ReportType = ReportType.TRIMS
    items_tested: List[TrimsTestResult] = []
    tests_passed: int = 0
    tests_failed: int = 0
    overall_result: InspectionResult = InspectionResult.PASS
    compliance_certificates: List[FileAttachment] = []
    comments: Optional[str] = None
    attachments: List[FileAttachment] = []
    status: ReportStatus = ReportStatus.SUBMITTED
    review_comments: Optional[str] = None
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    submitted_by: str = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now())
    updated_at: Optional[datetime] = None


# ==================== REPORT ALERTS ====================

class ReportAlertBase(BaseModel):
    po_id: str
    po_number: str
    alert_type: AlertType
    severity: AlertSeverity
    title: str
    description: str
    report_id: Optional[str] = None
    report_type: Optional[ReportType] = None


class ReportAlert(ReportAlertBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    is_resolved: bool = False
    resolved_by: Optional[str] = None
    resolved_at: Optional[datetime] = None
    resolution_notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now())


# ==================== ANALYTICS MODELS ====================

class ProductionTrend(BaseModel):
    date: str
    target: int
    actual: int
    efficiency: float
    wip: int


class QualityTrend(BaseModel):
    date: str
    dhu_percentage: float
    defect_count: int
    pieces_inspected: int
    rejection_rate: float


class POReportsSummary(BaseModel):
    po_id: str
    po_number: str
    total_production_reports: int = 0
    total_quality_reports: int = 0
    total_inspection_reports: int = 0
    total_fabric_test_reports: int = 0
    total_trims_reports: int = 0
    avg_efficiency: float = 0.0
    avg_dhu: float = 0.0
    inspection_pass_rate: float = 0.0
    pending_approvals: int = 0
    active_alerts: int = 0
    last_report_date: Optional[str] = None


class POReportsAnalytics(BaseModel):
    po_id: str
    po_number: str
    summary: POReportsSummary
    production_trends: List[ProductionTrend] = []
    quality_trends: List[QualityTrend] = []
    cumulative_production: Dict[str, int] = {}
    defect_breakdown: Dict[str, int] = {}
    inspection_results: Dict[str, int] = {}


# ==================== UPDATE/APPROVAL MODELS ====================

class ReportApproval(BaseModel):
    status: ReportStatus
    comments: Optional[str] = None


class ReportUpdate(BaseModel):
    remarks: Optional[str] = None
    attachments: Optional[List[str]] = None
