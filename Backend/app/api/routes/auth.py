"""
Endpoints de autenticación.
Nota: La autenticación se maneja principalmente en el frontend con Supabase Auth.
Estos endpoints proporcionan información útil sobre el usuario autenticado.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from app.models import (
    ProfileResponse,
    MessageResponse,
)
from app.middleware import get_current_user
from app.database import get_supabase_client

router = APIRouter(prefix="/api/v1/auth", tags=["Auth"])


@router.get("/me", response_model=ProfileResponse)
async def get_current_user_info(user: dict = Depends(get_current_user)):
    """
    Obtiene la información del usuario autenticado.
    Este endpoint valida que el token sea válido y retorna los datos del usuario.
    """
    try:
        supabase = get_supabase_client()
        
        response = supabase.client.table("profiles").select("*").eq(
            "id", user["id"]
        ).single().execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found"
            )
        
        return response.data
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching user info: {str(e)}"
        )


@router.post("/logout", response_model=MessageResponse)
async def logout(user: dict = Depends(get_current_user)):
    """
    Endpoint de logout (informativo).
    La autenticación es cacheada en el cliente, así que simplemente retorna un mensaje.
    El frontend debe eliminar el token del almacenamiento local.
    """
    return {"message": "Logout successful. Please remove the token from your client."}
