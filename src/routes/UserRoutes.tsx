import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { ItemsProvider } from "@/hooks/useSupabaseItems";
import { MaintenanceProvider } from "@/hooks/useSupabaseMaintenance";
import ProtectedLayout from "@/components/layouts/ProtectedLayout";
import Dashboard from "@/pages/Dashboard";
import ItemsPage from "@/pages/ItemsPage";
import ItemDetailPage from "@/pages/ItemDetailPage";
import MaintenancePage from "@/pages/MaintenancePage";
import TasksPage from "@/pages/TasksPage";
import UpToDateTasksPage from "@/pages/UpToDateTasksPage";
import DueSoonTasksPage from "@/pages/DueSoonTasksPage";
import OverdueTasksPage from "@/pages/OverdueTasksPage";
import MaintenanceTasksPage from "@/pages/MaintenanceTasksPage";
import ScannerPage from "@/pages/ScannerPage";
import QRClaimPage from "@/pages/QRClaimPage";
import ProfilePage from "@/pages/ProfilePage";
import SettingsPage from "@/pages/SettingsPage";

const UserRoutes = () => (
  <Routes>
    {/* Dashboard route */}
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <ItemsProvider>
            <MaintenanceProvider>
              <ProtectedLayout>
                <Dashboard />
              </ProtectedLayout>
            </MaintenanceProvider>
          </ItemsProvider>
        </ProtectedRoute>
      }
    />
    
    {/* Items routes */}
    <Route
      path="/items"
      element={
        <ProtectedRoute>
          <ItemsProvider>
            <MaintenanceProvider>
              <ProtectedLayout>
                <ItemsPage />
              </ProtectedLayout>
            </MaintenanceProvider>
          </ItemsProvider>
        </ProtectedRoute>
      }
    />
    <Route
      path="/items/:id"
      element={
        <ProtectedRoute>
          <ItemsProvider>
            <MaintenanceProvider>
              <ProtectedLayout>
                <ItemDetailPage />
              </ProtectedLayout>
            </MaintenanceProvider>
          </ItemsProvider>
        </ProtectedRoute>
      }
    />
    
    {/* Maintenance route */}
    <Route
      path="/maintenance"
      element={
        <ProtectedRoute>
          <ItemsProvider>
            <MaintenanceProvider>
              <ProtectedLayout>
                <MaintenancePage />
              </ProtectedLayout>
            </MaintenanceProvider>
          </ItemsProvider>
        </ProtectedRoute>
      }
    />
    
    {/* Task routes */}
    <Route
      path="/tasks"
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
      path="/tasks/up-to-date"
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
      path="/tasks/due-soon"
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
      path="/tasks/overdue"
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
    
    {/* Other routes */}
    <Route
      path="/maintenance-tasks"
      element={
        <ProtectedRoute>
          <ItemsProvider>
            <MaintenanceProvider>
              <ProtectedLayout>
                <MaintenanceTasksPage />
              </ProtectedLayout>
            </MaintenanceProvider>
          </ItemsProvider>
        </ProtectedRoute>
      }
    />
    <Route
      path="/scanner"
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
    <Route
      path="/claim/:code"
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
    <Route
      path="/profile"
      element={
        <ProtectedRoute>
          <ProtectedLayout>
            <ProfilePage />
          </ProtectedLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/settings"
      element={
        <ProtectedRoute>
          <ProtectedLayout>
            <SettingsPage />
          </ProtectedLayout>
        </ProtectedRoute>
      }
    />
  </Routes>
);

export default UserRoutes;
