from datetime import datetime, timezone
from typing import Optional
from utils.database import activities_collection


async def log_activity(
    user_id: str,
    user_email: str,
    user_role: str,
    action: str,
    entity_type: str,
    entity_id: str,
    description: str,
    metadata: Optional[dict] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None
):
    """Log an activity to the activity log (immutable audit trail)."""
    import uuid
    
    activity = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "user_email": user_email,
        "user_role": user_role,
        "action": action,
        "entity_type": entity_type,
        "entity_id": entity_id,
        "description": description,
        "metadata": metadata or {},
        "ip_address": ip_address,
        "user_agent": user_agent,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "is_immutable": True
    }
    
    await activities_collection.insert_one(activity)
    return activity
