'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useOrganization } from '@/contexts/OrganizationContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface ReceiptStats {
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  totalAmount: number;
  averageAmount: number;
}

export default function DashboardPage() {
  const { currentOrg, isLoading: isOrgLoading } = useOrganization();
  const [stats, setStats] = useState<ReceiptStats>({
    total: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    totalAmount: 0,
    averageAmount: 0,
  });
  const [recentReceipts, setRecentReceipts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    if (!currentOrg) return;

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    setIsLoading(true);
    try {
      const statsResponse = await fetch('/api/receipts/stats/summary', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (statsResponse.status === 401) {
        // Handle auth error if needed
        return;
      }
      const statsData = await statsResponse.json();

      if (statsData.status.code === 200) {
        setStats(statsData.data);
      }

      const receiptsResponse = await fetch('/api/receipts?page=1&limit=5', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const receiptsData = await receiptsResponse.json();

      if (receiptsData.status.code === 200) {
        setRecentReceipts(receiptsData.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentOrg]);

  useEffect(() => {
    if (currentOrg) {
      fetchDashboardData();
    }
  }, [currentOrg, fetchDashboardData]);

  const formatCurrency = (amount: number, currency: string = 'THB') => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Page header */}
          <div>
            <h1 className="text-3xl font-bold text-[var(--text)]">Dashboard</h1>
            <p className="mt-2 text-[var(--muted)]">
              Welcome back! Here's an overview of your receipts.
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[var(--surface)] rounded-xl p-6 border border-[var(--border)] hover:border-[var(--button-primary)]/30 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--muted)]">Total Receipts</p>
                  <p className="text-3xl font-bold text-[var(--text)] mt-2">{stats.total}</p>
                </div>
                <div className="h-12 w-12 bg-[var(--button-primary)]/10 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-[var(--button-primary)]"
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
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-[var(--button-primary)]">↑ {stats.today}</span>
                <span className="text-[var(--muted)] ml-2">today</span>
              </div>
            </div>

            <div className="bg-[var(--surface)] rounded-xl p-6 border border-[var(--border)] hover:border-[var(--button-primary)]/30 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--muted)]">This Week</p>
                  <p className="text-3xl font-bold text-[var(--text)] mt-2">{stats.thisWeek}</p>
                </div>
                <div className="h-12 w-12 bg-[var(--button-primary)]/10 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-[var(--button-primary)]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-[var(--muted)]">Last 7 days</span>
              </div>
            </div>

            <div className="bg-[var(--surface)] rounded-xl p-6 border border-[var(--border)] hover:border-[var(--success)]/30 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--muted)]">Total Amount</p>
                  <p className="text-2xl font-bold text-[var(--text)] mt-2">
                    {formatCurrency(stats.totalAmount)}
                  </p>
                </div>
                <div className="h-12 w-12 bg-[var(--success)]/10 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-[var(--success)]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-[var(--muted)]">All time</span>
              </div>
            </div>

            <div className="bg-[var(--surface)] rounded-xl p-6 border border-[var(--border)] hover:border-[#F59E0B]/30 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--muted)]">Average</p>
                  <p className="text-2xl font-bold text-[var(--text)] mt-2">
                    {formatCurrency(stats.averageAmount)}
                  </p>
                </div>
                <div className="h-12 w-12 bg-[#F59E0B]/10 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-[#F59E0B]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-[var(--muted)]">Per receipt</span>
              </div>
            </div>
          </div>

          {/* Recent receipts */}
          <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] transition-colors duration-200">
            <div className="px-6 py-4 border-b border-[var(--border)]">
              <h2 className="text-xl font-semibold text-[var(--text)]">Recent Receipts</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">Latest uploaded receipts</p>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {recentReceipts.map((receipt) => (
                <Link
                  key={receipt.uid}
                  href={`/receipts/${receipt.uid}`}
                  className="px-6 py-4 hover:bg-[var(--bg)] transition-colors block"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 bg-[var(--button-primary)]/10 rounded-lg flex items-center justify-center">
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
                        <p className="font-medium text-[var(--text)]">{receipt.merchantName}</p>
                        <p className="text-sm text-[var(--muted)]">{formatDate(receipt.date)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[var(--text)]">
                        {formatCurrency(receipt.totalAmount, receipt.currency)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-[var(--border)]">
              <a
                href="/receipts"
                className="text-sm font-medium text-[var(--button-primary)] hover:text-[var(--button-hover)] transition-colors"
              >
                View all receipts →
              </a>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
