from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models
from ..services.validation import validate_building

router = APIRouter(prefix="/validation", tags=["Validation"])


@router.post("/run")
def run_validation(payload: dict, db: Session = Depends(get_db)):
    building_id = payload.get("building_id") or payload.get("property_id")
    if not building_id:
        raise HTTPException(status_code=400, detail="building_id is required")
    b = db.query(models.Building).filter(models.Building.id == building_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Building not found")
    parcel = db.query(models.Parcel).filter(models.Parcel.id == b.parcel_id).first() if b.parcel_id else None
    result = validate_building({
        "height": b.height, "floors": b.floors, "building_type": b.building_type,
        "ai_confidence": b.ai_confidence,
        "parcel": {"area": parcel.area if parcel else None},
    })
    row = models.ValidationResult(property_id=b.id, score=result["score"], status=result["status"],
                                  warnings=result["warnings"], checks=result["checks"])
    db.add(row)
    b.status = result["status"]
    db.commit()
    db.refresh(row)
    return {"id": row.id, "building_id": b.id, "building_code": b.building_code, **result}


@router.get("/")
def list_validations(db: Session = Depends(get_db)):
    rows = db.query(models.ValidationResult).order_by(models.ValidationResult.id.desc()).limit(50).all()
    return [{
        "id": r.id, "property_id": r.property_id, "score": r.score, "status": r.status,
        "warnings": r.warnings, "checks": r.checks,
        "created_at": r.created_at.isoformat() if r.created_at else None,
    } for r in rows]


@router.get("/building/{building_id}")
def latest_for_building(building_id: int, db: Session = Depends(get_db)):
    r = db.query(models.ValidationResult).filter(models.ValidationResult.property_id == building_id).order_by(models.ValidationResult.id.desc()).first()
    if not r:
        raise HTTPException(status_code=404, detail="No validation found for building")
    return {"id": r.id, "property_id": r.property_id, "score": r.score, "status": r.status,
            "warnings": r.warnings, "checks": r.checks,
            "created_at": r.created_at.isoformat() if r.created_at else None}
