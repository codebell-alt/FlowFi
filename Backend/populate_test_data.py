#!/usr/bin/env python3
"""
Script para insertar datos de prueba con credenciales correctas
"""
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
from app.database.supabase_client import SupabaseClient

load_dotenv()

client = SupabaseClient()
supabase = client.client

# Usuario logueado actual
USER_ID = "3b4eee17-f38d-47f6-a9ba-e13aa6726cff"

print("=" * 60)
print("INSERTANDO DATOS DE PRUEBA")
print("=" * 60)

# Datos de hoy en adelante para que sea visible
today = datetime.now()

try:
    # 1. GASTOS
    print("\n💸 Insertando gastos...")
    expenses = [
        {
            "user_id": USER_ID,
            "amount": 50.00,
            "date": today.strftime("%Y-%m-%d"),
            "description": "Almuerzo",
            "category_id": None,
        },
        {
            "user_id": USER_ID,
            "amount": 85.50,
            "date": (today - timedelta(days=1)).strftime("%Y-%m-%d"),
            "description": "Supermercado",
            "category_id": None,
        },
        {
            "user_id": USER_ID,
            "amount": 120.00,
            "date": (today - timedelta(days=2)).strftime("%Y-%m-%d"),
            "description": "Gasolina",
            "category_id": None,
        },
        {
            "user_id": USER_ID,
            "amount": 45.00,
            "date": (today - timedelta(days=7)).strftime("%Y-%m-%d"),
            "description": "Restaurante",
            "category_id": None,
        },
    ]
    
    for expense in expenses:
        result = supabase.table("expenses").insert(expense).execute()
        print(f"  ✓ Gasto: ${expense['amount']} - {expense['description']} ({expense['date']})")
    
    # 2. INGRESOS
    print("\n💰 Insertando ingresos...")
    incomes = [
        {
            "user_id": USER_ID,
            "amount": 2000.00,
            "date": today.strftime("%Y-%m-%d"),
            "description": "Salario",
            "income_type_id": None,
            "payment_method": "Transferencia",
        },
        {
            "user_id": USER_ID,
            "amount": 500.00,
            "date": (today - timedelta(days=5)).strftime("%Y-%m-%d"),
            "description": "Freelance - Proyecto web",
            "income_type_id": None,
            "payment_method": "PayPal",
        },
    ]
    
    for income in incomes:
        result = supabase.table("incomes").insert(income).execute()
        print(f"  ✓ Ingreso: ${income['amount']} - {income['description']} ({income['date']})")
    
    print("\n" + "=" * 60)
    print("✅ DATOS INSERTADOS EXITOSAMENTE")
    print("=" * 60)
    print(f"\n📊 Datos insertados para: {USER_ID}")
    print("🌐 Navega a: http://localhost:3000/dashboard/reportes")
    print("\n")

except Exception as e:
    print(f"\n❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()
