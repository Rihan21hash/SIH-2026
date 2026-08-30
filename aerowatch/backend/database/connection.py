"""Database connection and session management."""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from backend.config import settings

# For SQLite fallback if postgres not available in local test env
database_url = settings.DATABASE_URL
if os.getenv("TESTING") == "true" or os.getenv("USE_SQLITE") == "true":
    database_url = "sqlite:///./aerowatch.db"

# Create SQLAlchemy engine
if database_url.startswith("sqlite"):
    engine = create_engine(database_url, connect_args={"check_same_thread": False})
else:
    engine = create_engine(
        database_url,
        echo=settings.SQLALCHEMY_ECHO,
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True,
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Dependency for obtaining database sessions."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
