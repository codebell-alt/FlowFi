#!/usr/bin/env python3
"""
Encontrar el user_id de Isabella
"""
import os
from dotenv import load_dotenv
from app.database.supabase_client import SupabaseClient

load_dotenv()

client = SupabaseClient()
supabase = client.client

print("=" * 70)
print("BUSCANDO DATOS DE ISABELLA")
print("=" * 70)

try:
    # Buscar en auth.users
    print("\n🔍 Buscando usuario en Supabase...")
    
    # Verificar en tabla de perfiles (sin RLS)
    # Pero primero, déjame intentar otro enfoque - buscar directamente gastos
    print("\nBuscando GASTOS sin restricción de user_id:")
    all_exp = supabase.table("expenses").select("user_id, amount, date, description").execute()
    
    if all_exp.data:
        print(f"✅ Encontrados {len(all_exp.data)} gastos")
        # Agrupar por user_id
        users = {}
        for exp in all_exp.data:
            uid = exp.get('user_id')
            if uid not in users:
                users[uid] = 0
            users[uid] += 1
        
        print("\nGastos por usuario:")
        for uid, count in users.items():
            print(f"  - User: {uid}")
            print(f"    Gastos: {count}")
            
            # Mostrar primeros 3 gastos de este usuario
            user_expenses = [e for e in all_exp.data if e.get('user_id') == uid][:3]
            for exp in user_expenses:
                print(f"      • ${exp['amount']} - {exp['date']} - {exp['description']}")
    else:
        print("❌ No hay gastos en BD")
    
    # Igual para ingresos
    print("\n" + "=" * 70)
    print("\nBuscando INGRESOS sin restricción de user_id:")
    all_inc = supabase.table("incomes").select("user_id, amount, date, description").execute()
    
    if all_inc.data:
        print(f"✅ Encontrados {len(all_inc.data)} ingresos")
        users = {}
        for inc in all_inc.data:
            uid = inc.get('user_id')
            if uid not in users:
                users[uid] = 0
            users[uid] += 1
        
        print("\nIngresos por usuario:")
        for uid, count in users.items():
            print(f"  - User: {uid}")
            print(f"    Ingresos: {count}")
            
            user_incomes = [i for i in all_inc.data if i.get('user_id') == uid][:3]
            for inc in user_incomes:
                print(f"      • ${inc['amount']} - {inc['date']} - {inc['description']}")
    else:
        print("❌ No hay ingresos en BD")
    
except Exception as e:
    print(f"\n❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()
