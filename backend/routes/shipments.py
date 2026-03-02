from fastapi import APIRouter, HTTPException, status, Depends, Query
from datetime import datetime, timezone
from typing import List, Optional
import uuid

from models.shipment import (
    ShipmentLog, ShipmentLogCreate, ShipmentLogResponse,
    ShipmentLogUpdate, ShipmentStatus, ShipmentType
)
from utils.auth import get_current_user, require_manufacturer, require_any_authenticated
from utils.database import shipments_collection, batches_collection, transactions_collection
from utils.activity_logger import log_activity

router = APIRouter(prefix="/shipments", tags=["Shipments"])


@router.post("/", response_model=ShipmentLogResponse, status_code=status.HTTP_201_CREATED)
async def create_shipment(
    shipment_data: ShipmentLogCreate,
    current_user: dict = Depends(require_manufacturer)
):
    """Create a new shipment (Manufacturer only)."""
    # Verify batch exists and belongs to user
    batch = await batches_collection.find_one({
        "id": shipment_data.batch_id,
        "manufacturer_id": current_user["user_id"],
        "is_deleted": {"$ne": True}
    })
    
    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Batch not found or access denied"
        )
    
    # Generate unique shipment number
    shipment_number = f"SHP-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"
    
    shipment = ShipmentLog(
        id=str(uuid.uuid4()),
        shipment_number=shipment_number,
        batch_id=shipment_data.batch_id,
        manufacturer_id=current_user["user_id"],
        destination_brand_id=shipment_data.destination_brand_id,
        quantity=shipment_data.quantity,
        unit=shipment_data.unit,
        shipment_type=shipment_data.shipment_type,
        carrier_name=shipment_data.carrier_name,
        tracking_number=shipment_data.tracking_number,
        origin_address=shipment_data.origin_address,
        destination_address=shipment_data.destination_address,
        expected_delivery_date=shipment_data.expected_delivery_date,
        notes=shipment_data.notes,
        status=ShipmentStatus.PENDING,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    
    shipment_dict = shipment.model_dump()
    shipment_dict['created_at'] = shipment_dict['created_at'].isoformat()
    shipment_dict['updated_at'] = shipment_dict['updated_at'].isoformat()
    if shipment_dict.get('expected_delivery_date'):
        shipment_dict['expected_delivery_date'] = shipment_dict['expected_delivery_date'].isoformat()
    
    await shipments_collection.insert_one(shipment_dict)
    
    # Update batch status and brand_id
    await batches_collection.update_one(
        {"id": shipment_data.batch_id},
        {
            "$set": {
                "status": "shipment",
                "brand_id": shipment_data.destination_brand_id,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    # Create transaction record
    transaction = {
        "id": str(uuid.uuid4()),
        "transaction_number": f"TXN-{datetime.now().strftime('%Y%m%d%H%M%S')}-{str(uuid.uuid4())[:6].upper()}",
        "batch_id": shipment_data.batch_id,
        "manufacturer_id": current_user["user_id"],
        "brand_id": shipment_data.destination_brand_id,
        "transaction_type": "shipment",
        "quantity": shipment_data.quantity,
        "unit": shipment_data.unit,
        "reference_id": shipment.id,
        "status": "pending",
        "notes": f"Shipment to brand: {shipment_data.destination_brand_id}",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "is_immutable": False,
        "is_deleted": False
    }
    await transactions_collection.insert_one(transaction)
    
    # Log activity
    await log_activity(
        user_id=current_user["user_id"],
        user_email=current_user["email"],
        user_role=current_user["role"],
        action="create",
        entity_type="shipment",
        entity_id=shipment.id,
        description=f"Shipment created: {shipment_number}",
        metadata={"batch_id": shipment_data.batch_id, "quantity": shipment_data.quantity}
    )
    
    return ShipmentLogResponse(
        id=shipment.id,
        shipment_number=shipment.shipment_number,
        batch_id=shipment.batch_id,
        manufacturer_id=shipment.manufacturer_id,
        destination_brand_id=shipment.destination_brand_id,
        quantity=shipment.quantity,
        unit=shipment.unit,
        shipment_type=shipment.shipment_type,
        status=shipment.status,
        carrier_name=shipment.carrier_name,
        tracking_number=shipment.tracking_number,
        origin_address=shipment.origin_address,
        destination_address=shipment.destination_address,
        expected_delivery_date=shipment.expected_delivery_date,
        shipped_date=shipment.shipped_date,
        delivered_date=shipment.delivered_date,
        invoice_number=shipment.invoice_number,
        notes=shipment.notes,
        created_at=shipment.created_at
    )


@router.get("/", response_model=List[ShipmentLogResponse])
async def get_shipments(
    batch_id: Optional[str] = None,
    status: Optional[ShipmentStatus] = None,
    shipment_type: Optional[ShipmentType] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: dict = Depends(require_any_authenticated)
):
    """Get shipments based on user role and filters."""
    query = {"is_deleted": {"$ne": True}}
    
    if current_user["role"] == "manufacturer":
        query["manufacturer_id"] = current_user["user_id"]
    elif current_user["role"] == "brand":
        query["destination_brand_id"] = current_user["user_id"]
    
    if batch_id:
        query["batch_id"] = batch_id
    if status:
        query["status"] = status.value
    if shipment_type:
        query["shipment_type"] = shipment_type.value
    
    shipments = await shipments_collection.find(query).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    result = []
    for s in shipments:
        created_at = s.get("created_at")
        if isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
        
        expected_delivery_date = s.get("expected_delivery_date")
        if isinstance(expected_delivery_date, str):
            expected_delivery_date = datetime.fromisoformat(expected_delivery_date.replace('Z', '+00:00'))
        
        shipped_date = s.get("shipped_date")
        if isinstance(shipped_date, str):
            shipped_date = datetime.fromisoformat(shipped_date.replace('Z', '+00:00'))
        
        delivered_date = s.get("delivered_date")
        if isinstance(delivered_date, str):
            delivered_date = datetime.fromisoformat(delivered_date.replace('Z', '+00:00'))
        
        result.append(ShipmentLogResponse(
            id=s["id"],
            shipment_number=s["shipment_number"],
            batch_id=s["batch_id"],
            manufacturer_id=s["manufacturer_id"],
            destination_brand_id=s["destination_brand_id"],
            quantity=s["quantity"],
            unit=s["unit"],
            shipment_type=s["shipment_type"],
            status=s["status"],
            carrier_name=s["carrier_name"],
            tracking_number=s.get("tracking_number"),
            origin_address=s["origin_address"],
            destination_address=s["destination_address"],
            expected_delivery_date=expected_delivery_date,
            shipped_date=shipped_date,
            delivered_date=delivered_date,
            invoice_number=s.get("invoice_number"),
            notes=s.get("notes"),
            created_at=created_at
        ))
    
    return result


@router.get("/{shipment_id}", response_model=ShipmentLogResponse)
async def get_shipment(shipment_id: str, current_user: dict = Depends(require_any_authenticated)):
    """Get shipment by ID."""
    query = {"id": shipment_id, "is_deleted": {"$ne": True}}
    
    if current_user["role"] == "manufacturer":
        query["manufacturer_id"] = current_user["user_id"]
    elif current_user["role"] == "brand":
        query["destination_brand_id"] = current_user["user_id"]
    
    shipment = await shipments_collection.find_one(query)
    
    if not shipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shipment not found"
        )
    
    created_at = shipment.get("created_at")
    if isinstance(created_at, str):
        created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
    
    expected_delivery_date = shipment.get("expected_delivery_date")
    if isinstance(expected_delivery_date, str):
        expected_delivery_date = datetime.fromisoformat(expected_delivery_date.replace('Z', '+00:00'))
    
    shipped_date = shipment.get("shipped_date")
    if isinstance(shipped_date, str):
        shipped_date = datetime.fromisoformat(shipped_date.replace('Z', '+00:00'))
    
    delivered_date = shipment.get("delivered_date")
    if isinstance(delivered_date, str):
        delivered_date = datetime.fromisoformat(delivered_date.replace('Z', '+00:00'))
    
    return ShipmentLogResponse(
        id=shipment["id"],
        shipment_number=shipment["shipment_number"],
        batch_id=shipment["batch_id"],
        manufacturer_id=shipment["manufacturer_id"],
        destination_brand_id=shipment["destination_brand_id"],
        quantity=shipment["quantity"],
        unit=shipment["unit"],
        shipment_type=shipment["shipment_type"],
        status=shipment["status"],
        carrier_name=shipment["carrier_name"],
        tracking_number=shipment.get("tracking_number"),
        origin_address=shipment["origin_address"],
        destination_address=shipment["destination_address"],
        expected_delivery_date=expected_delivery_date,
        shipped_date=shipped_date,
        delivered_date=delivered_date,
        invoice_number=shipment.get("invoice_number"),
        notes=shipment.get("notes"),
        created_at=created_at
    )


@router.put("/{shipment_id}", response_model=ShipmentLogResponse)
async def update_shipment(
    shipment_id: str,
    update_data: ShipmentLogUpdate,
    current_user: dict = Depends(require_manufacturer)
):
    """Update shipment (Manufacturer only)."""
    shipment = await shipments_collection.find_one({
        "id": shipment_id,
        "manufacturer_id": current_user["user_id"],
        "is_deleted": {"$ne": True}
    })
    
    if not shipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shipment not found or access denied"
        )
    
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    
    if not update_dict:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    # Handle status transitions
    if "status" in update_dict:
        if update_dict["status"] == "picked_up" and not shipment.get("shipped_date"):
            update_dict["shipped_date"] = datetime.now(timezone.utc).isoformat()
        elif update_dict["status"] == "delivered" and not shipment.get("delivered_date"):
            update_dict["delivered_date"] = datetime.now(timezone.utc).isoformat()
            
            # Update batch status
            await batches_collection.update_one(
                {"id": shipment["batch_id"]},
                {
                    "$set": {
                        "status": "delivered",
                        "updated_at": datetime.now(timezone.utc).isoformat()
                    }
                }
            )
    
    # Convert datetime fields to ISO string
    if "shipped_date" in update_dict and update_dict["shipped_date"]:
        if isinstance(update_dict["shipped_date"], datetime):
            update_dict["shipped_date"] = update_dict["shipped_date"].isoformat()
    
    if "delivered_date" in update_dict and update_dict["delivered_date"]:
        if isinstance(update_dict["delivered_date"], datetime):
            update_dict["delivered_date"] = update_dict["delivered_date"].isoformat()
    
    update_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await shipments_collection.update_one(
        {"id": shipment_id},
        {"$set": update_dict}
    )
    
    # Log activity
    await log_activity(
        user_id=current_user["user_id"],
        user_email=current_user["email"],
        user_role=current_user["role"],
        action="update",
        entity_type="shipment",
        entity_id=shipment_id,
        description=f"Shipment updated: {shipment['shipment_number']}",
        metadata={"updated_fields": list(update_dict.keys())}
    )
    
    return await get_shipment(shipment_id, current_user)


@router.post("/{shipment_id}/track")
async def update_shipment_status(
    shipment_id: str,
    new_status: ShipmentStatus,
    notes: Optional[str] = None,
    current_user: dict = Depends(require_any_authenticated)
):
    """Update shipment tracking status."""
    query = {"id": shipment_id, "is_deleted": {"$ne": True}}
    
    if current_user["role"] == "manufacturer":
        query["manufacturer_id"] = current_user["user_id"]
    
    shipment = await shipments_collection.find_one(query)
    
    if not shipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shipment not found"
        )
    
    update_dict = {
        "status": new_status.value,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    if notes:
        existing_notes = shipment.get("notes", "")
        update_dict["notes"] = f"{existing_notes}\n[{datetime.now().strftime('%Y-%m-%d %H:%M')}] {new_status.value}: {notes}"
    
    if new_status == ShipmentStatus.PICKED_UP:
        update_dict["shipped_date"] = datetime.now(timezone.utc).isoformat()
    elif new_status == ShipmentStatus.DELIVERED:
        update_dict["delivered_date"] = datetime.now(timezone.utc).isoformat()
        
        # Update batch status
        await batches_collection.update_one(
            {"id": shipment["batch_id"]},
            {"$set": {"status": "delivered", "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
    
    await shipments_collection.update_one(
        {"id": shipment_id},
        {"$set": update_dict}
    )
    
    # Log activity
    await log_activity(
        user_id=current_user["user_id"],
        user_email=current_user["email"],
        user_role=current_user["role"],
        action="update",
        entity_type="shipment",
        entity_id=shipment_id,
        description=f"Shipment status updated to: {new_status.value}",
        metadata={"new_status": new_status.value}
    )
    
    return {"message": f"Shipment status updated to {new_status.value}"}
