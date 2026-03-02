from fastapi import APIRouter, HTTPException, status, Depends, Query
from datetime import datetime, timezone
from typing import List, Optional
import uuid

from models.supplier import (
    Supplier, SupplierCreate, SupplierResponse, SupplierUpdate,
    SupplierStatus, RiskCategory, CertificationType, ProductCategory, AuditStatus as SupplierAuditStatus
)
from utils.auth import get_current_user, require_admin, require_any_authenticated
from utils.database import db
from utils.activity_logger import log_activity
from utils.alerts import create_alert

router = APIRouter(prefix="/suppliers", tags=["Suppliers"])

# Get the suppliers collection
suppliers_collection = db.suppliers


@router.post("/", response_model=SupplierResponse, status_code=status.HTTP_201_CREATED)
async def create_supplier(
    supplier_data: SupplierCreate,
    current_user: dict = Depends(require_admin)
):
    """Create a new supplier (Admin only)."""
    # Check for duplicate company name
    existing = await suppliers_collection.find_one({
        "company_name": supplier_data.company_name,
        "is_deleted": {"$ne": True}
    })
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Supplier with this company name already exists"
        )
    
    # Generate unique supplier ID
    supplier_id = f"SUP-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:6].upper()}"
    
    supplier = Supplier(
        id=str(uuid.uuid4()),
        supplier_id=supplier_id,
        company_name=supplier_data.company_name,
        factory_address=supplier_data.factory_address,
        country=supplier_data.country,
        contact_person=supplier_data.contact_person,
        email=supplier_data.email,
        phone=supplier_data.phone,
        certification_types=supplier_data.certification_types,
        audit_status=supplier_data.audit_status,
        production_capacity=supplier_data.production_capacity,
        product_categories=supplier_data.product_categories,
        status=SupplierStatus.ACTIVE,
        compliance_score=supplier_data.initial_compliance_score,
        risk_category=supplier_data.risk_category,
        created_by=current_user["user_id"],
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    
    supplier_dict = supplier.model_dump()
    supplier_dict['created_at'] = supplier_dict['created_at'].isoformat()
    supplier_dict['updated_at'] = supplier_dict['updated_at'].isoformat()
    # Convert enums to values
    supplier_dict['certification_types'] = [c.value if hasattr(c, 'value') else c for c in supplier_dict['certification_types']]
    supplier_dict['product_categories'] = [c.value if hasattr(c, 'value') else c for c in supplier_dict['product_categories']]
    supplier_dict['status'] = supplier_dict['status'].value if hasattr(supplier_dict['status'], 'value') else supplier_dict['status']
    supplier_dict['risk_category'] = supplier_dict['risk_category'].value if hasattr(supplier_dict['risk_category'], 'value') else supplier_dict['risk_category']
    supplier_dict['audit_status'] = supplier_dict['audit_status'].value if hasattr(supplier_dict['audit_status'], 'value') else supplier_dict['audit_status']
    
    await suppliers_collection.insert_one(supplier_dict)
    
    # Log activity
    await log_activity(
        user_id=current_user["user_id"],
        user_email=current_user["email"],
        user_role=current_user["role"],
        action="create",
        entity_type="supplier",
        entity_id=supplier.id,
        description=f"Supplier created: {supplier.company_name}",
        metadata={"supplier_id": supplier_id}
    )
    
    return SupplierResponse(
        id=supplier.id,
        supplier_id=supplier.supplier_id,
        user_id=supplier.user_id,
        company_name=supplier.company_name,
        factory_address=supplier.factory_address,
        country=supplier.country,
        contact_person=supplier.contact_person,
        email=supplier.email,
        phone=supplier.phone,
        certification_types=supplier.certification_types,
        audit_status=supplier.audit_status,
        production_capacity=supplier.production_capacity,
        product_categories=supplier.product_categories,
        status=supplier.status,
        compliance_score=supplier.compliance_score,
        risk_category=supplier.risk_category,
        on_time_delivery_rate=supplier.on_time_delivery_rate,
        audit_pass_rate=supplier.audit_pass_rate,
        rejection_rate=supplier.rejection_rate,
        total_pos=supplier.total_pos,
        completed_pos=supplier.completed_pos,
        last_audit_date=supplier.last_audit_date,
        is_locked=supplier.is_locked,
        created_at=supplier.created_at
    )


@router.get("/", response_model=List[SupplierResponse])
async def get_suppliers(
    status: Optional[SupplierStatus] = None,
    risk_category: Optional[RiskCategory] = None,
    certification: Optional[CertificationType] = None,
    country: Optional[str] = None,
    min_compliance: Optional[float] = None,
    sort_by: Optional[str] = Query(None, enum=["compliance", "risk", "audit_date"]),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: dict = Depends(require_any_authenticated)
):
    """Get suppliers based on user role and filters."""
    query = {"is_deleted": {"$ne": True}}
    
    # Brands can only see active suppliers
    if current_user["role"] == "brand":
        query["status"] = "active"
    elif current_user["role"] == "supplier":
        # Suppliers can only see their own profile
        query["user_id"] = current_user["user_id"]
    
    # Apply filters
    if status and current_user["role"] == "admin":
        query["status"] = status.value
    if risk_category:
        query["risk_category"] = risk_category.value
    if certification:
        query["certification_types"] = certification.value
    if country:
        query["country"] = {"$regex": country, "$options": "i"}
    if min_compliance is not None:
        query["compliance_score"] = {"$gte": min_compliance}
    
    # Sorting
    sort_field = "created_at"
    sort_order = -1
    if sort_by == "compliance":
        sort_field = "compliance_score"
    elif sort_by == "risk":
        sort_field = "risk_category"
    elif sort_by == "audit_date":
        sort_field = "last_audit_date"
    
    suppliers = await suppliers_collection.find(query).sort(sort_field, sort_order).skip(skip).limit(limit).to_list(limit)
    
    result = []
    for s in suppliers:
        created_at = s.get("created_at")
        if isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
        
        last_audit_date = s.get("last_audit_date")
        if isinstance(last_audit_date, str):
            last_audit_date = datetime.fromisoformat(last_audit_date.replace('Z', '+00:00'))
        
        result.append(SupplierResponse(
            id=s["id"],
            supplier_id=s["supplier_id"],
            user_id=s.get("user_id"),
            company_name=s["company_name"],
            factory_address=s["factory_address"],
            country=s["country"],
            contact_person=s["contact_person"],
            email=s["email"],
            phone=s["phone"],
            certification_types=s.get("certification_types", []),
            audit_status=s.get("audit_status", "not_audited"),
            production_capacity=s.get("production_capacity"),
            product_categories=s.get("product_categories", []),
            status=s.get("status", "active"),
            compliance_score=s.get("compliance_score", 0),
            risk_category=s.get("risk_category", "medium"),
            on_time_delivery_rate=s.get("on_time_delivery_rate", 0),
            audit_pass_rate=s.get("audit_pass_rate", 0),
            rejection_rate=s.get("rejection_rate", 0),
            total_pos=s.get("total_pos", 0),
            completed_pos=s.get("completed_pos", 0),
            last_audit_date=last_audit_date,
            is_locked=s.get("is_locked", False),
            created_at=created_at
        ))
    
    return result


@router.get("/stats")
async def get_supplier_stats(current_user: dict = Depends(require_admin)):
    """Get supplier statistics (Admin only)."""
    pipeline = [
        {"$match": {"is_deleted": {"$ne": True}}},
        {"$group": {
            "_id": None,
            "total": {"$sum": 1},
            "active": {"$sum": {"$cond": [{"$eq": ["$status", "active"]}, 1, 0]}},
            "inactive": {"$sum": {"$cond": [{"$eq": ["$status", "inactive"]}, 1, 0]}},
            "locked": {"$sum": {"$cond": [{"$eq": ["$is_locked", True]}, 1, 0]}},
            "high_risk": {"$sum": {"$cond": [{"$in": ["$risk_category", ["high", "critical"]]}, 1, 0]}},
            "avg_compliance": {"$avg": "$compliance_score"}
        }}
    ]
    
    results = await suppliers_collection.aggregate(pipeline).to_list(1)
    
    # Risk distribution
    risk_pipeline = [
        {"$match": {"is_deleted": {"$ne": True}}},
        {"$group": {"_id": "$risk_category", "count": {"$sum": 1}}}
    ]
    risk_results = await suppliers_collection.aggregate(risk_pipeline).to_list(10)
    
    # Country distribution
    country_pipeline = [
        {"$match": {"is_deleted": {"$ne": True}}},
        {"$group": {"_id": "$country", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 10}
    ]
    country_results = await suppliers_collection.aggregate(country_pipeline).to_list(10)
    
    stats = results[0] if results else {
        "total": 0, "active": 0, "inactive": 0, "locked": 0, "high_risk": 0, "avg_compliance": 0
    }
    
    return {
        "total_suppliers": stats.get("total", 0),
        "active_suppliers": stats.get("active", 0),
        "inactive_suppliers": stats.get("inactive", 0),
        "locked_suppliers": stats.get("locked", 0),
        "high_risk_suppliers": stats.get("high_risk", 0),
        "average_compliance": round(stats.get("avg_compliance", 0) or 0, 2),
        "risk_distribution": {r["_id"]: r["count"] for r in risk_results},
        "by_country": {c["_id"]: c["count"] for c in country_results}
    }


@router.get("/{supplier_id}", response_model=SupplierResponse)
async def get_supplier(supplier_id: str, current_user: dict = Depends(require_any_authenticated)):
    """Get supplier by ID."""
    query = {"$or": [{"id": supplier_id}, {"supplier_id": supplier_id}], "is_deleted": {"$ne": True}}
    
    # Suppliers can only see their own profile
    if current_user["role"] == "supplier":
        query["user_id"] = current_user["user_id"]
    # Brands can only see active suppliers
    elif current_user["role"] == "brand":
        query["status"] = "active"
    
    supplier = await suppliers_collection.find_one(query)
    
    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Supplier not found"
        )
    
    created_at = supplier.get("created_at")
    if isinstance(created_at, str):
        created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
    
    last_audit_date = supplier.get("last_audit_date")
    if isinstance(last_audit_date, str):
        last_audit_date = datetime.fromisoformat(last_audit_date.replace('Z', '+00:00'))
    
    return SupplierResponse(
        id=supplier["id"],
        supplier_id=supplier["supplier_id"],
        user_id=supplier.get("user_id"),
        company_name=supplier["company_name"],
        factory_address=supplier["factory_address"],
        country=supplier["country"],
        contact_person=supplier["contact_person"],
        email=supplier["email"],
        phone=supplier["phone"],
        certification_types=supplier.get("certification_types", []),
        audit_status=supplier.get("audit_status", "not_audited"),
        production_capacity=supplier.get("production_capacity"),
        product_categories=supplier.get("product_categories", []),
        status=supplier.get("status", "active"),
        compliance_score=supplier.get("compliance_score", 0),
        risk_category=supplier.get("risk_category", "medium"),
        on_time_delivery_rate=supplier.get("on_time_delivery_rate", 0),
        audit_pass_rate=supplier.get("audit_pass_rate", 0),
        rejection_rate=supplier.get("rejection_rate", 0),
        total_pos=supplier.get("total_pos", 0),
        completed_pos=supplier.get("completed_pos", 0),
        last_audit_date=last_audit_date,
        is_locked=supplier.get("is_locked", False),
        created_at=created_at
    )


@router.put("/{supplier_id}", response_model=SupplierResponse)
async def update_supplier(
    supplier_id: str,
    update_data: SupplierUpdate,
    current_user: dict = Depends(require_admin)
):
    """Update supplier (Admin only)."""
    supplier = await suppliers_collection.find_one({
        "$or": [{"id": supplier_id}, {"supplier_id": supplier_id}],
        "is_deleted": {"$ne": True}
    })
    
    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Supplier not found"
        )
    
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    
    if not update_dict:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    # Convert enums to values
    if "certification_types" in update_dict:
        update_dict["certification_types"] = [c.value if hasattr(c, 'value') else c for c in update_dict["certification_types"]]
    if "product_categories" in update_dict:
        update_dict["product_categories"] = [c.value if hasattr(c, 'value') else c for c in update_dict["product_categories"]]
    if "status" in update_dict:
        update_dict["status"] = update_dict["status"].value if hasattr(update_dict["status"], 'value') else update_dict["status"]
    if "risk_category" in update_dict:
        update_dict["risk_category"] = update_dict["risk_category"].value if hasattr(update_dict["risk_category"], 'value') else update_dict["risk_category"]
    if "audit_status" in update_dict:
        update_dict["audit_status"] = update_dict["audit_status"].value if hasattr(update_dict["audit_status"], 'value') else update_dict["audit_status"]
    
    update_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await suppliers_collection.update_one(
        {"id": supplier["id"]},
        {"$set": update_dict}
    )
    
    # Log activity
    await log_activity(
        user_id=current_user["user_id"],
        user_email=current_user["email"],
        user_role=current_user["role"],
        action="update",
        entity_type="supplier",
        entity_id=supplier["id"],
        description=f"Supplier updated: {supplier['company_name']}",
        metadata={"updated_fields": list(update_dict.keys())}
    )
    
    return await get_supplier(supplier["id"], current_user)


@router.post("/{supplier_id}/activate", response_model=SupplierResponse)
async def activate_supplier(supplier_id: str, current_user: dict = Depends(require_admin)):
    """Activate a supplier (Admin only)."""
    result = await suppliers_collection.update_one(
        {"$or": [{"id": supplier_id}, {"supplier_id": supplier_id}], "is_deleted": {"$ne": True}},
        {
            "$set": {
                "status": "active",
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    await log_activity(
        user_id=current_user["user_id"],
        user_email=current_user["email"],
        user_role=current_user["role"],
        action="update",
        entity_type="supplier",
        entity_id=supplier_id,
        description=f"Supplier activated: {supplier_id}"
    )
    
    return await get_supplier(supplier_id, current_user)


@router.post("/{supplier_id}/deactivate", response_model=SupplierResponse)
async def deactivate_supplier(supplier_id: str, current_user: dict = Depends(require_admin)):
    """Deactivate a supplier (Admin only)."""
    result = await suppliers_collection.update_one(
        {"$or": [{"id": supplier_id}, {"supplier_id": supplier_id}], "is_deleted": {"$ne": True}},
        {
            "$set": {
                "status": "inactive",
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    await log_activity(
        user_id=current_user["user_id"],
        user_email=current_user["email"],
        user_role=current_user["role"],
        action="update",
        entity_type="supplier",
        entity_id=supplier_id,
        description=f"Supplier deactivated: {supplier_id}"
    )
    
    return await get_supplier(supplier_id, current_user)


@router.post("/{supplier_id}/lock")
async def lock_supplier(
    supplier_id: str,
    reason: str,
    current_user: dict = Depends(require_admin)
):
    """Lock a high-risk supplier (Admin only)."""
    supplier = await suppliers_collection.find_one({
        "$or": [{"id": supplier_id}, {"supplier_id": supplier_id}],
        "is_deleted": {"$ne": True}
    })
    
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    await suppliers_collection.update_one(
        {"id": supplier["id"]},
        {
            "$set": {
                "is_locked": True,
                "locked_by": current_user["user_id"],
                "locked_at": datetime.now(timezone.utc).isoformat(),
                "lock_reason": reason,
                "status": "locked",
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    # Create alert
    await create_alert(
        alert_type="compliance_issue",
        severity="critical",
        title="Supplier Locked",
        message=f"Supplier {supplier['company_name']} has been locked. Reason: {reason}",
        target_roles=["admin", "brand"],
        entity_type="supplier",
        entity_id=supplier["id"]
    )
    
    await log_activity(
        user_id=current_user["user_id"],
        user_email=current_user["email"],
        user_role=current_user["role"],
        action="update",
        entity_type="supplier",
        entity_id=supplier["id"],
        description=f"Supplier locked: {supplier['company_name']}",
        metadata={"reason": reason}
    )
    
    return {"message": f"Supplier {supplier['company_name']} has been locked", "reason": reason}


@router.post("/{supplier_id}/unlock")
async def unlock_supplier(supplier_id: str, current_user: dict = Depends(require_admin)):
    """Unlock a supplier (Admin only)."""
    result = await suppliers_collection.update_one(
        {"$or": [{"id": supplier_id}, {"supplier_id": supplier_id}], "is_deleted": {"$ne": True}},
        {
            "$set": {
                "is_locked": False,
                "locked_by": None,
                "locked_at": None,
                "lock_reason": None,
                "status": "active",
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    return {"message": "Supplier unlocked successfully"}


@router.get("/{supplier_id}/performance")
async def get_supplier_performance(supplier_id: str, current_user: dict = Depends(require_any_authenticated)):
    """Get supplier performance metrics."""
    supplier = await suppliers_collection.find_one({
        "$or": [{"id": supplier_id}, {"supplier_id": supplier_id}],
        "is_deleted": {"$ne": True}
    })
    
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    # Get PO statistics
    pos_collection = db.purchase_orders
    
    po_stats = await pos_collection.aggregate([
        {"$match": {"supplier_id": {"$in": [supplier["id"], supplier["supplier_id"]]}, "is_deleted": {"$ne": True}}},
        {"$group": {
            "_id": None,
            "total_pos": {"$sum": 1},
            "completed": {"$sum": {"$cond": [{"$eq": ["$status", "completed"]}, 1, 0]}},
            "delivered": {"$sum": {"$cond": [{"$eq": ["$status", "delivered"]}, 1, 0]}},
            "total_value": {"$sum": "$total_amount"}
        }}
    ]).to_list(1)
    
    stats = po_stats[0] if po_stats else {"total_pos": 0, "completed": 0, "delivered": 0, "total_value": 0}
    
    return {
        "supplier_id": supplier["supplier_id"],
        "company_name": supplier["company_name"],
        "compliance_score": supplier.get("compliance_score", 0),
        "risk_category": supplier.get("risk_category", "medium"),
        "on_time_delivery_rate": supplier.get("on_time_delivery_rate", 0),
        "audit_pass_rate": supplier.get("audit_pass_rate", 0),
        "rejection_rate": supplier.get("rejection_rate", 0),
        "total_pos": stats.get("total_pos", 0),
        "completed_pos": stats.get("completed", 0) + stats.get("delivered", 0),
        "total_order_value": stats.get("total_value", 0),
        "last_audit_date": supplier.get("last_audit_date"),
        "audit_status": supplier.get("audit_status", "not_audited")
    }


@router.delete("/{supplier_id}")
async def delete_supplier(supplier_id: str, current_user: dict = Depends(require_admin)):
    """Soft delete a supplier (Admin only)."""
    result = await suppliers_collection.update_one(
        {"$or": [{"id": supplier_id}, {"supplier_id": supplier_id}]},
        {
            "$set": {
                "is_deleted": True,
                "status": "inactive",
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    await log_activity(
        user_id=current_user["user_id"],
        user_email=current_user["email"],
        user_role=current_user["role"],
        action="delete",
        entity_type="supplier",
        entity_id=supplier_id,
        description=f"Supplier deleted: {supplier_id}"
    )
    
    return {"message": "Supplier deleted successfully"}
