import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  // Note: These tests assume authentication is handled
  // In real scenario, you'd set up auth state before tests
  
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard (will redirect to login if not authenticated)
    await page.goto('/dashboard');
  });

  test('should redirect to login if not authenticated', async ({ page }) => {
    // Should be redirected to login
    await expect(page).toHaveURL(/login/);
  });
});

test.describe('Dashboard - Authenticated', () => {
  // This test uses a mock authentication state
  test.use({
    storageState: {
      cookies: [],
      origins: [
        {
          origin: 'http://localhost:3000',
          localStorage: [
            { name: 'authToken', value: 'mock-token' },
          ],
        },
      ],
    },
  });

  test('should display dashboard metrics', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check for main dashboard elements
    await expect(page.getByText(/dashboard/i)).toBeVisible();
  });
});
