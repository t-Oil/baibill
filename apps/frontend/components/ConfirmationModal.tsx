import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isConfirming?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'primary' | 'warning';
}

/**
 * A reusable modal component for confirmation actions.
 * @param isOpen Whether the modal is open
 * @param title Modal title
 * @param message Modal message
 * @param confirmLabel Label for confirm button (default: "Confirm")
 * @param cancelLabel Label for cancel button (default: "Cancel")
 * @param isConfirming Whether the confirm action is in progress
 * @param onConfirm Callback when confirm is clicked
 * @param onCancel Callback when cancel is clicked
 * @param variant Style variant for confirm button (default: "primary")
 */
export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isConfirming = false,
  onConfirm,
  onCancel,
  variant = 'primary',
}) => {
  if (!isOpen) return null;

  const getButtonColor = () => {
    switch (variant) {
      case 'danger':
        return 'bg-red-500 hover:bg-red-600 focus:ring-red-500';
      case 'warning':
        return 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-500';
      default:
        return 'bg-[var(--button-primary)] hover:bg-[var(--button-hover)] focus:ring-[var(--button-primary)]';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] w-full max-w-sm shadow-xl transform transition-all animate-scaleIn">
        <div className="px-6 py-4 border-b border-[var(--border)] flex justify-between items-center">
          <h2 className="text-xl font-semibold text-[var(--text)]">{title}</h2>
          <button onClick={onCancel} className="p-1 hover:bg-[var(--bg)] rounded transition-colors">
            <svg
              className="w-5 h-5 text-[var(--muted)]"
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
          </button>
        </div>

        <div className="p-6">
          <p className="text-[var(--text)]">{message}</p>
        </div>

        <div className="px-6 py-4 border-t border-[var(--border)] flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isConfirming}
            className="px-4 py-2 text-[var(--text)] hover:bg-[var(--bg)] rounded-lg transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isConfirming}
            className={`px-4 py-2 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 ${getButtonColor()}`}
          >
            {isConfirming && <LoadingSpinner size="sm" color="white" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
