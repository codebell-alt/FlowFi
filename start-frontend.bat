@echo off
REM Iniciar el Frontend de FlowFi

echo.
echo ========================================
echo   INICIANDO FRONTEND DE FLOWFI
echo ========================================
echo.

REM Verificar que estamos en el directorio correcto
cd /d "C:\Users\isabe\OneDrive\Desktop\Flowfi\Frontend"

REM Verificar si node_modules existe
if not exist "node_modules" (
    echo Instalando dependencias...
    call pnpm install
)

REM Verificar si .env.local existe
if not exist ".env.local" (
    echo.
    echo ERROR: Archivo .env.local no encontrado!
    echo.
    echo Por favor:
    echo 1. Copia el archivo .env.local.example a .env.local
    echo 2. Abre .env.local y reemplaza los valores con tus credenciales de Supabase
    echo 3. Vuelve a ejecutar este script
    echo.
    pause
    exit /b 1
)

echo.
echo Iniciando servidor de desarrollo...
echo.
echo Frontend estará disponible en: http://localhost:3000
echo Documentos Swagger del Backend: http://localhost:8000/docs
echo.

REM Iniciar el servidor de desarrollo
call pnpm dev

pause
