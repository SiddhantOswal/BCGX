#!/usr/bin/env python3
"""
Simple script to create a test user for the BCG Price Optimization Tool
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from models import User
from routers.auth import get_password_hash

def create_test_user():
    """Create a test user for development"""
    db = SessionLocal()
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == "test@example.com").first()
        if existing_user:
            print("Test user already exists!")
            return
        
        # Create test user
        test_user = User(
            email="test@example.com",
            hashed_password=get_password_hash("password123"),
            full_name="Test User",
            role="admin",
            is_active=True,
            is_verified=True
        )
        
        db.add(test_user)
        db.commit()
        print("Test user created successfully!")
        print("Email: test@example.com")
        print("Password: password123")
        
    except Exception as e:
        print(f"Error creating test user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_test_user()
