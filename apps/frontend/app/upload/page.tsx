'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { UploadForm } from '@/components/UploadForm';
import { ResultView } from '@/components/ResultView';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet, apiPost } from '@/lib/api';

/**
 * UploadPage component for uploading receipt images.
 * Supports organization context to assign receipts to the current organization.
 * @returns Upload page component
 */
export default function UploadPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [uploadCount, setUploadCount] = useState<number | null>(null);
  const { currentOrg } = useOrganization();
  const { user } = useAuth();

  useEffect(() => {
    // Fetch upload count for users with upload limits
    if (user?.plan && user.plan.uploadLimit !== -1) {
      fetchUploadCount();
    }
  }, [user]);

  const fetchUploadCount = async () => {
    try {
      const response = await apiGet('/api/receipts/upload/count');
      const data = await response.json();
      if (data.status.code === 200) {
        setUploadCount(data.data.count || 0);
      }
    } catch (err) {
      console.error('Failed to fetch upload count:', err);
    }
  };

  /**
   * Handles the file upload process.
   * Performs OCR and receipt parsing via API.
   * @param file Uploaded image file
   */
  const handleUpload = async (file: File) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setResult(null);
    setProcessingStep('Uploading image...');

    const formData = new FormData();
    formData.append('file', file);

    try {
      setProcessingStep('Extracting text from image (OCR)...');

      const response = await apiPost('/api/receipts/upload', formData);

      setProcessingStep('Parsing receipt data...');

      const data = await response.json();

      // Check if response has an error field (even with 200 status)
      if (data.error) {
        const errorMessage =
          data.error.errors?.[0] ||
          data.error.message ||
          'Failed to process receipt';
        throw new Error(errorMessage);
      }

      // Check for success with data
      if (response.ok && data.status?.code === 200 && data.data) {
        setResult(data.data);
        const merchantName = data.data.merchantName || 'Unknown Merchant';
        setSuccess(`Receipt processed successfully! Merchant: ${merchantName}`);
        // Refresh upload count for users with upload limits
        if (user?.plan && user.plan.uploadLimit !== -1) {
          await fetchUploadCount();
        }
      } else if (!data.data) {
        throw new Error('No receipt data returned from server');
      } else {
        const errorMessage =
          data.status?.message ||
          data.message ||
          'Failed to process receipt';
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Upload failed:', error);

      if (error instanceof TypeError && error.message.includes('fetch')) {
        setError('Cannot connect to server. Please try again later.');
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
      setProcessingStep('');
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Page header */}
          <div>
            <h1 className="text-3xl font-bold text-[var(--text)]">Upload Receipt</h1>
            <p className="mt-2 text-[var(--muted)]">
              Upload a receipt image to extract and store information
              {currentOrg && (
                <span className="block mt-1 text-[var(--button-primary)]">
                  Uploading to: {currentOrg.name}
                </span>
              )}
            </p>
            {user?.plan && user.plan.uploadLimit !== -1 && uploadCount !== null && (
              <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  <strong>{user.plan.displayName} Plan:</strong> {uploadCount}/{user.plan.uploadLimit} receipts uploaded
                  {uploadCount >= user.plan.uploadLimit - 1 && uploadCount < user.plan.uploadLimit && (
                    <span className="block mt-1">You have {user.plan.uploadLimit - uploadCount} upload(s) remaining.</span>
                  )}
                  {uploadCount >= user.plan.uploadLimit && (
                    <span className="block mt-1 font-semibold">
                      Upload limit reached. Upgrade your plan for more uploads.
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Upload form */}
          <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-6 transition-colors duration-200">
            <UploadForm onUpload={handleUpload} loading={loading} />
          </div>

          {/* Processing indicator */}
          {loading && (
            <div className="bg-[var(--button-primary)]/10 border border-[var(--button-primary)]/30 rounded-xl p-6">
              <div className="flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--loading)]/30 border-t-[var(--loading)]"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-[var(--loading)]"
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
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-[var(--button-primary)]">
                      Processing Receipt
                    </h3>
                    <p className="mt-1 text-sm text-[var(--button-primary)]/80">{processingStep}</p>
                    <p className="mt-2 text-xs text-[var(--muted)]">
                      This may take a few seconds...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Success message */}
          {success && !loading && (
            <div className="bg-[var(--success)]/10 border border-[var(--success)]/30 rounded-xl p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-[var(--success)]"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-[var(--success)]">Success</h3>
                  <p className="mt-1 text-sm text-[var(--success)]/80">{success}</p>
                </div>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && !loading && (
            <div className="bg-[var(--error)]/10 border border-[var(--error)]/30 rounded-xl p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-[var(--error)]"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-[var(--error)]">Error</h3>
                  <p className="mt-1 text-sm text-[var(--error)]/80">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Result view */}
          {result && !loading && (
            <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-6 transition-colors duration-200">
              <ResultView data={result} />
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
