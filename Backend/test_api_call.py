#!/usr/bin/env python3
"""
Hacer una petición al endpoint /api/v1/expenses como si fuera el frontend
pero con el token de servicios
"""
import os
from dotenv import load_dotenv
import http.client
import json
from base64 import b64encode
from datetime import datetime, timedelta

load_dotenv()

# Credenciales
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
API_URL = "http://localhost:8000"

# User ID a probar
USER_ID = "3b4eee17-f38d-47f6-a9ba-e13aa6726cff"

print("=" * 70)
print("TEST DEL EPI.NDPOINT /api/v1/expenses")
print("=" * 70)

print(f"\n📋 Configuración:")
print(f"   API URL: {API_URL}")
print(f"   User ID: {USER_ID}")

# Intentar obtener un JWT válido
print("\n🔑 Intentando crear un JWT de prueba...")

# Crear un JWT manual (esto es para testing, en prod usarías el token real)
import base64
import json
import jwt
from datetime import datetime, timedelta

# Datos del JWT
payload = {
    "iss": "https://nkoqeqfynxoskrizqybj.supabase.co/auth/v1",
    "sub": USER_ID,
    "aud": "authenticated",
    "exp": datetime.utcnow() + timedelta(hours=1),
    "iat": datetime.utcnow(),
    "email": "isabella315784@gmail.com",
    "user_metadata": {},
    "app_metadata": {},
    "role": "authenticated"
}

# Esta es solo una simulación - en realidad necesitaríamos la clave privada
print(f"\n📤 Haciendo petición a: {API_URL}/api/v1/expenses")

try:
    import urllib.request
    import urllib.error
    
    endpoint = f"{API_URL}/api/v1/expenses?desde=2026-03-17&hasta=2026-04-16"
    
    req = urllib.request.Request(endpoint)
    req.add_header('Content-Type', 'application/json')
    # Sin token para ver qué pasa
    
    print(f"\n📝 Petición SIN token:")
    try:
        response = urllib.request.urlopen(req)
        data = json.loads(response.read().decode())
        print(f"✅ Status: {response.status}")
        print(f"✅ Response: {json.dumps(data, indent=2)[:500]}")
    except urllib.error.HTTPError as e:
        print(f"❌ Error HTTP: {e.code}")
        print(f"❌ Details: {e.read().decode()[:300]}")
    
except Exception as e:
    print(f"❌ Error general: {str(e)}")
    import traceback
    traceback.print_exc()
