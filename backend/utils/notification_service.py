"""
Notification Service — dispatches email, SMS, WhatsApp, push, and in-app alerts.
Providers are enabled via .env variables. Missing credentials → channel skipped gracefully.
"""
import os
import logging
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

from models.notification import (
    Notification, NotificationCreate, NotificationChannel,
    NotificationStatus, NotificationEvent, NotificationPreferences,
    NotificationPriority,
)
from utils.database import db

logger = logging.getLogger(__name__)

notifications_col = db.notifications
prefs_col = db.notification_preferences
push_tokens_col = db.push_tokens


# ── Email ──────────────────────────────────────────────────────────────────────
async def _send_email(notification: Notification) -> str:
    """Send email via SMTP (fastapi-mail). Returns 'sent' or 'failed'."""
    try:
        mail_user = os.environ.get("MAIL_USERNAME")
        mail_pass = os.environ.get("MAIL_PASSWORD")
        mail_from = os.environ.get("MAIL_FROM", mail_user)
        mail_server = os.environ.get("MAIL_SERVER", "smtp.gmail.com")
        mail_port = int(os.environ.get("MAIL_PORT", "587"))

        if not mail_user or not mail_pass:
            logger.info("Email: no SMTP credentials configured — skipped")
            return "skipped"

        from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
        conf = ConnectionConfig(
            MAIL_USERNAME=mail_user,
            MAIL_PASSWORD=mail_pass,
            MAIL_FROM=mail_from,
            MAIL_PORT=mail_port,
            MAIL_SERVER=mail_server,
            MAIL_STARTTLS=True,
            MAIL_SSL_TLS=False,
            USE_CREDENTIALS=True,
        )
        html_body = f"""
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
          <div style="background:#10B981;padding:20px;border-radius:8px 8px 0 0">
            <h2 style="color:white;margin:0">TextileTrace</h2>
          </div>
          <div style="padding:24px;background:#f8f9fa;border:1px solid #e5e7eb">
            <h3 style="color:#111827">{notification.title}</h3>
            <p style="color:#374151;font-size:15px">{notification.body}</p>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0">
            <p style="color:#6b7280;font-size:12px">
              TextileTrace Supply Chain Platform · This is an automated notification.
            </p>
          </div>
        </div>
        """
        message = MessageSchema(
            subject=f"[TextileTrace] {notification.title}",
            recipients=[notification.user_email],
            body=html_body,
            subtype=MessageType.html,
        )
        fm = FastMail(conf)
        await fm.send_message(message)
        logger.info(f"Email sent to {notification.user_email}")
        return "sent"
    except Exception as e:
        logger.error(f"Email send failed: {e}")
        return "failed"


# ── SMS ────────────────────────────────────────────────────────────────────────
def _send_sms(notification: Notification) -> str:
    """Send SMS via Twilio. Returns 'sent', 'skipped', or 'failed'."""
    try:
        account_sid = os.environ.get("TWILIO_ACCOUNT_SID")
        auth_token = os.environ.get("TWILIO_AUTH_TOKEN")
        from_number = os.environ.get("TWILIO_PHONE_NUMBER")

        if not account_sid or not auth_token or not from_number:
            logger.info("SMS: no Twilio credentials — skipped")
            return "skipped"
        if not notification.user_phone:
            return "skipped"

        from twilio.rest import Client
        client = Client(account_sid, auth_token)
        client.messages.create(
            body=f"[TextileTrace] {notification.title}\n{notification.body}",
            from_=from_number,
            to=notification.user_phone,
        )
        logger.info(f"SMS sent to {notification.user_phone}")
        return "sent"
    except Exception as e:
        logger.error(f"SMS send failed: {e}")
        return "failed"


# ── WhatsApp ───────────────────────────────────────────────────────────────────
def _send_whatsapp(notification: Notification) -> str:
    """Send WhatsApp via Twilio. Returns 'sent', 'skipped', or 'failed'."""
    try:
        account_sid = os.environ.get("TWILIO_ACCOUNT_SID")
        auth_token = os.environ.get("TWILIO_AUTH_TOKEN")
        wa_number = os.environ.get("TWILIO_WHATSAPP_NUMBER", "whatsapp:+14155238886")

        if not account_sid or not auth_token:
            logger.info("WhatsApp: no Twilio credentials — skipped")
            return "skipped"
        if not notification.user_phone:
            return "skipped"

        from twilio.rest import Client
        client = Client(account_sid, auth_token)
        client.messages.create(
            body=f"*TextileTrace Alert*\n*{notification.title}*\n{notification.body}",
            from_=wa_number,
            to=f"whatsapp:{notification.user_phone}",
        )
        logger.info(f"WhatsApp sent to {notification.user_phone}")
        return "sent"
    except Exception as e:
        logger.error(f"WhatsApp send failed: {e}")
        return "failed"


# ── Push (Firebase FCM) ────────────────────────────────────────────────────────
async def _send_push(notification: Notification) -> str:
    """Send push notification via Firebase FCM. Returns 'sent', 'skipped', or 'failed'."""
    try:
        firebase_creds = os.environ.get("FIREBASE_CREDENTIALS_JSON")
        if not firebase_creds:
            logger.info("Push: no Firebase credentials — skipped")
            return "skipped"

        tokens_cursor = push_tokens_col.find({"user_id": notification.user_id})
        tokens = [doc["token"] async for doc in tokens_cursor]
        if not tokens:
            return "skipped"

        import firebase_admin
        from firebase_admin import credentials, messaging
        import json

        if not firebase_admin._apps:
            cred = credentials.Certificate(json.loads(firebase_creds))
            firebase_admin.initialize_app(cred)

        priority_map = {
            NotificationPriority.CRITICAL: "high",
            NotificationPriority.HIGH:     "high",
            NotificationPriority.MEDIUM:   "normal",
            NotificationPriority.LOW:      "normal",
        }
        for token in tokens:
            msg = messaging.Message(
                notification=messaging.Notification(
                    title=notification.title,
                    body=notification.body,
                ),
                data={k: str(v) for k, v in notification.data.items()},
                android=messaging.AndroidConfig(priority=priority_map.get(notification.priority, "normal")),
                token=token,
            )
            messaging.send(msg)
        logger.info(f"Push sent to {len(tokens)} device(s) for user {notification.user_id}")
        return "sent"
    except Exception as e:
        logger.error(f"Push send failed: {e}")
        return "failed"


# ── Main dispatcher ────────────────────────────────────────────────────────────
async def dispatch_notification(notif_data: NotificationCreate) -> Notification:
    """
    Create a Notification record, dispatch all requested channels,
    update channel_status, persist to DB, and return the record.
    """
    notif = Notification(
        user_id=notif_data.user_id,
        user_email=notif_data.user_email,
        user_phone=notif_data.user_phone,
        event=notif_data.event,
        title=notif_data.title,
        body=notif_data.body,
        priority=notif_data.priority,
        channels=notif_data.channels,
        data=notif_data.data,
        channel_status={ch.value: "pending" for ch in notif_data.channels},
    )

    channel_results: Dict[str, str] = {}

    for channel in notif_data.channels:
        if channel == NotificationChannel.IN_APP:
            channel_results["in_app"] = "sent"

        elif channel == NotificationChannel.EMAIL and notif_data.user_email:
            channel_results["email"] = await _send_email(notif)

        elif channel == NotificationChannel.SMS:
            channel_results["sms"] = _send_sms(notif)

        elif channel == NotificationChannel.WHATSAPP:
            channel_results["whatsapp"] = _send_whatsapp(notif)

        elif channel == NotificationChannel.PUSH:
            channel_results["push"] = await _send_push(notif)

    notif.channel_status = channel_results
    any_sent = any(v == "sent" for v in channel_results.values())
    notif.status = NotificationStatus.SENT if any_sent else NotificationStatus.FAILED
    notif.sent_at = datetime.now(timezone.utc)

    doc = notif.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    if doc.get("sent_at"):
        doc["sent_at"] = doc["sent_at"].isoformat()
    await notifications_col.insert_one(doc)
    return notif


async def notify_event(
    event: NotificationEvent,
    title: str,
    body: str,
    user_ids: List[str],
    priority: NotificationPriority = NotificationPriority.MEDIUM,
    data: Optional[Dict[str, Any]] = None,
):
    """
    Convenience wrapper — looks up each user's preferences and phone/email,
    then dispatches notifications through appropriate channels.
    """
    from utils.database import users_collection
    if data is None:
        data = {}

    for user_id in user_ids:
        user = await users_collection.find_one({"id": user_id})
        if not user:
            continue

        prefs_doc = await prefs_col.find_one({"user_id": user_id})
        prefs = NotificationPreferences(**prefs_doc) if prefs_doc else NotificationPreferences(user_id=user_id)

        event_channels = prefs.events.get(event.value, ["in_app"])
        channels = []
        if "in_app" in event_channels and prefs.in_app_enabled:
            channels.append(NotificationChannel.IN_APP)
        if "email" in event_channels and prefs.email_enabled and user.get("email"):
            channels.append(NotificationChannel.EMAIL)
        if "sms" in event_channels and prefs.sms_enabled and user.get("phone"):
            channels.append(NotificationChannel.SMS)
        if "whatsapp" in event_channels and prefs.whatsapp_enabled and user.get("phone"):
            channels.append(NotificationChannel.WHATSAPP)
        if "push" in event_channels and prefs.push_enabled:
            channels.append(NotificationChannel.PUSH)

        if not channels:
            channels = [NotificationChannel.IN_APP]

        notif_data = NotificationCreate(
            user_id=user_id,
            user_email=user.get("email"),
            user_phone=user.get("phone"),
            event=event,
            title=title,
            body=body,
            priority=priority,
            channels=channels,
            data=data,
        )
        try:
            await dispatch_notification(notif_data)
        except Exception as e:
            logger.error(f"Failed to dispatch notification for user {user_id}: {e}")
