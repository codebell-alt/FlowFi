-- FlowFi Database Schema - Script SQL para ejecutar en Supabase
-- Copia TODO este código y pégalo en: SQL Editor → New Query → Run

-- Tabla de perfiles de usuario
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  business_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de categorías de gastos
CREATE TABLE IF NOT EXISTS public.expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de tipos de ingreso
CREATE TABLE IF NOT EXISTS public.income_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de ingresos (ventas)
CREATE TABLE IF NOT EXISTS public.incomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  income_type_id UUID REFERENCES public.income_types(id) ON DELETE SET NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('efectivo', 'transferencia', 'tarjeta', 'otro')),
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de gastos
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  category_id UUID REFERENCES public.expense_categories(id) ON DELETE SET NULL,
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS en todas las tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- Políticas RLS para admin (puede ver todos los perfiles)
CREATE POLICY "admin_select_all_profiles" ON public.profiles FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Políticas RLS para expense_categories
CREATE POLICY "expense_categories_select" ON public.expense_categories FOR SELECT 
USING (user_id = auth.uid() OR is_default = TRUE);
CREATE POLICY "expense_categories_insert" ON public.expense_categories FOR INSERT 
WITH CHECK (user_id = auth.uid());
CREATE POLICY "expense_categories_update" ON public.expense_categories FOR UPDATE 
USING (user_id = auth.uid());
CREATE POLICY "expense_categories_delete" ON public.expense_categories FOR DELETE 
USING (user_id = auth.uid());

-- Políticas RLS para income_types
CREATE POLICY "income_types_select" ON public.income_types FOR SELECT 
USING (user_id = auth.uid() OR is_default = TRUE);
CREATE POLICY "income_types_insert" ON public.income_types FOR INSERT 
WITH CHECK (user_id = auth.uid());
CREATE POLICY "income_types_update" ON public.income_types FOR UPDATE 
USING (user_id = auth.uid());
CREATE POLICY "income_types_delete" ON public.income_types FOR DELETE 
USING (user_id = auth.uid());

-- Políticas RLS para incomes
CREATE POLICY "incomes_select_own" ON public.incomes FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "incomes_insert_own" ON public.incomes FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "incomes_update_own" ON public.incomes FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "incomes_delete_own" ON public.incomes FOR DELETE USING (user_id = auth.uid());

-- Políticas RLS para expenses
CREATE POLICY "expenses_select_own" ON public.expenses FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "expenses_insert_own" ON public.expenses FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "expenses_update_own" ON public.expenses FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "expenses_delete_own" ON public.expenses FOR DELETE USING (user_id = auth.uid());

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_incomes_user_date ON public.incomes(user_id, date);
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON public.expenses(user_id, date);
CREATE INDEX IF NOT EXISTS idx_incomes_user_id ON public.incomes(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON public.expenses(user_id);
