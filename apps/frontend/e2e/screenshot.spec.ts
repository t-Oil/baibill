
import { test, expect } from '@playwright/test';
import path from 'path';

test('capture dashboard screenshot', async ({ page }) => {
    // 1. Login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // 2. Wait for navigation to dashboard
    await page.waitForURL('/dashboard');

    // 3. Wait for dashboard content to load (stats, charts, etc)
    await page.waitForSelector('text=Total Receipts');
    await page.waitForTimeout(1000); // Give a little extra time for animations/charts

    // 4. Set viewport size for high quality
    await page.setViewportSize({ width: 1400, height: 900 });

    // 5. Take screenshot
    const screenshotPath = path.join(process.cwd(), 'public/dashboard-preview.png');
    await page.screenshot({ path: screenshotPath, fullPage: false });

    console.log(`Screenshot saved to: ${screenshotPath}`);
});
