"""
Endpoints para gestión de categorías.
"""
from fastapi import APIRouter

router = APIRouter(prefix="/api/v1/categories", tags=["Categories"])

@router.get("/expense-categories")
async def list_expense_categories():
    return {"categories": []}

@router.post("/expense-categories")
async def create_expense_category(data: dict):
    return {"id": "cat123", "message": "Category created"}

@router.get("/income-types")
async def list_income_types():
    return {"types": []}

@router.post("/income-types")
async def create_income_type(data: dict):
    return {"id": "type123", "message": "Type created"}