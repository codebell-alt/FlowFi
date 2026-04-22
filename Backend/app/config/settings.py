"""
Configuración de la aplicación FlowFi Backend
"""
import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings
from typing import Optional

# Cargar variables de entorno antes de usarlas
load_dotenv()


class Settings(BaseSettings):
    """
    Configuración principal de la aplicación.
    Las variables se cargan desde el archivo .env
    """
    
    # Información de la API
    APP_NAME: str = "FlowFi Backend"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    # Supabase configuration
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    
    # CORS configuration - Configurable via environment variables
    @property
    def CORS_ORIGINS(self) -> list:
        allowed = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000").split(",")
        return [origin.strip() for origin in allowed]
    
    # JWT configuration (if needed)
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
