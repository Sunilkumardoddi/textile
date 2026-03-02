from datetime import datetime, timezone
from typing import List, Optional
import uuid
from utils.database import alerts_collection


async def create_alert(
    alert_type: str,
    severity: str,
    title: str,
    message: str,
    target_user_ids: List[str] = None,
    target_roles: List[str] = None,
    entity_type: Optional[str] = None,
    entity_id: Optional[str] = None,
    threshold_value: Optional[float] = None,
    actual_value: Optional[float] = None
):
    """Create a new alert."""
    alert = {
        "id": str(uuid.uuid4()),
        "alert_number": f"ALT-{datetime.now().strftime('%Y%m%d%H%M%S')}-{str(uuid.uuid4())[:4].upper()}",
        "alert_type": alert_type,
        "severity": severity,
        "title": title,
        "message": message,
        "status": "active",
        "entity_type": entity_type,
        "entity_id": entity_id,
        "threshold_value": threshold_value,
        "actual_value": actual_value,
        "target_user_ids": target_user_ids or [],
        "target_roles": target_roles or [],
        "acknowledged_by": None,
        "acknowledged_at": None,
        "resolved_by": None,
        "resolved_at": None,
        "resolution_notes": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "expires_at": None
    }
    
    await alerts_collection.insert_one(alert)
    return alert


async def check_material_balance_alert(batch_id: str, input_qty: float, output_qty: float, wastage_qty: float):
    """Check if material balance is within acceptable limits."""
    balance = input_qty - output_qty - wastage_qty
    variance_percentage = abs(balance) / input_qty * 100 if input_qty > 0 else 0
    
    # Alert if variance exceeds 5%
    if variance_percentage > 5:
        await create_alert(
            alert_type="material_balance",
            severity="warning" if variance_percentage < 10 else "critical",
            title="Material Balance Alert",
            message=f"Batch {batch_id} has a material balance variance of {variance_percentage:.2f}%",
            target_roles=["admin", "manufacturer"],
            entity_type="batch",
            entity_id=batch_id,
            threshold_value=5.0,
            actual_value=variance_percentage
        )
        return True
    return False


async def check_quantity_variation_alert(batch_id: str, expected_qty: float, actual_qty: float):
    """Check for suspicious quantity variations."""
    variation_percentage = abs(expected_qty - actual_qty) / expected_qty * 100 if expected_qty > 0 else 0
    
    # Alert if variation exceeds 10%
    if variation_percentage > 10:
        await create_alert(
            alert_type="quantity_variation",
            severity="warning" if variation_percentage < 20 else "critical",
            title="Suspicious Quantity Variation",
            message=f"Batch {batch_id} shows a {variation_percentage:.2f}% variation from expected quantity",
            target_roles=["admin", "auditor"],
            entity_type="batch",
            entity_id=batch_id,
            threshold_value=10.0,
            actual_value=variation_percentage
        )
        return True
    return False


async def check_certificate_expiry(document_id: str, document_name: str, expiry_date: datetime, days_before: int = 30):
    """Check if a certificate is expiring soon."""
    if expiry_date:
        days_until_expiry = (expiry_date - datetime.now(timezone.utc)).days
        
        if days_until_expiry <= days_before:
            severity = "info" if days_until_expiry > 7 else ("warning" if days_until_expiry > 0 else "critical")
            status_text = f"expires in {days_until_expiry} days" if days_until_expiry > 0 else "has expired"
            
            await create_alert(
                alert_type="certificate_expiry",
                severity=severity,
                title="Certificate Expiry Alert",
                message=f"Document '{document_name}' {status_text}",
                target_roles=["admin", "manufacturer"],
                entity_type="document",
                entity_id=document_id,
                threshold_value=float(days_before),
                actual_value=float(days_until_expiry)
            )
            return True
    return False
