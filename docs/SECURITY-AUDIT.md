# 🔒 Auditoría de Seguridad — CHORDBOOK

**Fecha:** 2026-06-11
**Auditor:** Security Agent (Veltrux)
**Proyecto:** CHORDBOOK v0.1.0
**Stack:** Next.js 15.5 + Supabase + Cloudflare Pages

---

## Resumen Ejecutivo

| Categoría | Cantidad |
|-----------|----------|
| 🔴 CRITICAL | 0 |
| 🟠 HIGH | 3 |
| 🟡 MEDIUM | 5 |
| 🔵 LOW | 2 |

**Veredicto: APROBADO CON RIESGOS**

Se encontraron 3 issues HIGH y 5 MEDIUM. Deben resolverse antes del deploy a producción.

---

## 🔴 CRÍTICAS (0) — Ejecución de código / Control total

| # | Vulnerabilidad | Estado | Evidencia |
|---|----------------|--------|-----------|
| 1 | SQL Injection | ✅ No vulnerable | Supabase SDK con prepared statements en todas las queries. Sin `.rpc()` con strings crudos. Sin raw SQL. |
| 2 | NoSQL Injection | ✅ No aplica | No hay MongoDB ni Redis en el stack. |
| 3 | Command Injection | ✅ No vulnerable | Sin `exec()`, `spawn()`, `eval()`. Cloudflare Pages elimina acceso shell. |
| 4 | SSTI | ✅ No vulnerable | React Server Components nativos. Sin templates dinámicos. |
| 5 | Insecure Deserialization | ✅ No vulnerable | Zod validation en todos los inputs. Sin serialización binaria. |

---

## 🟠 ALTOS (3) — Deben resolverse antes del deploy

### HIGH-1: Falta rate limiting en auth (Brute Force / Email Spam)

**Archivo:** `src/features/auth/actions/login.ts`
**Severidad:** HIGH
**Categoría:** #16 Brute Force & Credential Stuffing

**Problema:**
El endpoint `loginAction` usa `supabase.auth.signInWithOtp()` sin ningún rate limiting. Un atacante puede:
- Enviar cientos de emails OTP a una misma dirección (email bombing)
- Probar múltiples direcciones de email para enumeración de usuarios
- Generar costos de infraestructura (emails transaccionales)

**Evidencia:**
```typescript
export async function loginAction(formData: FormData) {
  // No hay rate limiting
  // No hay CAPTCHA
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
  });
}
```

**Solución:**
- Implementar rate limiting con Upstash Redis
- Agregar CAPTCHA (Cloudflare Turnstile es gratis)
- Límite: 5 intentos por IP cada 15 minutos

---

### HIGH-2: CSP con `unsafe-inline` y `unsafe-eval` — Sin nonce

**Archivo:** `src/middleware.ts` línea 16
**Severidad:** HIGH
**Categoría:** #6 XSS, #26 Clickjacking

**Problema:**
La CSP actual usa `'unsafe-inline'` y `'unsafe-eval'` en `script-src`, lo que debilita la protección contra XSS. Además faltan directivas clave.

**Evidencia:**
```typescript
"script-src 'self' 'unsafe-inline' 'unsafe-eval'"
```

Directivas faltantes: `frame-ancestors 'none'`, `base-uri 'self'`, `form-action 'self'`

**Solución:**
- Implementar nonce-based CSP para scripts
- Eliminar `unsafe-inline` y `unsafe-eval` si es posible
- Agregar `frame-ancestors 'none'`, `base-uri 'self'`, `form-action 'self'`

---

### HIGH-3: Falta HSTS (HTTP Strict Transport Security)

**Archivo:** `src/middleware.ts`
**Severidad:** HIGH
**Categoría:** #17 Session Hijacking, #27 Security Misconfiguration

**Problema:**
No se configura `Strict-Transport-Security`. Sin HSTS, un atacante en redes WiFi públicas puede interceptar la primera solicitud HTTP (SSL stripping).

**Solución:**
```typescript
response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
```

---

## 🟡 MEDIOS (5) — Resolver en este sprint

### MED-1: `.admin-uuid.txt` trackeado en git

**Archivo:** `.admin-uuid.txt`
**Severidad:** MEDIUM | **Categoría:** #19 Sensitive Data Exposure

**Problema:** UUID de admin (`79761aae-4429-460b-aa9d-4faf93a457bd`) trackeado en git.

**Solución:** Agregar `.admin-uuid.txt` a `.gitignore` y limpiar del historial.

---

### MED-2: Race condition en admin check + delete

**Archivos:** `deleteCancion.ts`, `deleteSeccion.ts`, `deleteLinea.ts`
**Severidad:** MEDIUM | **Categoría:** #15 Race Conditions

**Problema:** Verificación de admin en query separada antes de ejecutar acción. Entre la verificación y la acción, el rol podría cambiar.

**Mitigación:** RLS ya protege todas las tablas — incluso si el Server Action se bypassea, RLS bloquea la operación para no-admins.

**Solución:** Confiar en RLS como defensa primaria; simplificar el código.

---

### MED-3: Security Headers faltantes

**Archivo:** `src/middleware.ts`
**Severidad:** MEDIUM | **Categoría:** #27 Security Misconfiguration

Headers faltantes:
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Resource-Policy: same-origin`

---

### MED-4: Sin CI/CD security scanning

**Archivo:** No existe `.github/`
**Severidad:** MEDIUM | **Categoría:** #24 Supply Chain

Sin GitHub Actions, Dependabot, CodeQL, ni TruffleHog.

**Solución:** Crear pipeline con `npm audit`, Dependabot, y TruffleHog.

---

### MED-5: NEXT_PUBLIC_SITE_URL apunta a Vercel

**Archivo:** `src/app/layout.tsx` línea 62
**Severidad:** MEDIUM | **Categoría:** #25 Configuración

```typescript
url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://chordbook.vercel.app'
```
El fallback debe ser el dominio de Cloudflare Pages, no Vercel.

---

## 🔵 BAJOS (2) — Recomendados

### LOW-1: Seed.sql sin verificación de existencia de admin
`supabase/seed.sql` usa `(SELECT id FROM auth.users LIMIT 1)` sin verificar si hay usuarios.

### LOW-2: SameSite='lax' en cookie de auth confirm
`src/app/auth/confirm/route.ts` — la cookie `sb-access-token` usa `sameSite: 'lax'` en vez de `strict`.

---

## Checklist de RLS — Tablas cb_*

| Tabla | RLS | SELECT | INSERT | UPDATE | DELETE | requesting_user_id() |
|-------|-----|--------|--------|--------|--------|---------------------|
| cb_roles | ✅ | roles_select_own | roles_insert_admin | roles_update_admin | roles_delete_admin | ✅ |
| cb_canciones | ✅ | canciones_select_auth | canciones_insert_admin | canciones_update_admin | canciones_delete_admin | ✅ |
| cb_secciones | ✅ | secciones_select_auth | secciones_insert_admin | secciones_update_admin | secciones_delete_admin | ✅ |
| cb_lineas | ✅ | lineas_select_auth | lineas_insert_admin | lineas_update_admin | lineas_delete_admin | ✅ |

**Colisión con Cultura Kids:** ✅ No hay colisión — tablas Cultura Kids (`asistencia`, `ninos`, `maestros`, `puntos`, `puntos_log`, `rsvp_responses`, `sesiones`) no intersectan con `cb_*`.

---

## Checklist Server Actions

13 Server Actions auditadas: ✅ 100% con Zod validation, ✅ 100% con auth check (donde aplica), ✅ Sin SQL injection, ✅ Sin secrets expuestos.

---

## Veredicto Final

```
┌──────────────────────────────────────────┐
│        AUDITORÍA DE SEGURIDAD            │
├──────────────────────────────────────────┤
│  🔴 CRITICAL:  0                         │
│  🟠 HIGH:      3                         │
│  🟡 MEDIUM:    5                         │
│  🔵 LOW:       2                         │
├──────────────────────────────────────────┤
│  VEREDICTO: APROBADO CON RIESGOS         │
│                                          │
│  ⛔ No avanzar a QA/DevOps hasta         │
│     resolver los 3 HIGH issues           │
│                                          │
│  Pendiente: aprobación de Gus para       │
│  continuar con riesgos aceptados         │
└──────────────────────────────────────────┘
```
