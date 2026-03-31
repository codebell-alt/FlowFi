"""
Endpoints para el dashboard.
"""
from fastapi import APIRouter

router = APIRouter(prefix="/api/v1/dashboard", tags=["Dashboard"])

@router.get("/stats")
async def get_dashboard_stats():
    return {"total_income": 5000, "total_expenses": 2000, "balance": 3000}

@router.get("/monthly-comparison")
async def get_monthly_comparison():
    return {"current": {"income": 5000, "expenses": 2000}, "previous": {"income": 4500, "expenses": 1800}}
