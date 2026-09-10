"""LANDVERSE 3D database engine (SQLite by default, PostgreSQL via DATABASE_URL)."""
import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./landverse3d.db")
if DATABASE_URL.startswith("postgres://"):  # Railway/Heroku-style scheme
    DATABASE_URL = "postgresql://" + DATABASE_URL[len("postgres://"):]

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, pool_pre_ping=True, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
