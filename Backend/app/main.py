"""
Punto de entrada principal de la aplicación FastAPI.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.config import settings
from app.api.routes import (
    incomes,
    expenses,
    categories,
    dashboard,
    profile,
    auth,
    admin,
)

# Configura logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifecycle handler para operaciones al iniciar y cerrar la aplicación.
    """
    # Startup
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info(f"Debug mode: {settings.DEBUG}")
    
    yield
    
    # Shutdown
    logger.info(f"Shutting down {settings.APP_NAME}")


def create_app() -> FastAPI:
    """
    Factory function para crear la aplicación FastAPI.
    """
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description="API Backend para FlowFi - Control de Flujo de Caja",
        lifespan=lifespan,
    )

    # Configurar CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Rutas de salud
    @app.get("/health", tags=["Health"])
    async def health_check():
        """Verifica el estado de la aplicación"""
        return {
            "status": "healthy",
            "app": settings.APP_NAME,
            "version": settings.APP_VERSION,
        }

    @app.get("/", tags=["Root"])
    async def root():
        """Endpoint raíz"""
        return {
            "message": f"Welcome to {settings.APP_NAME}",
            "version": settings.APP_VERSION,
            "docs": "/docs",
            "redoc": "/redoc",
        }

    # Incluye los routers
    app.include_router(auth.router)
    app.include_router(profile.router)
    app.include_router(incomes.router)
    app.include_router(expenses.router)
    app.include_router(categories.router)
    app.include_router(dashboard.router)
    app.include_router(admin.router)

    # Error handlers
    @app.exception_handler(Exception)
    async def general_exception_handler(request, exc):
        logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
        return {
            "detail": "Internal server error",
            "code": "INTERNAL_ERROR",
        }

    return app


app = create_app()
