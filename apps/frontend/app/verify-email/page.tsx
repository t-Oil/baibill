'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import Link from 'next/link';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. Missing token.');
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await res.json();

        if (res.ok) {
          setStatus('success');
          setMessage(data.data?.message || 'Email verified successfully!');
        } else {
          setStatus('error');
          setMessage(
            data.error?.message || 'Verification failed. The link may be invalid or expired.',
          );
        }
      } catch (err) {
        setStatus('error');
        setMessage('Something went wrong during verification. Please try again.');
        console.error(err);
      }
    };

    verify();
  }, [token]);

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-8">
        <LoadingSpinner size="xl" />
        <p className="text-[var(--text)] text-lg">Verifying your email...</p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="text-center space-y-6 py-4">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900">
          <svg
            className="h-8 w-8 text-green-600 dark:text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[var(--text)] mb-2">Verified!</h2>
          <p className="text-[var(--muted)]">{message}</p>
        </div>
        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex justify-center w-full px-4 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-[var(--button-primary)] hover:bg-[var(--button-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--button-primary)] transition-all shadow-lg"
          >
            Continue to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center space-y-6 py-4">
      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900">
        <svg
          className="h-8 w-8 text-red-600 dark:text-red-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-[var(--text)] mb-2">Verification Failed</h2>
        <p className="text-[var(--error)]">{message}</p>
      </div>
      <div className="pt-2">
        <Link
          href="/login"
          className="inline-flex justify-center w-full px-4 py-3 border border-[var(--border)] text-base font-medium rounded-lg text-[var(--text)] bg-[var(--surface)] hover:bg-[var(--bg)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--button-primary)] transition-all"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4">
      <div className="max-w-md w-full bg-[var(--surface)] p-8 rounded-2xl shadow-xl border border-[var(--border)] transition-colors duration-200">
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <LoadingSpinner size="xl" />
            </div>
          }
        >
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  );
}
