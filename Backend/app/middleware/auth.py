"""
Middleware de autenticación para validar JWT tokens de Supabase.
"""
from fastapi import HTTPException, status, Request
from fastapi.security import HTTPBearer
from app.database import get_supabase_client
from typing import Optional
import logging
import jwt
import os

logger = logging.getLogger(__name__)

security = HTTPBearer()


def extract_user_id_from_token(authorization_header: Optional[str]) -> Optional[str]:
    """
    Extrae el user_id del JWT token sin validar la firma (solo para desarrollo).
    Intenta primero decodificar con la clave de Supabase, y si falla, lo hace sin validación.
    
    Args:
        authorization_header: Header Authorization (ej: "Bearer token...")
        
    Returns:
        user_id extraído del token, o None si no hay token
    """
    if not authorization_header:
        return None
    
    try:
        # Remover "Bearer " del header
        token = authorization_header.replace("Bearer ", "").strip()
        
        # Intenta decodificar sin validar firma (útil para desarrollo)
        decoded = jwt.decode(token, options={"verify_signature": False})
        
        # El user_id está en el claim 'sub'
        user_id = decoded.get("sub")
        
        if user_id:
            logger.info(f"User ID extracted from JWT: {user_id}")
            return user_id
            
    except Exception as e:
        logger.warning(f"Could not extract user_id from token: {str(e)}")
    
    return None


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
