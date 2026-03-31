"""
Script para ejecutar el servidor de desarrollo.
"""
import uvicorn
import os

from app.main import app

if __name__ == "__main__":
    debug = os.getenv("DEBUG", "False").lower() == "true"
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=debug,
        log_level="info" if debug else "warning",
    )
