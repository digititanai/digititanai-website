'use client';

import React from 'react';
import { Toaster } from 'react-hot-toast';

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1a4a37',
            color: '#E7DDC6',
            borderRadius: '12px',
            padding: '12px 16px',
            border: '1px solid rgba(75, 138, 108, 0.2)',
            boxShadow: '0 8px 32px rgba(14, 53, 41, 0.6)',
            fontSize: '13px',
            fontFamily: 'Inter, system-ui, sans-serif',
          },
          success: {
            iconTheme: {
              primary: '#B89B4A',
              secondary: '#E7DDC6',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#E7DDC6',
            },
          },
        }}
      />
    </>
  );
}
