import React, { useRef } from 'react';

/**
 * Props for UploadForm component.
 */
interface UploadFormProps {
  onUpload: (file: File) => void;
  loading: boolean;
}

/**
 * Upload form component for selecting and uploading files.
 * Resets input after each selection to allow re-uploading the same file.
 * @param props Component props
 * @returns Upload form component
 */
export function UploadForm({ onUpload, loading }: UploadFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * Handles file selection and triggers upload.
   * Resets input value to allow re-selecting the same file.
   * @param e Change event
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
      // Reset input value to allow uploading the same file again
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  return (
    <div className="border-2 border-dashed border-[var(--border)] rounded-lg p-8 mb-8 bg-[var(--bg)] hover:border-[var(--button-primary)]/50 transition-colors">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={loading}
        className="block w-full text-sm text-[var(--muted)]
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-[var(--button-primary)]/10 file:text-[var(--button-primary)]
          hover:file:bg-[var(--button-primary)]/20"
      />
      {loading && <p className="mt-4 text-[var(--muted)]">Processing...</p>}
    </div>
  );
}

