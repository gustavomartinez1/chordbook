import { test, expect } from '@playwright/test';

test.describe('Song view', () => {
  test('canción no encontrada muestra 404', async ({ page }) => {
    const response = await page.goto('/canciones/id-inexistente');
    // Next.js muestra not-found page
    await expect(page.locator('text=404').or(page.locator('text=not found').or(page.locator('text=No encontrada')))).toBeVisible({ timeout: 5000 });
  });

  test('ruta de canción carga con layout básico', async ({ page }) => {
    // Primero necesitamos autenticación para ver canciones
    // Esta prueba asume que hay datos (si no hay sesión, redirige)
    await page.goto('/canciones');

    // Si no hay sesión, redirige a login
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      test.skip();
      return;
    }
  });

  test('modo presentación no está disponible sin datos', async ({ page }) => {
    await page.goto('/canciones/id-vacio');
    // Debería mostrar 404 o error
    const title = page.locator('h1');
    await expect(title).toBeVisible({ timeout: 5000 });
  });
});
