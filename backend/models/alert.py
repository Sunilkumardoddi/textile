from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime, timezone
from enum import Enum
import uuid


class AlertType(str, Enum):
    MATERIAL_BALANCE = "material_balance"
    QUANTITY_VARIATION = "quantity_variation"
    CERTIFICATE_EXPIRY = "certificate_expiry"
    COMPLIANCE_ISSUE = "compliance_issue"
    AUDIT_DUE = "audit_due"
    SHIPMENT_DELAY = "shipment_delay"
    QUALITY_ALERT = "quality_alert"
    SYSTEM = "system"


class AlertSeverity(str, Enum):
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"


class AlertStatus(str, Enum):
    ACTIVE = "active"
    ACKNOWLEDGED = "acknowledged"
    RESOLVED = "resolved"
    DISMISSED = "dismissed"


class AlertBase(BaseModel):
    alert_type: AlertType
    severity: AlertSeverity
    title: str
    message: str
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None
    threshold_value: Optional[float] = None
    actual_value: Optional[float] = None


class AlertCreate(AlertBase):
    target_user_ids: List[str] = Field(default_factory=list)
    target_roles: List[str] = Field(default_factory=list)


class Alert(AlertBase):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    alert_number: str = Field(default_factory=lambda: f"ALT-{datetime.now().strftime('%Y%m%d%H%M%S')}-{str(uuid.uuid4())[:4].upper()}")
    status: AlertStatus = AlertStatus.ACTIVE
    
    # Targeting
    target_user_ids: List[str] = Field(default_factory=list)
    target_roles: List[str] = Field(default_factory=list)
    
    # Resolution
    acknowledged_by: Optional[str] = None
    acknowledged_at: Optional[datetime] = None
    resolved_by: Optional[str] = None
    resolved_at: Optional[datetime] = None
    resolution_notes: Optional[str] = None
    
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    expires_at: Optional[datetime] = None


class AlertResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    alert_number: str
    alert_type: AlertType
    severity: AlertSeverity
    title: str
    message: str
    status: AlertStatus
    entity_type: Optional[str]
    entity_id: Optional[str]
    threshold_value: Optional[float]
    actual_value: Optional[float]
    acknowledged_by: Optional[str]
    acknowledged_at: Optional[datetime]
    resolved_by: Optional[str]
    resolved_at: Optional[datetime]
    resolution_notes: Optional[str]
    created_at: datetime


class AlertUpdate(BaseModel):
    status: Optional[AlertStatus] = None
    resolution_notes: Optional[str] = None
