from motor.motor_asyncio import AsyncIOMotorClient
import os

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'textile_traceability')

client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

# Collections
users_collection = db.users
batches_collection = db.batches
materials_collection = db.materials
production_collection = db.production_logs
shipments_collection = db.shipments
audits_collection = db.audits
transactions_collection = db.transactions
documents_collection = db.documents
activities_collection = db.activities
alerts_collection = db.alerts


async def create_indexes():
    """Create database indexes for better performance."""
    # Users indexes
    await users_collection.create_index("email", unique=True)
    await users_collection.create_index("role")
    await users_collection.create_index("status")
    
    # Batches indexes
    await batches_collection.create_index("batch_number", unique=True)
    await batches_collection.create_index("manufacturer_id")
    await batches_collection.create_index("brand_id")
    await batches_collection.create_index("status")
    await batches_collection.create_index("created_at")
    
    # Materials indexes
    await materials_collection.create_index("batch_id")
    await materials_collection.create_index("manufacturer_id")
    await materials_collection.create_index("lot_number")
    
    # Production indexes
    await production_collection.create_index("batch_id")
    await production_collection.create_index("manufacturer_id")
    await production_collection.create_index("stage")
    
    # Shipments indexes
    await shipments_collection.create_index("batch_id")
    await shipments_collection.create_index("manufacturer_id")
    await shipments_collection.create_index("destination_brand_id")
    await shipments_collection.create_index("shipment_number", unique=True)
    
    # Audits indexes
    await audits_collection.create_index("batch_id")
    await audits_collection.create_index("auditor_id")
    await audits_collection.create_index("manufacturer_id")
    await audits_collection.create_index("audit_number", unique=True)
    await audits_collection.create_index("status")
    
    # Transactions indexes
    await transactions_collection.create_index("batch_id")
    await transactions_collection.create_index("manufacturer_id")
    await transactions_collection.create_index("transaction_number", unique=True)
    await transactions_collection.create_index("created_at")
    
    # Documents indexes
    await documents_collection.create_index("batch_id")
    await documents_collection.create_index("manufacturer_id")
    await documents_collection.create_index("document_type")
    
    # Activities indexes
    await activities_collection.create_index("user_id")
    await activities_collection.create_index("entity_type")
    await activities_collection.create_index("entity_id")
    await activities_collection.create_index("created_at")
    
    # Alerts indexes
    await alerts_collection.create_index("status")
    await alerts_collection.create_index("severity")
    await alerts_collection.create_index("target_user_ids")
    await alerts_collection.create_index("created_at")


async def close_connection():
    """Close the MongoDB connection."""
    client.close()
