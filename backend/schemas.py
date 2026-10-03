# schemas.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CrimeCreate(BaseModel):
    title: str
    description: str
    type: str
    severity: Optional[str] = "Medium"
    latitude: float
    longitude: float

class CrimeOut(CrimeCreate):
    id: int
    media_url: Optional[str]
    created_at: Optional[datetime]

    class Config:
        orm_mode = True

class VehiclePing(BaseModel):
    veh_id: str
    type: str   # police or ambulance
    lat: float
    lng: float

class VehicleOut(BaseModel):
    """Represents a vehicle returned by the API.

    The `number` field is optional (plate/identifier). """
    veh_id: str
    type: str | None = None
    number: str | None = None
    lat: float | None = None
    lng: float | None = None

    class Config:
        orm_mode = True

class AlertOut(BaseModel):
    id: int
    title: str
    description: str
    type: str
    severity: str
    latitude: float
    longitude: float
    media_url: str | None

    class Config:
        orm_mode = True


# Additional response models used by admin / other endpoints
class PoliceStation(BaseModel):
    id: int
    station_name: str
    address: str | None = None
    contact_number: str | None = None

    class Config:
        orm_mode = True


class Hospital(BaseModel):
    id: int
    hospital_name: str
    address: str | None = None
    contact_numbers: str | None = None

    class Config:
        orm_mode = True


class Helpline(BaseModel):
    service_name: str
    helpline_number: str

    class Config:
        orm_mode = True

# ---------- schemas.py (Pydantic Models) ----------
from pydantic import BaseModel

class PoliceStation(BaseModel):
    id: int
    station_name: str
    address: str | None = None
    contact_number: str | None = None

    class Config:
        orm_mode = True


class Hospital(BaseModel):
    id: int
    hospital_name: str
    address: str | None = None
    contact_numbers: str | None = None

    class Config:
        orm_mode = True


class Helpline(BaseModel):
    service_name: str
    helpline_number: str

    class Config:
        orm_mode = True
