# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine
from routers import products, forecast, optimize, auth
from utils.seed_data import seed

# Create database tables
Base.metadata.create_all(bind=engine)

# Seed data if empty
try:
    seed()
except Exception as e:
    print(f"Warning: Could not seed data: {e}")

# Initialize FastAPI app
app = FastAPI(title="BCG Price Optimization Tool API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8080", "http://localhost:8081", "http://localhost:8082"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root route
@app.get("/")
def root():
    return {"message": "BCG Price Optimization Tool API running"}

# Health check route
@app.get("/health")
def health():
    return {"status": "ok", "database": "connected"}

# Include routers with prefixes
app.include_router(auth.router, prefix="/auth", tags=["authentication"])
app.include_router(products.router, prefix="/products")
app.include_router(forecast.router, prefix="/forecast")
app.include_router(optimize.router, prefix="/optimize")
