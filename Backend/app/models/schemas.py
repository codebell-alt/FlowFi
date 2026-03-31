"""
Esquemas Pydantic para validación de datos y respuestas.
"""
from pydantic import BaseModel, Field, EmailStr
from datetime import datetime, date
from typing import Optional, List
from enum import Enum


# ============================================================================
# PAYMENT METHODS
# ============================================================================
class PaymentMethodEnum(str, Enum):
    """Métodos de pago disponibles"""
    EFECTIVO = "efectivo"
    TRANSFERENCIA = "transferencia"
    TARJETA = "tarjeta"
    OTRO = "otro"


# ============================================================================
# PROFILE SCHEMAS
# ============================================================================
class ProfileBase(BaseModel):
    """Base de datos de perfil"""
    email: EmailStr
    full_name: Optional[str] = None
    business_name: Optional[str] = None


class ProfileCreate(ProfileBase):
    """Creación de perfil"""
    pass


class ProfileUpdate(BaseModel):
    """Actualización de perfil"""
    full_name: Optional[str] = None
    business_name: Optional[str] = None


class ProfileResponse(ProfileBase):
    """Respuesta de perfil"""
    id: str
    role: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# INCOME TYPE SCHEMAS
# ============================================================================
class IncomeTypeBase(BaseModel):
    """Base de tipo de ingreso"""
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    is_default: bool = False


class IncomeTypeCreate(BaseModel):
    """Creación de tipo de ingreso"""
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None


class IncomeTypeUpdate(BaseModel):
    """Actualización de tipo de ingreso"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None


class IncomeTypeResponse(IncomeTypeBase):
    """Respuesta de tipo de ingreso"""
    id: str
    user_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# INCOME SCHEMAS
# ============================================================================
class IncomeBase(BaseModel):
    """Base de ingreso"""
    amount: float = Field(..., gt=0, decimal_places=2)
    payment_method: PaymentMethodEnum
    date: date
    description: Optional[str] = None
    income_type_id: Optional[str] = None


class IncomeCreate(IncomeBase):
    """Creación de ingreso"""
    pass


class IncomeUpdate(BaseModel):
    """Actualización de ingreso"""
    amount: Optional[float] = Field(None, gt=0)
    payment_method: Optional[PaymentMethodEnum] = None
    date: Optional[date] = None
    description: Optional[str] = None
    income_type_id: Optional[str] = None


class IncomeResponse(IncomeBase):
    """Respuesta de ingreso"""
    id: str
    user_id: str
    income_type: Optional[IncomeTypeResponse] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# EXPENSE CATEGORY SCHEMAS
# ============================================================================
class ExpenseCategoryBase(BaseModel):
    """Base de categoría de gasto"""
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    icon: Optional[str] = None
    is_default: bool = False


class ExpenseCategoryCreate(BaseModel):
    """Creación de categoría de gasto"""
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    icon: Optional[str] = None


class ExpenseCategoryUpdate(BaseModel):
    """Actualización de categoría de gasto"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    icon: Optional[str] = None


class ExpenseCategoryResponse(ExpenseCategoryBase):
    """Respuesta de categoría de gasto"""
    id: str
    user_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# EXPENSE SCHEMAS
# ============================================================================
class ExpenseBase(BaseModel):
    """Base de gasto"""
    amount: float = Field(..., gt=0, decimal_places=2)
    date: date
    description: Optional[str] = None
    category_id: Optional[str] = None


class ExpenseCreate(ExpenseBase):
    """Creación de gasto"""
    pass


class ExpenseUpdate(BaseModel):
    """Actualización de gasto"""
    amount: Optional[float] = Field(None, gt=0)
    date: Optional[date] = None
    description: Optional[str] = None
    category_id: Optional[str] = None


class ExpenseResponse(ExpenseBase):
    """Respuesta de gasto"""
    id: str
    user_id: str
    category: Optional[ExpenseCategoryResponse] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# DASHBOARD SCHEMAS
# ============================================================================
class IncomeByMethodResponse(BaseModel):
    """Ingreso por método de pago"""
    method: str
    total: float


class ExpenseByCategory(BaseModel):
    """Gasto por categoría"""
    category: str
    total: float


class DailyFlowResponse(BaseModel):
    """Flujo diario"""
    date: str
    income: float
    expenses: float
    balance: Optional[float] = None


class DashboardStatsResponse(BaseModel):
    """Estadísticas del dashboard"""
    total_income: float
    total_expenses: float
    balance: float
    income_count: int
    expense_count: int
    income_by_method: List[IncomeByMethodResponse]
    expenses_by_category: List[ExpenseByCategory]
    daily_flow: List[DailyFlowResponse]


class MonthlyComparison(BaseModel):
    """Comparación mensual"""
    current_income: float
    previous_income: float
    income_change_percent: float
    current_expenses: float
    previous_expenses: float
    expenses_change_percent: float


# ============================================================================
# ERROR RESPONSES
# ============================================================================
class ErrorResponse(BaseModel):
    """Respuesta de error"""
    detail: str
    code: Optional[str] = None
    status_code: int


class MessageResponse(BaseModel):
    """Respuesta de mensaje simple"""
    message: str


class PaginationParams(BaseModel):
    """Parámetros de paginación"""
    skip: int = Field(0, ge=0)
    limit: int = Field(50, ge=1, le=100)
