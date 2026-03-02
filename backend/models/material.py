from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime, timezone
from enum import Enum
import uuid


class MaterialQuality(str, Enum):
    GRADE_A = "grade_a"
    GRADE_B = "grade_b"
    GRADE_C = "grade_c"
    PREMIUM = "premium"
    STANDARD = "standard"


class MaterialSource(str, Enum):
    DOMESTIC = "domestic"
    IMPORTED = "imported"
    RECYCLED = "recycled"


class MaterialInwardBase(BaseModel):
    batch_id: str
    material_name: str
    supplier_name: str
    supplier_location: str
    quantity: float
    unit: str = "kg"
    quality_grade: MaterialQuality = MaterialQuality.STANDARD
    source_type: MaterialSource = MaterialSource.DOMESTIC
    lot_number: str
    invoice_number: Optional[str] = None
    certification: Optional[str] = None
    notes: Optional[str] = None


class MaterialInwardCreate(MaterialInwardBase):
    pass


class MaterialInward(MaterialInwardBase):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    manufacturer_id: str
    received_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    verified: bool = False
    verified_by: Optional[str] = None
    verified_at: Optional[datetime] = None
    
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # Soft delete
    is_deleted: bool = False


class MaterialInwardResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    batch_id: str
    manufacturer_id: str
    material_name: str
    supplier_name: str
    supplier_location: str
    quantity: float
    unit: str
    quality_grade: MaterialQuality
    source_type: MaterialSource
    lot_number: str
    invoice_number: Optional[str]
    certification: Optional[str]
    notes: Optional[str]
    received_date: datetime
    verified: bool
    verified_by: Optional[str]
    created_at: datetime


class MaterialInwardUpdate(BaseModel):
    quantity: Optional[float] = None
    quality_grade: Optional[MaterialQuality] = None
    notes: Optional[str] = None
    verified: Optional[bool] = None
