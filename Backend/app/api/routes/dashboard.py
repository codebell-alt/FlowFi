"""
Endpoints para el dashboard con estadísticas y reportes.
"""
from fastapi import APIRouter, HTTPException, Query, status, Depends
from datetime import datetime, date, timedelta
from typing import Optional, List, Dict, Any
from app.database import get_supabase_client
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/dashboard", tags=["Dashboard"])


def parse_date(date_str: Optional[str]) -> Optional[date]:
    """Convierte string YYYY-MM-DD a date"""
    if not date_str:
        return None
    try:
        return datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        return None


@router.get("/stats", response_model=dict)
async def get_dashboard_stats(
    desde: Optional[str] = Query(None, description="Fecha inicio (YYYY-MM-DD)"),
    hasta: Optional[str] = Query(None, description="Fecha fin (YYYY-MM-DD)"),
):
    """
    Obtiene estadísticas de ingresos y gastos para un período.
    
    Query parameters:
    - desde: Fecha inicio (default: hace 30 días)
    - hasta: Fecha fin (default: hoy)
    """
    try:
        supabase = get_supabase_client()
        
        # Definir rango de fechas
        end_date = parse_date(hasta) or date.today()
        start_date = parse_date(desde) or (end_date - timedelta(days=30))
        
        # Obtener gastos
        expenses_response = supabase.client.table("expenses").select(
            "*, expense_categories(id, name)"
        ).gte("date", start_date.isoformat()).lte(
            "date", end_date.isoformat()
        ).execute()
        
        expenses = expenses_response.data or []
        
        # Obtener ingresos
        incomes_response = supabase.client.table("incomes").select(
            "*, income_types(id, name)"
        ).gte("date", start_date.isoformat()).lte(
            "date", end_date.isoformat()
        ).execute()
        
        incomes = incomes_response.data or []
        
        # Calcular totales
        total_income = sum(float(i.get("amount", 0)) for i in incomes)
        total_expenses = sum(float(e.get("amount", 0)) for e in expenses)
        balance = total_income - total_expenses
        
        # Agrupar gastos por categoría
        expenses_by_category: Dict[str, float] = {}
        for expense in expenses:
            category = expense.get("expense_categories", {})
            category_name = category.get("name", "Sin categoría") if category else "Sin categoría"
            amount = float(expense.get("amount", 0))
            expenses_by_category[category_name] = expenses_by_category.get(category_name, 0) + amount
        
        # Agrupar ingresos por tipo/método de pago
        income_by_method: Dict[str, float] = {}
        for income in incomes:
            method = income.get("payment_method", "Otro")
            amount = float(income.get("amount", 0))
            income_by_method[method] = income_by_method.get(method, 0) + amount
        
        # Calcular flujo diario
        daily_flow: Dict[str, Dict[str, float]] = {}
        
        for expense in expenses:
            day = expense.get("date")
            amount = float(expense.get("amount", 0))
            if day not in daily_flow:
                daily_flow[day] = {"income": 0, "expenses": 0}
            daily_flow[day]["expenses"] += amount
        
        for income in incomes:
            day = income.get("date")
            amount = float(income.get("amount", 0))
            if day not in daily_flow:
                daily_flow[day] = {"income": 0, "expenses": 0}
            daily_flow[day]["income"] += amount
        
        # Convertir a lista ordenada
        daily_flow_list = [
            {"date": day, "income": data["income"], "expenses": data["expenses"]}
            for day, data in sorted(daily_flow.items())
        ]
        
        return {
            "period": {
                "start": start_date.isoformat(),
                "end": end_date.isoformat(),
            },
            "summary": {
                "total_income": total_income,
                "total_expenses": total_expenses,
                "balance": balance,
                "income_count": len(incomes),
                "expense_count": len(expenses),
            },
            "expenses_by_category": [
                {"category": cat, "total": amount}
                for cat, amount in sorted(expenses_by_category.items(), key=lambda x: x[1], reverse=True)
            ],
            "income_by_method": [
                {"method": method, "total": amount}
                for method, amount in sorted(income_by_method.items(), key=lambda x: x[1], reverse=True)
            ],
            "daily_flow": daily_flow_list,
        }
        
    except Exception as e:
        logger.error(f"Error fetching dashboard stats: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener estadísticas: {str(e)}"
        )


@router.get("/monthly-comparison", response_model=dict)
async def get_monthly_comparison(
):
    """
    Compara ingresos y gastos del mes actual vs mes anterior.
    """
    try:
        supabase = get_supabase_client()
        
        today = date.today()
        
        # Mes actual
        current_month_start = date(today.year, today.month, 1)
        if today.month == 12:
            current_month_end = date(today.year + 1, 1, 1) - timedelta(days=1)
        else:
            current_month_end = date(today.year, today.month + 1, 1) - timedelta(days=1)
        
        # Mes anterior
        if today.month == 1:
            prev_month_start = date(today.year - 1, 12, 1)
            prev_month_end = date(today.year, 1, 1) - timedelta(days=1)
        else:
            prev_month_start = date(today.year, today.month - 1, 1)
            prev_month_end = date(today.year, today.month, 1) - timedelta(days=1)
        
        # Datos del mes actual
        current_expenses = supabase.client.table("expenses").select("amount").gte(
            "date", current_month_start.isoformat()
        ).lte("date", current_month_end.isoformat()).execute()
        
        current_incomes = supabase.client.table("incomes").select("amount").gte(
            "date", current_month_start.isoformat()
        ).lte("date", current_month_end.isoformat()).execute()
        
        current_total_income = sum(float(i.get("amount", 0)) for i in (current_incomes.data or []))
        current_total_expenses = sum(float(e.get("amount", 0)) for e in (current_expenses.data or []))
        
        # Datos del mes anterior
        prev_expenses = supabase.client.table("expenses").select("amount").gte(
            "date", prev_month_start.isoformat()
        ).lte("date", prev_month_end.isoformat()).execute()
        
        prev_incomes = supabase.client.table("incomes").select("amount").gte(
            "date", prev_month_start.isoformat()
        ).lte("date", prev_month_end.isoformat()).execute()
        
        prev_total_income = sum(float(i.get("amount", 0)) for i in (prev_incomes.data or []))
        prev_total_expenses = sum(float(e.get("amount", 0)) for e in (prev_expenses.data or []))
        
        # Calcular cambios porcentuales
        income_change = 0
        if prev_total_income > 0:
            income_change = ((current_total_income - prev_total_income) / prev_total_income) * 100
        
        expenses_change = 0
        if prev_total_expenses > 0:
            expenses_change = ((current_total_expenses - prev_total_expenses) / prev_total_expenses) * 100
        
        return {
            "current_month": {
                "period": f"{current_month_start.strftime('%B %Y')}",
                "start": current_month_start.isoformat(),
                "end": current_month_end.isoformat(),
                "income": current_total_income,
                "expenses": current_total_expenses,
                "balance": current_total_income - current_total_expenses,
            },
            "previous_month": {
                "period": f"{prev_month_start.strftime('%B %Y')}",
                "start": prev_month_start.isoformat(),
                "end": prev_month_end.isoformat(),
                "income": prev_total_income,
                "expenses": prev_total_expenses,
                "balance": prev_total_income - prev_total_expenses,
            },
            "comparison": {
                "income_change_percent": round(income_change, 2),
                "expenses_change_percent": round(expenses_change, 2),
                "income_diff": round(current_total_income - prev_total_income, 2),
                "expenses_diff": round(current_total_expenses - prev_total_expenses, 2),
            }
        }
        
    except Exception as e:
        logger.error(f"Error in monthly comparison: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener comparación mensual: {str(e)}"
        )
