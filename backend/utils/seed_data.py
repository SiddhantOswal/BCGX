#!/usr/bin/env python3
"""
Seed the database with product data from CSV file
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from models import Product
from database import SessionLocal, engine
import pandas as pd

CSV_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "product_data.csv")

def seed(force=False):
    """Seed the database with product data from CSV"""
    session = SessionLocal()
    try:
        # Check if products already exist
        if not force and session.query(Product).count() > 0:
            print("Products already seeded.")
            return
        
        # Clear existing products if force is True
        if force:
            print("Clearing existing products...")
            session.query(Product).delete()
            session.commit()
        
        # Read CSV file
        if not os.path.exists(CSV_PATH):
            print(f"CSV file not found at: {CSV_PATH}")
            return
            
        df = pd.read_csv(CSV_PATH)
        print(f"Found {len(df)} products in CSV file")
        
        # Insert products
        for _, row in df.iterrows():
            product = Product(
                name=str(row["name"]),
                category=str(row["category"]),
                cost_price=float(row["cost_price"]),
                selling_price=float(row["selling_price"]),
                optimized_price=float(row["optimized_price"]) if pd.notna(row["optimized_price"]) else None,
                demand_forecast=int(row["demand_forecast"]) if pd.notna(row["demand_forecast"]) else None,
                description=str(row["description"]) if pd.notna(row["description"]) else "",
                stock_available=int(row["stock_available"]),
                units_sold=int(row["units_sold"]),
            )
            session.add(product)
        
        session.commit()
        count = session.query(Product).count()
        print(f"Seeded {count} products successfully.")
        
    except Exception as e:
        print(f"Error seeding data: {e}")
        import traceback
        traceback.print_exc()
        session.rollback()
    finally:
        session.close()

if __name__ == "__main__":
    import sys
    force = "--force" in sys.argv
    seed(force=force)