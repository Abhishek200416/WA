from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, WebSocket, WebSocketDisconnect, Depends, status
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import socketio
import json
import hashlib
import secrets
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa, padding
import base64
import aiofiles
from PIL import Image
import io
import phonenumbers
from phonenumbers import NumberParseException

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create upload directory
UPLOAD_DIR = ROOT_DIR / 'uploads'
UPLOAD_DIR.mkdir(exist_ok=True)

# Socket.IO Server
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*',
    ping_timeout=60,
    ping_interval=25
)

# Create FastAPI app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Store active connections
active_connections: Dict[str, str] = {}  # user_id -> socket_id
user_devices: Dict[str, List[str]] = {}  # user_id -> [device_ids]

# ===== MODELS =====

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    phone_number: Optional[str] = None
    email: Optional[str] = None
    username: Optional[str] = None
    display_name: str
    avatar_url: Optional[str] = None
    about: Optional[str] = ""
    public_key: Optional[str] = None
    identity_key: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_seen: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    privacy_settings: Dict[str, Any] = Field(default_factory=lambda: {
        "profile_photo": "everyone",
        "about": "everyone",
        "last_seen": "everyone",
        "status": "contacts",
        "read_receipts": True,
        "online_status": True
    })

class Device(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    device_name: str
    device_type: str  # ios, android, desktop, web
    public_key: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_active: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True

class Contact(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    contact_user_id: str
    nickname: Optional[str] = None
    is_blocked: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Chat(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str  # direct, group, channel
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    description: Optional[str] = None
    participants: List[str] = Field(default_factory=list)
    admins: List[str] = Field(default_factory=list)
    owner_id: Optional[str] = None
    settings: Dict[str, Any] = Field(default_factory=lambda: {
        "only_admins_message": False,
        "disappearing_timer": None,
        "encryption_enabled": True
    })
    invite_link: Optional[str] = None
    pinned_message_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Message(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    chat_id: str
    sender_id: str
    content: str
    message_type: str = "text"  # text, image, video, audio, document, location, contact
    reply_to: Optional[str] = None
    forwarded_from: Optional[str] = None
    attachments: List[Dict[str, Any]] = Field(default_factory=list)
    reactions: List[Dict[str, Any]] = Field(default_factory=list)
    status: str = "sent"  # sent, delivered, read
    is_edited: bool = False
    is_deleted: bool = False
    deleted_for: List[str] = Field(default_factory=list)
    encryption_data: Optional[Dict[str, Any]] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    edited_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None

class Status(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    content_type: str  # text, image, video
    content: str
    media_url: Optional[str] = None
    background_color: Optional[str] = None
    viewers: List[str] = Field(default_factory=list)
    privacy: str = "contacts"  # contacts, everyone, custom
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    expires_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc) + timedelta(hours=24))

class Call(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    chat_id: str
    caller_id: str
    call_type: str  # audio, video
    participants: List[str] = Field(default_factory=list)
    status: str  # ringing, ongoing, ended, missed
    started_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    ended_at: Optional[datetime] = None
    duration: Optional[int] = None

# ===== INPUT MODELS =====

class OTPRequest(BaseModel):
    phone_number: Optional[str] = None
    email: Optional[str] = None

class OTPVerify(BaseModel):
    phone_number: Optional[str] = None
    email: Optional[str] = None
    otp: str
    device_name: str
    device_type: str
    public_key: str

class MessageCreate(BaseModel):
    chat_id: str
    content: str
    message_type: str = "text"
    reply_to: Optional[str] = None
    attachments: List[Dict[str, Any]] = Field(default_factory=list)

class ChatCreate(BaseModel):
    type: str
    name: Optional[str] = None
    participants: List[str] = Field(default_factory=list)

class ContactAdd(BaseModel):
    phone_number: Optional[str] = None
    username: Optional[str] = None

# ===== HELPER FUNCTIONS =====

def generate_otp():
    """Generate 6-digit OTP (mock for testing)"""
    return "123456"  # Mock OTP for testing

def validate_phone_number(phone: str) -> bool:
    try:
        parsed = phonenumbers.parse(phone, None)
        return phonenumbers.is_valid_number(parsed)
    except NumberParseException:
        return False

async def get_user_by_id(user_id: str) -> Optional[User]:
    user_doc = await db.users.find_one({"id": user_id}, {"_id": 0})
    if user_doc:
        if isinstance(user_doc.get('created_at'), str):
            user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
        if isinstance(user_doc.get('last_seen'), str):
            user_doc['last_seen'] = datetime.fromisoformat(user_doc['last_seen'])
        return User(**user_doc)
    return None

async def update_last_seen(user_id: str):
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"last_seen": datetime.now(timezone.utc).isoformat()}}
    )

# ===== AUTH ENDPOINTS =====

@api_router.post("/auth/request-otp")
async def request_otp(data: OTPRequest):
    """Request OTP for phone or email"""
    if not data.phone_number and not data.email:
        raise HTTPException(status_code=400, detail="Phone number or email required")
    
    # In production, send SMS/Email here
    otp = generate_otp()
    
    # Store OTP in DB with expiry
    otp_doc = {
        "phone_number": data.phone_number,
        "email": data.email,
        "otp": otp,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "expires_at": (datetime.now(timezone.utc) + timedelta(minutes=10)).isoformat()
    }
    await db.otps.insert_one(otp_doc)
    
    return {"message": "OTP sent successfully", "otp": otp}  # Remove otp in production

@api_router.post("/auth/verify-otp")
async def verify_otp(data: OTPVerify):
    """Verify OTP and create/login user"""
    # Find OTP
    query = {}
    if data.phone_number:
        query["phone_number"] = data.phone_number
    elif data.email:
        query["email"] = data.email
    
    otp_doc = await db.otps.find_one(query)
    
    if not otp_doc or otp_doc["otp"] != data.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    expires_at = datetime.fromisoformat(otp_doc["expires_at"])
    if datetime.now(timezone.utc) > expires_at:
        raise HTTPException(status_code=400, detail="OTP expired")
    
    # Find or create user
    user_query = {}
    if data.phone_number:
        user_query["phone_number"] = data.phone_number
    elif data.email:
        user_query["email"] = data.email
    
    user_doc = await db.users.find_one(user_query, {"_id": 0})
    
    if user_doc:
        user = User(**user_doc)
    else:
        # Create new user
        user = User(
            phone_number=data.phone_number,
            email=data.email,
            display_name=data.phone_number or data.email or "User",
            username=f"user_{str(uuid.uuid4())[:8]}"
        )
        user_dict = user.model_dump()
        user_dict['created_at'] = user_dict['created_at'].isoformat()
        user_dict['last_seen'] = user_dict['last_seen'].isoformat()
        await db.users.insert_one(user_dict)
    
    # Create device
    device = Device(
        user_id=user.id,
        device_name=data.device_name,
        device_type=data.device_type,
        public_key=data.public_key
    )
    device_dict = device.model_dump()
    device_dict['created_at'] = device_dict['created_at'].isoformat()
    device_dict['last_active'] = device_dict['last_active'].isoformat()
    await db.devices.insert_one(device_dict)
    
    # Delete OTP
    await db.otps.delete_one({"_id": otp_doc["_id"]})
    
    return {
        "user": user.model_dump(),
        "device": device.model_dump(),
        "token": user.id  # Simple token, use JWT in production
    }

# ===== USER ENDPOINTS =====

@api_router.get("/users/me")
async def get_current_user(user_id: str):
    user = await get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@api_router.patch("/users/me")
async def update_user(user_id: str, updates: Dict[str, Any]):
    allowed_fields = ["display_name", "about", "avatar_url", "username", "privacy_settings"]
    update_data = {k: v for k, v in updates.items() if k in allowed_fields}
    
    if update_data:
        await db.users.update_one(
            {"id": user_id},
            {"$set": update_data}
        )
    
    return await get_user_by_id(user_id)

@api_router.get("/users/search")
async def search_users(query: str):
    users = await db.users.find({
        "$or": [
            {"username": {"$regex": query, "$options": "i"}},
            {"phone_number": {"$regex": query}},
            {"display_name": {"$regex": query, "$options": "i"}}
        ]
    }, {"_id": 0}).to_list(20)
    return users

# ===== CONTACT ENDPOINTS =====

@api_router.post("/contacts")
async def add_contact(user_id: str, contact_data: ContactAdd):
    # Find contact user
    query = {}
    if contact_data.phone_number:
        query["phone_number"] = contact_data.phone_number
    elif contact_data.username:
        query["username"] = contact_data.username
    
    contact_user = await db.users.find_one(query, {"_id": 0})
    if not contact_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if already exists
    existing = await db.contacts.find_one({
        "user_id": user_id,
        "contact_user_id": contact_user["id"]
    })
    
    if existing:
        return {"message": "Contact already exists"}
    
    contact = Contact(user_id=user_id, contact_user_id=contact_user["id"])
    contact_dict = contact.model_dump()
    contact_dict['created_at'] = contact_dict['created_at'].isoformat()
    await db.contacts.insert_one(contact_dict)
    
    return contact

@api_router.get("/contacts")
async def get_contacts(user_id: str):
    contacts = await db.contacts.find({"user_id": user_id, "is_blocked": False}, {"_id": 0}).to_list(1000)
    
    # Get user details for each contact
    contact_ids = [c["contact_user_id"] for c in contacts]
    users = await db.users.find({"id": {"$in": contact_ids}}, {"_id": 0}).to_list(1000)
    
    user_map = {u["id"]: u for u in users}
    
    result = []
    for contact in contacts:
        user_data = user_map.get(contact["contact_user_id"])
        if user_data:
            result.append({
                "contact": contact,
                "user": user_data
            })
    
    return result

# ===== CHAT ENDPOINTS =====

@api_router.post("/chats")
async def create_chat(user_id: str, chat_data: ChatCreate):
    if chat_data.type == "direct":
        if len(chat_data.participants) != 1:
            raise HTTPException(status_code=400, detail="Direct chat needs exactly 1 other participant")
        
        # Check if chat already exists
        existing = await db.chats.find_one({
            "type": "direct",
            "participants": {"$all": [user_id, chat_data.participants[0]]}
        }, {"_id": 0})
        
        if existing:
            return existing
        
        chat = Chat(
            type="direct",
            participants=[user_id, chat_data.participants[0]]
        )
    else:
        # Group or Channel
        chat = Chat(
            type=chat_data.type,
            name=chat_data.name,
            participants=[user_id] + chat_data.participants,
            admins=[user_id],
            owner_id=user_id,
            invite_link=f"wa://{str(uuid.uuid4())[:8]}"
        )
    
    chat_dict = chat.model_dump()
    chat_dict['created_at'] = chat_dict['created_at'].isoformat()
    chat_dict['updated_at'] = chat_dict['updated_at'].isoformat()
    await db.chats.insert_one(chat_dict)
    
    return chat

@api_router.get("/chats")
async def get_chats(user_id: str):
    chats = await db.chats.find(
        {"participants": user_id},
        {"_id": 0}
    ).to_list(1000)
    
    # Get last message for each chat
    for chat in chats:
        last_message = await db.messages.find_one(
            {"chat_id": chat["id"], "is_deleted": False},
            {"_id": 0},
            sort=[("created_at", -1)]
        )
        chat["last_message"] = last_message
    
    return chats

@api_router.get("/chats/{chat_id}/messages")
async def get_messages(chat_id: str, user_id: str, limit: int = 50, before: Optional[str] = None):
    query = {
        "chat_id": chat_id,
        "is_deleted": False,
        "deleted_for": {"$ne": user_id}
    }
    
    if before:
        before_date = datetime.fromisoformat(before)
        query["created_at"] = {"$lt": before_date.isoformat()}
    
    messages = await db.messages.find(query, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
    messages.reverse()
    
    return messages

# ===== MESSAGE ENDPOINTS =====

@api_router.post("/messages")
async def send_message(user_id: str, message_data: MessageCreate):
    # Verify user is in chat
    chat = await db.chats.find_one({"id": message_data.chat_id}, {"_id": 0})
    if not chat or user_id not in chat["participants"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    message = Message(
        chat_id=message_data.chat_id,
        sender_id=user_id,
        content=message_data.content,
        message_type=message_data.message_type,
        reply_to=message_data.reply_to,
        attachments=message_data.attachments
    )
    
    message_dict = message.model_dump()
    message_dict['created_at'] = message_dict['created_at'].isoformat()
    await db.messages.insert_one(message_dict)
    
    # Update chat updated_at
    await db.chats.update_one(
        {"id": message_data.chat_id},
        {"$set": {"updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    # Emit via Socket.IO
    await sio.emit('new_message', message.model_dump(), room=message_data.chat_id)
    
    return message

@api_router.patch("/messages/{message_id}")
async def update_message(message_id: str, user_id: str, updates: Dict[str, Any]):
    message = await db.messages.find_one({"id": message_id}, {"_id": 0})
    if not message or message["sender_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    allowed_fields = ["content", "is_edited"]
    update_data = {k: v for k, v in updates.items() if k in allowed_fields}
    update_data["edited_at"] = datetime.now(timezone.utc).isoformat()
    update_data["is_edited"] = True
    
    await db.messages.update_one({"id": message_id}, {"$set": update_data})
    
    # Emit update
    updated_message = await db.messages.find_one({"id": message_id}, {"_id": 0})
    await sio.emit('message_updated', updated_message, room=message["chat_id"])
    
    return updated_message

@api_router.delete("/messages/{message_id}")
async def delete_message(message_id: str, user_id: str, delete_for_everyone: bool = False):
    message = await db.messages.find_one({"id": message_id}, {"_id": 0})
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    if delete_for_everyone:
        if message["sender_id"] != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        # Check time limit (5 minutes)
        created_at = datetime.fromisoformat(message["created_at"])
        if datetime.now(timezone.utc) - created_at > timedelta(minutes=5):
            raise HTTPException(status_code=400, detail="Time limit exceeded")
        
        await db.messages.update_one(
            {"id": message_id},
            {"$set": {"is_deleted": True, "content": "This message was deleted"}}
        )
        
        await sio.emit('message_deleted', {"message_id": message_id, "for_everyone": True}, room=message["chat_id"])
    else:
        # Delete for me only
        await db.messages.update_one(
            {"id": message_id},
            {"$addToSet": {"deleted_for": user_id}}
        )
    
    return {"message": "Message deleted"}

@api_router.post("/messages/{message_id}/react")
async def react_to_message(message_id: str, user_id: str, emoji: str):
    message = await db.messages.find_one({"id": message_id}, {"_id": 0})
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    # Remove existing reaction from user
    await db.messages.update_one(
        {"id": message_id},
        {"$pull": {"reactions": {"user_id": user_id}}}
    )
    
    # Add new reaction
    reaction = {"user_id": user_id, "emoji": emoji, "created_at": datetime.now(timezone.utc).isoformat()}
    await db.messages.update_one(
        {"id": message_id},
        {"$push": {"reactions": reaction}}
    )
    
    updated_message = await db.messages.find_one({"id": message_id}, {"_id": 0})
    await sio.emit('message_reaction', updated_message, room=message["chat_id"])
    
    return updated_message

# ===== FILE UPLOAD =====

@api_router.post("/upload")
async def upload_file(user_id: str, file: UploadFile = File(...)):
    file_id = str(uuid.uuid4())
    file_ext = Path(file.filename).suffix
    file_path = UPLOAD_DIR / f"{file_id}{file_ext}"
    
    # Save file
    async with aiofiles.open(file_path, 'wb') as f:
        content = await file.read()
        await f.write(content)
    
    # Generate thumbnail for images
    thumbnail_url = None
    if file.content_type and file.content_type.startswith('image/'):
        try:
            img = Image.open(io.BytesIO(content))
            img.thumbnail((200, 200))
            thumb_path = UPLOAD_DIR / f"{file_id}_thumb{file_ext}"
            img.save(thumb_path)
            thumbnail_url = f"/api/files/{file_id}_thumb{file_ext}"
        except Exception as e:
            logging.error(f"Thumbnail generation failed: {e}")
    
    file_url = f"/api/files/{file_id}{file_ext}"
    
    return {
        "file_id": file_id,
        "file_url": file_url,
        "thumbnail_url": thumbnail_url,
        "filename": file.filename,
        "content_type": file.content_type,
        "size": len(content)
    }

@api_router.get("/files/{file_name}")
async def get_file(file_name: str):
    file_path = UPLOAD_DIR / file_name
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path)

# ===== STATUS ENDPOINTS =====

@api_router.post("/status")
async def create_status(user_id: str, content_type: str, content: str, media_url: Optional[str] = None):
    status = Status(
        user_id=user_id,
        content_type=content_type,
        content=content,
        media_url=media_url
    )
    
    status_dict = status.model_dump()
    status_dict['created_at'] = status_dict['created_at'].isoformat()
    status_dict['expires_at'] = status_dict['expires_at'].isoformat()
    await db.status.insert_one(status_dict)
    
    return status

@api_router.get("/status")
async def get_statuses(user_id: str):
    # Get contacts
    contacts = await db.contacts.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    contact_ids = [c["contact_user_id"] for c in contacts]
    
    # Get active statuses
    now = datetime.now(timezone.utc).isoformat()
    statuses = await db.status.find({
        "user_id": {"$in": contact_ids},
        "expires_at": {"$gt": now}
    }, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    return statuses

# ===== CALL ENDPOINTS =====

@api_router.post("/calls")
async def initiate_call(user_id: str, chat_id: str, call_type: str):
    chat = await db.chats.find_one({"id": chat_id}, {"_id": 0})
    if not chat or user_id not in chat["participants"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    call = Call(
        chat_id=chat_id,
        caller_id=user_id,
        call_type=call_type,
        participants=[user_id],
        status="ringing"
    )
    
    call_dict = call.model_dump()
    call_dict['started_at'] = call_dict['started_at'].isoformat()
    await db.calls.insert_one(call_dict)
    
    # Emit call signal
    await sio.emit('incoming_call', call.model_dump(), room=chat_id)
    
    return call

# Include router
app.include_router(api_router)

# ===== SOCKET.IO EVENTS =====

@sio.event
async def connect(sid, environ):
    logging.info(f"Client connected: {sid}")

@sio.event
async def disconnect(sid):
    logging.info(f"Client disconnected: {sid}")
    # Remove from active connections
    for user_id, socket_id in list(active_connections.items()):
        if socket_id == sid:
            del active_connections[user_id]
            await sio.emit('user_offline', {"user_id": user_id})
            break

@sio.event
async def authenticate(sid, data):
    user_id = data.get('user_id')
    if user_id:
        active_connections[user_id] = sid
        await update_last_seen(user_id)
        
        # Get user's chats and join rooms
        chats = await db.chats.find({"participants": user_id}, {"_id": 0, "id": 1}).to_list(1000)
        for chat in chats:
            sio.enter_room(sid, chat["id"])
        
        await sio.emit('authenticated', {"user_id": user_id}, room=sid)
        await sio.emit('user_online', {"user_id": user_id})

@sio.event
async def typing_start(sid, data):
    chat_id = data.get('chat_id')
    user_id = data.get('user_id')
    await sio.emit('typing', {"chat_id": chat_id, "user_id": user_id, "typing": True}, room=chat_id, skip_sid=sid)

@sio.event
async def typing_stop(sid, data):
    chat_id = data.get('chat_id')
    user_id = data.get('user_id')
    await sio.emit('typing', {"chat_id": chat_id, "user_id": user_id, "typing": False}, room=chat_id, skip_sid=sid)

@sio.event
async def message_delivered(sid, data):
    message_id = data.get('message_id')
    user_id = data.get('user_id')
    
    # Update message status
    await db.messages.update_one(
        {"id": message_id},
        {"$set": {"status": "delivered"}}
    )
    
    message = await db.messages.find_one({"id": message_id}, {"_id": 0})
    if message:
        await sio.emit('message_status', {"message_id": message_id, "status": "delivered"}, room=message["chat_id"])

@sio.event
async def message_read(sid, data):
    message_id = data.get('message_id')
    user_id = data.get('user_id')
    
    # Update message status
    await db.messages.update_one(
        {"id": message_id},
        {"$set": {"status": "read"}}
    )
    
    message = await db.messages.find_one({"id": message_id}, {"_id": 0})
    if message:
        await sio.emit('message_status', {"message_id": message_id, "status": "read"}, room=message["chat_id"])

@sio.event
async def call_signal(sid, data):
    """Handle WebRTC signaling"""
    target_user_id = data.get('target_user_id')
    signal_data = data.get('signal')
    
    if target_user_id in active_connections:
        target_sid = active_connections[target_user_id]
        await sio.emit('call_signal', signal_data, room=target_sid)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

# Wrap Socket.IO with ASGI - this becomes the main app
socket_app = socketio.ASGIApp(sio, app)
app = socket_app
