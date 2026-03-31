-- Categorías de gastos por defecto
INSERT INTO public.expense_categories (name, description, icon, is_default) VALUES
  ('Servicios', 'Agua, luz, internet, etc.', 'zap', TRUE),
  ('Insumos', 'Materiales y suministros', 'package', TRUE),
  ('Arriendo', 'Alquiler del local', 'home', TRUE),
  ('Nómina', 'Salarios y pagos a empleados', 'users', TRUE),
  ('Transporte', 'Gastos de movilidad', 'truck', TRUE),
  ('Publicidad', 'Marketing y promoción', 'megaphone', TRUE),
  ('Otros', 'Gastos varios', 'more-horizontal', TRUE)
ON CONFLICT DO NOTHING;

-- Tipos de ingreso por defecto
INSERT INTO public.income_types (name, description, is_default) VALUES
  ('Venta de productos', 'Ingresos por venta de mercancía', TRUE),
  ('Servicios', 'Ingresos por prestación de servicios', TRUE),
  ('Otros ingresos', 'Ingresos varios', TRUE)
ON CONFLICT DO NOTHING;
