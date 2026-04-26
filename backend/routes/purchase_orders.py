from fastapi import APIRouter, HTTPException, status, Depends, Query, BackgroundTasks
from datetime import datetime, timezone
from typing import List, Optional
import uuid

from models.purchase_order import (
    PurchaseOrder, PurchaseOrderCreate, PurchaseOrderResponse,
    PurchaseOrderUpdate, POStatus, POPriority, POStatusLog
)
from utils.auth import get_current_user, require_admin, require_any_authenticated, require_brand
from utils.database import db
from utils.activity_logger import log_activity
from utils.alerts import create_alert
from utils.notification_service import notify_event
from models.notification import NotificationEvent, NotificationPriority

router = APIRouter(prefix="/purchase-orders", tags=["Purchase Orders"])

# Collections
pos_collection = db.purchase_orders
suppliers_collection = db.suppliers
users_collection = db.users
po_logs_collection = db.po_status_logs
seasons_collection = db.seasons


async def log_po_status_change(po_id: str, po_number: str, prev_status: str, new_status: str, user_id: str, user_role: str, notes: str = None):
    """Log PO status change."""
    log = POStatusLog(
        id=str(uuid.uuid4()),
        po_id=po_id,
        po_number=po_number,
        previous_status=prev_status,
        new_status=new_status,
        changed_by=user_id,
        changed_by_role=user_role,
        notes=notes,
        created_at=datetime.now(timezone.utc)
    )
    log_dict = log.model_dump()
    log_dict['created_at'] = log_dict['created_at'].isoformat()
    await po_logs_collection.insert_one(log_dict)


@router.post("/", response_model=PurchaseOrderResponse, status_code=status.HTTP_201_CREATED)
async def create_purchase_order(
    po_data: PurchaseOrderCreate,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(require_brand)
):
    """Create a new purchase order (Brand only)."""
    # Validate supplier exists and is active
    supplier = await suppliers_collection.find_one({
        "$or": [{"id": po_data.supplier_id}, {"supplier_id": po_data.supplier_id}],
        "is_deleted": {"$ne": True}
    })
    
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    if supplier.get("status") != "active":
        raise HTTPException(status_code=400, detail="Supplier is not active. Cannot create PO.")
    
    if supplier.get("is_locked"):
        raise HTTPException(status_code=400, detail="Supplier is locked. Cannot create PO.")
    
    # Get brand info
    brand = await users_collection.find_one({"id": current_user["user_id"]})
    brand_name = brand.get("company_name", brand.get("name", "Unknown")) if brand else "Unknown"
    
    # Get season info if provided
    season_code = ""
    if po_data.season_id:
        season = await seasons_collection.find_one({"id": po_data.season_id}, {"_id": 0})
        if season:
            season_code = season.get("season_code", "")
    
    # Generate PO number
    po_number = f"PO-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:6].upper()}"
    
    # Calculate totals
    subtotal = sum(item.quantity * item.unit_price for item in po_data.line_items)
    for item in po_data.line_items:
        item.total_price = item.quantity * item.unit_price
    
    po = PurchaseOrder(
        id=str(uuid.uuid4()),
        po_number=po_number,
        brand_id=current_user["user_id"],
        brand_name=brand_name,
        supplier_id=supplier["id"],
        supplier_name=supplier["company_name"],
        season_id=po_data.season_id,
        season_code=season_code,
        line_items=po_data.line_items,
        delivery_date=po_data.delivery_date,
        delivery_address=po_data.delivery_address,
        priority=po_data.priority,
        payment_terms=po_data.payment_terms,
        shipping_terms=po_data.shipping_terms,
        notes=po_data.notes,
        status=POStatus.AWAITING_ACCEPTANCE,
        subtotal=subtotal,
        total_amount=subtotal,  # Add tax calculation if needed
        status_history=[{
            "status": "awaiting_acceptance",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "changed_by": current_user["user_id"],
            "notes": "PO Created"
        }],
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    
    po_dict = po.model_dump()
    po_dict['created_at'] = po_dict['created_at'].isoformat()
    po_dict['updated_at'] = po_dict['updated_at'].isoformat()
    po_dict['delivery_date'] = po_dict['delivery_date'].isoformat()
    po_dict['status'] = po_dict['status'].value if hasattr(po_dict['status'], 'value') else po_dict['status']
    po_dict['priority'] = po_dict['priority'].value if hasattr(po_dict['priority'], 'value') else po_dict['priority']
    po_dict['line_items'] = [item.model_dump() if hasattr(item, 'model_dump') else item for item in po_dict['line_items']]
    
    await pos_collection.insert_one(po_dict)
    
    # Update supplier PO count
    await suppliers_collection.update_one(
        {"id": supplier["id"]},
        {"$inc": {"total_pos": 1}}
    )
    
    # Log status change
    await log_po_status_change(po.id, po_number, None, "awaiting_acceptance", current_user["user_id"], current_user["role"], "PO Created by Brand")
    
    # Log activity
    await log_activity(
        user_id=current_user["user_id"],
        user_email=current_user["email"],
        user_role=current_user["role"],
        action="create",
        entity_type="purchase_order",
        entity_id=po.id,
        description=f"PO created: {po_number} for supplier {supplier['company_name']}",
        metadata={"po_number": po_number, "supplier_id": supplier["id"], "total_amount": subtotal}
    )

    # Notify supplier's manufacturer user
    supplier_user = await users_collection.find_one({"id": supplier.get("user_id")})
    if supplier_user:
        background_tasks.add_task(
            notify_event,
            NotificationEvent.PO_CREATED,
            f"New Purchase Order: {po_number}",
            f"{brand_name} has sent you a new PO for {po_data.product_name or 'goods'} worth {po.currency} {subtotal:,.2f}. Please review and accept.",
            [supplier_user["id"]],
            NotificationPriority.HIGH,
            {"po_id": po.id, "po_number": po_number},
        )

    return PurchaseOrderResponse(
        id=po.id,
        po_number=po.po_number,
        brand_id=po.brand_id,
        brand_name=po.brand_name,
        supplier_id=po.supplier_id,
        supplier_name=po.supplier_name,
        line_items=po.line_items,
        delivery_date=po.delivery_date,
        delivery_address=po.delivery_address,
        priority=po.priority,
        status=po.status,
        subtotal=po.subtotal,
        tax_amount=po.tax_amount,
        total_amount=po.total_amount,
        currency=po.currency,
        payment_terms=po.payment_terms,
        shipping_terms=po.shipping_terms,
        notes=po.notes,
        accepted_at=po.accepted_at,
        rejected_at=po.rejected_at,
        rejection_reason=po.rejection_reason,
        shipped_at=po.shipped_at,
        delivered_at=po.delivered_at,
        is_locked=po.is_locked,
        created_at=po.created_at
    )


@router.get("/", response_model=List[PurchaseOrderResponse])
async def get_purchase_orders(
    status: Optional[POStatus] = None,
    priority: Optional[POPriority] = None,
    supplier_id: Optional[str] = None,
    season_id: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: dict = Depends(require_any_authenticated)
):
    """Get purchase orders based on user role."""
    query = {"is_deleted": {"$ne": True}}
    
    # Role-based filtering
    if current_user["role"] == "brand":
        query["brand_id"] = current_user["user_id"]
    elif current_user["role"] == "manufacturer":
        # Manufacturers act as suppliers - get POs assigned to their supplier profile
        supplier = await suppliers_collection.find_one({"user_id": current_user["user_id"]})
        if supplier:
            query["supplier_id"] = {"$in": [supplier["id"], supplier["supplier_id"]]}
        else:
            return []  # No supplier profile linked
    
    # Apply filters
    if status:
        query["status"] = status.value
    if priority:
        query["priority"] = priority.value
    if supplier_id and current_user["role"] in ["admin", "brand", "auditor"]:
        query["supplier_id"] = supplier_id
    if season_id:
        query["season_id"] = season_id
    
    pos = await pos_collection.find(query).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    result = []
    for po in pos:
        created_at = po.get("created_at")
        if isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
        
        delivery_date = po.get("delivery_date")
        if isinstance(delivery_date, str):
            delivery_date = datetime.fromisoformat(delivery_date.replace('Z', '+00:00'))
        
        accepted_at = po.get("accepted_at")
        if isinstance(accepted_at, str):
            accepted_at = datetime.fromisoformat(accepted_at.replace('Z', '+00:00'))
        
        rejected_at = po.get("rejected_at")
        if isinstance(rejected_at, str):
            rejected_at = datetime.fromisoformat(rejected_at.replace('Z', '+00:00'))
        
        shipped_at = po.get("shipped_at")
        if isinstance(shipped_at, str):
            shipped_at = datetime.fromisoformat(shipped_at.replace('Z', '+00:00'))
        
        delivered_at = po.get("delivered_at")
        if isinstance(delivered_at, str):
            delivered_at = datetime.fromisoformat(delivered_at.replace('Z', '+00:00'))
        
        result.append(PurchaseOrderResponse(
            id=po["id"],
            po_number=po["po_number"],
            brand_id=po["brand_id"],
            brand_name=po.get("brand_name", ""),
            supplier_id=po["supplier_id"],
            supplier_name=po.get("supplier_name", ""),
            season_id=po.get("season_id"),
            season_code=po.get("season_code", ""),
            line_items=po.get("line_items", []),
            delivery_date=delivery_date,
            delivery_address=po["delivery_address"],
            priority=po.get("priority", "normal"),
            status=po["status"],
            subtotal=po.get("subtotal", 0),
            tax_amount=po.get("tax_amount", 0),
            total_amount=po.get("total_amount", 0),
            currency=po.get("currency", "USD"),
            payment_terms=po.get("payment_terms"),
            shipping_terms=po.get("shipping_terms"),
            notes=po.get("notes"),
            accepted_at=accepted_at,
            rejected_at=rejected_at,
            rejection_reason=po.get("rejection_reason"),
            shipped_at=shipped_at,
            delivered_at=delivered_at,
            is_locked=po.get("is_locked", False),
            created_at=created_at
        ))
    
    return result


@router.get("/stats")
async def get_po_stats(current_user: dict = Depends(require_any_authenticated)):
    """Get PO statistics."""
    query = {"is_deleted": {"$ne": True}}
    
    if current_user["role"] == "brand":
        query["brand_id"] = current_user["user_id"]
    elif current_user["role"] == "manufacturer":
        # Manufacturers act as suppliers
        supplier = await suppliers_collection.find_one({"user_id": current_user["user_id"]})
        if supplier:
            query["supplier_id"] = {"$in": [supplier["id"], supplier["supplier_id"]]}
        else:
            return {"total_pos": 0, "by_status": {}}
    
    pipeline = [
        {"$match": query},
        {"$group": {
            "_id": "$status",
            "count": {"$sum": 1},
            "total_value": {"$sum": "$total_amount"}
        }}
    ]
    
    results = await pos_collection.aggregate(pipeline).to_list(20)
    
    total_pos = sum(r["count"] for r in results)
    total_value = sum(r["total_value"] for r in results)
    
    return {
        "total_pos": total_pos,
        "total_value": total_value,
        "by_status": {r["_id"]: {"count": r["count"], "value": r["total_value"]} for r in results}
    }


@router.get("/{po_id}", response_model=PurchaseOrderResponse)
async def get_purchase_order(po_id: str, current_user: dict = Depends(require_any_authenticated)):
    """Get PO by ID."""
    query = {"$or": [{"id": po_id}, {"po_number": po_id}], "is_deleted": {"$ne": True}}
    
    # Role-based access
    if current_user["role"] == "brand":
        query["brand_id"] = current_user["user_id"]
    elif current_user["role"] == "manufacturer":
        # Manufacturers act as suppliers
        supplier = await suppliers_collection.find_one({"user_id": current_user["user_id"]})
        if supplier:
            query["supplier_id"] = {"$in": [supplier["id"], supplier["supplier_id"]]}
        else:
            raise HTTPException(status_code=404, detail="PO not found")
    
    po = await pos_collection.find_one(query)
    
    if not po:
        raise HTTPException(status_code=404, detail="PO not found")
    
    created_at = po.get("created_at")
    if isinstance(created_at, str):
        created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
    
    delivery_date = po.get("delivery_date")
    if isinstance(delivery_date, str):
        delivery_date = datetime.fromisoformat(delivery_date.replace('Z', '+00:00'))
    
    return PurchaseOrderResponse(
        id=po["id"],
        po_number=po["po_number"],
        brand_id=po["brand_id"],
        brand_name=po.get("brand_name", ""),
        supplier_id=po["supplier_id"],
        supplier_name=po.get("supplier_name", ""),
        line_items=po.get("line_items", []),
        delivery_date=delivery_date,
        delivery_address=po["delivery_address"],
        priority=po.get("priority", "normal"),
        status=po["status"],
        subtotal=po.get("subtotal", 0),
        tax_amount=po.get("tax_amount", 0),
        total_amount=po.get("total_amount", 0),
        currency=po.get("currency", "USD"),
        payment_terms=po.get("payment_terms"),
        shipping_terms=po.get("shipping_terms"),
        notes=po.get("notes"),
        accepted_at=po.get("accepted_at"),
        rejected_at=po.get("rejected_at"),
        rejection_reason=po.get("rejection_reason"),
        shipped_at=po.get("shipped_at"),
        delivered_at=po.get("delivered_at"),
        is_locked=po.get("is_locked", False),
        created_at=created_at
    )


@router.post("/{po_id}/accept")
async def accept_po(po_id: str, background_tasks: BackgroundTasks, current_user: dict = Depends(require_any_authenticated)):
    """Accept a PO (Manufacturer/Supplier only)."""
    if current_user["role"] not in ["manufacturer", "admin"]:
        raise HTTPException(status_code=403, detail="Only manufacturers can accept POs")
    
    # Find the PO
    po = await pos_collection.find_one({
        "$or": [{"id": po_id}, {"po_number": po_id}],
        "status": "awaiting_acceptance",
        "is_deleted": {"$ne": True}
    })
    
    if not po:
        raise HTTPException(status_code=404, detail="PO not found or cannot be accepted")
    
    # Verify supplier ownership if not admin
    if current_user["role"] == "manufacturer":
        supplier = await suppliers_collection.find_one({"user_id": current_user["user_id"]})
        if not supplier or po["supplier_id"] not in [supplier["id"], supplier["supplier_id"]]:
            raise HTTPException(status_code=403, detail="Not authorized to accept this PO")
    
    await pos_collection.update_one(
        {"id": po["id"]},
        {
            "$set": {
                "status": "accepted",
                "accepted_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            },
            "$push": {
                "status_history": {
                    "status": "accepted",
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "changed_by": current_user["user_id"],
                    "notes": "PO Accepted by Manufacturer"
                }
            }
        }
    )
    
    await log_po_status_change(po["id"], po["po_number"], "awaiting_acceptance", "accepted", current_user["user_id"], current_user["role"], "PO Accepted")
    
    await log_activity(
        user_id=current_user["user_id"],
        user_email=current_user["email"],
        user_role=current_user["role"],
        action="update",
        entity_type="purchase_order",
        entity_id=po["id"],
        description=f"PO accepted: {po['po_number']}"
    )

    # Notify brand user
    brand_user = await users_collection.find_one({"id": po.get("brand_id")})
    if brand_user:
        background_tasks.add_task(
            notify_event,
            NotificationEvent.PO_ACCEPTED,
            f"PO Accepted: {po['po_number']}",
            f"Your purchase order {po['po_number']} has been accepted by the manufacturer and is now in progress.",
            [brand_user["id"]],
            NotificationPriority.MEDIUM,
            {"po_id": po["id"], "po_number": po["po_number"]},
        )

    return {"message": f"PO {po['po_number']} accepted successfully"}


@router.post("/{po_id}/reject")
async def reject_po(po_id: str, reason: str, background_tasks: BackgroundTasks, current_user: dict = Depends(require_any_authenticated)):
    """Reject a PO (Manufacturer/Supplier only)."""
    if current_user["role"] not in ["manufacturer", "admin"]:
        raise HTTPException(status_code=403, detail="Only manufacturers can reject POs")
    
    po = await pos_collection.find_one({
        "$or": [{"id": po_id}, {"po_number": po_id}],
        "status": "awaiting_acceptance",
        "is_deleted": {"$ne": True}
    })
    
    if not po:
        raise HTTPException(status_code=404, detail="PO not found or cannot be rejected")
    
    # Verify supplier ownership if not admin
    if current_user["role"] == "manufacturer":
        supplier = await suppliers_collection.find_one({"user_id": current_user["user_id"]})
        if not supplier or po["supplier_id"] not in [supplier["id"], supplier["supplier_id"]]:
            raise HTTPException(status_code=403, detail="Not authorized to reject this PO")
    
    await pos_collection.update_one(
        {"id": po["id"]},
        {
            "$set": {
                "status": "rejected",
                "rejected_at": datetime.now(timezone.utc).isoformat(),
                "rejection_reason": reason,
                "updated_at": datetime.now(timezone.utc).isoformat()
            },
            "$push": {
                "status_history": {
                    "status": "rejected",
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "changed_by": current_user["user_id"],
                    "notes": f"PO Rejected: {reason}"
                }
            }
        }
    )
    
    await log_po_status_change(po["id"], po["po_number"], "awaiting_acceptance", "rejected", current_user["user_id"], current_user["role"], f"Rejected: {reason}")

    # Notify brand user
    brand_user = await users_collection.find_one({"id": po.get("brand_id")})
    if brand_user:
        background_tasks.add_task(
            notify_event,
            NotificationEvent.PO_REJECTED,
            f"PO Rejected: {po['po_number']}",
            f"Your purchase order {po['po_number']} was rejected. Reason: {reason}",
            [brand_user["id"]],
            NotificationPriority.HIGH,
            {"po_id": po["id"], "po_number": po["po_number"], "reason": reason},
        )

    return {"message": f"PO {po['po_number']} rejected", "reason": reason}


@router.post("/{po_id}/status")
async def update_po_status(
    po_id: str,
    new_status: POStatus,
    notes: Optional[str] = None,
    current_user: dict = Depends(require_any_authenticated)
):
    """Update PO status."""
    po = await pos_collection.find_one({
        "$or": [{"id": po_id}, {"po_number": po_id}],
        "is_deleted": {"$ne": True}
    })
    
    if not po:
        raise HTTPException(status_code=404, detail="PO not found")
    
    if po.get("is_locked") and current_user["role"] != "admin":
        raise HTTPException(status_code=400, detail="PO is locked. Contact admin.")
    
    old_status = po["status"]
    
    update_dict = {
        "status": new_status.value,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Set timestamps based on status
    if new_status == POStatus.SHIPPED:
        update_dict["shipped_at"] = datetime.now(timezone.utc).isoformat()
    elif new_status == POStatus.DELIVERED:
        update_dict["delivered_at"] = datetime.now(timezone.utc).isoformat()
    elif new_status == POStatus.COMPLETED:
        update_dict["completed_at"] = datetime.now(timezone.utc).isoformat()
        # Update supplier completed PO count
        await suppliers_collection.update_one(
            {"id": po["supplier_id"]},
            {"$inc": {"completed_pos": 1}}
        )
    
    await pos_collection.update_one(
        {"id": po["id"]},
        {
            "$set": update_dict,
            "$push": {
                "status_history": {
                    "status": new_status.value,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "changed_by": current_user["user_id"],
                    "notes": notes
                }
            }
        }
    )
    
    await log_po_status_change(po["id"], po["po_number"], old_status, new_status.value, current_user["user_id"], current_user["role"], notes)
    
    return {"message": f"PO status updated to {new_status.value}"}


@router.post("/{po_id}/lock")
async def lock_po(po_id: str, current_user: dict = Depends(require_admin)):
    """Lock a PO before audit (Admin only)."""
    result = await pos_collection.update_one(
        {"$or": [{"id": po_id}, {"po_number": po_id}], "is_deleted": {"$ne": True}},
        {
            "$set": {
                "is_locked": True,
                "locked_by": current_user["user_id"],
                "locked_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="PO not found")
    
    return {"message": "PO locked successfully"}


@router.post("/{po_id}/unlock")
async def unlock_po(po_id: str, current_user: dict = Depends(require_admin)):
    """Unlock a PO (Admin only)."""
    result = await pos_collection.update_one(
        {"$or": [{"id": po_id}, {"po_number": po_id}], "is_deleted": {"$ne": True}},
        {
            "$set": {
                "is_locked": False,
                "locked_by": None,
                "locked_at": None,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="PO not found")
    
    return {"message": "PO unlocked successfully"}


@router.get("/{po_id}/history")
async def get_po_history(po_id: str, current_user: dict = Depends(require_any_authenticated)):
    """Get PO status history."""
    po = await pos_collection.find_one({
        "$or": [{"id": po_id}, {"po_number": po_id}],
        "is_deleted": {"$ne": True}
    })
    
    if not po:
        raise HTTPException(status_code=404, detail="PO not found")
    
    # Also get logs from po_status_logs collection
    logs = await po_logs_collection.find({"po_id": po["id"]}).sort("created_at", 1).to_list(100)
    
    return {
        "po_number": po["po_number"],
        "current_status": po["status"],
        "status_history": po.get("status_history", []),
        "detailed_logs": [{
            "previous_status": log.get("previous_status"),
            "new_status": log["new_status"],
            "changed_by": log["changed_by"],
            "changed_by_role": log["changed_by_role"],
            "notes": log.get("notes"),
            "timestamp": log["created_at"]
        } for log in logs]
    }
