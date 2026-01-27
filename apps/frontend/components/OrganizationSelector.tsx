'use client';

import { useState, useRef, useEffect } from 'react';
import { useOrganization } from '@/contexts/OrganizationContext';

/**
 * OrganizationSelector component for switching between organizations.
 */
export default function OrganizationSelector() {
  const { organizations, currentOrg, switchOrg, isLoading } = useOrganization();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isLoading) {
    return (
      <div className="h-10 w-48 bg-[var(--bg)] rounded-lg animate-pulse"></div>
    );
  }

  if (organizations.length === 0) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--bg)] transition-colors min-w-[180px]"
      >
        <div className="h-6 w-6 rounded-full bg-[var(--button-primary)] flex items-center justify-center text-white text-xs font-bold">
          {currentOrg?.name?.charAt(0).toUpperCase() || 'O'}
        </div>
        <span className="text-sm font-medium text-[var(--text)] truncate flex-1 text-left">
          {currentOrg?.name || 'Select Organization'}
        </span>
        <svg
          className={`w-4 h-4 text-[var(--muted)] transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="py-1">
            {organizations.map((org) => (
              <button
                key={org.uid}
                onClick={() => {
                  switchOrg(org);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 flex items-center space-x-2 text-left hover:bg-[var(--bg)] transition-colors ${
                  currentOrg?.uid === org.uid ? 'bg-[var(--button-primary)]/10' : ''
                }`}
              >
                <div className="h-6 w-6 rounded-full bg-[var(--button-primary)] flex items-center justify-center text-white text-xs font-bold">
                  {org.name?.charAt(0).toUpperCase() || 'O'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[var(--text)] truncate">
                    {org.name}
                  </div>
                  <div className="text-xs text-[var(--muted)] capitalize">
                    {org.role?.name}
                  </div>
                </div>
                {currentOrg?.uid === org.uid && (
                  <svg className="w-4 h-4 text-[var(--button-primary)]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
