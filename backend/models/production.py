from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime, timezone
from enum import Enum
import uuid


class ProductionStage(str, Enum):
    SPINNING = "spinning"
    WEAVING = "weaving"
    KNITTING = "knitting"
    DYEING = "dyeing"
    PRINTING = "printing"
    FINISHING = "finishing"
    CUTTING = "cutting"
    SEWING = "sewing"
    QUALITY_CHECK = "quality_check"
    PACKAGING = "packaging"


class ProductionStatus(str, Enum):
    STARTED = "started"
    IN_PROGRESS = "in_progress"
    ON_HOLD = "on_hold"
    COMPLETED = "completed"
    REJECTED = "rejected"


class ProductionLogBase(BaseModel):
    batch_id: str
    stage: ProductionStage
    input_quantity: float
    output_quantity: float = 0
    wastage_quantity: float = 0
    unit: str = "kg"
    machine_id: Optional[str] = None
    operator_name: Optional[str] = None
    process_parameters: Optional[dict] = None
    notes: Optional[str] = None


class ProductionLogCreate(ProductionLogBase):
    pass


class ProductionLog(ProductionLogBase):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    manufacturer_id: str
    status: ProductionStatus = ProductionStatus.STARTED
    start_time: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    end_time: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    
    # Quality metrics
    quality_score: float = 0
    defect_rate: float = 0
    yield_percentage: float = 0
    
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # Soft delete
    is_deleted: bool = False


class ProductionLogResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    batch_id: str
    manufacturer_id: str
    stage: ProductionStage
    status: ProductionStatus
    input_quantity: float
    output_quantity: float
    wastage_quantity: float
    unit: str
    machine_id: Optional[str]
    operator_name: Optional[str]
    process_parameters: Optional[dict]
    quality_score: float
    defect_rate: float
    yield_percentage: float
    start_time: datetime
    end_time: Optional[datetime]
    duration_minutes: Optional[int]
    notes: Optional[str]
    created_at: datetime


class ProductionLogUpdate(BaseModel):
    status: Optional[ProductionStatus] = None
    output_quantity: Optional[float] = None
    wastage_quantity: Optional[float] = None
    quality_score: Optional[float] = None
    defect_rate: Optional[float] = None
    notes: Optional[str] = None
