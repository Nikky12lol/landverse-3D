from collections import Counter

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models

router = APIRouter(prefix="/stats", tags=["Stats"])


@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db)):
    parcels = db.query(func.count(models.Parcel.id)).scalar() or 0
    buildings = db.query(func.count(models.Building.id)).scalar() or 0
    ulpins = db.query(func.count(models.UlpinRecord.id)).scalar() or 0
    infra = db.query(func.count(models.Infrastructure.id)).scalar() or 0
    avg_conf = db.query(func.avg(models.Building.ai_confidence)).scalar() or 0
    total_area = db.query(func.sum(models.Parcel.area)).scalar() or 0
    avg_height = db.query(func.avg(models.Building.height)).scalar() or 0

    by_type = Counter(b.building_type or "Unknown" for b in db.query(models.Building.building_type).all())
    by_status = Counter(b.status or "unknown" for b in db.query(models.Building.status).all())

    recent = db.query(models.AnalysisJob).order_by(models.AnalysisJob.id.desc()).limit(5).all()

    return {
        "parcels": parcels,
        "buildings": buildings,
        "ulpins": ulpins,
        "infrastructure": infra,
        "avg_confidence": round(float(avg_conf), 1),
        "total_area": round(float(total_area), 1),
        "avg_height": round(float(avg_height), 1),
        "by_type": [{"name": k, "value": v} for k, v in by_type.most_common()],
        "by_status": [{"name": k, "value": v} for k, v in by_status.most_common()],
        "recent_jobs": [{"id": j.id, "file_name": j.file_name, "status": j.status, "confidence": j.confidence} for j in recent],
    }
