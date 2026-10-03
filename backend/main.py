import os
import json
import asyncio
import urllib.parse
import urllib.request
from fastapi import FastAPI, UploadFile, File, Form, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import random
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.dirname(__file__)
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

from backend.database import engine, SessionLocal, Base
from backend.models import Crime

# Secure Notification Settings from Environment
NOTIFY_PHONE = os.getenv("NOTIFY_PHONE", "+916362984196")

raw_num = NOTIFY_PHONE.replace("+", "").replace(" ", "").replace("-", "")
CLEAN_WA_NUM = "91" + raw_num if len(raw_num) == 10 else raw_num

# Ensure tables exist
Base.metadata.create_all(bind=engine)

active_emergencies = []

class VehicleState:
    def __init__(self, veh_id, type_, lat, lng, driver_name="Driver", status="Available", phone="9480800108"):
        self.veh_id = veh_id
        self.type = type_
        self.lat = lat
        self.lng = lng
        self.driver_name = driver_name
        self.status = status
        self.phone = phone

vehicles = [
    VehicleState("P-101", "police", 14.4660, 75.9200, "Insp. Ramesh (Town PS)", "Available", "+91 9480803100"),
    VehicleState("P-102", "police", 14.4680, 75.9220, "Sub-Insp. Nagaraj (PJ Ext)", "Available", "+91 9480803102"),
    VehicleState("A-201", "ambulance", 14.4655, 75.9175, "Driver Manjunath (108 Central)", "Available", NOTIFY_PHONE),
    VehicleState("A-202", "ambulance", 14.4647, 75.9135, "Driver Shivakumar (Bapuji ER)", "Available", "+91 9844012345")
]

class ConnectionManager:
    def __init__(self):
        self.active: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active:
            self.active.remove(websocket)

    async def broadcast(self, message: dict):
        data = json.dumps(message)
        for conn in list(self.active):
            try:
                await conn.send_text(data)
            except Exception:
                self.disconnect(conn)

manager = ConnectionManager()
app = FastAPI(title="City 360 Davangere Emergency Dispatch System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CrimeOut(BaseModel):
    id: int
    title: str
    description: str
    latitude: float
    longitude: float
    severity: str
    type: str
    media_url: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True

class EmergencyPayload(BaseModel):
    latitude: float
    longitude: float
    citizen_name: Optional[str] = "Citizen SOS"
    phone: Optional[str] = None
    address: Optional[str] = "Davangere Emergency Spot"
    details: Optional[str] = "Critical Emergency SOS Triggered"

class DispatchAcceptPayload(BaseModel):
    emergency_id: int
    responder_id: str
    responder_type: str

class LocationSyncPayload(BaseModel):
    citizen_name: Optional[str] = "Citizen User"
    latitude: float
    longitude: float
    status: Optional[str] = "Active Tracking"

# ==========================================
# REAL PHYSICAL FAST2SMS & TWILIO DISPATCH HELPERS
# ==========================================

def send_real_fast2sms(phone_num: str, message: str):
    """Sends real SMS text to Indian phone numbers using Fast2SMS API key."""
    api_key = os.getenv("FAST2SMS_API_KEY")
    if not api_key:
        print("[Fast2SMS] No FAST2SMS_API_KEY configured.")
        return False
    try:
        clean_num = phone_num.replace("+91", "").replace("+", "").strip()
        url = "https://www.fast2sms.com/dev/bulkV2"
        payload = {
            "route": "q",
            "message": message[:150],
            "language": "english",
            "flash": 0,
            "numbers": clean_num
        }
        data = json.dumps(payload).encode("utf-8")
        headers = {
            "authorization": api_key,
            "Content-Type": "application/json"
        }
        req = urllib.request.Request(url, data=data, headers=headers)
        with urllib.request.urlopen(req) as response:
            res_str = response.read().decode("utf-8")
            print(f"[Fast2SMS Success] Sent SMS to {phone_num}: {res_str}")
            return True
    except urllib.error.HTTPError as he:
        try:
            err_body = he.read().decode("utf-8")
            print(f"[Fast2SMS API Response] Code: {he.code}, Body: {err_body}")
        except Exception:
            print(f"[Fast2SMS HTTP Error] {he}")
        return False
    except Exception as e:
        print(f"[Fast2SMS Exception] {e}")
        return False

def send_real_twilio_whatsapp_and_sms(phone_num: str, message: str):
    """Sends real SMS & WhatsApp messages via Twilio API if credentials are set in .env"""
    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    twilio_num = os.getenv("TWILIO_PHONE_NUMBER")

    if not (account_sid and auth_token):
        return False

    try:
        from twilio.rest import Client
        client = Client(account_sid, auth_token)

        if twilio_num:
            client.messages.create(body=message, from_=twilio_num, to=phone_num)

        wa_from = os.getenv("TWILIO_WHATSAPP_NUMBER", "whatsapp:+14155238886")
        wa_to = f"whatsapp:{phone_num if phone_num.startswith('+') else '+91' + phone_num}"
        client.messages.create(body=message, from_=wa_to, to=wa_to)
        print(f"[Twilio Success] Sent SMS & WhatsApp to {phone_num}")
        return True
    except Exception as e:
        print(f"[Twilio Error] {e}")
        return False

def send_formspree_email_notification(emergency_data: dict):
    """Sends automated email notifications to Police & Ambulance HQ via Formspree API."""
    formspree_url = os.getenv("FORMSPREE_ENDPOINT", "https://formspree.io/f/mdekqkqb")
    if not formspree_url:
        print("[Formspree] No FORMSPREE_ENDPOINT configured.")
        return False

    try:
        payload = {
            "email": os.getenv("FORMSPREE_EMAIL", "davangere.emergency.control@gmail.com"),
            "_subject": f"🚨 EMERGENCY SOS DISPATCH ALERT: {emergency_data.get('citizen_name', 'Patient')} ({emergency_data.get('address', 'Davangere')})",
            "patient_name": emergency_data.get("citizen_name", "Citizen"),
            "phone_number": emergency_data.get("phone", "N/A"),
            "address": emergency_data.get("address", "Davangere"),
            "latitude": emergency_data.get("latitude"),
            "longitude": emergency_data.get("longitude"),
            "details": emergency_data.get("details", "Emergency SOS Triggered"),
            "timestamp": emergency_data.get("timestamp"),
            "ambulance_portal_link": emergency_data.get("ambulance_redirect_url"),
            "police_admin_link": emergency_data.get("police_redirect_url")
        }
        data = json.dumps(payload).encode("utf-8")
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        }
        req = urllib.request.Request(formspree_url, data=data, headers=headers)
        with urllib.request.urlopen(req) as response:
            res_str = response.read().decode("utf-8")
            print(f"[Formspree Success] Automated Email Sent via Formspree ({formspree_url}): {res_str}")
            return True
    except Exception as e:
        print(f"[Formspree Error] Failed to send Formspree email alert: {e}")
        return False


@app.get("/crimes", response_model=List[CrimeOut])
def get_crimes():
    db = SessionLocal()
    try:
        rows = db.query(Crime).order_by(Crime.created_at.asc()).all()
        return rows
    finally:
        db.close()

@app.get("/db_health")
def db_health():
    try:
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        return {"ok": True, "detail": "DB reachable"}
    except Exception as e:
        return {"ok": False, "error": str(e)}

@app.post("/report")
async def post_report(
    title: str = Form(...),
    description: str = Form(""),
    latitude: float = Form(...),
    longitude: float = Form(...),
    severity: str = Form("Medium"),
    type: str = Form("crime"),
    file: UploadFile | None = File(None)
):
    db = SessionLocal()
    media_url = None
    if file:
        ext = os.path.splitext(file.filename)[1]
        fname = f"{int(datetime.utcnow().timestamp()*1000)}{ext}"
        path = os.path.join(UPLOAD_DIR, fname)
        with open(path, "wb") as f:
            content = await file.read()
            f.write(content)
        media_url = f"/uploads/{fname}"

    c = Crime(
        title=title,
        description=description,
        latitude=latitude,
        longitude=longitude,
        severity=severity,
        type=type,
        media_url=media_url
    )
    db.add(c)
    db.commit()
    db.refresh(c)
    db.close()

    asyncio.create_task(manager.broadcast({"event": "new_crime", "crime": {
        "id": c.id,
        "title": c.title,
        "description": c.description,
        "latitude": c.latitude,
        "longitude": c.longitude,
        "severity": c.severity,
        "type": c.type,
        "media_url": (f"http://127.0.0.1:8000{c.media_url}" if c.media_url else None),
        "created_at": c.created_at.isoformat()
    }}))
    return {"ok": True, "id": c.id}

# ==========================================
# EMERGENCY SOS WITH FAST2SMS & WHATSAPP REDIRECT LINKS
# ==========================================

@app.post("/emergency")
async def trigger_emergency(payload: EmergencyPayload):
    db = SessionLocal()
    
    user_phone = payload.phone if (payload.phone and payload.phone.strip()) else "Not Provided"
    title = f"🚨 SOS EMERGENCY ALERT — {payload.address}"
    desc = f"PATIENT: {payload.citizen_name} | PHONE: {user_phone} | DETAILS: {payload.details}"
    
    c = Crime(
        title=title,
        description=desc,
        latitude=payload.latitude,
        longitude=payload.longitude,
        severity="High",
        type="emergency"
    )
    db.add(c)
    db.commit()
    db.refresh(c)
    db.close()

    ambulance_url = f"http://127.0.0.1:3000/ambulance.html?emergency_id={c.id}&lat={payload.latitude}&lng={payload.longitude}&mode=fastest_route"
    police_url = f"http://127.0.0.1:3000/admin.html?emergency_id={c.id}&lat={payload.latitude}&lng={payload.longitude}&mode=fastest_route"

    sms_text = f"🚨 EMERGENCY AMBULANCE DISPATCH!\nPatient: {payload.citizen_name}\nSpot: {payload.address}\nPhone: {user_phone}\nShortest Route Link:\n{ambulance_url}"
    ambulance_sms_uri = f"sms:{user_phone}?body={urllib.parse.quote(sms_text)}"

    whatsapp_text = f"🚨 CRITICAL POLICE EMERGENCY ALERT (Davangere)\nPatient: {payload.citizen_name}\nSpot: {payload.address}\nPhone: {user_phone}\nShortest Route Link:\n{police_url}"
    clean_num = "".join(c for c in user_phone if c.isdigit())
    wa_target = ("91" + clean_num[-10:]) if len(clean_num) >= 10 else ""
    whatsapp_api_link = f"https://api.whatsapp.com/send?phone={wa_target}&text={urllib.parse.quote(whatsapp_text)}" if wa_target else f"https://api.whatsapp.com/send?text={urllib.parse.quote(whatsapp_text)}"

    emergency_data = {
        "id": c.id,
        "title": title,
        "description": desc,
        "citizen_name": payload.citizen_name,
        "phone": user_phone,
        "address": payload.address,
        "details": payload.details,
        "latitude": payload.latitude,
        "longitude": payload.longitude,
        "status": "DISPATCH_REQUIRED",
        "assigned_police": None,
        "assigned_ambulance": None,
        "timestamp": datetime.utcnow().isoformat(),
        "ambulance_sms_text": sms_text,
        "ambulance_sms_uri": ambulance_sms_uri,
        "ambulance_redirect_url": ambulance_url,
        "police_whatsapp_text": whatsapp_text,
        "police_whatsapp_api_link": whatsapp_api_link,
        "police_redirect_url": police_url
    }

    # Attempt physical Fast2SMS dispatch, Twilio, and Formspree Email notification
    send_real_fast2sms(user_phone, sms_text)
    send_real_twilio_whatsapp_and_sms(user_phone, whatsapp_text)
    formspree_sent = send_formspree_email_notification(emergency_data)
    emergency_data["formspree_sent"] = formspree_sent

    active_emergencies.append(emergency_data)

    asyncio.create_task(manager.broadcast({
        "event": "emergency_alert",
        "emergency": emergency_data
    }))

    return {
        "ok": True,
        "emergency": emergency_data,
        "ambulance_sms_text": sms_text,
        "ambulance_sms_uri": ambulance_sms_uri,
        "ambulance_redirect_url": ambulance_url,
        "police_whatsapp_api_link": whatsapp_api_link,
        "police_redirect_url": police_url,
        "message": "Emergency SOS broadcasted."
    }

class SMSPayload(BaseModel):
    phone: str
    message: str
    recipient_type: Optional[str] = "ambulance"

@app.post("/send_sms")
async def send_sms_api(payload: SMSPayload):
    phone_to_use = payload.phone if (payload.phone and len(payload.phone) >= 10) else NOTIFY_PHONE
    sent_success = send_real_fast2sms(phone_to_use, payload.message)
    sms_uri = f"sms:{phone_to_use}?body={urllib.parse.quote(payload.message)}"
    return {
        "ok": True,
        "fast2sms_sent": sent_success,
        "sms_uri": sms_uri,
        "phone": phone_to_use,
        "message": payload.message
    }

@app.post("/sync_location")
async def sync_citizen_location(payload: LocationSyncPayload):
    sync_data = {
        "event": "citizen_location_sync",
        "data": {
            "citizen_name": payload.citizen_name,
            "latitude": payload.latitude,
            "longitude": payload.longitude,
            "status": payload.status,
            "timestamp": datetime.utcnow().isoformat()
        }
    }
    asyncio.create_task(manager.broadcast(sync_data))
    return {"ok": True, "sync": sync_data}

@app.get("/emergencies")
def get_emergencies():
    return active_emergencies

@app.post("/emergency/accept")
async def accept_emergency(payload: DispatchAcceptPayload):
    for em in active_emergencies:
        if em["id"] == payload.emergency_id:
            if payload.responder_type == "police":
                em["assigned_police"] = payload.responder_id
            elif payload.responder_type == "ambulance":
                em["assigned_ambulance"] = payload.responder_id
            em["status"] = "EN_ROUTE"
            
            asyncio.create_task(manager.broadcast({
                "event": "emergency_assigned",
                "emergency": em,
                "responder_type": payload.responder_type,
                "responder_id": payload.responder_id
            }))
            return {"ok": True, "emergency": em}
    return {"ok": False, "error": "Emergency not found"}

@app.get("/uploads/{fname}")
def serve_upload(fname: str):
    path = os.path.join(UPLOAD_DIR, fname)
    if os.path.exists(path):
        return FileResponse(path)
    return {"error": "not found"}

@app.get("/vehicles")
def get_vehicles():
    return [{
        "veh_id": v.veh_id,
        "type": v.type,
        "lat": v.lat,
        "lng": v.lng,
        "driver_name": v.driver_name,
        "status": v.status,
        "phone": v.phone
    } for v in vehicles]

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)

async def vehicle_simulator():
    while True:
        for v in vehicles:
            v.lat += random.uniform(-0.0004, 0.0004)
            v.lng += random.uniform(-0.0004, 0.0004)
            await manager.broadcast({
                "event": "vehicle_update",
                "vehicle": {
                    "veh_id": v.veh_id,
                    "type": v.type,
                    "lat": v.lat,
                    "lng": v.lng,
                    "driver_name": v.driver_name,
                    "status": v.status,
                    "phone": v.phone
                }
            })
        stats = {
            "count_crimes": None,
            "count_vehicles": len(vehicles)
        }
        db = SessionLocal()
        try:
            stats["count_crimes"] = db.query(Crime).count()
        finally:
            db.close()
        await manager.broadcast({"event": "stats_update", "stats": stats})
        await asyncio.sleep(6)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(vehicle_simulator())