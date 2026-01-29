# E2E Test Fixtures

This directory contains test files used by Playwright E2E tests.

## Required Files

### sample-receipt.jpg

A sample receipt image for testing the upload flow. You can use any receipt image (JPEG format recommended).

**Requirements:**

- Format: JPEG, PNG, or other image format
- Size: < 5MB (typical receipt photo size)
- Content: A readable receipt with merchant name, total amount, and date

**To add the sample receipt:**

1. Take a photo of any receipt or use an existing receipt image
2. Save it as `sample-receipt.jpg` in this directory
3. Run the tests: `npm run test:e2e`

## Alternative: Generate Mock Receipt

If you don't have a real receipt image, you can create a simple mock image using any image editor or online tool.

Example mock receipt text:

```
WALMART
123 Main St
City, State 12345

Item 1          $10.00
Item 2          $15.50
Item 3          $20.17

TOTAL:          $45.67
DATE: 01/23/2026
```

## Usage in Tests

The tests use this file path:

```typescript
const testImagePath = path.join(__dirname, 'fixtures', 'sample-receipt.jpg');
```

You can add additional test images for different scenarios:

- `receipt-blurry.jpg` - Test OCR with low quality image
- `receipt-multi-item.jpg` - Test with many line items
- `receipt-non-english.jpg` - Test international receipts
