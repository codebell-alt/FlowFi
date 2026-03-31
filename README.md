# FlowFi Backend

Sistema de gestión financiera para pequeños negocios. FlowFi te ayuda a registrar ingresos, gastos y visualizar el flujo de caja en tiempo real.

## Descripción del Proyecto

FlowFi Backend es una API RESTful desarrollada con FastAPI para el gestión de flujo de caja. Proporciona endpoints para:

- Gestión de ingresos y gastos
- Categorización de transacciones
- Reportes y análisis de flujo de caja
- Gestión de perfiles de usuario
- Autenticación integrada con Supabase
- Panel administrativo

## Tecnologías Utilizadas

- **Python 3.9+**: Lenguaje de programación
- **FastAPI 0.104.1**: Framework web moderno y rápido
- **Uvicorn**: Servidor ASGI
- **Pydantic 2.5.0**: Validación de datos
- **Supabase**: Base de datos PostgreSQL en la nube con autenticación integrada
- **PostgreSQL**: Base de datos relacional (a través de Supabase)

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- Python 3.9 o superior
- pip (gestor de paquetes de Python)
- [Cuenta de Supabase](https://supabase.com) (gratuita)
- Git para control de versiones

## Instalación Paso a Paso

### 1. Clonar el Repositorio

```bash
git clone https://github.com/codebell/flowfi.git
cd flowfi/Backend
```

### 2. Crear un Entorno Virtual

En Windows:

```bash
python -m venv venv
venv\Scripts\activate
```

En macOS/Linux:

```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Instalar Dependencias

```bash
pip install -r requirements.txt
```

### 4. Configurar Variables de Entorno

## Ejecución del Proyecto

### Modo Desarrollo

```bash
python run.py
```

O directamente con uvicorn:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

El servidor estará disponible en: http://localhost:8000

### Acceder a la Documentación

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Documentación de la API

### Autenticación

Todos los endpoints (excepto `/health` y `/`) requieren un JWT token de Supabase en el header `Authorization`:

```
Authorization: Bearer your-jwt-token-here
```

### Endpoints Principales

#### Autenticación
- `GET /api/v1/auth/me` - Obtiene información del usuario autenticado
- `POST /api/v1/auth/logout` - Logout (informativo)

#### Perfil
- `GET /api/v1/profile/me` - Obtiene perfil del usuario
- `PUT /api/v1/profile/me` - Actualiza perfil del usuario

#### Ingresos
- `GET /api/v1/incomes` - Lista ingresos
- `GET /api/v1/incomes/{id}` - Obtiene un ingreso
- `POST /api/v1/incomes` - Crea un ingreso
- `PUT /api/v1/incomes/{id}` - Actualiza un ingreso
- `DELETE /api/v1/incomes/{id}` - Elimina un ingreso

#### Gastos
- `GET /api/v1/expenses` - Lista gastos
- `GET /api/v1/expenses/{id}` - Obtiene un gasto
- `POST /api/v1/expenses` - Crea un gasto
- `PUT /api/v1/expenses/{id}` - Actualiza un gasto
- `DELETE /api/v1/expenses/{id}` - Elimina un gasto

#### Categorías
- `GET /api/v1/categories/expenses` - Lista categorías de gasto
- `POST /api/v1/categories/expenses` - Crea categoría
- `PUT /api/v1/categories/expenses/{id}` - Actualiza categoría
- `DELETE /api/v1/categories/expenses/{id}` - Elimina categoría

#### Tipos de Ingreso
- `GET /api/v1/categories/income-types` - Lista tipos de ingreso
- `POST /api/v1/categories/income-types` - Crea tipo de ingreso
- `PUT /api/v1/categories/income-types/{id}` - Actualiza tipo
- `DELETE /api/v1/categories/income-types/{id}` - Elimina tipo

#### Dashboard
- `GET /api/v1/dashboard/stats` - Obtiene estadísticas del dashboard
- `GET /api/v1/dashboard/monthly-comparison` - Comparación mensual

#### Admin (solo para usuarios con rol admin)
- `GET /api/v1/admin/users` - Lista todos los usuarios
- `GET /api/v1/admin/users/{user_id}` - Obtiene detalles de usuario
- `GET /api/v1/admin/users/{user_id}/stats` - Obtiene estadísticas de usuario


### Configuración en Next.js

En el frontend, configura las variables de entorno:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Consumo de Endpoints

Ejemplo desde el frontend:

```typescript
const getIncomes = async () => {
  const token = await supabase.auth.getSession();
  
  const response = await fetch(
    'http://localhost:8000/api/v1/incomes',
    {
      headers: {
        'Authorization': `Bearer ${token.data.session?.access_token}`,
      }
    }
  );
  
  return response.json();
};
```

## Despliegue Básico

### Opción 1: Render.com

1. Crea una cuenta en https://render.com
2. Conecta tu repositorio de GitHub
3. Crea un nuevo Web Service
4. Configura:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Agrega las variables de entorno desde el archivo .env
6. Deploy

### Opción 2: Railway

1. Crea una cuenta en https://railway.app
2. Conecta tu repositorio
3. Railway agrega automáticamente Python y ejecuta los scripts
4. Configura el comando de inicio en railway.toml
5. Deploy

### Opción 3: Heroku (Legacy)

Aunque Heroku eliminó su tier gratuito, puedes usar:

```bash
heroku create flowfi-backend
heroku config:set SUPABASE_URL=your-url
heroku config:set SUPABASE_KEY=your-key
git push heroku main
```

## Instrucciones para GitHub

### Crear Repositorio

```bash
# Desde la raíz del proyecto Flowfi
git init
git add .
git commit -m "Initial commit: FlowFi project with Frontend and Backend"

# Agregar remoto
git remote add origin https://github.com/codebell/flowfi.git

# Push
git push -u origin main
```

### Configurar SSH (Opcional pero recomendado)

```bash
# Generar clave SSH
ssh-keygen -t ed25519 -C "tu-email@example.com"

# En GitHub: Settings > SSH and GPG keys > New SSH key
# Pegar la clave pública (cat ~/.ssh/id_ed25519.pub)

# Cambiar URL a SSH
git remote set-url origin git@github.com:codebell/flowfi.git
```

### Workflow Típico

```bash
# Crear rama para nueva funcionalidad
git checkout -b feature/nueva-funcionalidad

# Hacer cambios y commits
git add .
git commit -m "Descripción clara del cambio"

# Push a la rama
git push origin feature/nueva-funcionalidad

# En GitHub: Crear Pull Request y mergear a main
```

## Estructura del Proyecto

```
Backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # Punto de entrada de FastAPI
│   ├── api/
│   │   ├── __init__.py
│   │   └── routes/
│   │       ├── __init__.py
│   │       ├── auth.py         # Endpoints de autenticación
│   │       ├── profile.py      # Endpoints de perfil
│   │       ├── incomes.py      # Endpoints de ingresos
│   │       ├── expenses.py     # Endpoints de gastos
│   │       ├── categories.py   # Endpoints de categorías
│   │       ├── dashboard.py    # Endpoints del dashboard
│   │       └── admin.py        # Endpoints administrativos
│   ├── models/
│   │   ├── __init__.py
│   │   └── schemas.py          # Esquemas Pydantic
│   ├── database/
│   │   ├── __init__.py
│   │   └── supabase_client.py  # Cliente de Supabase
│   ├── middleware/
│   │   ├── __init__.py
│   │   └── auth.py             # Middleware de autenticación
│   └── config/
│       ├── __init__.py
│       └── settings.py         # Configuración
├── requirements.txt             # Dependencias
├── .env.example                 # Ejemplo de variables de entorno
├── run.py                       # Script para ejecutar
└── README.md                    # Este archivo
```
## Debugging

### Habilitar Modo Debug

En `.env`:

```env
DEBUG=True
```

Reinicia el servidor:

```bash
python run.py
```

## Roadmap Futuro

- Exportación de reportes en PDF
- Gráficos avanzados
- Notificaciones por email
- Integración con pasarelas de pago
- API para móvil nativa
- Sincronización en tiempo real

## Historial de Cambios

### v1.0.0 (2024-03-31)
- Lanzamiento inicial
- Endpoints CRUD para ingresos, gastos y categorías
- Dashboard con estadísticas
- Integración completa con Supabase
- Documentación completa

## Quick Start

### 1. Backend 
```bash
http://localhost:8000
```

### 2. Frontend
```bash
cd Frontend
pnpm dev
```

Abre: `http://localhost:3000`

### 3. Base de Datos

Ejecuta el SQL en Supabase:
- Archivo: `FLOWFI_DATABASE_SETUP.sql`
- URL: https://app.supabase.com/project/nkoqeqfynxoskrizqybj/sql/new

## Credentials

```
Supabase URL: https://nkoqeqfynxoskrizqybj.supabase.co
API Key: sb_publishable_v9xjom8ox56sgelUBuYICw_BV3JAT39
```

## URLs

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- Backend Docs: http://localhost:8000/docs
