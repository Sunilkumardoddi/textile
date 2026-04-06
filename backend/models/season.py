"""
Season and Mood Board Models for Textile ERP
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum
import uuid


class SeasonType(str, Enum):
    SPRING_SUMMER = "spring_summer"
    FALL_WINTER = "fall_winter"
    RESORT = "resort"
    PRE_FALL = "pre_fall"
    HOLIDAY = "holiday"


class SeasonStatus(str, Enum):
    PLANNING = "planning"
    DESIGN_PHASE = "design_phase"
    SELECTION = "selection"
    PRODUCTION = "production"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class DesignStatus(str, Enum):
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    SELECTED = "selected"
    REJECTED = "rejected"
    REVISION_REQUESTED = "revision_requested"
    APPROVED_FOR_PO = "approved_for_po"


class ApprovalStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    REVISION_NEEDED = "revision_needed"


# Season Models
class SeasonBase(BaseModel):
    name: str = Field(..., description="Season name, e.g., 'Winter 2026'")
    season_type: SeasonType
    year: int
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    target_styles: Optional[int] = Field(default=100, description="Target number of styles")
    budget: Optional[float] = None


class SeasonCreate(SeasonBase):
    pass


class SeasonUpdate(BaseModel):
    name: Optional[str] = None
    season_type: Optional[SeasonType] = None
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    target_styles: Optional[int] = None
    budget: Optional[float] = None
    status: Optional[SeasonStatus] = None


class SeasonResponse(SeasonBase):
    id: str
    season_code: str
    status: SeasonStatus
    brand_id: str
    created_by: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    total_designs_submitted: int = 0
    total_designs_selected: int = 0
    total_pos_created: int = 0


# Mood Board Models
class ColorPalette(BaseModel):
    name: str
    hex_code: str
    pantone_code: Optional[str] = None


class FabricSwatch(BaseModel):
    name: str
    composition: str  # e.g., "100% Cotton", "60% Poly 40% Cotton"
    gsm: Optional[int] = None
    weave_type: Optional[str] = None
    image_url: Optional[str] = None
    supplier: Optional[str] = None


class MoodBoardBase(BaseModel):
    title: str
    description: Optional[str] = None
    theme: Optional[str] = None
    target_market: Optional[str] = None
    color_palette: List[ColorPalette] = []
    fabric_swatches: List[FabricSwatch] = []
    tags: List[str] = []


class MoodBoardCreate(MoodBoardBase):
    season_id: str


class MoodBoardUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    theme: Optional[str] = None
    target_market: Optional[str] = None
    color_palette: Optional[List[ColorPalette]] = None
    fabric_swatches: Optional[List[FabricSwatch]] = None
    tags: Optional[List[str]] = None


class MoodBoardResponse(MoodBoardBase):
    id: str
    season_id: str
    brand_id: str
    created_by: str
    images: List[str] = []  # URLs to uploaded images
    inspiration_links: List[str] = []
    created_at: datetime
    updated_at: Optional[datetime] = None


# Design Submission Models
class DesignBase(BaseModel):
    style_name: str
    style_code: Optional[str] = None
    category: str  # e.g., "Tops", "Bottoms", "Dresses"
    sub_category: Optional[str] = None  # e.g., "T-Shirts", "Jeans"
    description: Optional[str] = None
    fabric_composition: Optional[str] = None
    fabric_gsm: Optional[int] = None
    estimated_cost: Optional[float] = None
    estimated_moq: Optional[int] = None  # Minimum Order Quantity
    lead_time_days: Optional[int] = None
    tags: List[str] = []


class DesignCreate(DesignBase):
    season_id: str
    mood_board_id: Optional[str] = None


class DesignUpdate(BaseModel):
    style_name: Optional[str] = None
    category: Optional[str] = None
    sub_category: Optional[str] = None
    description: Optional[str] = None
    fabric_composition: Optional[str] = None
    fabric_gsm: Optional[int] = None
    estimated_cost: Optional[float] = None
    estimated_moq: Optional[int] = None
    lead_time_days: Optional[int] = None
    status: Optional[DesignStatus] = None
    tags: Optional[List[str]] = None


class DesignResponse(DesignBase):
    id: str
    design_number: str  # Auto-generated: DES-2026-0001
    season_id: str
    mood_board_id: Optional[str] = None
    supplier_id: str
    supplier_name: str
    status: DesignStatus
    images: List[str] = []  # Design images
    cad_files: List[str] = []  # CAD file URLs
    tech_pack_url: Optional[str] = None
    is_duplicate: bool = False
    duplicate_of: Optional[str] = None  # ID of original if duplicate
    brand_notes: Optional[str] = None
    rejection_reason: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    selected_at: Optional[datetime] = None


# Design Selection Models
class DesignSelectionAction(BaseModel):
    design_ids: List[str]
    action: str  # "select", "reject", "request_revision"
    notes: Optional[str] = None


# BOM (Bill of Materials) Models
class BOMItem(BaseModel):
    item_type: str  # "fabric", "trim", "accessory", "packaging"
    item_name: str
    item_code: Optional[str] = None
    description: Optional[str] = None
    unit: str  # "meters", "pieces", "kg", "yards"
    quantity_per_piece: float
    unit_cost: float
    supplier: Optional[str] = None
    lead_time_days: Optional[int] = None


class BOMBase(BaseModel):
    items: List[BOMItem] = []
    total_material_cost: float = 0
    labor_cost: float = 0
    overhead_cost: float = 0
    profit_margin_percent: float = 0


class CostingBreakdown(BaseModel):
    fabric_cost: float = 0
    trim_cost: float = 0
    accessory_cost: float = 0
    labor_cost: float = 0
    overhead_cost: float = 0
    packaging_cost: float = 0
    logistics_cost: float = 0
    profit_margin: float = 0
    total_cost_per_piece: float = 0
    total_po_cost: float = 0


# Approval Models
class ApprovalRecord(BaseModel):
    approval_type: str  # "fit", "quality", "trim", "sample", "final"
    status: ApprovalStatus
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    comments: Optional[str] = None
    attachments: List[str] = []


# Production Tracking Models
class ProductionUpdate(BaseModel):
    date: datetime
    line_number: Optional[str] = None
    planned_output: int = 0
    actual_output: int = 0
    wip_quantity: int = 0
    defects: int = 0
    efficiency_percent: float = 0
    notes: Optional[str] = None


class QualityReport(BaseModel):
    report_type: str  # "inline", "endline", "final_inspection", "aql"
    inspection_date: datetime
    total_inspected: int
    passed: int
    failed: int
    defect_details: Optional[str] = None
    aql_level: Optional[str] = None
    result: str  # "pass", "fail", "conditional"
    inspector_name: Optional[str] = None
    report_url: Optional[str] = None
    notes: Optional[str] = None
