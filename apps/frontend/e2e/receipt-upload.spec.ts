import { test, expect } from '@playwright/test';
import path from 'path';

/**
 * E2E tests for receipt upload flow
 */
test.describe('Receipt Upload', () => {
  test.beforeEach(async ({ page }) => {
    // Set up authentication mocks
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: { code: 200, message: 'OK' },
          data: {
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
          },
        }),
      });
    });

    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: { code: 200, message: 'OK' },
          data: {
            uid: 'test-user-123',
            email: 'admin@example.com',
            firstName: 'Admin',
            lastName: 'User',
            role: { name: 'admin', permissions: [] },
          },
        }),
      });
    });

    await page.route('**/api/organizations', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: { code: 200, message: 'OK' },
          data: [{
            organization: {
              id: 1,
              uid: 'org-123',
              name: 'Test Organization',
            },
            role: { id: 1, name: 'admin' },
          }],
        }),
      });
    });

    await page.route('**/api/receipts/stats/summary', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: { code: 200, message: 'OK' },
          data: {
            total: 10,
            today: 2,
            thisWeek: 5,
            thisMonth: 10,
            totalAmount: 1000,
            averageAmount: 100,
          },
        }),
      });
    });

    // Login first
    await page.goto('/login');
    await page.getByLabel(/email address/i).fill('admin@example.com');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL('**/');

    // Navigate to upload page
    await page.goto('/upload');
  });

  test('should display upload form on home page', async ({ page }) => {
    // Check that the page title is correct
    await expect(page).toHaveTitle(/Receipt OCR/i);

    // Check that the upload form is visible
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeVisible();
  });

  test('should show loading state when processing receipt', async ({ page }) => {
    // Mock the API response to control timing
    await page.route('**/api/receipts/upload', async (route) => {
      // Delay the response to see loading state
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: { code: 200, message: 'OK' },
          data: {
            uid: 'test-123',
            merchantName: 'Test Store',
            totalAmount: 42.99,
            date: '2026-01-23',
            rawOcrText: 'Test receipt text',
          },
        }),
      });
    });

    // Create a test file path (you'll need to create a sample receipt image)
    const testImagePath = path.join(__dirname, 'fixtures', 'sample-receipt.jpg');

    // Upload a file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testImagePath);

    // Check that loading state is shown (use first() to avoid strict mode violation with multiple elements)
    await expect(page.getByText(/processing/i).first()).toBeVisible();
  });

  test('should display receipt details after successful upload', async ({ page }) => {
    // Mock the API response
    await page.route('**/api/receipts/upload', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: { code: 200, message: 'OK' },
          data: {
            uid: 'test-456',
            merchantName: 'Walmart',
            totalAmount: 45.67,
            date: '2026-01-23',
            rawOcrText: 'WALMART\nTOTAL: $45.67\n01/23/2026',
          },
        }),
      });
    });

    // Create a test file path
    const testImagePath = path.join(__dirname, 'fixtures', 'sample-receipt.jpg');

    // Upload a file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testImagePath);

    // Wait for the results to appear (Receipt Details is an h2 heading)
    await expect(page.getByRole('heading', { name: /receipt details/i })).toBeVisible({ timeout: 10000 });

    // Verify success message with merchant name is displayed
    await expect(page.getByText(/receipt processed successfully.*walmart/i)).toBeVisible({ timeout: 10000 });

    // Verify the total amount is displayed (use first() since it appears in both card and raw OCR) 
    await expect(page.getByText(/45\.67/).first()).toBeVisible({ timeout: 5000 });
  });

  test('should handle upload errors gracefully', async ({ page }) => {
    // Mock an error response
    await page.route('**/api/receipts/upload', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          status: { code: 500, message: 'Failed to process receipt' },
          error: { errors: ['Failed to process receipt'] },
        }),
      });
    });

    // Create a test file path
    const testImagePath = path.join(__dirname, 'fixtures', 'sample-receipt.jpg');

    // Upload a file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testImagePath);

    // Check that an error message is shown (use first() to avoid strict mode violation)
    await expect(page.getByText(/error|failed/i).first()).toBeVisible();
  });

  test('should accept only image files', async ({ page }) => {
    // Check that the file input has accept attribute for images
    const fileInput = page.locator('input[type="file"]');
    const acceptAttr = await fileInput.getAttribute('accept');
    expect(acceptAttr).toContain('image');
  });
});

/**
 * E2E tests for receipt details page (if implemented)
 */
test.describe('Receipt Details Page', () => {
  test.skip('should display receipt details by ID', async ({ page }) => {
    // This test is skipped as the details page might not be implemented yet
    // Implement once the /receipts/:id route is available
    await page.goto('/receipts/test-123');
    await expect(page.getByText(/receipt details/i)).toBeVisible();
  });
});
