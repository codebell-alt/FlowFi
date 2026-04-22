#!/usr/bin/env python3
"""
Verificar todos los datos sin filtros - buscar cualquier usuario
"""
import os
from dotenv import load_dotenv
from app.database.supabase_client import SupabaseClient
import json

load_dotenv()

client = SupabaseClient()
supabase = client.client

print("=" * 70)
print("BÚSQUEDA PROFUNDA - TODOS LOS DATOS EN BD")
print("=" * 70)

try:
    # Gastos SIN FILTROS
    print("\n🔍 TODOS LOS GASTOS (sin user_id filter):")
    all_exp = supabase.table("expenses").select("*").execute()
    print(f"   Total: {len(all_exp.data)}")
    for exp in all_exp.data[:10]:
        print(f"   - ID: {exp.get('id')}, User: {exp.get('user_id')}, Amount: {exp.get('amount')}, Date: {exp.get('date')}, Desc: {exp.get('description')}")
    
    # Ingresos SIN FILTROS
    print("\n🔍 TODOS LOS INGRESOS (sin user_id filter):")
    all_inc = supabase.table("incomes").select("*").execute()
    print(f"   Total: {len(all_inc.data)}")
    for inc in all_inc.data[:10]:
        print(f"   - ID: {inc.get('id')}, User: {inc.get('user_id')}, Amount: {inc.get('amount')}, Date: {inc.get('date')}, Desc: {inc.get('description')}")

    # Los perfiles
    print("\n👤 PERFILES DE USUARIO:")
    profiles = supabase.table("profiles").select("id, email, full_name").execute()
    print(f"   Total: {len(profiles.data)}")
    for prof in profiles.data[:5]:
        print(f"   - ID: {prof.get('id')}, Email: {prof.get('email')}, Name: {prof.get('full_name')}")
    
    print("\n" + "=" * 70)

except Exception as e:
    print(f"\n❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()
