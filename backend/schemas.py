# backend/schemas.py
from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from uuid import UUID
from datetime import datetime

class ProductBase(BaseModel):
    name: str = Field(..., max_length=120)
    category: str = Field(..., max_length=80)
    cost_price: float = Field(..., ge=0)
    selling_price: float = Field(..., ge=0)
    optimized_price: Optional[float] = Field(None, ge=0)  # Pre-calculated optimized price
    demand_forecast: Optional[int] = Field(None, ge=0)  # Demand forecast from CSV
    description: Optional[str] = None
    stock_available: int = Field(default=0, ge=0)
    units_sold: int = Field(default=0, ge=0)

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=120)
    category: Optional[str] = Field(None, max_length=80)
    cost_price: Optional[float] = Field(None, ge=0)
    selling_price: Optional[float] = Field(None, ge=0)
    optimized_price: Optional[float] = Field(None, ge=0)  # Pre-calculated optimized price
    demand_forecast: Optional[int] = Field(None, ge=0)  # Demand forecast from CSV
    description: Optional[str] = None
    stock_available: Optional[int] = Field(None, ge=0)
    units_sold: Optional[int] = Field(None, ge=0)

class ProductOut(ProductBase):
    id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True

# Authentication Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(..., max_length=255)

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)
    role: str = Field(default="user")

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(UserBase):
    id: UUID
    role: str
    is_active: bool
    is_verified: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
