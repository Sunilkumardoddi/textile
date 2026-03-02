from fastapi import APIRouter, HTTPException, status, Depends, Query
from datetime import datetime, timezone
from typing import List, Optional
import uuid

from models.material import (
    MaterialInward, MaterialInwardCreate, MaterialInwardResponse, 
    MaterialInwardUpdate, MaterialQuality, MaterialSource
)
from utils.auth import get_current_user, require_manufacturer, require_any_authenticated
from utils.database import materials_collection, batches_collection, transactions_collection
from utils.activity_logger import log_activity

router = APIRouter(prefix="/materials", tags=["Materials"])


@router.post("/", response_model=MaterialInwardResponse, status_code=status.HTTP_201_CREATED)
async def create_material_inward(
    material_data: MaterialInwardCreate,
    current_user: dict = Depends(require_manufacturer)
):
    """Create a new material inward entry (Manufacturer only)."""
    # Verify batch exists and belongs to user
    batch = await batches_collection.find_one({
        "id": material_data.batch_id,
        "manufacturer_id": current_user["user_id"],
        "is_deleted": {"$ne": True}
    })
    
    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Batch not found or access denied"
        )
    
    # Check for duplicate lot number
    existing = await materials_collection.find_one({
        "lot_number": material_data.lot_number,
        "batch_id": material_data.batch_id,
        "is_deleted": {"$ne": True}
    })
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Duplicate lot number for this batch"
        )
    
    material = MaterialInward(
        id=str(uuid.uuid4()),
        batch_id=material_data.batch_id,
        manufacturer_id=current_user["user_id"],
        material_name=material_data.material_name,
        supplier_name=material_data.supplier_name,
        supplier_location=material_data.supplier_location,
        quantity=material_data.quantity,
        unit=material_data.unit,
        quality_grade=material_data.quality_grade,
        source_type=material_data.source_type,
        lot_number=material_data.lot_number,
        invoice_number=material_data.invoice_number,
        certification=material_data.certification,
        notes=material_data.notes,
        received_date=datetime.now(timezone.utc),
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    
    material_dict = material.model_dump()
    material_dict['received_date'] = material_dict['received_date'].isoformat()
    material_dict['created_at'] = material_dict['created_at'].isoformat()
    material_dict['updated_at'] = material_dict['updated_at'].isoformat()
    
    await materials_collection.insert_one(material_dict)
    
    # Update batch status
    await batches_collection.update_one(
        {"id": material_data.batch_id},
        {
            "$set": {
                "status": "raw_material",
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    # Create transaction record
    transaction = {
        "id": str(uuid.uuid4()),
        "transaction_number": f"TXN-{datetime.now().strftime('%Y%m%d%H%M%S')}-{str(uuid.uuid4())[:6].upper()}",
        "batch_id": material_data.batch_id,
        "manufacturer_id": current_user["user_id"],
        "transaction_type": "material_inward",
        "quantity": material_data.quantity,
        "unit": material_data.unit,
        "reference_id": material.id,
        "status": "pending",
        "notes": f"Material: {material_data.material_name}, Lot: {material_data.lot_number}",
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
        entity_type="material",
        entity_id=material.id,
        description=f"Material inward created: {material_data.lot_number}",
        metadata={"batch_id": material_data.batch_id, "quantity": material_data.quantity}
    )
    
    return MaterialInwardResponse(
        id=material.id,
        batch_id=material.batch_id,
        manufacturer_id=material.manufacturer_id,
        material_name=material.material_name,
        supplier_name=material.supplier_name,
        supplier_location=material.supplier_location,
        quantity=material.quantity,
        unit=material.unit,
        quality_grade=material.quality_grade,
        source_type=material.source_type,
        lot_number=material.lot_number,
        invoice_number=material.invoice_number,
        certification=material.certification,
        notes=material.notes,
        received_date=material.received_date,
        verified=material.verified,
        verified_by=material.verified_by,
        created_at=material.created_at
    )


@router.get("/", response_model=List[MaterialInwardResponse])
async def get_materials(
    batch_id: Optional[str] = None,
    quality_grade: Optional[MaterialQuality] = None,
    source_type: Optional[MaterialSource] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: dict = Depends(require_any_authenticated)
):
    """Get materials based on user role and filters."""
    query = {"is_deleted": {"$ne": True}}
    
    if current_user["role"] == "manufacturer":
        query["manufacturer_id"] = current_user["user_id"]
    
    if batch_id:
        query["batch_id"] = batch_id
    if quality_grade:
        query["quality_grade"] = quality_grade.value
    if source_type:
        query["source_type"] = source_type.value
    
    materials = await materials_collection.find(query).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    result = []
    for m in materials:
        received_date = m.get("received_date")
        if isinstance(received_date, str):
            received_date = datetime.fromisoformat(received_date.replace('Z', '+00:00'))
        
        created_at = m.get("created_at")
        if isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
        
        result.append(MaterialInwardResponse(
            id=m["id"],
            batch_id=m["batch_id"],
            manufacturer_id=m["manufacturer_id"],
            material_name=m["material_name"],
            supplier_name=m["supplier_name"],
            supplier_location=m["supplier_location"],
            quantity=m["quantity"],
            unit=m["unit"],
            quality_grade=m["quality_grade"],
            source_type=m["source_type"],
            lot_number=m["lot_number"],
            invoice_number=m.get("invoice_number"),
            certification=m.get("certification"),
            notes=m.get("notes"),
            received_date=received_date,
            verified=m.get("verified", False),
            verified_by=m.get("verified_by"),
            created_at=created_at
        ))
    
    return result


@router.get("/{material_id}", response_model=MaterialInwardResponse)
async def get_material(material_id: str, current_user: dict = Depends(require_any_authenticated)):
    """Get material by ID."""
    query = {"id": material_id, "is_deleted": {"$ne": True}}
    
    if current_user["role"] == "manufacturer":
        query["manufacturer_id"] = current_user["user_id"]
    
    material = await materials_collection.find_one(query)
    
    if not material:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Material not found"
        )
    
    received_date = material.get("received_date")
    if isinstance(received_date, str):
        received_date = datetime.fromisoformat(received_date.replace('Z', '+00:00'))
    
    created_at = material.get("created_at")
    if isinstance(created_at, str):
        created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
    
    return MaterialInwardResponse(
        id=material["id"],
        batch_id=material["batch_id"],
        manufacturer_id=material["manufacturer_id"],
        material_name=material["material_name"],
        supplier_name=material["supplier_name"],
        supplier_location=material["supplier_location"],
        quantity=material["quantity"],
        unit=material["unit"],
        quality_grade=material["quality_grade"],
        source_type=material["source_type"],
        lot_number=material["lot_number"],
        invoice_number=material.get("invoice_number"),
        certification=material.get("certification"),
        notes=material.get("notes"),
        received_date=received_date,
        verified=material.get("verified", False),
        verified_by=material.get("verified_by"),
        created_at=created_at
    )


@router.put("/{material_id}", response_model=MaterialInwardResponse)
async def update_material(
    material_id: str,
    update_data: MaterialInwardUpdate,
    current_user: dict = Depends(require_manufacturer)
):
    """Update material (Manufacturer only)."""
    material = await materials_collection.find_one({
        "id": material_id,
        "manufacturer_id": current_user["user_id"],
        "is_deleted": {"$ne": True}
    })
    
    if not material:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Material not found or access denied"
        )
    
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    
    if not update_dict:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    update_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await materials_collection.update_one(
        {"id": material_id},
        {"$set": update_dict}
    )
    
    # Log activity
    await log_activity(
        user_id=current_user["user_id"],
        user_email=current_user["email"],
        user_role=current_user["role"],
        action="update",
        entity_type="material",
        entity_id=material_id,
        description=f"Material updated: {material['lot_number']}",
        metadata={"updated_fields": list(update_dict.keys())}
    )
    
    return await get_material(material_id, current_user)


@router.delete("/{material_id}")
async def delete_material(material_id: str, current_user: dict = Depends(require_manufacturer)):
    """Soft delete a material (Manufacturer only)."""
    result = await materials_collection.update_one(
        {
            "id": material_id,
            "manufacturer_id": current_user["user_id"],
            "is_deleted": {"$ne": True}
        },
        {
            "$set": {
                "is_deleted": True,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Material not found or access denied"
        )
    
    return {"message": "Material deleted successfully"}
