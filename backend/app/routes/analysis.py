import os
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models
from ..services.ai_detector import analyze_image

router = APIRouter(prefix="/analysis", tags=["AI Analysis"])

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "uploads")
UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "uploads"))
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED = {".jpg", ".jpeg", ".png", ".tif", ".tiff", ".webp", ".bmp"}


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED:
        raise HTTPException(status_code=400, detail=f"Unsupported file type {ext}. Use JPG/PNG/TIF/WebP.")
    unique = f"{uuid.uuid4().hex}{ext}"
    path = os.path.join(UPLOAD_DIR, unique)
    content = await file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File exceeds 10 MB limit")
    with open(path, "wb") as fh:
        fh.write(content)
    return {"filename": unique, "original_name": file.filename, "path": path, "size": len(content)}


@router.post("/run")
def run_analysis(payload: dict, db: Session = Depends(get_db)):
    filename = payload.get("filename")
    if not filename:
        raise HTTPException(status_code=400, detail="filename is required (upload first)")
    path = os.path.join(UPLOAD_DIR, os.path.basename(filename))
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Uploaded file not found")

    job = models.AnalysisJob(file_name=payload.get("original_name") or filename, file_path=path, status="processing")
    db.add(job)
    db.commit()
    db.refresh(job)

    try:
        result = analyze_image(path, annotated_dir=UPLOAD_DIR)
    except Exception as exc:  # never leave job stuck in processing
        job.status = "failed"
        db.commit()
        raise HTTPException(status_code=500, detail=f"Analysis failed: {exc}")

    job.status = "completed"
    job.confidence = result["confidence"]
    job.height = result["estimated_height"]
    job.floors = result["estimated_floors"]
    job.building_type = result["building_type"]
    job.footprint = result["footprint"]
    db.commit()
    db.refresh(job)

    created_building = None
    if payload.get("create_building"):
        code = payload.get("building_code") or f"BLD-{2100 + job.id}"
        exists = db.query(models.Building).filter(models.Building.building_code == code).first()
        if not exists:
            b = models.Building(
                parcel_id=payload.get("parcel_id"),
                building_code=code,
                height=result["estimated_height"],
                floors=result["estimated_floors"],
                building_type=result["building_type"],
                ai_confidence=result["confidence"],
                footprint=result["footprint"],
                status="active",
            )
            db.add(b)
            db.flush()
            for n in range(1, min(result["estimated_floors"] + 1, 61)):
                db.add(models.Floor(building_id=b.id, floor_number=n, height=round(result["estimated_height"] / result["estimated_floors"], 2), units_count=0))
            db.commit()
            created_building = {"id": b.id, "building_code": b.building_code}

    return {
        "job_id": job.id,
        "building_detected": result["building_detected"],
        "confidence": result["confidence"],
        "estimated_height": result["estimated_height"],
        "estimated_floors": result["estimated_floors"],
        "building_type": result["building_type"],
        "footprint": result["footprint"],
        "area_ratio": result.get("area_ratio"),
        "annotated": result.get("annotated"),
        "annotated_url": f"/uploads/{result['annotated']}" if result.get("annotated") else None,
        "created_building": created_building,
    }


@router.get("/")
def list_jobs(db: Session = Depends(get_db)):
    jobs = db.query(models.AnalysisJob).order_by(models.AnalysisJob.id.desc()).limit(50).all()
    return [{
        "id": j.id, "file_name": j.file_name, "status": j.status, "confidence": j.confidence,
        "height": j.height, "floors": j.floors, "building_type": j.building_type,
        "created_at": j.created_at.isoformat() if j.created_at else None,
    } for j in jobs]


@router.get("/{job_id}")
def get_job(job_id: int, db: Session = Depends(get_db)):
    j = db.query(models.AnalysisJob).filter(models.AnalysisJob.id == job_id).first()
    if not j:
        raise HTTPException(status_code=404, detail="Analysis job not found")
    return {
        "id": j.id, "file_name": j.file_name, "file_path": j.file_path, "status": j.status,
        "confidence": j.confidence, "height": j.height, "floors": j.floors,
        "building_type": j.building_type, "footprint": j.footprint,
        "created_at": j.created_at.isoformat() if j.created_at else None,
    }
