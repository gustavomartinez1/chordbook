import { test, expect } from '@playwright/test';

test.describe('Admin (opcional)', () => {
  test('ruta /canciones/nueva redirige a login sin sesión', async ({ page }) => {
    await page.goto('/canciones/nueva');
    // Sin autenticación, debe redirigir al login
    await expect(page).toHaveURL(/login/, { timeout: 5000 });
  });

  test('ruta /canciones/id/editar redirige a login sin sesión', async ({ page }) => {
    await page.goto('/canciones/abc/editar');
    // Sin autenticación, debe redirigir al login
    await expect(page).toHaveURL(/login/, { timeout: 5000 });
  });
});
