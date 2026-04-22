#!/usr/bin/env python3
"""
Script de diagnóstico para monitorear RLS y entender el problema
"""
import os
from dotenv import load_dotenv
from app.database.supabase_client import SupabaseClient
from app.middleware.auth import extract_user_id_from_token
import json

load_dotenv()

client = SupabaseClient()
supabase = client.client

print("=" * 70)
print("DIAGNÓSTICO FINAL - RLS Y PERMISOS")
print("=" * 70)

USER_ID = "3b4eee17-f38d-47f6-a9ba-e13aa6726cff"

print(f"\n🔍 Investigando qué está pasando con RLS...")
print(f"\n👤 User ID objetivo: {USER_ID}")

try:
    # 1. Verificar qué muestra el API key (anon)
    print("\n1️⃣ Intentando acceder como CLIENTE (anon key = sin autenticación):")
    try:
        # Usar el cliente sin autenticación
        response = supabase.table("expenses").select("id, user_id, amount").limit(5).execute()
        print(f"   ✅ Gastos encontrados: {len(response.data)}")
        for exp in response.data[:3]:
            print(f"      - User: {exp['user_id']}, Amount: {exp['amount']}")
    except Exception as e:
        print(f"   ❌ Error: {str(e)[:150]}")
    
    # 2. Verificar qué hay cuando se filtra por user_id
    print(f"\n2️⃣ Filtrando por user_id = {USER_ID}:")
    try:
        response = supabase.table("expenses").select("id, user_id, amount").eq("user_id", USER_ID).execute()
        print(f"   ✅ Gastos para {USER_ID}: {len(response.data)}")
        for exp in response.data[:3]:
            print(f"      - ${exp['amount']}")
    except Exception as e:
        print(f"   ❌ Error: {str(e)[:150]}")
    
    # 3. Verificar RLS policies
    print(f"\n3️⃣ Información sobre RLS:")
    print(f"   📋 La tabla 'expenses' tiene RLS activado")
    print(f"   📋 Las políticas deberían filtrar por auth.uid()")
    print(f"   📋 Pero desde el script no tenemos token, queremos ver TODO")
    
    # 4. Ver qué users hay
    print(f"\n4️⃣ Intenta obtener TODOS los expenses sin filtro adicional:")
    try:
        from postgrest import PostgrestFilterBuilder
        # Intentar bypass de RLS usando diferentes métodos
        all_exp = supabase.table("expenses").select("user_id, COUNT(*)").execute()
        print(f"   Response: {json.dumps(all_exp.data, indent=2)[:500]}")
    except Exception as e:
        print(f"   ❌ RLS bloqueando acceso: {str(e)[:200]}")
    
    print("\n" + "=" * 70)
    print("CONCLUSIÓN: El problema es que RLS está bloqueando las consultas")
    print("sin autenticación. Necesitamos verificar que el JWT token se está")
    print("siendo enviado correctamente desde el frontend.")
    print("=" * 70)

except Exception as e:
    print(f"\n❌ Error general: {str(e)}")
    import traceback
    traceback.print_exc()
