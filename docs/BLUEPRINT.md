# Blueprint: CHORDBOOK

## Classification

- **Base:** saas — multi-user app with auth, roles, and content management
- **Modules:** auth (magic link + roles), canciones (CRUD), motor de transposición, modo presentación fullscreen, búsqueda
- **Base de datos:** Supabase Pro — $25/mo
- **Razón de elección:** Requiere auth de usuarios públicos con Magic Link, RLS multi-rol (admin/músico) en todas las tablas, y almacenamiento de datos relacional con secciones/líneas jerárquicas. Cloudflare D1 no tiene RLS nativo ni auth integrada, lo que obligaría a reimplementar ambas cosas desde cero. Supabase Pro entrega auth completo + RLS + storage + edge functions listos.
- **Client tier:** $499/mo (SaaS con auth + CRUD + motor custom)

---

## File Structure

```
apps/chordbook/
├── .github/
│   └── workflows/
│       ├── ci.yml                # Lint, type-check, test
│       └── deploy.yml            # Build + deploy a Cloudflare Pages
│
├── app/
│   ├── (public)/                 # Route group — sin auth requerida
│   │   ├── layout.tsx            # Layout público (header simple, footer)
│   │   ├── page.tsx              # Home: lista de canciones con búsqueda
│   │   └── canciones/
│   │       ├── [id]/
│   │       │   ├── page.tsx      # Vista con selector tonal + acordes transpuestos
│   │       │   └── editar/
│   │       │       └── page.tsx  # Editor de secciones + preview tiempo real
│   │       └── nueva/
│   │           └── page.tsx      # Form crear canción → redirect a /canciones/[id]/editar
│   │
│   ├── (auth)/                   # Route group — auth pages
│   │   ├── login/
│   │   │   └── page.tsx          # Magic link login
│   │   └── confirmar/
│   │       └── page.tsx          # Confirmación de sesión
│   │
│   └── api/
│       └── auth/
│           └── confirm/
│               └── route.ts      # Route handler para confirmación de auth
│
├── features/
│   ├── auth/
│   │   ├── actions/
│   │   │   └── login.ts          # Server Action: enviar magic link
│   │   └── components/
│   │       └── LoginForm.tsx     # Formulario de email + submit
│   │
│   ├── canciones/
│   │   ├── actions/
│   │   │   ├── get-canciones.ts   # Listar con búsqueda + paginación
│   │   │   ├── get-cancion.ts     # Obtener canción con secciones+lineas
│   │   │   ├── create-cancion.ts  # Crear canción
│   │   │   ├── update-cancion.ts  # Actualizar metadata
│   │   │   ├── delete-cancion.ts  # Eliminar (solo admin)
│   │   │   ├── save-seccion.ts    # Crear/actualizar sección
│   │   │   ├── delete-seccion.ts  # Eliminar sección
│   │   │   └── save-linea.ts      # Crear/actualizar línea
│   │   │
│   │   ├── components/
│   │   │   ├── CancionCard.tsx    # Card con título, artista, tono, badge secciones
│   │   │   ├── CancionList.tsx    # Grid de cards con search bar
│   │   │   ├── SearchBar.tsx      # Input de búsqueda con debounce
│   │   │   ├── ToneSelector.tsx   # Dropdown 12 tonos mayores
│   │   │   ├── ChordLine.tsx      # Acordes flotando sobre letra, alineados por posición
│   │   │   ├── SectionBlock.tsx   # Bloque colapsable por sección (nombre + líneas)
│   │   │   ├── SongEditor.tsx     # Editor drag-and-drop de secciones
│   │   │   ├── LineEditor.tsx     # Fila editable: texto + acordes inline
│   │   │   └── PresentationMode.tsx # Fullscreen mode con navegación
│   │   │
│   │   └── types.ts              # Cancion, Seccion, Linea, AcordeRaw
│   │
│   └── transpose/
│       ├── transpose.ts           # Motor de transposición puro (sin React)
│       └── useTranspose.ts        # Hook que transpone al tono seleccionado
│
├── shared/
│   ├── components/
│   │   └── ui/
│   │       ├── Button.tsx         # shadcn button
│   │       ├── Input.tsx          # shadcn input
│   │       ├── Select.tsx         # shadcn select
│   │       ├── Card.tsx           # shadcn card
│   │       ├── Badge.tsx          # shadcn badge
│   │       ├── Dialog.tsx         # shadcn dialog
│   │       ├── DropdownMenu.tsx   # shadcn dropdown
│   │       ├── Skeleton.tsx       # shadcn skeleton
│   │       ├── Toast.tsx          # shadcn toast
│   │       └── Icons.tsx          # Iconos Lucide
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts         # Browser client (singleton)
│   │   │   └── server.ts         # Server client (createServerClient)
│   │   └── utils.ts              # cn(), formatDate(), etc.
│   │
│   ├── hooks/
│   │   └── useDebounce.ts        # Debounce para búsqueda
│   │
│   └── types/
│       └── supabase.ts           # Tipos generados de Supabase
│
├── widgets/
│   ├── header.tsx                 # Navbar con logo + user menu
│   └── footer.tsx                 # Footer simple
│
├── config/
│   ├── env.ts                    # Validación de env vars (Zod/t3-env)
│   └── constants.ts              # TONOS, MODIFICADORES, etc.
│
├── supabase/
│   ├── migrations/               # Migraciones versionadas
│   │   └── 001_initial_schema.sql
│   └── seed.sql                  # Datos de ejemplo
│
├── middleware.ts                 # Auth check + security headers
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── components.json               # shadcn config
├── .env.example
├── .eslintrc.json
├── vitest.config.ts
└── playwright.config.ts
```

---

## Database Schema

### Tablas (prefijo `cb_`)

```sql
-- Extensión para UUID gen
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. cb_roles — Roles de usuario (admin | musico)
-- ============================================================
CREATE TABLE cb_roles (
  id      uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rol     text NOT NULL CHECK (rol IN ('admin', 'musico')),
  UNIQUE(user_id)
);

-- ============================================================
-- 2. cb_canciones — Catálogo de canciones
-- ============================================================
CREATE TABLE cb_canciones (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo      text NOT NULL,
  artista     text DEFAULT '',
  tono_original text NOT NULL DEFAULT 'C',   -- C, G, D, A, E, B, F#, C#, F, Bb, Eb, Ab
  tempo       integer,                        -- BPM (opcional)
  compas      text DEFAULT '4/4',             -- 4/4, 3/4, 6/8, etc.
  notas       text DEFAULT '',                -- Notas adicionales (opcional)
  created_by  uuid NOT NULL REFERENCES auth.users(id),
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- ============================================================
-- 3. cb_secciones — Agrupación de líneas (Intro, Verso, Coro, etc.)
-- ============================================================
CREATE TABLE cb_secciones (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  cancion_id uuid NOT NULL REFERENCES cb_canciones(id) ON DELETE CASCADE,
  nombre     text NOT NULL,                    -- Intro, Verso, Coro, Puente, Outro
  orden      integer NOT NULL DEFAULT 0
);

CREATE INDEX idx_secciones_cancion ON cb_secciones(cancion_id, orden);

-- ============================================================
-- 4. cb_lineas — Cada línea con letra + acordes en sistema numérico
-- ============================================================
CREATE TABLE cb_lineas (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  seccion_id  uuid NOT NULL REFERENCES cb_secciones(id) ON DELETE CASCADE,
  orden       integer NOT NULL DEFAULT 0,
  letra       text DEFAULT '',                 -- Letra de la línea (puede ser vacía)
  acordes_raw text DEFAULT ''                  -- Formato: "GRADO.MODIFICADOR.POSICION"
);

CREATE INDEX idx_lineas_seccion ON cb_lineas(seccion_id, orden);
```

### Formato `acordes_raw`

Cada acorde se codifica como: `GRADO.MODIFICADOR.POSICION`

| Componente | Valores | Descripción |
|-----------|---------|-------------|
| GRADO | 1-7 | Grado de la escala (I-VII) |
| MODIFICADOR | 0=none, 1=m, 2=dim, 3=aug, 4=7, 5=m7, 6=M7, 7=sus4, 8=add9, etc. | Tipo de acorde |
| POSICION | 0-∞ | Posición en caracteres desde inicio de línea |

Ejemplo: `"1.0.0 4.0.8 5.0.14"` → I (en pos 0), IV (en pos 8), V (en pos 14) en tono original.

### Seed Data

```sql
-- Admin por defecto (crear después de registrar usuario con email admin@iglesia.com)
INSERT INTO cb_roles (user_id, rol)
VALUES ('<UUID_DEL_ADMIN>', 'admin');

-- Canción 1: "Grande es tu fidelidad"
INSERT INTO cb_canciones (id, titulo, artista, tono_original, tempo, compas, created_by)
VALUES ('a0000000-0000-0000-0000-000000000001', 'Grande es tu fidelidad', 'Himno Clásico', 'G', 70, '4/4', '<UUID_DEL_ADMIN>');

-- Secciones
INSERT INTO cb_secciones (id, cancion_id, nombre, orden) VALUES
('b1000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Intro', 0),
('b1000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Verso', 1),
('b1000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Coro', 2);

-- Intro (instrumental — sin letra, solo acordes)
INSERT INTO cb_lineas (seccion_id, orden, letra, acordes_raw) VALUES
('b1000000-0000-0000-0000-000000000001', 0, '', '1.0.0 4.0.6 5.0.12 1.0.18');

-- Verso
INSERT INTO cb_lineas (seccion_id, orden, letra, acordes_raw) VALUES
('b1000000-0000-0000-0000-000000000002', 0, 'Grande es tu fidelidad, oh Dios', '1.0.0 4.0.10 1.0.20'),
('b1000000-0000-0000-0000-000000000002', 1, 'Mi Padre eterno en Ti encuentro paz', '5.0.0 1.0.12 4.0.20'),
('b1000000-0000-0000-0000-000000000002', 2, 'Grande es tu fidelidad, Señor', '1.0.0 4.0.10 1.0.20');

-- Coro
INSERT INTO cb_lineas (seccion_id, orden, letra, acordes_raw) VALUES
('b1000000-0000-0000-0000-000000000003', 0, 'Grande es tu fidelidad', '1.0.0 4.0.8 1.0.16'),
('b1000000-0000-0000-0000-000000000003', 1, 'Grande es tu fidelidad', '5.0.0 1.0.8 4.0.16'),
('b1000000-0000-0000-0000-000000000003', 2, 'Cada mañana nueva es', '1.0.0 4.0.8 5.0.16 1.0.22');

-- Canción 2: "Aquí estoy"
INSERT INTO cb_canciones (id, titulo, artista, tono_original, tempo, compas, created_by)
VALUES ('a0000000-0000-0000-0000-000000000002', 'Aquí estoy', 'Generación 12', 'D', 75, '4/4', '<UUID_DEL_ADMIN>');

INSERT INTO cb_secciones (id, cancion_id, nombre, orden) VALUES
('b2000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'Verso', 0),
('b2000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'Coro', 1);

INSERT INTO cb_lineas (seccion_id, orden, letra, acordes_raw) VALUES
('b2000000-0000-0000-0000-000000000001', 0, 'Aquí estoy, rendido ante Ti', '1.0.0 4.0.10 5.0.20'),
('b2000000-0000-0000-0000-000000000001', 1, 'Mi corazón te adora, Dios', '1.0.0 5.0.10 4.0.20'),
('b2000000-0000-0000-0000-000000000002', 0, 'Te amo, te adoro, Jesús', '1.0.0 5.0.8 4.0.16 1.0.22'),
('b2000000-0000-0000-0000-000000000002', 1, 'Eres todo para mí', '5.0.0 1.0.8 4.0.16');
```

### RLS Policies

```sql
-- ============================================================
-- cb_roles (solo lectura para músicos, CRUD para admin)
-- ============================================================
ALTER TABLE cb_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "roles_select_own" ON cb_roles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "roles_all_admin" ON cb_roles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM cb_roles WHERE user_id = auth.uid() AND rol = 'admin')
  );

-- ============================================================
-- cb_canciones
-- ============================================================
ALTER TABLE cb_canciones ENABLE ROW LEVEL SECURITY;

-- Todos los usuarios autenticados pueden leer
CREATE POLICY "canciones_select_auth" ON cb_canciones
  FOR SELECT USING (auth.role() = 'authenticated');

-- Solo admins pueden insert/update/delete
CREATE POLICY "canciones_insert_admin" ON cb_canciones
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM cb_roles WHERE user_id = auth.uid() AND rol = 'admin')
  );

CREATE POLICY "canciones_update_admin" ON cb_canciones
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM cb_roles WHERE user_id = auth.uid() AND rol = 'admin')
  );

CREATE POLICY "canciones_delete_admin" ON cb_canciones
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM cb_roles WHERE user_id = auth.uid() AND rol = 'admin')
  );

-- ============================================================
-- cb_secciones — hereda permisos de la canción padre
-- ============================================================
ALTER TABLE cb_secciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "secciones_select_auth" ON cb_secciones
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "secciones_insert_admin" ON cb_secciones
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM cb_roles WHERE user_id = auth.uid() AND rol = 'admin')
  );

CREATE POLICY "secciones_update_admin" ON cb_secciones
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM cb_roles WHERE user_id = auth.uid() AND rol = 'admin')
  );

CREATE POLICY "secciones_delete_admin" ON cb_secciones
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM cb_roles WHERE user_id = auth.uid() AND rol = 'admin')
  );

-- ============================================================
-- cb_lineas — hereda permisos de la sección padre
-- ============================================================
ALTER TABLE cb_lineas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lineas_select_auth" ON cb_lineas
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "lineas_insert_admin" ON cb_lineas
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM cb_roles WHERE user_id = auth.uid() AND rol = 'admin')
  );

CREATE POLICY "lineas_update_admin" ON cb_lineas
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM cb_roles WHERE user_id = auth.uid() AND rol = 'admin')
  );

CREATE POLICY "lineas_delete_admin" ON cb_lineas
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM cb_roles WHERE user_id = auth.uid() AND rol = 'admin')
  );
```

---

## Motor de Transposición

### Algoritmo (puro, sin dependencias)

Archivo: `features/transpose/transpose.ts`

```typescript
// Los 12 tonos mayores en orden de quintas (círculo cromático)
const TONOS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'F', 'Bb', 'Eb', 'Ab'];

// Grados de la escala mayor (I-VII) mapeados a índices del círculo cromático
const GRADOS = [0, 2, 4, 5, 7, 9, 11]; // I=0, II=2, III=4, IV=5, V=7, VI=9, VII=11

interface AcordeRaw {
  grado: number;       // 1-7
  modificador: number; // 0=none, 1=m, 2=dim, etc.
  posicion: number;    // offset en caracteres
}

// Parsear "1.0.0 4.0.8 5.0.14" → AcordeRaw[]
function parseAcordes(raw: string): AcordeRaw[] { ... }

// Transponer un acorde de tono_origen a tono_destino
function transponer(acorde: AcordeRaw, tonoOrigen: string, tonoDestino: string): string { ... }

// Función principal
function transponerLinea(acordesRaw: string, tonoOrigen: string, tonoDestino: string): string { ... }
```

### Hook useTranspose

```typescript
// features/transpose/useTranspose.ts
function useTranspose(tonoOriginal: string) {
  const [tonoSeleccionado, setTono] = useState(tonoOriginal);

  const transponer = useCallback((acordesRaw: string) => {
    if (tonoSeleccionado === tonoOriginal) return acordesRaw;
    return transposeLinea(acordesRaw, tonoOriginal, tonoSeleccionado);
  }, [tonoOriginal, tonoSeleccionado]);

  return { tonoSeleccionado, setTono, transponer };
}
```

---

## Pages/Routes

| Ruta | Tipo | Estrategia | Descripción |
|------|------|-----------|-------------|
| `/` | Page | SSR (Server Component) | Lista de canciones con búsqueda, grid de CancionCard |
| `/login` | Page | SSG | Formulario Magic Link |
| `/canciones/nueva` | Page | SSR | Form crear canción → redirect a editor |
| `/canciones/[id]` | Page | SSR | Vista con ToneSelector, secciones colapsables con acordes transpuestos |
| `/canciones/[id]/editar` | Page | SSR | Editor completo: drag secciones, editar líneas, preview tiempo real |
| `/api/auth/confirm` | Route handler | Edge | Callback de confirmación Supabase Auth |

### Estrategia de renderizado

- **Home (`/`)**: SSR con Server Component que consulta Supabase. Search bar es Client Component con `useDebounce`.
- **Vista canción (`/canciones/[id]`)**: SSR para datos base. ToneSelector es Client Component. El hook `useTranspose` re-renderiza solo los acordes al cambiar tono.
- **Editor (`/canciones/[id]/editar`)**: Client Component pesado. Carga datos vía Server Action inicial, luego todo el estado es local.
- **Login (`/login`)**: SSG estático. El form es Client Component.

---

## API Endpoints

### Server Actions (en `features/canciones/actions/`)

| Acción | Método | Input | Output | Auth |
|--------|--------|-------|--------|------|
| `get-canciones` | `use server` | `{ busqueda?, page?, limit? }` | `{ canciones[], total }` | Auth required |
| `get-cancion` | `use server` | `{ id }` | `CancionConSecciones` | Auth required |
| `create-cancion` | `use server` | `{ titulo, artista, tono_original, ... }` | `{ id }` | Admin only |
| `update-cancion` | `use server` | `{ id, ... }` | `void` | Admin only |
| `delete-cancion` | `use server` | `{ id }` | `void` | Admin only |
| `save-linea` | `use server` | `{ seccion_id, orden, letra, acordes_raw }` | `{ id }` | Admin only |
| `delete-linea` | `use server` | `{ id }` | `void` | Admin only |

### Route Handlers

| Ruta | Método | Propósito |
|------|--------|-----------|
| `/api/auth/confirm` | GET | Callback Supabase Auth — confirma sesión Magic Link |

No se exponen endpoints REST públicos. Toda la lógica de negocio va por Server Actions.

---

## External Integrations

| Servicio | Uso | Costo |
|----------|-----|-------|
| Supabase | Auth (Magic Link), DB PostgreSQL, RLS | $25/mo |
| Cloudflare Pages | Hosting estático + deploy | $0/mo (plan free) |
| GitHub Actions | CI/CD pipeline | $0/mo (público) |
| Resend | Emails transaccionales (confirmación Magic Link) | $0/mo (100 emails/día free) |

- **Supabase SMTP**: Configurar SMTP de Resend para los Magic Links en producción (los emails default de Supabase tienen rate limiting bajo).
- **No requiere**: Stripe, Redis, n8n, ni servicios adicionales en MVP.

---

## n8n Workflows

Ninguno en esta fase. En futuras iteraciones:
- **Workflow de notificación**: Cuando un admin crea/edita una canción, notificar por WhatsApp a los músicos del equipo.
- **Workflow de respaldo semanal**: Exportar canciones a Google Sheets como backup.

---

## Security Requirements

### RLS (ya documentado en esquema)

- RLS en 100% de las tablas públicas (`cb_canciones`, `cb_secciones`, `cb_lineas`, `cb_roles`)
- Lectura permitida para cualquier usuario autenticado
- Escritura restringida a rol `admin`
- `cb_roles`: cada usuario solo ve su propio rol (no hay lista pública de admins)

### API/Security Headers (middleware.ts)

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // CSP básico (ajustar según necesidades)
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://*.supabase.co"
  );

  // Auth check — proteger rutas de edición
  const session = request.cookies.get('sb-access-token');
  if (!session && request.nextUrl.pathname.startsWith('/canciones/nueva')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (!session && request.nextUrl.pathname.includes('/editar')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

### Otras medidas

- **Server Actions**: Validación Zod estricta en todas las acciones (nunca confiar en el cliente)
- **Rate limiting**: Supabase maneja rate limiting en auth endpoints. Para Server Actions se puede añadir Upstash Redis en futura iteración si hay abuso.
- **Supabase anon key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY` va en el frontend, pero RLS impide cualquier acción no autorizada.
- **service_role key**: Solo en CI/CD y migraciones. Nunca en el frontend.

---

## SEO Plan

| Elemento | Implementación |
|----------|---------------|
| Metadata dinámica | `generateMetadata()` en cada página — título, descripción, Open Graph |
| JSON-LD | Schema `MusicGroup` + `MusicRecording` para motores de búsqueda |
| Sitemap | `app/sitemap.ts` — generado dinámicamente (todas las canciones) |
| Robots.txt | `app/robots.ts` — permitir todo, apuntar a sitemap |
| Viewport | `viewport` export en layout (responsive, initial-scale=1) |
| Etiquetas meta | Description, keywords (música iglesia, sistema numérico, acordes) |
| Open Graph | `og:title`, `og:description`, `og:type=music.song` por cada canción |
| Canonical | URL canónica en cada página |
| Favicon | favicon.ico + apple-touch-icon |
| 404 | `not-found.tsx` personalizado |

### JSON-LD para cada canción
```typescript
// app/canciones/[id]/page.tsx
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'MusicRecording',
  name: cancion.titulo,
  byArtist: { '@type': 'MusicGroup', name: cancion.artista },
  inLanguage: 'es',
};
```

---

## Testing Plan

### Unit Tests (Vitest)

| Archivo | Pruebas |
|---------|---------|
| `features/transpose/transpose.test.ts` | Parseo de acordes_raw, transposición de todos los grados en los 12 tonos, edge cases (acordes vacíos, modificadores), idempotencia (C→C = sin cambios) |
| `shared/lib/utils.test.ts` | `cn()` merge de clases, formato de fechas |

### E2E Tests (Playwright)

| Flujo | Descripción |
|-------|-------------|
| Login Magic Link | Navegar a /login, ingresar email, ver confirmación, abrir magic link |
| Home + búsqueda | Ver lista de canciones, buscar por título, ver resultados filtrados |
| Vista canción + transposición | Abrir canción, cambiar tono a D, verificar que acordes se actualizan |
| Modo presentación | Click en fullscreen, navegar secciones, salir de fullscreen |
| CRUD admin | Crear canción nueva, agregar sección, agregar línea con acordes, editar, eliminar |
| Seguridad roles | Usuario músico no puede ver botón de editar ni acceder a /editar |

### Pruebas de regresión visual

- `@playwright/test` con snapshot testing para componentes críticos: ChordLine, ToneSelector, CancionCard
- Ejecutar en CI en los 3 navegadores (Chromium, Firefox, WebKit)

---

## Execution Order

### 1. `/agent backend` — Infraestructura + DB + Server Actions
- Crear proyecto Next.js 15 con `create-next-app`
- Configurar Supabase: proyecto, schema SQL (migración 001_initial_schema.sql), RLS policies, seed.sql
- Configurar Supabase client (shared/lib/supabase/client.ts + server.ts)
- Implementar `middleware.ts` con auth check + security headers
- Validar env vars con t3-env (config/env.ts)
- Implementar Server Actions: get-canciones, get-cancion, create-cancion, update-cancion, delete-cancion, save-seccion, delete-seccion, save-linea, delete-linea
- Configurar auth Magic Link + callback route handler
- Configurar SMTP Resend para emails de auth
- Estimar: ~8 requests LLM

### 2. `/agent frontend` — UI + Componentes + Páginas
- Configurar Tailwind CSS + shadcn/ui + componentes base
- Implementar layout público + widgets (header, footer)
- Implementar `features/auth/components/LoginForm.tsx`
- Implementar Home (`/`): CancionList, CancionCard, SearchBar con useDebounce
- Implementar motor de transposición puro (`features/transpose/transpose.ts`)
- Implementar hook `useTranspose`
- Implementar `features/canciones/components/ChordLine.tsx` — acordes flotando sobre letra
- Implementar `features/canciones/components/SectionBlock.tsx` — sección colapsable
- Implementar `features/canciones/components/ToneSelector.tsx` — dropdown 12 tonos
- Implementar vista canción (`/canciones/[id]`) con transposición reactiva
- Implementar modo presentación (PresentationMode.tsx)
- Implementar form crear canción (`/canciones/nueva`)
- Implementar editor completo (`/canciones/[id]/editar`): SongEditor, LineEditor, drag-and-drop
- Implementar SEO: generateMetadata, JSON-LD, sitemap, robots
- Estimar: ~12 requests LLM

### 3. `/agent security` — Auditoría OWASP
- Ejecutar Supabase Advisor (seguridad + performance)
- Verificar RLS en todas las tablas
- Verificar CSP headers en middleware
- Verificar validación Zod en todas las Server Actions
- Verificar que service_role key no está en frontend
- Verificar rate limiting en auth endpoints
- Estimar: ~2 requests LLM

### 4. `/agent legal` — Documentos legales
- Generar Términos y Condiciones (jurisdicción México + USA)
- Generar Política de Privacidad (LFPDPPP + GDPR si aplica)
- Generar Aviso de Cookies
- Estimar: ~1 request LLM

### 5. `/agent qa` — Tests E2E + Unit
- Escribir tests unitarios para motor de transposición (Vitest)
- Escribir tests unitarios para utils
- Configurar Playwright
- Escribir tests E2E: login, home, vista canción, transposición, CRUD admin, seguridad roles
- Configurar CI (ci.yml): lint → type-check → test → build
- Estimar: ~5 requests LLM

### 6. `/agent devops` — CI/CD + Deploy Cloudflare Pages
- Configurar GitHub Actions: deploy.yml (build + wrangler deploy)
- Configurar Cloudflare Pages project
- Configurar env vars en Cloudflare Dashboard (SUPABASE_URL, SUPABASE_ANON_KEY, etc.)
- Configurar dominio personalizado (si aplica)
- Verificar deploy exitoso
- Estimar: ~2 requests LLM

---

## Estimated Effort

| Recurso | Cantidad |
|---------|----------|
| Requests to LLM | ~30 |
| Estimated cost (LLM) | ~$15-25 USD |
| Tiempo estimado | 3-5 días hábiles |

### Detalle de requests por agente

| Agente | Requests | Costo estimado |
|--------|----------|----------------|
| Backend | 8 | $4-6 |
| Frontend | 12 | $6-10 |
| Security | 2 | $1-2 |
| Legal | 1 | $0.50-1 |
| QA | 5 | $2.50-4 |
| DevOps | 2 | $1-2 |
| **Total** | **~30** | **$15-25** |

---

## Notas Adicionales

### Estado del Proyecto
- **Fase:** Blueprint ✅
- **Próximo paso:** Ejecutar agente Backend (Paso 1 del Execution Order)
- **Repo:** `github.com/gustavomartinez1/chordbook` (pendiente de crear)

### Stack Completo
```
Next.js 15 (App Router) + TypeScript + Tailwind CSS v4
Supabase (Auth + PostgreSQL + RLS) → $25/mo
Cloudflare Pages (Static Export) → $0/mo
shadcn/ui (Componentes base)
Vitest + Playwright (Tests)
GitHub Actions (CI/CD)
Resend (Emails Magic Link) → $0/mo (fase inicial)
```

### Glosario
| Término | Definición |
|---------|------------|
| Sistema Numérico | Notación musical que usa grados (I-VII) en lugar de nombres de acordes (C, G, etc.) |
| Grado | Posición del acorde en la escala (1=I, 2=II, ..., 7=VII) |
| Modificador | Tipo de acorde (mayor, menor, séptima, etc.) |
| Transposición | Cambio de tonalidad manteniendo relaciones entre acordes |
| acordes_raw | Formato interno "GRADO.MODIFICADOR.POSICION" para almacenar acordes |
