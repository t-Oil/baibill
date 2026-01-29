'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

export default function LandingPage() {
  const { user, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#141312] text-[#EDEBE7] selection:bg-[#C5A265]/30">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-[#141312]/80 backdrop-blur-md border-b border-[#2A2623]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#C5A265] rounded-lg flex items-center justify-center">
                <span className="text-[#141312] font-bold text-lg">B</span>
              </div>
              <span className="font-bold text-xl tracking-tight text-[#EDEBE7]">BaiBill</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-sm font-medium text-[#A8A29E] hover:text-[#C5A265] transition-colors"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-sm font-medium text-[#A8A29E] hover:text-[#C5A265] transition-colors"
              >
                How it works
              </a>
              <a
                href="https://github.com/t-Oil/baibill"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-[#A8A29E] hover:text-[#C5A265] transition-colors"
              >
                Docs
              </a>
            </div>

            <div className="flex items-center gap-4">
              {!isLoading && user ? (
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-sm font-medium text-[#141312] bg-[#EDEBE7] hover:bg-white rounded-full transition-all"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm font-medium text-[#A8A29E] hover:text-[#C5A265] transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 text-sm font-medium text-[#141312] bg-[#C5A265] hover:bg-[#B08D55] rounded-full shadow-lg shadow-[#C5A265]/20 transition-all"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[#C5A265]/10 rounded-full blur-[100px] -z-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A265]/10 border border-[#C5A265]/20 text-[#C5A265] text-sm font-medium mb-8 animate-fade-in-up">
            <span className="w-2 h-2 rounded-full bg-[#C5A265] animate-pulse"></span>
            v1.0 is now released.
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-[#EDEBE7]">
            Turn Receipts <br />
            <span className="text-[#C5A265]">into Structured Data</span>
          </h1>

          <p className="max-w-5xl mx-auto text-lg md:text-xl text-[#A8A29E] mb-10 leading-relaxed">
            Self-hosted OCR + AI to extract structured data from receipts. Privacy-first. No vendor
            lock-in.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://github.com/t-Oil/baibill"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-[#EDEBE7] bg-[#1C1A19] hover:bg-[#2A2623] border border-[#2A2623] rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
              View on GitHub
            </a>
          </div>

          <div className="mt-20 relative mx-auto max-w-5xl">
            <div className="relative rounded-xl bg-[#1C1A19] border border-[#2A2623] p-2 shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#C5A265]/10 to-transparent pointer-events-none"></div>
              <img
                src="/dashboard-preview.png"
                alt="Dashboard Preview"
                className="rounded-lg shadow-inner w-full"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-[#1C1A19] border-t border-[#2A2623]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#EDEBE7] mb-4">
              Everything you need to manage receipts
            </h2>
            <p className="text-[#A8A29E] max-w-2xl mx-auto">
              Built for speed, accuracy, and privacy. Designed for modern finance workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-[#141312] border border-[#2A2623] hover:border-[#C5A265]/50 transition-all group hover:shadow-lg hover:shadow-[#C5A265]/5">
              <div className="w-12 h-12 bg-[#C5A265]/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-[#C5A265]/20 transition-colors">
                <svg
                  className="w-6 h-6 text-[#C5A265]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#EDEBE7] mb-3">AI-Powered Extraction</h3>
              <p className="text-[#A8A29E] leading-relaxed">
                Extract merchants, dates, totals, and line items using OCR + AI (Google Vision,
                GPT-4 compatible).
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#141312] border border-[#2A2623] hover:border-[#C5A265]/50 transition-all group hover:shadow-lg hover:shadow-[#C5A265]/5">
              <div className="w-12 h-12 bg-[#C5A265]/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-[#C5A265]/20 transition-colors">
                <svg
                  className="w-6 h-6 text-[#C5A265]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#EDEBE7] mb-3">Multi-Organization</h3>
              <p className="text-[#A8A29E] leading-relaxed">
                Manage personal and business expenses separately. Create multiple organizations and
                invite team members.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#141312] border border-[#2A2623] hover:border-[#C5A265]/50 transition-all group hover:shadow-lg hover:shadow-[#C5A265]/5">
              <div className="w-12 h-12 bg-[#C5A265]/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-[#C5A265]/20 transition-colors">
                <svg
                  className="w-6 h-6 text-[#C5A265]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#EDEBE7] mb-3">Privacy First</h3>
              <p className="text-[#A8A29E] leading-relaxed">
                Your data stays with you. Self-host on your own infrastructure with Docker. No
                third-party data mining.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2A2623] py-12 bg-[#141312]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#C5A265] rounded-md flex items-center justify-center">
                <span className="text-[#141312] text-xs font-bold">B</span>
              </div>
              <span className="font-semibold text-lg text-[#EDEBE7]">BaiBill</span>
            </div>

            <div className="text-[#A8A29E] text-sm">
              © {new Date().getFullYear()} BaiBill. Open-source software released under the MIT
              License.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
