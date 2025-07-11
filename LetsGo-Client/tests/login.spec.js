import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:4004'; // Update if running on a different port

test.describe('Login Page Tests - Bus Ticket Booking', () => {
  // ✅ Test 1: Navigate to login page
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
  });

  // ✅ Test: Validate empty fields
  test('Should display validation errors for empty fields', async ({ page }) => {
    await page.click('button:has-text("Login")');

    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();
  });

  // ✅ Test: Invalid email format
  test('Should show error for invalid email format', async ({ page }) => {
    await page.fill('input[placeholder="Enter your email"]', 'invalidemail');
    await page.click('button:has-text("Login")');

    await expect(page.locator('text=Enter a valid email address')).toBeVisible();
  });

  // ✅ Test: Successful login with valid credentials
  test('Should successfully login with valid credentials', async ({ page }) => {
    await page.fill('input[placeholder="Enter your email"]', 'nirajanmahato@gmail.com');
    await page.fill('input[placeholder="Enter your password"]', 'password123');
    await page.click('button:has-text("Login")');

    // Assuming it redirects to the homepage after successful login
    await expect(page).toHaveURL(`${BASE_URL}/`);
    await expect(page.locator('text=Login successful!')).toBeVisible();
  });

  // ✅ Test: Failed login with incorrect credentials
  test('Should display error message for invalid credentials', async ({ page }) => {
    await page.fill('input[placeholder="Enter your email"]', 'invaliduser@gmail.com');
    await page.fill('input[placeholder="Enter your password"]', 'wrongpassword');
    await page.click('button:has-text("Login")');

    await expect(page.locator('text=Login failed!')).toBeVisible();
  });

  // ✅ Test: Navigate to forgot password page
  test('Should navigate to forgot password page', async ({ page }) => {
    await page.click('text=Forgot password?');

    await expect(page).toHaveURL(`${BASE_URL}/forgot-password`);
  });

  // ✅ Test: Navigate to signup page
  test('Should navigate to signup page', async ({ page }) => {
    await page.click('text=Create an account');

    await expect(page).toHaveURL(`${BASE_URL}/signup`);
  });
});
