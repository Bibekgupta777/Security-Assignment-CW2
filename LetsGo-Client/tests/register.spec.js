import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:4004'; // Update based on your server port

test.describe('Register Page Tests - Bus Ticket Booking', () => {
  // ✅ Setup: Navigate to the registration page
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/signup`);
  });

  // ✅ Test: Validate empty fields
  test('Should display validation errors for empty fields', async ({ page }) => {
    await page.click('button:has-text("Sign Up")');

    await expect(page.locator('text=Name is required')).toBeVisible();
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();
  });

  // ✅ Test: Invalid email format
  test('Should show error for invalid email format', async ({ page }) => {
    await page.fill('input[placeholder="Enter your full name"]', 'John Doe');
    await page.fill('input[placeholder="Enter your email"]', 'invalidemail');
    await page.fill('input[placeholder="Enter your password"]', 'password123');

    await page.click('button:has-text("Sign Up")');
    await expect(page.locator('text=Enter a valid email address')).toBeVisible();
  });

  // ✅ Test: Password too short
  test('Should show error for short password', async ({ page }) => {
    await page.fill('input[placeholder="Enter your full name"]', 'John Doe');
    await page.fill('input[placeholder="Enter your email"]', 'johndoe@example.com');
    await page.fill('input[placeholder="Enter your password"]', '123');

    await page.click('button:has-text("Sign Up")');
    await expect(page.locator('text=Password must be at least 6 characters')).toBeVisible();
  });

  // ✅ Test: Successful registration
  test('Should successfully register with valid data', async ({ page }) => {
    const timestamp = new Date().getTime(); // To generate a unique email each time
    await page.fill('input[placeholder="Enter your full name"]', 'Nirajan Mahato');
    await page.fill('input[placeholder="Enter your email"]', `nirajan${timestamp}@example.com`);
    await page.fill('input[placeholder="Enter your password"]', 'securePassword123');

    await page.click('button:has-text("Sign Up")');

    // Wait for navigation to login page after successful signup
    await expect(page).toHaveURL(`${BASE_URL}/login`);
    await expect(page.locator('text=Registration successful')).toBeVisible();
  });

  // ✅ Test: Register with an existing email
  test('Should fail registration with existing email', async ({ page }) => {
    await page.fill('input[placeholder="Enter your full name"]', 'Nirajan Mahato');
    await page.fill('input[placeholder="Enter your email"]', 'nirajanmahato@gmail.com'); // Existing email
    await page.fill('input[placeholder="Enter your password"]', 'securePassword123');

    await page.click('button:has-text("Sign Up")');

    await expect(page.locator('text=Registration failed')).toBeVisible();
  });

  // ✅ Test: Navigate to login page
  test('Should navigate to login page', async ({ page }) => {
    await page.click('text=Sign in');

    await expect(page).toHaveURL(`${BASE_URL}/login`);
  });
});
