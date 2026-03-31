"""
Cliente de Supabase para la conexión a la base de datos PostgreSQL.
"""
from typing import Optional, Any, Dict, List
from supabase import create_client, Client
from app.config import settings
import logging

logger = logging.getLogger(__name__)


class SupabaseClient:
    """
    Cliente wrapper para Supabase que maneja la conexión y operaciones CRUD.
    """

    _instance: Optional["SupabaseClient"] = None
    _client: Optional[Client] = None

    def __new__(cls):
        """Singleton pattern para la conexión a Supabase"""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        """Inicializa la conexión a Supabase"""
        try:
            if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
                raise ValueError(
                    "SUPABASE_URL and SUPABASE_KEY must be set in environment variables"
                )

            self._client = create_client(
                supabase_url=settings.SUPABASE_URL,
                supabase_key=settings.SUPABASE_KEY,
            )
            logger.info("Supabase client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Supabase client: {str(e)}")
            raise

    @property
    def client(self) -> Client:
        """Retorna el cliente de Supabase"""
        if self._client is None:
            self._initialize()
        return self._client

    def get_auth_header(self, token: str) -> Dict[str, str]:
        """Retorna el header de autenticación para llamadas al servidor"""
        return {
            "Authorization": f"Bearer {token}",
            "apikey": settings.SUPABASE_KEY,
        }

    async def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """
        Verifica un JWT token directamente con Supabase.
        
        Args:
            token: El JWT token a verificar
            
        Returns:
            Datos del usuario si el token es válido, None en caso contrario
        """
        try:
            # Intenta obtener el usuario actual usando el token
            response = self.client.auth.get_user(token)
            return {
                "id": response.user.id,
                "email": response.user.email,
                "user_metadata": response.user.user_metadata,
            }
        except Exception as e:
            logger.warning(f"Token verification failed: {str(e)}")
            return None

    async def get_user_by_id(self, user_id: str, token: str) -> Optional[Dict[str, Any]]:
        """
        Obtiene un usuario por ID desde la tabla profiles.
        
        Args:
            user_id: ID del usuario
            token: JWT token con permisos
            
        Returns:
            Datos del usuario o None
        """
        try:
            headers = self.get_auth_header(token)
            response = self.client.table("profiles").select("*").eq("id", user_id).execute()
            
            if response.data and len(response.data) > 0:
                return response.data[0]
            return None
        except Exception as e:
            logger.error(f"Error fetching user: {str(e)}")
            return None

    async def create_user_profile(
        self, user_id: str, email: str, full_name: Optional[str] = None, 
        business_name: Optional[str] = None, token: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Crea un nuevo perfil de usuario.
        
        Args:
            user_id: ID del usuario (del auth)
            email: Email del usuario
            full_name: Nombre completo
            business_name: Nombre de empresa
            
        Returns:
            Datos del perfil creado
        """
        try:
            data = {
                "id": user_id,
                "email": email,
                "full_name": full_name,
                "business_name": business_name,
                "role": "user",
            }
            response = self.client.table("profiles").insert(data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error creating profile: {str(e)}")
            return None

    async def get_user_from_auth(self, token: str) -> Optional[Dict[str, Any]]:
        """
        Obtiene los datos del usuario autenticado desde Supabase Auth.
        
        Args:
            token: JWT token
            
        Returns:
            Datos básicos del usuario
        """
        try:
            # Este es un llamado directo a Supabase Auth
            # En producción, necesitarías implementar la verificación correcta del JWT
            from postgrest.exceptions import APIError
            
            user_info = await self.verify_token(token)
            return user_info
        except Exception as e:
            logger.error(f"Error getting user from auth: {str(e)}")
            return None


def get_supabase_client() -> SupabaseClient:
    """Factory function para obtener la instancia del cliente Supabase"""
    return SupabaseClient()
