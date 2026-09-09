from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models

router = APIRouter(prefix="/buildings", tags=["Buildings"])


def _b_dict(b: models.Building) -> dict:
    return {
        "id": b.id,
        "parcel_id": b.parcel_id,
        "building_code": b.building_code,
        "height": b.height,
        "floors": b.floors,
        "building_type": b.building_type,
        "ai_confidence": b.ai_confidence,
        "footprint": b.footprint,
        "status": b.status,
        "created_at": b.created_at.isoformat() if b.created_at else None,
    }


@router.get("/")
def list_buildings(parcel_id: int | None = None, db: Session = Depends(get_db)):
    q = db.query(models.Building).order_by(models.Building.id)
    if parcel_id:
        q = q.filter(models.Building.parcel_id == parcel_id)
    return [_b_dict(b) for b in q.all()]


@router.get("/{building_id}")
def get_building(building_id: int, db: Session = Depends(get_db)):
    b = db.query(models.Building).filter(models.Building.id == building_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Building not found")
    data = _b_dict(b)
    parcel = db.query(models.Parcel).filter(models.Parcel.id == b.parcel_id).first() if b.parcel_id else None
    data["parcel"] = (
        {"id": parcel.id, "parcel_number": parcel.parcel_number, "location": parcel.location, "area": parcel.area}
        if parcel else None
    )
    floors = db.query(models.Floor).filter(models.Floor.building_id == b.id).order_by(models.Floor.floor_number).all()
    data["floor_details"] = [
        {"id": f.id, "floor_number": f.floor_number, "height": f.height, "units_count": f.units_count} for f in floors
    ]
    return data


@router.get("/{building_id}/hierarchy")
def get_hierarchy(building_id: int, db: Session = Depends(get_db)):
    """Full Parcel → Building → Floors → Units tree for 3D drill-down."""
    b = db.query(models.Building).filter(models.Building.id == building_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Building not found")
    parcel = db.query(models.Parcel).filter(models.Parcel.id == b.parcel_id).first() if b.parcel_id else None
    floors = db.query(models.Floor).filter(models.Floor.building_id == b.id).order_by(models.Floor.floor_number).all()
    tree_floors = []
    for f in floors:
        units = db.query(models.PropertyUnit).filter(models.PropertyUnit.floor_id == f.id).all()
        tree_floors.append({
            "id": f.id, "floor_number": f.floor_number, "height": f.height,
            "units": [{"id": u.id, "unit_number": u.unit_number, "area": u.area,
                       "property_type": u.property_type, "owner_status": u.owner_status} for u in units],
        })
    return {
        "parcel": {"id": parcel.id, "parcel_number": parcel.parcel_number, "location": parcel.location,
                   "latitude": parcel.latitude, "longitude": parcel.longitude, "area": parcel.area} if parcel else None,
        "building": _b_dict(b),
        "floors": tree_floors,
    }


@router.post("/")
def create_building(payload: dict, db: Session = Depends(get_db)):
    if not payload.get("building_code"):
        raise HTTPException(status_code=400, detail="building_code is required")
    exists = db.query(models.Building).filter(models.Building.building_code == payload["building_code"]).first()
    if exists:
        raise HTTPException(status_code=400, detail="Building code already exists")
    b = models.Building(
        parcel_id=payload.get("parcel_id"),
        building_code=payload["building_code"],
        height=payload.get("height"),
        floors=payload.get("floors"),
        building_type=payload.get("building_type"),
        ai_confidence=payload.get("ai_confidence"),
        footprint=payload.get("footprint"),
        status=payload.get("status", "active"),
    )
    db.add(b)
    db.flush()
    # Auto-create floor shells if floor count supplied
    n_floors = int(payload.get("floors") or 0)
    if 0 < n_floors <= 60:
        per = (float(payload.get("height") or 0) / n_floors) if payload.get("height") else 3.4
        for n in range(1, n_floors + 1):
            db.add(models.Floor(building_id=b.id, floor_number=n, height=round(per, 2), units_count=0))
    db.commit()
    db.refresh(b)
    return _b_dict(b)


@router.put("/{building_id}")
def update_building(building_id: int, payload: dict, db: Session = Depends(get_db)):
    b = db.query(models.Building).filter(models.Building.id == building_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Building not found")
    for field in ["parcel_id", "height", "floors", "building_type", "ai_confidence", "footprint", "status"]:
        if field in payload:
            setattr(b, field, payload[field])
    db.commit()
    db.refresh(b)
    return _b_dict(b)


@router.delete("/{building_id}")
def delete_building(building_id: int, db: Session = Depends(get_db)):
    b = db.query(models.Building).filter(models.Building.id == building_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Building not found")
    db.delete(b)
    db.commit()
    return {"deleted": True, "id": building_id}


# ---- Floors & Units ----

@router.get("/{building_id}/floors")
def list_floors(building_id: int, db: Session = Depends(get_db)):
    floors = db.query(models.Floor).filter(models.Floor.building_id == building_id).order_by(models.Floor.floor_number).all()
    return [{"id": f.id, "building_id": f.building_id, "floor_number": f.floor_number, "height": f.height, "units_count": f.units_count} for f in floors]


@router.post("/{building_id}/floors")
def create_floor(building_id: int, payload: dict, db: Session = Depends(get_db)):
    b = db.query(models.Building).filter(models.Building.id == building_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Building not found")
    f = models.Floor(
        building_id=building_id,
        floor_number=payload.get("floor_number", 1),
        height=payload.get("height", 3.4),
        units_count=payload.get("units_count", 0),
    )
    db.add(f)
    db.commit()
    db.refresh(f)
    return {"id": f.id, "building_id": f.building_id, "floor_number": f.floor_number, "height": f.height, "units_count": f.units_count}
