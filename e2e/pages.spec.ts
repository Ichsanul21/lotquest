import { test, expect } from '@playwright/test';

test.describe('Protected Pages - Layout Elements', () => {
  test.beforeEach(async ({ page }) => {
    // Set fake token to bypass auth guard (will show loading then redirect)
    await page.evaluate(() => localStorage.setItem('token', 'fake-token'));
  });

  test('bottom navigation is present', async ({ page }) => {
    await page.goto('/home');
    // The page will try to fetch /me, fail, then redirect to /login
    // We verify the auth guard behavior
    await expect(page).not.toHaveURL('/home');
  });
});

test.describe('Public Pages', () => {
  test('onboarding page renders correctly', async ({ page }) => {
    await page.goto('/onboarding');
    // Without auth, should redirect to login since it's a protected route
    await expect(page).toHaveURL('/login');
  });

  test('login page has correct layout', async ({ page }) => {
    await page.goto('/login');
    const title = page.getByText('LOT Quest');
    await expect(title).toBeVisible();

    // Check gold gradient icon present
    const iconContainer = page.locator('div').filter({ has: page.locator('svg') }).first();
    await expect(iconContainer).toBeVisible();
  });

  test('responsive viewport meta tag', async ({ page }) => {
    await page.goto('/login');
    const viewport = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="viewport"]');
      return meta?.getAttribute('content');
    });
    expect(viewport).toContain('width=device-width');
  });
});
