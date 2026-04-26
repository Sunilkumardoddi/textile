from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Query
from datetime import datetime, timezone
from typing import List, Optional
import uuid

from models.notification import (
    Notification, NotificationCreate, NotificationResponse,
    NotificationStatus, NotificationPreferences, NotificationEvent,
    NotificationChannel, NotificationPriority,
)
from utils.auth import get_current_user
from utils.database import db
from utils.notification_service import dispatch_notification, notify_event

router = APIRouter(prefix="/notifications", tags=["Notifications"])

notifications_col   = db.notifications
prefs_col           = db.notification_preferences
push_tokens_col     = db.push_tokens


# ── In-app feed ────────────────────────────────────────────────────────────────
@router.get("/", response_model=List[NotificationResponse])
async def get_my_notifications(
    status: Optional[str] = None,
    limit: int = Query(default=50, le=200),
    skip: int = 0,
    current_user: dict = Depends(get_current_user),
):
    """Get all notifications for the logged-in user."""
    query: dict = {"user_id": current_user["user_id"]}
    if status:
        query["status"] = status

    cursor = notifications_col.find(query).sort("created_at", -1).skip(skip).limit(limit)
    docs = await cursor.to_list(length=limit)
    return [NotificationResponse(**d) for d in docs]


@router.get("/unread-count")
async def get_unread_count(current_user: dict = Depends(get_current_user)):
    """Count unread (pending/sent) in-app notifications."""
    count = await notifications_col.count_documents({
        "user_id": current_user["user_id"],
        "status": {"$in": ["pending", "sent"]},
        "channels": "in_app",
    })
    return {"count": count}


@router.put("/{notification_id}/read")
async def mark_read(
    notification_id: str,
    current_user: dict = Depends(get_current_user),
):
    notif = await notifications_col.find_one({"id": notification_id, "user_id": current_user["user_id"]})
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")

    await notifications_col.update_one(
        {"id": notification_id},
        {"$set": {"status": NotificationStatus.READ, "read_at": datetime.now(timezone.utc).isoformat()}},
    )
    return {"message": "Marked as read"}


@router.put("/read-all")
async def mark_all_read(current_user: dict = Depends(get_current_user)):
    """Mark all pending/sent in-app notifications as read."""
    await notifications_col.update_many(
        {"user_id": current_user["user_id"], "status": {"$in": ["pending", "sent"]}},
        {"$set": {"status": NotificationStatus.READ, "read_at": datetime.now(timezone.utc).isoformat()}},
    )
    return {"message": "All notifications marked as read"}


@router.delete("/{notification_id}")
async def dismiss_notification(
    notification_id: str,
    current_user: dict = Depends(get_current_user),
):
    notif = await notifications_col.find_one({"id": notification_id, "user_id": current_user["user_id"]})
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    await notifications_col.update_one(
        {"id": notification_id},
        {"$set": {"status": NotificationStatus.DISMISSED}},
    )
    return {"message": "Dismissed"}


# ── Preferences ────────────────────────────────────────────────────────────────
@router.get("/preferences", response_model=NotificationPreferences)
async def get_preferences(current_user: dict = Depends(get_current_user)):
    doc = await prefs_col.find_one({"user_id": current_user["user_id"]})
    if not doc:
        return NotificationPreferences(user_id=current_user["user_id"])
    return NotificationPreferences(**doc)


@router.put("/preferences")
async def update_preferences(
    prefs: NotificationPreferences,
    current_user: dict = Depends(get_current_user),
):
    prefs.user_id = current_user["user_id"]
    prefs.updated_at = datetime.now(timezone.utc)
    doc = prefs.model_dump()
    doc["updated_at"] = doc["updated_at"].isoformat()
    await prefs_col.update_one(
        {"user_id": current_user["user_id"]},
        {"$set": doc},
        upsert=True,
    )
    return {"message": "Preferences updated"}


# ── Push token registration ────────────────────────────────────────────────────
@router.post("/push-token")
async def register_push_token(
    token: str,
    platform: str = "web",
    current_user: dict = Depends(get_current_user),
):
    """Register a device push token (FCM/web-push)."""
    await push_tokens_col.update_one(
        {"user_id": current_user["user_id"], "token": token},
        {"$set": {"user_id": current_user["user_id"], "token": token, "platform": platform, "updated_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True,
    )
    return {"message": "Push token registered"}


@router.delete("/push-token")
async def remove_push_token(
    token: str,
    current_user: dict = Depends(get_current_user),
):
    await push_tokens_col.delete_one({"user_id": current_user["user_id"], "token": token})
    return {"message": "Push token removed"}


# ── Admin send ─────────────────────────────────────────────────────────────────
@router.post("/send")
async def send_notification(
    notif_data: NotificationCreate,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user),
):
    """Send a notification manually (admin/testing)."""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    background_tasks.add_task(dispatch_notification, notif_data)
    return {"message": "Notification queued"}


@router.post("/test")
async def test_notification(
    channel: str = "in_app",
    current_user: dict = Depends(get_current_user),
):
    """Send a test notification to yourself."""
    ch = NotificationChannel(channel) if channel in [c.value for c in NotificationChannel] else NotificationChannel.IN_APP
    notif_data = NotificationCreate(
        user_id=current_user["user_id"],
        user_email=current_user.get("email"),
        user_phone=current_user.get("phone"),
        event=NotificationEvent.SYSTEM_ALERT,
        title="Test Notification",
        body=f"This is a test notification via {ch.value}. TextileTrace is working correctly.",
        priority=NotificationPriority.LOW,
        channels=[ch, NotificationChannel.IN_APP],
        data={"test": True},
    )
    notif = await dispatch_notification(notif_data)
    return {"message": "Test notification sent", "id": notif.id, "channel_status": notif.channel_status}
