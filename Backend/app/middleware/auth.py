"""
Middleware de autenticación para validar JWT tokens de Supabase.
"""
from fastapi import HTTPException, status, Request
from fastapi.security import HTTPBearer
from app.database import get_supabase_client
from typing import Optional
import logging

logger = logging.getLogger(__name__)

security = HTTPBearer()


async def get_current_user(credentials) -> dict:
    """
    Valida el JWT token y retorna los datos del usuario autenticado.
    
    Args:
        credentials: Las credenciales HTTP Bearer
        
    Returns:
        Diccionario con datos del usuario
        
    Raises:
        HTTPException: Si el token es inválido o expirado
    """
    token = credentials.credentials
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No token provided",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Verifica el token con Supabase
    supabase = get_supabase_client()
    
    try:
        user_info = await supabase.verify_token(token)
        
        if not user_info:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Agrega el token al objeto de usuario para futuras llamadas a la BD
        user_info["token"] = token
        return user_info
        
    except Exception as e:
        logger.error(f"Token verification error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_optional_user(request: Request) -> Optional[dict]:
    """
    Intenta extraer y validar el token del header Authorization.
    Retorna None si no hay token presente (útil para endpoints públicos).
    
    Args:
        request: La solicitud HTTP
        
    Returns:
        Diccionario con datos del usuario o None si no hay token/es inválido
    """
    auth_header = request.headers.get("Authorization")
    
    if not auth_header:
        return None
    
    try:
        scheme, token = auth_header.split()
        if scheme.lower() != "bearer":
            return None
        
        supabase = get_supabase_client()
        user_info = await supabase.verify_token(token)
        
        if user_info:
            user_info["token"] = token
            return user_info
        return None
        
    except Exception as e:
        logger.debug(f"Optional user extraction failed: {str(e)}")
        return None
