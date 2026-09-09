from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models

router = APIRouter(prefix="/infrastructure", tags=["Infrastructure"])


def _i_dict(i: models.Infrastructure) -> dict:
    return {
        "id": i.id, "infrastructure_id": i.infrastructure_id, "type": i.type,
        "depth": i.depth, "geometry": i.geometry, "status": i.status,
        "owner": i.owner, "conflict_status": i.conflict_status,
    }


@router.get("/")
def list_infra(type: str | None = None, db: Session = Depends(get_db)):
    q = db.query(models.Infrastructure).order_by(models.Infrastructure.id)
    if type:
        q = q.filter(models.Infrastructure.type == type)
    return [_i_dict(i) for i in q.all()]


@router.post("/")
def create_infra(payload: dict, db: Session = Depends(get_db)):
    if not payload.get("infrastructure_id"):
        raise HTTPException(status_code=400, detail="infrastructure_id is required")
    exists = db.query(models.Infrastructure).filter(models.Infrastructure.infrastructure_id == payload["infrastructure_id"]).first()
    if exists:
        raise HTTPException(status_code=400, detail="Infrastructure ID already exists")
    i = models.Infrastructure(
        infrastructure_id=payload["infrastructure_id"],
        type=payload.get("type"),
        depth=payload.get("depth"),
        geometry=payload.get("geometry"),
        status=payload.get("status", "active"),
        owner=payload.get("owner"),
        conflict_status=payload.get("conflict_status", "no_conflict"),
    )
    db.add(i)
    db.commit()
    db.refresh(i)
    return _i_dict(i)


@router.post("/check-conflict")
def check_conflict(payload: dict, db: Session = Depends(get_db)):
    """Check underground infra near a proposed foundation depth.

    Body: { foundation_depth: float, tolerance: float = 3.0 }
    Any asset within tolerance metres flags a conflict.
    """
    try:
        foundation = float(payload.get("foundation_depth", 0))
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail="foundation_depth must be a number")
    tolerance = float(payload.get("tolerance", 3.0))
    conflicts = []
    for i in db.query(models.Infrastructure).all():
        if i.depth is None:
            continue
        gap = abs(i.depth - foundation)
        if gap <= tolerance:
            conflicts.append({**_i_dict(i), "depth_gap": round(gap, 2), "severity": "high" if gap <= 1.5 else "medium"})
    return {"foundation_depth": foundation, "tolerance": tolerance,
            "conflict_count": len(conflicts), "conflicts": conflicts}


@router.put("/{infra_id}")
def update_infra(infra_id: int, payload: dict, db: Session = Depends(get_db)):
    i = db.query(models.Infrastructure).filter(models.Infrastructure.id == infra_id).first()
    if not i:
        raise HTTPException(status_code=404, detail="Infrastructure not found")
    for field in ["type", "depth", "geometry", "status", "owner", "conflict_status"]:
        if field in payload:
            setattr(i, field, payload[field])
    db.commit()
    db.refresh(i)
    return _i_dict(i)


@router.delete("/{infra_id}")
def delete_infra(infra_id: int, db: Session = Depends(get_db)):
    i = db.query(models.Infrastructure).filter(models.Infrastructure.id == infra_id).first()
    if not i:
        raise HTTPException(status_code=404, detail="Infrastructure not found")
    db.delete(i)
    db.commit()
    return {"deleted": True, "id": infra_id}
