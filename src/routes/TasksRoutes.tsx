
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { ItemsProvider } from "@/hooks/useSupabaseItems";
import { MaintenanceProvider } from "@/hooks/useSupabaseMaintenance";
import ProtectedLayout from "@/components/layouts/ProtectedLayout";
import TasksPage from "@/pages/TasksPage";
import UpToDateTasksPage from "@/pages/UpToDateTasksPage";
import DueSoonTasksPage from "@/pages/DueSoonTasksPage";
import OverdueTasksPage from "@/pages/OverdueTasksPage";
import CompletedTasksPage from "@/pages/CompletedTasksPage";

const TasksRoutes = () => (
  <Routes>
    <Route
      path="/"
      element={
        <ProtectedRoute>
          <ItemsProvider>
            <MaintenanceProvider>
              <ProtectedLayout>
                <TasksPage />
              </ProtectedLayout>
            </MaintenanceProvider>
          </ItemsProvider>
        </ProtectedRoute>
      }
    />
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
    <Route
      path="/completed"
      element={
        <ProtectedRoute>
          <ItemsProvider>
            <MaintenanceProvider>
              <ProtectedLayout>
                <CompletedTasksPage />
              </ProtectedLayout>
            </MaintenanceProvider>
          </ItemsProvider>
        </ProtectedRoute>
      }
    />
  </Routes>
);

export default TasksRoutes;
