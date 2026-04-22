"""
Endpoints para gestión de ingresos.
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status, Header
from datetime import datetime, date
from typing import List, Optional
from app.middleware.auth import get_current_user, extract_user_id_from_token
from app.database import get_supabase_client
from app.models.schemas import IncomeResponse, IncomeCreate, IncomeUpdate
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/incomes", tags=["Incomes"])


@router.get("", response_model=dict)
async def list_incomes(
    desde: Optional[str] = Query(None, description="Fecha inicio (YYYY-MM-DD)"),
    hasta: Optional[str] = Query(None, description="Fecha fin (YYYY-MM-DD)"),
    tipo: Optional[str] = Query(None, description="ID de tipo de ingreso"),
    authorization: Optional[str] = Header(None),  # Obtener header Authorization si existe
):
    """
    Obtiene todos los ingresos del usuario con filtros opcionales.
    
    Query parameters:
    - desde: Fecha inicio en formato YYYY-MM-DD
    - hasta: Fecha fin en formato YYYY-MM-DD
    - tipo: ID de tipo de ingreso para filtrar
    
    Headers:
    - Authorization: Bearer {jwt_token} (obligatorio para RLS)
    """
    try:
        logger.debug(f"=== INCOMES ENDPOINT CALLED ===")
        logger.debug(f"Authorization header present: {bool(authorization)}")
        
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
        
        # CRÍTICO: Usar query_authenticated que pasa el JWT al servidor Supabase
        # Esto es esencial para que RLS valide auth.uid() correctamente
        logger.info(f"Executing authenticated query for user: {user_id}")
        
        # Construir parámetros de query para PostgREST
        query_params = {
            "select": "*, income_types(id, name, description)",
            "user_id": f"eq.{user_id}",
            "order": "date.desc",
        }
        
        # Agregar filtros de fecha
        if desde and hasta:
            # Ambos filtros de fecha
            query_params["and"] = f"(date.gte.{desde},date.lte.{hasta})"
        elif desde:
            query_params["date"] = f"gte.{desde}"
        elif hasta:
            query_params["date"] = f"lte.{hasta}"
        
        if tipo:
            query_params["income_type_id"] = f"eq.{tipo}"
        
        logger.info(f"Query params: {query_params}")
        
        # Hacer la query autenticada (pasa JWT al servidor)
        result = await supabase.query_authenticated(token, "incomes", query_params)
        
        incomes = result.get("data", [])
        logger.info(f"Retrieved {len(incomes)} incomes")
        
        # Mapear datos para respuesta
        mapped_incomes = []
        for income in incomes:
            mapped_incomes.append({
                "id": income.get("id"),
                "user_id": income.get("user_id"),
                "amount": float(income.get("amount", 0)),
                "description": income.get("description"),
                "date": income.get("date"),
                "payment_method": income.get("payment_method"),
                "income_type_id": income.get("income_type_id"),
                "income_type": income.get("income_types"),
                "created_at": income.get("created_at"),
                "updated_at": income.get("updated_at"),
            })
        
        return {
            "data": mapped_incomes,
            "count": len(mapped_incomes),
            "total": sum(i["amount"] for i in mapped_incomes),
        }
        
    except Exception as e:
        logger.error(f"Error fetching incomes: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener ingresos: {str(e)}"
        )


@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_income(
    income_data: IncomeCreate,
):
    """
    Crea un nuevo ingreso para el usuario autenticado.
    """
    try:
        supabase = get_supabase_client()
        
        # Por ahora usar user_id fixo (TODO: obtener del token)
        user_id = "dummy-user-id"
        
        income = {
            "user_id": user_id,
            "amount": income_data.amount,
            "description": income_data.description,
            "date": income_data.date.isoformat(),
            "payment_method": income_data.payment_method,
            "income_type_id": income_data.income_type_id,
        }
        
        response = supabase.client.table("incomes").insert(income).execute()
        
        if response.data:
            return {
                "message": "Ingreso creado exitosamente",
                "data": response.data[0],
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo crear el ingreso"
            )
            
    except Exception as e:
        logger.error(f"Error creating income: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear ingreso: {str(e)}"
        )


@router.get("/{income_id}", response_model=dict)
async def get_income(
    income_id: str,
):
    """
    Obtiene un ingreso específico por ID.
    """
    try:
        supabase = get_supabase_client()
        
        response = supabase.client.table("incomes").select(
            "*, income_types(id, name, description)"
        ).eq("id", income_id).single().execute()
        
        if response.data:
            return {
                "data": response.data,
                "message": "Ingreso encontrado"
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Ingreso no encontrado"
            )
            
    except Exception as e:
        logger.error(f"Error fetching income: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener ingreso: {str(e)}"
        )


@router.put("/{income_id}", response_model=dict)
async def update_income(
    income_id: str,
    income_data: IncomeUpdate,
):
    """
    Actualiza un ingreso existente.
    """
    try:
        supabase = get_supabase_client()
        
        # Preparar datos para actualizar (solo campos no None)
        update_data = {}
        if income_data.amount is not None:
            update_data["amount"] = income_data.amount
        if income_data.description is not None:
            update_data["description"] = income_data.description
        if income_data.date is not None:
            update_data["date"] = income_data.date.isoformat()
        if income_data.payment_method is not None:
            update_data["payment_method"] = income_data.payment_method
        if income_data.income_type_id is not None:
            update_data["income_type_id"] = income_data.income_type_id
        
        response = supabase.client.table("incomes").update(
            update_data
        ).eq("id", income_id).execute()
        
        if response.data:
            return {
                "message": "Ingreso actualizado exitosamente",
                "data": response.data[0],
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Ingreso no encontrado"
            )
            
    except Exception as e:
        logger.error(f"Error updating income: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar ingreso: {str(e)}"
        )


@router.delete("/{income_id}", response_model=dict)
async def delete_income(
    income_id: str,
    user_credentials=Depends(lambda req: None),
):
    """
    Elimina un ingreso.
    """
    try:
        supabase = get_supabase_client()
        
        response = supabase.client.table("incomes").delete().eq(
            "id", income_id
        ).execute()
        
        return {
            "message": "Ingreso eliminado exitosamente",
        }
            
    except Exception as e:
        logger.error(f"Error deleting income: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar ingreso: {str(e)}"
        )