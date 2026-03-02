from fastapi import APIRouter, HTTPException, status, Depends, Request
from datetime import datetime, timezone
from typing import List, Optional
import uuid

from models.user import (
    UserCreate, UserLogin, UserResponse, UserUpdate, 
    User, Token, UserRole, UserStatus
)
from utils.auth import (
    verify_password, get_password_hash, create_access_token,
    get_current_user, require_admin
)
from utils.database import users_collection
from utils.activity_logger import log_activity

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, request: Request):
    """Register a new user."""
    # Check if email already exists
    existing_user = await users_collection.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user
    user = User(
        id=str(uuid.uuid4()),
        email=user_data.email,
        name=user_data.name,
        role=user_data.role,
        company_name=user_data.company_name,
        phone=user_data.phone,
        address=user_data.address,
        country=user_data.country,
        hashed_password=get_password_hash(user_data.password),
        status=UserStatus.PENDING if user_data.role != UserRole.ADMIN else UserStatus.ACTIVE,
        is_verified=False,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    
    user_dict = user.model_dump()
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    user_dict['updated_at'] = user_dict['updated_at'].isoformat()
    
    await users_collection.insert_one(user_dict)
    
    # Log activity
    await log_activity(
        user_id=user.id,
        user_email=user.email,
        user_role=user.role.value,
        action="create",
        entity_type="user",
        entity_id=user.id,
        description=f"New user registered: {user.email}",
        ip_address=request.client.host if request.client else None
    )
    
    return UserResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        role=user.role,
        company_name=user.company_name,
        phone=user.phone,
        address=user.address,
        country=user.country,
        status=user.status,
        is_verified=user.is_verified,
        created_at=user.created_at,
        last_login=user.last_login
    )


@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, request: Request):
    """Authenticate user and return JWT token."""
    user = await users_collection.find_one({"email": credentials.email, "is_deleted": {"$ne": True}})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    if not verify_password(credentials.password, user["hashed_password"]):
        # Increment failed login attempts
        await users_collection.update_one(
            {"id": user["id"]},
            {"$inc": {"failed_login_attempts": 1}}
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    if user.get("status") == "suspended":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is suspended. Please contact administrator."
        )
    
    if user.get("status") == "pending":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is pending approval. Please wait for admin approval."
        )
    
    # Update last login and reset failed attempts
    await users_collection.update_one(
        {"id": user["id"]},
        {
            "$set": {
                "last_login": datetime.now(timezone.utc).isoformat(),
                "failed_login_attempts": 0
            }
        }
    )
    
    # Create access token
    access_token = create_access_token(
        data={
            "sub": user["id"],
            "email": user["email"],
            "role": user["role"]
        }
    )
    
    # Log activity
    await log_activity(
        user_id=user["id"],
        user_email=user["email"],
        user_role=user["role"],
        action="login",
        entity_type="user",
        entity_id=user["id"],
        description=f"User logged in: {user['email']}",
        ip_address=request.client.host if request.client else None
    )
    
    # Parse created_at
    created_at = user.get("created_at")
    if isinstance(created_at, str):
        created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
    
    last_login = user.get("last_login")
    if isinstance(last_login, str):
        last_login = datetime.fromisoformat(last_login.replace('Z', '+00:00'))
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
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
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current user profile."""
    user = await users_collection.find_one({"id": current_user["user_id"], "is_deleted": {"$ne": True}})
    
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


@router.put("/me", response_model=UserResponse)
async def update_me(update_data: UserUpdate, current_user: dict = Depends(get_current_user)):
    """Update current user profile."""
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    
    if not update_dict:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    # Users can't change their own status
    if "status" in update_dict:
        del update_dict["status"]
    
    update_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await users_collection.update_one(
        {"id": current_user["user_id"]},
        {"$set": update_dict}
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return await get_me(current_user)


@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user), request: Request = None):
    """Logout user (client should discard token)."""
    # Log activity
    await log_activity(
        user_id=current_user["user_id"],
        user_email=current_user["email"],
        user_role=current_user["role"],
        action="logout",
        entity_type="user",
        entity_id=current_user["user_id"],
        description=f"User logged out: {current_user['email']}",
        ip_address=request.client.host if request and request.client else None
    )
    
    return {"message": "Logged out successfully"}
