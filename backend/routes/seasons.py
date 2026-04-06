"""
Season and Mood Board API Routes
"""
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from typing import List, Optional
from datetime import datetime, timezone
import uuid
import os
import base64
import json

from models.season import (
    SeasonCreate, SeasonUpdate, SeasonResponse, SeasonStatus, SeasonType,
    MoodBoardCreate, MoodBoardUpdate, MoodBoardResponse,
    DesignCreate, DesignUpdate, DesignResponse, DesignStatus,
    DesignSelectionAction, ColorPalette, FabricSwatch
)
from utils.auth import get_current_user, require_any_authenticated
from utils.database import db

router = APIRouter(prefix="/seasons", tags=["Seasons & Mood Boards"])

seasons_collection = db.seasons
mood_boards_collection = db.mood_boards
designs_collection = db.designs
users_collection = db.users
suppliers_collection = db.suppliers

# Upload directory for images
UPLOAD_DIR = "/app/backend/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(f"{UPLOAD_DIR}/mood_boards", exist_ok=True)
os.makedirs(f"{UPLOAD_DIR}/designs", exist_ok=True)
os.makedirs(f"{UPLOAD_DIR}/cads", exist_ok=True)


def generate_season_code(season_type: str, year: int) -> str:
    """Generate unique season code like SS26, FW26"""
    prefix_map = {
        "spring_summer": "SS",
        "fall_winter": "FW",
        "resort": "RS",
        "pre_fall": "PF",
        "holiday": "HL"
    }
    prefix = prefix_map.get(season_type, "SN")
    year_suffix = str(year)[-2:]
    return f"{prefix}{year_suffix}"


def generate_design_number(season_code: str, count: int) -> str:
    """Generate design number like DES-SS26-0001"""
    return f"DES-{season_code}-{str(count).zfill(4)}"


# ==================== SEASON ROUTES ====================

@router.post("/", response_model=SeasonResponse)
async def create_season(
    season: SeasonCreate,
    current_user: dict = Depends(require_any_authenticated)
):
    """Create a new season (Brand only)."""
    if current_user["role"] not in ["brand", "admin"]:
        raise HTTPException(status_code=403, detail="Only brands can create seasons")
    
    season_code = generate_season_code(season.season_type, season.year)
    
    # Check if season already exists
    existing = await seasons_collection.find_one({
        "brand_id": current_user["user_id"],
        "season_code": season_code
    })
    if existing:
        raise HTTPException(status_code=400, detail=f"Season {season_code} already exists")
    
    season_data = {
        "id": str(uuid.uuid4()),
        "season_code": season_code,
        **season.model_dump(),
        "status": SeasonStatus.PLANNING,
        "brand_id": current_user["user_id"],
        "created_by": current_user["user_id"],
        "created_at": datetime.now(timezone.utc),
        "total_designs_submitted": 0,
        "total_designs_selected": 0,
        "total_pos_created": 0
    }
    
    await seasons_collection.insert_one(season_data)
    return SeasonResponse(**season_data)


@router.get("/", response_model=List[SeasonResponse])
async def list_seasons(
    status: Optional[SeasonStatus] = None,
    year: Optional[int] = None,
    limit: int = 20,
    skip: int = 0,
    current_user: dict = Depends(require_any_authenticated)
):
    """List all seasons visible to the user."""
    query = {}
    
    # Brands see their own seasons, suppliers see seasons they're invited to
    if current_user["role"] == "brand":
        query["brand_id"] = current_user["user_id"]
    elif current_user["role"] == "manufacturer":
        # Manufacturers see seasons where they have designs or POs
        designs = await designs_collection.find(
            {"supplier_id": current_user["user_id"]}
        ).distinct("season_id")
        query["id"] = {"$in": designs} if designs else {"$in": []}
    
    if status:
        query["status"] = status
    if year:
        query["year"] = year
    
    cursor = seasons_collection.find(query).sort("created_at", -1).skip(skip).limit(limit)
    seasons = await cursor.to_list(length=limit)
    
    # Enrich with counts
    for season in seasons:
        season["total_designs_submitted"] = await designs_collection.count_documents(
            {"season_id": season["id"]}
        )
        season["total_designs_selected"] = await designs_collection.count_documents(
            {"season_id": season["id"], "status": DesignStatus.SELECTED}
        )
    
    return [SeasonResponse(**s) for s in seasons]


@router.get("/{season_id}", response_model=SeasonResponse)
async def get_season(
    season_id: str,
    current_user: dict = Depends(require_any_authenticated)
):
    """Get season details."""
    season = await seasons_collection.find_one({"id": season_id})
    if not season:
        raise HTTPException(status_code=404, detail="Season not found")
    
    # Enrich with counts
    season["total_designs_submitted"] = await designs_collection.count_documents(
        {"season_id": season_id}
    )
    season["total_designs_selected"] = await designs_collection.count_documents(
        {"season_id": season_id, "status": DesignStatus.SELECTED}
    )
    
    return SeasonResponse(**season)


@router.put("/{season_id}", response_model=SeasonResponse)
async def update_season(
    season_id: str,
    update: SeasonUpdate,
    current_user: dict = Depends(require_any_authenticated)
):
    """Update season details (Brand only)."""
    season = await seasons_collection.find_one({"id": season_id})
    if not season:
        raise HTTPException(status_code=404, detail="Season not found")
    
    if current_user["role"] not in ["admin"] and season["brand_id"] != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    await seasons_collection.update_one(
        {"id": season_id},
        {"$set": update_data}
    )
    
    updated = await seasons_collection.find_one({"id": season_id})
    return SeasonResponse(**updated)


@router.get("/{season_id}/stats")
async def get_season_stats(
    season_id: str,
    current_user: dict = Depends(require_any_authenticated)
):
    """Get detailed statistics for a season."""
    season = await seasons_collection.find_one({"id": season_id})
    if not season:
        raise HTTPException(status_code=404, detail="Season not found")
    
    # Design stats by status
    design_pipeline = [
        {"$match": {"season_id": season_id}},
        {"$group": {"_id": "$status", "count": {"$sum": 1}}}
    ]
    design_stats = await designs_collection.aggregate(design_pipeline).to_list(None)
    
    # Design stats by supplier
    supplier_pipeline = [
        {"$match": {"season_id": season_id}},
        {"$group": {
            "_id": "$supplier_id",
            "supplier_name": {"$first": "$supplier_name"},
            "submitted": {"$sum": 1},
            "selected": {"$sum": {"$cond": [{"$eq": ["$status", "selected"]}, 1, 0]}}
        }}
    ]
    supplier_stats = await designs_collection.aggregate(supplier_pipeline).to_list(None)
    
    # Design stats by category
    category_pipeline = [
        {"$match": {"season_id": season_id}},
        {"$group": {"_id": "$category", "count": {"$sum": 1}}}
    ]
    category_stats = await designs_collection.aggregate(category_pipeline).to_list(None)
    
    return {
        "season": SeasonResponse(**season),
        "designs_by_status": {s["_id"]: s["count"] for s in design_stats},
        "designs_by_supplier": supplier_stats,
        "designs_by_category": {c["_id"]: c["count"] for c in category_stats},
        "total_submitted": sum(s["count"] for s in design_stats),
        "total_selected": sum(1 for s in design_stats if s["_id"] == "selected") or 0,
        "selection_rate": round(
            (sum(1 for s in design_stats if s["_id"] == "selected") / 
             max(sum(s["count"] for s in design_stats), 1)) * 100, 1
        )
    }


# ==================== MOOD BOARD ROUTES ====================

@router.post("/{season_id}/mood-boards", response_model=MoodBoardResponse)
async def create_mood_board(
    season_id: str,
    title: str = Form(...),
    description: Optional[str] = Form(None),
    theme: Optional[str] = Form(None),
    target_market: Optional[str] = Form(None),
    color_palette: Optional[str] = Form(None),  # JSON string
    fabric_swatches: Optional[str] = Form(None),  # JSON string
    tags: Optional[str] = Form(None),  # Comma-separated
    images: List[UploadFile] = File(default=[]),
    current_user: dict = Depends(require_any_authenticated)
):
    """Create a mood board with image uploads."""
    if current_user["role"] not in ["brand", "admin", "designer"]:
        raise HTTPException(status_code=403, detail="Not authorized to create mood boards")
    
    season = await seasons_collection.find_one({"id": season_id})
    if not season:
        raise HTTPException(status_code=404, detail="Season not found")
    
    mood_board_id = str(uuid.uuid4())
    image_urls = []
    
    # Save uploaded images
    for i, image in enumerate(images):
        if image.filename:
            ext = image.filename.split(".")[-1] if "." in image.filename else "jpg"
            filename = f"{mood_board_id}_{i}.{ext}"
            filepath = f"{UPLOAD_DIR}/mood_boards/{filename}"
            
            content = await image.read()
            with open(filepath, "wb") as f:
                f.write(content)
            
            image_urls.append(f"/uploads/mood_boards/{filename}")
    
    # Parse JSON fields
    parsed_colors = json.loads(color_palette) if color_palette else []
    parsed_swatches = json.loads(fabric_swatches) if fabric_swatches else []
    parsed_tags = tags.split(",") if tags else []
    
    mood_board_data = {
        "id": mood_board_id,
        "season_id": season_id,
        "brand_id": season["brand_id"],
        "created_by": current_user["user_id"],
        "title": title,
        "description": description,
        "theme": theme,
        "target_market": target_market,
        "color_palette": parsed_colors,
        "fabric_swatches": parsed_swatches,
        "tags": parsed_tags,
        "images": image_urls,
        "inspiration_links": [],
        "created_at": datetime.now(timezone.utc)
    }
    
    await mood_boards_collection.insert_one(mood_board_data)
    return MoodBoardResponse(**mood_board_data)


@router.get("/{season_id}/mood-boards", response_model=List[MoodBoardResponse])
async def list_mood_boards(
    season_id: str,
    current_user: dict = Depends(require_any_authenticated)
):
    """List all mood boards for a season."""
    mood_boards = await mood_boards_collection.find(
        {"season_id": season_id}
    ).sort("created_at", -1).to_list(None)
    
    return [MoodBoardResponse(**mb) for mb in mood_boards]


@router.get("/mood-boards/{mood_board_id}", response_model=MoodBoardResponse)
async def get_mood_board(
    mood_board_id: str,
    current_user: dict = Depends(require_any_authenticated)
):
    """Get mood board details."""
    mood_board = await mood_boards_collection.find_one({"id": mood_board_id})
    if not mood_board:
        raise HTTPException(status_code=404, detail="Mood board not found")
    
    return MoodBoardResponse(**mood_board)


@router.post("/mood-boards/{mood_board_id}/images")
async def add_mood_board_images(
    mood_board_id: str,
    images: List[UploadFile] = File(...),
    current_user: dict = Depends(require_any_authenticated)
):
    """Add images to an existing mood board."""
    mood_board = await mood_boards_collection.find_one({"id": mood_board_id})
    if not mood_board:
        raise HTTPException(status_code=404, detail="Mood board not found")
    
    image_urls = mood_board.get("images", [])
    
    for i, image in enumerate(images):
        if image.filename:
            ext = image.filename.split(".")[-1] if "." in image.filename else "jpg"
            filename = f"{mood_board_id}_{len(image_urls) + i}.{ext}"
            filepath = f"{UPLOAD_DIR}/mood_boards/{filename}"
            
            content = await image.read()
            with open(filepath, "wb") as f:
                f.write(content)
            
            image_urls.append(f"/uploads/mood_boards/{filename}")
    
    await mood_boards_collection.update_one(
        {"id": mood_board_id},
        {"$set": {"images": image_urls, "updated_at": datetime.now(timezone.utc)}}
    )
    
    return {"message": f"Added {len(images)} images", "images": image_urls}


# ==================== DESIGN SUBMISSION ROUTES ====================

@router.post("/{season_id}/designs", response_model=DesignResponse)
async def submit_design(
    season_id: str,
    style_name: str = Form(...),
    category: str = Form(...),
    sub_category: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    fabric_composition: Optional[str] = Form(None),
    fabric_gsm: Optional[int] = Form(None),
    estimated_cost: Optional[float] = Form(None),
    estimated_moq: Optional[int] = Form(None),
    lead_time_days: Optional[int] = Form(None),
    mood_board_id: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),
    images: List[UploadFile] = File(default=[]),
    cad_files: List[UploadFile] = File(default=[]),
    current_user: dict = Depends(require_any_authenticated)
):
    """Submit a design for a season (Manufacturer/Designer only)."""
    if current_user["role"] not in ["manufacturer", "designer", "admin"]:
        raise HTTPException(status_code=403, detail="Only manufacturers/designers can submit designs")
    
    season = await seasons_collection.find_one({"id": season_id})
    if not season:
        raise HTTPException(status_code=404, detail="Season not found")
    
    # Get supplier info
    supplier = await suppliers_collection.find_one({"user_id": current_user["user_id"]})
    supplier_name = supplier["company_name"] if supplier else current_user.get("name", "Unknown")
    
    # Generate design number
    design_count = await designs_collection.count_documents({"season_id": season_id})
    design_number = generate_design_number(season["season_code"], design_count + 1)
    
    design_id = str(uuid.uuid4())
    image_urls = []
    cad_urls = []
    
    # Save design images
    for i, image in enumerate(images):
        if image.filename:
            ext = image.filename.split(".")[-1] if "." in image.filename else "jpg"
            filename = f"{design_id}_{i}.{ext}"
            filepath = f"{UPLOAD_DIR}/designs/{filename}"
            
            content = await image.read()
            with open(filepath, "wb") as f:
                f.write(content)
            
            image_urls.append(f"/uploads/designs/{filename}")
    
    # Save CAD files
    for i, cad in enumerate(cad_files):
        if cad.filename:
            ext = cad.filename.split(".")[-1] if "." in cad.filename else "pdf"
            filename = f"{design_id}_cad_{i}.{ext}"
            filepath = f"{UPLOAD_DIR}/cads/{filename}"
            
            content = await cad.read()
            with open(filepath, "wb") as f:
                f.write(content)
            
            cad_urls.append(f"/uploads/cads/{filename}")
    
    parsed_tags = tags.split(",") if tags else []
    
    design_data = {
        "id": design_id,
        "design_number": design_number,
        "season_id": season_id,
        "mood_board_id": mood_board_id,
        "supplier_id": current_user["user_id"],
        "supplier_name": supplier_name,
        "style_name": style_name,
        "category": category,
        "sub_category": sub_category,
        "description": description,
        "fabric_composition": fabric_composition,
        "fabric_gsm": fabric_gsm,
        "estimated_cost": estimated_cost,
        "estimated_moq": estimated_moq,
        "lead_time_days": lead_time_days,
        "tags": parsed_tags,
        "images": image_urls,
        "cad_files": cad_urls,
        "status": DesignStatus.SUBMITTED,
        "is_duplicate": False,
        "created_at": datetime.now(timezone.utc)
    }
    
    # Check for duplicate designs (simple similarity check)
    # In production, this could use image similarity or ML
    existing_similar = await designs_collection.find_one({
        "season_id": season_id,
        "style_name": {"$regex": style_name, "$options": "i"},
        "category": category,
        "id": {"$ne": design_id}
    })
    
    if existing_similar:
        design_data["is_duplicate"] = True
        design_data["duplicate_of"] = existing_similar["id"]
    
    await designs_collection.insert_one(design_data)
    
    # Update season design count
    await seasons_collection.update_one(
        {"id": season_id},
        {"$inc": {"total_designs_submitted": 1}}
    )
    
    return DesignResponse(**design_data)


@router.get("/{season_id}/designs", response_model=List[DesignResponse])
async def list_designs(
    season_id: str,
    status: Optional[DesignStatus] = None,
    category: Optional[str] = None,
    supplier_id: Optional[str] = None,
    limit: int = 50,
    skip: int = 0,
    current_user: dict = Depends(require_any_authenticated)
):
    """List designs for a season."""
    query = {"season_id": season_id}
    
    # Manufacturers only see their own designs
    if current_user["role"] == "manufacturer":
        query["supplier_id"] = current_user["user_id"]
    elif supplier_id:
        query["supplier_id"] = supplier_id
    
    if status:
        query["status"] = status
    if category:
        query["category"] = category
    
    cursor = designs_collection.find(query).sort("created_at", -1).skip(skip).limit(limit)
    designs = await cursor.to_list(length=limit)
    
    return [DesignResponse(**d) for d in designs]


@router.get("/designs/{design_id}", response_model=DesignResponse)
async def get_design(
    design_id: str,
    current_user: dict = Depends(require_any_authenticated)
):
    """Get design details."""
    design = await designs_collection.find_one({"id": design_id})
    if not design:
        raise HTTPException(status_code=404, detail="Design not found")
    
    return DesignResponse(**design)


@router.post("/{season_id}/designs/select")
async def select_designs(
    season_id: str,
    action: DesignSelectionAction,
    current_user: dict = Depends(require_any_authenticated)
):
    """Select or reject multiple designs (Brand only)."""
    if current_user["role"] not in ["brand", "admin"]:
        raise HTTPException(status_code=403, detail="Only brands can select designs")
    
    season = await seasons_collection.find_one({"id": season_id})
    if not season:
        raise HTTPException(status_code=404, detail="Season not found")
    
    status_map = {
        "select": DesignStatus.SELECTED,
        "reject": DesignStatus.REJECTED,
        "request_revision": DesignStatus.REVISION_REQUESTED
    }
    
    new_status = status_map.get(action.action)
    if not new_status:
        raise HTTPException(status_code=400, detail="Invalid action")
    
    update_data = {
        "status": new_status,
        "updated_at": datetime.now(timezone.utc)
    }
    
    if action.action == "select":
        update_data["selected_at"] = datetime.now(timezone.utc)
    elif action.action == "reject":
        update_data["rejection_reason"] = action.notes
    
    if action.notes:
        update_data["brand_notes"] = action.notes
    
    result = await designs_collection.update_many(
        {"id": {"$in": action.design_ids}, "season_id": season_id},
        {"$set": update_data}
    )
    
    # Update season selected count
    if action.action == "select":
        await seasons_collection.update_one(
            {"id": season_id},
            {"$inc": {"total_designs_selected": result.modified_count}}
        )
    
    return {
        "message": f"{result.modified_count} designs updated",
        "action": action.action,
        "new_status": new_status
    }


@router.get("/{season_id}/designs/duplicates")
async def get_duplicate_designs(
    season_id: str,
    current_user: dict = Depends(require_any_authenticated)
):
    """Get list of potential duplicate designs."""
    if current_user["role"] not in ["brand", "admin"]:
        raise HTTPException(status_code=403, detail="Only brands can view duplicates")
    
    duplicates = await designs_collection.find({
        "season_id": season_id,
        "is_duplicate": True
    }).to_list(None)
    
    return [DesignResponse(**d) for d in duplicates]
