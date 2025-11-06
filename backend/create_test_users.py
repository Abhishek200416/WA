#!/usr/bin/env python3
"""
Create test users for WA application
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
from datetime import datetime, timezone
import uuid

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
db_name = os.environ['DB_NAME']

async def create_test_users():
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    # Clear existing test data
    await db.users.delete_many({"phone_number": {"$regex": "^\\+1555"}})
    await db.contacts.delete_many({})
    await db.chats.delete_many({})
    await db.messages.delete_many({})
    
    # Create test users
    test_users = [
        {
            "id": str(uuid.uuid4()),
            "phone_number": "+15551234567",
            "display_name": "Alice Johnson",
            "username": "alice",
            "about": "Love coding and coffee!",
            "avatar_url": None,
            "public_key": "test_public_key_alice",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "last_seen": datetime.now(timezone.utc).isoformat(),
            "privacy_settings": {
                "profile_photo": "everyone",
                "about": "everyone",
                "last_seen": "everyone",
                "status": "contacts",
                "read_receipts": True,
                "online_status": True
            }
        },
        {
            "id": str(uuid.uuid4()),
            "phone_number": "+15551234568",
            "display_name": "Bob Smith",
            "username": "bob",
            "about": "Always online!",
            "avatar_url": None,
            "public_key": "test_public_key_bob",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "last_seen": datetime.now(timezone.utc).isoformat(),
            "privacy_settings": {
                "profile_photo": "everyone",
                "about": "everyone",
                "last_seen": "everyone",
                "status": "contacts",
                "read_receipts": True,
                "online_status": True
            }
        },
        {
            "id": str(uuid.uuid4()),
            "phone_number": "+15551234569",
            "display_name": "Carol Davis",
            "username": "carol",
            "about": "Tech enthusiast 🚀",
            "avatar_url": None,
            "public_key": "test_public_key_carol",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "last_seen": datetime.now(timezone.utc).isoformat(),
            "privacy_settings": {
                "profile_photo": "everyone",
                "about": "everyone",
                "last_seen": "everyone",
                "status": "contacts",
                "read_receipts": True,
                "online_status": True
            }
        }
    ]
    
    await db.users.insert_many(test_users)
    print(f"✅ Created {len(test_users)} test users")
    
    # Create contacts (make Alice, Bob, and Carol contacts of each other)
    contacts = []
    for i, user1 in enumerate(test_users):
        for j, user2 in enumerate(test_users):
            if i != j:
                contacts.append({
                    "id": str(uuid.uuid4()),
                    "user_id": user1["id"],
                    "contact_user_id": user2["id"],
                    "nickname": None,
                    "is_blocked": False,
                    "created_at": datetime.now(timezone.utc).isoformat()
                })
    
    await db.contacts.insert_many(contacts)
    print(f"✅ Created {len(contacts)} contact relationships")
    
    # Create a test group chat
    group_chat = {
        "id": str(uuid.uuid4()),
        "type": "group",
        "name": "WA Test Group",
        "description": "A test group for WA",
        "participants": [user["id"] for user in test_users],
        "admins": [test_users[0]["id"]],
        "owner_id": test_users[0]["id"],
        "settings": {
            "only_admins_message": False,
            "disappearing_timer": None,
            "encryption_enabled": True
        },
        "invite_link": f"wa://{str(uuid.uuid4())[:8]}",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.chats.insert_one(group_chat)
    print(f"✅ Created test group chat: {group_chat['name']}")
    
    # Create a sample message in the group
    message = {
        "id": str(uuid.uuid4()),
        "chat_id": group_chat["id"],
        "sender_id": test_users[0]["id"],
        "content": "Welcome to WA! This is a test message.",
        "message_type": "text",
        "reply_to": None,
        "forwarded_from": None,
        "attachments": [],
        "reactions": [],
        "status": "sent",
        "is_edited": False,
        "is_deleted": False,
        "deleted_for": [],
        "encryption_data": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "edited_at": None,
        "expires_at": None
    }
    
    await db.messages.insert_one(message)
    print(f"✅ Created test message")
    
    print("\n📝 Test Users:")
    for user in test_users:
        print(f"   {user['display_name']}: {user['phone_number']} (OTP: 123456)")
    
    print("\n🎉 Test data created successfully!")
    print("   You can now login with any of the phone numbers using OTP: 123456")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(create_test_users())
