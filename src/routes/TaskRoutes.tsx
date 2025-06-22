
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { ItemsProvider } from "@/hooks/useSupabaseItems";
import { MaintenanceProvider } from "@/hooks/useSupabaseMaintenance";
import ProtectedLayout from "@/components/layouts/ProtectedLayout";
import UpToDateTasksPage from "@/pages/UpToDateTasksPage";
import DueSoonTasksPage from "@/pages/DueSoonTasksPage";
import OverdueTasksPage from "@/pages/OverdueTasksPage";

const TaskRoutes = () => (
  <Routes>
    <Route
      path="/up-to-date"
      element={
        <ProtectedRoute>
          <ItemsProvider>
            <MaintenanceProvider>
              <ProtectedLayout>
                <UpToDateTasksPage />
              </ProtectedLayout>
            </MaintenanceProvider>
          </ItemsProvider>
        </ProtectedRoute>
      }
    />
    <Route
      path="/due-soon"
      element={
        <ProtectedRoute>
          <ItemsProvider>
            <MaintenanceProvider>
              <ProtectedLayout>
                <DueSoonTasksPage />
              </ProtectedLayout>
            </MaintenanceProvider>
          </ItemsProvider>
        </ProtectedRoute>
      }
    />
    <Route
      path="/overdue"
      element={
        <ProtectedRoute>
          <ItemsProvider>
            <MaintenanceProvider>
              <ProtectedLayout>
                <OverdueTasksPage />
              </ProtectedLayout>
            </MaintenanceProvider>
          </ItemsProvider>
        </ProtectedRoute>
      }
    />
  </Routes>
);

export default TaskRoutes;
