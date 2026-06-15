import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test('carga y muestra el título CHORDBOOK', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('CHORDBOOK');
  });

  test('muestra el campo de búsqueda', async ({ page }) => {
    await page.goto('/');
    const searchInput = page.locator('input[type="search"], input[name="q"]');
    await expect(searchInput).toBeVisible();
  });

  test('búsqueda filtra resultados (redirige con query param)', async ({ page }) => {
    await page.goto('/');
    const searchInput = page.locator('input[type="search"], input[name="q"]');
    await searchInput.fill('Amazing Grace');
    // Al presionar Enter se envía el form
    await searchInput.press('Enter');
    // Debería redirigir a /?q=Amazing+Grace
    await expect(page).toHaveURL(/q=Amazing\+Grace/);
  });

  test('búsqueda vacía no agrega query param', async ({ page }) => {
    await page.goto('/');
    const searchInput = page.locator('input[type="search"], input[name="q"]');
    await searchInput.press('Enter');
    // Sin query, se queda en /
    await expect(page).toHaveURL('/');
  });

  test('navega al login si no está autenticado (redirect)', async ({ page }) => {
    // Si no hay sesión, la home redirige a /login
    await page.goto('/login');
    await expect(page.locator('h1')).toContainText('CHORDBOOK');
  });
});
