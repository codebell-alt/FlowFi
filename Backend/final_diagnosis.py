#!/usr/bin/env python3
"""
Diagnóstico final: Verificar qué datos están en Supabase y qué user_id tienen
"""
import os
import sys
from dotenv import load_dotenv

sys.path.insert(0, os.path.dirname(__file__))
load_dotenv()

print("=" * 80)
print("DIAGNÓSTICO FINAL - VERIFICAR DATOS EN SUPABASE")
print("=" * 80)

try:
    from app.database.supabase_client import SupabaseClient
    from app.middleware.auth import extract_user_id_from_token
    
    client = SupabaseClient()
    
    # Isabella's JWT token from earlier
    # Para testing, simulamos extraer el user_id de un JWT
    fake_jwt_header = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rb3FlcWZ5bnhvc2tyaXpxeWJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NTI1NTYsImV4cCI6MjA5MDUyODU1Nn0.u3_898u0bD518Skg6DSZtASHOsVfGZEdhyESUu0dh2w"
    
    extracted_uid = extract_user_id_from_token(fake_jwt_header)
    print(f"\n✅ User ID que esperamos del JWT: {extracted_uid}")
    
    print("\n" + "=" * 80)
    print("Consultando EXPENSES con RLS activo (simulando usuario autenticado)")
    print("=" * 80)
    
    # Intentar consultar como cliente autenticado
    try:
        # Cons el cliente normal (que incluye RLS)
        expenses = client.client.table("expenses").select("id, user_id, amount, date, description").limit(5).execute()
        print(f"\n✅ Gastos encontrados (con cliente normal): {len(expenses.data)}")
        
        if expenses.data:
            print("\nPrimeros gastos:")
            for exp in expenses.data[:3]:
                print(f"  - User: {exp['user_id']}, Amount: {exp['amount']}, Date: {exp['date']}")
        else:
            print("  (Sin resultados - RLS está bloqueando)")
    except Exception as e:
        print(f"❌ Error: {str(e)[:200]}")
    
    print("\n" + "=" * 80)
    print("Conclusión:")
    print("=" * 80)
    print(f"Si RLS está activo correctamente y el usuario PUEDE ver datos,")
    print(f"significa que todos los gastos pertenecen a este user_id:")
    print(f"  → {extracted_uid if extracted_uid else 'DESCONOCIDO'}")
    print(f"\nSi NO hay resultados, RLS está bloqueando correctamente.")
    print(f"El backend API debe pasar el JWT correctamente para que RLS lo permita.")
    
except Exception as e:
    print(f"❌ Error general: {str(e)}")
    import traceback
    traceback.print_exc()
