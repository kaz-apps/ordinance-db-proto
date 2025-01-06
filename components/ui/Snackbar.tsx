'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type SnackbarType = 'success' | 'error' | 'info';

interface SnackbarProps {
  message: string;
  type: SnackbarType;
  isOpen: boolean;
  onClose: () => void;
  autoHideDuration?: number;
}

export function Snackbar({
  message,
  type = 'info',
  isOpen,
  onClose,
  autoHideDuration = 5000,
}: SnackbarProps) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, autoHideDuration);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose, autoHideDuration]);

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  }[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div
            className={`${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2`}
          >
            <span>{message}</span>
            <button
              onClick={onClose}
              className="ml-4 text-white hover:text-gray-200 focus:outline-none"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 