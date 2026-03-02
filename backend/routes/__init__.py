# Routes package
from .auth import router as auth_router
from .users import router as users_router
from .batches import router as batches_router
from .materials import router as materials_router
from .production import router as production_router
from .shipments import router as shipments_router
from .audits import router as audits_router
from .dashboard import router as dashboard_router
from .reports import router as reports_router
from .suppliers import router as suppliers_router
from .purchase_orders import router as purchase_orders_router

__all__ = [
    "auth_router",
    "users_router",
    "batches_router",
    "materials_router",
    "production_router",
    "shipments_router",
    "audits_router",
    "dashboard_router",
    "reports_router",
    "suppliers_router",
    "purchase_orders_router",
]
