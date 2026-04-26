from motor.motor_asyncio import AsyncIOMotorClient
import os

mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'textile_traceability')

client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

# ── Core collections ───────────────────────────────────────────────
users_collection          = db.users
batches_collection        = db.batches
materials_collection      = db.materials
production_collection     = db.production_logs
shipments_collection      = db.shipments
audits_collection         = db.audits
transactions_collection   = db.transactions
documents_collection      = db.documents
activities_collection     = db.activities
alerts_collection         = db.alerts

# ── Supplier / PO collections ──────────────────────────────────────
suppliers_collection      = db.suppliers
pos_collection            = db.purchase_orders
po_logs_collection        = db.po_status_logs

# ── Season / design / mood board collections ───────────────────────
seasons_collection        = db.seasons
mood_boards_collection    = db.mood_boards
designs_collection        = db.designs

# ── Swatch / collection collections ───────────────────────────────
collections_collection    = db.manufacturer_collections
swatches_collection       = db.swatches

# ── Traceability collections ───────────────────────────────────────
traceability_collection   = db.traceability_records
traceability_alerts_col   = db.traceability_alerts

# ── PO report collections ──────────────────────────────────────────
production_reports_col    = db.production_reports
quality_reports_col       = db.quality_reports
inspection_reports_col    = db.inspection_reports
fabric_test_reports_col   = db.fabric_test_reports
trims_reports_col         = db.trims_reports
report_alerts_col         = db.report_alerts

# ── Incoming / dispatch collections ───────────────────────────────
destinations_collection   = db.destinations
invoices_collection       = db.invoices
dispatches_collection     = db.dispatches
incoming_alerts_col       = db.incoming_alerts

# ── Notification collections ───────────────────────────────────────
notifications_col         = db.notifications
notification_prefs_col    = db.notification_preferences
push_tokens_col           = db.push_tokens


async def create_indexes():
    """Create all indexes for the entire application."""

    # users
    await users_collection.create_index("email", unique=True)
    await users_collection.create_index("role")
    await users_collection.create_index("status")

    # batches
    await batches_collection.create_index("batch_number", unique=True)
    await batches_collection.create_index("manufacturer_id")
    await batches_collection.create_index("brand_id")
    await batches_collection.create_index("status")
    await batches_collection.create_index("created_at")

    # materials
    await materials_collection.create_index("batch_id")
    await materials_collection.create_index("manufacturer_id")
    await materials_collection.create_index("lot_number")

    # production_logs
    await production_collection.create_index("batch_id")
    await production_collection.create_index("manufacturer_id")
    await production_collection.create_index("stage")

    # shipments
    await shipments_collection.create_index("batch_id")
    await shipments_collection.create_index("manufacturer_id")
    await shipments_collection.create_index("destination_brand_id")
    await shipments_collection.create_index([("shipment_number", 1)], unique=True, sparse=True)

    # audits
    await audits_collection.create_index("batch_id")
    await audits_collection.create_index("auditor_id")
    await audits_collection.create_index("manufacturer_id")
    await audits_collection.create_index([("audit_number", 1)], unique=True, sparse=True)
    await audits_collection.create_index("status")

    # transactions
    await transactions_collection.create_index("batch_id")
    await transactions_collection.create_index("manufacturer_id")
    await transactions_collection.create_index([("transaction_number", 1)], unique=True, sparse=True)
    await transactions_collection.create_index("created_at")

    # documents
    await documents_collection.create_index("batch_id")
    await documents_collection.create_index("manufacturer_id")
    await documents_collection.create_index("document_type")

    # activities
    await activities_collection.create_index("user_id")
    await activities_collection.create_index("entity_type")
    await activities_collection.create_index("entity_id")
    await activities_collection.create_index("created_at")

    # alerts
    await alerts_collection.create_index("status")
    await alerts_collection.create_index("severity")
    await alerts_collection.create_index("created_at")

    # suppliers
    await suppliers_collection.create_index("supplier_id", unique=True)
    await suppliers_collection.create_index("user_id")
    await suppliers_collection.create_index("status")
    await suppliers_collection.create_index("risk_category")

    # purchase_orders
    await pos_collection.create_index([("po_number", 1)], unique=True, sparse=True)
    await pos_collection.create_index("brand_id")
    await pos_collection.create_index("supplier_id")
    await pos_collection.create_index("season_id")
    await pos_collection.create_index("status")
    await pos_collection.create_index("created_at")

    # po_status_logs
    await po_logs_collection.create_index("po_id")
    await po_logs_collection.create_index("created_at")

    # seasons
    await seasons_collection.create_index("brand_id")
    await seasons_collection.create_index("season_code")
    await seasons_collection.create_index("status")

    # mood_boards
    await mood_boards_collection.create_index("season_id")
    await mood_boards_collection.create_index("brand_id")

    # designs
    await designs_collection.create_index("season_id")
    await designs_collection.create_index("supplier_id")
    await designs_collection.create_index("status")

    # manufacturer_collections
    await collections_collection.create_index("season_id")
    await collections_collection.create_index("brand_id")
    await collections_collection.create_index("status")

    # swatches
    await swatches_collection.create_index("collection_id")
    await swatches_collection.create_index("supplier_id")
    await swatches_collection.create_index("status")

    # traceability_records
    await traceability_collection.create_index("po_id", unique=True)
    await traceability_collection.create_index("brand_id")

    # traceability_alerts
    await traceability_alerts_col.create_index("po_id")
    await traceability_alerts_col.create_index("is_resolved")

    # production_reports
    await production_reports_col.create_index("po_id")
    await production_reports_col.create_index("manufacturer_id")
    await production_reports_col.create_index("report_date")

    # quality_reports
    await quality_reports_col.create_index("po_id")
    await quality_reports_col.create_index("manufacturer_id")
    await quality_reports_col.create_index("report_date")

    # inspection_reports
    await inspection_reports_col.create_index("po_id")
    await inspection_reports_col.create_index("manufacturer_id")

    # fabric_test_reports
    await fabric_test_reports_col.create_index("po_id")

    # trims_reports
    await trims_reports_col.create_index("po_id")

    # report_alerts
    await report_alerts_col.create_index("po_id")
    await report_alerts_col.create_index("is_resolved")

    # destinations
    await destinations_collection.create_index("brand_id")

    # invoices
    await invoices_collection.create_index("po_id")
    await invoices_collection.create_index("supplier_id")
    await invoices_collection.create_index([("invoice_number", 1)], unique=True, sparse=True)

    # dispatches
    await dispatches_collection.create_index("invoice_id")
    await dispatches_collection.create_index("po_id")
    await dispatches_collection.create_index([("dispatch_number", 1)], unique=True, sparse=True)

    # incoming_alerts
    await incoming_alerts_col.create_index("po_id")
    await incoming_alerts_col.create_index("is_resolved")

    # notifications
    await notifications_col.create_index("user_id")
    await notifications_col.create_index("status")
    await notifications_col.create_index("event")
    await notifications_col.create_index("created_at")

    # notification_preferences
    await notification_prefs_col.create_index("user_id", unique=True)

    # push_tokens
    await push_tokens_col.create_index([("user_id", 1), ("token", 1)], unique=True)


async def close_connection():
    client.close()
