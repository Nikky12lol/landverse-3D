from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models
from ..services.ulpin import generate_ulpin, validate_ulpin

router = APIRouter(prefix="/ulpin", tags=["ULPIN"])


def _r_dict(r: models.UlpinRecord) -> dict:
    return {
        "id": r.id,
        "parcel_id": r.parcel_id,
        "building_id": r.building_id,
        "floor_id": r.floor_id,
        "unit_id": r.unit_id,
        "ulpin_code": r.ulpin_code,
        "country": r.country,
        "state": r.state,
        "city": r.city,
        "created_at": r.created_at.isoformat() if r.created_at else None,
    }


@router.get("/")
def list_ulpins(db: Session = Depends(get_db)):
    return [_r_dict(r) for r in db.query(models.UlpinRecord).order_by(models.UlpinRecord.id.desc()).all()]


@router.get("/{code}")
def get_ulpin(code: str, db: Session = Depends(get_db)):
    r = db.query(models.UlpinRecord).filter(models.UlpinRecord.ulpin_code == code.upper()).first()
    if not r:
        raise HTTPException(status_code=404, detail="ULPIN not found")
    return _r_dict(r)


@router.post("/generate")
def create_ulpin(payload: dict, db: Session = Depends(get_db)):
    code = generate_ulpin(
        country=payload.get("country", "IND"),
        state=payload.get("state", "TG"),
        city=payload.get("city", "HYD"),
        parcel=payload.get("parcel", "0000"),
        building=payload.get("building", 1),
        floor=payload.get("floor", 1),
        unit=payload.get("unit", 1),
    )
    exists = db.query(models.UlpinRecord).filter(models.UlpinRecord.ulpin_code == code).first()
    if exists:
        return {"ulpin_code": code, "existing": True, **_r_dict(exists)}
    r = models.UlpinRecord(
        parcel_id=payload.get("parcel_id"),
        building_id=payload.get("building_id"),
        floor_id=payload.get("floor_id"),
        unit_id=payload.get("unit_id"),
        ulpin_code=code,
        country=(payload.get("country", "IND") or "IND").upper()[:3],
        state=(payload.get("state", "TG") or "TG").upper()[:2],
        city=(payload.get("city", "HYD") or "HYD").upper()[:3],
    )
    db.add(r)
    db.commit()
    db.refresh(r)
    return {"ulpin_code": code, "existing": False, **_r_dict(r)}


@router.post("/validate")
def validate(payload: dict):
    return validate_ulpin(payload.get("code", ""))


@router.delete("/{record_id}")
def delete_ulpin(record_id: int, db: Session = Depends(get_db)):
    r = db.query(models.UlpinRecord).filter(models.UlpinRecord.id == record_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="ULPIN not found")
    db.delete(r)
    db.commit()
    return {"deleted": True, "id": record_id}
