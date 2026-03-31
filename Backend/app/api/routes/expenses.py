"""
Endpoints para gestión de gastos.
"""
from fastapi import APIRouter

router = APIRouter(prefix="/api/v1/expenses", tags=["Expenses"])

@router.get("")
async def list_expenses():
    return {"expenses": [], "total": 0}

@router.post("")
async def create_expense(data: dict):
    return {"id": "exp123", "message": "Expense created", "data": data}

@router.get("/{expense_id}")
async def get_expense(expense_id: str):
    return {"id": expense_id, "amount": 500, "date": "2025-01-01"}

@router.put("/{expense_id}")
async def update_expense(expense_id: str, data: dict):
    return {"id": expense_id, "message": "Expense updated"}

@router.delete("/{expense_id}")
async def delete_expense(expense_id: str):
    return {"message": "Expense deleted"}