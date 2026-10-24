from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from typing import Generator
import os
from .config import settings

# PostgreSQL URL normalization: Render and older services supply postgres:// which SQLAlchemy 2.0 rejects
db_url = settings.database_url
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

# Ensure the database directory exists if sqlite file is specified
if db_url.startswith("sqlite:///"):
    sqlite_file = db_url.replace("sqlite:///", "")
    # If not an in-memory database
    if sqlite_file and sqlite_file != ":memory:":
        db_dir = os.path.dirname(sqlite_file)
        if db_dir and not os.path.exists(db_dir):
            try:
                os.makedirs(db_dir, exist_ok=True)
            except Exception:
                pass

connect_args = {}
if "sqlite" in db_url:
    connect_args = {"check_same_thread": False}

engine = create_engine(
    db_url,
    connect_args=connect_args,
    echo=False,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db() -> Generator:
    """Dependency for providing a SQLAlchemy database session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

