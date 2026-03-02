from fastapi import APIRouter, HTTPException, status, Depends, Query
from datetime import datetime, timezone
from typing import List, Optional
import uuid

from models.user import UserResponse, UserUpdate, UserStatus, UserRole
from utils.auth import get_current_user, require_admin
from utils.database import users_collection
from utils.activity_logger import log_activity

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/", response_model=List[UserResponse])
async def get_users(
    role: Optional[UserRole] = None,
    status: Optional[UserStatus] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: dict = Depends(require_admin)
):
    """Get all users (Admin only)."""
    query = {"is_deleted": {"$ne": True}}
    
    if role:
        query["role"] = role.value
    if status:
        query["status"] = status.value
    
    users = await users_collection.find(query).skip(skip).limit(limit).to_list(limit)
    
    result = []
    for user in users:
        created_at = user.get("created_at")
        if isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
        
        last_login = user.get("last_login")
        if isinstance(last_login, str):
            last_login = datetime.fromisoformat(last_login.replace('Z', '+00:00'))
        
        result.append(UserResponse(
            id=user["id"],
            email=user["email"],
            name=user["name"],
            role=user["role"],
            company_name=user.get("company_name"),
            phone=user.get("phone"),
            address=user.get("address"),
            country=user.get("country"),
            status=user.get("status", "active"),
            is_verified=user.get("is_verified", False),
            created_at=created_at,
            last_login=last_login
        ))
    
    return result


@router.get("/stats")
async def get_user_stats(current_user: dict = Depends(require_admin)):
    """Get user statistics (Admin only)."""
    pipeline = [
        {"$match": {"is_deleted": {"$ne": True}}},
        {"$group": {
            "_id": "$role",
            "count": {"$sum": 1},
            "active": {"$sum": {"$cond": [{"$eq": ["$status", "active"]}, 1, 0]}},
            "pending": {"$sum": {"$cond": [{"$eq": ["$status", "pending"]}, 1, 0]}}
        }}
    ]
    
    results = await users_collection.aggregate(pipeline).to_list(100)
    
    stats = {
        "total_users": 0,
        "by_role": {},
        "pending_approvals": 0
    }
    
    for r in results:
        stats["by_role"][r["_id"]] = {
            "total": r["count"],
            "active": r["active"],
            "pending": r["pending"]
        }
        stats["total_users"] += r["count"]
        stats["pending_approvals"] += r["pending"]
    
    return stats


@router.get("/pending", response_model=List[UserResponse])
async def get_pending_users(current_user: dict = Depends(require_admin)):
    """Get users pending approval (Admin only)."""
    users = await users_collection.find({
        "status": "pending",
        "is_deleted": {"$ne": True}
    }).to_list(100)
    
    result = []
    for user in users:
        created_at = user.get("created_at")
        if isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
        
        result.append(UserResponse(
            id=user["id"],
            email=user["email"],
            name=user["name"],
            role=user["role"],
            company_name=user.get("company_name"),
            phone=user.get("phone"),
            address=user.get("address"),
            country=user.get("country"),
            status=user.get("status", "pending"),
            is_verified=user.get("is_verified", False),
            created_at=created_at,
            last_login=None
        ))
    
    return result


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: str, current_user: dict = Depends(require_admin)):
    """Get user by ID (Admin only)."""
    user = await users_collection.find_one({"id": user_id, "is_deleted": {"$ne": True}})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    created_at = user.get("created_at")
    if isinstance(created_at, str):
        created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
    
    last_login = user.get("last_login")
    if isinstance(last_login, str):
        last_login = datetime.fromisoformat(last_login.replace('Z', '+00:00'))
    
    return UserResponse(
        id=user["id"],
        email=user["email"],
        name=user["name"],
        role=user["role"],
        company_name=user.get("company_name"),
        phone=user.get("phone"),
        address=user.get("address"),
        country=user.get("country"),
        status=user.get("status", "active"),
        is_verified=user.get("is_verified", False),
        created_at=created_at,
        last_login=last_login
    )


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    update_data: UserUpdate,
    current_user: dict = Depends(require_admin)
):
    """Update user (Admin only)."""
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    
    if not update_dict:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    update_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await users_collection.update_one(
        {"id": user_id, "is_deleted": {"$ne": True}},
        {"$set": update_dict}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Log activity
    await log_activity(
        user_id=current_user["user_id"],
        user_email=current_user["email"],
        user_role=current_user["role"],
        action="update",
        entity_type="user",
        entity_id=user_id,
        description=f"User updated by admin: {user_id}",
        metadata={"updated_fields": list(update_dict.keys())}
    )
    
    return await get_user(user_id, current_user)


@router.post("/{user_id}/approve", response_model=UserResponse)
async def approve_user(user_id: str, current_user: dict = Depends(require_admin)):
    """Approve a pending user (Admin only)."""
    result = await users_collection.update_one(
        {"id": user_id, "status": "pending", "is_deleted": {"$ne": True}},
        {
            "$set": {
                "status": "active",
                "is_verified": True,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found or not pending approval"
        )
    
    # Log activity
    await log_activity(
        user_id=current_user["user_id"],
        user_email=current_user["email"],
        user_role=current_user["role"],
        action="approve",
        entity_type="user",
        entity_id=user_id,
        description=f"User approved: {user_id}"
    )
    
    return await get_user(user_id, current_user)


@router.post("/{user_id}/suspend", response_model=UserResponse)
async def suspend_user(user_id: str, current_user: dict = Depends(require_admin)):
    """Suspend a user (Admin only)."""
    if user_id == current_user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot suspend your own account"
        )
    
    result = await users_collection.update_one(
        {"id": user_id, "is_deleted": {"$ne": True}},
        {
            "$set": {
                "status": "suspended",
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Log activity
    await log_activity(
        user_id=current_user["user_id"],
        user_email=current_user["email"],
        user_role=current_user["role"],
        action="update",
        entity_type="user",
        entity_id=user_id,
        description=f"User suspended: {user_id}"
    )
    
    return await get_user(user_id, current_user)


@router.delete("/{user_id}")
async def delete_user(user_id: str, current_user: dict = Depends(require_admin)):
    """Soft delete a user (Admin only)."""
    if user_id == current_user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    result = await users_collection.update_one(
        {"id": user_id},
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
            detail="User not found"
        )
    
    # Log activity
    await log_activity(
        user_id=current_user["user_id"],
        user_email=current_user["email"],
        user_role=current_user["role"],
        action="delete",
        entity_type="user",
        entity_id=user_id,
        description=f"User deleted: {user_id}"
    )
    
    return {"message": "User deleted successfully"}
