"""
Endpoints para gestión de gastos.
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status, Header
from datetime import datetime, date
from typing import List, Optional
from app.middleware.auth import get_current_user, extract_user_id_from_token
from app.database import get_supabase_client
from app.models.schemas import ExpenseResponse, ExpenseCreate, ExpenseUpdate
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/expenses", tags=["Expenses"])


@router.get("", response_model=dict)
async def list_expenses(
    desde: Optional[str] = Query(None, description="Fecha inicio (YYYY-MM-DD)"),
    hasta: Optional[str] = Query(None, description="Fecha fin (YYYY-MM-DD)"),
    categoria: Optional[str] = Query(None, description="ID de categoría"),
    authorization: Optional[str] = Header(None),  # Obtener header Authorization si existe
):
    """
    Obtiene todos los gastos del usuario con filtros opcionales.
    
    Query parameters:
    - desde: Fecha inicio en formato YYYY-MM-DD
    - hasta: Fecha fin en formato YYYY-MM-DD  
    - categoria: ID de categoría para filtrar
    
    Headers:
    - Authorization: Bearer {jwt_token} (obligatorio)
    """
    try:
        logger.debug(f"=== EXPENSES ENDPOINT CALLED ===")
        logger.debug(f"Authorization header present: {bool(authorization)}")
        logger.debug(f"Filters: desde={desde}, hasta={hasta}, categoria={categoria}")
        
        supabase = get_supabase_client()
        
        # Extraer token JWT (sin "Bearer ")
        if not authorization:
            logger.warning("No authorization header provided")
            return {
                "data": [],
                "count": 0,
                "total": 0,
            }
        
        token = authorization.replace("Bearer ", "").strip()
        
        # Extraer user_id del token
        user_id = extract_user_id_from_token(authorization)
        logger.info(f"Extracted user_id from token: {user_id}")
        
        if not user_id:
            logger.warning("No user_id extracted - authentication failed")
            return {
                "data": [],
                "count": 0,
                "total": 0,
            }
        
        # CAMBIO CRÍTICO: Usar query_authenticated que pasa el JWT al servidor Supabase
        # Esto es esencial para que RLS valide auth.uid() correctamente
        logger.info(f"Executing authenticated query for user: {user_id}")
        
        # Construir parámetros de query para PostgREST
        query_params = {
            "select": "*, expense_categories(id, name, description, icon)",
            "user_id": f"eq.{user_id}",
            "order": "date.desc",
        }
        
        # Agregar filtros de fecha
        if desde:
            query_params["date"] = f"gte.{desde}"
            if hasta:
                # PostgREST no permite múltiples filtros en lugar de usar "and" 
                # Agregamos como parámetro adicional
                query_params["date"] = f"gte.{desde}"
        
        if hasta and "date" not in query_params:
            query_params["date"] = f"lte.{hasta}"
        elif hasta:
            # Si ya hay filtro desde, necesitamos usar and
            query_params["and"] = f"(date.gte.{desde},date.lte.{hasta})"
            del query_params["date"]
        
        if categoria:
            query_params["category_id"] = f"eq.{categoria}"
        
        logger.info(f"Query params: {query_params}")
        
        # Hacer la query autenticada (pasa JWT al servidor)
        result = await supabase.query_authenticated(token, "expenses", query_params)
        
        expenses = result.get("data", [])
        logger.info(f"Retrieved {len(expenses)} expenses")
        
        # Mapear datos para respuesta
        mapped_expenses = []
        for expense in expenses:
            mapped_expenses.append({
                "id": expense.get("id"),
                "user_id": expense.get("user_id"),
                "amount": float(expense.get("amount", 0)),
                "description": expense.get("description"),
                "date": expense.get("date"),
                "category_id": expense.get("category_id"),
                "category": expense.get("expense_categories"),
                "created_at": expense.get("created_at"),
                "updated_at": expense.get("updated_at"),
            })
        
        return {
            "data": mapped_expenses,
            "count": len(mapped_expenses),
            "total": sum(e["amount"] for e in mapped_expenses),
        }
        
    except Exception as e:
        logger.error(f"Error fetching expenses: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener gastos: {str(e)}"
        )


@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_expense(
    expense_data: ExpenseCreate,
):
    """
    Crea un nuevo gasto para el usuario autenticado.
    """
    try:
        supabase = get_supabase_client()
        
        # Por ahora usar user_id fixo (TODO: obtener del token)
        user_id = "dummy-user-id"
        
        expense = {
            "user_id": user_id,
            "amount": expense_data.amount,
            "description": expense_data.description,
            "date": expense_data.date.isoformat(),
            "category_id": expense_data.category_id,
        }
        
        response = supabase.client.table("expenses").insert(expense).execute()
        
        if response.data:
            return {
                "message": "Gasto creado exitosamente",
                "data": response.data[0],
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo crear el gasto"
            )
            
    except Exception as e:
        logger.error(f"Error creating expense: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear gasto: {str(e)}"
        )


@router.get("/{expense_id}", response_model=dict)
async def get_expense(
    expense_id: str,
):
    """
    Obtiene un gasto específico por ID.
    """
    try:
        supabase = get_supabase_client()
        
        response = supabase.client.table("expenses").select(
            "*, expense_categories(id, name, description, icon)"
        ).eq("id", expense_id).single().execute()
        
        if response.data:
            return {
                "data": response.data,
                "message": "Gasto encontrado"
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Gasto no encontrado"
            )
            
    except Exception as e:
        logger.error(f"Error fetching expense: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener gasto: {str(e)}"
        )


@router.put("/{expense_id}", response_model=dict)
async def update_expense(
    expense_id: str,
    expense_data: ExpenseUpdate,
):
    """
    Actualiza un gasto existente.
    """
    try:
        supabase = get_supabase_client()
        
        # Preparar datos para actualizar (solo campos no None)
        update_data = {}
        if expense_data.amount is not None:
            update_data["amount"] = expense_data.amount
        if expense_data.description is not None:
            update_data["description"] = expense_data.description
        if expense_data.date is not None:
            update_data["date"] = expense_data.date.isoformat()
        if expense_data.category_id is not None:
            update_data["category_id"] = expense_data.category_id
        
        response = supabase.client.table("expenses").update(
            update_data
        ).eq("id", expense_id).execute()
        
        if response.data:
            return {
                "message": "Gasto actualizado exitosamente",
                "data": response.data[0],
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Gasto no encontrado"
            )
            
    except Exception as e:
        logger.error(f"Error updating expense: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar gasto: {str(e)}"
        )


@router.delete("/{expense_id}", response_model=dict)
async def delete_expense(
    expense_id: str,
    user_credentials=Depends(lambda req: None),
):
    """
    Elimina un gasto.
    """
    try:
        supabase = get_supabase_client()
        
        response = supabase.client.table("expenses").delete().eq(
            "id", expense_id
        ).execute()
        
        return {
            "message": "Gasto eliminado exitosamente",
        }
            
    except Exception as e:
        logger.error(f"Error deleting expense: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar gasto: {str(e)}"
        )