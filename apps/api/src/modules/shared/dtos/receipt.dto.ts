export interface ReceiptDto {
  uid: string;
  merchantName: string;
  companyTaxId?: string;
  companyAddress?: string;
  receiptNo?: string;
  vatIncluded: boolean;
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

export interface CreateReceiptDto {
  merchantName: string;
  totalAmount: number;
  date: string;
  rawOcrText: string;
  imageUrl?: string;
}

export interface OcrResultDto {
  text: string;
  confidence: number;
}
