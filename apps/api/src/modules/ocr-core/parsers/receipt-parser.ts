import { ParsedReceiptData } from '../../shared';

export class ReceiptParser {
  parse(ocrText: string): ParsedReceiptData {
    return {
      merchantName: this.extractMerchant(ocrText),
      totalAmount: this.extractTotal(ocrText),
      date: this.extractDate(ocrText),
      lineItems: this.extractLineItems(ocrText),
    };
  }

  private extractMerchant(text: string): string {
    // Simple heuristic: first line is often merchant name
    const lines = text.split('\n').filter((l) => l.trim());
    return lines[0] || 'Unknown Merchant';
  }

  private extractTotal(text: string): number {
    // Look for patterns like "TOTAL", "Total:", etc followed by amount
    const totalRegex = /total[:\s]*\$?(\d+\.?\d*)/i;
    const match = text.match(totalRegex);
    return match ? parseFloat(match[1]) : 0;
  }

  private extractDate(text: string): string {
    // Look for date patterns MM/DD/YYYY or DD-MM-YYYY
    const dateRegex = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/;
    const match = text.match(dateRegex);
    return match ? match[0] : new Date().toISOString().split('T')[0];
  }

  private extractLineItems(text: string): Array<{ description: string; amount: number }> {
    // Simplified: extract lines with amounts
    const lines = text.split('\n');
    const items: Array<{ description: string; amount: number }> = [];

    for (const line of lines) {
      const amountMatch = line.match(/\$?(\d+\.?\d*)/);
      if (amountMatch && !line.toLowerCase().includes('total')) {
        items.push({
          description: line.replace(/\$?\d+\.?\d*/, '').trim(),
          amount: parseFloat(amountMatch[1]),
        });
      }
    }

    return items;
  }
}
