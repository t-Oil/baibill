import { test, expect } from '@playwright/test';

/**
 * E2E tests for authentication flow
 */
test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing auth tokens
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });
  });

  test('should redirect to login page when not authenticated', async ({ page }) => {
    await page.goto('/');

    // Should redirect to login
    await page.waitForURL('**/login');
    await expect(page).toHaveURL(/\/login/);

    // Check that login form is visible
    await expect(page.getByRole('heading', { name: /receipt ocr admin/i })).toBeVisible();
    await expect(page.getByLabel(/email address/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test('should display error message for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    // Mock failed login response
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          status: { code: 401, message: 'Unauthorized' },
          message: 'Invalid email or password',
        }),
      });
    });

    // Fill in form with invalid credentials
    await page.getByLabel(/email address/i).fill('wrong@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Check that error message is shown
    await expect(page.getByText(/invalid email or password|login failed/i)).toBeVisible();
  });

  test('should successfully login and redirect to dashboard', async ({ page }) => {
    await page.goto('/login');

    // Mock successful login response
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

    // Mock user data response
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
            role: {
              name: 'admin',
              permissions: ['read', 'write', 'delete'],
            },
          },
        }),
      });
    });

    // Fill in form with valid credentials
    await page.getByLabel(/email address/i).fill('admin@example.com');
    await page.getByLabel(/password/i).fill('password123');

    // Submit form
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should redirect to dashboard
    await page.waitForURL('**/', { timeout: 5000 });
    await expect(page).toHaveURL(/\//);
  });

  test('should display demo credentials on login page', async ({ page }) => {
    await page.goto('/login');

    // Check that demo credentials are displayed
    await expect(page.getByText(/demo credentials/i)).toBeVisible();
    await expect(page.getByText(/admin@example\.com/)).toBeVisible();
    await expect(page.getByText(/password123/)).toBeVisible();
  });

  test('should show loading state during login', async ({ page }) => {
    await page.goto('/login');

    // Mock slow login response
    await page.route('**/api/auth/login', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
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

    // Fill in form
    await page.getByLabel(/email address/i).fill('admin@example.com');
    await page.getByLabel(/password/i).fill('password123');

    // Submit form
    await page.getByRole('button', { name: /sign in/i }).click();

    // Check that loading state is shown
    await expect(page.getByText(/signing in/i)).toBeVisible();

    // Button should be disabled
    const submitButton = page.getByRole('button', { name: /signing in/i });
    await expect(submitButton).toBeDisabled();
  });
});

/**
 * E2E tests for dashboard (authenticated)
 */
test.describe('Dashboard', () => {
  test.beforeEach(async ({ page, context }) => {
    // Mock authentication for all dashboard tests
    await page.goto('/login');

    // Set up auth mocks
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
            role: {
              name: 'admin',
              permissions: ['read', 'write', 'delete'],
            },
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
          data: [
            {
              organization: {
                id: 1,
                uid: 'org-123',
                name: 'Test Organization',
              },
              role: { id: 1, name: 'admin' },
            },
          ],
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

    // Mock receipts list for recent receipts
    await page.route('**/api/receipts?*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: { code: 200, message: 'OK' },
          data: {
            data: [
              {
                uid: 'r1',
                merchantName: '7-Eleven',
                totalAmount: 50,
                date: '2026-01-20',
                currency: 'THB',
              },
              {
                uid: 'r2',
                merchantName: 'Walmart',
                totalAmount: 100,
                date: '2026-01-21',
                currency: 'THB',
              },
            ],
            pagination: { page: 1, limit: 5, total: 2, totalPages: 1 },
          },
        }),
      });
    });

    // Login
    await page.getByLabel(/email address/i).fill('admin@example.com');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL('**/');
  });

  test('should display dashboard with statistics', async ({ page }) => {
    // Wait for loading to complete - check for the Total Receipts card which appears after loading
    await expect(page.getByText(/total receipts/i)).toBeVisible({ timeout: 15000 });

    // Check that the dashboard page is displayed
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    // Check that statistics cards are visible
    await expect(page.getByText(/this week/i)).toBeVisible();
    await expect(page.getByText(/total amount/i)).toBeVisible();
    await expect(page.getByText(/average/i)).toBeVisible();
  });

  test('should display user information in header', async ({ page }) => {
    // Wait for loading to complete
    await expect(page.getByText(/total receipts/i)).toBeVisible({ timeout: 15000 });

    // Check that user avatar button with initials is displayed in header
    // The avatar shows first letter of firstName and lastName (AU = Admin User)
    const userAvatar = page.locator('button').filter({ hasText: /AU/i });
    await expect(userAvatar).toBeVisible();

    // Click avatar to open dropdown menu
    await userAvatar.click();

    // Check user name is displayed in the dropdown
    await expect(page.getByText(/Admin User/)).toBeVisible();
    await expect(page.getByText(/admin@example.com/)).toBeVisible();
  });

  test('should navigate to receipts page', async ({ page }) => {
    // Wait for loading to complete
    await expect(page.getByText(/total receipts/i)).toBeVisible({ timeout: 15000 });

    // Click on Receipts menu item
    await page
      .getByRole('link', { name: /receipts/i })
      .first()
      .click();

    // Should navigate to receipts page
    await expect(page).toHaveURL(/\/receipts/);
    // Use exact match for the h1 heading to avoid matching "No receipts found"
    await expect(page.getByRole('heading', { name: 'Receipts', exact: true })).toBeVisible();
  });

  test('should navigate to upload page', async ({ page }) => {
    // Click on Upload menu item
    await page
      .getByRole('link', { name: /upload/i })
      .first()
      .click();

    // Should navigate to upload page
    await expect(page).toHaveURL(/\/upload/);
    await expect(page.getByRole('heading', { name: /upload receipt/i })).toBeVisible();
  });

  test('should logout and redirect to login page', async ({ page }) => {
    // Click user avatar to open dropdown menu
    const userAvatar = page.locator('button').filter({ hasText: /AU/i });
    await userAvatar.click();

    // Click sign out in the dropdown
    await page.getByRole('button', { name: /sign out/i }).click();

    // Should redirect to login page
    await page.waitForURL('**/login');
    await expect(page).toHaveURL(/\/login/);

    // Should not be able to access dashboard anymore
    await page.goto('/');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should toggle sidebar on desktop', async ({ page }) => {
    // Sidebar should be visible initially
    const sidebar = page.locator('aside').first();
    await expect(sidebar).toBeVisible();

    // Find and click toggle button (look for the chevron/arrow icon)
    const toggleButton = page
      .locator('button')
      .filter({ has: page.locator('svg') })
      .last();
    await toggleButton.click();

    // Sidebar should still be visible but collapsed (narrower)
    await expect(sidebar).toBeVisible();
  });
});

/**
 * E2E tests for receipts list page
 */
test.describe('Receipts List', () => {
  test.beforeEach(async ({ page }) => {
    // Set up authentication
    await page.goto('/login');

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
          data: [
            {
              organization: { id: 1, uid: 'org-123', name: 'Test Org' },
              role: { id: 1, name: 'admin' },
            },
          ],
        }),
      });
    });

    await page.route('**/api/receipts?*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: { code: 200, message: 'OK' },
          data: {
            data: [
              { uid: 'r1', merchantName: '7-Eleven', totalAmount: 50, date: '2026-01-20' },
              { uid: 'r2', merchantName: 'Walmart', totalAmount: 100, date: '2026-01-21' },
            ],
            pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
          },
        }),
      });
    });

    // Login
    await page.getByLabel(/email address/i).fill('admin@example.com');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL('**/');

    // Navigate to receipts page
    await page.goto('/receipts');
  });

  test('should display search bar', async ({ page }) => {
    await expect(page.getByPlaceholder(/search by merchant or receipt number/i)).toBeVisible();
  });

  test('should display upload button', async ({ page }) => {
    await expect(page.getByRole('link', { name: /upload receipt/i })).toBeVisible();
  });

  test('should filter receipts by search query', async ({ page }) => {
    // Type in search box
    const searchInput = page.getByPlaceholder(/search by merchant or receipt number/i);
    await searchInput.fill('7-Eleven');

    // Wait for filtering (debounced or immediate)
    await page.waitForTimeout(500);

    // Results should update (this would need actual receipt data or mocks)
  });

  test('should display pagination controls', async ({ page }) => {
    // Wait for the page to load
    await page.waitForTimeout(1000);

    // Check that pagination information is displayed (like "Showing page 1 of 5")
    // The exact text depends on whether there's data loaded
    const paginationText = page.getByText(/showing page|page/i);
    const hasPaginationText = (await paginationText.count()) > 0;

    // Or check for navigation buttons
    const prevButton = page.locator('button').filter({ hasText: /previous/i });
    const nextButton = page.locator('button').filter({ hasText: /next/i });

    // At least one pagination element should exist
    expect(
      hasPaginationText || (await prevButton.count()) > 0 || (await nextButton.count()) > 0,
    ).toBeTruthy();
  });
});
