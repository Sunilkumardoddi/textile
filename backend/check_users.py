import asyncio
import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()

async def main():
    mongo_url = os.getenv('MONGO_URL')
    db_name = os.getenv('DB_NAME')
    print(f"Connecting to MongoDB...")
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    users = await db.users.find({}).to_list(length=100)
    for u in users:
        print(f"Email: {u.get('email')}, Role: {u.get('role')}")
    print("Done")

if __name__ == '__main__':
    asyncio.run(main())
