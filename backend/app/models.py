"""SQLAlchemy models for LANDVERSE 3D."""
from datetime import datetime

from sqlalchemy import JSON, TIMESTAMP, DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class Parcel(Base):
    __tablename__ = "parcels"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    parcel_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    area: Mapped[float | None] = mapped_column(Float, nullable=True)
    geometry: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="active")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    buildings: Mapped[list["Building"]] = relationship("Building", back_populates="parcel", cascade="all, delete-orphan")


class Building(Base):
    __tablename__ = "buildings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    parcel_id: Mapped[int | None] = mapped_column(ForeignKey("parcels.id", ondelete="CASCADE"), nullable=True)
    building_code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    height: Mapped[float | None] = mapped_column(Float, nullable=True)
    floors: Mapped[int | None] = mapped_column(Integer, nullable=True)
    building_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    ai_confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    footprint: Mapped[dict | list | None] = mapped_column(JSON, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="active")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    parcel: Mapped["Parcel | None"] = relationship("Parcel", back_populates="buildings")
    floor_list: Mapped[list["Floor"]] = relationship("Floor", back_populates="building", cascade="all, delete-orphan")


class Floor(Base):
    __tablename__ = "floors"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    building_id: Mapped[int] = mapped_column(ForeignKey("buildings.id", ondelete="CASCADE"))
    floor_number: Mapped[int] = mapped_column(Integer, nullable=False)
    height: Mapped[float | None] = mapped_column(Float, nullable=True)
    units_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    building: Mapped["Building"] = relationship("Building", back_populates="floor_list")
    units: Mapped[list["PropertyUnit"]] = relationship("PropertyUnit", back_populates="floor", cascade="all, delete-orphan")


class PropertyUnit(Base):
    __tablename__ = "property_units"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    floor_id: Mapped[int] = mapped_column(ForeignKey("floors.id", ondelete="CASCADE"))
    unit_number: Mapped[str] = mapped_column(String(50), nullable=False)
    area: Mapped[float | None] = mapped_column(Float, nullable=True)
    property_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    owner_status: Mapped[str | None] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    floor: Mapped["Floor"] = relationship("Floor", back_populates="units")


class UlpinRecord(Base):
    __tablename__ = "ulpin_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    parcel_id: Mapped[int | None] = mapped_column(ForeignKey("parcels.id", ondelete="CASCADE"), nullable=True)
    building_id: Mapped[int | None] = mapped_column(ForeignKey("buildings.id", ondelete="CASCADE"), nullable=True)
    floor_id: Mapped[int | None] = mapped_column(ForeignKey("floors.id", ondelete="CASCADE"), nullable=True)
    unit_id: Mapped[int | None] = mapped_column(ForeignKey("property_units.id", ondelete="CASCADE"), nullable=True)
    ulpin_code: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    country: Mapped[str | None] = mapped_column(String(10), nullable=True)
    state: Mapped[str | None] = mapped_column(String(10), nullable=True)
    city: Mapped[str | None] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class Infrastructure(Base):
    __tablename__ = "infrastructure"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    infrastructure_id: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    depth: Mapped[float | None] = mapped_column(Float, nullable=True)
    geometry: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="active")
    owner: Mapped[str | None] = mapped_column(String(100), nullable=True)
    conflict_status: Mapped[str] = mapped_column(String(50), default="no_conflict")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class AnalysisJob(Base):
    __tablename__ = "ai_analysis_jobs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    file_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    file_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="pending")
    confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    height: Mapped[float | None] = mapped_column(Float, nullable=True)
    floors: Mapped[int | None] = mapped_column(Integer, nullable=True)
    building_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    footprint: Mapped[dict | list | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class ValidationResult(Base):
    __tablename__ = "validation_results"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    property_id: Mapped[int | None] = mapped_column(ForeignKey("buildings.id", ondelete="CASCADE"), nullable=True)
    score: Mapped[float | None] = mapped_column(Float, nullable=True)
    status: Mapped[str | None] = mapped_column(String(50), nullable=True)
    warnings: Mapped[list | None] = mapped_column(JSON, nullable=True)
    checks: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
