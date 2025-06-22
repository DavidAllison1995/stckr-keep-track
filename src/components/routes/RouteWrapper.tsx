
import React from 'react';
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ProtectedLayout from "@/components/layouts/ProtectedLayout";
import { ItemsProvider } from "@/hooks/useSupabaseItems";
import { MaintenanceProvider } from "@/hooks/useSupabaseMaintenance";

interface RouteWrapperProps {
  children: React.ReactNode;
  requiresItems?: boolean;
  requiresMaintenance?: boolean;
  requiresLayout?: boolean;
}

const RouteWrapper = ({ 
  children, 
  requiresItems = false, 
  requiresMaintenance = false,
  requiresLayout = false 
}: RouteWrapperProps) => {
  let wrappedChildren = children;

  // Wrap with layout if needed
  if (requiresLayout) {
    wrappedChildren = <ProtectedLayout>{wrappedChildren}</ProtectedLayout>;
  }

  // Wrap with maintenance provider if needed
  if (requiresMaintenance) {
    wrappedChildren = <MaintenanceProvider>{wrappedChildren}</MaintenanceProvider>;
  }

  // Wrap with items provider if needed
  if (requiresItems) {
    wrappedChildren = <ItemsProvider>{wrappedChildren}</ItemsProvider>;
  }

  // Always wrap with ProtectedRoute
  return <ProtectedRoute>{wrappedChildren}</ProtectedRoute>;
};

export default RouteWrapper;
