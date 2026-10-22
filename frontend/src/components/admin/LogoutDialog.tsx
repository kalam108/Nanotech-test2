'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface LogoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLogout?: () => void;
}

export default function LogoutDialog({ isOpen, onClose, onConfirmLogout }: LogoutDialogProps) {
  let router: ReturnType<typeof useRouter> | null = null;
  try {
    router = useRouter();
  } catch {
    router = null;
  }
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLogout = () => {
    onClose();
    if (onConfirmLogout) {
      onConfirmLogout();
    }
    if (router && typeof router.push === 'function') {
      router.push('/login');
    } else {
      window.location.href = '/login';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 transition-opacity"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-dialog-title"
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[320px] rounded-[14px] border border-[#EDEDED] bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
      >
        <h3
          id="logout-dialog-title"
          className="text-center text-[15px] font-medium text-[#1A1A1A]"
        >
          Log out of NanoTech?
        </h3>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-[8px] border border-[#EDEDED] bg-white px-4 py-2 text-[13px] font-medium text-[#1A1A1A] transition-colors hover:bg-[#F5F5F5] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="flex-1 rounded-[8px] bg-[#1A1A1A] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-black focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
