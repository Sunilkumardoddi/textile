"""
Incoming & Dispatch Management Models
Tracks inbound shipments, invoices, dispatches, and deliveries for Purchase Orders
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from enum import Enum
import uuid
import math


class DispatchStatus(str, Enum):
    PENDING = "pending"
    DISPATCHED = "dispatched"
    IN_TRANSIT = "in_transit"
    OUT_FOR_DELIVERY = "out_for_delivery"
    DELIVERED = "delivered"
    PARTIALLY_DELIVERED = "partially_delivered"
    DELAYED = "delayed"
    CANCELLED = "cancelled"


class InvoiceStatus(str, Enum):
    DRAFT = "draft"
    GENERATED = "generated"
    DISPATCHED = "dispatched"
    IN_TRANSIT = "in_transit"
    DELIVERED = "delivered"
    PARTIALLY_DELIVERED = "partially_delivered"
    CANCELLED = "cancelled"


class DeliveryStatus(str, Enum):
    ON_TIME = "on_time"
    SLIGHT_DELAY = "slight_delay"
    CRITICAL_DELAY = "critical_delay"
    PENDING = "pending"


class AlertType(str, Enum):
    DELAY = "delay"
    SHIPMENT_STUCK = "shipment_stuck"
    PARTIAL_DELIVERY = "partial_delivery"
    MISSING_DOCUMENT = "missing_document"
    DELIVERY_FAILED = "delivery_failed"


class AlertSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class DocumentType(str, Enum):
    DELIVERY_CHALLAN_IN = "delivery_challan_in"
    DELIVERY_CHALLAN_OUT = "delivery_challan_out"
    EWAY_BILL = "eway_bill"
    TRANSPORT_DOCUMENT = "transport_document"
    GATE_IN_RECORD = "gate_in_record"
    GATE_OUT_RECORD = "gate_out_record"
    INVOICE_COPY = "invoice_copy"
    PACKING_LIST = "packing_list"
    OTHER = "other"


# ==================== DESTINATION ====================

class DestinationBase(BaseModel):
    """Store/Warehouse destination"""
    name: str
    address: str
    city: str
    state: Optional[str] = None
    country: str
    postal_code: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    contact_person: Optional[str] = None
    contact_phone: Optional[str] = None
    destination_type: str = "warehouse"  # warehouse, store, distribution_center


class DestinationCreate(DestinationBase):
    pass


class Destination(DestinationBase):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    brand_id: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ==================== DISPATCH DOCUMENT ====================

class DispatchDocument(BaseModel):
    """Documents linked to dispatch/invoice"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    document_type: DocumentType
    title: str
    file_name: str
    file_url: str
    file_size: int = 0
    uploaded_by: str
    uploaded_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ==================== TRACKING ENTRY ====================

class TrackingEntry(BaseModel):
    """GPS/Status tracking entry"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: DispatchStatus
    location_name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    notes: Optional[str] = None
    updated_by: Optional[str] = None


# ==================== DISPATCH ====================

class DispatchBase(BaseModel):
    """Single dispatch/shipment within an invoice"""
    vehicle_number: Optional[str] = None
    driver_name: Optional[str] = None
    driver_phone: Optional[str] = None
    transporter_name: Optional[str] = None
    dispatch_notes: Optional[str] = None


class DispatchCreate(DispatchBase):
    invoice_id: str
    quantity_dispatched: int
    dispatch_date: datetime
    expected_delivery_date: datetime


class Dispatch(DispatchBase):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    dispatch_number: str = Field(default_factory=lambda: f"DSP-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:6].upper()}")
    invoice_id: str
    po_id: str
    po_number: str
    supplier_id: str
    supplier_name: str
    destination_id: str
    destination_name: str
    
    # Quantities
    quantity_dispatched: int
    quantity_received: int = 0
    
    # Timing
    dispatch_date: datetime
    expected_delivery_date: datetime
    actual_delivery_date: Optional[datetime] = None
    
    # Status
    status: DispatchStatus = DispatchStatus.PENDING
    delivery_status: DeliveryStatus = DeliveryStatus.PENDING
    
    # Delay tracking
    delay_hours: float = 0
    delay_reason: Optional[str] = None
    
    # Distance and transit
    distance_km: float = 0
    estimated_transit_hours: float = 0
    actual_transit_hours: float = 0
    
    # Current location (for live tracking)
    current_latitude: Optional[float] = None
    current_longitude: Optional[float] = None
    current_location_name: Optional[str] = None
    last_location_update: Optional[datetime] = None
    
    # Tracking history
    tracking_history: List[TrackingEntry] = Field(default_factory=list)
    
    # Documents
    documents: List[DispatchDocument] = Field(default_factory=list)
    
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ==================== INVOICE ====================

class InvoiceLineItem(BaseModel):
    """Line item in invoice"""
    product_name: str
    product_code: Optional[str] = None
    quantity: int
    unit_price: float
    total_price: float
    color: Optional[str] = None
    size: Optional[str] = None


class InvoiceBase(BaseModel):
    """Invoice generated by manufacturer for a PO"""
    quantity_shipped: int
    destination_id: str
    dispatch_date: datetime
    expected_delivery_date: datetime
    remarks: Optional[str] = None


class InvoiceCreate(InvoiceBase):
    po_id: str
    line_items: List[InvoiceLineItem] = Field(default_factory=list)


class Invoice(InvoiceBase):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    invoice_number: str = Field(default_factory=lambda: f"INV-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:6].upper()}")
    po_id: str
    po_number: str
    supplier_id: str
    supplier_name: str
    brand_id: str
    
    # Destination
    destination_name: str = ""
    destination_address: str = ""
    destination_city: str = ""
    destination_country: str = ""
    destination_latitude: Optional[float] = None
    destination_longitude: Optional[float] = None
    
    # Source (manufacturer location)
    source_address: str = ""
    source_city: str = ""
    source_country: str = ""
    source_latitude: Optional[float] = None
    source_longitude: Optional[float] = None
    
    # Line items
    line_items: List[InvoiceLineItem] = Field(default_factory=list)
    
    # Amounts
    subtotal: float = 0
    tax_amount: float = 0
    total_amount: float = 0
    currency: str = "USD"
    
    # Quantities
    quantity_shipped: int
    quantity_received: int = 0
    quantity_pending: int = 0
    
    # Status
    status: InvoiceStatus = InvoiceStatus.GENERATED
    delivery_status: DeliveryStatus = DeliveryStatus.PENDING
    
    # Timing
    actual_delivery_date: Optional[datetime] = None
    delay_hours: float = 0
    
    # Distance
    distance_km: float = 0
    
    # Linked dispatches
    dispatch_ids: List[str] = Field(default_factory=list)
    
    # Documents
    documents: List[DispatchDocument] = Field(default_factory=list)
    
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ==================== INCOMING ALERT ====================

class IncomingAlert(BaseModel):
    """Alert for incoming shipments"""
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    alert_type: AlertType
    severity: AlertSeverity
    title: str
    description: str
    
    # Links
    po_id: str
    po_number: str
    invoice_id: Optional[str] = None
    invoice_number: Optional[str] = None
    dispatch_id: Optional[str] = None
    dispatch_number: Optional[str] = None
    
    # Status
    is_resolved: bool = False
    resolved_by: Optional[str] = None
    resolved_at: Optional[datetime] = None
    resolution_notes: Optional[str] = None
    
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ==================== ANALYTICS MODELS ====================

class DeliveryPerformance(BaseModel):
    """Delivery performance metrics"""
    total_deliveries: int = 0
    on_time_deliveries: int = 0
    delayed_deliveries: int = 0
    critical_delays: int = 0
    on_time_percentage: float = 0
    average_delay_hours: float = 0
    average_transit_time_hours: float = 0


class SupplierLogisticsPerformance(BaseModel):
    """Supplier logistics performance"""
    supplier_id: str
    supplier_name: str
    total_dispatches: int = 0
    on_time_count: int = 0
    delayed_count: int = 0
    delay_frequency: float = 0
    dispatch_efficiency: float = 0
    average_transit_time: float = 0


class POIncomingSummary(BaseModel):
    """Summary of incoming for a PO"""
    po_id: str
    po_number: str
    supplier_name: str
    total_invoices: int = 0
    total_quantity_ordered: int = 0
    total_quantity_dispatched: int = 0
    total_quantity_received: int = 0
    quantity_pending: int = 0
    pending_deliveries: int = 0
    completed_deliveries: int = 0
    in_transit_count: int = 0
    delayed_count: int = 0
    overall_delivery_status: DeliveryStatus = DeliveryStatus.PENDING


# ==================== HELPER FUNCTIONS ====================

def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great-circle distance between two points on Earth using Haversine formula.
    Returns distance in kilometers.
    """
    R = 6371  # Earth's radius in kilometers
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)
    
    a = math.sin(delta_lat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    return R * c


def estimate_transit_time(distance_km: float, avg_speed_kmh: float = 40) -> float:
    """
    Estimate transit time based on distance.
    Default average speed: 40 km/h (accounting for stops, traffic, etc.)
    Returns time in hours.
    """
    if distance_km <= 0:
        return 0
    return distance_km / avg_speed_kmh


def calculate_delay(expected_date: datetime, actual_date: datetime) -> tuple:
    """
    Calculate delay between expected and actual delivery.
    Returns (delay_hours, delivery_status)
    """
    if actual_date is None:
        return 0, DeliveryStatus.PENDING
    
    diff = actual_date - expected_date
    delay_hours = diff.total_seconds() / 3600
    
    if delay_hours <= 0:
        return 0, DeliveryStatus.ON_TIME
    elif delay_hours <= 24:  # Less than 1 day
        return delay_hours, DeliveryStatus.SLIGHT_DELAY
    else:
        return delay_hours, DeliveryStatus.CRITICAL_DELAY
