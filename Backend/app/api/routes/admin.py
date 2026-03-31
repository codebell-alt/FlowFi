"""
Endpoints para administración.
"""
from fastapi import APIRouter

router = APIRouter(prefix="/api/v1/admin", tags=["Admin"])

@router.get("/users")
async def list_users():
    return {"users": []}

@router.get("/stats")
async def get_admin_stats():
    return {"total_users": 0, "total_incomes": 0, "total_expenses": 0}

@router.post("/verify-user")
async def verify_user(user_id: str):
    return {"message": "User verified"}