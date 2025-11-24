/**
 * Modal component with focus trap and accessibility
 * Requirements: 9.4, 10.4
 */

'use client';

import React, { useEffect, useRef } from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  
  useEffect(() => {
    if (isOpen) {
      // Store the element that had focus before modal opened
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focus the modal
      modalRef.current?.focus();
      
      // Handle Escape key
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        document.removeEventListener('keydown', handleEscape);
        // Return focus to previous element
        previousFocusRef.current?.focus();
      };
    }
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className="bg-[var(--color-bg)] rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto border-2 border-[var(--color-muted)]"
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 id="modal-title" className="text-2xl font-heading text-[var(--color-fg)]">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-[var(--color-muted)] hover:text-[var(--color-fg)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] rounded"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="text-[var(--color-fg)]">{children}</div>
          {footer && <div className="mt-6 flex justify-end gap-2">{footer}</div>}
        </div>
      </div>
    </div>
  );
};

Modal.displayName = 'Modal';
