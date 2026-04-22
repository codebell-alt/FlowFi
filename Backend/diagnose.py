#!/usr/bin/env python3
"""
Diagnóstico: Verificar datos en BD y detectar problema
"""
import os
from dotenv import load_dotenv
from app.database.supabase_client import SupabaseClient
import json

load_dotenv()

client = SupabaseClient()
supabase = client.client

print("=" * 70)
print("DIAGNÓSTICO - INSPECCIÓN DE DATOS EN SUPABASE")
print("=" * 70)

# USER_ID del usuario logueado
USER_ID = "3b4eee17-f38d-47f6-a9ba-e13aa6726cff"

try:
    # 1. Verificar TODOS los gastos (sin filtros)
    print("\n1️⃣ TODOS LOS GASTOS EN BD (SIN FILTROS):")
    all_expenses = supabase.table("expenses").select("id, user_id, amount, date, description, category_id").execute()
    print(f"   Total: {len(all_expenses.data)}")
    for exp in all_expenses.data[:5]:
        print(f"   - {exp}")
    
    # 2. Gastos del usuario logueado
    print(f"\n2️⃣ GASTOS DEL USUARIO {USER_ID}:")
    user_expenses = supabase.table("expenses").select("id, user_id, amount, date, description, category_id").eq("user_id", USER_ID).execute()
    print(f"   Total: {len(user_expenses.data)}")
    for exp in user_expenses.data[:5]:
        print(f"   - {exp}")
    
    # 3. Verificar CATEGORÍAS
    print("\n3️⃣ CATEGORÍAS DE GASTOS DISPONIBLES:")
    categories = supabase.table("expense_categories").select("id, name").execute()
    print(f"   Total: {len(categories.data)}")
    for cat in categories.data[:5]:
        print(f"   - {cat}")
    
    # 4. Intentar query CON JOIN (como lo hace el API)
    print("\n4️⃣ GASTOS CON JOIN A CATEGORÍAS (como lo hace el API):")
    try:
        with_join = supabase.table("expenses").select(
            "id, user_id, amount, date, description, category_id, expense_categories(id, name)"
        ).eq("user_id", USER_ID).execute()
        print(f"   Total: {len(with_join.data)}")
        for exp in with_join.data[:3]:
            print(f"   - {json.dumps(exp, indent=2)}")
    except Exception as join_error:
        print(f"   ❌ Error en JOIN: {join_error}")
    
    # 5. Verificar INGRESOS
    print("\n5️⃣ TODOS LOS INGRESOS EN BD:")
    all_incomes = supabase.table("incomes").select("id, user_id, amount, date, description, income_type_id").execute()
    print(f"   Total: {len(all_incomes.data)}")
    for inc in all_incomes.data[:5]:
        print(f"   - {inc}")
    
    print("\n" + "=" * 70)
    print("✅ DIAGNÓSTICO COMPLETADO")
    print("=" * 70)
    
except Exception as e:
    print(f"\n❌ ERROR: {str(e)}")
    import traceback
    traceback.print_exc()
