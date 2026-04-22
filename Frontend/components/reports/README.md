# Guía de Reportes - FlowFi

## Descripción General

Se ha implementado un sistema completo de reportes con filtros de fechas, exportación a Excel/PDF y análisis detallado de finanzas.

## Características Implementadas

### 1. **Filtro de Fechas Mejorado** (EnhancedDateFilter)
- Ubicado en la parte superior derecha de la página de reportes
- Rangos rápidos predefinidos:
  - Hoy
  - Últimos 7 días
  - Últimos 30 días
  - Últimos 90 días
  - Este mes
  - Mes anterior
- Rango personalizado: selector de fechas manual "desde" y "hasta"
- Los filtros se guardan en la URL como parámetros de búsqueda

**Uso en componentes:**
```tsx
import { EnhancedDateFilter } from '@/components/reports/enhanced-date-filter'

<EnhancedDateFilter
  startDate={startDate}
  endDate={endDate}
  onDateChange={(start, end) => {
    setStartDate(start)
    setEndDate(end)
  }}
/>
```

---

### 2. **Botón de Exportación** (ExportButton)
Exporta datos a Excel (.xlsx) o PDF

**Características:**
- Exportación a Excel con formato automático
- Exportación a PDF con tablas formateadas
- Nombres de archivos con fecha automática
- Funciones de formato personalizadas para columnas

**Uso:**
```tsx
import { ExportButton } from '@/components/reports/export-button'

<ExportButton
  data={transactions}
  fileName="Reporte_Transacciones"
  columns={[
    { key: 'fecha', label: 'Fecha' },
    { key: 'monto', label: 'Monto', format: (v) => `$${v}` }
  ]}
  title="Mi Reporte"
/>
```

**Parámetros:**
- `data`: Array de objetos con los datos a exportar
- `fileName`: Nombre base del archivo (se agrega fecha automáticamente)
- `columns`: Array de columnas con `key`, `label` y `format` (opcional)
- `title`: Título del reporte (opcional)
- `htmlElementId`: ID de elemento HTML para exportar como PDF (opcional)

---

### 3. **Reporte Mensual** (MonthlyReport)
Análisis detallado del mes actual con:
- Tarjetas de resumen (Total Ingresos, Gastos, Flujo Neto)
- Gráfico de barras: comparación semanal ingresos vs gastos
- Gráfico de pastel: distribución de gastos por categoría
- Tabla detallada de gastos por categoría

**Uso:**
```tsx
import { MonthlyReport } from '@/components/reports/monthly-report'

<MonthlyReport data={monthlyData} loading={isLoading} />
```

---

### 4. **Reporte Detallado** (DetailedReport)
Reporte completo con filtros dinámicos y actualización en tiempo real:

**Secciones:**
1. **Filtros Dinámicos:**
   - Búsqueda por descripción o categoría
   - Filtro por tipo (Ingresos/Gastos)
   - Filtro por categoría
   - Botón de exportación integrado

2. **Resumen:**
   - Total Ingresos
   - Total Gastos
   - Flujo Neto

3. **Gráfico de Línea:**
   - Evolución diaria de ingresos vs gastos
   - Actualiza automáticamente con filtros

4. **Tabla de Transacciones:**
   - Lista completa de transacciones
   - Muestra fecha, descripción, categoría, tipo, monto y saldo
   - Resalta ingresos y gastos con colores
   - "Sin resultados" cuando no hay datos

**Uso:**
```tsx
import { DetailedReport } from '@/components/reports/detailed-report'

<DetailedReport
  startDate="2024-01-01"
  endDate="2024-01-31"
/>
```

---

## Página de Reportes Principal

**Ruta:** `/dashboard/reportes`

**Estructura:**
1. Encabezado con título y filtro de fechas
2. Dos pestañas (Tabs):
   - **Reporte Mensual:** Análisis del mes actual
   - **Reporte Detallado:** Análisis por período personalizado

**Cómo funciona:**
- Al abrir la página, se carga con "Últimos 30 días" por defecto
- El filtro de fechas puede cambiar y actualiza todos los reportes
- Los parámetros se guardan en la URL (`?desde=...&hasta=...`)
- Los filtros persisten al navegar

---

## Integración con API

Actualmente, los components usan **datos de ejemplo**. Para integrar con la API real:

### 1. En `MonthlyReport`:
```tsx
useEffect(() => {
  const fetchMonthlyData = async () => {
    const response = await fetch('/api/v1/dashboard/monthly-comparison', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await response.json()
    processData(data)
  }
  fetchMonthlyData()
}, [])
```

### 2. En `DetailedReport`:
```tsx
useEffect(() => {
  const fetchTransactions = async () => {
    const response = await fetch(
      `/api/v1/expenses?desde=${startDate}&hasta=${endDate}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    )
    const expenses = await response.json()
    
    // Combinar con ingresos
    const incomeResponse = await fetch(
      `/api/v1/incomes?desde=${startDate}&hasta=${endDate}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    )
    const incomes = await incomeResponse.json()
    
    // Procesar y combinar datos
    const allTransactions = combineData(expenses, incomes)
    setTransactions(allTransactions)
  }
  fetchTransactions()
}, [startDate, endDate])
```

---

## Estilos y UI

Todos los componentes usan:
- **UI Components de Radix:** Button, Card, Select, Input, Popover, Tabs, Dropdown
- **Iconos:** Lucide React
- **Gráficos:** Recharts
- **Fechas:** date-fns (con localización al español)
- **Estilos:** Tailwind CSS

---

## Ejemplos de Filtros en Tiempo Real

El componente `DetailedReport` implementa filtros dinámicos que actualizan:

1. **Búsqueda en tiempo real:**
   ```
   Usuario escribe "Alimentación" → Se filtra solo esas transacciones
   ```

2. **Filtro por tipo:**
   ```
   Usuario selecciona "Solo Gastos" → Solo muestra gastos
   ```

3. **Filtro por categoría:**
   ```
   Usuario selecciona "Transporte" → Solo muestra esa categoría
   ```

4. **Combinación de filtros:**
   ```
   Usuario aplica: "Gasto" + "Categoría: Transporte" 
   → Solo muestra gastos de transporte
   → Los gráficos se actualizan automáticamente
   ```

---

## Exportación de Datos

### Exportar a Excel
- Formato: `.xlsx` (Excel moderno)
- Incluye encabezados automáticos
- Ancho de columnas ajustable
- Nombre: `Reporte_Detallado_YYYY-MM-DD.xlsx`

### Exportar a PDF
- Formato: `.pdf` (tamaño A4)
- Orientación automática (retrato/apaisado)
- Tablas bien formateadas
- Múltiples páginas si es necesario
- Nombre: `Reporte_Detallado_YYYY-MM-DD.pdf`

---

## Próximos Pasos (Implementación de API)

1. Crear endpoints que devuelvan datos de transacciones por rango de fechas
2. Implementar filtros en el backend (por categoría, tipo, búsqueda)
3. Conectar componentes con API real usando `fetch` o cliente HTTP
4. Agregar autenticación con tokens JWT
5. Implementar paginación si hay muchas transacciones

---

## Archivos Creados

```
Frontend/components/reports/
├── enhanced-date-filter.tsx       ← Filtro de fechas mejorado
├── export-button.tsx              ← Botón exportar Excel/PDF
├── monthly-report.tsx             ← Reporte mensual
├── detailed-report.tsx            ← Reporte detallado con filtros
└── [otros componentes existentes]

Frontend/app/(dashboard)/dashboard/
└── reportes/
    └── page.tsx                   ← Página principal de reportes

Frontend/components/dashboard/
└── sidebar.tsx                    ← Actualizado con enlace a Reportes
```

---

## Dependencias Instaladas

```json
{
  "xlsx": "^0.18.5",
  "jspdf": "^4.2.1",
  "html2canvas": "^1.4.1"
}
```

Además de las ya existentes:
- date-fns (para manipulación de fechas)
- recharts (para gráficos)
- radix-ui (para componentes UI)
- tailwind (para estilos)

---

## Troubleshooting

### El filtro de fechas no funciona
- Verificar que los parámetros `startDate` y `endDate` se pasen correctamente
- Revisar la consola para errores
- Asegurarse que las fechas estén en formato `YYYY-MM-DD`

### Los Gráficos no se renderizan
- Verificar que Recharts esté instalado correctamente
- Revisar que el contenedor tenga una altura definida
- Checking que los datos estén en el formato correcto

### Exportación a PDF lenta
- Es normal para reportes grandes
- Considerar limitar la cantidad de datos export
- Usar "Exportar solo lo visible" en versiones futuras

---

## Contacto y Soporte

Para preguntas sobre la implementación de reportes, revisa:
- Documentación de Recharts: https://recharts.org
- Documentación de jsPDF: https://github.com/parallax/jsPDF
- Documentación de date-fns: https://date-fns.org
