# Enhanced Receipt Structure

**Date**: 2026-01-23
**Migration**: `1737628800000-EnhanceReceiptStructure`
**Status**: ✅ COMPLETE

---

## Overview

The receipt structure has been enhanced to capture comprehensive receipt information including:

- Company tax ID and address
- Separate fields for subtotal, VAT, and total
- Currency support (THB, USD, EUR, etc.)
- Detailed line items in a separate table

---

## Database Schema

### Updated `receipts` Table

| Column                | Type          | Description                       |
| --------------------- | ------------- | --------------------------------- |
| `id`                  | int           | Primary key (auto-increment)      |
| `uid`                 | uuid          | Public UUID identifier            |
| `merchant_name`       | varchar(255)  | Store/business name               |
| **`company_tax_id`**  | varchar(100)  | Tax ID / VAT number (NEW)         |
| **`company_address`** | text          | Business address (NEW)            |
| **`subtotal`**        | decimal(10,2) | Amount before tax (NEW)           |
| **`vat_amount`**      | decimal(10,2) | Tax/VAT amount (NEW)              |
| `total_amount`        | decimal(10,2) | Final total amount                |
| **`currency`**        | varchar(10)   | Currency code (NEW, default: THB) |
| `receipt_date`        | date          | Transaction date                  |
| `raw_ocr_text`        | text          | Full OCR output                   |
| `image_url`           | varchar(500)  | Receipt image filename            |
| `created_at`          | timestamp     | Creation timestamp                |
| `updated_at`          | timestamp     | Last update timestamp             |
| `deleted_at`          | timestamp     | Soft delete timestamp             |
| `is_active`           | enum          | active/inactive status            |

### New `receipt_line_items` Table

| Column         | Type          | Description                          |
| -------------- | ------------- | ------------------------------------ |
| `id`           | int           | Primary key (auto-increment)         |
| `receipt_id`   | int           | Foreign key to receipts.id (CASCADE) |
| `description`  | varchar(500)  | Item name/description                |
| `quantity`     | decimal(10,3) | Number of items (default: 1)         |
| `unit_price`   | decimal(10,2) | Price per unit                       |
| `amount`       | decimal(10,2) | Total for this line item             |
| `product_code` | varchar(100)  | Product/barcode number (optional)    |
| `created_at`   | timestamp     | Creation timestamp                   |
| `updated_at`   | timestamp     | Last update timestamp                |

**Foreign Key**: `receipt_id` → `receipts.id` (ON DELETE CASCADE)
**Index**: `IDX_receipt_line_items_receipt_id` on `receipt_id`

---

## Updated AI Prompt (v2.0.0)

The OpenAI prompt has been updated to extract all new fields:

```typescript
{
  "merchantName": "CP Axtra PCL นวมินทร์ 70",
  "companyTaxId": "0107567000414",
  "companyAddress": "นวมินทร์ 70",
  "subtotal": 200.15,
  "vatAmount": 5.10,
  "totalAmount": 205.25,
  "currency": "THB",
  "date": "2026-01-22",
  "lineItems": [
    {
      "description": "พริกขี้หนูเขียวก้าน ถุงใหญ่",
      "quantity": 0.991,
      "unitPrice": 79.00,
      "amount": 78.25,
      "productCode": "2111000078253"
    },
    {
      "description": "มะนาวแป้นจัมโบ้ 10 ลูก",
      "quantity": 1,
      "unitPrice": 49.00,
      "amount": 49.00,
      "productCode": "28478041"
    },
    {
      "description": "ชาวสวนน้ามะนาว 1000 ก",
      "quantity": 1,
      "unitPrice": 78.00,
      "amount": 78.00,
      "productCode": "8859449900110"
    }
  ],
  "confidence": "high"
}
```

---

## API Response Structure

### Upload Receipt Response

```json
{
  "success": true,
  "data": {
    "uid": "7f5bed9e-84c7-4008-bf75-e1c8b028e6bd",
    "merchantName": "CP Axtra PCL นวมินทร์ 70",
    "companyTaxId": "0107567000414",
    "companyAddress": "นวมินทร์ 70",
    "subtotal": 200.15,
    "vatAmount": 5.1,
    "totalAmount": 205.25,
    "currency": "THB",
    "date": "2026-01-22",
    "rawOcrText": "Full OCR text...",
    "imageUrl": "receipt-123.jpg",
    "lineItems": [
      {
        "id": 1,
        "description": "พริกขี้หนูเขียวก้าน ถุงใหญ่",
        "quantity": 0.991,
        "unitPrice": 79.0,
        "amount": 78.25,
        "productCode": "2111000078253",
        "createdAt": "2026-01-23T08:00:00Z",
        "updatedAt": "2026-01-23T08:00:00Z"
      }
      // More line items...
    ],
    "createdAt": "2026-01-23T08:00:00Z",
    "updatedAt": "2026-01-23T08:00:00Z"
  }
}
```

---

## Entity Relationships

```
ReceiptEntity (receipts)
  ├── id: Primary Key
  ├── uid: UUID (public identifier)
  ├── merchantName, companyTaxId, companyAddress
  ├── subtotal, vatAmount, totalAmount, currency
  ├── date, rawOcrText, imageUrl
  └── lineItems: One-to-Many → ReceiptLineItemEntity
                                  ├── description
                                  ├── quantity
                                  ├── unitPrice
                                  ├── amount
                                  └── productCode
```

**Cascade Behavior**: When a receipt is deleted, all associated line items are automatically deleted (ON DELETE CASCADE).

**Eager Loading**: Line items are automatically loaded with the receipt (eager: true).

---

## Migration Steps

### Already Completed ✅

1. Add new columns to `receipts` table:
   - `company_tax_id` (varchar 100, nullable)
   - `company_address` (text, nullable)
   - `subtotal` (decimal 10,2, default 0)
   - `vat_amount` (decimal 10,2, default 0)
   - `currency` (varchar 10, default 'THB')

2. Create `receipt_line_items` table with all fields

3. Add foreign key constraint: `receipt_id` → `receipts.id` (CASCADE)

4. Add index on `receipt_id` for performance

### Run Migration

```bash
cd apps/api
npm run migration:run
```

### Rollback (if needed)

```bash
npm run migration:revert
```

This will:

- Drop the `receipt_line_items` table
- Remove all new columns from `receipts` table
- Restore to previous schema

---

## Code Changes

### 1. Entities

**`receipt.entity.ts`** - Updated with new fields and relationship:

```typescript
@Column({ name: 'company_tax_id', type: 'varchar', length: 100, nullable: true })
companyTaxId?: string;

@Column({ name: 'company_address', type: 'text', nullable: true })
companyAddress?: string;

@Column({ name: 'subtotal', type: 'decimal', precision: 10, scale: 2, default: 0 })
subtotal: number;

@Column({ name: 'vat_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
vatAmount: number;

@Column({ name: 'currency', type: 'varchar', length: 10, default: 'THB' })
currency: string;

@OneToMany(() => ReceiptLineItemEntity, (lineItem) => lineItem.receipt, {
  cascade: true,
  eager: true,
})
lineItems?: ReceiptLineItemEntity[];
```

**`receipt-line-item.entity.ts`** - New entity created:

```typescript
@Entity('receipt_line_items')
export class ReceiptLineItemEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'receipt_id', type: 'int' })
  receiptId!: number;

  @Column({ name: 'description', type: 'varchar', length: 500 })
  description: string;

  @Column({ name: 'quantity', type: 'decimal', precision: 10, scale: 3, default: 1 })
  quantity: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ name: 'amount', type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ name: 'product_code', type: 'varchar', length: 100, nullable: true })
  productCode?: string;

  @ManyToOne(() => ReceiptEntity, (receipt) => receipt.lineItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'receipt_id' })
  receipt!: ReceiptEntity;
}
```

### 2. AI Service

**`ai.service.ts`** - Updated interface:

```typescript
export interface AIReceiptLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  productCode?: string | null;
}

export interface AIReceiptResult {
  merchantName: string | null;
  companyTaxId?: string | null;
  companyAddress?: string | null;
  subtotal?: number | null;
  vatAmount?: number | null;
  totalAmount: number | null;
  currency?: string;
  date: string | null;
  lineItems: AIReceiptLineItem[];
  confidence: 'high' | 'medium' | 'low';
}
```

**`receipt-parser.prompt.ts`** - Updated to v2.0.0:

- Extracts company tax ID and address
- Separates subtotal, VAT, and total
- Captures currency code
- Enhanced line item structure with quantity, unit price, product code

### 3. Receipt Service

**`receipt.service.ts`** - Updated to handle new fields:

```typescript
const created = this.receiptRepository.create({
  merchantName: parsed.merchantName,
  companyTaxId: parsed.companyTaxId,
  companyAddress: parsed.companyAddress,
  subtotal: parsed.subtotal,
  vatAmount: parsed.vatAmount,
  totalAmount: parsed.totalAmount,
  currency: parsed.currency,
  date: parsed.date,
  rawOcrText: ocrText,
  imageUrl: file.filename,
});

// Create line items if available
if (parsed.lineItems && parsed.lineItems.length > 0) {
  created.lineItems = parsed.lineItems.map((item: any) => {
    const lineItem = new ReceiptLineItemEntity();
    lineItem.description = item.description;
    lineItem.quantity = item.quantity || 1;
    lineItem.unitPrice = item.unitPrice || item.amount;
    lineItem.amount = item.amount;
    lineItem.productCode = item.productCode || null;
    return lineItem;
  });
}
```

### 4. DTOs

**`receipt.dto.ts`** - Updated shared interface:

```typescript
export interface ReceiptDto {
  uid: string;
  merchantName: string;
  companyTaxId?: string;
  companyAddress?: string;
  subtotal: number;
  vatAmount: number;
  totalAmount: number;
  currency: string;
  date: string;
  lineItems?: ReceiptLineItemDto[];
  rawOcrText: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReceiptLineItemDto {
  id?: number;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  productCode?: string;
}
```

---

## Use Cases

### 1. Extract Full Receipt Information

- Company name and tax ID for accounting
- Separate subtotal and VAT for tax reporting
- Currency for multi-currency support

### 2. Itemized Purchase Tracking

- Track individual items purchased
- Store product codes for inventory matching
- Calculate quantities and unit prices

### 3. Expense Management

- Categorize by merchant and date
- Calculate VAT-exclusive amounts
- Support international receipts with currency

### 4. Reporting and Analytics

- Group by merchant or category
- Aggregate subtotals and VAT
- Analyze purchase patterns by product

---

## Example Queries

### Get Receipt with Line Items

```typescript
const receipt = await receiptRepository.findOne({
  where: { uid: '7f5bed9e-...' },
  relations: ['lineItems'], // Or use eager loading
});

console.log(receipt.merchantName); // "CP Axtra PCL นวมินทร์ 70"
console.log(receipt.subtotal); // 200.15
console.log(receipt.vatAmount); // 5.10
console.log(receipt.totalAmount); // 205.25
console.log(receipt.currency); // "THB"
console.log(receipt.lineItems.length); // 3

receipt.lineItems.forEach((item) => {
  console.log(`${item.quantity} x ${item.description} @ ${item.unitPrice} = ${item.amount}`);
});
```

### Calculate Total VAT for a Period

```sql
SELECT
  DATE(receipt_date) as date,
  SUM(vat_amount) as total_vat,
  SUM(subtotal) as total_subtotal,
  SUM(total_amount) as grand_total,
  currency
FROM receipts
WHERE receipt_date BETWEEN '2026-01-01' AND '2026-01-31'
GROUP BY DATE(receipt_date), currency
ORDER BY date DESC;
```

### Find Receipts by Product

```sql
SELECT
  r.uid,
  r.merchant_name,
  r.receipt_date,
  r.total_amount,
  rli.description,
  rli.quantity,
  rli.amount
FROM receipts r
INNER JOIN receipt_line_items rli ON rli.receipt_id = r.id
WHERE rli.description LIKE '%มะนาว%'
ORDER BY r.receipt_date DESC;
```

---

## Backward Compatibility

✅ **Fully backward compatible**:

- All new fields are optional or have defaults
- Existing receipts work without line items
- Regex parser still works (sets VAT/subtotal to 0)
- Old API responses still valid (new fields are additive)

---

## Testing

### 1. Upload a Receipt

```bash
curl -X POST http://localhost:4000/api/receipts/upload \
  -F "file=@receipt.jpg"
```

### 2. Verify Database

```sql
-- Check receipt
SELECT * FROM receipts WHERE uid = '7f5bed9e-...';

-- Check line items
SELECT * FROM receipt_line_items
WHERE receipt_id = (SELECT id FROM receipts WHERE uid = '7f5bed9e-...');
```

### 3. Check Cascade Delete

```sql
-- Delete receipt (should also delete line items)
DELETE FROM receipts WHERE uid = '7f5bed9e-...';

-- Verify line items are gone
SELECT COUNT(*) FROM receipt_line_items WHERE receipt_id = 123; -- Should be 0
```

---

## Future Enhancements

- [ ] Add categories/tags to receipts
- [ ] Support multiple tax rates per receipt
- [ ] Add discount/promotion tracking
- [ ] Support payment method details
- [ ] Add receipt comparison/duplicate detection
- [ ] Generate itemized reports
- [ ] Export to accounting software formats

---

## Summary

The enhanced receipt structure provides:

✅ **Comprehensive Data Capture**

- Company information (name, tax ID, address)
- Detailed financial breakdown (subtotal, VAT, total)
- Currency support for international receipts
- Itemized line items with quantities and prices

✅ **Better Data Organization**

- Normalized schema with separate line items table
- Foreign key constraints ensure data integrity
- Indexes for optimal query performance

✅ **Enhanced AI Parsing**

- OpenAI prompt updated to extract all fields
- Handles Thai receipts with tax IDs
- Captures product codes and quantities

✅ **Backward Compatible**

- Existing code continues to work
- New fields are optional/have defaults
- Regex parser still functional

**Status**: Production-ready ✅
