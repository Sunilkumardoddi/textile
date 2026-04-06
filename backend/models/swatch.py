"""
Swatch and Manufacturer Collection Models for Textile ERP
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum
import uuid


class FabricType(str, Enum):
    COTTON = "cotton"
    POLYESTER = "polyester"
    SILK = "silk"
    WOOL = "wool"
    LINEN = "linen"
    DENIM = "denim"
    JERSEY = "jersey"
    VELVET = "velvet"
    CHIFFON = "chiffon"
    SATIN = "satin"
    TWILL = "twill"
    FLEECE = "fleece"
    OTHER = "other"


class WeaveType(str, Enum):
    WOVEN = "woven"
    KNIT = "knit"
    NON_WOVEN = "non_woven"


class SwatchStatus(str, Enum):
    UPLOADED = "uploaded"
    VIEWED = "viewed"
    SHORTLISTED = "shortlisted"
    SELECTED = "selected"
    REJECTED = "rejected"
    IN_SAMPLING = "in_sampling"
    IN_PRODUCTION = "in_production"


class CollectionStatus(str, Enum):
    OPEN = "open"
    CLOSED = "closed"
    IN_REVIEW = "in_review"
    COMPLETED = "completed"


# Manufacturer Collection Models
class ManufacturerCollectionBase(BaseModel):
    name: str
    description: Optional[str] = None
    deadline: Optional[datetime] = None
    max_swatches_per_supplier: Optional[int] = 1000
    categories: List[str] = []  # Target fabric categories
    guidelines: Optional[str] = None


class ManufacturerCollectionCreate(ManufacturerCollectionBase):
    season_id: str
    invited_suppliers: List[str] = []  # Supplier IDs


class ManufacturerCollectionUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    deadline: Optional[datetime] = None
    max_swatches_per_supplier: Optional[int] = None
    categories: Optional[List[str]] = None
    guidelines: Optional[str] = None
    status: Optional[CollectionStatus] = None


class ManufacturerCollectionResponse(ManufacturerCollectionBase):
    id: str
    collection_code: str  # e.g., AW27-COL-001
    season_id: str
    season_code: str
    brand_id: str
    status: CollectionStatus
    invited_suppliers: List[str] = []
    participating_suppliers: int = 0
    total_swatches: int = 0
    shortlisted_swatches: int = 0
    created_at: datetime
    updated_at: Optional[datetime] = None


# Swatch Models
class SwatchMetadata(BaseModel):
    fabric_type: FabricType
    gsm: Optional[int] = None  # Grams per square meter
    composition: str  # e.g., "100% Cotton", "60% Polyester 40% Cotton"
    weave_type: WeaveType
    color: Optional[str] = None
    color_code: Optional[str] = None  # Pantone or hex
    pattern: Optional[str] = None  # e.g., "Solid", "Stripe", "Check", "Print"
    finish: Optional[str] = None  # e.g., "Brushed", "Mercerized", "Enzyme Wash"
    width_cm: Optional[int] = None
    weight_gsm: Optional[int] = None
    shrinkage_percent: Optional[float] = None
    price_per_meter: Optional[float] = None
    moq_meters: Optional[int] = None  # Minimum order quantity
    lead_time_days: Optional[int] = None


class SwatchBase(BaseModel):
    name: str
    description: Optional[str] = None
    metadata: SwatchMetadata
    tags: List[str] = []  # e.g., ["sustainable", "organic", "recycled"]
    certifications: List[str] = []  # e.g., ["GOTS", "OEKO-TEX", "GRS"]


class SwatchCreate(SwatchBase):
    collection_id: str


class SwatchBulkUpload(BaseModel):
    collection_id: str
    swatches: List[SwatchBase]


class SwatchUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    metadata: Optional[SwatchMetadata] = None
    tags: Optional[List[str]] = None
    certifications: Optional[List[str]] = None
    status: Optional[SwatchStatus] = None


class SwatchResponse(SwatchBase):
    id: str
    swatch_code: str  # e.g., SWT-AW27-SUP001-0001
    collection_id: str
    season_id: str
    supplier_id: str
    supplier_name: str
    image_url: str
    thumbnail_url: Optional[str] = None
    additional_images: List[str] = []
    status: SwatchStatus
    is_duplicate: bool = False
    similar_to: Optional[List[str]] = None  # IDs of similar swatches
    brand_notes: Optional[str] = None
    rejection_reason: Optional[str] = None
    selected_for_designs: List[str] = []  # Design IDs
    created_at: datetime
    updated_at: Optional[datetime] = None
    viewed_at: Optional[datetime] = None
    shortlisted_at: Optional[datetime] = None


# Filter Models
class SwatchFilter(BaseModel):
    supplier_ids: Optional[List[str]] = None
    fabric_types: Optional[List[FabricType]] = None
    weave_types: Optional[List[WeaveType]] = None
    gsm_min: Optional[int] = None
    gsm_max: Optional[int] = None
    colors: Optional[List[str]] = None
    patterns: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    certifications: Optional[List[str]] = None
    statuses: Optional[List[SwatchStatus]] = None
    search: Optional[str] = None


# Selection Models
class SwatchSelectionAction(BaseModel):
    swatch_ids: List[str]
    action: str  # "shortlist", "select", "reject", "move_to_sampling"
    notes: Optional[str] = None
    design_id: Optional[str] = None  # For linking to a design


# Analytics Models
class SupplierSwatchStats(BaseModel):
    supplier_id: str
    supplier_name: str
    total_uploaded: int
    viewed: int
    shortlisted: int
    selected: int
    rejected: int
    selection_rate: float
    rank: int


class CollectionAnalytics(BaseModel):
    total_suppliers: int
    participating_suppliers: int
    total_swatches: int
    by_status: dict
    by_fabric_type: dict
    by_supplier: List[SupplierSwatchStats]
    top_colors: List[dict]
    avg_gsm: float
    sustainable_percentage: float
