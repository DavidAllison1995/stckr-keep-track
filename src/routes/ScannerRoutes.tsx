
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { ItemsProvider } from "@/hooks/useSupabaseItems";
import { MaintenanceProvider } from "@/hooks/useSupabaseMaintenance";
import ProtectedLayout from "@/components/layouts/ProtectedLayout";
import ScannerPage from "@/pages/ScannerPage";

const ScannerRoutes = () => (
  <Routes>
    <Route
      path="/"
      element={
        <ProtectedRoute>
          <ItemsProvider>
            <MaintenanceProvider>
              <ProtectedLayout>
                <ScannerPage />
              </ProtectedLayout>
            </MaintenanceProvider>
          </ItemsProvider>
        </ProtectedRoute>
      }
    />
  </Routes>
);

export default ScannerRoutes;
