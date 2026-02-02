'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { apiGet } from '@/lib/api';

interface LineItem {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  productCode?: string;
}

interface Receipt {
  uid: string;
  merchantName: string;
  companyTaxId?: string;
  companyAddress?: string;
  receiptNo?: string;
  totalAmount: number;
  subtotal?: number;
  vatAmount?: number;
  vatIncluded: boolean;
  currency: string;
  date: string;
  rawOcrText: string;
  createdAt: string;
  lineItems?: LineItem[];
}

export default function ReceiptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.uid) {
      fetchReceipt(params.uid as string);
    }
  }, [params.uid]);

  const fetchReceipt = async (uid: string) => {
    try {
      const response = await apiGet(`/api/receipts/${uid}`);
      const data = await response.json();

      if (data.status.code === 200) {
        setReceipt(data.data);
      } else {
        setError(data.error?.errors?.[0] || 'Receipt not found');
      }
    } catch (err) {
      setError('Failed to load receipt');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'THB') => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="xl" />
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (error || !receipt) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="max-w-4xl mx-auto">
            <div className="bg-[var(--error)]/10 border border-[var(--error)]/30 rounded-xl p-6 text-center">
              <svg
                className="mx-auto h-12 w-12 text-[var(--error)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-[var(--error)]">
                {error || 'Receipt not found'}
              </h3>
              <div className="mt-6">
                <Link
                  href="/receipts"
                  className="inline-flex items-center px-4 py-2 bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] rounded-lg hover:bg-[var(--bg)] transition-colors"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Back to Receipts
                </Link>
              </div>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <Link
                href="/receipts"
                className="inline-flex items-center text-sm text-[var(--muted)] hover:text-[var(--button-primary)] transition-colors mb-2"
              >
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back to Receipts
              </Link>
              <h1 className="text-3xl font-bold text-[var(--text)]">{receipt.merchantName}</h1>
              <p className="mt-1 text-[var(--muted)]">Receipt from {formatDate(receipt.date)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-[var(--muted)]">Total Amount</p>
              <p className="text-3xl font-bold text-[var(--success)]">
                {formatCurrency(receipt.totalAmount, receipt.currency)}
              </p>
            </div>
          </div>

          {/* Main Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-[var(--surface)] rounded-xl p-4 border border-[var(--border)] transition-colors duration-200">
              <p className="text-sm text-[var(--muted)]">Merchant</p>
              <p className="text-lg font-medium text-[var(--text)]">{receipt.merchantName}</p>
            </div>

            <div className="bg-[var(--surface)] rounded-xl p-4 border border-[var(--border)] transition-colors duration-200">
              <p className="text-sm text-[var(--muted)]">Date</p>
              <p className="text-lg font-medium text-[var(--text)]">{formatDate(receipt.date)}</p>
            </div>

            <div className="bg-[var(--surface)] rounded-xl p-4 border border-[var(--border)] transition-colors duration-200">
              <p className="text-sm text-[var(--muted)]">VAT Status</p>
              <span
                className={`inline-flex px-2 py-1 text-sm font-medium rounded-full ${
                  receipt.vatIncluded
                    ? 'bg-[var(--success)]/10 text-[var(--success)]'
                    : 'bg-[var(--muted)]/10 text-[var(--muted)]'
                }`}
              >
                {receipt.vatIncluded ? 'VAT Included' : 'VAT Excluded'}
              </span>
            </div>

            {receipt.receiptNo && (
              <div className="bg-[var(--surface)] rounded-xl p-4 border border-[var(--border)] transition-colors duration-200">
                <p className="text-sm text-[var(--muted)]">Receipt No</p>
                <p className="text-lg font-medium text-[var(--text)]">{receipt.receiptNo}</p>
              </div>
            )}

            {receipt.companyTaxId && (
              <div className="bg-[var(--surface)] rounded-xl p-4 border border-[var(--border)] transition-colors duration-200">
                <p className="text-sm text-[var(--muted)]">Tax ID</p>
                <p className="text-lg font-medium text-[var(--text)]">{receipt.companyTaxId}</p>
              </div>
            )}

            <div className="bg-[var(--surface)] rounded-xl p-4 border border-[var(--border)] transition-colors duration-200">
              <p className="text-sm text-[var(--muted)]">Uploaded</p>
              <p className="text-lg font-medium text-[var(--text)]">
                {formatDateTime(receipt.createdAt)}
              </p>
            </div>
          </div>

          {/* Amount Breakdown */}
          {(receipt.subtotal || receipt.vatAmount) && (
            <div className="bg-[var(--surface)] rounded-xl p-6 border border-[var(--border)] transition-colors duration-200">
              <h2 className="text-xl font-semibold text-[var(--text)] mb-4">Amount Breakdown</h2>
              <div className="space-y-3">
                {receipt.subtotal && receipt.subtotal > 0 && (
                  <div className="flex justify-between text-[var(--muted)]">
                    <span>Subtotal</span>
                    <span className="text-[var(--text)]">
                      {formatCurrency(receipt.subtotal, receipt.currency)}
                    </span>
                  </div>
                )}
                {receipt.vatAmount && receipt.vatAmount > 0 && (
                  <div className="flex justify-between text-[var(--muted)]">
                    <span>VAT (7%)</span>
                    <span className="text-[var(--text)]">
                      {formatCurrency(receipt.vatAmount, receipt.currency)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-[var(--text)] font-semibold border-t border-[var(--border)] pt-3">
                  <span>Total</span>
                  <span className="text-[var(--success)] text-xl">
                    {formatCurrency(receipt.totalAmount, receipt.currency)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Line Items */}
          {receipt.lineItems && receipt.lineItems.length > 0 && (
            <div className="bg-[var(--surface)] rounded-xl p-6 border border-[var(--border)] transition-colors duration-200">
              <h2 className="text-xl font-semibold text-[var(--text)] mb-4">
                Line Items ({receipt.lineItems.length})
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-[var(--muted)] border-b border-[var(--border)]">
                      <th className="text-left py-3 pr-4 font-medium">Description</th>
                      <th className="text-right py-3 px-4 font-medium">Qty</th>
                      <th className="text-right py-3 px-4 font-medium">Unit Price</th>
                      <th className="text-right py-3 pl-4 font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receipt.lineItems.map((item, index) => (
                      <tr
                        key={item.id || index}
                        className="border-b border-[var(--border)]/50 hover:bg-[var(--bg)] transition-colors"
                      >
                        <td className="py-3 pr-4">
                          <span className="text-[var(--text)]">{item.description}</span>
                          {item.productCode && (
                            <span className="block text-xs text-[var(--muted)] mt-1">
                              Code: {item.productCode}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right text-[var(--muted)]">
                          {Number(item.quantity).toFixed(item.quantity % 1 === 0 ? 0 : 3)}
                        </td>
                        <td className="py-3 px-4 text-right text-[var(--muted)]">
                          {formatCurrency(item.unitPrice, receipt.currency)}
                        </td>
                        <td className="py-3 pl-4 text-right text-[var(--text)] font-medium">
                          {formatCurrency(item.amount, receipt.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-[var(--border)]">
                      <td
                        colSpan={3}
                        className="py-3 pr-4 text-right font-semibold text-[var(--text)]"
                      >
                        Total
                      </td>
                      <td className="py-3 pl-4 text-right font-bold text-[var(--success)] text-lg">
                        {formatCurrency(receipt.totalAmount, receipt.currency)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Raw OCR Text */}
          <div className="bg-[var(--surface)] rounded-xl p-6 border border-[var(--border)] transition-colors duration-200">
            <h2 className="text-xl font-semibold text-[var(--text)] mb-4">Raw OCR Text</h2>
            <pre className="bg-[var(--bg)] p-4 rounded-lg text-sm text-[var(--muted)] overflow-auto max-h-96 whitespace-pre-wrap font-mono border border-[var(--border)]">
              {receipt.rawOcrText}
            </pre>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
