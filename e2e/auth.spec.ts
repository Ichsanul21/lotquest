import { test, expect } from '@playwright/test';

test.describe('Auth Flow', () => {
  test('should show login page with correct elements', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText('LOT Quest')).toBeVisible();
    await expect(page.getByText('Level Up Your Career')).toBeVisible();
    await expect(page.getByPlaceholder('agent@lotproperty.com')).toBeVisible();
    await expect(page.getByPlaceholder('••••••••')).toBeVisible();
    await expect(page.getByRole('button', { name: /masuk/i })).toBeVisible();
  });

  test('should show validation errors on empty login', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /masuk/i }).click();
    // HTML5 validation should prevent submission
    await expect(page).toHaveURL('/login');
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/login');
    await page.getByText(/daftar/i).click();
    await expect(page).toHaveURL('/register');
    await expect(page.getByText('Daftar')).toBeVisible();
  });

  test('should navigate to forgot password page', async ({ page }) => {
    await page.goto('/login');
    await page.getByText(/lupa password/i).click();
    await expect(page).toHaveURL('/forgot-password');
    await expect(page.getByText(/Kirim Tautan/i)).toBeVisible();
  });

  test('register page shows all form fields', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByText('Nama Lengkap')).toBeVisible();
    await expect(page.getByText('Username')).toBeVisible();
    await expect(page.getByText('Email')).toBeVisible();
    await expect(page.getByText('Cabang')).toBeVisible();
    await expect(page.getByText('Password')).toBeVisible();
    await expect(page.getByText('Konfirmasi Password')).toBeVisible();
    await expect(page.getByText('Kode Rekrut (opsional)')).toBeVisible();
  });

  test('forgot password flow shows success', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.getByPlaceholder('agent@lotproperty.com').fill('test@lotproperty.com');
    await page.getByRole('button', { name: /kirim tautan/i }).click();
    await expect(page.getByText(/Cek Email Anda/i)).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('404 page for unknown routes', async ({ page }) => {
    await page.goto('/nonexistent-page');
    await expect(page.getByText('404')).toBeVisible();
    await expect(page.getByText('Halaman Tidak Ditemukan')).toBeVisible();
  });

  test('redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/home');
    await expect(page).toHaveURL('/login');
  });

  test('redirects to home when already authenticated', async ({ page }) => {
    // We can't fully test this without a backend, but we can set a fake token
    await page.evaluate(() => localStorage.setItem('token', 'fake-token'));
    await page.goto('/login');
    // Should redirect to home since token exists (even though API will fail)
    await expect(page).toHaveURL('/home');
  });
});

test.describe('Home Page (unauthenticated)', () => {
  test('should redirect to login', async ({ page }) => {
    await page.goto('/home');
    await expect(page).toHaveURL('/login');
  });
});
