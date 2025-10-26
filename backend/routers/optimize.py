# backend/routers/optimize.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Product
import models
import math

router = APIRouter(tags=["optimize"])

def calculate_demand_forecast(base_demand: int, price: float, cost_price: float) -> int:
    """
    Calculate demand using the same formula as forecast.py
    """
    margin_ratio = (price - cost_price) / max(cost_price, 1)
    elasticity = 0.25
    calculated_demand = base_demand * math.exp(-elasticity * margin_ratio)
    return max(0, int(round(calculated_demand)))

def find_optimal_price(product: Product) -> tuple[float, float]:
    """
    Find the price that maximizes profit for a product.
    Returns (optimized_price, max_profit)
    """
    base_demand = product.demand_forecast if product.demand_forecast is not None else 1000
    cost_price = float(product.cost_price)
    
    # Generate 20 price points from cost_price to cost_price * 2
    min_price = cost_price
    max_price = cost_price * 2
    price_points = []
    
    for i in range(20):
        price = min_price + (max_price - min_price) * i / 19
        price_points.append(round(price, 2))
    
    max_profit = 0
    optimal_price = cost_price
    
    # Calculate profit for each price point
    for price in price_points:
        demand = calculate_demand_forecast(base_demand, price, cost_price)
        profit = (price - cost_price) * demand
        
        if profit > max_profit:
            max_profit = profit
            optimal_price = price
    
    return optimal_price, max_profit

@router.get("/optimize")
def optimize(db: Session = Depends(get_db)):
    """
    Optimize prices for all products by finding the price that maximizes profit.
    """
    from sqlalchemy import select
    stmt = select(Product)
    products = db.execute(stmt).scalars().all()
    
    result = []
    for product in products:
        optimized_price, max_profit = find_optimal_price(product)
        
        result.append({
            "id": str(product.id),
            "name": product.name,
            "category": product.category,
            "cost_price": product.cost_price,
            "selling_price": product.selling_price,
            "optimized_price": optimized_price,
            "max_profit": max_profit,
        })
    
    return result
