from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models

router = APIRouter(prefix="/units", tags=["Floors & Units"])


@router.get("/floors/{floor_id}/units")
def list_units(floor_id: int, db: Session = Depends(get_db)):
    units = db.query(models.PropertyUnit).filter(models.PropertyUnit.floor_id == floor_id).all()
    return [{"id": u.id, "floor_id": u.floor_id, "unit_number": u.unit_number, "area": u.area,
             "property_type": u.property_type, "owner_status": u.owner_status} for u in units]


@router.post("/floors/{floor_id}/units")
def create_unit(floor_id: int, payload: dict, db: Session = Depends(get_db)):
    f = db.query(models.Floor).filter(models.Floor.id == floor_id).first()
    if not f:
        raise HTTPException(status_code=404, detail="Floor not found")
    u = models.PropertyUnit(
        floor_id=floor_id,
        unit_number=payload.get("unit_number", "101"),
        area=payload.get("area"),
        property_type=payload.get("property_type"),
        owner_status=payload.get("owner_status"),
    )
    db.add(u)
    f.units_count = (f.units_count or 0) + 1
    db.commit()
    db.refresh(u)
    return {"id": u.id, "floor_id": u.floor_id, "unit_number": u.unit_number, "area": u.area,
            "property_type": u.property_type, "owner_status": u.owner_status}
