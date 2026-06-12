# CONTEXT.md — Estado del proyecto

> Generado automáticamente. Actualizar al terminar cada tarea.

## Proyecto
- Nombre: chordbook
- Stack: Next.js 15.5, Supabase, Cloudflare Pages, Tailwind CSS
- Repo: github.com/gustavomartinez1/chordbook
- Deploy URL: pendiente (Cloudflare Pages)
- Rama activa: master

## Último checkpoint git
- Hash: pendiente (sesión de solo auditoría)

## Fase actual
- [ ] Blueprint  - [x] Build  - [ ] Integration  - [ ] Go-Live

## Decisiones tomadas — NO revertir sin preguntar
- 2026-06-11: Se realizó auditoría de seguridad completa. 3 HIGH issues encontrados. Pendiente aprobación de Gus para continuar.

## Bugs resueltos — NO repetir
- (vacío)

## Pendientes
- [ ] HIGH-1: Implementar rate limiting en loginAction (auth)
- [ ] HIGH-2: Reforzar CSP con nonces y directivas faltantes
- [ ] HIGH-3: Agregar HSTS header en middleware.ts
- [ ] MED-1: Mover .admin-uuid.txt a .gitignore
- [ ] MED-2: Simplificar admin check redundante en Server Actions
- [ ] MED-3: Agregar Permissions-Policy y headers cross-origin
- [ ] MED-4: Configurar GitHub Actions + Dependabot
- [ ] MED-5: Corregir fallback de NEXT_PUBLIC_SITE_URL
