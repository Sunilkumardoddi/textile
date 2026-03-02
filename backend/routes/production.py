from fastapi import APIRouter, HTTPException, status, Depends, Query
from datetime import datetime, timezone
from typing import List, Optional
import uuid

from models.production import (
    ProductionLog, ProductionLogCreate, ProductionLogResponse,
    ProductionLogUpdate, ProductionStage, ProductionStatus
)
from utils.auth import get_current_user, require_manufacturer, require_any_authenticated
from utils.database import production_collection, batches_collection, transactions_collection
from utils.activity_logger import log_activity
from utils.alerts import check_quantity_variation_alert

router = APIRouter(prefix="/production", tags=["Production"])


@router.post("/", response_model=ProductionLogResponse, status_code=status.HTTP_201_CREATED)
async def create_production_log(
    production_data: ProductionLogCreate,
    current_user: dict = Depends(require_manufacturer)
):
    """Create a new production log entry (Manufacturer only)."""
    # Verify batch exists and belongs to user
    batch = await batches_collection.find_one({
        "id": production_data.batch_id,
        "manufacturer_id": current_user["user_id"],
        "is_deleted": {"$ne": True}
    })
    
    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Batch not found or access denied"
        )
    
    production = ProductionLog(
        id=str(uuid.uuid4()),
        batch_id=production_data.batch_id,
        manufacturer_id=current_user["user_id"],
        stage=production_data.stage,
        input_quantity=production_data.input_quantity,
        output_quantity=production_data.output_quantity,
        wastage_quantity=production_data.wastage_quantity,
        unit=production_data.unit,
        machine_id=production_data.machine_id,
        operator_name=production_data.operator_name,
        process_parameters=production_data.process_parameters,
        notes=production_data.notes,
        status=ProductionStatus.STARTED,
        start_time=datetime.now(timezone.utc),
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    
    production_dict = production.model_dump()
    production_dict['start_time'] = production_dict['start_time'].isoformat()
    production_dict['created_at'] = production_dict['created_at'].isoformat()
    production_dict['updated_at'] = production_dict['updated_at'].isoformat()
    
    await production_collection.insert_one(production_dict)
    
    # Update batch status
    await batches_collection.update_one(
        {"id": production_data.batch_id},
        {
            "$set": {
                "status": "production",
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    # Create transaction record
    transaction = {
        "id": str(uuid.uuid4()),
        "transaction_number": f"TXN-{datetime.now().strftime('%Y%m%d%H%M%S')}-{str(uuid.uuid4())[:6].upper()}",
        "batch_id": production_data.batch_id,
        "manufacturer_id": current_user["user_id"],
        "transaction_type": "production",
        "quantity": production_data.input_quantity,
        "unit": production_data.unit,
        "reference_id": production.id,
        "status": "pending",
        "notes": f"Production stage: {production_data.stage.value}",
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
        entity_type="production",
        entity_id=production.id,
        description=f"Production log created for batch: {batch['batch_number']}",
        metadata={"batch_id": production_data.batch_id, "stage": production_data.stage.value}
    )
    
    return ProductionLogResponse(
        id=production.id,
        batch_id=production.batch_id,
        manufacturer_id=production.manufacturer_id,
        stage=production.stage,
        status=production.status,
        input_quantity=production.input_quantity,
        output_quantity=production.output_quantity,
        wastage_quantity=production.wastage_quantity,
        unit=production.unit,
        machine_id=production.machine_id,
        operator_name=production.operator_name,
        process_parameters=production.process_parameters,
        quality_score=production.quality_score,
        defect_rate=production.defect_rate,
        yield_percentage=production.yield_percentage,
        start_time=production.start_time,
        end_time=production.end_time,
        duration_minutes=production.duration_minutes,
        notes=production.notes,
        created_at=production.created_at
    )


@router.get("/", response_model=List[ProductionLogResponse])
async def get_production_logs(
    batch_id: Optional[str] = None,
    stage: Optional[ProductionStage] = None,
    status: Optional[ProductionStatus] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: dict = Depends(require_any_authenticated)
):
    """Get production logs based on user role and filters."""
    query = {"is_deleted": {"$ne": True}}
    
    if current_user["role"] == "manufacturer":
        query["manufacturer_id"] = current_user["user_id"]
    
    if batch_id:
        query["batch_id"] = batch_id
    if stage:
        query["stage"] = stage.value
    if status:
        query["status"] = status.value
    
    logs = await production_collection.find(query).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    result = []
    for log in logs:
        start_time = log.get("start_time")
        if isinstance(start_time, str):
            start_time = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
        
        end_time = log.get("end_time")
        if isinstance(end_time, str):
            end_time = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
        
        created_at = log.get("created_at")
        if isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
        
        result.append(ProductionLogResponse(
            id=log["id"],
            batch_id=log["batch_id"],
            manufacturer_id=log["manufacturer_id"],
            stage=log["stage"],
            status=log["status"],
            input_quantity=log["input_quantity"],
            output_quantity=log.get("output_quantity", 0),
            wastage_quantity=log.get("wastage_quantity", 0),
            unit=log["unit"],
            machine_id=log.get("machine_id"),
            operator_name=log.get("operator_name"),
            process_parameters=log.get("process_parameters"),
            quality_score=log.get("quality_score", 0),
            defect_rate=log.get("defect_rate", 0),
            yield_percentage=log.get("yield_percentage", 0),
            start_time=start_time,
            end_time=end_time,
            duration_minutes=log.get("duration_minutes"),
            notes=log.get("notes"),
            created_at=created_at
        ))
    
    return result


@router.get("/{production_id}", response_model=ProductionLogResponse)
async def get_production_log(production_id: str, current_user: dict = Depends(require_any_authenticated)):
    """Get production log by ID."""
    query = {"id": production_id, "is_deleted": {"$ne": True}}
    
    if current_user["role"] == "manufacturer":
        query["manufacturer_id"] = current_user["user_id"]
    
    log = await production_collection.find_one(query)
    
    if not log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Production log not found"
        )
    
    start_time = log.get("start_time")
    if isinstance(start_time, str):
        start_time = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
    
    end_time = log.get("end_time")
    if isinstance(end_time, str):
        end_time = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
    
    created_at = log.get("created_at")
    if isinstance(created_at, str):
        created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
    
    return ProductionLogResponse(
        id=log["id"],
        batch_id=log["batch_id"],
        manufacturer_id=log["manufacturer_id"],
        stage=log["stage"],
        status=log["status"],
        input_quantity=log["input_quantity"],
        output_quantity=log.get("output_quantity", 0),
        wastage_quantity=log.get("wastage_quantity", 0),
        unit=log["unit"],
        machine_id=log.get("machine_id"),
        operator_name=log.get("operator_name"),
        process_parameters=log.get("process_parameters"),
        quality_score=log.get("quality_score", 0),
        defect_rate=log.get("defect_rate", 0),
        yield_percentage=log.get("yield_percentage", 0),
        start_time=start_time,
        end_time=end_time,
        duration_minutes=log.get("duration_minutes"),
        notes=log.get("notes"),
        created_at=created_at
    )


@router.put("/{production_id}", response_model=ProductionLogResponse)
async def update_production_log(
    production_id: str,
    update_data: ProductionLogUpdate,
    current_user: dict = Depends(require_manufacturer)
):
    """Update production log (Manufacturer only)."""
    log = await production_collection.find_one({
        "id": production_id,
        "manufacturer_id": current_user["user_id"],
        "is_deleted": {"$ne": True}
    })
    
    if not log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Production log not found or access denied"
        )
    
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    
    if not update_dict:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    # Calculate yield percentage if output is updated
    if "output_quantity" in update_dict:
        input_qty = log.get("input_quantity", 0)
        output_qty = update_dict["output_quantity"]
        wastage_qty = update_dict.get("wastage_quantity", log.get("wastage_quantity", 0))
        
        if input_qty > 0:
            update_dict["yield_percentage"] = round((output_qty / input_qty) * 100, 2)
        
        # Check for suspicious quantity variation
        await check_quantity_variation_alert(log["batch_id"], input_qty, output_qty)
    
    # Set end time and duration if status is completed
    if update_dict.get("status") == "completed":
        update_dict["end_time"] = datetime.now(timezone.utc).isoformat()
        start_time = log.get("start_time")
        if isinstance(start_time, str):
            start_time = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
        if start_time:
            duration = datetime.now(timezone.utc) - start_time
            update_dict["duration_minutes"] = int(duration.total_seconds() / 60)
    
    update_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await production_collection.update_one(
        {"id": production_id},
        {"$set": update_dict}
    )
    
    # Log activity
    await log_activity(
        user_id=current_user["user_id"],
        user_email=current_user["email"],
        user_role=current_user["role"],
        action="update",
        entity_type="production",
        entity_id=production_id,
        description=f"Production log updated",
        metadata={"updated_fields": list(update_dict.keys())}
    )
    
    return await get_production_log(production_id, current_user)


@router.post("/{production_id}/complete", response_model=ProductionLogResponse)
async def complete_production(
    production_id: str,
    output_quantity: float,
    wastage_quantity: float = 0,
    quality_score: float = 0,
    defect_rate: float = 0,
    current_user: dict = Depends(require_manufacturer)
):
    """Complete a production stage (Manufacturer only)."""
    log = await production_collection.find_one({
        "id": production_id,
        "manufacturer_id": current_user["user_id"],
        "is_deleted": {"$ne": True}
    })
    
    if not log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Production log not found or access denied"
        )
    
    input_qty = log.get("input_quantity", 0)
    yield_percentage = round((output_quantity / input_qty) * 100, 2) if input_qty > 0 else 0
    
    start_time = log.get("start_time")
    if isinstance(start_time, str):
        start_time = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
    
    duration_minutes = None
    if start_time:
        duration = datetime.now(timezone.utc) - start_time
        duration_minutes = int(duration.total_seconds() / 60)
    
    update_dict = {
        "status": "completed",
        "output_quantity": output_quantity,
        "wastage_quantity": wastage_quantity,
        "quality_score": quality_score,
        "defect_rate": defect_rate,
        "yield_percentage": yield_percentage,
        "end_time": datetime.now(timezone.utc).isoformat(),
        "duration_minutes": duration_minutes,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await production_collection.update_one(
        {"id": production_id},
        {"$set": update_dict}
    )
    
    # Update batch with production output
    batch = await batches_collection.find_one({"id": log["batch_id"]})
    if batch:
        new_output = batch.get("output_quantity", 0) + output_quantity
        new_wastage = batch.get("wastage_quantity", 0) + wastage_quantity
        new_balance = batch.get("input_quantity", 0) - new_output - new_wastage
        
        await batches_collection.update_one(
            {"id": log["batch_id"]},
            {
                "$set": {
                    "output_quantity": new_output,
                    "wastage_quantity": new_wastage,
                    "balance_quantity": new_balance,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
    
    # Log activity
    await log_activity(
        user_id=current_user["user_id"],
        user_email=current_user["email"],
        user_role=current_user["role"],
        action="update",
        entity_type="production",
        entity_id=production_id,
        description=f"Production stage completed with {yield_percentage}% yield",
        metadata={"output_quantity": output_quantity, "yield_percentage": yield_percentage}
    )
    
    return await get_production_log(production_id, current_user)
