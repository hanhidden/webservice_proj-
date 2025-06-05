import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

import ssl
print(ssl.OPENSSL_VERSION)


MONGO_URL="mongodb+srv://1210711:QUH4hhKzXB0jbfQc@humanrightsmonitor.u8iggao.mongodb.net/?tls=true&retryWrites=true&w=majority&appName=HumanRightsMonitor"
MONGO_DB_NAME="humanRights"

async def test():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[MONGO_DB_NAME]
    try:
        collections = await db.list_collection_names()
        print("Collections:", collections)
    except Exception as e:
        print("Error:", e)

asyncio.run(test())
