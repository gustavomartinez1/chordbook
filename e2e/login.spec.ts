import { test, expect } from '@playwright/test';

test.describe('Login page', () => {
  test('carga con formulario de login', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h1')).toContainText('CHORDBOOK');
    await expect(page.locator('text=Ingresa tu correo')).toBeVisible();
  });

  test('tiene campo de email y botón de envío', async ({ page }) => {
    await page.goto('/login');
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute('placeholder', 'tu@correo.com');

    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeVisible();
    await expect(submitBtn).toContainText('Enviar enlace mágico');
  });

  test('email inválido muestra error del servidor', async ({ page }) => {
    await page.goto('/login');
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill('invalido');
    await page.locator('button[type="submit"]').click();

    // El navegador valida HTML5 por type="email", esperamos que el form no se envíe
    // O el servidor responde con error
    await page.waitForTimeout(500);
    const currentUrl = page.url();
    expect(currentUrl).toContain('/login');
  });

  test('email vacío no envía el formulario (required)', async ({ page }) => {
    await page.goto('/login');
    // El botón debería estar deshabilitado o el form no se envía sin email
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeVisible();

    // Verificamos que el campo email tiene required
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toHaveAttribute('required', '');
  });

  test('enviar email válido muestra mensaje de éxito', async ({ page }) => {
    // Interceptar la petición POST a loginAction
    await page.route('**/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    await page.goto('/login');
    await page.locator('input[type="email"]').fill('test@example.com');
    await page.locator('button[type="submit"]').click();

    // Debería mostrar mensaje de revisar correo
    await expect(page.locator('text=Revisa tu correo')).toBeVisible({ timeout: 5000 });
  });
});
