# Utils package
from .auth import (
    verify_password, 
    get_password_hash, 
    create_access_token, 
    decode_token,
    get_current_user,
    require_roles,
    require_admin,
    require_manufacturer,
    require_brand,
    require_auditor,
    require_any_authenticated
)
from .database import (
    db,
    users_collection,
    batches_collection,
    materials_collection,
    production_collection,
    shipments_collection,
    audits_collection,
    transactions_collection,
    documents_collection,
    activities_collection,
    alerts_collection,
    create_indexes,
    close_connection
)
from .activity_logger import log_activity
from .alerts import (
    create_alert,
    check_material_balance_alert,
    check_quantity_variation_alert,
    check_certificate_expiry
)

__all__ = [
    "verify_password",
    "get_password_hash",
    "create_access_token",
    "decode_token",
    "get_current_user",
    "require_roles",
    "require_admin",
    "require_manufacturer",
    "require_brand",
    "require_auditor",
    "require_any_authenticated",
    "db",
    "users_collection",
    "batches_collection",
    "materials_collection",
    "production_collection",
    "shipments_collection",
    "audits_collection",
    "transactions_collection",
    "documents_collection",
    "activities_collection",
    "alerts_collection",
    "create_indexes",
    "close_connection",
    "log_activity",
    "create_alert",
    "check_material_balance_alert",
    "check_quantity_variation_alert",
    "check_certificate_expiry",
]
