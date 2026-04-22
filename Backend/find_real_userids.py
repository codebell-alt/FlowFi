#!/usr/bin/env python3
"""
INVESTIGACIÓN FINAL: Encontrar qué user_id tiene los datos
"""
import os
import sys
from dotenv import load_dotenv

# Agregar el path del backend para importar módulos
sys.path.insert(0, os.path.dirname(__file__))

load_dotenv()

print("=" * 80)
print("INVESTIGACIÓN FINAL - ¿QUÉ USER_ID TIENE LOS DATOS?")
print("=" * 80)

# Usar certificados SSL del sistema
os.environ['REQUESTS_CA_BUNDLE'] = ''

try:
    import urllib3
    urllib3.disable_warnings()
    
    import supabase
    from supabase import create_client
    
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY") 
    SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    print(f"\n🔑 Keys verificadas:")
    print(f"   SUPABASE_URL: {SUPABASE_URL[:50]}...")
    print(f"   SUPABASE_KEY: {SUPABASE_KEY[:30]}...")
    print(f"   SERVICE_ROLE_KEY: {SERVICE_ROLE_KEY[:30] if SERVICE_ROLE_KEY else 'NONE'}...")
    
    # Crear cliente con SERVICE ROLE
    print(f"\n📡 Creando cliente con SERVICE_ROLE_KEY para bypass RLS...")
    if SERVICE_ROLE_KEY and SERVICE_ROLE_KEY != "sb_publishable_v9xjom8ox56sgelUBuYICw_BV3JAT39":
        client = create_client(SUPABASE_URL, SERVICE_ROLE_KEY)
        print(f"   ✅ Cliente creado con SERVICE_ROLE_KEY")
    else:
        client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print(f"   ⚠️ SERVICE_ROLE_KEY no disponible o incompleta, usando ANON key")
    
    # Buscar TODOS los gastos
    print(f"\n🔍 Buscando TODOS los gastos en la BD...")
    response = client.table('expenses').select('id, user_id, amount, date, description').order('user_id').execute()
    
    expenses = response.data or []
    print(f"   ✅ Total encontrado: {len(expenses)} gastos")
    
    if expenses:
        # Agrupar por user_id
        from collections import defaultdict
        by_user = defaultdict(list)
        
        for exp in expenses:
            uid = exp.get('user_id')
            by_user[uid].append(exp)
        
        print(f"\n   📊 Gastos por user_id:")
        for uid, exps in sorted(by_user.items()):
            print(f"\n   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
            print(f"   👤 User ID: {uid}")
            print(f"      Gastos: {len(exps)}")
            print(f"      Total: ${sum(e['amount'] for e in exps)}")
            
            # Mostrar primeros 3
            print(f"      Ejemplos:")
            for exp in exps[:3]:
                print(f"         • ${exp['amount']} - {exp['date']} - {exp['description'][:40]}")
    else:
        print(f"\n   ❌ NO HAY GASTOS EN LA BD")
    
    # Igual para ingresos
    print(f"\n" + "=" * 80)
    print(f"\n🔍 Buscando TODOS los ingresos en la BD...")
    response = client.table('incomes').select('id, user_id, amount, date, description').order('user_id').execute()
    
    incomes = response.data or []
    print(f"   ✅ Total encontrado: {len(incomes)} ingresos")
    
    if incomes:
        from collections import defaultdict
        by_user = defaultdict(list)
        
        for inc in incomes:
            uid = inc.get('user_id')
            by_user[uid].append(inc)
        
        print(f"\n   📊 Ingresos por user_id:")
        for uid, incs in sorted(by_user.items()):
            print(f"\n   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
            print(f"   👤 User ID: {uid}")
            print(f"      Ingresos: {len(incs)}")
            print(f"      Total: ${sum(i['amount'] for i in incs)}")
            
            print(f"      Ejemplos:")
            for inc in incs[:3]:
                print(f"         • ${inc['amount']} - {inc['date']} - {inc['description'][:40]}")
    else:
        print(f"\n   ❌ NO HAY INGRESOS EN LA BD")
    
    print(f"\n" + "=" * 80)
    print(f"\n💡 CONCLUSIÓN:")
    print(f"   El user_id de Isabella en JWT: 3b4eee17-f38d-47f6-a9ba-e13aa6726cff")
    print(f"   Los datos que ve en tabla están guardados con: ???")
    print(f"   → Si son diferentes, ese es el problema")
    print(f"   → Necesitamos actualizar los datos con el user_id correcto")
    
except Exception as e:
    print(f"\n❌ ERROR: {str(e)}")
    import traceback
    traceback.print_exc()
