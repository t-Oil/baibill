'use client';

import { useState, useEffect, useCallback } from 'react';

interface SearchInputProps {
  placeholder?: string;
  debounceMs?: number;
  onSearch: (value: string) => void;
  initialValue?: string;
}

/**
 * Reusable search input component with debounce functionality.
 * @param placeholder - Placeholder text for the input
 * @param debounceMs - Debounce delay in milliseconds (default: 2000)
 * @param onSearch - Callback function triggered after debounce
 * @param initialValue - Initial value for the input
 */
export function SearchInput({
  placeholder = 'Search...',
  debounceMs = 2000,
  onSearch,
  initialValue = '',
}: SearchInputProps) {
  const [inputValue, setInputValue] = useState(initialValue);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (inputValue === initialValue) return;

    setIsTyping(true);
    const timer = setTimeout(() => {
      onSearch(inputValue);
      setIsTyping(false);
    }, debounceMs);

    return () => {
      clearTimeout(timer);
    };
  }, [inputValue, debounceMs, onSearch, initialValue]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  const handleClear = useCallback(() => {
    setInputValue('');
    onSearch('');
    setIsTyping(false);
  }, [onSearch]);

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        {isTyping ? (
          <svg
            className="h-5 w-5 text-[var(--button-primary)] animate-pulse"
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
        ) : (
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
        )}
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleChange}
        className="block w-full pl-10 pr-10 py-3 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--button-primary)] focus:border-transparent transition-all"
      />
      {inputValue && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--muted)] hover:text-[var(--text)] transition-colors"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
      {isTyping && (
        <div className="absolute right-10 inset-y-0 flex items-center">
          <span className="text-xs text-[var(--muted)]">Searching...</span>
        </div>
      )}
    </div>
  );
}
