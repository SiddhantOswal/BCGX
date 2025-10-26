# backend/database.py
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from dotenv import load_dotenv

load_dotenv()

# PostgreSQL connection string with fallback to SQLite for development
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "sqlite:///./price_opt.db"
)

# Create SQLAlchemy engine
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=300,
    echo=False,  # Set to True for SQL query logging
)

# Create session factory
SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False
)

# Create declarative base for models
class Base(DeclarativeBase):
    pass

# Dependency function to get database session
def get_db():
    """
    Dependency function that provides a database session.
    Yields a session and ensures it's properly closed.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
