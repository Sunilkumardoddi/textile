from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from enum import Enum
import uuid


class NotificationChannel(str, Enum):
    EMAIL = "email"
    SMS = "sms"
    WHATSAPP = "whatsapp"
    PUSH = "push"
    IN_APP = "in_app"


class NotificationStatus(str, Enum):
    PENDING = "pending"
    SENT = "sent"
    FAILED = "failed"
    READ = "read"
    DISMISSED = "dismissed"


class NotificationPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class NotificationEvent(str, Enum):
    PO_CREATED = "po_created"
    PO_ACCEPTED = "po_accepted"
    PO_REJECTED = "po_rejected"
    PO_STATUS_CHANGED = "po_status_changed"
    AUDIT_ASSIGNED = "audit_assigned"
    AUDIT_COMPLETED = "audit_completed"
    AUDIT_OVERDUE = "audit_overdue"
    SHIPMENT_DISPATCHED = "shipment_dispatched"
    SHIPMENT_DELAYED = "shipment_delayed"
    SHIPMENT_DELIVERED = "shipment_delivered"
    BATCH_CREATED = "batch_created"
    BATCH_QC_FAILED = "batch_qc_failed"
    CERTIFICATE_EXPIRING = "certificate_expiring"
    COMPLIANCE_ALERT = "compliance_alert"
    MATERIAL_LOW = "material_low"
    QUALITY_ALERT = "quality_alert"
    NEW_USER_REGISTERED = "new_user_registered"
    SYSTEM_ALERT = "system_alert"


class NotificationPreferences(BaseModel):
    user_id: str
    email_enabled: bool = True
    sms_enabled: bool = False
    whatsapp_enabled: bool = False
    push_enabled: bool = True
    in_app_enabled: bool = True
    events: Dict[str, List[str]] = Field(
        default_factory=lambda: {
            "po_created":          ["in_app", "email"],
            "po_accepted":         ["in_app", "email"],
            "po_rejected":         ["in_app", "email"],
            "po_status_changed":   ["in_app"],
            "audit_assigned":      ["in_app", "email"],
            "audit_completed":     ["in_app", "email"],
            "audit_overdue":       ["in_app", "email", "sms"],
            "shipment_dispatched": ["in_app"],
            "shipment_delayed":    ["in_app", "email", "sms"],
            "shipment_delivered":  ["in_app"],
            "batch_created":       ["in_app"],
            "batch_qc_failed":     ["in_app", "email"],
            "certificate_expiring":["in_app", "email"],
            "compliance_alert":    ["in_app", "email"],
            "quality_alert":       ["in_app", "email"],
            "new_user_registered": ["in_app", "email"],
            "system_alert":        ["in_app"],
        }
    )
    quiet_hours_start: Optional[str] = None  # "22:00"
    quiet_hours_end: Optional[str] = None    # "08:00"
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class NotificationCreate(BaseModel):
    user_id: str
    user_email: Optional[str] = None
    user_phone: Optional[str] = None
    event: NotificationEvent
    title: str
    body: str
    priority: NotificationPriority = NotificationPriority.MEDIUM
    channels: List[NotificationChannel] = Field(default_factory=lambda: [NotificationChannel.IN_APP])
    data: Dict[str, Any] = Field(default_factory=dict)


class Notification(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_email: Optional[str] = None
    user_phone: Optional[str] = None
    event: NotificationEvent
    title: str
    body: str
    priority: NotificationPriority = NotificationPriority.MEDIUM
    channels: List[NotificationChannel] = Field(default_factory=list)
    channel_status: Dict[str, str] = Field(default_factory=dict)
    data: Dict[str, Any] = Field(default_factory=dict)
    status: NotificationStatus = NotificationStatus.PENDING
    read_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    sent_at: Optional[datetime] = None
    error: Optional[str] = None


class NotificationResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str
    user_id: str
    event: NotificationEvent
    title: str
    body: str
    priority: NotificationPriority
    channels: List[NotificationChannel]
    channel_status: Dict[str, str]
    status: NotificationStatus
    data: Dict[str, Any]
    read_at: Optional[datetime]
    created_at: datetime
    error: Optional[str]
