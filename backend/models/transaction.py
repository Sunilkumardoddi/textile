from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime, timezone
from enum import Enum
import uuid


class TransactionType(str, Enum):
    MATERIAL_INWARD = "material_inward"
    PRODUCTION = "production"
    TRANSFER = "transfer"
    SHIPMENT = "shipment"
    RETURN = "return"
    ADJUSTMENT = "adjustment"
    WASTAGE = "wastage"


class TransactionStatus(str, Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    APPROVED = "approved"
    REJECTED = "rejected"
    CANCELLED = "cancelled"


class TransactionBase(BaseModel):
    batch_id: str
    transaction_type: TransactionType
    quantity: float
    unit: str = "kg"
    reference_id: Optional[str] = None  # Reference to material/production/shipment
    notes: Optional[str] = None


class TransactionCreate(TransactionBase):
    pass


class Transaction(TransactionBase):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    transaction_number: str = Field(default_factory=lambda: f"TXN-{datetime.now().strftime('%Y%m%d%H%M%S')}-{str(uuid.uuid4())[:6].upper()}")
    manufacturer_id: str
    brand_id: Optional[str] = None
    status: TransactionStatus = TransactionStatus.PENDING
    
    # Verification
    verified_by: Optional[str] = None
    verified_at: Optional[datetime] = None
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    
    # Blockchain (future)
    blockchain_hash: Optional[str] = None
    
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # Immutable flag (for audit trail)
    is_immutable: bool = False
    
    # Soft delete
    is_deleted: bool = False


class TransactionResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    transaction_number: str
    batch_id: str
    manufacturer_id: str
    brand_id: Optional[str]
    transaction_type: TransactionType
    quantity: float
    unit: str
    status: TransactionStatus
    reference_id: Optional[str]
    verified_by: Optional[str]
    verified_at: Optional[datetime]
    approved_by: Optional[str]
    approved_at: Optional[datetime]
    notes: Optional[str]
    created_at: datetime


class TransactionUpdate(BaseModel):
    status: Optional[TransactionStatus] = None
    notes: Optional[str] = None
