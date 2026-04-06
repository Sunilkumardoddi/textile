"""
Incoming & Dispatch Management API Routes
"""
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, Query
from typing import List, Optional
from datetime import datetime, timezone, timedelta
import uuid
import os
import json
import random

from models.incoming import (
    DispatchStatus, InvoiceStatus, DeliveryStatus, AlertType, AlertSeverity, DocumentType,
    Destination, DestinationCreate, DispatchDocument, TrackingEntry,
    Dispatch, DispatchCreate, Invoice, InvoiceCreate, InvoiceLineItem,
    IncomingAlert, DeliveryPerformance, SupplierLogisticsPerformance, POIncomingSummary,
    calculate_haversine_distance, estimate_transit_time, calculate_delay
)
from utils.auth import get_current_user, require_any_authenticated, require_brand, require_manufacturer
from utils.database import db

router = APIRouter(prefix="/incoming", tags=["Incoming & Dispatch Management"])

# Collections
destinations_collection = db.destinations
invoices_collection = db.invoices
dispatches_collection = db.dispatches
incoming_alerts_collection = db.incoming_alerts
pos_collection = db.purchase_orders
users_collection = db.users

# Upload directory
UPLOAD_DIR = "/app/backend/uploads"
os.makedirs(f"{UPLOAD_DIR}/dispatch_docs", exist_ok=True)


# ==================== DESTINATIONS ====================

@router.post("/destinations")
async def create_destination(
    destination: DestinationCreate,
    current_user: dict = Depends(require_brand)
):
    """Create a new destination (store/warehouse)."""
    dest = Destination(
        **destination.model_dump(),
        brand_id=current_user["user_id"]
    )
    
    dest_dict = dest.model_dump()
    dest_dict['created_at'] = dest_dict['created_at'].isoformat()
    dest_dict['updated_at'] = dest_dict['updated_at'].isoformat()
    
    await destinations_collection.insert_one(dest_dict)
    
    return {"message": "Destination created", "destination_id": dest.id}


@router.get("/destinations")
async def get_destinations(
    destination_type: Optional[str] = None,
    is_active: bool = True,
    current_user: dict = Depends(require_any_authenticated)
):
    """Get all destinations for the brand."""
    query = {"is_active": is_active}
    
    if current_user["role"] == "brand":
        query["brand_id"] = current_user["user_id"]
    
    if destination_type:
        query["destination_type"] = destination_type
    
    destinations = await destinations_collection.find(query, {"_id": 0}).to_list(100)
    return destinations


@router.get("/destinations/{destination_id}")
async def get_destination(
    destination_id: str,
    current_user: dict = Depends(require_any_authenticated)
):
    """Get a specific destination."""
    dest = await destinations_collection.find_one({"id": destination_id}, {"_id": 0})
    if not dest:
        raise HTTPException(status_code=404, detail="Destination not found")
    return dest


@router.put("/destinations/{destination_id}")
async def update_destination(
    destination_id: str,
    destination: DestinationCreate,
    current_user: dict = Depends(require_brand)
):
    """Update a destination."""
    result = await destinations_collection.update_one(
        {"id": destination_id, "brand_id": current_user["user_id"]},
        {
            "$set": {
                **destination.model_dump(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Destination not found")
    
    return {"message": "Destination updated"}


@router.delete("/destinations/{destination_id}")
async def delete_destination(
    destination_id: str,
    current_user: dict = Depends(require_brand)
):
    """Soft delete a destination."""
    result = await destinations_collection.update_one(
        {"id": destination_id, "brand_id": current_user["user_id"]},
        {"$set": {"is_active": False, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Destination not found")
    
    return {"message": "Destination deleted"}


# ==================== INVOICES ====================

@router.post("/invoices")
async def create_invoice(
    invoice_data: InvoiceCreate,
    current_user: dict = Depends(require_manufacturer)
):
    """Create an invoice for a PO (Manufacturer only)."""
    # Get PO details
    po = await pos_collection.find_one({"id": invoice_data.po_id}, {"_id": 0})
    if not po:
        raise HTTPException(status_code=404, detail="Purchase Order not found")
    
    # Get destination details
    dest = await destinations_collection.find_one({"id": invoice_data.destination_id}, {"_id": 0})
    if not dest:
        raise HTTPException(status_code=404, detail="Destination not found")
    
    # Get supplier/manufacturer details
    supplier = await users_collection.find_one({"id": current_user["user_id"]}, {"_id": 0})
    if not supplier:
        supplier = {}
    
    # Calculate totals
    subtotal = sum(item.total_price for item in invoice_data.line_items)
    tax_amount = subtotal * 0.18  # 18% tax
    total_amount = subtotal + tax_amount
    
    # Get source coordinates (manufacturer location - simulated if not available)
    source_lat = supplier.get("latitude") or 19.0760  # Default: Mumbai
    source_lon = supplier.get("longitude") or 72.8777
    
    # Calculate distance
    distance_km = 0
    if dest.get("latitude") and dest.get("longitude"):
        distance_km = calculate_haversine_distance(
            source_lat, source_lon,
            dest["latitude"], dest["longitude"]
        )
    
    invoice = Invoice(
        po_id=invoice_data.po_id,
        po_number=po["po_number"],
        supplier_id=current_user["user_id"],
        supplier_name=current_user.get("company_name", current_user.get("name", "")),
        brand_id=po["brand_id"],
        destination_id=invoice_data.destination_id,
        destination_name=dest["name"],
        destination_address=dest["address"],
        destination_city=dest["city"],
        destination_country=dest["country"],
        destination_latitude=dest.get("latitude"),
        destination_longitude=dest.get("longitude"),
        source_address=supplier.get("address") or "Manufacturer Address",
        source_city=supplier.get("city") or "Mumbai",
        source_country=supplier.get("country") or "India",
        source_latitude=source_lat,
        source_longitude=source_lon,
        line_items=[item.model_dump() for item in invoice_data.line_items],
        quantity_shipped=invoice_data.quantity_shipped,
        quantity_pending=invoice_data.quantity_shipped,
        dispatch_date=invoice_data.dispatch_date,
        expected_delivery_date=invoice_data.expected_delivery_date,
        subtotal=subtotal,
        tax_amount=tax_amount,
        total_amount=total_amount,
        distance_km=round(distance_km, 2),
        remarks=invoice_data.remarks
    )
    
    invoice_dict = invoice.model_dump()
    invoice_dict['created_at'] = invoice_dict['created_at'].isoformat()
    invoice_dict['updated_at'] = invoice_dict['updated_at'].isoformat()
    invoice_dict['dispatch_date'] = invoice_dict['dispatch_date'].isoformat()
    invoice_dict['expected_delivery_date'] = invoice_dict['expected_delivery_date'].isoformat()
    
    await invoices_collection.insert_one(invoice_dict)
    
    return {"message": "Invoice created", "invoice_id": invoice.id, "invoice_number": invoice.invoice_number}


@router.get("/invoices")
async def get_invoices(
    po_id: Optional[str] = None,
    supplier_id: Optional[str] = None,
    status: Optional[InvoiceStatus] = None,
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
    limit: int = 50,
    skip: int = 0,
    current_user: dict = Depends(require_any_authenticated)
):
    """Get invoices with filters."""
    query = {}
    
    if po_id:
        query["po_id"] = po_id
    if supplier_id:
        query["supplier_id"] = supplier_id
    if status:
        query["status"] = status.value
    if from_date:
        query["dispatch_date"] = {"$gte": from_date}
    if to_date:
        query.setdefault("dispatch_date", {})["$lte"] = to_date
    
    # Filter by role
    if current_user["role"] == "brand":
        query["brand_id"] = current_user["user_id"]
    elif current_user["role"] == "manufacturer":
        query["supplier_id"] = current_user["user_id"]
    
    invoices = await invoices_collection.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    return invoices


@router.get("/invoices/{invoice_id}")
async def get_invoice(
    invoice_id: str,
    current_user: dict = Depends(require_any_authenticated)
):
    """Get a specific invoice with its dispatches."""
    invoice = await invoices_collection.find_one({"id": invoice_id}, {"_id": 0})
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    # Get associated dispatches
    dispatches = await dispatches_collection.find({"invoice_id": invoice_id}, {"_id": 0}).to_list(50)
    
    return {**invoice, "dispatches": dispatches}


# ==================== DISPATCHES ====================

@router.post("/dispatches")
async def create_dispatch(
    dispatch_data: DispatchCreate,
    current_user: dict = Depends(require_manufacturer)
):
    """Create a dispatch for an invoice (Manufacturer only)."""
    # Get invoice details
    invoice = await invoices_collection.find_one({"id": dispatch_data.invoice_id}, {"_id": 0})
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    # Get destination
    dest = await destinations_collection.find_one({"id": invoice["destination_id"]}, {"_id": 0})
    
    # Calculate distance and transit time
    distance_km = invoice.get("distance_km", 0)
    estimated_transit = estimate_transit_time(distance_km)
    
    dispatch = Dispatch(
        invoice_id=dispatch_data.invoice_id,
        po_id=invoice["po_id"],
        po_number=invoice["po_number"],
        supplier_id=invoice["supplier_id"],
        supplier_name=invoice["supplier_name"],
        destination_id=invoice["destination_id"],
        destination_name=dest["name"] if dest else "",
        quantity_dispatched=dispatch_data.quantity_dispatched,
        dispatch_date=dispatch_data.dispatch_date,
        expected_delivery_date=dispatch_data.expected_delivery_date,
        vehicle_number=dispatch_data.vehicle_number,
        driver_name=dispatch_data.driver_name,
        driver_phone=dispatch_data.driver_phone,
        transporter_name=dispatch_data.transporter_name,
        dispatch_notes=dispatch_data.dispatch_notes,
        distance_km=distance_km,
        estimated_transit_hours=estimated_transit,
        status=DispatchStatus.DISPATCHED,
        # Set initial tracking location to source
        current_latitude=invoice.get("source_latitude"),
        current_longitude=invoice.get("source_longitude"),
        current_location_name=invoice.get("source_city", "Origin"),
        last_location_update=datetime.now(timezone.utc)
    )
    
    # Add initial tracking entry
    dispatch.tracking_history.append(TrackingEntry(
        status=DispatchStatus.DISPATCHED,
        location_name=invoice.get("source_city", "Origin"),
        latitude=invoice.get("source_latitude"),
        longitude=invoice.get("source_longitude"),
        notes="Shipment dispatched",
        updated_by=current_user["user_id"]
    ).model_dump())
    
    dispatch_dict = dispatch.model_dump()
    dispatch_dict['created_at'] = dispatch_dict['created_at'].isoformat()
    dispatch_dict['updated_at'] = dispatch_dict['updated_at'].isoformat()
    dispatch_dict['dispatch_date'] = dispatch_dict['dispatch_date'].isoformat()
    dispatch_dict['expected_delivery_date'] = dispatch_dict['expected_delivery_date'].isoformat()
    dispatch_dict['last_location_update'] = dispatch_dict['last_location_update'].isoformat() if dispatch_dict['last_location_update'] else None
    
    # Convert tracking history timestamps
    for entry in dispatch_dict['tracking_history']:
        if isinstance(entry.get('timestamp'), datetime):
            entry['timestamp'] = entry['timestamp'].isoformat()
    
    await dispatches_collection.insert_one(dispatch_dict)
    
    # Update invoice status and dispatch_ids
    await invoices_collection.update_one(
        {"id": dispatch_data.invoice_id},
        {
            "$set": {"status": InvoiceStatus.DISPATCHED.value, "updated_at": datetime.now(timezone.utc).isoformat()},
            "$push": {"dispatch_ids": dispatch.id}
        }
    )
    
    return {"message": "Dispatch created", "dispatch_id": dispatch.id, "dispatch_number": dispatch.dispatch_number}


@router.get("/dispatches")
async def get_dispatches(
    po_id: Optional[str] = None,
    invoice_id: Optional[str] = None,
    status: Optional[DispatchStatus] = None,
    delivery_status: Optional[DeliveryStatus] = None,
    limit: int = 50,
    skip: int = 0,
    current_user: dict = Depends(require_any_authenticated)
):
    """Get dispatches with filters."""
    query = {}
    
    if po_id:
        query["po_id"] = po_id
    if invoice_id:
        query["invoice_id"] = invoice_id
    if status:
        query["status"] = status.value
    if delivery_status:
        query["delivery_status"] = delivery_status.value
    
    if current_user["role"] == "manufacturer":
        query["supplier_id"] = current_user["user_id"]
    
    dispatches = await dispatches_collection.find(query, {"_id": 0}).sort("dispatch_date", -1).skip(skip).limit(limit).to_list(limit)
    return dispatches


@router.get("/dispatches/{dispatch_id}")
async def get_dispatch(
    dispatch_id: str,
    current_user: dict = Depends(require_any_authenticated)
):
    """Get a specific dispatch with tracking history."""
    dispatch = await dispatches_collection.find_one({"id": dispatch_id}, {"_id": 0})
    if not dispatch:
        raise HTTPException(status_code=404, detail="Dispatch not found")
    return dispatch


@router.put("/dispatches/{dispatch_id}/tracking")
async def update_dispatch_tracking(
    dispatch_id: str,
    status: DispatchStatus,
    location_name: Optional[str] = None,
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
    notes: Optional[str] = None,
    current_user: dict = Depends(require_any_authenticated)
):
    """Update dispatch tracking status and location."""
    dispatch = await dispatches_collection.find_one({"id": dispatch_id}, {"_id": 0})
    if not dispatch:
        raise HTTPException(status_code=404, detail="Dispatch not found")
    
    # Create tracking entry
    tracking_entry = {
        "id": str(uuid.uuid4()),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "status": status.value,
        "location_name": location_name,
        "latitude": latitude,
        "longitude": longitude,
        "notes": notes,
        "updated_by": current_user["user_id"]
    }
    
    update_data = {
        "status": status.value,
        "current_location_name": location_name,
        "current_latitude": latitude,
        "current_longitude": longitude,
        "last_location_update": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Handle delivery completion
    if status == DispatchStatus.DELIVERED:
        actual_delivery = datetime.now(timezone.utc)
        expected_delivery = datetime.fromisoformat(dispatch["expected_delivery_date"].replace('Z', '+00:00'))
        delay_hours, delivery_status = calculate_delay(expected_delivery, actual_delivery)
        
        # Calculate actual transit time
        dispatch_date = datetime.fromisoformat(dispatch["dispatch_date"].replace('Z', '+00:00'))
        actual_transit = (actual_delivery - dispatch_date).total_seconds() / 3600
        
        update_data["actual_delivery_date"] = actual_delivery.isoformat()
        update_data["delivery_status"] = delivery_status.value
        update_data["delay_hours"] = delay_hours
        update_data["actual_transit_hours"] = actual_transit
        
        # Create delay alert if needed
        if delay_hours > 24:
            await create_incoming_alert(
                dispatch["po_id"], dispatch["po_number"],
                AlertType.DELAY, AlertSeverity.CRITICAL if delay_hours > 48 else AlertSeverity.HIGH,
                f"Critical Delivery Delay: {int(delay_hours)} hours",
                f"Dispatch {dispatch['dispatch_number']} delivered {int(delay_hours)} hours late",
                dispatch["invoice_id"], dispatch.get("invoice_number"),
                dispatch_id, dispatch["dispatch_number"]
            )
    
    await dispatches_collection.update_one(
        {"id": dispatch_id},
        {
            "$set": update_data,
            "$push": {"tracking_history": tracking_entry}
        }
    )
    
    # Update invoice status if all dispatches delivered
    if status == DispatchStatus.DELIVERED:
        await update_invoice_delivery_status(dispatch["invoice_id"])
    
    return {"message": "Tracking updated", "status": status.value}


@router.put("/dispatches/{dispatch_id}/receive")
async def receive_dispatch(
    dispatch_id: str,
    quantity_received: int,
    received_by: Optional[str] = None,
    notes: Optional[str] = None,
    current_user: dict = Depends(require_brand)
):
    """Mark dispatch as received (Brand only)."""
    dispatch = await dispatches_collection.find_one({"id": dispatch_id}, {"_id": 0})
    if not dispatch:
        raise HTTPException(status_code=404, detail="Dispatch not found")
    
    actual_delivery = datetime.now(timezone.utc)
    expected_delivery = datetime.fromisoformat(dispatch["expected_delivery_date"].replace('Z', '+00:00'))
    delay_hours, delivery_status = calculate_delay(expected_delivery, actual_delivery)
    
    # Determine if partial delivery
    is_partial = quantity_received < dispatch["quantity_dispatched"]
    final_status = DispatchStatus.PARTIALLY_DELIVERED if is_partial else DispatchStatus.DELIVERED
    
    # Calculate actual transit time
    dispatch_date = datetime.fromisoformat(dispatch["dispatch_date"].replace('Z', '+00:00'))
    actual_transit = (actual_delivery - dispatch_date).total_seconds() / 3600
    
    # Add tracking entry
    tracking_entry = {
        "id": str(uuid.uuid4()),
        "timestamp": actual_delivery.isoformat(),
        "status": final_status.value,
        "location_name": dispatch.get("destination_name", "Destination"),
        "latitude": dispatch.get("destination_latitude") if dispatch.get("destination_latitude") else None,
        "longitude": dispatch.get("destination_longitude") if dispatch.get("destination_longitude") else None,
        "notes": f"Received {quantity_received} units. {notes or ''}",
        "updated_by": current_user["user_id"]
    }
    
    await dispatches_collection.update_one(
        {"id": dispatch_id},
        {
            "$set": {
                "status": final_status.value,
                "quantity_received": quantity_received,
                "actual_delivery_date": actual_delivery.isoformat(),
                "delivery_status": delivery_status.value,
                "delay_hours": delay_hours,
                "actual_transit_hours": actual_transit,
                "current_location_name": dispatch.get("destination_name", "Destination"),
                "updated_at": actual_delivery.isoformat()
            },
            "$push": {"tracking_history": tracking_entry}
        }
    )
    
    # Create partial delivery alert if needed
    if is_partial:
        await create_incoming_alert(
            dispatch["po_id"], dispatch["po_number"],
            AlertType.PARTIAL_DELIVERY, AlertSeverity.MEDIUM,
            f"Partial Delivery: {quantity_received}/{dispatch['quantity_dispatched']} units",
            f"Only {quantity_received} out of {dispatch['quantity_dispatched']} units received for dispatch {dispatch['dispatch_number']}",
            dispatch["invoice_id"], dispatch.get("invoice_number"),
            dispatch_id, dispatch["dispatch_number"]
        )
    
    # Update invoice
    await update_invoice_delivery_status(dispatch["invoice_id"])
    
    return {"message": "Dispatch received", "quantity_received": quantity_received, "delivery_status": delivery_status.value}


async def update_invoice_delivery_status(invoice_id: str):
    """Update invoice status based on its dispatches."""
    dispatches = await dispatches_collection.find({"invoice_id": invoice_id}, {"_id": 0}).to_list(100)
    
    if not dispatches:
        return
    
    total_dispatched = sum(d.get("quantity_dispatched", 0) for d in dispatches)
    total_received = sum(d.get("quantity_received", 0) for d in dispatches)
    
    all_delivered = all(d["status"] in [DispatchStatus.DELIVERED.value, DispatchStatus.PARTIALLY_DELIVERED.value] for d in dispatches)
    any_in_transit = any(d["status"] == DispatchStatus.IN_TRANSIT.value for d in dispatches)
    
    if total_received >= total_dispatched and all_delivered:
        new_status = InvoiceStatus.DELIVERED
    elif total_received > 0:
        new_status = InvoiceStatus.PARTIALLY_DELIVERED
    elif any_in_transit:
        new_status = InvoiceStatus.IN_TRANSIT
    else:
        new_status = InvoiceStatus.DISPATCHED
    
    # Calculate average delay
    delays = [d.get("delay_hours", 0) for d in dispatches if d.get("actual_delivery_date")]
    avg_delay = sum(delays) / len(delays) if delays else 0
    
    # Determine delivery status
    if avg_delay <= 0:
        delivery_status = DeliveryStatus.ON_TIME
    elif avg_delay <= 24:
        delivery_status = DeliveryStatus.SLIGHT_DELAY
    else:
        delivery_status = DeliveryStatus.CRITICAL_DELAY
    
    await invoices_collection.update_one(
        {"id": invoice_id},
        {
            "$set": {
                "status": new_status.value,
                "quantity_received": total_received,
                "quantity_pending": total_dispatched - total_received,
                "delivery_status": delivery_status.value,
                "delay_hours": avg_delay,
                "actual_delivery_date": datetime.now(timezone.utc).isoformat() if new_status == InvoiceStatus.DELIVERED else None,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )


# ==================== DOCUMENT UPLOAD ====================

@router.post("/dispatches/{dispatch_id}/documents")
async def upload_dispatch_document(
    dispatch_id: str,
    document_type: DocumentType = Form(...),
    title: str = Form(...),
    file: UploadFile = File(...),
    current_user: dict = Depends(require_any_authenticated)
):
    """Upload a document for a dispatch."""
    dispatch = await dispatches_collection.find_one({"id": dispatch_id}, {"_id": 0})
    if not dispatch:
        raise HTTPException(status_code=404, detail="Dispatch not found")
    
    # Save file
    file_id = str(uuid.uuid4())
    ext = file.filename.split(".")[-1] if "." in file.filename else "pdf"
    filename = f"{file_id}.{ext}"
    file_path = f"{UPLOAD_DIR}/dispatch_docs/{filename}"
    
    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)
    
    doc = {
        "id": file_id,
        "document_type": document_type.value,
        "title": title,
        "file_name": file.filename,
        "file_url": f"/uploads/dispatch_docs/{filename}",
        "file_size": len(content),
        "uploaded_by": current_user["user_id"],
        "uploaded_at": datetime.now(timezone.utc).isoformat()
    }
    
    await dispatches_collection.update_one(
        {"id": dispatch_id},
        {"$push": {"documents": doc}}
    )
    
    return {"message": "Document uploaded", "document_id": file_id}


@router.post("/invoices/{invoice_id}/documents")
async def upload_invoice_document(
    invoice_id: str,
    document_type: DocumentType = Form(...),
    title: str = Form(...),
    file: UploadFile = File(...),
    current_user: dict = Depends(require_any_authenticated)
):
    """Upload a document for an invoice."""
    invoice = await invoices_collection.find_one({"id": invoice_id}, {"_id": 0})
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    # Save file
    file_id = str(uuid.uuid4())
    ext = file.filename.split(".")[-1] if "." in file.filename else "pdf"
    filename = f"{file_id}.{ext}"
    file_path = f"{UPLOAD_DIR}/dispatch_docs/{filename}"
    
    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)
    
    doc = {
        "id": file_id,
        "document_type": document_type.value,
        "title": title,
        "file_name": file.filename,
        "file_url": f"/uploads/dispatch_docs/{filename}",
        "file_size": len(content),
        "uploaded_by": current_user["user_id"],
        "uploaded_at": datetime.now(timezone.utc).isoformat()
    }
    
    await invoices_collection.update_one(
        {"id": invoice_id},
        {"$push": {"documents": doc}}
    )
    
    return {"message": "Document uploaded", "document_id": file_id}


# ==================== ALERTS ====================

async def create_incoming_alert(
    po_id: str, po_number: str,
    alert_type: AlertType, severity: AlertSeverity,
    title: str, description: str,
    invoice_id: str = None, invoice_number: str = None,
    dispatch_id: str = None, dispatch_number: str = None
):
    """Create an incoming alert."""
    alert = {
        "id": str(uuid.uuid4()),
        "alert_type": alert_type.value,
        "severity": severity.value,
        "title": title,
        "description": description,
        "po_id": po_id,
        "po_number": po_number,
        "invoice_id": invoice_id,
        "invoice_number": invoice_number,
        "dispatch_id": dispatch_id,
        "dispatch_number": dispatch_number,
        "is_resolved": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await incoming_alerts_collection.insert_one(alert)
    return alert


@router.get("/alerts")
async def get_incoming_alerts(
    po_id: Optional[str] = None,
    alert_type: Optional[AlertType] = None,
    severity: Optional[AlertSeverity] = None,
    resolved: bool = False,
    limit: int = 50,
    current_user: dict = Depends(require_any_authenticated)
):
    """Get incoming alerts."""
    query = {"is_resolved": resolved}
    
    if po_id:
        query["po_id"] = po_id
    if alert_type:
        query["alert_type"] = alert_type.value
    if severity:
        query["severity"] = severity.value
    
    alerts = await incoming_alerts_collection.find(query, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
    return alerts


@router.put("/alerts/{alert_id}/resolve")
async def resolve_incoming_alert(
    alert_id: str,
    notes: Optional[str] = None,
    current_user: dict = Depends(require_any_authenticated)
):
    """Resolve an incoming alert."""
    result = await incoming_alerts_collection.update_one(
        {"id": alert_id},
        {
            "$set": {
                "is_resolved": True,
                "resolved_by": current_user["user_id"],
                "resolved_at": datetime.now(timezone.utc).isoformat(),
                "resolution_notes": notes
            }
        }
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    return {"message": "Alert resolved"}


# ==================== PO INCOMING SUMMARY ====================

@router.get("/po/{po_id}/summary")
async def get_po_incoming_summary(
    po_id: str,
    current_user: dict = Depends(require_any_authenticated)
):
    """Get incoming summary for a PO."""
    po = await pos_collection.find_one({"id": po_id}, {"_id": 0})
    if not po:
        raise HTTPException(status_code=404, detail="PO not found")
    
    # Get all invoices for this PO
    invoices = await invoices_collection.find({"po_id": po_id}, {"_id": 0}).to_list(100)
    
    # Get all dispatches for this PO
    dispatches = await dispatches_collection.find({"po_id": po_id}, {"_id": 0}).to_list(100)
    
    # Calculate totals
    total_quantity_ordered = sum(item.get("quantity", 0) for item in po.get("line_items", []))
    total_quantity_dispatched = sum(inv.get("quantity_shipped", 0) for inv in invoices)
    total_quantity_received = sum(d.get("quantity_received", 0) for d in dispatches)
    
    # Count by status
    in_transit = sum(1 for d in dispatches if d["status"] == DispatchStatus.IN_TRANSIT.value)
    delivered = sum(1 for d in dispatches if d["status"] in [DispatchStatus.DELIVERED.value, DispatchStatus.PARTIALLY_DELIVERED.value])
    delayed = sum(1 for d in dispatches if d.get("delivery_status") in [DeliveryStatus.SLIGHT_DELAY.value, DeliveryStatus.CRITICAL_DELAY.value])
    pending = sum(1 for d in dispatches if d["status"] in [DispatchStatus.PENDING.value, DispatchStatus.DISPATCHED.value])
    
    # Determine overall status
    if total_quantity_received >= total_quantity_dispatched and delivered == len(dispatches):
        overall_status = DeliveryStatus.ON_TIME
    elif delayed > 0:
        overall_status = DeliveryStatus.CRITICAL_DELAY if delayed > len(dispatches) / 2 else DeliveryStatus.SLIGHT_DELAY
    else:
        overall_status = DeliveryStatus.PENDING
    
    return {
        "po_id": po_id,
        "po_number": po["po_number"],
        "supplier_name": po.get("supplier_name", ""),
        "total_invoices": len(invoices),
        "total_quantity_ordered": total_quantity_ordered,
        "total_quantity_dispatched": total_quantity_dispatched,
        "total_quantity_received": total_quantity_received,
        "quantity_pending": total_quantity_dispatched - total_quantity_received,
        "pending_deliveries": pending,
        "in_transit_count": in_transit,
        "completed_deliveries": delivered,
        "delayed_count": delayed,
        "overall_delivery_status": overall_status.value,
        "invoices": invoices,
        "dispatches": dispatches
    }


@router.get("/po/{po_id}/invoices")
async def get_po_invoices(
    po_id: str,
    current_user: dict = Depends(require_any_authenticated)
):
    """Get all invoices for a PO."""
    invoices = await invoices_collection.find({"po_id": po_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return invoices


@router.get("/po/{po_id}/dispatches")
async def get_po_dispatches(
    po_id: str,
    current_user: dict = Depends(require_any_authenticated)
):
    """Get all dispatches for a PO."""
    dispatches = await dispatches_collection.find({"po_id": po_id}, {"_id": 0}).sort("dispatch_date", -1).to_list(100)
    return dispatches


# ==================== ANALYTICS ====================

@router.get("/analytics/delivery-performance")
async def get_delivery_performance(
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
    supplier_id: Optional[str] = None,
    current_user: dict = Depends(require_brand)
):
    """Get delivery performance analytics."""
    query = {}
    
    if supplier_id:
        query["supplier_id"] = supplier_id
    if from_date:
        query["dispatch_date"] = {"$gte": from_date}
    if to_date:
        query.setdefault("dispatch_date", {})["$lte"] = to_date
    
    # Only delivered dispatches
    query["status"] = {"$in": [DispatchStatus.DELIVERED.value, DispatchStatus.PARTIALLY_DELIVERED.value]}
    
    dispatches = await dispatches_collection.find(query, {"_id": 0}).to_list(1000)
    
    total = len(dispatches)
    on_time = sum(1 for d in dispatches if d.get("delivery_status") == DeliveryStatus.ON_TIME.value)
    slight_delay = sum(1 for d in dispatches if d.get("delivery_status") == DeliveryStatus.SLIGHT_DELAY.value)
    critical_delay = sum(1 for d in dispatches if d.get("delivery_status") == DeliveryStatus.CRITICAL_DELAY.value)
    
    avg_delay = sum(d.get("delay_hours", 0) for d in dispatches) / total if total > 0 else 0
    avg_transit = sum(d.get("actual_transit_hours", 0) for d in dispatches) / total if total > 0 else 0
    
    return {
        "total_deliveries": total,
        "on_time_deliveries": on_time,
        "slight_delay_deliveries": slight_delay,
        "critical_delay_deliveries": critical_delay,
        "on_time_percentage": round(on_time / total * 100, 1) if total > 0 else 0,
        "average_delay_hours": round(avg_delay, 1),
        "average_transit_time_hours": round(avg_transit, 1)
    }


@router.get("/analytics/supplier-logistics")
async def get_supplier_logistics_performance(
    current_user: dict = Depends(require_brand)
):
    """Get logistics performance by supplier."""
    # Get all dispatches
    dispatches = await dispatches_collection.find({}, {"_id": 0}).to_list(1000)
    
    # Group by supplier
    supplier_data = {}
    for d in dispatches:
        sid = d["supplier_id"]
        if sid not in supplier_data:
            supplier_data[sid] = {
                "supplier_id": sid,
                "supplier_name": d["supplier_name"],
                "dispatches": [],
                "total": 0,
                "on_time": 0,
                "delayed": 0,
                "transit_times": []
            }
        
        supplier_data[sid]["dispatches"].append(d)
        supplier_data[sid]["total"] += 1
        
        if d.get("delivery_status") == DeliveryStatus.ON_TIME.value:
            supplier_data[sid]["on_time"] += 1
        elif d.get("delivery_status") in [DeliveryStatus.SLIGHT_DELAY.value, DeliveryStatus.CRITICAL_DELAY.value]:
            supplier_data[sid]["delayed"] += 1
        
        if d.get("actual_transit_hours"):
            supplier_data[sid]["transit_times"].append(d["actual_transit_hours"])
    
    # Calculate metrics
    result = []
    for sid, data in supplier_data.items():
        avg_transit = sum(data["transit_times"]) / len(data["transit_times"]) if data["transit_times"] else 0
        result.append({
            "supplier_id": sid,
            "supplier_name": data["supplier_name"],
            "total_dispatches": data["total"],
            "on_time_count": data["on_time"],
            "delayed_count": data["delayed"],
            "delay_frequency": round(data["delayed"] / data["total"] * 100, 1) if data["total"] > 0 else 0,
            "dispatch_efficiency": round(data["on_time"] / data["total"] * 100, 1) if data["total"] > 0 else 0,
            "average_transit_time": round(avg_transit, 1)
        })
    
    return sorted(result, key=lambda x: x["dispatch_efficiency"], reverse=True)


@router.get("/analytics/distance-delivery")
async def get_distance_delivery_analysis(
    current_user: dict = Depends(require_brand)
):
    """Analyze relationship between distance and delivery time."""
    dispatches = await dispatches_collection.find(
        {"status": {"$in": [DispatchStatus.DELIVERED.value, DispatchStatus.PARTIALLY_DELIVERED.value]}},
        {"_id": 0}
    ).to_list(1000)
    
    # Group by distance ranges
    ranges = {
        "0-100km": {"min": 0, "max": 100, "dispatches": []},
        "100-500km": {"min": 100, "max": 500, "dispatches": []},
        "500-1000km": {"min": 500, "max": 1000, "dispatches": []},
        "1000km+": {"min": 1000, "max": 99999, "dispatches": []}
    }
    
    for d in dispatches:
        dist = d.get("distance_km", 0)
        for range_name, range_data in ranges.items():
            if range_data["min"] <= dist < range_data["max"]:
                range_data["dispatches"].append(d)
                break
    
    result = []
    for range_name, range_data in ranges.items():
        if range_data["dispatches"]:
            avg_transit = sum(d.get("actual_transit_hours", 0) for d in range_data["dispatches"]) / len(range_data["dispatches"])
            avg_delay = sum(d.get("delay_hours", 0) for d in range_data["dispatches"]) / len(range_data["dispatches"])
            on_time = sum(1 for d in range_data["dispatches"] if d.get("delivery_status") == DeliveryStatus.ON_TIME.value)
            
            result.append({
                "distance_range": range_name,
                "total_deliveries": len(range_data["dispatches"]),
                "average_transit_hours": round(avg_transit, 1),
                "average_delay_hours": round(avg_delay, 1),
                "on_time_percentage": round(on_time / len(range_data["dispatches"]) * 100, 1)
            })
    
    return result


# ==================== DASHBOARD OVERVIEW ====================

@router.get("/dashboard/overview")
async def get_incoming_dashboard_overview(
    current_user: dict = Depends(require_brand)
):
    """Get overview data for incoming dashboard."""
    # Get all POs with dispatches
    invoices = await invoices_collection.find({"brand_id": current_user["user_id"]}, {"_id": 0}).to_list(500)
    dispatches = await dispatches_collection.find({}, {"_id": 0}).to_list(1000)
    alerts = await incoming_alerts_collection.find({"is_resolved": False}, {"_id": 0}).to_list(100)
    
    # Calculate stats
    total_invoices = len(invoices)
    total_dispatches = len(dispatches)
    
    in_transit = sum(1 for d in dispatches if d["status"] == DispatchStatus.IN_TRANSIT.value)
    delivered = sum(1 for d in dispatches if d["status"] in [DispatchStatus.DELIVERED.value, DispatchStatus.PARTIALLY_DELIVERED.value])
    pending = sum(1 for d in dispatches if d["status"] in [DispatchStatus.PENDING.value, DispatchStatus.DISPATCHED.value])
    delayed = sum(1 for d in dispatches if d.get("delivery_status") in [DeliveryStatus.SLIGHT_DELAY.value, DeliveryStatus.CRITICAL_DELAY.value])
    
    # Total quantities
    total_dispatched = sum(d.get("quantity_dispatched", 0) for d in dispatches)
    total_received = sum(d.get("quantity_received", 0) for d in dispatches)
    
    # Recent dispatches (last 7 days)
    week_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    recent_dispatches = [d for d in dispatches if d.get("dispatch_date", "") >= week_ago]
    
    return {
        "total_invoices": total_invoices,
        "total_dispatches": total_dispatches,
        "in_transit": in_transit,
        "delivered": delivered,
        "pending": pending,
        "delayed": delayed,
        "total_quantity_dispatched": total_dispatched,
        "total_quantity_received": total_received,
        "pending_quantity": total_dispatched - total_received,
        "active_alerts": len(alerts),
        "alerts": alerts[:5],  # Top 5 alerts
        "recent_dispatches_count": len(recent_dispatches)
    }


@router.get("/dashboard/pos-with-shipments")
async def get_pos_with_shipments(
    status: Optional[str] = None,
    limit: int = 50,
    skip: int = 0,
    current_user: dict = Depends(require_brand)
):
    """Get POs that have active or completed shipments."""
    # Get unique PO IDs from invoices
    invoices = await invoices_collection.find(
        {"brand_id": current_user["user_id"]},
        {"_id": 0, "po_id": 1}
    ).to_list(500)
    
    po_ids = list(set(inv["po_id"] for inv in invoices))
    
    if not po_ids:
        return []
    
    # Get POs
    query = {"id": {"$in": po_ids}}
    if status:
        query["status"] = status
    
    pos = await pos_collection.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    # Enrich with dispatch summary
    result = []
    for po in pos:
        po_invoices = await invoices_collection.find({"po_id": po["id"]}, {"_id": 0}).to_list(50)
        po_dispatches = await dispatches_collection.find({"po_id": po["id"]}, {"_id": 0}).to_list(100)
        
        total_dispatched = sum(inv.get("quantity_shipped", 0) for inv in po_invoices)
        total_received = sum(d.get("quantity_received", 0) for d in po_dispatches)
        in_transit = sum(1 for d in po_dispatches if d["status"] == DispatchStatus.IN_TRANSIT.value)
        delivered = sum(1 for d in po_dispatches if d["status"] in [DispatchStatus.DELIVERED.value, DispatchStatus.PARTIALLY_DELIVERED.value])
        delayed = sum(1 for d in po_dispatches if d.get("delivery_status") in [DeliveryStatus.SLIGHT_DELAY.value, DeliveryStatus.CRITICAL_DELAY.value])
        
        # Determine color indicator
        if delayed > 0:
            color = "red" if delayed > len(po_dispatches) / 2 else "yellow"
        elif in_transit > 0:
            color = "blue"
        elif delivered == len(po_dispatches) and len(po_dispatches) > 0:
            color = "green"
        else:
            color = "gray"
        
        result.append({
            **po,
            "invoice_count": len(po_invoices),
            "dispatch_count": len(po_dispatches),
            "total_dispatched": total_dispatched,
            "total_received": total_received,
            "pending_quantity": total_dispatched - total_received,
            "in_transit_count": in_transit,
            "delivered_count": delivered,
            "delayed_count": delayed,
            "color_indicator": color
        })
    
    return result


# ==================== LIVE TRACKING SIMULATION ====================

@router.post("/dispatches/{dispatch_id}/simulate-tracking")
async def simulate_tracking_update(
    dispatch_id: str,
    current_user: dict = Depends(require_any_authenticated)
):
    """Simulate a tracking update for demo purposes."""
    dispatch = await dispatches_collection.find_one({"id": dispatch_id}, {"_id": 0})
    if not dispatch:
        raise HTTPException(status_code=404, detail="Dispatch not found")
    
    if dispatch["status"] in [DispatchStatus.DELIVERED.value, DispatchStatus.CANCELLED.value]:
        return {"message": "Dispatch already completed"}
    
    # Get source and destination coords
    invoice = await invoices_collection.find_one({"id": dispatch["invoice_id"]}, {"_id": 0})
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    source_lat = invoice.get("source_latitude", 19.0760)
    source_lon = invoice.get("source_longitude", 72.8777)
    dest_lat = invoice.get("destination_latitude", 28.6139)
    dest_lon = invoice.get("destination_longitude", 77.2090)
    
    # Calculate progress based on current status
    current_status = dispatch["status"]
    
    if current_status == DispatchStatus.DISPATCHED.value:
        # Move to in transit (25% of way)
        new_status = DispatchStatus.IN_TRANSIT
        progress = 0.25
        location_name = "In Transit - Highway"
    elif current_status == DispatchStatus.IN_TRANSIT.value:
        # Move further (75% of way) or out for delivery
        progress = 0.75
        new_status = DispatchStatus.OUT_FOR_DELIVERY
        location_name = "Out for Delivery - Near Destination"
    elif current_status == DispatchStatus.OUT_FOR_DELIVERY.value:
        # Delivered
        new_status = DispatchStatus.DELIVERED
        progress = 1.0
        location_name = invoice.get("destination_city", "Destination")
    else:
        new_status = DispatchStatus.IN_TRANSIT
        progress = 0.5
        location_name = "In Transit"
    
    # Interpolate position
    new_lat = source_lat + (dest_lat - source_lat) * progress
    new_lon = source_lon + (dest_lon - source_lon) * progress
    
    # Add some randomness
    new_lat += random.uniform(-0.05, 0.05)
    new_lon += random.uniform(-0.05, 0.05)
    
    # Create tracking entry
    tracking_entry = {
        "id": str(uuid.uuid4()),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "status": new_status.value,
        "location_name": location_name,
        "latitude": new_lat,
        "longitude": new_lon,
        "notes": f"Simulated update - {int(progress * 100)}% complete",
        "updated_by": "system"
    }
    
    update_data = {
        "status": new_status.value,
        "current_latitude": new_lat,
        "current_longitude": new_lon,
        "current_location_name": location_name,
        "last_location_update": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Handle delivery
    if new_status == DispatchStatus.DELIVERED:
        actual_delivery = datetime.now(timezone.utc)
        expected_delivery = datetime.fromisoformat(dispatch["expected_delivery_date"].replace('Z', '+00:00'))
        delay_hours, delivery_status = calculate_delay(expected_delivery, actual_delivery)
        
        dispatch_date = datetime.fromisoformat(dispatch["dispatch_date"].replace('Z', '+00:00'))
        actual_transit = (actual_delivery - dispatch_date).total_seconds() / 3600
        
        update_data["actual_delivery_date"] = actual_delivery.isoformat()
        update_data["delivery_status"] = delivery_status.value
        update_data["delay_hours"] = delay_hours
        update_data["actual_transit_hours"] = actual_transit
        update_data["quantity_received"] = dispatch["quantity_dispatched"]
    
    await dispatches_collection.update_one(
        {"id": dispatch_id},
        {
            "$set": update_data,
            "$push": {"tracking_history": tracking_entry}
        }
    )
    
    if new_status == DispatchStatus.DELIVERED:
        await update_invoice_delivery_status(dispatch["invoice_id"])
    
    return {
        "message": "Tracking updated",
        "new_status": new_status.value,
        "location": {"lat": new_lat, "lon": new_lon, "name": location_name},
        "progress": int(progress * 100)
    }
