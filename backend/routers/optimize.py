# backend/routers/optimize.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Product
from routers.auth import get_current_active_user
import models

router = APIRouter(tags=["optimize"])

def calculate_smart_optimized_price(product: Product, db: Session) -> float:
    """
    Calculate optimized price for new products using category-based pricing patterns.
    For products with pre-calculated optimized_price, use that value.
    For new products, calculate based on category averages and margin patterns.
    """
    # If product has pre-calculated optimized price, use it
    if product.optimized_price is not None:
        return product.optimized_price
    
    # For new products, calculate based on category patterns
    from sqlalchemy import select, func
    
    # Get category statistics
    stmt = select(
        func.avg(Product.selling_price - Product.cost_price).label('avg_margin'),
        func.avg(Product.optimized_price / Product.selling_price).label('avg_price_multiplier')
    ).where(
        Product.category == product.category,
        Product.optimized_price.isnot(None)
    )
    
    result = db.execute(stmt).first()
    
    if result and result.avg_margin and result.avg_price_multiplier:
        # Use category-based pricing
        avg_margin = float(result.avg_margin)
        avg_multiplier = float(result.avg_price_multiplier)
        
        # Calculate optimized price using category patterns
        optimized_price = product.selling_price * avg_multiplier
        
        # Ensure minimum margin
        min_margin = product.cost_price * 0.2  # 20% minimum margin
        if optimized_price - product.cost_price < min_margin:
            optimized_price = product.cost_price + min_margin
            
        return round(optimized_price, 2)
    else:
        # Fallback: Use simple margin increase (25% boost)
        current_margin = product.selling_price - product.cost_price
        optimal_margin = 1.25 * current_margin
        return round(product.cost_price + optimal_margin, 2)

@router.get("/optimize")
def optimize(db: Session = Depends(get_db)):
    from sqlalchemy import select
    stmt = select(Product)
    products = db.execute(stmt).scalars().all()
    result = []
    for p in products:
        # Use smart pricing calculation
        optimized_price = calculate_smart_optimized_price(p, db)
        result.append({
            "id": str(p.id),
            "name": p.name,
            "category": p.category,
            "description": p.description,
            "cost_price": p.cost_price,
            "selling_price": p.selling_price,
            "optimized_price": optimized_price,
        })
    return result
