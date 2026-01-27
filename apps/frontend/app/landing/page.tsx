'use client';

import Link from 'next/link';

export default function LandingPage() {
  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      title: 'Intelligent OCR',
      description: 'Automatically extract text from receipt images using advanced AI models. Supports multiple currencies and formats.',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: 'Analytics Dashboard',
      description: 'Real-time statistics and insights. Track spending trends, average receipt amounts, and more.',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: 'Multi-Organization',
      description: 'Manage multiple organizations with role-based access. Perfect for teams and businesses.',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: 'Privacy First',
      description: 'Self-hosted solution. Your data stays on your servers. No third-party data sharing.',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: 'Enterprise Security',
      description: 'JWT authentication, password encryption, CORS protection, and comprehensive security headers.',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
      title: 'Easy Deployment',
      description: 'Docker Compose setup included. Deploy to any server in minutes with comprehensive documentation.',
    },
  ];

  const useCases = [
    {
      title: 'Small Businesses',
      description: 'Track expenses, manage receipts, and generate reports for accounting and tax purposes.',
      icon: '🏢',
    },
    {
      title: 'Accountants',
      description: 'Centralize client receipt management and streamline bookkeeping workflows.',
      icon: '💼',
    },
    {
      title: 'Freelancers',
      description: 'Organize business expenses and keep track of receipts for tax deductions.',
      icon: '👨‍💻',
    },
    {
      title: 'Finance Teams',
      description: 'Automate receipt processing and eliminate manual data entry.',
      icon: '📊',
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Hero Section */}
      <header className="border-b border-[var(--border)]">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <svg className="w-8 h-8 text-[var(--button-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-2xl font-bold text-[var(--text)]">Receipt OCR</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="px-4 py-2 text-[var(--text)] hover:text-[var(--button-primary)] transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-6 py-2 bg-[var(--button-primary)] hover:bg-[var(--button-hover)] text-white rounded-lg transition-colors font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-[var(--text)] mb-6">
            Digitize Your Receipts
            <br />
            <span className="text-[var(--button-primary)]">Automate Your Workflow</span>
          </h1>
          <p className="text-xl text-[var(--muted)] mb-8 max-w-3xl mx-auto">
            A modern, self-hosted receipt management system with powerful OCR capabilities.
            Extract data from receipts automatically, track expenses, and gain insights into your spending.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/register"
              className="px-8 py-4 bg-[var(--button-primary)] hover:bg-[var(--button-hover)] text-white rounded-lg transition-colors font-medium text-lg"
            >
              Start Free Trial
            </Link>
            <Link
              href="https://github.com/yourusername/receipt-ocr"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 border-2 border-[var(--border)] hover:border-[var(--button-primary)] text-[var(--text)] rounded-lg transition-colors font-medium text-lg"
            >
              View on GitHub
            </Link>
          </div>
          <div className="mt-6 flex items-center justify-center space-x-6 text-sm text-[var(--muted)]">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-[var(--success)]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-[var(--success)]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Open source</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-[var(--success)]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Self-hosted</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-[var(--surface)]">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[var(--text)] mb-4">Powerful Features</h2>
          <p className="text-xl text-[var(--muted)] max-w-2xl mx-auto">
            Everything you need to manage receipts efficiently and gain insights into your spending
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-6 hover:border-[var(--button-primary)] hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 bg-[var(--button-primary)]/10 rounded-lg flex items-center justify-center text-[var(--button-primary)] mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-[var(--text)] mb-2">{feature.title}</h3>
              <p className="text-[var(--muted)]">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Use Cases */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[var(--text)] mb-4">Who Is This For?</h2>
          <p className="text-xl text-[var(--muted)] max-w-2xl mx-auto">
            Built for businesses and individuals who value their data privacy and need powerful receipt management
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {useCases.map((useCase, index) => (
            <div
              key={index}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 hover:border-[var(--button-primary)] hover:shadow-md transition-all text-center"
            >
              <div className="text-5xl mb-4">{useCase.icon}</div>
              <h3 className="text-xl font-semibold text-[var(--text)] mb-2">{useCase.title}</h3>
              <p className="text-[var(--muted)]">{useCase.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-[var(--surface)]">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[var(--text)] mb-4">How It Works</h2>
          <p className="text-xl text-[var(--muted)] max-w-2xl mx-auto">
            Simple three-step process to digitize and manage your receipts
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-[var(--button-primary)] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              1
            </div>
            <h3 className="text-2xl font-semibold text-[var(--text)] mb-2">Upload</h3>
            <p className="text-[var(--muted)]">
              Take a photo or upload an image of your receipt. Supports JPG, PNG, and PDF formats.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-[var(--button-primary)] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              2
            </div>
            <h3 className="text-2xl font-semibold text-[var(--text)] mb-2">Extract</h3>
            <p className="text-[var(--muted)]">
              AI-powered OCR automatically extracts merchant, date, items, prices, and totals.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-[var(--button-primary)] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              3
            </div>
            <h3 className="text-2xl font-semibold text-[var(--text)] mb-2">Analyze</h3>
            <p className="text-[var(--muted)]">
              View analytics, track spending trends, and export data for accounting purposes.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-[var(--button-primary)]/10 border border-[var(--button-primary)]/20 rounded-2xl p-12 text-center">
          <h2 className="text-4xl font-bold text-[var(--text)] mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-[var(--muted)] mb-8 max-w-2xl mx-auto">
            Join thousands of users who have already digitized their receipt management workflow
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-4 bg-[var(--button-primary)] hover:bg-[var(--button-hover)] text-white rounded-lg transition-colors font-medium text-lg"
            >
              Create Free Account
            </Link>
            <Link
              href="https://github.com/yourusername/receipt-ocr"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--button-primary)] text-[var(--text)] rounded-lg transition-colors font-medium text-lg"
            >
              Deploy Your Own
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <svg className="w-8 h-8 text-[var(--button-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-xl font-bold text-[var(--text)]">Receipt OCR</span>
              </div>
              <p className="text-[var(--muted)] mb-4">
                Modern, self-hosted receipt management system with powerful OCR capabilities.
                Open source and privacy-first.
              </p>
              <p className="text-sm text-[var(--muted)]">
                © 2026 Receipt OCR. MIT License.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[var(--text)] mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link href="/login" className="text-[var(--muted)] hover:text-[var(--button-primary)] transition-colors">Features</Link></li>
                <li><Link href="/login" className="text-[var(--muted)] hover:text-[var(--button-primary)] transition-colors">Pricing</Link></li>
                <li><Link href="/login" className="text-[var(--muted)] hover:text-[var(--button-primary)] transition-colors">Documentation</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-[var(--text)] mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="https://github.com/yourusername/receipt-ocr" target="_blank" rel="noopener noreferrer" className="text-[var(--muted)] hover:text-[var(--button-primary)] transition-colors">GitHub</a></li>
                <li><a href="https://github.com/yourusername/receipt-ocr/issues" target="_blank" rel="noopener noreferrer" className="text-[var(--muted)] hover:text-[var(--button-primary)] transition-colors">Support</a></li>
                <li><Link href="/login" className="text-[var(--muted)] hover:text-[var(--button-primary)] transition-colors">Community</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
