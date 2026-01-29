# E2E Tests with Playwright

End-to-end tests for the receipt-ocr frontend using Playwright.

## Setup

Playwright is already installed. If you need to reinstall browsers:

```bash
npx playwright install chromium
```

## Running Tests

### Run all tests (headless mode)

```bash
npm run test:e2e
```

### Run tests with UI mode (recommended for development)

```bash
npm run test:e2e:ui
```

### Run tests in headed mode (see the browser)

```bash
npm run test:e2e:headed
```

### Debug tests

```bash
npm run test:e2e:debug
```

### View test report

```bash
npm run test:e2e:report
```

## Test Structure

```
e2e/
├── fixtures/              # Test files (images, mock data)
│   └── sample-receipt.jpg # Sample receipt image for upload tests
├── receipt-upload.spec.ts # Receipt upload flow tests
└── README.md             # This file
```

## Test Coverage

### Receipt Upload Flow (`receipt-upload.spec.ts`)

1. **Display upload form** - Verifies the upload form renders correctly
2. **Loading state** - Checks loading indicator appears during processing
3. **Success state** - Verifies parsed receipt data displays correctly
4. **Error handling** - Tests error message display on upload failure
5. **File type validation** - Ensures only image files are accepted

## Writing New Tests

### Example Test

```typescript
import { test, expect } from '@playwright/test';

test('my new test', async ({ page }) => {
  await page.goto('/');

  // Your test logic here
  await expect(page.getByText('Expected Text')).toBeVisible();
});
```

### Best Practices

1. **Use data-testid attributes** for stable selectors
2. **Mock API responses** for predictable test behavior
3. **Clean up state** between tests using beforeEach/afterEach
4. **Use page objects** for complex pages to reduce duplication
5. **Keep tests independent** - each test should run in isolation

## Configuration

Configuration is in [playwright.config.ts](../playwright.config.ts).

Key settings:

- **baseURL**: `http://localhost:3000` (configurable via `PLAYWRIGHT_BASE_URL`)
- **webServer**: Automatically starts dev server before tests
- **browsers**: Chromium only (add more in config if needed)
- **retries**: 2 retries on CI, 0 locally
- **screenshots**: Captured on failure
- **traces**: Captured on first retry

## CI/CD Integration

### GitHub Actions Example

```yaml
- name: Install dependencies
  run: npm ci

- name: Install Playwright browsers
  run: npx playwright install chromium

- name: Run E2E tests
  run: npm run test:e2e
  env:
    CI: true

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Debugging Tips

### 1. Use UI Mode

```bash
npm run test:e2e:ui
```

This opens an interactive UI where you can:

- See test execution step-by-step
- Time travel through test actions
- Inspect DOM at each step
- View network requests

### 2. Use Debug Mode

```bash
npm run test:e2e:debug
```

This opens Playwright Inspector for stepping through tests.

### 3. Add Breakpoints

```typescript
test('debug this test', async ({ page }) => {
  await page.goto('/');
  await page.pause(); // Pauses execution
});
```

### 4. View Traces

After a test failure, view the trace:

```bash
npx playwright show-trace trace.zip
```

## Common Issues

### Issue: Tests fail with "No tests found"

**Solution**: Make sure test files end with `.spec.ts` or `.test.ts`

### Issue: "Browser not found"

**Solution**: Install browsers:

```bash
npx playwright install chromium
```

### Issue: Dev server doesn't start

**Solution**: Check that port 3000 is available or set custom port:

```bash
PLAYWRIGHT_BASE_URL=http://localhost:3001 npm run test:e2e
```

### Issue: API calls fail in tests

**Solution**: Mock API responses using `page.route()`:

```typescript
await page.route('**/api/**', async (route) => {
  await route.fulfill({
    status: 200,
    body: JSON.stringify({ data: 'mock data' }),
  });
});
```

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
- [Selectors Guide](https://playwright.dev/docs/selectors)
