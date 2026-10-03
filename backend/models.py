from sqlalchemy import Column, Integer, String, Float, DateTime, func
from backend.database import Base


class Crime(Base):
    __tablename__ = "crimes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(256), nullable=False)
    description = Column(String(2000), nullable=False)
    type = Column(String(64), nullable=False)
    severity = Column(String(32), nullable=False, default="Medium")
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    media_url = Column(String(1024), nullable=True)
    created_at = Column(DateTime, server_default=func.current_timestamp())


class Vehicle(Base):
    __tablename__ = "vehicles"

    # veh_id is stored in `id`
    id = Column(String(128), primary_key=True, index=True)
    type = Column(String(32), nullable=False)  # police / ambulance
    number = Column(String(64), nullable=True)  # optional plate/number
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    updated_at = Column(DateTime, server_default=func.current_timestamp(), onupdate=func.current_timestamp())
