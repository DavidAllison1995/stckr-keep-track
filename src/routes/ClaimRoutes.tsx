
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { ItemsProvider } from "@/hooks/useSupabaseItems";
import { MaintenanceProvider } from "@/hooks/useSupabaseMaintenance";
import ProtectedLayout from "@/components/layouts/ProtectedLayout";
import QRClaimPage from "@/pages/QRClaimPage";

const ClaimRoutes = () => (
  <Routes>
    <Route
      path="/:code"
      element={
        <ProtectedRoute>
          <ItemsProvider>
            <MaintenanceProvider>
              <ProtectedLayout>
                <QRClaimPage />
              </ProtectedLayout>
            </MaintenanceProvider>
          </ItemsProvider>
        </ProtectedRoute>
      }
    />
  </Routes>
);

export default ClaimRoutes;
