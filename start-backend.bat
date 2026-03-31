@echo off
REM Iniciar el Backend de FlowFi

echo.
echo ========================================
echo   INICIANDO BACKEND DE FLOWFI
echo ========================================
echo.

cd /d "C:\Users\isabe\OneDrive\Desktop\Flowfi\Backend"

echo Iniciando servidor FastAPI en puerto 8000...
echo.
echo Backend estará disponible en: http://localhost:8000
echo Documentación Swagger: http://localhost:8000/docs
echo.

call C:/Users/isabe/anaconda3/Scripts/conda.exe run -p C:\Users\isabe\anaconda3 python run.py

pause
