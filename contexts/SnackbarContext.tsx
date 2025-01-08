'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar, SnackbarType } from '@/components/ui/Snackbar';

export interface SnackbarContextType {
  showSnackbar: (message: string, type: SnackbarType) => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<SnackbarType>('info');

  const showSnackbar = useCallback((newMessage: string, newType: SnackbarType) => {
    setMessage(newMessage);
    setType(newType);
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <Snackbar
        message={message}
        type={type}
        isOpen={isOpen}
        onClose={handleClose}
      />
    </SnackbarContext.Provider>
  );
}

export function useSnackbar() {
  const context = useContext(SnackbarContext);
  if (context === undefined) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
} 