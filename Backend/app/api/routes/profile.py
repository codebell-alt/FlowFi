"""
Endpoints para gestión de perfil de usuario.
"""
from fastapi import APIRouter

router = APIRouter(prefix="/api/v1/profile", tags=["Profile"])


@router.get("/me")
async def get_current_profile():
    """Obtiene el perfil del usuario autenticado"""
    return {
        "id": "user123",
        "email": "user@example.com",
        "full_name": "Test User",
        "business_name": "Test Business",
        "role": "user"
    }


@router.put("/me")
async def update_current_profile(data: dict = None):
    """Actualiza el perfil del usuario autenticado"""
    return {
        "id": "user123",
        "message": "Profile updated successfully"
    }


@router.get("/{user_id}")
async def get_user_profile(user_id: str):
    """Obtiene el perfil de otro usuario"""
    return {
        "id": user_id,
        "email": "user@example.com",
        "full_name": "Test User",
        "business_name": "Test Business",
        "role": "user"
    }
