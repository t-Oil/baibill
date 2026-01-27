export interface ParsedReceiptData {
  merchantName: string;
  totalAmount: number;
  date: string;
  lineItems: Array<{
    description: string;
    amount: number;
  }>;
}
