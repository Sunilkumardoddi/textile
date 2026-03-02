from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime, timezone
from enum import Enum
import uuid


class BatchStatus(str, Enum):
    CREATED = "created"
    RAW_MATERIAL = "raw_material"
    PROCESSING = "processing"
    PRODUCTION = "production"
    QUALITY_CHECK = "quality_check"
    SHIPMENT = "shipment"
    DELIVERED = "delivered"
    AUDIT_PENDING = "audit_pending"
    AUDIT_APPROVED = "audit_approved"
    AUDIT_REJECTED = "audit_rejected"
    COMPLETED = "completed"


class MaterialType(str, Enum):
    COTTON = "cotton"
    POLYESTER = "polyester"
    WOOL = "wool"
    SILK = "silk"
    HEMP = "hemp"
    LINEN = "linen"
    RECYCLED = "recycled"
    ORGANIC = "organic"
    BLENDED = "blended"


class BatchBase(BaseModel):
    product_name: str
    material_type: MaterialType
    quantity: float
    unit: str = "kg"
    description: Optional[str] = None
    parent_batch_id: Optional[str] = None


class BatchCreate(BatchBase):
    pass


class Batch(BatchBase):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    batch_number: str = Field(default_factory=lambda: f"BTH-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}")
    manufacturer_id: str
    brand_id: Optional[str] = None
    status: BatchStatus = BatchStatus.CREATED
    
    # Quantity tracking
    input_quantity: float = 0
    output_quantity: float = 0
    wastage_quantity: float = 0
    balance_quantity: float = 0
    
    # Traceability
    child_batch_ids: List[str] = Field(default_factory=list)
    transaction_ids: List[str] = Field(default_factory=list)
    
    # Compliance
    compliance_score: float = 0
    certifications: List[str] = Field(default_factory=list)
    
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None
    
    # Soft delete
    is_deleted: bool = False
    deleted_at: Optional[datetime] = None


class BatchResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    batch_number: str
    product_name: str
    material_type: MaterialType
    quantity: float
    unit: str
    description: Optional[str]
    manufacturer_id: str
    brand_id: Optional[str]
    status: BatchStatus
    input_quantity: float
    output_quantity: float
    wastage_quantity: float
    balance_quantity: float
    parent_batch_id: Optional[str]
    child_batch_ids: List[str]
    compliance_score: float
    certifications: List[str]
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime]


class BatchUpdate(BaseModel):
    product_name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[BatchStatus] = None
    brand_id: Optional[str] = None
    output_quantity: Optional[float] = None
    wastage_quantity: Optional[float] = None
