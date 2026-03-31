# Guía de Integración Backend-Frontend

Esta guía te ayudará a conectar el frontend de Next.js con el backend de FastAPI.

## Configuración Inicial

### 1. Variables de Entorno del Frontend

Edita el archivo `.env.local` en la carpeta `Frontend`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000
```

En producción:

```env
NEXT_PUBLIC_API_URL=https://tu-backend.ejemplo.com
```

### 2. Variables de Entorno del Backend

Copia `.env.example` a `.env` en la carpeta `Backend`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DEBUG=False
SECRET_KEY=your-secret-key
```

## Flujo de Autenticación

### Cómo Funciona

1. Usuario inicia sesión en el frontend con Supabase Auth
2. Supabase retorna un JWT token
3. El frontend almacena este token
4. Para cada solicitud al backend, el frontend incluye el token en el header `Authorization`
5. El backend válida el token con Supabase
6. Si es válido, procesa la solicitud

### Diagrama de Flujo

```
Frontend                          Backend                    Supabase
  |                                 |                          |
  |-- 1. Login Request ------------->|                          |
  |                                 |-- 2. Validate Token ----->|
  |                                 |<-- 3. Token OK ----------|
  |<-- 4. JWT Token --------(returned)                         |
  |                                 |                          |
  |-- 5. API Request + Token ------>|                          |
  |    (GET /api/v1/incomes)       |-- 6. Verify Token ------>|
  |                                 |<-- 7. User Info --------|
  |<-- 8. Data Response --(incomes) |                          |
```

## Ejemplos de Integración por Módulo

### Incomes (Ingresos)

#### Listar Ingresos

```typescript
// Frontend: lib/services/incomes.ts
import { useSession } from '@supabase/auth-helpers-nextjs'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function fetchIncomes(filters?: {
  startDate?: string
  endDate?: string
  incomeTypeId?: string
}) {
  const session = useSession()
  const token = session?.access_token

  if (!token) {
    throw new Error('No authentication token')
  }

  const params = new URLSearchParams()
  if (filters?.startDate) params.append('start_date', filters.startDate)
  if (filters?.endDate) params.append('end_date', filters.endDate)
  if (filters?.incomeTypeId) params.append('income_type_id', filters.incomeTypeId)

  const response = await fetch(
    `${API_URL}/api/v1/incomes?${params}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    }
  )

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`)
  }

  return response.json()
}
```

#### Crear Ingreso

```typescript
export async function createIncome(
  data: {
    amount: number
    paymentMethod: 'efectivo' | 'transferencia' | 'tarjeta' | 'otro'
    date: string
    description?: string
    incomeTypeId?: string
  }
) {
  const session = useSession()
  const token = session?.access_token

  if (!token) {
    throw new Error('No authentication token')
  }

  const response = await fetch(
    `${API_URL}/api/v1/incomes`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: data.amount,
        payment_method: data.paymentMethod,
        date: data.date,
        description: data.description,
        income_type_id: data.incomeTypeId,
      })
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail)
  }

  return response.json()
}
```

### Expenses (Gastos)

Similar a Incomes:

```typescript
// Listar
GET /api/v1/expenses?start_date=2024-01-01&end_date=2024-01-31&category_id=uuid

// Crear
POST /api/v1/expenses
{
  "amount": 150.50,
  "date": "2024-01-15",
  "description": "Compra de insumos",
  "category_id": "uuid-opcional"
}

// Actualizar
PUT /api/v1/expenses/{expense_id}

// Eliminar
DELETE /api/v1/expenses/{expense_id}
```

### Dashboard

```typescript
export async function fetchDashboardStats(
  startDate?: string,
  endDate?: string
) {
  const session = useSession()
  const token = session?.access_token

  const params = new URLSearchParams()
  if (startDate) params.append('start_date', startDate)
  if (endDate) params.append('end_date', endDate)

  const response = await fetch(
    `${API_URL}/api/v1/dashboard/stats?${params}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    }
  )

  return response.json()
}
```

## Manejo de Errores

### Códigos de Error Comunes

```typescript
const handleApiError = (error: any) => {
  if (error.status === 401) {
    // Token expirado o inválido
    // Redirigir a login
    window.location.href = '/auth/login'
  } else if (error.status === 403) {
    // No autorizado
    toast.error('No tienes permiso para hacer esto')
  } else if (error.status === 404) {
    // Recurso no encontrado
    toast.error('El recurso no existe')
  } else if (error.status === 500) {
    // Error del servidor
    toast.error('Error del servidor. Por favor intenta más tarde')
  }
}
```

## Hook de Autenticación Recomendado

```typescript
// hooks/useAuthToken.ts
import { useSession } from '@supabase/auth-helpers-nextjs'

export function useAuthToken() {
  const { data: session } = useSession()
  
  return {
    token: session?.access_token,
    isAuthenticated: !!session?.user,
    user: session?.user,
  }
}
```

## Ejecutar Ambos Servidores Localmente

### Terminal 1: Backend

```bash
cd Backend
source venv/bin/activate  # o venv\Scripts\activate en Windows
python run.py
```

Backend estará en: http://localhost:8000

### Terminal 2: Frontend

```bash
cd Frontend
npm run dev
# o si usas pnpm
pnpm dev
```

Frontend estará en: http://localhost:3000

### Terminal 3: Monitoreo de Logs (opcional)

Abre otra terminal para ver logs en tiempo real:

```bash
# En Backend
tail -f logs.txt
```

## Testing de Endpoints

### Usando cURL

```bash
# Obtener ingresos
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/v1/incomes

# Crear ingreso
curl -X POST http://localhost:8000/api/v1/incomes \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100.50,
    "payment_method": "efectivo",
    "date": "2024-01-15"
  }'
```

### Usando Postman

1. Importa la colección desde: `/collections/FlowFi.postman_collection.json`
2. Configura la variable `token` con tu JWT
3. Ejecuta los requests

### Usando Swagger UI

1. Ve a http://localhost:8000/docs
2. Haz clic en "Authorize"
3. Ingresa tu JWT token
4. Prueba los endpoints directamente

## Sincronización de Datos

### Problema: Datos Desincronizados

Si el frontend y backend muestran datos diferentes:

1. Verifica que el usuario_id es correcto
2. Comprueba las políticas RLS en Supabase
3. Revisa los logs del backend
4. Limpia el caché del navegador

```typescript
// Cache invalidation en Next.js
import { revalidatePath } from 'next/cache'

revalidatePath('/dashboard/ingresos')
```

## Deployment Coordinado

### Supabase (Compartido)

La base de datos en Supabase es compartida entre frontend y backend.

### Frontend → Vercel

```bash
git push origin main:main
# Vercel automatically deploys
```

Configura variables en Vercel Project > Settings > Environment Variables

### Backend → Render/Railway

1. Conecta el repo
2. Selecciona la rama `main`
3. Configura variables de entorno
4. Deploy automático en cada push

## Problemas Típicos y Soluciones

### "CORS Error from origin http://localhost:3000"

Solución: Asegúrate que `http://localhost:3000` está en `CORS_ORIGINS` en Backend:

```python
# app/config/settings.py
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    # ... URLs de producción
]
```

### "Token verificado pero usuario no existe en profiles"

La tabla `profiles` no se crea automáticamente. Crea un trigger en Supabase:

```sql
-- SQL: crear profile automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$;

-- Trigger en auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();
```

### "Cannot read property 'access_token' of null"

El usuario no está autenticado. Redirecciona a login:

```typescript
if (!session) {
  redirect('/auth/login')
}
```

## Checklist de Integración

- [ ] Variables de entorno configuradas en ambos lados
- [ ] Base de datos en Supabase creada con todas las tablas
- [ ] Políticas RLS configuradas correctamente
- [ ] CORS habilitado para las URLs del frontend
- [ ] Trigger de creación de profile automático
- [ ] Frontend puede obtener JWT de Supabase
- [ ] Backend recibe y valida JWT correctamente
- [ ] Endpoints básicos funcionan en Swagger
- [ ] Frontend puede hacer llamadas exitosas
- [ ] Errores se manejan correctamente
- [ ] Dashboard muestra datos correctos
- [ ] CRUD completo funciona (Create, Read, Update, Delete)

## Próximos Pasos

1. Prueba todos los endpoints en Swagger
2. Crea tests para los endpoints
3. Implementa logging detallado
4. Configura alertas de errores
5. Prepara para producción
