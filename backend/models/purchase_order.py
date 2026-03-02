from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime, timezone
from enum import Enum
import uuid


class POStatus(str, Enum):
    DRAFT = "draft"
    AWAITING_ACCEPTANCE = "awaiting_acceptance"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    IN_PRODUCTION = "in_production"
    QUALITY_CHECK = "quality_check"
    READY_TO_SHIP = "ready_to_ship"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    ON_HOLD = "on_hold"


class POPriority(str, Enum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"


class POLineItem(BaseModel):
    item_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_name: str
    product_code: Optional[str] = None
    quantity: float
    unit: str = "pcs"
    unit_price: float
    total_price: float = 0
    specifications: Optional[str] = None
    color: Optional[str] = None
    size: Optional[str] = None


class PurchaseOrderBase(BaseModel):
    supplier_id: str
    line_items: List[POLineItem]
    delivery_date: datetime
    delivery_address: str
    priority: POPriority = POPriority.NORMAL
    payment_terms: Optional[str] = None
    shipping_terms: Optional[str] = None
    notes: Optional[str] = None


class PurchaseOrderCreate(PurchaseOrderBase):
    pass


class PurchaseOrder(PurchaseOrderBase):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    po_number: str = Field(default_factory=lambda: f"PO-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:6].upper()}")
    brand_id: str
    brand_name: str = ""
    supplier_name: str = ""
    
    status: POStatus = POStatus.AWAITING_ACCEPTANCE
    
    # Totals
    subtotal: float = 0
    tax_amount: float = 0
    total_amount: float = 0
    currency: str = "USD"
    
    # Tracking
    accepted_at: Optional[datetime] = None
    rejected_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    production_started_at: Optional[datetime] = None
    shipped_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    
    # Audit lock
    is_locked: bool = False
    locked_by: Optional[str] = None
    locked_at: Optional[datetime] = None
    
    # Linked entities
    batch_ids: List[str] = Field(default_factory=list)
    shipment_ids: List[str] = Field(default_factory=list)
    audit_ids: List[str] = Field(default_factory=list)
    
    # Status history
    status_history: List[dict] = Field(default_factory=list)
    
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # Soft delete
    is_deleted: bool = False


class PurchaseOrderResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    po_number: str
    brand_id: str
    brand_name: str
    supplier_id: str
    supplier_name: str
    line_items: List[POLineItem]
    delivery_date: datetime
    delivery_address: str
    priority: POPriority
    status: POStatus
    subtotal: float
    tax_amount: float
    total_amount: float
    currency: str
    payment_terms: Optional[str]
    shipping_terms: Optional[str]
    notes: Optional[str]
    accepted_at: Optional[datetime]
    rejected_at: Optional[datetime]
    rejection_reason: Optional[str]
    shipped_at: Optional[datetime]
    delivered_at: Optional[datetime]
    is_locked: bool
    created_at: datetime


class PurchaseOrderUpdate(BaseModel):
    delivery_date: Optional[datetime] = None
    delivery_address: Optional[str] = None
    priority: Optional[POPriority] = None
    payment_terms: Optional[str] = None
    shipping_terms: Optional[str] = None
    notes: Optional[str] = None


class POStatusLog(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    po_id: str
    po_number: str
    previous_status: Optional[str] = None
    new_status: str
    changed_by: str
    changed_by_role: str
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
