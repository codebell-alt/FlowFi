'''
Endpoints para gestión de ingresos.
'''
from fastapi import APIRouter

router = APIRouter(prefix='/api/v1/incomes', tags=['Incomes'])

@router.get('')
async def list_incomes():
    return {'incomes': [], 'total': 0}

@router.post('')
async def create_income(data: dict):
    return {'id': 'income123', 'message': 'Income created', 'data': data}

@router.get('/{income_id}')
async def get_income(income_id: str):
    return {'id': income_id, 'amount': 1000, 'date': '2025-01-01'}

@router.put('/{income_id}')
async def update_income(income_id: str, data: dict):
    return {'id': income_id, 'message': 'Income updated'}

@router.delete('/{income_id}')
async def delete_income(income_id: str):
    return {'message': 'Income deleted'}