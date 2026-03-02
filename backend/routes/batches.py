from fastapi import APIRouter, HTTPException, status, Depends, Query
from datetime import datetime, timezone
from typing import List, Optional
import uuid

from models.batch import (
    Batch, BatchCreate, BatchResponse, BatchUpdate, BatchStatus, MaterialType
)
from utils.auth import get_current_user, require_manufacturer, require_any_authenticated
from utils.database import batches_collection, transactions_collection
from utils.activity_logger import log_activity
from utils.alerts import check_material_balance_alert, check_quantity_variation_alert

router = APIRouter(prefix="/batches", tags=["Batches"])


@router.post("/", response_model=BatchResponse, status_code=status.HTTP_201_CREATED)
async def create_batch(
    batch_data: BatchCreate,
    current_user: dict = Depends(require_manufacturer)
):
    """Create a new batch (Manufacturer only)."""
    # Generate unique batch number
    batch_number = f"BTH-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"
    
    # Check for duplicate batch number
    existing = await batches_collection.find_one({"batch_number": batch_number})
    if existing:
        batch_number = f"BTH-{datetime.now().strftime('%Y%m%d%H%M%S')}-{str(uuid.uuid4())[:4].upper()}"
    
    batch = Batch(
        id=str(uuid.uuid4()),
        batch_number=batch_number,
        product_name=batch_data.product_name,
        material_type=batch_data.material_type,
        quantity=batch_data.quantity,
        unit=batch_data.unit,
        description=batch_data.description,
        parent_batch_id=batch_data.parent_batch_id,
        manufacturer_id=current_user["user_id"],
        input_quantity=batch_data.quantity,
        balance_quantity=batch_data.quantity,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    
    batch_dict = batch.model_dump()
    batch_dict['created_at'] = batch_dict['created_at'].isoformat()
    batch_dict['updated_at'] = batch_dict['updated_at'].isoformat()
    
    await batches_collection.insert_one(batch_dict)
    
    # If parent batch exists, update its child_batch_ids
    if batch_data.parent_batch_id:
        await batches_collection.update_one(
            {"id": batch_data.parent_batch_id},
            {"$push": {"child_batch_ids": batch.id}}
        )
    
    # Create transaction record
    transaction = {
        "id": str(uuid.uuid4()),
        "transaction_number": f"TXN-{datetime.now().strftime('%Y%m%d%H%M%S')}-{str(uuid.uuid4())[:6].upper()}",
        "batch_id": batch.id,
        "manufacturer_id": current_user["user_id"],
        "transaction_type": "material_inward",
        "quantity": batch_data.quantity,
        "unit": batch_data.unit,
        "status": "verified",
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
        entity_type="batch",
        entity_id=batch.id,
        description=f"Batch created: {batch_number}",
        metadata={"batch_number": batch_number, "quantity": batch_data.quantity}
    )
    
    return BatchResponse(
        id=batch.id,
        batch_number=batch.batch_number,
        product_name=batch.product_name,
        material_type=batch.material_type,
        quantity=batch.quantity,
        unit=batch.unit,
        description=batch.description,
        manufacturer_id=batch.manufacturer_id,
        brand_id=batch.brand_id,
        status=batch.status,
        input_quantity=batch.input_quantity,
        output_quantity=batch.output_quantity,
        wastage_quantity=batch.wastage_quantity,
        balance_quantity=batch.balance_quantity,
        parent_batch_id=batch.parent_batch_id,
        child_batch_ids=batch.child_batch_ids,
        compliance_score=batch.compliance_score,
        certifications=batch.certifications,
        created_at=batch.created_at,
        updated_at=batch.updated_at,
        completed_at=batch.completed_at
    )


@router.get("/", response_model=List[BatchResponse])
async def get_batches(
    status: Optional[BatchStatus] = None,
    material_type: Optional[MaterialType] = None,
    manufacturer_id: Optional[str] = None,
    brand_id: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: dict = Depends(require_any_authenticated)
):
    """Get batches based on user role and filters."""
    query = {"is_deleted": {"$ne": True}}
    
    # Role-based filtering
    if current_user["role"] == "manufacturer":
        query["manufacturer_id"] = current_user["user_id"]
    elif current_user["role"] == "brand":
        query["brand_id"] = current_user["user_id"]
    elif manufacturer_id:
        query["manufacturer_id"] = manufacturer_id
    
    if status:
        query["status"] = status.value
    if material_type:
        query["material_type"] = material_type.value
    if brand_id and current_user["role"] in ["admin", "auditor"]:
        query["brand_id"] = brand_id
    
    batches = await batches_collection.find(query).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    result = []
    for b in batches:
        created_at = b.get("created_at")
        if isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
        
        updated_at = b.get("updated_at")
        if isinstance(updated_at, str):
            updated_at = datetime.fromisoformat(updated_at.replace('Z', '+00:00'))
        
        completed_at = b.get("completed_at")
        if isinstance(completed_at, str):
            completed_at = datetime.fromisoformat(completed_at.replace('Z', '+00:00'))
        
        result.append(BatchResponse(
            id=b["id"],
            batch_number=b["batch_number"],
            product_name=b["product_name"],
            material_type=b["material_type"],
            quantity=b["quantity"],
            unit=b["unit"],
            description=b.get("description"),
            manufacturer_id=b["manufacturer_id"],
            brand_id=b.get("brand_id"),
            status=b["status"],
            input_quantity=b.get("input_quantity", 0),
            output_quantity=b.get("output_quantity", 0),
            wastage_quantity=b.get("wastage_quantity", 0),
            balance_quantity=b.get("balance_quantity", 0),
            parent_batch_id=b.get("parent_batch_id"),
            child_batch_ids=b.get("child_batch_ids", []),
            compliance_score=b.get("compliance_score", 0),
            certifications=b.get("certifications", []),
            created_at=created_at,
            updated_at=updated_at,
            completed_at=completed_at
        ))
    
    return result


@router.get("/stats")
async def get_batch_stats(current_user: dict = Depends(require_any_authenticated)):
    """Get batch statistics."""
    query = {"is_deleted": {"$ne": True}}
    
    if current_user["role"] == "manufacturer":
        query["manufacturer_id"] = current_user["user_id"]
    elif current_user["role"] == "brand":
        query["brand_id"] = current_user["user_id"]
    
    pipeline = [
        {"$match": query},
        {"$group": {
            "_id": "$status",
            "count": {"$sum": 1},
            "total_quantity": {"$sum": "$quantity"}
        }}
    ]
    
    results = await batches_collection.aggregate(pipeline).to_list(100)
    
    stats = {
        "total_batches": 0,
        "by_status": {},
        "total_quantity": 0
    }
    
    for r in results:
        stats["by_status"][r["_id"]] = {
            "count": r["count"],
            "quantity": r["total_quantity"]
        }
        stats["total_batches"] += r["count"]
        stats["total_quantity"] += r["total_quantity"]
    
    return stats


@router.get("/{batch_id}", response_model=BatchResponse)
async def get_batch(batch_id: str, current_user: dict = Depends(require_any_authenticated)):
    """Get batch by ID."""
    query = {"id": batch_id, "is_deleted": {"$ne": True}}
    
    # Role-based access
    if current_user["role"] == "manufacturer":
        query["manufacturer_id"] = current_user["user_id"]
    elif current_user["role"] == "brand":
        query["brand_id"] = current_user["user_id"]
    
    batch = await batches_collection.find_one(query)
    
    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Batch not found"
        )
    
    created_at = batch.get("created_at")
    if isinstance(created_at, str):
        created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
    
    updated_at = batch.get("updated_at")
    if isinstance(updated_at, str):
        updated_at = datetime.fromisoformat(updated_at.replace('Z', '+00:00'))
    
    completed_at = batch.get("completed_at")
    if isinstance(completed_at, str):
        completed_at = datetime.fromisoformat(completed_at.replace('Z', '+00:00'))
    
    return BatchResponse(
        id=batch["id"],
        batch_number=batch["batch_number"],
        product_name=batch["product_name"],
        material_type=batch["material_type"],
        quantity=batch["quantity"],
        unit=batch["unit"],
        description=batch.get("description"),
        manufacturer_id=batch["manufacturer_id"],
        brand_id=batch.get("brand_id"),
        status=batch["status"],
        input_quantity=batch.get("input_quantity", 0),
        output_quantity=batch.get("output_quantity", 0),
        wastage_quantity=batch.get("wastage_quantity", 0),
        balance_quantity=batch.get("balance_quantity", 0),
        parent_batch_id=batch.get("parent_batch_id"),
        child_batch_ids=batch.get("child_batch_ids", []),
        compliance_score=batch.get("compliance_score", 0),
        certifications=batch.get("certifications", []),
        created_at=created_at,
        updated_at=updated_at,
        completed_at=completed_at
    )


@router.put("/{batch_id}", response_model=BatchResponse)
async def update_batch(
    batch_id: str,
    update_data: BatchUpdate,
    current_user: dict = Depends(require_manufacturer)
):
    """Update batch (Manufacturer only)."""
    # Verify ownership
    batch = await batches_collection.find_one({
        "id": batch_id,
        "manufacturer_id": current_user["user_id"],
        "is_deleted": {"$ne": True}
    })
    
    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Batch not found or access denied"
        )
    
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    
    if not update_dict:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    # Calculate balance if output/wastage updated
    if "output_quantity" in update_dict or "wastage_quantity" in update_dict:
        input_qty = batch.get("input_quantity", 0)
        output_qty = update_dict.get("output_quantity", batch.get("output_quantity", 0))
        wastage_qty = update_dict.get("wastage_quantity", batch.get("wastage_quantity", 0))
        update_dict["balance_quantity"] = input_qty - output_qty - wastage_qty
        
        # Check for material balance alerts
        await check_material_balance_alert(batch_id, input_qty, output_qty, wastage_qty)
    
    update_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await batches_collection.update_one(
        {"id": batch_id},
        {"$set": update_dict}
    )
    
    # Log activity
    await log_activity(
        user_id=current_user["user_id"],
        user_email=current_user["email"],
        user_role=current_user["role"],
        action="update",
        entity_type="batch",
        entity_id=batch_id,
        description=f"Batch updated: {batch['batch_number']}",
        metadata={"updated_fields": list(update_dict.keys())}
    )
    
    return await get_batch(batch_id, current_user)


@router.get("/{batch_id}/traceability")
async def get_batch_traceability(batch_id: str, current_user: dict = Depends(require_any_authenticated)):
    """Get full traceability chain for a batch."""
    batch = await batches_collection.find_one({"id": batch_id, "is_deleted": {"$ne": True}})
    
    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Batch not found"
        )
    
    # Get parent chain
    parent_chain = []
    current_parent_id = batch.get("parent_batch_id")
    while current_parent_id:
        parent = await batches_collection.find_one({"id": current_parent_id})
        if parent:
            parent_chain.append({
                "id": parent["id"],
                "batch_number": parent["batch_number"],
                "product_name": parent["product_name"],
                "quantity": parent["quantity"],
                "status": parent["status"]
            })
            current_parent_id = parent.get("parent_batch_id")
        else:
            break
    
    # Get child batches
    child_batches = []
    for child_id in batch.get("child_batch_ids", []):
        child = await batches_collection.find_one({"id": child_id})
        if child:
            child_batches.append({
                "id": child["id"],
                "batch_number": child["batch_number"],
                "product_name": child["product_name"],
                "quantity": child["quantity"],
                "status": child["status"]
            })
    
    # Get transactions
    transactions = await transactions_collection.find(
        {"batch_id": batch_id, "is_deleted": {"$ne": True}}
    ).sort("created_at", 1).to_list(100)
    
    return {
        "batch": {
            "id": batch["id"],
            "batch_number": batch["batch_number"],
            "product_name": batch["product_name"],
            "material_type": batch["material_type"],
            "quantity": batch["quantity"],
            "status": batch["status"],
            "input_quantity": batch.get("input_quantity", 0),
            "output_quantity": batch.get("output_quantity", 0),
            "wastage_quantity": batch.get("wastage_quantity", 0),
            "balance_quantity": batch.get("balance_quantity", 0)
        },
        "parent_chain": list(reversed(parent_chain)),
        "child_batches": child_batches,
        "transactions": [{
            "id": t["id"],
            "transaction_number": t["transaction_number"],
            "type": t["transaction_type"],
            "quantity": t["quantity"],
            "status": t["status"],
            "created_at": t["created_at"]
        } for t in transactions]
    }


@router.delete("/{batch_id}")
async def delete_batch(batch_id: str, current_user: dict = Depends(require_manufacturer)):
    """Soft delete a batch (Manufacturer only)."""
    result = await batches_collection.update_one(
        {
            "id": batch_id,
            "manufacturer_id": current_user["user_id"],
            "is_deleted": {"$ne": True}
        },
        {
            "$set": {
                "is_deleted": True,
                "deleted_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Batch not found or access denied"
        )
    
    # Log activity
    await log_activity(
        user_id=current_user["user_id"],
        user_email=current_user["email"],
        user_role=current_user["role"],
        action="delete",
        entity_type="batch",
        entity_id=batch_id,
        description=f"Batch deleted: {batch_id}"
    )
    
    return {"message": "Batch deleted successfully"}
