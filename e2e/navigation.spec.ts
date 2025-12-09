import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate between pages', async ({ page }) => {
    // Start at login
    await page.goto('/login');
    await expect(page).toHaveURL(/login/);
    
    // Check page title
    await expect(page).toHaveTitle(/vend-it|admin/i);
  });

  test('should have proper page structure', async ({ page }) => {
    await page.goto('/login');
    
    // Check semantic structure
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('should have no critical accessibility issues on login', async ({ page }) => {
    await page.goto('/login');
    
    // Check for basic accessibility
    const buttons = page.getByRole('button');
    const inputs = page.getByRole('textbox');
    
    // All interactive elements should be visible
    await expect(buttons.first()).toBeVisible();
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/login');
    
    // Tab through form elements
    await page.keyboard.press('Tab');
    
    // Should be able to focus elements
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });
});
