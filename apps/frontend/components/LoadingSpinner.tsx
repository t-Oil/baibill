import React from 'react';

type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  className?: string;
  color?: string; // Optional custom color, defaults to var(--loading) via CSS class logic or style
}

/**
 * Reusable loading spinner component.
 * @param size Size of the spinner (sm, md, lg, xl). Default: 'md'
 * @param className Additional CSS classes
 * @param color Optional custom color override
 */
export function LoadingSpinner({ 
  size = 'md', 
  className = '',
  color 
}: LoadingSpinnerProps) {
  

  const sizeClasses = {
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-4',
    lg: 'h-10 w-10 border-4',
    xl: 'h-12 w-12 border-4',
  };

  const spinnerStyle = color ? { borderColor: `${color} transparent ${color} ${color}` } : {};
  
  return (
    <div
      className={`animate-spin rounded-full ${sizeClasses[size]} border-t-transparent border-b-transparent border-[var(--loading)] ${className}`}
      style={color ? { borderColor: `${color} transparent ${color} transparent` } : undefined}
      role="status"
      aria-label="Loading"
    />
  );
}

/**
 * Full page loading overlay using the LoadingSpinner.
 */
export function FullPageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
      <LoadingSpinner size="xl" />
    </div>
  );
}
