from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime, timezone
from enum import Enum
import uuid


class ActivityAction(str, Enum):
    CREATE = "create"
    UPDATE = "update"
    DELETE = "delete"
    VIEW = "view"
    LOGIN = "login"
    LOGOUT = "logout"
    APPROVE = "approve"
    REJECT = "reject"
    EXPORT = "export"
    UPLOAD = "upload"
    DOWNLOAD = "download"


class ActivityEntity(str, Enum):
    USER = "user"
    BATCH = "batch"
    MATERIAL = "material"
    PRODUCTION = "production"
    SHIPMENT = "shipment"
    AUDIT = "audit"
    TRANSACTION = "transaction"
    DOCUMENT = "document"
    REPORT = "report"


class ActivityLogBase(BaseModel):
    action: ActivityAction
    entity_type: ActivityEntity
    entity_id: str
    description: str
    metadata: Optional[dict] = None


class ActivityLogCreate(ActivityLogBase):
    pass


class ActivityLog(ActivityLogBase):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_email: str
    user_role: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # Immutable - activity logs should never be modified
    is_immutable: bool = True


class ActivityLogResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    user_id: str
    user_email: str
    user_role: str
    action: ActivityAction
    entity_type: ActivityEntity
    entity_id: str
    description: str
    metadata: Optional[dict]
    ip_address: Optional[str]
    created_at: datetime
