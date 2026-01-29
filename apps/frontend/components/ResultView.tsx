interface ResultViewProps {
  data: {
    uid: string;
    merchantName: string;
    companyTaxId?: string;
    receiptNo?: string;
    totalAmount: number;
    subtotal?: number;
    vatAmount?: number;
    vatIncluded?: boolean;
    currency?: string;
    date: string;
    rawOcrText: string;
    lineItems?: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
      amount: number;
      productCode?: string;
    }>;
  };
}

export function ResultView({ data }: ResultViewProps) {
  const formatCurrency = (amount: number, currency: string = 'THB') => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-[var(--text)]">Receipt Details</h2>

      {/* Main Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[var(--bg)] rounded-lg p-4 border border-[var(--border)]">
          <p className="text-sm text-[var(--muted)]">Merchant</p>
          <p className="text-lg font-medium text-[var(--text)]">{data.merchantName}</p>
        </div>

        <div className="bg-[var(--bg)] rounded-lg p-4 border border-[var(--border)]">
          <p className="text-sm text-[var(--muted)]">Total Amount</p>
          <p className="text-lg font-medium text-[var(--success)]">
            {formatCurrency(data.totalAmount, data.currency || 'THB')}
          </p>
        </div>

        <div className="bg-[var(--bg)] rounded-lg p-4 border border-[var(--border)]">
          <p className="text-sm text-[var(--muted)]">Date</p>
          <p className="text-lg font-medium text-[var(--text)]">{data.date}</p>
        </div>

        {data.receiptNo && (
          <div className="bg-[var(--bg)] rounded-lg p-4 border border-[var(--border)]">
            <p className="text-sm text-[var(--muted)]">Receipt No</p>
            <p className="text-lg font-medium text-[var(--text)]">{data.receiptNo}</p>
          </div>
        )}

        {data.companyTaxId && (
          <div className="bg-[var(--bg)] rounded-lg p-4 border border-[var(--border)]">
            <p className="text-sm text-[var(--muted)]">Tax ID</p>
            <p className="text-lg font-medium text-[var(--text)]">{data.companyTaxId}</p>
          </div>
        )}

        {data.vatIncluded !== undefined && (
          <div className="bg-[var(--bg)] rounded-lg p-4 border border-[var(--border)]">
            <p className="text-sm text-[var(--muted)]">VAT Status</p>
            <span
              className={`inline-flex px-2 py-1 text-sm font-medium rounded-full ${
                data.vatIncluded
                  ? 'bg-[var(--success)]/10 text-[var(--success)]'
                  : 'bg-[var(--muted)]/10 text-[var(--muted)]'
              }`}
            >
              {data.vatIncluded ? 'VAT Included' : 'VAT Excluded'}
            </span>
          </div>
        )}
      </div>

      {/* VAT Breakdown */}
      {(data.subtotal || data.vatAmount) && (
        <div className="bg-[var(--bg)] rounded-lg p-4 border border-[var(--border)]">
          <h3 className="font-semibold text-[var(--text)] mb-3">Amount Breakdown</h3>
          <div className="space-y-2">
            {data.subtotal !== undefined && data.subtotal > 0 && (
              <div className="flex justify-between text-[var(--muted)]">
                <span>Subtotal</span>
                <span className="text-[var(--text)]">
                  {formatCurrency(data.subtotal, data.currency)}
                </span>
              </div>
            )}
            {data.vatAmount !== undefined && data.vatAmount > 0 && (
              <div className="flex justify-between text-[var(--muted)]">
                <span>VAT</span>
                <span className="text-[var(--text)]">
                  {formatCurrency(data.vatAmount, data.currency)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-[var(--text)] font-semibold border-t border-[var(--border)] pt-2">
              <span>Total</span>
              <span className="text-[var(--success)]">
                {formatCurrency(data.totalAmount, data.currency)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Line Items */}
      {data.lineItems && data.lineItems.length > 0 && (
        <div className="bg-[var(--bg)] rounded-lg p-4 border border-[var(--border)]">
          <h3 className="font-semibold text-[var(--text)] mb-3">
            Line Items ({data.lineItems.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[var(--muted)] border-b border-[var(--border)]">
                  <th className="text-left py-2 pr-4">Description</th>
                  <th className="text-right py-2 px-2">Qty</th>
                  <th className="text-right py-2 px-2">Unit Price</th>
                  <th className="text-right py-2 pl-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.lineItems.map((item, index) => (
                  <tr key={index} className="border-b border-[var(--border)]/50">
                    <td className="py-2 pr-4 text-[var(--text)]">
                      {item.description}
                      {item.productCode && (
                        <span className="block text-xs text-[var(--muted)]">
                          {item.productCode}
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-2 text-right text-[var(--muted)]">{item.quantity}</td>
                    <td className="py-2 px-2 text-right text-[var(--muted)]">
                      {formatCurrency(item.unitPrice, data.currency)}
                    </td>
                    <td className="py-2 pl-2 text-right text-[var(--text)]">
                      {formatCurrency(item.amount, data.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Raw OCR Text */}
      <div className="bg-[var(--bg)] rounded-lg p-4 border border-[var(--border)]">
        <h3 className="font-semibold text-[var(--text)] mb-3">Raw OCR Text</h3>
        <pre className="bg-[var(--surface)] p-4 rounded-lg text-sm text-[var(--muted)] overflow-auto max-h-64 whitespace-pre-wrap border border-[var(--border)]">
          {data.rawOcrText}
        </pre>
      </div>
    </div>
  );
}
