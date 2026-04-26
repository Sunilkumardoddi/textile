"""
TextileTrace — Database Seed Script
Populates all MongoDB collections with realistic data so every
dashboard, chart, and page is driven by real database records.

Run:  python seed_database.py
      (or it is called automatically on first server startup)
"""

import asyncio
import os
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT_DIR = Path(__file__).parent
sys.path.insert(0, str(ROOT_DIR))

from dotenv import load_dotenv
load_dotenv(ROOT_DIR / '.env')

from passlib.context import CryptContext
from motor.motor_asyncio import AsyncIOMotorClient

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME   = os.environ.get('DB_NAME',   'textile_traceability')

client = AsyncIOMotorClient(MONGO_URL)
db     = client[DB_NAME]

def now():
    return datetime.now(timezone.utc)

def dt(days_offset=0):
    return (now() + timedelta(days=days_offset)).isoformat()

def hash_pw(pw: str) -> str:
    return pwd_context.hash(pw)

# ── Fixed IDs ──────────────────────────────────────────────────────
ADMIN_ID   = "usr_admin_001"
BRAND1_ID  = "usr_brand_001"
BRAND2_ID  = "usr_brand_002"
MFR1_ID    = "usr_mfr_001"
MFR2_ID    = "usr_mfr_002"
MFR3_ID    = "usr_mfr_003"
AUDIT1_ID  = "usr_auditor_001"

SUP1_ID    = "sup_001"
SUP2_ID    = "sup_002"
SUP3_ID    = "sup_003"

S1_ID      = "season_aw27"
S2_ID      = "season_ss27"
S3_ID      = "season_aw26"

MB1_ID     = "mb_001"
MB2_ID     = "mb_002"

COL1_ID    = "col_001"
COL2_ID    = "col_002"

PO1_ID     = "po_001"
PO2_ID     = "po_002"
PO3_ID     = "po_003"
PO4_ID     = "po_004"
PO5_ID     = "po_005"

DEST1_ID   = "dest_001"
DEST2_ID   = "dest_002"

INV1_ID    = "inv_001"
INV2_ID    = "inv_002"
INV3_ID    = "inv_003"

DISP1_ID   = "disp_001"
DISP2_ID   = "disp_002"

BATCH1_ID  = "batch_001"
BATCH2_ID  = "batch_002"
BATCH3_ID  = "batch_003"


# ══════════════════════════════════════════════════════════════════
# USERS
# ══════════════════════════════════════════════════════════════════
USERS = [
    {
        "id": ADMIN_ID,
        "email": "admin@textiletrace.com",
        "name": "Super Admin",
        "role": "admin",
        "company_name": "TextileTrace Platform",
        "phone": "+1-555-000-0001",
        "address": "123 Platform Ave, San Francisco, CA",
        "country": "USA",
        "hashed_password": hash_pw("Admin@123"),
        "status": "active",
        "is_verified": True,
        "failed_login_attempts": 0,
        "is_deleted": False,
        "created_at": dt(-180),
        "updated_at": dt(-180),
        "last_login": dt(-1),
    },
    {
        "id": BRAND1_ID,
        "email": "brand@textiletrace.com",
        "name": "Sarah Johnson",
        "role": "brand",
        "company_name": "EcoFashion Ltd",
        "phone": "+44-20-7946-0958",
        "address": "45 Fashion Street, London, E1 6PX",
        "country": "UK",
        "hashed_password": hash_pw("Brand@123"),
        "status": "active",
        "is_verified": True,
        "failed_login_attempts": 0,
        "is_deleted": False,
        "created_at": dt(-150),
        "updated_at": dt(-10),
        "last_login": dt(-1),
    },
    {
        "id": BRAND2_ID,
        "email": "brand2@textiletrace.com",
        "name": "Marcus Chen",
        "role": "brand",
        "company_name": "StyleForward Inc",
        "phone": "+1-212-555-0120",
        "address": "200 Fifth Avenue, New York, NY 10001",
        "country": "USA",
        "hashed_password": hash_pw("Brand@123"),
        "status": "active",
        "is_verified": True,
        "failed_login_attempts": 0,
        "is_deleted": False,
        "created_at": dt(-120),
        "updated_at": dt(-5),
        "last_login": dt(-2),
    },
    {
        "id": MFR1_ID,
        "email": "manufacturer@textiletrace.com",
        "name": "Rajesh Kumar",
        "role": "manufacturer",
        "company_name": "Sunrise Garments Pvt Ltd",
        "phone": "+91-22-6173-0000",
        "address": "Plot 47, MIDC Industrial Area, Bhiwandi, Maharashtra",
        "country": "India",
        "hashed_password": hash_pw("Mfr@123"),
        "status": "active",
        "is_verified": True,
        "failed_login_attempts": 0,
        "is_deleted": False,
        "created_at": dt(-140),
        "updated_at": dt(-7),
        "last_login": dt(-1),
    },
    {
        "id": MFR2_ID,
        "email": "manufacturer2@textiletrace.com",
        "name": "Ahmed Hassan",
        "role": "manufacturer",
        "company_name": "Blue Thread Mills",
        "phone": "+880-2-9885000",
        "address": "Sector 7, Ashulia, Dhaka",
        "country": "Bangladesh",
        "hashed_password": hash_pw("Mfr@123"),
        "status": "active",
        "is_verified": True,
        "failed_login_attempts": 0,
        "is_deleted": False,
        "created_at": dt(-130),
        "updated_at": dt(-3),
        "last_login": dt(-1),
    },
    {
        "id": MFR3_ID,
        "email": "manufacturer3@textiletrace.com",
        "name": "Mei Lin",
        "role": "manufacturer",
        "company_name": "Heritage Textiles Co",
        "phone": "+86-20-8765-4321",
        "address": "No. 88 Textile Road, Guangzhou, Guangdong",
        "country": "China",
        "hashed_password": hash_pw("Mfr@123"),
        "status": "active",
        "is_verified": True,
        "failed_login_attempts": 0,
        "is_deleted": False,
        "created_at": dt(-110),
        "updated_at": dt(-4),
        "last_login": dt(-2),
    },
    {
        "id": AUDIT1_ID,
        "email": "auditor@textiletrace.com",
        "name": "Elena Vasquez",
        "role": "auditor",
        "company_name": "Global Audit Services",
        "phone": "+34-91-555-0199",
        "address": "Calle Mayor 15, Madrid",
        "country": "Spain",
        "hashed_password": hash_pw("Audit@123"),
        "status": "active",
        "is_verified": True,
        "failed_login_attempts": 0,
        "is_deleted": False,
        "created_at": dt(-100),
        "updated_at": dt(-6),
        "last_login": dt(-3),
    },
]


# ══════════════════════════════════════════════════════════════════
# SUPPLIERS  (one per manufacturer user)
# ══════════════════════════════════════════════════════════════════
SUPPLIERS = [
    {
        "id": SUP1_ID,
        "supplier_id": "SUP-20260101-SR001",
        "user_id": MFR1_ID,
        "company_name": "Sunrise Garments Pvt Ltd",
        "factory_address": "Plot 47, MIDC Industrial Area, Bhiwandi, Maharashtra",
        "country": "India",
        "contact_person": "Rajesh Kumar",
        "email": "manufacturer@textiletrace.com",
        "phone": "+91-22-6173-0000",
        "certification_types": ["gots", "oeko_tex", "sa8000"],
        "audit_status": "passed",
        "production_capacity": "80000 units/month",
        "product_categories": ["garments", "fabric"],
        "status": "active",
        "compliance_score": 87.5,
        "risk_category": "low",
        "on_time_delivery_rate": 91.2,
        "audit_pass_rate": 88.0,
        "rejection_rate": 2.1,
        "total_pos": 24,
        "completed_pos": 19,
        "is_locked": False,
        "is_deleted": False,
        "created_at": dt(-140),
        "updated_at": dt(-7),
        "created_by": ADMIN_ID,
    },
    {
        "id": SUP2_ID,
        "supplier_id": "SUP-20260101-BT002",
        "user_id": MFR2_ID,
        "company_name": "Blue Thread Mills",
        "factory_address": "Sector 7, Ashulia, Dhaka",
        "country": "Bangladesh",
        "contact_person": "Ahmed Hassan",
        "email": "manufacturer2@textiletrace.com",
        "phone": "+880-2-9885000",
        "certification_types": ["wrap", "sedex", "bci"],
        "audit_status": "passed",
        "production_capacity": "120000 units/month",
        "product_categories": ["garments", "dyeing"],
        "status": "active",
        "compliance_score": 79.3,
        "risk_category": "medium",
        "on_time_delivery_rate": 83.5,
        "audit_pass_rate": 80.0,
        "rejection_rate": 3.8,
        "total_pos": 31,
        "completed_pos": 24,
        "is_locked": False,
        "is_deleted": False,
        "created_at": dt(-130),
        "updated_at": dt(-3),
        "created_by": ADMIN_ID,
    },
    {
        "id": SUP3_ID,
        "supplier_id": "SUP-20260101-HT003",
        "user_id": MFR3_ID,
        "company_name": "Heritage Textiles Co",
        "factory_address": "No. 88 Textile Road, Guangzhou, Guangdong",
        "country": "China",
        "contact_person": "Mei Lin",
        "email": "manufacturer3@textiletrace.com",
        "phone": "+86-20-8765-4321",
        "certification_types": ["iso_9001", "iso_14001", "grs"],
        "audit_status": "conditional",
        "production_capacity": "200000 units/month",
        "product_categories": ["fabric", "yarn", "finishing"],
        "status": "active",
        "compliance_score": 65.0,
        "risk_category": "high",
        "on_time_delivery_rate": 74.0,
        "audit_pass_rate": 70.0,
        "rejection_rate": 5.2,
        "total_pos": 18,
        "completed_pos": 12,
        "is_locked": False,
        "is_deleted": False,
        "created_at": dt(-110),
        "updated_at": dt(-4),
        "created_by": ADMIN_ID,
    },
]


# ══════════════════════════════════════════════════════════════════
# SEASONS
# ══════════════════════════════════════════════════════════════════
SEASONS = [
    {
        "id": S1_ID,
        "season_code": "AW27",
        "name": "Autumn/Winter 2027",
        "season_type": "fall_winter",
        "year": 2027,
        "description": "Premium outerwear and knitwear collection focused on sustainable materials",
        "start_date": dt(30),
        "end_date": dt(240),
        "target_styles": 120,
        "budget": 2500000.0,
        "status": "production",
        "brand_id": BRAND1_ID,
        "created_by": BRAND1_ID,
        "total_designs_submitted": 98,
        "total_designs_selected": 74,
        "total_pos_created": 12,
        "created_at": dt(-60),
        "updated_at": dt(-5),
    },
    {
        "id": S2_ID,
        "season_code": "SS27",
        "name": "Spring/Summer 2027",
        "season_type": "spring_summer",
        "year": 2027,
        "description": "Lightweight breathable fabrics with bold tropical prints",
        "start_date": dt(120),
        "end_date": dt(300),
        "target_styles": 90,
        "budget": 1800000.0,
        "status": "design_phase",
        "brand_id": BRAND1_ID,
        "created_by": BRAND1_ID,
        "total_designs_submitted": 42,
        "total_designs_selected": 18,
        "total_pos_created": 4,
        "created_at": dt(-30),
        "updated_at": dt(-2),
    },
    {
        "id": S3_ID,
        "season_code": "AW26",
        "name": "Autumn/Winter 2026",
        "season_type": "fall_winter",
        "year": 2026,
        "description": "Classic heritage collection with wool and cashmere blends",
        "start_date": dt(-200),
        "end_date": dt(-30),
        "target_styles": 100,
        "budget": 2000000.0,
        "status": "completed",
        "brand_id": BRAND1_ID,
        "created_by": BRAND1_ID,
        "total_designs_submitted": 115,
        "total_designs_selected": 92,
        "total_pos_created": 18,
        "created_at": dt(-240),
        "updated_at": dt(-30),
    },
]


# ══════════════════════════════════════════════════════════════════
# MOOD BOARDS
# ══════════════════════════════════════════════════════════════════
MOOD_BOARDS = [
    {
        "id": MB1_ID,
        "title": "Nordic Minimalism",
        "description": "Inspired by Scandinavian winter landscapes — muted tones and clean silhouettes",
        "theme": "Minimalist",
        "target_market": "Premium women's wear 25-45",
        "season_id": S1_ID,
        "brand_id": BRAND1_ID,
        "created_by": BRAND1_ID,
        "color_palette": [
            {"name": "Arctic White", "hex_code": "#F5F5F0", "pantone_code": "11-0601 TCX"},
            {"name": "Steel Grey",   "hex_code": "#8C9DAD", "pantone_code": "17-4021 TCX"},
            {"name": "Midnight Navy","hex_code": "#1A2744", "pantone_code": "19-4024 TCX"},
            {"name": "Rust Copper",  "hex_code": "#B5572A", "pantone_code": "18-1244 TCX"},
        ],
        "fabric_swatches": [
            {"name": "Boiled Wool",    "composition": "100% Merino Wool",       "gsm": 380, "weave_type": "plain",   "supplier": "Heritage Textiles"},
            {"name": "Ponte Roma",     "composition": "62% Poly 33% Viscose",   "gsm": 290, "weave_type": "knit",    "supplier": "Blue Thread Mills"},
            {"name": "Organic Cotton", "composition": "100% Organic Cotton",    "gsm": 160, "weave_type": "twill",   "supplier": "Sunrise Garments"},
        ],
        "tags": ["minimalist", "nordic", "sustainable", "wool"],
        "images": [],
        "inspiration_links": [],
        "created_at": dt(-55),
        "updated_at": dt(-10),
    },
    {
        "id": MB2_ID,
        "title": "Urban Street",
        "description": "City-inspired functional wear merging performance fabrics with street aesthetics",
        "theme": "Streetwear",
        "target_market": "Unisex 18-35 urban",
        "season_id": S2_ID,
        "brand_id": BRAND1_ID,
        "created_by": BRAND1_ID,
        "color_palette": [
            {"name": "Electric Yellow", "hex_code": "#FFE600", "pantone_code": "012 C"},
            {"name": "Jet Black",       "hex_code": "#0D0D0D", "pantone_code": "Black C"},
            {"name": "Signal Orange",   "hex_code": "#F26000", "pantone_code": "152 C"},
        ],
        "fabric_swatches": [
            {"name": "4-Way Stretch", "composition": "88% Poly 12% Spandex", "gsm": 210, "weave_type": "knit", "supplier": "Heritage Textiles"},
            {"name": "Ripstop Nylon", "composition": "100% Nylon",           "gsm": 120, "weave_type": "plain","supplier": "Blue Thread Mills"},
        ],
        "tags": ["streetwear", "urban", "performance", "bold"],
        "images": [],
        "inspiration_links": [],
        "created_at": dt(-25),
        "updated_at": dt(-3),
    },
]


# ══════════════════════════════════════════════════════════════════
# MANUFACTURER COLLECTIONS (Swatch collections)
# ══════════════════════════════════════════════════════════════════
COLLECTIONS = [
    {
        "id": COL1_ID,
        "name": "AW27 Fabric Selection",
        "season_id": S1_ID,
        "brand_id": BRAND1_ID,
        "deadline": dt(15),
        "max_swatches_per_supplier": 50,
        "guidelines": "Submit only GOTS or OEKO-TEX certified fabrics. Min GSM 180. Include full composition and lab test reports.",
        "status": "open",
        "invited_suppliers": [SUP1_ID, SUP2_ID, SUP3_ID],
        "created_by": BRAND1_ID,
        "created_at": dt(-40),
        "updated_at": dt(-5),
    },
    {
        "id": COL2_ID,
        "name": "SS27 Lightweight Fabrics",
        "season_id": S2_ID,
        "brand_id": BRAND1_ID,
        "deadline": dt(45),
        "max_swatches_per_supplier": 30,
        "guidelines": "Focus on breathable fabrics under 150 GSM. Sustainable dye certifications required.",
        "status": "open",
        "invited_suppliers": [SUP1_ID, SUP2_ID],
        "created_by": BRAND1_ID,
        "created_at": dt(-20),
        "updated_at": dt(-2),
    },
]


# ══════════════════════════════════════════════════════════════════
# SWATCHES
# ══════════════════════════════════════════════════════════════════
SWATCHES = [
    {
        "id": "sw_001",
        "swatch_code": "SR-AW27-001",
        "collection_id": COL1_ID,
        "supplier_id": SUP1_ID,
        "supplier_name": "Sunrise Garments Pvt Ltd",
        "fabric_type": "Woven",
        "weave_type": "Twill",
        "gsm": 320,
        "composition": "70% Wool 30% Polyester",
        "color": "Charcoal Grey",
        "pattern": "Solid",
        "certifications": ["oeko_tex"],
        "price_per_meter": 12.50,
        "moq": 500,
        "lead_time_days": 45,
        "tags": ["wool", "winter", "premium"],
        "status": "shortlisted",
        "image_url": None,
        "thumbnail_url": None,
        "is_duplicate": False,
        "created_at": dt(-35),
        "updated_at": dt(-10),
    },
    {
        "id": "sw_002",
        "swatch_code": "SR-AW27-002",
        "collection_id": COL1_ID,
        "supplier_id": SUP1_ID,
        "supplier_name": "Sunrise Garments Pvt Ltd",
        "fabric_type": "Knit",
        "weave_type": "Rib",
        "gsm": 280,
        "composition": "100% Organic Cotton",
        "color": "Off White",
        "pattern": "Stripe",
        "certifications": ["gots"],
        "price_per_meter": 8.75,
        "moq": 300,
        "lead_time_days": 35,
        "tags": ["organic", "cotton", "casual"],
        "status": "selected",
        "image_url": None,
        "thumbnail_url": None,
        "is_duplicate": False,
        "created_at": dt(-35),
        "updated_at": dt(-8),
    },
    {
        "id": "sw_003",
        "swatch_code": "BT-AW27-001",
        "collection_id": COL1_ID,
        "supplier_id": SUP2_ID,
        "supplier_name": "Blue Thread Mills",
        "fabric_type": "Woven",
        "weave_type": "Plain",
        "gsm": 200,
        "composition": "60% Cotton 40% Polyester",
        "color": "Navy Blue",
        "pattern": "Solid",
        "certifications": ["wrap"],
        "price_per_meter": 6.20,
        "moq": 1000,
        "lead_time_days": 30,
        "tags": ["cotton", "blend", "versatile"],
        "status": "uploaded",
        "image_url": None,
        "thumbnail_url": None,
        "is_duplicate": False,
        "created_at": dt(-30),
        "updated_at": dt(-30),
    },
    {
        "id": "sw_004",
        "swatch_code": "HT-AW27-001",
        "collection_id": COL1_ID,
        "supplier_id": SUP3_ID,
        "supplier_name": "Heritage Textiles Co",
        "fabric_type": "Woven",
        "weave_type": "Satin",
        "gsm": 145,
        "composition": "100% Polyester",
        "color": "Burgundy",
        "pattern": "Jacquard",
        "certifications": ["grs"],
        "price_per_meter": 9.80,
        "moq": 800,
        "lead_time_days": 40,
        "tags": ["polyester", "recycled", "evening"],
        "status": "viewed",
        "image_url": None,
        "thumbnail_url": None,
        "is_duplicate": False,
        "created_at": dt(-28),
        "updated_at": dt(-15),
    },
]


# ══════════════════════════════════════════════════════════════════
# PURCHASE ORDERS
# ══════════════════════════════════════════════════════════════════
PURCHASE_ORDERS = [
    {
        "id": PO1_ID,
        "po_number": "PO-ECO-2026-001",
        "brand_id": BRAND1_ID,
        "brand_name": "EcoFashion Ltd",
        "supplier_id": SUP1_ID,
        "supplier_name": "Sunrise Garments Pvt Ltd",
        "season_id": S1_ID,
        "season_code": "AW27",
        "status": "in_production",
        "priority": "high",
        "line_items": [
            {"item_id": "li_001", "product_name": "Wool Overcoat", "product_code": "WO-001", "quantity": 2000, "unit": "pcs", "unit_price": 45.00, "total_price": 90000.00, "color": "Charcoal", "size": "XS-XXL"},
            {"item_id": "li_002", "product_name": "Cashmere Sweater", "product_code": "CS-001", "quantity": 1500, "unit": "pcs", "unit_price": 38.00, "total_price": 57000.00, "color": "Ivory", "size": "XS-XL"},
        ],
        "delivery_date": dt(45),
        "delivery_address": "EcoFashion Warehouse, Park Royal, London NW10 7LQ",
        "payment_terms": "Net 60",
        "shipping_terms": "FOB Mumbai",
        "notes": "Priority order for AW27 launch. All items must carry GOTS certification.",
        "subtotal": 147000.00,
        "tax_amount": 0.00,
        "total_amount": 147000.00,
        "currency": "USD",
        "accepted_at": dt(-50),
        "production_started_at": dt(-40),
        "batch_ids": [BATCH1_ID],
        "shipment_ids": [],
        "audit_ids": [],
        "status_history": [
            {"status": "awaiting_acceptance", "changed_at": dt(-55), "changed_by": BRAND1_ID},
            {"status": "accepted",            "changed_at": dt(-50), "changed_by": MFR1_ID},
            {"status": "in_production",       "changed_at": dt(-40), "changed_by": MFR1_ID},
        ],
        "is_locked": False,
        "is_deleted": False,
        "created_at": dt(-55),
        "updated_at": dt(-40),
    },
    {
        "id": PO2_ID,
        "po_number": "PO-ECO-2026-002",
        "brand_id": BRAND1_ID,
        "brand_name": "EcoFashion Ltd",
        "supplier_id": SUP2_ID,
        "supplier_name": "Blue Thread Mills",
        "season_id": S1_ID,
        "season_code": "AW27",
        "status": "quality_check",
        "priority": "normal",
        "line_items": [
            {"item_id": "li_003", "product_name": "Denim Jacket", "product_code": "DJ-001", "quantity": 3000, "unit": "pcs", "unit_price": 28.00, "total_price": 84000.00, "color": "Indigo", "size": "XS-XXL"},
            {"item_id": "li_004", "product_name": "Cargo Trousers", "product_code": "CT-001", "quantity": 2500, "unit": "pcs", "unit_price": 22.00, "total_price": 55000.00, "color": "Khaki", "size": "28-38"},
        ],
        "delivery_date": dt(20),
        "delivery_address": "EcoFashion Warehouse, Park Royal, London NW10 7LQ",
        "payment_terms": "Net 45",
        "shipping_terms": "CIF London",
        "notes": "Ensure proper wash tests before shipment.",
        "subtotal": 139000.00,
        "tax_amount": 0.00,
        "total_amount": 139000.00,
        "currency": "USD",
        "accepted_at": dt(-45),
        "production_started_at": dt(-35),
        "batch_ids": [BATCH2_ID],
        "shipment_ids": [],
        "audit_ids": [],
        "status_history": [
            {"status": "awaiting_acceptance", "changed_at": dt(-48), "changed_by": BRAND1_ID},
            {"status": "accepted",            "changed_at": dt(-45), "changed_by": MFR2_ID},
            {"status": "in_production",       "changed_at": dt(-35), "changed_by": MFR2_ID},
            {"status": "quality_check",       "changed_at": dt(-5),  "changed_by": MFR2_ID},
        ],
        "is_locked": False,
        "is_deleted": False,
        "created_at": dt(-48),
        "updated_at": dt(-5),
    },
    {
        "id": PO3_ID,
        "po_number": "PO-ECO-2026-003",
        "brand_id": BRAND1_ID,
        "brand_name": "EcoFashion Ltd",
        "supplier_id": SUP3_ID,
        "supplier_name": "Heritage Textiles Co",
        "season_id": S1_ID,
        "season_code": "AW27",
        "status": "shipped",
        "priority": "urgent",
        "line_items": [
            {"item_id": "li_005", "product_name": "Silk Blouse", "product_code": "SB-001", "quantity": 1000, "unit": "pcs", "unit_price": 55.00, "total_price": 55000.00, "color": "Cream", "size": "XS-XL"},
        ],
        "delivery_date": dt(5),
        "delivery_address": "EcoFashion Warehouse, Park Royal, London NW10 7LQ",
        "payment_terms": "Net 30",
        "shipping_terms": "FOB Guangzhou",
        "notes": "Express production required.",
        "subtotal": 55000.00,
        "tax_amount": 0.00,
        "total_amount": 55000.00,
        "currency": "USD",
        "accepted_at": dt(-60),
        "production_started_at": dt(-55),
        "shipped_at": dt(-7),
        "batch_ids": [BATCH3_ID],
        "shipment_ids": [DISP1_ID],
        "audit_ids": [],
        "status_history": [
            {"status": "awaiting_acceptance", "changed_at": dt(-63), "changed_by": BRAND1_ID},
            {"status": "accepted",            "changed_at": dt(-60), "changed_by": MFR3_ID},
            {"status": "in_production",       "changed_at": dt(-55), "changed_by": MFR3_ID},
            {"status": "quality_check",       "changed_at": dt(-12), "changed_by": MFR3_ID},
            {"status": "ready_to_ship",       "changed_at": dt(-9),  "changed_by": MFR3_ID},
            {"status": "shipped",             "changed_at": dt(-7),  "changed_by": MFR3_ID},
        ],
        "is_locked": False,
        "is_deleted": False,
        "created_at": dt(-63),
        "updated_at": dt(-7),
    },
    {
        "id": PO4_ID,
        "po_number": "PO-ECO-2026-004",
        "brand_id": BRAND1_ID,
        "brand_name": "EcoFashion Ltd",
        "supplier_id": SUP1_ID,
        "supplier_name": "Sunrise Garments Pvt Ltd",
        "season_id": S2_ID,
        "season_code": "SS27",
        "status": "accepted",
        "priority": "normal",
        "line_items": [
            {"item_id": "li_006", "product_name": "Linen Shirt", "product_code": "LS-001", "quantity": 2500, "unit": "pcs", "unit_price": 18.00, "total_price": 45000.00, "color": "Sky Blue", "size": "XS-XXL"},
            {"item_id": "li_007", "product_name": "Cotton Shorts", "product_code": "CS-002", "quantity": 2000, "unit": "pcs", "unit_price": 14.00, "total_price": 28000.00, "color": "White", "size": "XS-XL"},
        ],
        "delivery_date": dt(90),
        "delivery_address": "EcoFashion Warehouse, Park Royal, London NW10 7LQ",
        "payment_terms": "Net 45",
        "shipping_terms": "FOB Mumbai",
        "notes": "SS27 collection, sustainable fabrics only.",
        "subtotal": 73000.00,
        "tax_amount": 0.00,
        "total_amount": 73000.00,
        "currency": "USD",
        "accepted_at": dt(-10),
        "batch_ids": [],
        "shipment_ids": [],
        "audit_ids": [],
        "status_history": [
            {"status": "awaiting_acceptance", "changed_at": dt(-12), "changed_by": BRAND1_ID},
            {"status": "accepted",            "changed_at": dt(-10), "changed_by": MFR1_ID},
        ],
        "is_locked": False,
        "is_deleted": False,
        "created_at": dt(-12),
        "updated_at": dt(-10),
    },
    {
        "id": PO5_ID,
        "po_number": "PO-ECO-2026-005",
        "brand_id": BRAND1_ID,
        "brand_name": "EcoFashion Ltd",
        "supplier_id": SUP2_ID,
        "supplier_name": "Blue Thread Mills",
        "season_id": S1_ID,
        "season_code": "AW27",
        "status": "delivered",
        "priority": "normal",
        "line_items": [
            {"item_id": "li_008", "product_name": "Fleece Hoodie", "product_code": "FH-001", "quantity": 4000, "unit": "pcs", "unit_price": 24.00, "total_price": 96000.00, "color": "Forest Green", "size": "XS-XXL"},
        ],
        "delivery_date": dt(-5),
        "delivery_address": "EcoFashion Warehouse, Park Royal, London NW10 7LQ",
        "payment_terms": "Net 60",
        "shipping_terms": "CIF London",
        "notes": "Completed delivery.",
        "subtotal": 96000.00,
        "tax_amount": 0.00,
        "total_amount": 96000.00,
        "currency": "USD",
        "accepted_at": dt(-80),
        "production_started_at": dt(-70),
        "shipped_at": dt(-15),
        "delivered_at": dt(-5),
        "batch_ids": [],
        "shipment_ids": [DISP2_ID],
        "audit_ids": [],
        "status_history": [
            {"status": "awaiting_acceptance", "changed_at": dt(-82), "changed_by": BRAND1_ID},
            {"status": "accepted",            "changed_at": dt(-80), "changed_by": MFR2_ID},
            {"status": "in_production",       "changed_at": dt(-70), "changed_by": MFR2_ID},
            {"status": "quality_check",       "changed_at": dt(-20), "changed_by": MFR2_ID},
            {"status": "shipped",             "changed_at": dt(-15), "changed_by": MFR2_ID},
            {"status": "delivered",           "changed_at": dt(-5),  "changed_by": BRAND1_ID},
        ],
        "is_locked": False,
        "is_deleted": False,
        "created_at": dt(-82),
        "updated_at": dt(-5),
    },
]


# ══════════════════════════════════════════════════════════════════
# PRODUCTION REPORTS
# ══════════════════════════════════════════════════════════════════
def make_prod_reports():
    reports = []
    # PO1 — 30 days of production
    for i in range(30):
        planned = 180 + (i % 5) * 10
        actual  = int(planned * (0.82 + (i % 7) * 0.02))
        reports.append({
            "id": f"pr_{PO1_ID}_{i:03d}",
            "po_id": PO1_ID,
            "manufacturer_id": MFR1_ID,
            "report_date": dt(-39 + i),
            "planned_quantity": planned,
            "actual_quantity": actual,
            "efficiency_pct": round(actual / planned * 100, 1),
            "wip": 120 - i * 3,
            "cumulative_planned": planned * (i + 1),
            "cumulative_actual": actual * (i + 1),
            "operator_count": 45,
            "line_number": "Line-A",
            "status": "approved",
            "approved_by": BRAND1_ID,
            "created_at": dt(-39 + i),
            "updated_at": dt(-39 + i),
        })
    # PO2 — 25 days
    for i in range(25):
        planned = 200 + (i % 4) * 15
        actual  = int(planned * (0.78 + (i % 6) * 0.025))
        reports.append({
            "id": f"pr_{PO2_ID}_{i:03d}",
            "po_id": PO2_ID,
            "manufacturer_id": MFR2_ID,
            "report_date": dt(-34 + i),
            "planned_quantity": planned,
            "actual_quantity": actual,
            "efficiency_pct": round(actual / planned * 100, 1),
            "wip": 80 - i * 2,
            "cumulative_planned": planned * (i + 1),
            "cumulative_actual": actual * (i + 1),
            "operator_count": 60,
            "line_number": "Line-B",
            "status": "approved" if i < 20 else "pending",
            "approved_by": BRAND1_ID if i < 20 else None,
            "created_at": dt(-34 + i),
            "updated_at": dt(-34 + i),
        })
    return reports

PRODUCTION_REPORTS = make_prod_reports()


# ══════════════════════════════════════════════════════════════════
# QUALITY REPORTS
# ══════════════════════════════════════════════════════════════════
def make_quality_reports():
    reports = []
    defect_types = [
        {"type": "Stitch Skip",   "severity": "minor"},
        {"type": "Color Bleeding","severity": "major"},
        {"type": "Size Variance", "severity": "minor"},
        {"type": "Fabric Flaw",   "severity": "major"},
        {"type": "Label Issue",   "severity": "minor"},
    ]
    for i in range(15):
        checked = 300 + i * 10
        defects = max(2, int(checked * (0.018 + (i % 5) * 0.004)))
        reports.append({
            "id": f"qr_{PO1_ID}_{i:03d}",
            "po_id": PO1_ID,
            "manufacturer_id": MFR1_ID,
            "report_date": dt(-38 + i * 2),
            "checked_quantity": checked,
            "total_defects": defects,
            "major_defects": defects // 3,
            "minor_defects": defects - defects // 3,
            "critical_defects": 0,
            "dhu_pct": round(defects / checked * 100, 2),
            "rejection_rate": round(defects / checked * 100 * 0.3, 2),
            "defect_details": [{"defect_type": defect_types[i % 5]["type"],
                                 "severity": defect_types[i % 5]["severity"],
                                 "count": defects // 2}],
            "status": "approved",
            "approved_by": BRAND1_ID,
            "created_at": dt(-38 + i * 2),
            "updated_at": dt(-38 + i * 2),
        })
    for i in range(12):
        checked = 400 + i * 15
        defects = max(3, int(checked * (0.025 + (i % 4) * 0.005)))
        reports.append({
            "id": f"qr_{PO2_ID}_{i:03d}",
            "po_id": PO2_ID,
            "manufacturer_id": MFR2_ID,
            "report_date": dt(-33 + i * 2),
            "checked_quantity": checked,
            "total_defects": defects,
            "major_defects": defects // 2,
            "minor_defects": defects - defects // 2,
            "critical_defects": 1 if i == 8 else 0,
            "dhu_pct": round(defects / checked * 100, 2),
            "rejection_rate": round(defects / checked * 100 * 0.4, 2),
            "defect_details": [{"defect_type": defect_types[i % 5]["type"],
                                 "severity": defect_types[i % 5]["severity"],
                                 "count": defects // 2}],
            "status": "approved" if i < 10 else "pending",
            "approved_by": BRAND1_ID if i < 10 else None,
            "created_at": dt(-33 + i * 2),
            "updated_at": dt(-33 + i * 2),
        })
    return reports

QUALITY_REPORTS = make_quality_reports()


# ══════════════════════════════════════════════════════════════════
# INSPECTION REPORTS
# ══════════════════════════════════════════════════════════════════
INSPECTION_REPORTS = [
    {
        "id": "insp_001",
        "po_id": PO1_ID,
        "manufacturer_id": MFR1_ID,
        "inspection_date": dt(-15),
        "aql_level": "2.5",
        "sample_size": 200,
        "inspected_quantity": 200,
        "passed_quantity": 194,
        "failed_quantity": 6,
        "result": "pass",
        "defect_findings": "Minor stitching irregularities on 3% of samples. Within AQL tolerance.",
        "inspector_name": "Elena Vasquez",
        "inspector_company": "Global Audit Services",
        "status": "approved",
        "approved_by": BRAND1_ID,
        "created_at": dt(-15),
        "updated_at": dt(-14),
    },
    {
        "id": "insp_002",
        "po_id": PO2_ID,
        "manufacturer_id": MFR2_ID,
        "inspection_date": dt(-3),
        "aql_level": "2.5",
        "sample_size": 250,
        "inspected_quantity": 250,
        "passed_quantity": 231,
        "failed_quantity": 19,
        "result": "conditional",
        "defect_findings": "Colour bleeding detected on 7.6% of denim samples. Requires re-wash test.",
        "inspector_name": "Elena Vasquez",
        "inspector_company": "Global Audit Services",
        "status": "pending",
        "approved_by": None,
        "created_at": dt(-3),
        "updated_at": dt(-3),
    },
    {
        "id": "insp_003",
        "po_id": PO3_ID,
        "manufacturer_id": MFR3_ID,
        "inspection_date": dt(-10),
        "aql_level": "1.0",
        "sample_size": 150,
        "inspected_quantity": 150,
        "passed_quantity": 148,
        "failed_quantity": 2,
        "result": "pass",
        "defect_findings": "Excellent quality. Minimal defects within acceptable limits.",
        "inspector_name": "Elena Vasquez",
        "inspector_company": "Global Audit Services",
        "status": "approved",
        "approved_by": BRAND1_ID,
        "created_at": dt(-10),
        "updated_at": dt(-9),
    },
]


# ══════════════════════════════════════════════════════════════════
# FABRIC TEST REPORTS
# ══════════════════════════════════════════════════════════════════
FABRIC_TESTS = [
    {
        "id": "ft_001",
        "po_id": PO1_ID,
        "manufacturer_id": MFR1_ID,
        "test_date": dt(-20),
        "fabric_name": "Wool Overcoat Fabric",
        "lab_name": "TUV Rheinland India",
        "lab_accreditation": "ISO/IEC 17025:2017",
        "gsm_test": {"specified": 320, "actual": 318, "passed": True},
        "shrinkage_test": {"warp_pct": -1.8, "weft_pct": -1.2, "passed": True},
        "color_fastness": {"wash": 4.5, "rub_dry": 4.0, "rub_wet": 3.5, "light": 5.0, "passed": True},
        "pilling_test": {"grade": 4, "passed": True},
        "overall_result": "pass",
        "status": "approved",
        "approved_by": BRAND1_ID,
        "created_at": dt(-20),
        "updated_at": dt(-19),
    },
    {
        "id": "ft_002",
        "po_id": PO2_ID,
        "manufacturer_id": MFR2_ID,
        "test_date": dt(-8),
        "fabric_name": "Denim Fabric",
        "lab_name": "Bureau Veritas Bangladesh",
        "lab_accreditation": "ISO/IEC 17025:2017",
        "gsm_test": {"specified": 340, "actual": 335, "passed": True},
        "shrinkage_test": {"warp_pct": -3.2, "weft_pct": -2.1, "passed": False},
        "color_fastness": {"wash": 3.5, "rub_dry": 3.0, "rub_wet": 2.5, "light": 4.0, "passed": False},
        "pilling_test": {"grade": 3, "passed": True},
        "overall_result": "fail",
        "status": "pending",
        "approved_by": None,
        "created_at": dt(-8),
        "updated_at": dt(-8),
    },
]


# ══════════════════════════════════════════════════════════════════
# TRACEABILITY RECORDS
# ══════════════════════════════════════════════════════════════════
TRACEABILITY_RECORDS = [
    {
        "id": "tr_001",
        "po_id": PO1_ID,
        "brand_id": BRAND1_ID,
        "supply_chain_stages": [
            {"stage": "fiber",    "status": "complete", "supplier_name": "Rajasthan Wool Corp",    "country": "India",      "date": dt(-90), "certifications": ["gots"], "quantity": 4200, "unit": "kg"},
            {"stage": "yarn",     "status": "complete", "supplier_name": "Bhilwara Spinners",      "country": "India",      "date": dt(-75), "certifications": ["gots"], "quantity": 3800, "unit": "kg"},
            {"stage": "fabric",   "status": "complete", "supplier_name": "Heritage Weavers",       "country": "India",      "date": dt(-60), "certifications": ["oeko_tex"], "quantity": 8500, "unit": "meters"},
            {"stage": "garment",  "status": "complete", "supplier_name": "Sunrise Garments",       "country": "India",      "date": dt(-40), "certifications": ["sa8000"], "quantity": 3500, "unit": "pcs"},
            {"stage": "dispatch", "status": "pending",  "supplier_name": None,                      "country": None,         "date": None,    "certifications": [],         "quantity": 0,    "unit": "pcs"},
        ],
        "tier_suppliers": [
            {"tier": 1, "supplier_name": "Sunrise Garments Pvt Ltd", "country": "India", "contact": "Rajesh Kumar", "certifications": ["sa8000", "oeko_tex"]},
            {"tier": 2, "supplier_name": "Heritage Weavers",         "country": "India", "contact": "Priya Singh",  "certifications": ["oeko_tex"]},
            {"tier": 3, "supplier_name": "Bhilwara Spinners",        "country": "India", "contact": "Suresh Patel", "certifications": ["gots"]},
            {"tier": 3, "supplier_name": "Rajasthan Wool Corp",      "country": "India", "contact": "Mohan Das",    "certifications": ["gots"]},
        ],
        "material_details": {
            "composition": "70% Merino Wool, 30% Recycled Polyester",
            "gsm": 320,
            "certifications": ["gots", "oeko_tex"],
            "origin_country": "India",
            "fiber_origin": "Rajasthan, India",
            "sustainable_tags": ["organic", "recycled_blend", "fair_trade"],
        },
        "documents": [
            {"doc_id": "doc_001", "doc_type": "gots_certificate",  "filename": "GOTS_Cert_2026.pdf",   "verified": True,  "expiry": dt(200)},
            {"doc_id": "doc_002", "doc_type": "test_report",        "filename": "Fabric_Test_AW27.pdf", "verified": True,  "expiry": dt(300)},
            {"doc_id": "doc_003", "doc_type": "audit_report",       "filename": "SA8000_Audit.pdf",     "verified": False, "expiry": dt(90)},
        ],
        "traceability_score": 82.0,
        "compliance_score": 78.5,
        "status": "partial",
        "created_at": dt(-55),
        "updated_at": dt(-5),
    },
    {
        "id": "tr_002",
        "po_id": PO2_ID,
        "brand_id": BRAND1_ID,
        "supply_chain_stages": [
            {"stage": "fiber",    "status": "complete", "supplier_name": "Bangladesh Cotton Board", "country": "Bangladesh", "date": dt(-80), "certifications": ["bci"],  "quantity": 6000, "unit": "kg"},
            {"stage": "yarn",     "status": "complete", "supplier_name": "Padma Yarn Mills",         "country": "Bangladesh", "date": dt(-65), "certifications": ["wrap"], "quantity": 5500, "unit": "kg"},
            {"stage": "fabric",   "status": "complete", "supplier_name": "Meghna Denim",             "country": "Bangladesh", "date": dt(-50), "certifications": ["wrap"], "quantity": 15000,"unit": "meters"},
            {"stage": "garment",  "status": "complete", "supplier_name": "Blue Thread Mills",        "country": "Bangladesh", "date": dt(-35), "certifications": ["wrap"], "quantity": 5500, "unit": "pcs"},
            {"stage": "dispatch", "status": "pending",  "supplier_name": None,                        "country": None,         "date": None,    "certifications": [],        "quantity": 0,    "unit": "pcs"},
        ],
        "tier_suppliers": [
            {"tier": 1, "supplier_name": "Blue Thread Mills",         "country": "Bangladesh", "contact": "Ahmed Hassan",   "certifications": ["wrap", "sedex"]},
            {"tier": 2, "supplier_name": "Meghna Denim",              "country": "Bangladesh", "contact": "Fatema Begum",   "certifications": ["wrap"]},
            {"tier": 3, "supplier_name": "Padma Yarn Mills",          "country": "Bangladesh", "contact": "Karim Sheikh",   "certifications": ["wrap"]},
        ],
        "material_details": {
            "composition": "100% BCI Cotton",
            "gsm": 340,
            "certifications": ["bci", "wrap"],
            "origin_country": "Bangladesh",
            "fiber_origin": "Sylhet region, Bangladesh",
            "sustainable_tags": ["better_cotton"],
        },
        "documents": [
            {"doc_id": "doc_004", "doc_type": "bci_certificate",  "filename": "BCI_License_2026.pdf", "verified": True,  "expiry": dt(120)},
            {"doc_id": "doc_005", "doc_type": "wrap_certificate",  "filename": "WRAP_Cert.pdf",        "verified": True,  "expiry": dt(180)},
        ],
        "traceability_score": 76.0,
        "compliance_score": 71.0,
        "status": "partial",
        "created_at": dt(-48),
        "updated_at": dt(-3),
    },
    {
        "id": "tr_003",
        "po_id": PO3_ID,
        "brand_id": BRAND1_ID,
        "supply_chain_stages": [
            {"stage": "fiber",    "status": "complete", "supplier_name": "Jiangsu Silk Co",      "country": "China",  "date": dt(-100), "certifications": ["iso_9001"], "quantity": 800,   "unit": "kg"},
            {"stage": "yarn",     "status": "complete", "supplier_name": "Suzhou Spinning",      "country": "China",  "date": dt(-85),  "certifications": ["iso_9001"], "quantity": 720,   "unit": "kg"},
            {"stage": "fabric",   "status": "complete", "supplier_name": "Guangzhou Silk Weavers","country": "China", "date": dt(-70),  "certifications": ["iso_9001"], "quantity": 3500,  "unit": "meters"},
            {"stage": "garment",  "status": "complete", "supplier_name": "Heritage Textiles Co", "country": "China",  "date": dt(-55),  "certifications": ["grs"],      "quantity": 1000,  "unit": "pcs"},
            {"stage": "dispatch", "status": "complete", "supplier_name": "CMA CGM Logistics",    "country": "China",  "date": dt(-7),   "certifications": [],           "quantity": 1000,  "unit": "pcs"},
        ],
        "tier_suppliers": [
            {"tier": 1, "supplier_name": "Heritage Textiles Co",       "country": "China", "contact": "Mei Lin",        "certifications": ["grs", "iso_9001"]},
            {"tier": 2, "supplier_name": "Guangzhou Silk Weavers",     "country": "China", "contact": "Wang Fang",      "certifications": ["iso_9001"]},
            {"tier": 3, "supplier_name": "Suzhou Spinning",            "country": "China", "contact": "Li Wei",         "certifications": ["iso_9001"]},
        ],
        "material_details": {
            "composition": "100% Mulberry Silk",
            "gsm": 90,
            "certifications": ["iso_9001"],
            "origin_country": "China",
            "fiber_origin": "Jiangsu Province, China",
            "sustainable_tags": ["natural_fiber"],
        },
        "documents": [
            {"doc_id": "doc_006", "doc_type": "iso_certificate",    "filename": "ISO9001_2026.pdf",      "verified": True,  "expiry": dt(300)},
            {"doc_id": "doc_007", "doc_type": "shipping_docs",      "filename": "BL_PO3_HT.pdf",         "verified": True,  "expiry": None},
            {"doc_id": "doc_008", "doc_type": "test_report",        "filename": "Silk_Test_Report.pdf",  "verified": True,  "expiry": dt(200)},
        ],
        "traceability_score": 95.0,
        "compliance_score": 88.0,
        "status": "complete",
        "created_at": dt(-63),
        "updated_at": dt(-7),
    },
]


# ══════════════════════════════════════════════════════════════════
# TRACEABILITY ALERTS
# ══════════════════════════════════════════════════════════════════
TRACEABILITY_ALERTS = [
    {
        "id": "ta_001",
        "po_id": PO1_ID,
        "brand_id": BRAND1_ID,
        "alert_type": "missing_document",
        "severity": "high",
        "title": "SA8000 Audit Report Unverified",
        "description": "The SA8000 audit report for Sunrise Garments has not been verified. Required for compliance score.",
        "is_resolved": False,
        "created_at": dt(-10),
    },
    {
        "id": "ta_002",
        "po_id": PO2_ID,
        "brand_id": BRAND1_ID,
        "alert_type": "incomplete_mapping",
        "severity": "medium",
        "title": "Tier 3 Supplier Not Mapped",
        "description": "Raw fiber supplier information is missing for PO-ECO-2026-002.",
        "is_resolved": False,
        "created_at": dt(-5),
    },
    {
        "id": "ta_003",
        "po_id": PO5_ID,
        "brand_id": BRAND1_ID,
        "alert_type": "cert_expiry",
        "severity": "low",
        "title": "BCI Certificate Expiring Soon",
        "description": "BCI certificate for Blue Thread Mills expires in 45 days.",
        "is_resolved": False,
        "created_at": dt(-3),
    },
]


# ══════════════════════════════════════════════════════════════════
# REPORT ALERTS
# ══════════════════════════════════════════════════════════════════
REPORT_ALERTS = [
    {
        "id": "ra_001",
        "po_id": PO2_ID,
        "alert_type": "high_dhu",
        "severity": "high",
        "title": "DHU Exceeds 5% — PO-ECO-2026-002",
        "description": "Daily Quality Report on day 9 shows DHU of 6.2%. Corrective action required.",
        "is_resolved": False,
        "created_at": dt(-6),
    },
    {
        "id": "ra_002",
        "po_id": PO2_ID,
        "alert_type": "failed_inspection",
        "severity": "high",
        "title": "Final Inspection Conditional — PO-ECO-2026-002",
        "description": "Colour bleeding detected in 7.6% of denim samples. Re-wash test required before shipment.",
        "is_resolved": False,
        "created_at": dt(-3),
    },
    {
        "id": "ra_003",
        "po_id": PO1_ID,
        "alert_type": "low_efficiency",
        "severity": "medium",
        "title": "Production Efficiency Below 75%",
        "description": "Day 8 production efficiency was 72.4% against target of 85%.",
        "is_resolved": True,
        "resolved_at": dt(-20),
        "resolved_notes": "Extra shift added, efficiency recovered to 88% next day.",
        "created_at": dt(-30),
    },
]


# ══════════════════════════════════════════════════════════════════
# DESTINATIONS
# ══════════════════════════════════════════════════════════════════
DESTINATIONS = [
    {
        "id": DEST1_ID,
        "brand_id": BRAND1_ID,
        "name": "London Main Warehouse",
        "address": "Unit 12, Western Road, Park Royal",
        "city": "London",
        "country": "UK",
        "postal_code": "NW10 7LQ",
        "latitude": 51.5310,
        "longitude": -0.2805,
        "contact_person": "Tom Williams",
        "contact_phone": "+44-20-8965-1234",
        "destination_type": "warehouse",
        "created_at": dt(-150),
    },
    {
        "id": DEST2_ID,
        "brand_id": BRAND1_ID,
        "name": "Manchester Distribution Centre",
        "address": "Plot 5, Trafford Park",
        "city": "Manchester",
        "country": "UK",
        "postal_code": "M17 1PA",
        "latitude": 53.4631,
        "longitude": -2.3080,
        "contact_person": "Lisa Chen",
        "contact_phone": "+44-161-872-5678",
        "destination_type": "distribution_center",
        "created_at": dt(-120),
    },
]


# ══════════════════════════════════════════════════════════════════
# INVOICES & DISPATCHES
# ══════════════════════════════════════════════════════════════════
INVOICES = [
    {
        "id": INV1_ID,
        "invoice_number": "INV-SR-2026-001",
        "po_id": PO1_ID,
        "supplier_id": SUP1_ID,
        "brand_id": BRAND1_ID,
        "destination_id": DEST1_ID,
        "line_items": [
            {"product_name": "Wool Overcoat", "quantity_shipped": 1000, "unit_price": 45.00, "total": 45000.00},
        ],
        "quantity_shipped": 1000,
        "quantity_received": 0,
        "quantity_pending": 1000,
        "status": "in_transit",
        "delivery_status": "on_time",
        "delay_hours": 0,
        "distance_km": 7240,
        "documents": [],
        "created_at": dt(-12),
        "updated_at": dt(-8),
    },
    {
        "id": INV2_ID,
        "invoice_number": "INV-HT-2026-001",
        "po_id": PO3_ID,
        "supplier_id": SUP3_ID,
        "brand_id": BRAND1_ID,
        "destination_id": DEST1_ID,
        "line_items": [
            {"product_name": "Silk Blouse", "quantity_shipped": 1000, "unit_price": 55.00, "total": 55000.00},
        ],
        "quantity_shipped": 1000,
        "quantity_received": 1000,
        "quantity_pending": 0,
        "status": "delivered",
        "delivery_status": "on_time",
        "delay_hours": 0,
        "distance_km": 9300,
        "documents": [],
        "created_at": dt(-8),
        "updated_at": dt(-1),
    },
    {
        "id": INV3_ID,
        "invoice_number": "INV-BT-2026-001",
        "po_id": PO5_ID,
        "supplier_id": SUP2_ID,
        "brand_id": BRAND1_ID,
        "destination_id": DEST2_ID,
        "line_items": [
            {"product_name": "Fleece Hoodie", "quantity_shipped": 4000, "unit_price": 24.00, "total": 96000.00},
        ],
        "quantity_shipped": 4000,
        "quantity_received": 4000,
        "quantity_pending": 0,
        "status": "delivered",
        "delivery_status": "delayed",
        "delay_hours": 18,
        "distance_km": 8100,
        "documents": [],
        "created_at": dt(-16),
        "updated_at": dt(-5),
    },
]

DISPATCHES = [
    {
        "id": DISP1_ID,
        "dispatch_number": "DISP-HT-2026-001",
        "invoice_id": INV2_ID,
        "po_id": PO3_ID,
        "supplier_id": SUP3_ID,
        "brand_id": BRAND1_ID,
        "destination_id": DEST1_ID,
        "quantity_dispatched": 1000,
        "quantity_received": 1000,
        "status": "delivered",
        "delivery_status": "on_time",
        "vehicle_number": "COSCO-VESSEL-GZ2026",
        "driver_name": "Captain Li Wei",
        "transporter_company": "COSCO Shipping",
        "dispatch_date": dt(-7),
        "expected_arrival": dt(-1),
        "actual_arrival": dt(-1),
        "current_location": {"latitude": 51.5310, "longitude": -0.2805, "address": "London Warehouse"},
        "origin_location": {"latitude": 23.1291, "longitude": 113.2644, "address": "Guangzhou Port, China"},
        "tracking_history": [
            {"timestamp": dt(-7), "location": "Guangzhou Port", "status": "departed", "lat": 23.1291, "lng": 113.2644},
            {"timestamp": dt(-5), "location": "Singapore Strait", "status": "in_transit", "lat": 1.2905,  "lng": 103.8520},
            {"timestamp": dt(-2), "location": "Suez Canal", "status": "in_transit", "lat": 30.0020,  "lng": 32.5498},
            {"timestamp": dt(-1), "location": "London Port", "status": "delivered", "lat": 51.5310,  "lng": -0.2805},
        ],
        "documents": [],
        "created_at": dt(-7),
        "updated_at": dt(-1),
    },
    {
        "id": DISP2_ID,
        "dispatch_number": "DISP-BT-2026-001",
        "invoice_id": INV3_ID,
        "po_id": PO5_ID,
        "supplier_id": SUP2_ID,
        "brand_id": BRAND1_ID,
        "destination_id": DEST2_ID,
        "quantity_dispatched": 4000,
        "quantity_received": 4000,
        "status": "delivered",
        "delivery_status": "delayed",
        "vehicle_number": "MSC-VESSEL-CTG2026",
        "driver_name": "Captain Omar Faruk",
        "transporter_company": "MSC Shipping",
        "dispatch_date": dt(-15),
        "expected_arrival": dt(-6),
        "actual_arrival": dt(-5),
        "current_location": {"latitude": 53.4631, "longitude": -2.3080, "address": "Manchester DC"},
        "origin_location": {"latitude": 22.3569, "longitude": 91.7832, "address": "Chittagong Port, Bangladesh"},
        "tracking_history": [
            {"timestamp": dt(-15), "location": "Chittagong Port",  "status": "departed",   "lat": 22.3569, "lng": 91.7832},
            {"timestamp": dt(-10), "location": "Bay of Bengal",    "status": "in_transit", "lat": 15.0,    "lng": 85.0},
            {"timestamp": dt(-6),  "location": "Port Said, Egypt", "status": "in_transit", "lat": 31.2565, "lng": 32.2841},
            {"timestamp": dt(-5),  "location": "Manchester DC",    "status": "delivered",  "lat": 53.4631, "lng": -2.3080},
        ],
        "documents": [],
        "created_at": dt(-15),
        "updated_at": dt(-5),
    },
]


# ══════════════════════════════════════════════════════════════════
# INCOMING ALERTS
# ══════════════════════════════════════════════════════════════════
INCOMING_ALERTS = [
    {
        "id": "ia_001",
        "po_id": PO1_ID,
        "invoice_id": INV1_ID,
        "dispatch_id": None,
        "brand_id": BRAND1_ID,
        "alert_type": "shipment_not_yet_dispatched",
        "severity": "medium",
        "title": "Invoice INV-SR-2026-001 — Shipment Overdue",
        "description": "Invoice raised 12 days ago but goods not yet dispatched by Sunrise Garments.",
        "is_resolved": False,
        "created_at": dt(-3),
    },
]


# ══════════════════════════════════════════════════════════════════
# BATCHES
# ══════════════════════════════════════════════════════════════════
BATCHES = [
    {
        "id": BATCH1_ID,
        "batch_number": "BTH-20260101-SR001",
        "product_name": "Wool Overcoat — AW27",
        "material_type": "wool",
        "quantity": 3500.0,
        "unit": "pcs",
        "description": "Batch for PO-ECO-2026-001, Autumn/Winter 2027",
        "manufacturer_id": MFR1_ID,
        "brand_id": BRAND1_ID,
        "status": "production",
        "input_quantity": 4200.0,
        "output_quantity": 2800.0,
        "wastage_quantity": 210.0,
        "balance_quantity": 1190.0,
        "compliance_score": 82.0,
        "certifications": ["gots", "oeko_tex"],
        "child_batch_ids": [],
        "transaction_ids": [],
        "is_deleted": False,
        "created_at": dt(-40),
        "updated_at": dt(-5),
    },
    {
        "id": BATCH2_ID,
        "batch_number": "BTH-20260101-BT001",
        "product_name": "Denim Jacket — AW27",
        "material_type": "cotton",
        "quantity": 5500.0,
        "unit": "pcs",
        "description": "Batch for PO-ECO-2026-002, Autumn/Winter 2027",
        "manufacturer_id": MFR2_ID,
        "brand_id": BRAND1_ID,
        "status": "quality_check",
        "input_quantity": 6000.0,
        "output_quantity": 5200.0,
        "wastage_quantity": 180.0,
        "balance_quantity": 620.0,
        "compliance_score": 71.0,
        "certifications": ["bci", "wrap"],
        "child_batch_ids": [],
        "transaction_ids": [],
        "is_deleted": False,
        "created_at": dt(-35),
        "updated_at": dt(-3),
    },
    {
        "id": BATCH3_ID,
        "batch_number": "BTH-20260101-HT001",
        "product_name": "Silk Blouse — AW27",
        "material_type": "silk",
        "quantity": 1000.0,
        "unit": "pcs",
        "description": "Batch for PO-ECO-2026-003, Autumn/Winter 2027",
        "manufacturer_id": MFR3_ID,
        "brand_id": BRAND1_ID,
        "status": "completed",
        "input_quantity": 850.0,
        "output_quantity": 1000.0,
        "wastage_quantity": 25.0,
        "balance_quantity": 0.0,
        "compliance_score": 88.0,
        "certifications": ["iso_9001", "grs"],
        "child_batch_ids": [],
        "transaction_ids": [],
        "is_deleted": False,
        "created_at": dt(-55),
        "updated_at": dt(-7),
        "completed_at": dt(-7),
    },
]


# ══════════════════════════════════════════════════════════════════
# AUDITS
# ══════════════════════════════════════════════════════════════════
AUDITS = [
    {
        "id": "audit_001",
        "audit_number": "AUD-2026-001",
        "manufacturer_id": MFR2_ID,
        "brand_id": BRAND1_ID,
        "auditor_id": AUDIT1_ID,
        "audit_type": "social_compliance",
        "status": "completed",
        "scheduled_date": dt(-20),
        "completed_date": dt(-18),
        "compliance_score": 76.5,
        "result": "conditional",
        "findings": "Working hours exceed legal limits during peak production. Fire exit blocked on 2nd floor. Corrective action plan submitted.",
        "corrective_actions": [
            {"issue": "Overtime exceeds limits", "action": "Implement shift rotation", "deadline": dt(30), "status": "in_progress"},
            {"issue": "Fire exit blocked",       "action": "Clear exit immediately",   "deadline": dt(-10),"status": "completed"},
        ],
        "created_at": dt(-25),
        "updated_at": dt(-18),
    },
    {
        "id": "audit_002",
        "audit_number": "AUD-2026-002",
        "manufacturer_id": MFR1_ID,
        "brand_id": BRAND1_ID,
        "auditor_id": AUDIT1_ID,
        "audit_type": "quality",
        "status": "in_progress",
        "scheduled_date": dt(5),
        "completed_date": None,
        "compliance_score": None,
        "result": None,
        "findings": None,
        "corrective_actions": [],
        "created_at": dt(-5),
        "updated_at": dt(-5),
    },
]


# ══════════════════════════════════════════════════════════════════
# ACTIVITIES (audit trail)
# ══════════════════════════════════════════════════════════════════
ACTIVITIES = [
    {"id": "act_001", "user_id": BRAND1_ID,  "user_email": "brand@textiletrace.com",        "user_role": "brand",        "action": "create", "entity_type": "purchase_order", "entity_id": PO1_ID,   "description": "Created PO-ECO-2026-001 for Sunrise Garments",  "created_at": dt(-55)},
    {"id": "act_002", "user_id": MFR1_ID,    "user_email": "manufacturer@textiletrace.com",  "user_role": "manufacturer", "action": "update", "entity_type": "purchase_order", "entity_id": PO1_ID,   "description": "Accepted PO-ECO-2026-001",                       "created_at": dt(-50)},
    {"id": "act_003", "user_id": BRAND1_ID,  "user_email": "brand@textiletrace.com",        "user_role": "brand",        "action": "create", "entity_type": "purchase_order", "entity_id": PO2_ID,   "description": "Created PO-ECO-2026-002 for Blue Thread Mills",  "created_at": dt(-48)},
    {"id": "act_004", "user_id": MFR2_ID,    "user_email": "manufacturer2@textiletrace.com", "user_role": "manufacturer", "action": "create", "entity_type": "production_report","entity_id": "pr_po_001_001","description": "Submitted Daily Production Report",         "created_at": dt(-39)},
    {"id": "act_005", "user_id": AUDIT1_ID,  "user_email": "auditor@textiletrace.com",      "user_role": "auditor",      "action": "create", "entity_type": "audit",          "entity_id": "audit_001","description": "Completed social compliance audit for Blue Thread Mills","created_at": dt(-18)},
    {"id": "act_006", "user_id": BRAND1_ID,  "user_email": "brand@textiletrace.com",        "user_role": "brand",        "action": "approve","entity_type": "quality_report", "entity_id": "qr_po_001_001","description": "Approved quality report",                   "created_at": dt(-15)},
    {"id": "act_007", "user_id": ADMIN_ID,   "user_email": "admin@textiletrace.com",        "user_role": "admin",        "action": "create", "entity_type": "supplier",       "entity_id": SUP3_ID,  "description": "Registered Heritage Textiles Co as supplier",    "created_at": dt(-110)},
]


# ══════════════════════════════════════════════════════════════════
# PLATFORM ALERTS
# ══════════════════════════════════════════════════════════════════
PLATFORM_ALERTS = [
    {
        "id": "pal_001",
        "type": "compliance",
        "severity": "high",
        "title": "Heritage Textiles — Compliance Score Below Threshold",
        "description": "Heritage Textiles Co compliance score dropped to 65. Review audit findings.",
        "target_user_ids": [ADMIN_ID, BRAND1_ID],
        "status": "active",
        "created_at": dt(-4),
    },
    {
        "id": "pal_002",
        "type": "delivery",
        "severity": "medium",
        "title": "PO-ECO-2026-002 Delivery Risk",
        "description": "PO-ECO-2026-002 has a conditional inspection result. Delivery date is in 20 days.",
        "target_user_ids": [BRAND1_ID],
        "status": "active",
        "created_at": dt(-3),
    },
    {
        "id": "pal_003",
        "type": "production",
        "severity": "low",
        "title": "PO-ECO-2026-001 Production On Track",
        "description": "Sunrise Garments maintaining 88% efficiency on AW27 Wool Overcoat order.",
        "target_user_ids": [BRAND1_ID],
        "status": "read",
        "created_at": dt(-2),
    },
]


# ══════════════════════════════════════════════════════════════════
# SEED RUNNER
# ══════════════════════════════════════════════════════════════════
async def seed():
    print("\n[SEED]  TextileTrace - Database Seeding Started")
    print("=" * 55)

    collections_data = [
        ("users",                USERS),
        ("suppliers",            SUPPLIERS),
        ("seasons",              SEASONS),
        ("mood_boards",          MOOD_BOARDS),
        ("manufacturer_collections", COLLECTIONS),
        ("swatches",             SWATCHES),
        ("purchase_orders",      PURCHASE_ORDERS),
        ("production_reports",   PRODUCTION_REPORTS),
        ("quality_reports",      QUALITY_REPORTS),
        ("inspection_reports",   INSPECTION_REPORTS),
        ("fabric_test_reports",  FABRIC_TESTS),
        ("traceability_records", TRACEABILITY_RECORDS),
        ("traceability_alerts",  TRACEABILITY_ALERTS),
        ("report_alerts",        REPORT_ALERTS),
        ("destinations",         DESTINATIONS),
        ("invoices",             INVOICES),
        ("dispatches",           DISPATCHES),
        ("incoming_alerts",      INCOMING_ALERTS),
        ("batches",              BATCHES),
        ("audits",               AUDITS),
        ("activities",           ACTIVITIES),
        ("alerts",               PLATFORM_ALERTS),
    ]

    for col_name, data in collections_data:
        col = db[col_name]
        existing = await col.count_documents({})
        if existing > 0:
            print(f"  [SKIP]  {col_name:<30} already has {existing} docs")
            continue
        if data:
            result = await col.insert_many(data)
            print(f"  [OK]    {col_name:<30} inserted {len(result.inserted_ids)} documents")
        else:
            print(f"  [WARN]  {col_name:<30} no data to insert")

    print("=" * 55)
    print("[DONE]  Seeding complete!\n")
    print("  Login credentials:")
    print("  Admin        admin@textiletrace.com    Admin@123")
    print("  Brand        brand@textiletrace.com    Brand@123")
    print("  Manufacturer manufacturer@textiletrace.com  Mfr@123")
    print("  Auditor      auditor@textiletrace.com  Audit@123\n")


async def reset_and_seed():
    """Drop all collections and re-seed from scratch."""
    print("\n[RESET]  Dropping all collections...")
    for name in [
        "users", "suppliers", "seasons", "mood_boards",
        "manufacturer_collections", "swatches", "purchase_orders",
        "production_reports", "quality_reports", "inspection_reports",
        "fabric_test_reports", "traceability_records", "traceability_alerts",
        "report_alerts", "destinations", "invoices", "dispatches",
        "incoming_alerts", "batches", "audits", "activities", "alerts",
        "po_status_logs", "transactions", "documents", "production_logs",
        "shipments", "designs",
    ]:
        await db[name].drop()
    print("  Done.\n")
    await seed()


if __name__ == "__main__":
    import sys
    if "--reset" in sys.argv:
        asyncio.run(reset_and_seed())
    else:
        asyncio.run(seed())
