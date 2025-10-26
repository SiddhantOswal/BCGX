# BCG Price Optimization Tool

A comprehensive price optimization and demand forecasting application built with FastAPI backend and React frontend.

## Features

- **Product Management**: Create, read, update, and delete products with detailed information
- **Demand Forecasting**: AI-powered demand prediction based on product categories and pricing
- **Price Optimization**: Automated price recommendations to maximize profitability
- **User Authentication**: Secure JWT-based authentication system
- **Modern UI**: Responsive design with shadcn/ui components

## Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **SQLAlchemy**: ORM for database operations
- **PostgreSQL**: Primary database
- **JWT**: Authentication tokens
- **bcrypt**: Password hashing
- **Pydantic**: Data validation

### Frontend
- **React 18**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool
- **Tailwind CSS**: Styling
- **shadcn/ui**: Component library
- **React Query**: Data fetching
- **React Router**: Navigation

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL 12+

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up PostgreSQL database:
   - Create a database named `price_opt_db`
   - Update the `DATABASE_URL` in `.env` file if needed

5. Run the application:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

6. Create a test user:
   ```bash
   python create_test_user.py
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user info

### Products
- `GET /products` - Get all products (with search/filter)
- `GET /products/{id}` - Get specific product
- `POST /products` - Create new product
- `PUT /products/{id}` - Update product
- `DELETE /products/{id}` - Delete product

### Forecasting
- `GET /forecast/{product_id}` - Get demand forecast for product
- `GET /forecast/summary` - Get forecast summary for all products

### Optimization
- `GET /optimize/optimize` - Get optimized prices for all products

## Default Test Credentials

- **Email**: test@example.com
- **Password**: password123

## Project Structure

```
BCG-ROUND2/
├── backend/
│   ├── routers/          # API route handlers
│   ├── models.py         # Database models
│   ├── schemas.py        # Pydantic schemas
│   ├── database.py       # Database configuration
│   ├── main.py          # FastAPI application
│   └── requirements.txt  # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   ├── hooks/       # Custom React hooks
│   │   └── contexts/    # React contexts
│   └── package.json     # Node.js dependencies
└── README.md
```

## Development Notes

- The backend uses SQLAlchemy 2.0+ with modern async patterns
- Frontend uses React Query for efficient data fetching and caching
- Authentication is handled via JWT tokens stored in localStorage
- All API calls include proper error handling and loading states
- The application includes comprehensive form validation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
