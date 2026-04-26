from fastapi import FastAPI, APIRouter
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from contextlib import asynccontextmanager

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Import routes
from routes.auth import router as auth_router
from routes.users import router as users_router
from routes.batches import router as batches_router
from routes.materials import router as materials_router
from routes.production import router as production_router
from routes.shipments import router as shipments_router
from routes.audits import router as audits_router
from routes.dashboard import router as dashboard_router
from routes.reports import router as reports_router
from routes.suppliers import router as suppliers_router
from routes.purchase_orders import router as purchase_orders_router
from routes.seasons import router as seasons_router
from routes.collections import router as collections_router
from routes.traceability import router as traceability_router
from routes.po_reports import router as po_reports_router
from routes.incoming import router as incoming_router
from routes.command_center import router as command_center_router
from routes.notifications import router as notifications_router

from utils.database import create_indexes, close_connection, users_collection

# Create upload directories — skip if filesystem is read-only (serverless)
UPLOAD_DIR = ROOT_DIR / "uploads"
try:
    UPLOAD_DIR.mkdir(exist_ok=True)
    for sub in ("mood_boards", "designs", "cads", "documents",
                "sustainability_docs", "reports", "dispatch_docs"):
        (UPLOAD_DIR / sub).mkdir(exist_ok=True)
except OSError:
    pass


@asynccontextmanager
async def lifespan(_app: FastAPI):
    logger.info("Starting Textile Traceability API...")
    try:
        await create_indexes()
        logger.info("Database indexes created")
        count = await users_collection.count_documents({})
        if count == 0:
            logger.info("Database is empty — running seed...")
            from seed_database import seed
            await seed()
            logger.info("Seed completed")
    except Exception as exc:
        logger.error(f"Startup warning (non-fatal): {exc}")
    yield
    logger.info("Shutting down...")
    try:
        await close_connection()
    except Exception:
        pass


app = FastAPI(
    title="Textile Traceability Portal API",
    description="Cloud-Based Textile Traceability Portal with Multi-Role Access Control",
    version="1.0.0",
    lifespan=lifespan,
    redirect_slashes=False
)

api_router = APIRouter(prefix="/api")


@api_router.get("/")
async def root():
    return {"message": "Textile Traceability API", "version": "1.0.0", "status": "healthy"}


@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "textile-traceability-api", "version": "1.0.0"}


api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(batches_router)
api_router.include_router(materials_router)
api_router.include_router(production_router)
api_router.include_router(shipments_router)
api_router.include_router(audits_router)
api_router.include_router(dashboard_router)
api_router.include_router(reports_router)
api_router.include_router(suppliers_router)
api_router.include_router(purchase_orders_router)
api_router.include_router(seasons_router)
api_router.include_router(collections_router)
api_router.include_router(traceability_router)
api_router.include_router(po_reports_router)
api_router.include_router(incoming_router)
api_router.include_router(command_center_router)
api_router.include_router(notifications_router)

app.include_router(api_router)

# Mount uploads only when the directory exists (skipped in serverless)
if UPLOAD_DIR.exists():
    try:
        app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")
    except Exception:
        pass

# CORS — use explicit origins so allow_credentials=True is valid
_raw_origins = os.environ.get('CORS_ORIGINS', '')
_origins = [o.strip() for o in _raw_origins.split(',') if o.strip()] if _raw_origins else []
# Wildcard not allowed with credentials; fall back to allow_credentials=False
_use_credentials = bool(_origins) and '*' not in _origins
app.add_middleware(
    CORSMiddleware,
    allow_credentials=_use_credentials,
    allow_origins=_origins if _origins and '*' not in _origins else ["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
