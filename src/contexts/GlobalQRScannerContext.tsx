
import React, { createContext, useContext, ReactNode } from 'react';
import { useGlobalQRScanner } from '@/hooks/useGlobalQRScanner';

interface GlobalQRScannerContextType {
  isScanning: boolean;
  handleGlobalScan: () => void;
  stopGlobalScan: () => void;
  handleScanResult: (result: string) => void;
}

const GlobalQRScannerContext = createContext<GlobalQRScannerContextType | undefined>(undefined);

export const GlobalQRScannerProvider = ({ children }: { children: ReactNode }) => {
  const qrScannerState = useGlobalQRScanner();

  return (
    <GlobalQRScannerContext.Provider value={qrScannerState}>
      {children}
    </GlobalQRScannerContext.Provider>
  );
};

export const useGlobalQRScannerContext = () => {
  const context = useContext(GlobalQRScannerContext);
  if (context === undefined) {
    throw new Error('useGlobalQRScannerContext must be used within a GlobalQRScannerProvider');
  }
  return context;
};
