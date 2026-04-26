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

# Configure logging early so lifespan can use it
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

# Import database utilities
from utils.database import create_indexes, close_connection, users_collection

# Create upload directories
UPLOAD_DIR = ROOT_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)
(UPLOAD_DIR / "mood_boards").mkdir(exist_ok=True)
(UPLOAD_DIR / "designs").mkdir(exist_ok=True)
(UPLOAD_DIR / "cads").mkdir(exist_ok=True)
(UPLOAD_DIR / "documents").mkdir(exist_ok=True)
(UPLOAD_DIR / "sustainability_docs").mkdir(exist_ok=True)
(UPLOAD_DIR / "reports").mkdir(exist_ok=True)
(UPLOAD_DIR / "dispatch_docs").mkdir(exist_ok=True)


# Lifespan context manager for startup/shutdown
@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Startup
    logger.info("Starting Textile Traceability API...")
    await create_indexes()
    logger.info("Database indexes created")
    count = await users_collection.count_documents({})
    if count == 0:
        logger.info("Database is empty — running seed...")
        from seed_database import seed
        await seed()
        logger.info("Seed completed")
    yield
    # Shutdown
    logger.info("Shutting down...")
    await close_connection()


# Create the main app with redirect_slashes disabled to avoid mixed content issues
app = FastAPI(
    title="Textile Traceability Portal API",
    description="Cloud-Based Textile Traceability Portal with Multi-Role Access Control",
    version="1.0.0",
    lifespan=lifespan,
    redirect_slashes=False
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Health check endpoint
@api_router.get("/")
async def root():
    return {
        "message": "Textile Traceability API",
        "version": "1.0.0",
        "status": "healthy"
    }


@api_router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "textile-traceability-api",
        "version": "1.0.0"
    }


# Include all routers
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

# Include the router in the main app
app.include_router(api_router)

# Mount static files for uploads
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
