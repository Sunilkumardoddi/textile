"""
Manufacturer Collection & Swatch API Routes
"""
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, Query
from typing import List, Optional
from datetime import datetime, timezone
import uuid
import os
import json
import csv
import io
from PIL import Image as PILImage

from models.swatch import (
    ManufacturerCollectionCreate, ManufacturerCollectionUpdate, ManufacturerCollectionResponse,
    CollectionStatus, SwatchCreate, SwatchUpdate, SwatchResponse, SwatchStatus,
    SwatchFilter, SwatchSelectionAction, SwatchMetadata, FabricType, WeaveType,
    SupplierSwatchStats, CollectionAnalytics
)
from utils.auth import get_current_user, require_any_authenticated
from utils.database import db

router = APIRouter(prefix="/collections", tags=["Manufacturer Collections"])

collections_collection = db.manufacturer_collections
swatches_collection = db.swatches
seasons_collection = db.seasons
suppliers_collection = db.suppliers
users_collection = db.users

# Upload directory
UPLOAD_DIR = "/app/backend/uploads"
os.makedirs(f"{UPLOAD_DIR}/swatches", exist_ok=True)
os.makedirs(f"{UPLOAD_DIR}/swatches/thumbnails", exist_ok=True)


def generate_collection_code(season_code: str, count: int) -> str:
    return f"{season_code}-COL-{str(count).zfill(3)}"


def generate_swatch_code(season_code: str, supplier_code: str, count: int) -> str:
    return f"SWT-{season_code}-{supplier_code}-{str(count).zfill(4)}"


def create_thumbnail(image_path: str, thumbnail_path: str, size=(300, 300)):
    """Create a thumbnail from an image."""
    try:
        with PILImage.open(image_path) as img:
            img.thumbnail(size, PILImage.Resampling.LANCZOS)
            img.save(thumbnail_path, quality=85, optimize=True)
        return True
    except Exception as e:
        print(f"Thumbnail creation failed: {e}")
        return False


# ==================== COLLECTION ROUTES ====================

@router.post("/", response_model=ManufacturerCollectionResponse)
async def create_collection(
    collection: ManufacturerCollectionCreate,
    current_user: dict = Depends(require_any_authenticated)
):
    """Create a manufacturer collection for a season (Brand only)."""
    if current_user["role"] not in ["brand", "admin"]:
        raise HTTPException(status_code=403, detail="Only brands can create collections")
    
    # Verify season exists
    season = await seasons_collection.find_one({"id": collection.season_id})
    if not season:
        raise HTTPException(status_code=404, detail="Season not found")
    
    # Count existing collections for code generation
    count = await collections_collection.count_documents({"season_id": collection.season_id})
    collection_code = generate_collection_code(season["season_code"], count + 1)
    
    collection_data = {
        "id": str(uuid.uuid4()),
        "collection_code": collection_code,
        "season_id": collection.season_id,
        "season_code": season["season_code"],
        "brand_id": current_user["user_id"],
        **collection.model_dump(),
        "status": CollectionStatus.OPEN,
        "participating_suppliers": 0,
        "total_swatches": 0,
        "shortlisted_swatches": 0,
        "created_at": datetime.now(timezone.utc)
    }
    
    await collections_collection.insert_one(collection_data)
    return ManufacturerCollectionResponse(**collection_data)


@router.get("/", response_model=List[ManufacturerCollectionResponse])
async def list_collections(
    season_id: Optional[str] = None,
    status: Optional[CollectionStatus] = None,
    limit: int = 20,
    skip: int = 0,
    current_user: dict = Depends(require_any_authenticated)
):
    """List collections."""
    query = {}
    
    if current_user["role"] == "brand":
        query["brand_id"] = current_user["user_id"]
    elif current_user["role"] == "manufacturer":
        query["invited_suppliers"] = current_user["user_id"]
    
    if season_id:
        query["season_id"] = season_id
    if status:
        query["status"] = status
    
    cursor = collections_collection.find(query).sort("created_at", -1).skip(skip).limit(limit)
    collections = await cursor.to_list(length=limit)
    
    # Enrich with counts
    for col in collections:
        col["total_swatches"] = await swatches_collection.count_documents({"collection_id": col["id"]})
        col["shortlisted_swatches"] = await swatches_collection.count_documents({
            "collection_id": col["id"],
            "status": {"$in": ["shortlisted", "selected"]}
        })
        # Count participating suppliers
        suppliers = await swatches_collection.distinct("supplier_id", {"collection_id": col["id"]})
        col["participating_suppliers"] = len(suppliers)
    
    return [ManufacturerCollectionResponse(**c) for c in collections]


@router.get("/{collection_id}", response_model=ManufacturerCollectionResponse)
async def get_collection(
    collection_id: str,
    current_user: dict = Depends(require_any_authenticated)
):
    """Get collection details."""
    collection = await collections_collection.find_one({"id": collection_id})
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")
    
    # Enrich with counts
    collection["total_swatches"] = await swatches_collection.count_documents({"collection_id": collection_id})
    collection["shortlisted_swatches"] = await swatches_collection.count_documents({
        "collection_id": collection_id,
        "status": {"$in": ["shortlisted", "selected"]}
    })
    suppliers = await swatches_collection.distinct("supplier_id", {"collection_id": collection_id})
    collection["participating_suppliers"] = len(suppliers)
    
    return ManufacturerCollectionResponse(**collection)


@router.get("/{collection_id}/analytics")
async def get_collection_analytics(
    collection_id: str,
    current_user: dict = Depends(require_any_authenticated)
):
    """Get detailed analytics for a collection."""
    collection = await collections_collection.find_one({"id": collection_id})
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")
    
    # Status breakdown
    status_pipeline = [
        {"$match": {"collection_id": collection_id}},
        {"$group": {"_id": "$status", "count": {"$sum": 1}}}
    ]
    status_stats = await swatches_collection.aggregate(status_pipeline).to_list(None)
    
    # Fabric type breakdown
    fabric_pipeline = [
        {"$match": {"collection_id": collection_id}},
        {"$group": {"_id": "$metadata.fabric_type", "count": {"$sum": 1}}}
    ]
    fabric_stats = await swatches_collection.aggregate(fabric_pipeline).to_list(None)
    
    # Supplier stats
    supplier_pipeline = [
        {"$match": {"collection_id": collection_id}},
        {"$group": {
            "_id": "$supplier_id",
            "supplier_name": {"$first": "$supplier_name"},
            "total": {"$sum": 1},
            "shortlisted": {"$sum": {"$cond": [{"$in": ["$status", ["shortlisted", "selected"]]}, 1, 0]}},
            "rejected": {"$sum": {"$cond": [{"$eq": ["$status", "rejected"]}, 1, 0]}},
            "viewed": {"$sum": {"$cond": [{"$ne": ["$viewed_at", None]}, 1, 0]}}
        }},
        {"$sort": {"shortlisted": -1}}
    ]
    supplier_stats = await swatches_collection.aggregate(supplier_pipeline).to_list(None)
    
    # Top colors
    color_pipeline = [
        {"$match": {"collection_id": collection_id, "metadata.color": {"$ne": None}}},
        {"$group": {"_id": "$metadata.color", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 10}
    ]
    color_stats = await swatches_collection.aggregate(color_pipeline).to_list(None)
    
    # Average GSM
    gsm_pipeline = [
        {"$match": {"collection_id": collection_id, "metadata.gsm": {"$ne": None}}},
        {"$group": {"_id": None, "avg_gsm": {"$avg": "$metadata.gsm"}}}
    ]
    gsm_result = await swatches_collection.aggregate(gsm_pipeline).to_list(None)
    
    # Sustainable percentage
    total = await swatches_collection.count_documents({"collection_id": collection_id})
    sustainable = await swatches_collection.count_documents({
        "collection_id": collection_id,
        "tags": {"$in": ["sustainable", "organic", "recycled", "eco-friendly"]}
    })
    
    # Format supplier stats with ranks
    formatted_suppliers = []
    for i, s in enumerate(supplier_stats):
        formatted_suppliers.append({
            "supplier_id": s["_id"],
            "supplier_name": s["supplier_name"],
            "total_uploaded": s["total"],
            "viewed": s["viewed"],
            "shortlisted": s["shortlisted"],
            "selected": s["shortlisted"],  # Simplified
            "rejected": s["rejected"],
            "selection_rate": round((s["shortlisted"] / max(s["total"], 1)) * 100, 1),
            "rank": i + 1
        })
    
    return {
        "collection": ManufacturerCollectionResponse(**collection),
        "total_suppliers": len(collection.get("invited_suppliers", [])),
        "participating_suppliers": len(supplier_stats),
        "total_swatches": total,
        "by_status": {s["_id"]: s["count"] for s in status_stats},
        "by_fabric_type": {f["_id"]: f["count"] for f in fabric_stats},
        "by_supplier": formatted_suppliers,
        "top_colors": [{"color": c["_id"], "count": c["count"]} for c in color_stats],
        "avg_gsm": round(gsm_result[0]["avg_gsm"], 1) if gsm_result else 0,
        "sustainable_percentage": round((sustainable / max(total, 1)) * 100, 1)
    }


@router.put("/{collection_id}", response_model=ManufacturerCollectionResponse)
async def update_collection(
    collection_id: str,
    update: ManufacturerCollectionUpdate,
    current_user: dict = Depends(require_any_authenticated)
):
    """Update collection."""
    collection = await collections_collection.find_one({"id": collection_id})
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")
    
    if current_user["role"] not in ["admin"] and collection["brand_id"] != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    await collections_collection.update_one({"id": collection_id}, {"$set": update_data})
    updated = await collections_collection.find_one({"id": collection_id})
    return ManufacturerCollectionResponse(**updated)


@router.post("/{collection_id}/invite")
async def invite_suppliers(
    collection_id: str,
    supplier_ids: List[str],
    current_user: dict = Depends(require_any_authenticated)
):
    """Invite suppliers to a collection."""
    if current_user["role"] not in ["brand", "admin"]:
        raise HTTPException(status_code=403, detail="Only brands can invite suppliers")
    
    collection = await collections_collection.find_one({"id": collection_id})
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")
    
    current_invited = collection.get("invited_suppliers", [])
    new_invited = list(set(current_invited + supplier_ids))
    
    await collections_collection.update_one(
        {"id": collection_id},
        {"$set": {"invited_suppliers": new_invited, "updated_at": datetime.now(timezone.utc)}}
    )
    
    return {"message": f"Invited {len(supplier_ids)} suppliers", "total_invited": len(new_invited)}


# ==================== SWATCH ROUTES ====================

@router.post("/{collection_id}/swatches", response_model=SwatchResponse)
async def upload_swatch(
    collection_id: str,
    name: str = Form(...),
    fabric_type: FabricType = Form(...),
    gsm: Optional[int] = Form(None),
    composition: str = Form(...),
    weave_type: WeaveType = Form(...),
    color: Optional[str] = Form(None),
    color_code: Optional[str] = Form(None),
    pattern: Optional[str] = Form(None),
    finish: Optional[str] = Form(None),
    price_per_meter: Optional[float] = Form(None),
    moq_meters: Optional[int] = Form(None),
    lead_time_days: Optional[int] = Form(None),
    tags: Optional[str] = Form(None),  # Comma-separated
    certifications: Optional[str] = Form(None),  # Comma-separated
    description: Optional[str] = Form(None),
    image: UploadFile = File(...),
    current_user: dict = Depends(require_any_authenticated)
):
    """Upload a single swatch with image."""
    if current_user["role"] not in ["manufacturer", "designer", "admin"]:
        raise HTTPException(status_code=403, detail="Only manufacturers can upload swatches")
    
    collection = await collections_collection.find_one({"id": collection_id})
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")
    
    if collection["status"] != CollectionStatus.OPEN:
        raise HTTPException(status_code=400, detail="Collection is not open for submissions")
    
    # Check swatch limit
    supplier_count = await swatches_collection.count_documents({
        "collection_id": collection_id,
        "supplier_id": current_user["user_id"]
    })
    max_swatches = collection.get("max_swatches_per_supplier", 1000)
    if supplier_count >= max_swatches:
        raise HTTPException(status_code=400, detail=f"Swatch limit ({max_swatches}) reached")
    
    # Get supplier info
    supplier = await suppliers_collection.find_one({"user_id": current_user["user_id"]})
    supplier_name = supplier["company_name"] if supplier else "Unknown"
    supplier_code = supplier.get("supplier_code", current_user["user_id"][:6].upper())
    
    # Generate swatch code
    total_swatches = await swatches_collection.count_documents({"collection_id": collection_id})
    swatch_code = generate_swatch_code(collection["season_code"], supplier_code, total_swatches + 1)
    
    swatch_id = str(uuid.uuid4())
    
    # Save image
    ext = image.filename.split(".")[-1] if "." in image.filename else "jpg"
    image_filename = f"{swatch_id}.{ext}"
    image_path = f"{UPLOAD_DIR}/swatches/{image_filename}"
    thumbnail_path = f"{UPLOAD_DIR}/swatches/thumbnails/{image_filename}"
    
    content = await image.read()
    with open(image_path, "wb") as f:
        f.write(content)
    
    # Create thumbnail
    create_thumbnail(image_path, thumbnail_path)
    
    # Parse tags and certifications
    parsed_tags = [t.strip() for t in tags.split(",")] if tags else []
    parsed_certs = [c.strip() for c in certifications.split(",")] if certifications else []
    
    swatch_data = {
        "id": swatch_id,
        "swatch_code": swatch_code,
        "collection_id": collection_id,
        "season_id": collection["season_id"],
        "supplier_id": current_user["user_id"],
        "supplier_name": supplier_name,
        "name": name,
        "description": description,
        "metadata": {
            "fabric_type": fabric_type,
            "gsm": gsm,
            "composition": composition,
            "weave_type": weave_type,
            "color": color,
            "color_code": color_code,
            "pattern": pattern,
            "finish": finish,
            "price_per_meter": price_per_meter,
            "moq_meters": moq_meters,
            "lead_time_days": lead_time_days
        },
        "tags": parsed_tags,
        "certifications": parsed_certs,
        "image_url": f"/uploads/swatches/{image_filename}",
        "thumbnail_url": f"/uploads/swatches/thumbnails/{image_filename}",
        "additional_images": [],
        "status": SwatchStatus.UPLOADED,
        "is_duplicate": False,
        "similar_to": [],
        "selected_for_designs": [],
        "created_at": datetime.now(timezone.utc)
    }
    
    # Simple duplicate check (name + supplier)
    existing = await swatches_collection.find_one({
        "collection_id": collection_id,
        "name": {"$regex": f"^{name}$", "$options": "i"},
        "supplier_id": {"$ne": current_user["user_id"]}
    })
    if existing:
        swatch_data["is_duplicate"] = True
        swatch_data["similar_to"] = [existing["id"]]
    
    await swatches_collection.insert_one(swatch_data)
    return SwatchResponse(**swatch_data)


@router.post("/{collection_id}/swatches/bulk")
async def bulk_upload_swatches(
    collection_id: str,
    csv_file: Optional[UploadFile] = File(None),
    images: List[UploadFile] = File(default=[]),
    current_user: dict = Depends(require_any_authenticated)
):
    """Bulk upload swatches with CSV metadata and images."""
    if current_user["role"] not in ["manufacturer", "designer", "admin"]:
        raise HTTPException(status_code=403, detail="Only manufacturers can upload swatches")
    
    collection = await collections_collection.find_one({"id": collection_id})
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")
    
    # Get supplier info
    supplier = await suppliers_collection.find_one({"user_id": current_user["user_id"]})
    supplier_name = supplier["company_name"] if supplier else "Unknown"
    supplier_code = supplier.get("supplier_code", current_user["user_id"][:6].upper())
    
    uploaded_count = 0
    errors = []
    
    # Process CSV if provided
    swatch_metadata = {}
    if csv_file:
        content = await csv_file.read()
        csv_reader = csv.DictReader(io.StringIO(content.decode('utf-8')))
        for row in csv_reader:
            filename = row.get('filename', row.get('image', ''))
            swatch_metadata[filename] = row
    
    # Process images
    for image in images:
        try:
            total_swatches = await swatches_collection.count_documents({"collection_id": collection_id})
            swatch_code = generate_swatch_code(collection["season_code"], supplier_code, total_swatches + 1)
            swatch_id = str(uuid.uuid4())
            
            # Get metadata from CSV or use defaults
            meta = swatch_metadata.get(image.filename, {})
            
            ext = image.filename.split(".")[-1] if "." in image.filename else "jpg"
            image_filename = f"{swatch_id}.{ext}"
            image_path = f"{UPLOAD_DIR}/swatches/{image_filename}"
            thumbnail_path = f"{UPLOAD_DIR}/swatches/thumbnails/{image_filename}"
            
            content = await image.read()
            with open(image_path, "wb") as f:
                f.write(content)
            
            create_thumbnail(image_path, thumbnail_path)
            
            swatch_data = {
                "id": swatch_id,
                "swatch_code": swatch_code,
                "collection_id": collection_id,
                "season_id": collection["season_id"],
                "supplier_id": current_user["user_id"],
                "supplier_name": supplier_name,
                "name": meta.get('name', image.filename.rsplit('.', 1)[0]),
                "description": meta.get('description'),
                "metadata": {
                    "fabric_type": meta.get('fabric_type', 'other'),
                    "gsm": int(meta['gsm']) if meta.get('gsm') else None,
                    "composition": meta.get('composition', 'Not specified'),
                    "weave_type": meta.get('weave_type', 'woven'),
                    "color": meta.get('color'),
                    "color_code": meta.get('color_code'),
                    "pattern": meta.get('pattern'),
                    "finish": meta.get('finish'),
                    "price_per_meter": float(meta['price_per_meter']) if meta.get('price_per_meter') else None,
                    "moq_meters": int(meta['moq_meters']) if meta.get('moq_meters') else None,
                    "lead_time_days": int(meta['lead_time_days']) if meta.get('lead_time_days') else None
                },
                "tags": meta.get('tags', '').split(',') if meta.get('tags') else [],
                "certifications": meta.get('certifications', '').split(',') if meta.get('certifications') else [],
                "image_url": f"/uploads/swatches/{image_filename}",
                "thumbnail_url": f"/uploads/swatches/thumbnails/{image_filename}",
                "additional_images": [],
                "status": SwatchStatus.UPLOADED,
                "is_duplicate": False,
                "similar_to": [],
                "selected_for_designs": [],
                "created_at": datetime.now(timezone.utc)
            }
            
            await swatches_collection.insert_one(swatch_data)
            uploaded_count += 1
            
        except Exception as e:
            errors.append({"filename": image.filename, "error": str(e)})
    
    return {
        "message": f"Uploaded {uploaded_count} swatches",
        "uploaded": uploaded_count,
        "errors": errors
    }


@router.get("/{collection_id}/swatches", response_model=List[SwatchResponse])
async def list_swatches(
    collection_id: str,
    supplier_id: Optional[str] = None,
    fabric_type: Optional[FabricType] = None,
    weave_type: Optional[WeaveType] = None,
    gsm_min: Optional[int] = None,
    gsm_max: Optional[int] = None,
    color: Optional[str] = None,
    pattern: Optional[str] = None,
    status: Optional[SwatchStatus] = None,
    tags: Optional[str] = None,  # Comma-separated
    search: Optional[str] = None,
    sort_by: str = "created_at",
    sort_order: str = "desc",
    limit: int = 50,
    skip: int = 0,
    current_user: dict = Depends(require_any_authenticated)
):
    """List swatches with advanced filtering."""
    query = {"collection_id": collection_id}
    
    # Manufacturers only see their own swatches
    if current_user["role"] == "manufacturer":
        query["supplier_id"] = current_user["user_id"]
    elif supplier_id:
        query["supplier_id"] = supplier_id
    
    if fabric_type:
        query["metadata.fabric_type"] = fabric_type
    if weave_type:
        query["metadata.weave_type"] = weave_type
    if gsm_min or gsm_max:
        query["metadata.gsm"] = {}
        if gsm_min:
            query["metadata.gsm"]["$gte"] = gsm_min
        if gsm_max:
            query["metadata.gsm"]["$lte"] = gsm_max
    if color:
        query["metadata.color"] = {"$regex": color, "$options": "i"}
    if pattern:
        query["metadata.pattern"] = {"$regex": pattern, "$options": "i"}
    if status:
        query["status"] = status
    if tags:
        tag_list = [t.strip() for t in tags.split(",")]
        query["tags"] = {"$in": tag_list}
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"swatch_code": {"$regex": search, "$options": "i"}},
            {"supplier_name": {"$regex": search, "$options": "i"}}
        ]
    
    sort_dir = -1 if sort_order == "desc" else 1
    cursor = swatches_collection.find(query).sort(sort_by, sort_dir).skip(skip).limit(limit)
    swatches = await cursor.to_list(length=limit)
    
    return [SwatchResponse(**s) for s in swatches]


@router.get("/{collection_id}/swatches/count")
async def count_swatches(
    collection_id: str,
    current_user: dict = Depends(require_any_authenticated)
):
    """Get swatch counts for quick stats."""
    total = await swatches_collection.count_documents({"collection_id": collection_id})
    
    # Count by status
    status_pipeline = [
        {"$match": {"collection_id": collection_id}},
        {"$group": {"_id": "$status", "count": {"$sum": 1}}}
    ]
    status_counts = await swatches_collection.aggregate(status_pipeline).to_list(None)
    
    # Count unique suppliers
    suppliers = await swatches_collection.distinct("supplier_id", {"collection_id": collection_id})
    
    return {
        "total": total,
        "by_status": {s["_id"]: s["count"] for s in status_counts},
        "suppliers_count": len(suppliers)
    }


@router.get("/swatches/{swatch_id}", response_model=SwatchResponse)
async def get_swatch(
    swatch_id: str,
    current_user: dict = Depends(require_any_authenticated)
):
    """Get swatch details and mark as viewed."""
    swatch = await swatches_collection.find_one({"id": swatch_id})
    if not swatch:
        raise HTTPException(status_code=404, detail="Swatch not found")
    
    # Mark as viewed if brand is viewing
    if current_user["role"] in ["brand", "admin"] and not swatch.get("viewed_at"):
        await swatches_collection.update_one(
            {"id": swatch_id},
            {"$set": {"viewed_at": datetime.now(timezone.utc), "status": SwatchStatus.VIEWED}}
        )
        swatch["viewed_at"] = datetime.now(timezone.utc)
        swatch["status"] = SwatchStatus.VIEWED
    
    return SwatchResponse(**swatch)


@router.post("/{collection_id}/swatches/select")
async def select_swatches(
    collection_id: str,
    action: SwatchSelectionAction,
    current_user: dict = Depends(require_any_authenticated)
):
    """Bulk select/shortlist/reject swatches."""
    if current_user["role"] not in ["brand", "admin"]:
        raise HTTPException(status_code=403, detail="Only brands can select swatches")
    
    status_map = {
        "shortlist": SwatchStatus.SHORTLISTED,
        "select": SwatchStatus.SELECTED,
        "reject": SwatchStatus.REJECTED,
        "move_to_sampling": SwatchStatus.IN_SAMPLING
    }
    
    new_status = status_map.get(action.action)
    if not new_status:
        raise HTTPException(status_code=400, detail="Invalid action")
    
    update_data = {
        "status": new_status,
        "updated_at": datetime.now(timezone.utc)
    }
    
    if action.action == "shortlist":
        update_data["shortlisted_at"] = datetime.now(timezone.utc)
    elif action.action == "reject":
        update_data["rejection_reason"] = action.notes
    
    if action.notes:
        update_data["brand_notes"] = action.notes
    
    if action.design_id:
        update_data["$addToSet"] = {"selected_for_designs": action.design_id}
    
    result = await swatches_collection.update_many(
        {"id": {"$in": action.swatch_ids}, "collection_id": collection_id},
        {"$set": update_data}
    )
    
    return {
        "message": f"{result.modified_count} swatches updated",
        "action": action.action,
        "new_status": new_status
    }


@router.get("/{collection_id}/swatches/duplicates")
async def get_duplicate_swatches(
    collection_id: str,
    current_user: dict = Depends(require_any_authenticated)
):
    """Get list of potential duplicate swatches."""
    duplicates = await swatches_collection.find({
        "collection_id": collection_id,
        "is_duplicate": True
    }).to_list(None)
    
    return [SwatchResponse(**d) for d in duplicates]


@router.get("/{collection_id}/suppliers/stats")
async def get_supplier_stats(
    collection_id: str,
    current_user: dict = Depends(require_any_authenticated)
):
    """Get supplier-wise statistics for a collection."""
    pipeline = [
        {"$match": {"collection_id": collection_id}},
        {"$group": {
            "_id": "$supplier_id",
            "supplier_name": {"$first": "$supplier_name"},
            "total": {"$sum": 1},
            "uploaded": {"$sum": {"$cond": [{"$eq": ["$status", "uploaded"]}, 1, 0]}},
            "viewed": {"$sum": {"$cond": [{"$eq": ["$status", "viewed"]}, 1, 0]}},
            "shortlisted": {"$sum": {"$cond": [{"$eq": ["$status", "shortlisted"]}, 1, 0]}},
            "selected": {"$sum": {"$cond": [{"$eq": ["$status", "selected"]}, 1, 0]}},
            "rejected": {"$sum": {"$cond": [{"$eq": ["$status", "rejected"]}, 1, 0]}}
        }},
        {"$sort": {"shortlisted": -1}}
    ]
    
    stats = await swatches_collection.aggregate(pipeline).to_list(None)
    
    result = []
    for i, s in enumerate(stats):
        result.append({
            "supplier_id": s["_id"],
            "supplier_name": s["supplier_name"],
            "total_uploaded": s["total"],
            "viewed": s["viewed"],
            "shortlisted": s["shortlisted"],
            "selected": s["selected"],
            "rejected": s["rejected"],
            "selection_rate": round((s["shortlisted"] + s["selected"]) / max(s["total"], 1) * 100, 1),
            "rank": i + 1
        })
    
    return result
