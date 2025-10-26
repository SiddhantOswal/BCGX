# backend/models.py
from sqlalchemy import String, Float, Integer, Text, DateTime, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
from database import Base

class Product(Base):
    __tablename__ = "products"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    category: Mapped[str] = mapped_column(String(80), nullable=False)
    cost_price: Mapped[float] = mapped_column(Float, nullable=False)
    selling_price: Mapped[float] = mapped_column(Float, nullable=False)
    optimized_price: Mapped[float] = mapped_column(Float, nullable=True)  # Pre-calculated optimized price
    demand_forecast: Mapped[int] = mapped_column(Integer, nullable=True)  # Demand forecast from CSV
    description: Mapped[str] = mapped_column(Text, nullable=True)
    stock_available: Mapped[int] = mapped_column(Integer, default=0)
    units_sold: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Product(id='{self.id}', name='{self.name}', category='{self.category}', cost_price={self.cost_price}, selling_price={self.selling_price})>"

class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(50), default="user")  # admin, buyer, supplier, user
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<User(id='{self.id}', email='{self.email}', role='{self.role}')>"