'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useOrganization } from '@/contexts/OrganizationContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { apiFetch } from '@/lib/api';

interface Receipt {
  uid: string;
  merchantName: string;
  companyTaxId?: string;
  receiptNo?: string;
  totalAmount: number;
  currency: string;
  date: string;
  vatIncluded: boolean;
  createdAt: string;
}

/**
 * ReceiptsPage component displaying list of receipts with pagination and search.
 */
export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const itemsPerPage = 10;
  const { currentOrg } = useOrganization();

  useEffect(() => {
    fetchReceipts();
  }, [currentPage, searchQuery, currentOrg]);

  const fetchReceipts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await apiFetch(`/api/receipts?${params.toString()}`);
      const data = await response.json();

      if (data.status.code === 200) {
        setReceipts(data.data.data);
        setTotalPages(data.data.pagination.totalPages);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch receipts:', error);
      setIsLoading(false);
    }
  };

  /**
   * Handles receipt export to CSV or Excel.
   * @param format Export format ('csv' or 'excel')
   */
  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      const params = new URLSearchParams();

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      params.append('format', format);

      const response = await apiFetch(`/api/receipts/export?${params.toString()}`);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipts-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.${format === 'excel' ? 'xlsx' : 'csv'}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error('Failed to export receipts');
      }
    } catch (error) {
      console.error('Failed to export receipts:', error);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'THB') => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Page header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[var(--text)]">Receipts</h1>
              <p className="mt-2 text-[var(--muted)]">Manage and view all your receipts</p>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="inline-flex items-center px-4 py-2 bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] rounded-lg hover:bg-[var(--bg)] transition-all font-medium"
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
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Export
                  <svg
                    className={`w-4 h-4 ml-2 transition-transform ${showExportMenu ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {showExportMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowExportMenu(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-48 bg-[var(--surface)] rounded-lg shadow-lg z-20 border border-[var(--border)] py-1">
                      <button
                        onClick={() => {
                          handleExport('csv');
                          setShowExportMenu(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-[var(--text)] hover:bg-[var(--bg)] transition-colors"
                      >
                        <svg
                          className="w-4 h-4 mr-2 text-[var(--muted)]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        Export CSV
                      </button>
                      <button
                        onClick={() => {
                          handleExport('excel');
                          setShowExportMenu(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-[var(--text)] hover:bg-[var(--bg)] transition-colors"
                      >
                        <svg
                          className="w-4 h-4 mr-2 text-[var(--muted)]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        Export Excel
                      </button>
                    </div>
                  </>
                )}
              </div>
              <Link
                href="/upload"
                className="inline-flex items-center px-4 py-2 bg-[var(--button-primary)] text-white rounded-lg hover:bg-[var(--button-hover)] transition-all font-medium"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Upload Receipt
              </Link>
            </div>
          </div>

          {/* Search bar */}
          <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4 transition-colors duration-200">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-[var(--muted)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by merchant or receipt number..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="block w-full pl-10 pr-3 py-3 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--button-primary)] focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Receipts table */}
          <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] overflow-hidden transition-colors duration-200">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="xl" />
              </div>
            ) : receipts.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-[var(--muted)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-[var(--text)]">No receipts found</h3>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Get started by uploading a receipt.
                </p>
                <div className="mt-6">
                  <Link
                    href="/upload"
                    className="inline-flex items-center px-4 py-2 bg-[var(--button-primary)] text-white rounded-lg hover:bg-[var(--button-hover)] transition-all font-medium"
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
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Upload Receipt
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-[var(--border)]">
                    <thead className="bg-[var(--bg)]">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                          Merchant
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                          Receipt No
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                          VAT
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                      {receipts.map((receipt) => (
                        <tr key={receipt.uid} className="hover:bg-[var(--bg)] transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0 bg-[var(--button-primary)]/10 rounded-lg flex items-center justify-center">
                                <svg
                                  className="w-5 h-5 text-[var(--button-primary)]"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                  />
                                </svg>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-[var(--text)]">
                                  {receipt.merchantName}
                                </div>
                                {receipt.companyTaxId && (
                                  <div className="text-sm text-[var(--muted)]">
                                    Tax ID: {receipt.companyTaxId}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-[var(--text)]">
                              {receipt.receiptNo || '-'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-[var(--text)]">
                              {formatDate(receipt.date)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-semibold text-[var(--text)]">
                              {formatCurrency(receipt.totalAmount, receipt.currency)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                receipt.vatIncluded
                                  ? 'bg-[var(--success)]/10 text-[var(--success)]'
                                  : 'bg-[var(--muted)]/10 text-[var(--muted)]'
                              }`}
                            >
                              {receipt.vatIncluded ? 'Incl. VAT' : 'Excl. VAT'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <Link
                                href={`/receipts/${receipt.uid}`}
                                className="p-2 text-[var(--button-primary)] hover:bg-[var(--button-primary)]/10 rounded-lg transition-colors"
                                title="View"
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                              </Link>
                              <button
                                className="p-2 text-[var(--error)] hover:bg-[var(--error)]/10 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="md:hidden divide-y divide-[var(--border)]">
                  {receipts.map((receipt) => (
                    <div key={receipt.uid} className="p-4 hover:bg-[var(--bg)] transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 flex-shrink-0 bg-[var(--button-primary)]/10 rounded-lg flex items-center justify-center">
                            <svg
                              className="w-5 h-5 text-[var(--button-primary)]"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-[var(--text)]">
                              {receipt.merchantName}
                            </div>
                            <div className="text-xs text-[var(--muted)] mt-1">
                              {receipt.receiptNo || 'No receipt number'}
                            </div>
                          </div>
                        </div>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            receipt.vatIncluded
                              ? 'bg-[var(--success)]/10 text-[var(--success)]'
                              : 'bg-[var(--muted)]/10 text-[var(--muted)]'
                          }`}
                        >
                          {receipt.vatIncluded ? 'VAT' : 'No VAT'}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div>
                          <div className="text-sm text-[var(--muted)]">
                            {formatDate(receipt.date)}
                          </div>
                          <div className="text-lg font-semibold text-[var(--text)] mt-1">
                            {formatCurrency(receipt.totalAmount, receipt.currency)}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Link
                            href={`/receipts/${receipt.uid}`}
                            className="p-2 text-[var(--button-primary)] hover:bg-[var(--button-primary)]/10 rounded-lg transition-colors"
                            title="View"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </Link>
                          <button
                            className="p-2 text-[var(--error)] hover:bg-[var(--error)]/10 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="bg-[var(--bg)] px-4 py-3 flex items-center justify-between border-t border-[var(--border)] sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-[var(--text)] bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--bg)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-[var(--text)] bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--bg)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-[var(--muted)]">
                        Showing page{' '}
                        <span className="font-medium text-[var(--text)]">{currentPage}</span> of{' '}
                        <span className="font-medium text-[var(--text)]">{totalPages}</span>
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px">
                        <button
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-3 py-2 rounded-l-lg text-sm font-medium text-[var(--text)] bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--bg)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 19l-7-7 7-7"
                            />
                          </svg>
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNumber;
                          if (totalPages <= 5) {
                            pageNumber = i + 1;
                          } else if (currentPage <= 3) {
                            pageNumber = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNumber = totalPages - 4 + i;
                          } else {
                            pageNumber = currentPage - 2 + i;
                          }

                          return (
                            <button
                              key={pageNumber}
                              onClick={() => setCurrentPage(pageNumber)}
                              className={`relative inline-flex items-center px-4 py-2 text-sm font-medium transition-colors ${
                                currentPage === pageNumber
                                  ? 'bg-[var(--button-primary)] text-white'
                                  : 'text-[var(--text)] bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--bg)]'
                              }`}
                            >
                              {pageNumber}
                            </button>
                          );
                        })}
                        <button
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-3 py-2 rounded-r-lg text-sm font-medium text-[var(--text)] bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--bg)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
