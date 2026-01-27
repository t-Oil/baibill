'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import Link from 'next/link';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginSchema } from '@/lib/schemas/login-schema';

/**
 * Login page component handling user authentication.
 * @returns Login page UI
 */
export default function LoginPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
  });

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);

  const onSubmit = async (data: LoginSchema) => {
    setServerError(null);
    try {
      await login(data.email, data.password);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Invalid email or password');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4 transition-colors duration-200">
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 p-3 text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] rounded-lg border border-[var(--border)] transition-all"
      >
        {theme === 'light' ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        )}
      </button>

      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-[var(--button-primary)] rounded-xl flex items-center justify-center mb-4 shadow-lg">
            <svg
              className="h-10 w-10 text-white"
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
          <h2 className="text-3xl font-bold text-[var(--text)]">BaiBill Admin</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Sign in to access your dashboard
          </p>
        </div>

        <div className="bg-[var(--surface)] rounded-2xl shadow-xl p-8 border border-[var(--border)] transition-colors duration-200">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
            {serverError && (
              <div className="bg-[var(--error)]/10 border border-[var(--error)]/30 text-[var(--error)] px-4 py-3 rounded-lg text-sm">
                {serverError}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--text)] mb-2">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email')}
                className={`appearance-none block w-full px-4 py-3 bg-[var(--bg)] border rounded-lg text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--button-primary)] focus:border-transparent transition-all ${
                    errors.email ? 'border-[var(--error)]' : 'border-[var(--border)]'
                  }`}
                placeholder="admin@example.com"
              />
               {errors.email && (
                  <p className="mt-1 text-sm text-[var(--error)]">{errors.email.message}</p>
                )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[var(--text)] mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register('password')}
                className={`appearance-none block w-full px-4 py-3 bg-[var(--bg)] border rounded-lg text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--button-primary)] focus:border-transparent transition-all ${
                    errors.password ? 'border-[var(--error)]' : 'border-[var(--border)]'
                  }`}
                placeholder="••••••••"
              />
               {errors.password && (
                  <p className="mt-1 text-sm text-[var(--error)]">{errors.password.message}</p>
                )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-[var(--border)] bg-[var(--bg)] text-[var(--button-primary)] focus:ring-[var(--button-primary)]"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-[var(--muted)]">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-[var(--button-primary)] hover:text-[var(--button-hover)] transition-colors">
                  Forgot password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-white font-medium bg-[var(--button-primary)] hover:bg-[var(--button-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--button-primary)] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-3">
                  <LoadingSpinner size="sm" color="white" />
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--border)]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[var(--surface)] text-[var(--muted)]">Don't have an account?</span>
              </div>
            </div>

            <div className="mt-4 text-center">
              <Link href="/register" className="font-medium text-[var(--button-primary)] hover:text-[var(--button-hover)] transition-colors">
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
