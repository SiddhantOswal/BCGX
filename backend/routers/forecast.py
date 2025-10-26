# backend/routers/forecast.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Product
import models

router = APIRouter(tags=["forecast"])

@router.get("/summary")
def forecast_summary(db: Session = Depends(get_db)):
    """
    Returns forecast summary for all products in the database.
    """
    import math
    
    # Get all products from the database
    products = db.query(Product).all()
    
    # Generate forecast data for each product
    forecast_data = []
    for product in products:
        # Use demand_forecast from database or default to 1000 if null
        base_demand = product.demand_forecast if product.demand_forecast is not None else 1000
        
        # Calculate margin ratio
        margin_ratio = (product.selling_price - product.cost_price) / max(product.cost_price, 1)
        
        # Price elasticity factor
        elasticity = 0.25
        
        # Calculate demand using price elasticity formula
        calculated_demand = base_demand * math.exp(-elasticity * margin_ratio)
        
        # Enforce non-negative and integer
        calculated_demand = max(0, int(round(calculated_demand)))
        
        forecast_data.append({
            "product_id": str(product.id),  # Use actual UUID from database
            "product_name": product.name,
            "category": product.category,
            "forecast_demand": calculated_demand,
            "cost_price": float(product.cost_price),
            "selling_price": float(product.selling_price),
        })
    
    return forecast_data

@router.get("/{product_id}")
def forecast(
    product_id: str, 
    db: Session = Depends(get_db)
):
    """
    Returns demand forecast for a specific product.
    """
    import math
    
    # Get the product from database
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        return []
    
    # Use demand_forecast from database or default to 1000 if null
    base_demand = product.demand_forecast if product.demand_forecast is not None else 1000
    
    # Generate price points around the current selling price
    current_price = float(product.selling_price)
    cost_price = float(product.cost_price)
    
    # Create price range: from cost_price to 2x selling_price
    min_price = cost_price
    max_price = current_price * 2
    price_points = []
    
    # Generate 12 price points
    for i in range(12):
        price = min_price + (max_price - min_price) * i / 11
        price_points.append(round(price, 2))
    
    # Calculate demand for each price point using elasticity formula
    forecast_data = []
    for price in price_points:
        # Calculate margin ratio for this price point
        margin_ratio = (price - cost_price) / max(cost_price, 1)
        
        # Price elasticity factor
        elasticity = 0.25
        
        # Calculate demand using price elasticity formula
        calculated_demand = base_demand * math.exp(-elasticity * margin_ratio)
        
        # Enforce non-negative and integer
        calculated_demand = max(0, int(round(calculated_demand)))
        
        forecast_data.append({
            "price": price,
            "demand": calculated_demand
        })
    
    return forecast_data