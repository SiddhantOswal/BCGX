# backend/routers/products.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List, Optional
from database import get_db
import models, schemas
from sqlalchemy import select, or_

router = APIRouter(tags=["products"])

@router.get("", response_model=List[schemas.ProductOut])
def get_products(
    db: Session = Depends(get_db),
    search: Optional[str] = Query(None, description="Search products by name or description"),
    category: Optional[str] = Query(None, description="Filter by product category")
):
    """
    Get all products with optional search and category filters.
    """
    stmt = select(models.Product)
    
    # Apply search filter
    if search:
        search_term = f"%{search.lower()}%"
        stmt = stmt.where(
            or_(
                models.Product.name.ilike(search_term),
                models.Product.description.ilike(search_term)
            )
        )
    
    # Apply category filter
    if category and category.lower() != "all":
        stmt = stmt.where(models.Product.category.ilike(f"%{category}%"))
    
    # Order by name for consistent results
    stmt = stmt.order_by(models.Product.name)
    
    products = db.execute(stmt).scalars().all()
    return products

@router.get("/{product_id}", response_model=schemas.ProductOut)
def get_product(product_id: UUID, db: Session = Depends(get_db)):
    """
    Get a specific product by ID.
    """
    product = db.get(models.Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("", response_model=schemas.ProductOut, status_code=201)
def create_product(
    product: schemas.ProductCreate, 
    db: Session = Depends(get_db)
):
    """
    Create a new product.
    """
    # Validate business rules
    if product.selling_price < product.cost_price:
        raise HTTPException(
            status_code=400, 
            detail="Selling price must be greater than or equal to cost price"
        )
    
    # Create new product instance
    db_product = models.Product(**product.model_dump())
    
    # Calculate optimized price for new products if not provided
    if db_product.optimized_price is None:
        from routers.optimize import find_optimal_price
        db_product.optimized_price, _ = find_optimal_price(db_product)
    
    # Add to database
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    
    return db_product

@router.put("/{product_id}", response_model=schemas.ProductOut)
def update_product(
    product_id: UUID, 
    product_update: schemas.ProductUpdate, 
    db: Session = Depends(get_db)
):
    """
    Update an existing product.
    """
    # Get existing product
    db_product = db.get(models.Product, product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Get update data (only non-None values)
    update_data = product_update.model_dump(exclude_unset=True)
    
    # Validate business rules if prices are being updated
    if "selling_price" in update_data and "cost_price" in update_data:
        if update_data["selling_price"] < update_data["cost_price"]:
            raise HTTPException(
                status_code=400,
                detail="Selling price must be greater than or equal to cost price"
            )
    elif "selling_price" in update_data:
        current_cost = db_product.cost_price
        if update_data["selling_price"] < current_cost:
            raise HTTPException(
                status_code=400,
                detail="Selling price must be greater than or equal to cost price"
            )
    elif "cost_price" in update_data:
        current_selling = db_product.selling_price
        if current_selling < update_data["cost_price"]:
            raise HTTPException(
                status_code=400,
                detail="Selling price must be greater than or equal to cost price"
            )
    
    # Update product fields
    for field, value in update_data.items():
        setattr(db_product, field, value)
    
    # Commit changes
    db.commit()
    db.refresh(db_product)
    
    return db_product

@router.delete("/{product_id}", status_code=204)
def delete_product(
    product_id: UUID, 
    db: Session = Depends(get_db)
):
    """
    Delete a product by ID.
    """
    # Get existing product
    db_product = db.get(models.Product, product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Delete product
    db.delete(db_product)
    db.commit()
    
    return None
