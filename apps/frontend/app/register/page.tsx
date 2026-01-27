'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import Link from 'next/link';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterSchema } from '@/lib/schemas/register-schema';

export default function RegisterPage() {
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  
  const { register: registerUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched', // Validate on blur
  });

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);

  const onSubmit = async (data: RegisterSchema) => {
    setServerError(null);
    try {
      await registerUser(data);
      setSuccess(true);
      reset(); 
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Registration failed');
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
      {/* Theme toggle button */}
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
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-[var(--text)]">Create an Account</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Start managing your receipts today
          </p>
        </div>

        <div className="bg-[var(--surface)] rounded-2xl shadow-xl p-8 border border-[var(--border)] transition-colors duration-200">
          {success ? (
            <div className="text-center space-y-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900">
                <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-[var(--text)]">Registration Successful!</h3>
              <p className="text-[var(--muted)]">
                Please check your email to verify your account before logging in.
              </p>
              <div className="pt-4">
                <Link
                  href="/login"
                  className="inline-flex justify-center w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[var(--button-primary)] hover:bg-[var(--button-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--button-primary)] transition-all"
                >
                  Return to Login
                </Link>
              </div>
            </div>
          ) : (
            <>
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
            {serverError && (
              <div className="bg-[var(--error)]/10 border border-[var(--error)]/30 text-[var(--error)] px-4 py-3 rounded-lg text-sm">
                {serverError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-[var(--text)] mb-2">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  {...register('firstName')}
                  className={`appearance-none block w-full px-4 py-3 bg-[var(--bg)] border rounded-lg text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--button-primary)] focus:border-transparent transition-all ${
                    errors.firstName ? 'border-[var(--error)]' : 'border-[var(--border)]'
                  }`}
                  placeholder="John"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-[var(--error)]">{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-[var(--text)] mb-2">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  {...register('lastName')}
                  className={`appearance-none block w-full px-4 py-3 bg-[var(--bg)] border rounded-lg text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--button-primary)] focus:border-transparent transition-all ${
                    errors.lastName ? 'border-[var(--error)]' : 'border-[var(--border)]'
                  }`}
                  placeholder="Doe"
                />
                 {errors.lastName && (
                  <p className="mt-1 text-sm text-[var(--error)]">{errors.lastName.message}</p>
                )}
              </div>
            </div>

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
                placeholder="john@example.com"
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
                autoComplete="new-password"
                {...register('password')}
                className={`appearance-none block w-full px-4 py-3 bg-[var(--bg)] border rounded-lg text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--button-primary)] focus:border-transparent transition-all ${
                    errors.password ? 'border-[var(--error)]' : 'border-[var(--border)]'
                  }`}
                placeholder="Min. 8 characters"
              />
               {errors.password && (
                  <p className="mt-1 text-sm text-[var(--error)]">{errors.password.message}</p>
                )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[var(--text)] mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                {...register('confirmPassword')}
                className={`appearance-none block w-full px-4 py-3 bg-[var(--bg)] border rounded-lg text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--button-primary)] focus:border-transparent transition-all ${
                    errors.confirmPassword ? 'border-[var(--error)]' : 'border-[var(--border)]'
                  }`}
                placeholder="Re-enter your password"
              />
               {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-[var(--error)]">{errors.confirmPassword.message}</p>
                )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-white font-medium bg-[var(--button-primary)] hover:bg-[var(--button-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--button-primary)] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-3">
                  <LoadingSpinner size="sm" color="white" />
                  Creating Account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--border)]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[var(--surface)] text-[var(--muted)]">Already have an account?</span>
              </div>
            </div>

            <div className="mt-4 text-center">
              <Link href="/login" className="font-medium text-[var(--button-primary)] hover:text-[var(--button-hover)] transition-colors">
                Sign in here
              </Link>
            </div>
          </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
