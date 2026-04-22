#!/usr/bin/env python3
"""
Script para insertar datos de prueba en Supabase.
Esto te permite ver los reportes funcionando con datos reales.
"""

import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
from supabase import create_client

# Cargar variables de entorno
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Verificar credenciales
if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    print("❌ Error: SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no están configurados en .env")
    print("Nota: Usamos SERVICE_ROLE_KEY para bypass de RLS")
    exit(1)

# Conectar a Supabase con SERVICE_ROLE_KEY (bypasea RLS)
print("Conectando a Supabase con permisos de admin...")
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
print(f"✓ Conectado a: {SUPABASE_URL} (con permisos de admin)")

# Usar un user_id de ejemplo (en producción sería del usuario autenticado)
USER_ID = "3b4eee17-f38d-47f6-a9ba-e13aa6726cff"

# ============================================================================
# 1. INSERTAR CATEGORÍAS DE GASTOS (si no existen)
# ============================================================================
print("\n📁 Configurando categorías de gastos...")

expense_categories = [
    {"name": "Alimentación", "description": "Comidas y groceries"},
    {"name": "Transporte", "description": "Auto, gasolina, uber"},
    {"name": "Entretenimiento", "description": "Cine, juegos, música"},
    {"name": "Servicios", "description": "Internet, luz, agua"},
    {"name": "Salud", "description": "Médico, medicinas, gym"},
]

for category in expense_categories:
    try:
        # Verificar si ya existe
        existing = supabase.table("expense_categories").select("id").eq("name", category["name"]).execute()
        
        if not existing.data:  # Si no existe, insertar
            result = supabase.table("expense_categories").insert({
                "name": category["name"],
                "description": category["description"],
            }).execute()
            print(f"  ✓ Categoría '{category['name']}' creada")
        else:
            print(f"  - Categoría '{category['name']}' ya existe")
    except Exception as e:
        print(f"  ⚠ Error al crear categoría '{category['name']}': {str(e)[:50]}")

# ============================================================================
# 2. INSERTAR TIPOS DE INGRESOS (si no existen)
# ============================================================================
print("\n💰 Configurando tipos de ingresos...")

income_types = [
    {"name": "Salario", "description": "Sueldo mensual"},
    {"name": "Freelance", "description": "Trabajos puntuales"},
    {"name": "Inversiones", "description": "Retorno de inversiones"},
    {"name": "Venta", "description": "Venta de items"},
]

for income_type in income_types:
    try:
        existing = supabase.table("income_types").select("id").eq("name", income_type["name"]).execute()
        
        if not existing.data:
            result = supabase.table("income_types").insert({
                "name": income_type["name"],
                "description": income_type["description"],
            }).execute()
            print(f"  ✓ Tipo de ingreso '{income_type['name']}' creado")
        else:
            print(f"  - Tipo de ingreso '{income_type['name']}' ya existe")
    except Exception as e:
        print(f"  ⚠ Error al crear tipo '{income_type['name']}': {str(e)[:50]}")

# ============================================================================
# 3. OBTENER IDS DE CATEGORÍAS E INGRESOS
# ============================================================================
print("\n🔍 Obteniendo IDs de categorías e ingresos...")

try:
    categories_response = supabase.table("expense_categories").select("id, name").execute()
    categories_map = {cat["name"]: cat["id"] for cat in categories_response.data}
    print(f"  ✓ {len(categories_map)} categorías de gastos disponibles")
except Exception as e:
    print(f"  ❌ Error al obtener categorías: {e}")
    exit(1)

try:
    incomes_response = supabase.table("income_types").select("id, name").execute()
    incomes_map = {inc["name"]: inc["id"] for inc in incomes_response.data}
    print(f"  ✓ {len(incomes_map)} tipos de ingresos disponibles")
except Exception as e:
    print(f"  ❌ Error al obtener tipos de ingresos: {e}")
    exit(1)

# ============================================================================
# 4. INSERTAR GASTOS DE EJEMPLO
# ============================================================================
print("\n💸 Insertando gastos de ejemplo...")

today = datetime.now()
expenses = [
    # Últimos 30 días
    {"date": (today - timedelta(days=29)).strftime("%Y-%m-%d"), "category": "Alimentación", "description": "Compras en supermercado", "amount": 85.50},
    {"date": (today - timedelta(days=27)).strftime("%Y-%m-%d"), "category": "Transporte", "description": "Gasolina", "amount": 60.00},
    {"date": (today - timedelta(days=25)).strftime("%Y-%m-%d"), "category": "Entretenimiento", "description": "Cine", "amount": 18.00},
    {"date": (today - timedelta(days=23)).strftime("%Y-%m-%d"), "category": "Servicios", "description": "Internet mensual", "amount": 49.99},
    {"date": (today - timedelta(days=20)).strftime("%Y-%m-%d"), "category": "Alimentación", "description": "Restaurante", "amount": 45.00},
    {"date": (today - timedelta(days=18)).strftime("%Y-%m-%d"), "category": "Salud", "description": "Farmacia", "amount": 25.50},
    {"date": (today - timedelta(days=15)).strftime("%Y-%m-%d"), "category": "Transporte", "description": "Uber", "amount": 15.50},
    {"date": (today - timedelta(days=12)).strftime("%Y-%m-%d"), "category": "Alimentación", "description": "Almuerzo", "amount": 12.00},
    {"date": (today - timedelta(days=10)).strftime("%Y-%m-%d"), "category": "Entretenimiento", "description": "Spotify", "amount": 11.99},
    {"date": (today - timedelta(days=7)).strftime("%Y-%m-%d"), "category": "Servicios", "description": "Agua", "amount": 35.00},
    {"date": (today - timedelta(days=5)).strftime("%Y-%m-%d"), "category": "Salud", "description": "Gimnasio", "amount": 50.00},
    {"date": (today - timedelta(days=3)).strftime("%Y-%m-%d"), "category": "Alimentación", "description": "Pizza", "amount": 28.00},
    {"date": today.strftime("%Y-%m-%d"), "category": "Transporte", "description": "Parking", "amount": 5.00},
]

inserted_count = 0
for expense in expenses:
    try:
        category_id = categories_map.get(expense["category"])
        if not category_id:
            print(f"  ⚠ Categoría '{expense['category']}' no encontrada")
            continue
        
        result = supabase.table("expenses").insert({
            "user_id": USER_ID,
            "category_id": category_id,
            "date": expense["date"],
            "description": expense["description"],
            "amount": expense["amount"],
        }).execute()
        
        inserted_count += 1
        print(f"  ✓ Gasto: {expense['date']} - {expense['category']} - ${expense['amount']}")
    except Exception as e:
        print(f"  ❌ Error al insertar gasto: {e}")

print(f"\n✓ {inserted_count} gastos insertados")

# ============================================================================
# 5. INSERTAR INGRESOS DE EJEMPLO
# ============================================================================
print("\n💵 Insertando ingresos de ejemplo...")

incomes = [
    {"date": (today - timedelta(days=30)).strftime("%Y-%m-%d"), "type": "Salario", "description": "Salario mensual", "amount": 3000.00, "payment_method": "Transferencia"},
    {"date": (today - timedelta(days=20)).strftime("%Y-%m-%d"), "type": "Freelance", "description": "Proyecto web", "amount": 500.00, "payment_method": "PayPal"},
    {"date": (today - timedelta(days=14)).strftime("%Y-%m-%d"), "type": "Inversiones", "description": "Dividendos", "amount": 125.50, "payment_method": "Transferencia"},
    {"date": (today - timedelta(days=7)).strftime("%Y-%m-%d"), "type": "Venta", "description": "Venta de laptop", "amount": 800.00, "payment_method": "Efectivo"},
    {"date": (today - timedelta(days=2)).strftime("%Y-%m-%d"), "type": "Freelance", "description": "Consultoría", "amount": 350.00, "payment_method": "Transferencia"},
]

inserted_count = 0
for income in incomes:
    try:
        income_type_id = incomes_map.get(income["type"])
        if not income_type_id:
            print(f"  ⚠ Tipo de ingreso '{income['type']}' no encontrado")
            continue
        
        result = supabase.table("incomes").insert({
            "user_id": USER_ID,
            "income_type_id": income_type_id,
            "date": income["date"],
            "description": income["description"],
            "amount": income["amount"],
            "payment_method": income["payment_method"],
        }).execute()
        
        inserted_count += 1
        print(f"  ✓ Ingreso: {income['date']} - {income['type']} - ${income['amount']}")
    except Exception as e:
        print(f"  ❌ Error al insertar ingreso: {e}")

print(f"\n✓ {inserted_count} ingresos insertados")

# ============================================================================
# 6. RESUMEN FINAL
# ============================================================================
print("\n" + "="*60)
print("✅ ¡DATOS DE PRUEBA INSERTADOS CORRECTAMENTE!")
print("="*60)
print("\n📊 El dashboard ahora debería mostrar:")
print("   • Ingresos y gastos de los últimos 30 días")
print("   • Gráfico de evolución")
print("   • Estadísticas por categoría")
print("\n🌐 Accede aquí para ver los datos:")
print("   http://localhost:3000/dashboard/reportes")
print("\n👤 User ID utilizado (para filtros futuros):")
print(f"   {USER_ID}")
print("\n💡 Para insertar más datos, edita este script y ejecuta nuevamente")
print("="*60 + "\n")
