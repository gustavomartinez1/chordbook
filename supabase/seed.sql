-- ============================================================
-- SEED DATA: Canciones de ejemplo para CHORDBOOK
-- Nota: Requiere que exista al menos un usuario en auth.users
-- Reemplaza <ADMIN_UUID> con un UUID real de auth.users
-- ============================================================

-- Canción 1: "Sublime Gracia" - John Newton - tono G
INSERT INTO public.cb_canciones (id, titulo, artista, tono_original, tempo, compas, created_by)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Sublime Gracia', 'John Newton', 'G', 70, '4/4', (SELECT id FROM auth.users LIMIT 1))
ON CONFLICT (id) DO NOTHING;

-- Secciones de Sublime Gracia
INSERT INTO public.cb_secciones (id, cancion_id, nombre, orden) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Verso 1', 0),
  ('b1000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Verso 2', 1),
  ('b1000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Coro', 2)
ON CONFLICT (id) DO NOTHING;

-- Líneas de Sublime Gracia
INSERT INTO public.cb_lineas (seccion_id, orden, letra, acordes_raw) VALUES
  ('b1000000-0000-0000-0000-000000000001', 0, 'Sublime gracia que salvó', '1.0.0 4.0.8 5.0.14'),
  ('b1000000-0000-0000-0000-000000000001', 1, 'A un pobre pecador', '1.0.0 4.0.6 5.0.12'),
  ('b1000000-0000-0000-0000-000000000001', 2, 'Fui ciego mas ahora veo', '5.0.0 1.0.8 4.0.16'),
  ('b1000000-0000-0000-0000-000000000001', 3, 'Perdido y Él me encontró', '1.0.0 4.0.8 5.0.14 1.0.22'),
  ('b1000000-0000-0000-0000-000000000002', 0, 'Mi fe perdida restoration', '1.0.0 5.0.8 1.0.14'),
  ('b1000000-0000-0000-0000-000000000002', 1, 'Mi corazón le dio', '4.0.0 5.0.6 1.0.12'),
  ('b1000000-0000-0000-0000-000000000002', 2, 'Su paz y gozo me llenó', '1.0.0 5.0.8 4.0.16'),
  ('b1000000-0000-0000-0000-000000000002', 3, 'Por siempre le amaré', '1.0.0 4.0.8 5.0.14 1.0.22'),
  ('b1000000-0000-0000-0000-000000000003', 0, 'Sublime gracia, dulce son', '4.0.0 5.0.8 1.0.16'),
  ('b1000000-0000-0000-0000-000000000003', 1, 'Que alivia el corazón', '5.0.0 1.0.8 4.0.16'),
  ('b1000000-0000-0000-0000-000000000003', 2, 'Salvado fui por tu amor', '1.0.0 4.0.8 5.0.14'),
  ('b1000000-0000-0000-0000-000000000003', 3, 'Sublime gracia, dulce son', '4.0.0 5.0.8 1.0.16')
ON CONFLICT DO NOTHING;

-- Canción 2: "Cómo No Voy a Cantar" - Danilo Montero - tono A
INSERT INTO public.cb_canciones (id, titulo, artista, tono_original, tempo, compas, created_by)
VALUES
  ('a0000000-0000-0000-0000-000000000002', 'Cómo No Voy a Cantar', 'Danilo Montero', 'A', 80, '4/4', (SELECT id FROM auth.users LIMIT 1))
ON CONFLICT (id) DO NOTHING;

-- Secciones de Cómo No Voy a Cantar
INSERT INTO public.cb_secciones (id, cancion_id, nombre, orden) VALUES
  ('b2000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'Verso', 0),
  ('b2000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'Coro', 1)
ON CONFLICT (id) DO NOTHING;

-- Líneas de Cómo No Voy a Cantar
INSERT INTO public.cb_lineas (seccion_id, orden, letra, acordes_raw) VALUES
  ('b2000000-0000-0000-0000-000000000001', 0, 'Cómo no voy a cantar', '1.0.0 4.0.5 5.0.12'),
  ('b2000000-0000-0000-0000-000000000001', 1, 'Si mi Dios me ha salvado', '1.0.0 5.0.8 4.0.16'),
  ('b2000000-0000-0000-0000-000000000001', 2, 'Cómo no voy a bailar', '1.0.0 4.0.5 5.0.12'),
  ('b2000000-0000-0000-0000-000000000001', 3, 'Si el me ha liberado', '1.0.0 5.0.8 4.0.16'),
  ('b2000000-0000-0000-0000-000000000002', 0, 'Grande es el Señor', '1.0.0 5.0.8 4.0.14'),
  ('b2000000-0000-0000-0000-000000000002', 1, 'Digno de alabar', '1.0.0 5.0.6 4.0.14'),
  ('b2000000-0000-0000-0000-000000000002', 2, 'Grande es el Señor', '1.0.0 5.0.8 4.0.14'),
  ('b2000000-0000-0000-0000-000000000002', 3, 'Por siempre cantaré', '5.0.0 4.0.8 1.0.16')
ON CONFLICT DO NOTHING;
