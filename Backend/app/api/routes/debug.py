"""
Endpoint de debug para verificar datos en la BD
"""
from fastapi import APIRouter, Header
from typing import Optional
from app.middleware.auth import extract_user_id_from_token
from app.database import get_supabase_client
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/debug", tags=["Debug"])


@router.get("/check-data")
async def check_data(authorization: Optional[str] = Header(None)):
    """
    Verifica qué datos hay en la BD para el usuario actual
    """
    try:
        supabase = get_supabase_client()
        user_id = extract_user_id_from_token(authorization)
        
        logger.info(f"Debug: Authorization header = {authorization}")
        logger.info(f"Debug: user_id extracted = {user_id}")
        
        # Si no hay user_id, solo mostrar todos los datos sin filtro
        if not user_id:
            logger.warning("No user_id extracted from token")
            
            # Obtener TODOS los gastos sin filtro
            all_expenses = supabase.client.table("expenses").select("id, user_id, amount, date, description").execute()
            logger.info(f"Total expenses in DB: {len(all_expenses.data or [])}")
            
            # Obtener TODOS los ingresos sin filtro
            all_incomes = supabase.client.table("incomes").select("id, user_id, amount, date, description").execute()
            logger.info(f"Total incomes in DB: {len(all_incomes.data or [])}")
            
            return {
                "status": "No authenticated user",
                "user_id": None,
                "authorization_header": authorization,
                "all_expenses_count": len(all_expenses.data or []),
                "all_expenses_sample": (all_expenses.data or [])[:5],
                "all_incomes_count": len(all_incomes.data or []),
                "all_incomes_sample": (all_incomes.data or [])[:5],
                "message": "No user_id found. Make sure you're authenticated and sending Authorization header"
            }
        
        # Obtener TODOS los gastos sin filtro
        all_expenses = supabase.client.table("expenses").select("id, user_id, amount, date, description").execute()
        logger.info(f"Total expenses in DB: {len(all_expenses.data or [])}")
        
        # Obtener gastos del usuario
        user_expenses = supabase.client.table("expenses").select("id, user_id, amount, date, description").eq("user_id", user_id).execute()
        logger.info(f"Expenses for user {user_id}: {len(user_expenses.data or [])}")
        
        # Obtener TODOS los ingresos sin filtro
        all_incomes = supabase.client.table("incomes").select("id, user_id, amount, date, description").execute()
        logger.info(f"Total incomes in DB: {len(all_incomes.data or [])}")
        
        # Obtener ingresos del usuario
        user_incomes = supabase.client.table("incomes").select("id, user_id, amount, date, description").eq("user_id", user_id).execute()
        logger.info(f"Incomes for user {user_id}: {len(user_incomes.data or [])}")
        
        return {
            "status": "success",
            "user_id": user_id,
            "all_expenses_count": len(all_expenses.data or []),
            "user_expenses_count": len(user_expenses.data or []),
            "all_expenses_sample": (all_expenses.data or [])[:5],
            "user_expenses_sample": (user_expenses.data or [])[:5],
            "all_incomes_count": len(all_incomes.data or []),
            "user_incomes_count": len(user_incomes.data or []),
            "all_incomes_sample": (all_incomes.data or [])[:5],
            "user_incomes_sample": (user_incomes.data or [])[:5],
        }
        
    except Exception as e:
        logger.error(f"Debug error: {str(e)}", exc_info=True)
        return {
            "error": str(e),
            "authorization_header": authorization,
        }

