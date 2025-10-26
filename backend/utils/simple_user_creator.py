# backend/utils/simple_user_creator.py
import sys
import os
import hashlib

# Add the parent directory to the path to import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal, engine, Base
from models import User

def simple_hash_password(password: str) -> str:
    """Simple password hashing using SHA-256 (for development only)"""
    return hashlib.sha256(password.encode()).hexdigest()

def create_simple_users():
    """Create test users with simple password hashing"""
    try:
        # Create database tables
        Base.metadata.create_all(bind=engine)
        print("👤 Creating test users with simple hashing...")
        
        # Test users data
        test_users = [
            {
                "email": "admin@bcg.com",
                "password": "admin123",
                "full_name": "Admin User",
                "role": "admin",
                "is_active": True,
                "is_verified": True
            },
            {
                "email": "supplier@bcg.com", 
                "password": "supplier123",
                "full_name": "Supplier User",
                "role": "supplier",
                "is_active": True,
                "is_verified": True
            },
            {
                "email": "buyer@bcg.com",
                "password": "buyer123", 
                "full_name": "Buyer User",
                "role": "buyer",
                "is_active": True,
                "is_verified": True
            },
            {
                "email": "user@bcg.com",
                "password": "user123",
                "full_name": "Regular User", 
                "role": "user",
                "is_active": True,
                "is_verified": True
            }
        ]
        
        with SessionLocal() as db:
            for user_data in test_users:
                # Check if user already exists
                existing_user = db.query(User).filter(User.email == user_data["email"]).first()
                if existing_user:
                    print(f"⏭️  User already exists: {user_data['email']}")
                    continue
                
                # Hash password with simple method
                hashed_password = simple_hash_password(user_data["password"])
                
                # Create new user
                user = User(
                    email=user_data["email"],
                    hashed_password=hashed_password,
                    full_name=user_data["full_name"],
                    role=user_data["role"],
                    is_active=user_data["is_active"],
                    is_verified=user_data["is_verified"]
                )
                
                # Add to database
                db.add(user)
                print(f"✅ Created user: {user_data['email']} ({user_data['role']})")
            
            # Commit all changes
            db.commit()
            print(f"\n🎉 Test users created successfully!")
            print(f"\n📋 Login Credentials:")
            print(f"   🔑 Admin: admin@bcg.com / admin123")
            print(f"   🔑 Supplier: supplier@bcg.com / supplier123") 
            print(f"   🔑 Buyer: buyer@bcg.com / buyer123")
            print(f"   🔑 User: user@bcg.com / user123")
            
    except Exception as e:
        print(f"❌ Error creating test users: {e}")
        return
    
    print("✅ Test user creation complete")

if __name__ == "__main__":
    create_simple_users()
