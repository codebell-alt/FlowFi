#!/usr/bin/env python3
"""
Encontrar el user_id asociado al negocio
"""
import os
from dotenv import load_dotenv
from app.database.supabase_client import SupabaseClient

load_dotenv()

client = SupabaseClient()
supabase = client.client

print("=" * 70)
print("BUSCANDO EL USER_ID DEL NEGOCIO 'Prueba'")
print("=" * 70)

try:
    #Los datos que vemos en la pantalla dicen:
    # Usuario: Isabella Ramirez (isabella315784@gmail.com)
    # Negocio: Prueba
    
    # Intentar buscar en la tabla workspaces o businesses
    print("\n🔍 1. Buscando en tablas de negocio...")
    
    # Intentar diferentes nombres de tabla
    for table_name in ["workspaces", "businesses", "companies", "businesses", "organisations"]:
        try:
            result = supabase.table(table_name).select("*").limit(5).execute()
            print(f"\n   📋 Tabla '{table_name}': {len(result.data)} registros")
            for row in result.data[:2]:
                print(f"      {json.dumps(row, indent=8)[:200]}")
        except:
            pass
    
    # Buscar el profile de Isabella
    print("\n🔍 2. Buscando profile de Isabella...")
    try:
        # Sin auth, query seguro sin RLS
        profiles = supabase.table("profiles").select("id, email, full_name").limit(5).execute()
        print(f"   Profiles encontrados: {len(profiles.data)}")
        for prof in profiles.data[:5]:
            print(f"   - {prof}")
    except Exception as e:
        print(f"   ❌ Error: {str(e)[:150]}")
    
    # Buscar en auth.users
    print("\n🔍 3. Información de auth...")
    print(f"   El JWT tiene: sub = user_id del usuario en Supabase Auth")
    print(f"   Isabella's ID=>> 3b4eee17-f38d-47f6-a9ba-e13aa6726cff")
    
    # Intentar buscar TODOS los registros de expenses SIN FILTROS pero con servic role
    print("\n🔍 4. Verificado: ¿Hay ALGÚN gasto en expenses?")
    try:
        all_expenses = supabase.table("expenses").select("COUNT(*)").execute()
        print(f"   Query sin filtro: {all_expenses}")
    except Exception as e:
        print(f"   Error counting: {str(e)[:150]}")
    
    import json
    
except Exception as e:
    print(f"\n❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()
