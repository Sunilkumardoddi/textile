from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime, timezone
from enum import Enum
import uuid


class DocumentType(str, Enum):
    TRANSACTION_CERTIFICATE = "transaction_certificate"
    COMPLIANCE_CERTIFICATE = "compliance_certificate"
    AUDIT_REPORT = "audit_report"
    INVOICE = "invoice"
    BILL_OF_LADING = "bill_of_lading"
    CUSTOMS_DECLARATION = "customs_declaration"
    QUALITY_REPORT = "quality_report"
    LAB_TEST_REPORT = "lab_test_report"
    OTHER = "other"


class DocumentStatus(str, Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    EXPIRED = "expired"
    REJECTED = "rejected"


class TCDocumentBase(BaseModel):
    batch_id: str
    document_type: DocumentType
    document_name: str
    document_number: Optional[str] = None
    issue_date: Optional[datetime] = None
    expiry_date: Optional[datetime] = None
    issuing_authority: Optional[str] = None
    notes: Optional[str] = None


class TCDocumentCreate(TCDocumentBase):
    file_url: str
    file_size: Optional[int] = None
    file_type: Optional[str] = None


class TCDocument(TCDocumentBase):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    manufacturer_id: str
    uploaded_by: str
    file_url: str
    file_size: Optional[int] = None
    file_type: Optional[str] = None
    status: DocumentStatus = DocumentStatus.PENDING
    
    # Verification
    verified_by: Optional[str] = None
    verified_at: Optional[datetime] = None
    
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # Soft delete
    is_deleted: bool = False


class TCDocumentResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    batch_id: str
    manufacturer_id: str
    uploaded_by: str
    document_type: DocumentType
    document_name: str
    document_number: Optional[str]
    file_url: str
    file_size: Optional[int]
    file_type: Optional[str]
    status: DocumentStatus
    issue_date: Optional[datetime]
    expiry_date: Optional[datetime]
    issuing_authority: Optional[str]
    verified_by: Optional[str]
    verified_at: Optional[datetime]
    notes: Optional[str]
    created_at: datetime


class TCDocumentUpdate(BaseModel):
    status: Optional[DocumentStatus] = None
    notes: Optional[str] = None
