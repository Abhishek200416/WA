"""
Seed demo users for WA app testing
Run this script to add demo users to the database
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
import uuid
from datetime import datetime

load_dotenv()

MONGO_URL = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = 'wa_db'

# Demo users data
DEMO_USERS = [
    {
        'id': str(uuid.uuid4()),
        'name': 'Alice Johnson',
        'username': 'alice',
        'phone': '+1234567890',
        'email': 'alice@example.com',
        'about': 'Love traveling and photography 📸',
        'avatar': 'https://i.pravatar.cc/150?img=1',
        'is_online': True,
        'last_seen': datetime.utcnow(),
        'privacy_settings': {
            'show_phone': True,
            'show_last_seen': True,
            'show_profile_photo': True,
            'show_about': True
        },
        'created_at': datetime.utcnow()
    },
    {
        'id': str(uuid.uuid4()),
        'name': 'Bob Smith',
        'username': 'bob',
        'phone': '+1234567891',
        'email': 'bob@example.com',
        'about': 'Software engineer | Coffee enthusiast ☕',
        'avatar': 'https://i.pravatar.cc/150?img=12',
        'is_online': False,
        'last_seen': datetime.utcnow(),
        'privacy_settings': {
            'show_phone': True,
            'show_last_seen': True,
            'show_profile_photo': True,
            'show_about': True
        },
        'created_at': datetime.utcnow()
    },
    {
        'id': str(uuid.uuid4()),
        'name': 'Carol Williams',
        'username': 'carol',
        'phone': '+1234567892',
        'email': 'carol@example.com',
        'about': 'Designer | Art lover 🎨',
        'avatar': 'https://i.pravatar.cc/150?img=5',
        'is_online': True,
        'last_seen': datetime.utcnow(),
        'privacy_settings': {
            'show_phone': False,
            'show_last_seen': False,
            'show_profile_photo': True,
            'show_about': True
        },
        'created_at': datetime.utcnow()
    },
    {
        'id': str(uuid.uuid4()),
        'name': 'David Brown',
        'username': 'david',
        'phone': '+1234567893',
        'email': 'david@example.com',
        'about': 'Entrepreneur | Tech enthusiast 🚀',
        'avatar': 'https://i.pravatar.cc/150?img=13',
        'is_online': False,
        'last_seen': datetime.utcnow(),
        'privacy_settings': {
            'show_phone': True,
            'show_last_seen': True,
            'show_profile_photo': True,
            'show_about': True
        },
        'created_at': datetime.utcnow()
    },
    {
        'id': str(uuid.uuid4()),
        'name': 'Emma Davis',
        'username': 'emma',
        'phone': '+1234567894',
        'email': 'emma@example.com',
        'about': 'Writer | Bookworm 📚',
        'avatar': 'https://i.pravatar.cc/150?img=9',
        'is_online': True,
        'last_seen': datetime.utcnow(),
        'privacy_settings': {
            'show_phone': True,
            'show_last_seen': True,
            'show_profile_photo': True,
            'show_about': True
        },
        'created_at': datetime.utcnow()
    }
]

async def seed_demo_users():
    """Seed demo users into the database"""
    try:
        # Connect to MongoDB
        client = AsyncIOMotorClient(MONGO_URL)
        db = client[DB_NAME]
        users_collection = db['users']
        
        print("🌱 Starting to seed demo users...")
        
        # Check if demo users already exist
        existing_users = await users_collection.count_documents({'username': {'$in': [u['username'] for u in DEMO_USERS]}})
        
        if existing_users > 0:
            print(f"⚠️  Found {existing_users} existing demo users. Removing them first...")
            await users_collection.delete_many({'username': {'$in': [u['username'] for u in DEMO_USERS]}})
        
        # Insert demo users
        result = await users_collection.insert_many(DEMO_USERS)
        print(f"✅ Successfully seeded {len(result.inserted_ids)} demo users!")
        
        # Print user details
        print("\n📋 Demo Users Created:")
        print("-" * 60)
        for user in DEMO_USERS:
            print(f"Name: {user['name']}")
            print(f"Username: @{user['username']}")
            print(f"Phone: {user['phone']}")
            print(f"About: {user['about']}")
            print("-" * 60)
        
        print("\n✨ Demo users are ready to use!")
        print("🔐 Test OTP: 123456")
        print("\n💡 You can now:")
        print("   1. Sign in with any demo user's phone/email")
        print("   2. Use OTP: 123456")
        print("   3. Start chatting with other demo users!")
        
        client.close()
        
    except Exception as e:
        print(f"❌ Error seeding demo users: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(seed_demo_users())
