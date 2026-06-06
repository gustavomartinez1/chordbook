-- ============================================================
-- MIGRATION 001: Initial Schema for CHORDBOOK
-- Tablas con prefijo cb_ para no interferir con Cultura Kids
-- ============================================================

-- Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- Helper function: requesting_user_id()
-- Cached STABLE function para usar en RLS policies
-- ============================================================
CREATE OR REPLACE FUNCTION public.requesting_user_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER
AS $$ SELECT auth.uid() $$;

-- ============================================================
-- 1. cb_roles — Roles de usuario (admin | musico)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.cb_roles (
  id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rol     text NOT NULL CHECK (rol IN ('admin', 'musico')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.cb_roles ENABLE ROW LEVEL SECURITY;

-- Cada usuario ve su propio rol
CREATE POLICY "roles_select_own" ON public.cb_roles
  FOR SELECT USING (user_id = requesting_user_id());

-- Solo admins pueden insertar/modificar roles
CREATE POLICY "roles_insert_admin" ON public.cb_roles
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.cb_roles WHERE user_id = requesting_user_id() AND rol = 'admin')
  );

CREATE POLICY "roles_update_admin" ON public.cb_roles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.cb_roles WHERE user_id = requesting_user_id() AND rol = 'admin')
  );

CREATE POLICY "roles_delete_admin" ON public.cb_roles
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.cb_roles WHERE user_id = requesting_user_id() AND rol = 'admin')
  );

-- ============================================================
-- 2. cb_canciones — Catálogo de canciones
-- ============================================================
CREATE TABLE IF NOT EXISTS public.cb_canciones (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo        text NOT NULL,
  artista       text DEFAULT '',
  tono_original text NOT NULL DEFAULT 'C',
  tempo         integer,
  compas        text DEFAULT '4/4',
  notas         text DEFAULT '',
  created_by    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

ALTER TABLE public.cb_canciones ENABLE ROW LEVEL SECURITY;

-- Todos los usuarios autenticados pueden leer
CREATE POLICY "canciones_select_auth" ON public.cb_canciones
  FOR SELECT USING (auth.role() = 'authenticated');

-- Solo admins pueden insertar
CREATE POLICY "canciones_insert_admin" ON public.cb_canciones
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.cb_roles WHERE user_id = requesting_user_id() AND rol = 'admin')
  );

CREATE POLICY "canciones_update_admin" ON public.cb_canciones
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.cb_roles WHERE user_id = requesting_user_id() AND rol = 'admin')
  );

CREATE POLICY "canciones_delete_admin" ON public.cb_canciones
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.cb_roles WHERE user_id = requesting_user_id() AND rol = 'admin')
  );

-- Index para búsqueda por título
CREATE INDEX IF NOT EXISTS idx_cb_canciones_titulo ON public.cb_canciones USING gin (titulo gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_cb_canciones_artista ON public.cb_canciones USING gin (artista gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_cb_canciones_created_by ON public.cb_canciones(created_by);

-- ============================================================
-- 3. cb_secciones — Agrupación de líneas (Intro, Verso, Coro, etc.)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.cb_secciones (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cancion_id uuid NOT NULL REFERENCES public.cb_canciones(id) ON DELETE CASCADE,
  nombre     text NOT NULL,
  orden      integer NOT NULL DEFAULT 0
);

ALTER TABLE public.cb_secciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "secciones_select_auth" ON public.cb_secciones
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "secciones_insert_admin" ON public.cb_secciones
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.cb_roles WHERE user_id = requesting_user_id() AND rol = 'admin')
  );

CREATE POLICY "secciones_update_admin" ON public.cb_secciones
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.cb_roles WHERE user_id = requesting_user_id() AND rol = 'admin')
  );

CREATE POLICY "secciones_delete_admin" ON public.cb_secciones
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.cb_roles WHERE user_id = requesting_user_id() AND rol = 'admin')
  );

CREATE INDEX IF NOT EXISTS idx_cb_secciones_cancion ON public.cb_secciones(cancion_id, orden);

-- ============================================================
-- 4. cb_lineas — Cada línea con letra + acordes en sistema numérico
-- ============================================================
CREATE TABLE IF NOT EXISTS public.cb_lineas (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seccion_id  uuid NOT NULL REFERENCES public.cb_secciones(id) ON DELETE CASCADE,
  orden       integer NOT NULL DEFAULT 0,
  letra       text DEFAULT '',
  acordes_raw text DEFAULT ''
);

ALTER TABLE public.cb_lineas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lineas_select_auth" ON public.cb_lineas
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "lineas_insert_admin" ON public.cb_lineas
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.cb_roles WHERE user_id = requesting_user_id() AND rol = 'admin')
  );

CREATE POLICY "lineas_update_admin" ON public.cb_lineas
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.cb_roles WHERE user_id = requesting_user_id() AND rol = 'admin')
  );

CREATE POLICY "lineas_delete_admin" ON public.cb_lineas
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.cb_roles WHERE user_id = requesting_user_id() AND rol = 'admin')
  );

CREATE INDEX IF NOT EXISTS idx_cb_lineas_seccion ON public.cb_lineas(seccion_id, orden);
