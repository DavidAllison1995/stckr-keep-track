
import React from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/hooks/useSupabaseAuth";
import { UserSettingsProvider } from "@/contexts/UserSettingsContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { GlobalQRScannerProvider } from "@/contexts/GlobalQRScannerContext";

const queryClient = new QueryClient();

interface AppProvidersProps {
  children: React.ReactNode;
}

const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UserSettingsProvider>
          <ThemeProvider>
            <GlobalQRScannerProvider>
              {children}
            </GlobalQRScannerProvider>
          </ThemeProvider>
        </UserSettingsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default AppProviders;
