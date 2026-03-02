from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime, timezone
from enum import Enum
import uuid


class ShipmentStatus(str, Enum):
    PENDING = "pending"
    PICKED_UP = "picked_up"
    IN_TRANSIT = "in_transit"
    CUSTOMS = "customs"
    DELIVERED = "delivered"
    RETURNED = "returned"
    CANCELLED = "cancelled"


class ShipmentType(str, Enum):
    DOMESTIC = "domestic"
    INTERNATIONAL = "international"
    EXPRESS = "express"
    STANDARD = "standard"


class ShipmentLogBase(BaseModel):
    batch_id: str
    destination_brand_id: str
    quantity: float
    unit: str = "kg"
    shipment_type: ShipmentType = ShipmentType.STANDARD
    carrier_name: str
    tracking_number: Optional[str] = None
    origin_address: str
    destination_address: str
    expected_delivery_date: Optional[datetime] = None
    notes: Optional[str] = None


class ShipmentLogCreate(ShipmentLogBase):
    pass


class ShipmentLog(ShipmentLogBase):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    manufacturer_id: str
    shipment_number: str = Field(default_factory=lambda: f"SHP-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}")
    status: ShipmentStatus = ShipmentStatus.PENDING
    
    # Dates
    shipped_date: Optional[datetime] = None
    delivered_date: Optional[datetime] = None
    
    # Documents
    invoice_number: Optional[str] = None
    bill_of_lading: Optional[str] = None
    customs_declaration: Optional[str] = None
    
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # Soft delete
    is_deleted: bool = False


class ShipmentLogResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    shipment_number: str
    batch_id: str
    manufacturer_id: str
    destination_brand_id: str
    quantity: float
    unit: str
    shipment_type: ShipmentType
    status: ShipmentStatus
    carrier_name: str
    tracking_number: Optional[str]
    origin_address: str
    destination_address: str
    expected_delivery_date: Optional[datetime]
    shipped_date: Optional[datetime]
    delivered_date: Optional[datetime]
    invoice_number: Optional[str]
    notes: Optional[str]
    created_at: datetime


class ShipmentLogUpdate(BaseModel):
    status: Optional[ShipmentStatus] = None
    tracking_number: Optional[str] = None
    shipped_date: Optional[datetime] = None
    delivered_date: Optional[datetime] = None
    notes: Optional[str] = None
