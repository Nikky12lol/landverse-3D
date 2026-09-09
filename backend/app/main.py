"""LANDVERSE 3D API — AI-powered 3D property intelligence."""
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .database import Base, SessionLocal, engine
from . import models  # noqa: F401  (register tables)
from .seed import seed_db
from .routes import parcels, buildings, units, ulpin, analysis, validation, infrastructure, stats

app = FastAPI(
    title="LANDVERSE 3D API",
    description="AI-Powered 3D Property Intelligence Platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
# UPLOAD_DIRECTORY env override lets Docker/Render point uploads at /app/uploads.
UPLOAD_DIR = os.path.abspath(os.getenv("UPLOAD_DIRECTORY", os.path.join(BASE_DIR, "uploads")))
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_db(db)
    finally:
        db.close()


@app.get("/")
async def root():
    return {"message": "LANDVERSE 3D API", "version": "1.0.0", "docs": "/docs", "status": "running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy", "database": "connected"}


@app.post("/seed")
async def reseed():
    db = SessionLocal()
    try:
        return seed_db(db)
    finally:
        db.close()


app.include_router(parcels.router)
app.include_router(buildings.router)
app.include_router(units.router)
app.include_router(ulpin.router)
app.include_router(analysis.router)
app.include_router(validation.router)
app.include_router(infrastructure.router)
app.include_router(stats.router)
