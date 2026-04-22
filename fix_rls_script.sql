-- =====================================================================
-- SCRIPT PARA ARREGLAR RLS EN FLOWFI
-- =====================================================================
-- Este script configura correctamente las políticas de RLS
-- Ejecutar en: Supabase Dashboard → SQL Editor → Pega todo esto
-- =====================================================================

-- PASO 1: LIMPIAR POLÍTICAS ANTIGUAS (si existen)
-- =====================================================================

DROP POLICY IF EXISTS "Users can view own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can insert own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can update own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can delete own expenses" ON expenses;

DROP POLICY IF EXISTS "Users can view own incomes" ON incomes;
DROP POLICY IF EXISTS "Users can insert own incomes" ON incomes;
DROP POLICY IF EXISTS "Users can update own incomes" ON incomes;
DROP POLICY IF EXISTS "Users can delete own incomes" ON incomes;

DROP POLICY IF EXISTS "Anyone can view categories" ON expense_categories;
DROP POLICY IF EXISTS "Users can insert own categories" ON expense_categories;
DROP POLICY IF EXISTS "Users can update own categories" ON expense_categories;

DROP POLICY IF EXISTS "Anyone can view income types" ON income_types;
DROP POLICY IF EXISTS "Users can insert own income types" ON income_types;
DROP POLICY IF EXISTS "Users can update own income types" ON income_types;

-- =====================================================================
-- PASO 2: ASEGURAR QUE RLS ESTÁ ACTIVADO EN LAS TABLAS
-- =====================================================================

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_types ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- PASO 3: CREAR POLÍTICAS CORRECTAS PARA EXPENSES
-- =====================================================================

CREATE POLICY "expenses_select_own" 
  ON expenses 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "expenses_insert_own" 
  ON expenses 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "expenses_update_own" 
  ON expenses 
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "expenses_delete_own" 
  ON expenses 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- =====================================================================
-- PASO 4: CREAR POLÍTICAS CORRECTAS PARA INCOMES
-- =====================================================================

CREATE POLICY "incomes_select_own" 
  ON incomes 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "incomes_insert_own" 
  ON incomes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "incomes_update_own" 
  ON incomes 
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "incomes_delete_own" 
  ON incomes 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- =====================================================================
-- PASO 5: CREAR POLÍTICAS PARA CATEGORÍAS (lectura pública, escritura restringida)
-- =====================================================================

CREATE POLICY "categories_select_all" 
  ON expense_categories 
  FOR SELECT 
  USING (TRUE);

CREATE POLICY "categories_insert_own_or_default" 
  ON expense_categories 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR is_default = true);

CREATE POLICY "categories_update_own" 
  ON expense_categories 
  FOR UPDATE 
  USING (auth.uid() = user_id OR is_default = true);

-- =====================================================================
-- PASO 6: CREAR POLÍTICAS PARA INCOME TYPES
-- =====================================================================

CREATE POLICY "income_types_select_all" 
  ON income_types 
  FOR SELECT 
  USING (TRUE);

CREATE POLICY "income_types_insert_own_or_default" 
  ON income_types 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR is_default = true);

CREATE POLICY "income_types_update_own" 
  ON income_types 
  FOR UPDATE 
  USING (auth.uid() = user_id OR is_default = true);

-- =====================================================================
-- ✅ FIN - Las políticas están configuradas correctamente
-- =====================================================================
