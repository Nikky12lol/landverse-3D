from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models

router = APIRouter(prefix="/parcels", tags=["Parcels"])


def _parcel_dict(p: models.Parcel, building_count: int = 0) -> dict:
    return {
        "id": p.id,
        "parcel_number": p.parcel_number,
        "location": p.location,
        "latitude": p.latitude,
        "longitude": p.longitude,
        "area": p.area,
        "geometry": p.geometry,
        "status": p.status,
        "building_count": building_count,
        "created_at": p.created_at.isoformat() if p.created_at else None,
    }


@router.get("/")
def list_parcels(db: Session = Depends(get_db)):
    parcels = db.query(models.Parcel).order_by(models.Parcel.id).all()
    out = []
    for p in parcels:
        count = db.query(models.Building).filter(models.Building.parcel_id == p.id).count()
        out.append(_parcel_dict(p, count))
    return out


@router.get("/{parcel_id}")
def get_parcel(parcel_id: int, db: Session = Depends(get_db)):
    p = db.query(models.Parcel).filter(models.Parcel.id == parcel_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Parcel not found")
    buildings = db.query(models.Building).filter(models.Building.parcel_id == p.id).all()
    data = _parcel_dict(p, len(buildings))
    data["buildings"] = [
        {"id": b.id, "building_code": b.building_code, "height": b.height, "floors": b.floors,
         "building_type": b.building_type, "ai_confidence": b.ai_confidence, "status": b.status}
        for b in buildings
    ]
    return data


@router.post("/")
def create_parcel(payload: dict, db: Session = Depends(get_db)):
    if not payload.get("parcel_number"):
        raise HTTPException(status_code=400, detail="parcel_number is required")
    exists = db.query(models.Parcel).filter(models.Parcel.parcel_number == payload["parcel_number"]).first()
    if exists:
        raise HTTPException(status_code=400, detail="Parcel number already exists")
    p = models.Parcel(
        parcel_number=payload["parcel_number"],
        location=payload.get("location"),
        latitude=payload.get("latitude"),
        longitude=payload.get("longitude"),
        area=payload.get("area"),
        geometry=payload.get("geometry"),
        status=payload.get("status", "active"),
    )
    db.add(p)
    db.commit()
    db.refresh(p)
    return _parcel_dict(p, 0)


@router.put("/{parcel_id}")
def update_parcel(parcel_id: int, payload: dict, db: Session = Depends(get_db)):
    p = db.query(models.Parcel).filter(models.Parcel.id == parcel_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Parcel not found")
    for field in ["location", "latitude", "longitude", "area", "geometry", "status"]:
        if field in payload:
            setattr(p, field, payload[field])
    db.commit()
    db.refresh(p)
    return _parcel_dict(p)


@router.delete("/{parcel_id}")
def delete_parcel(parcel_id: int, db: Session = Depends(get_db)):
    p = db.query(models.Parcel).filter(models.Parcel.id == parcel_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Parcel not found")
    db.delete(p)
    db.commit()
    return {"deleted": True, "id": parcel_id}
