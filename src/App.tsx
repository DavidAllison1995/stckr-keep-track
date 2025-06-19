import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/hooks/useSupabaseAuth';
import { ItemsProvider } from '@/hooks/useSupabaseItems';
import { MaintenanceProvider } from '@/hooks/useSupabaseMaintenance';
import { Toaster } from '@/components/ui/toaster';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import NavBar from '@/components/navigation/NavBar';
import AuthPage from '@/pages/AuthPage';
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import ItemsPage from '@/pages/ItemsPage';
import ItemDetailPage from '@/pages/ItemDetailPage';
import MaintenancePage from '@/pages/MaintenancePage';
import MaintenanceTasksPage from '@/pages/MaintenanceTasksPage';
import TasksPage from '@/pages/TasksPage';
import ProfilePage from '@/pages/ProfilePage';
import SettingsPage from '@/pages/SettingsPage';
import ScannerPage from '@/pages/ScannerPage';
import NotFound from '@/pages/NotFound';
import AdminQrPage from '@/pages/AdminQrPage';
import QRClaimPage from '@/pages/QRClaimPage';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <ItemsProvider>
            <MaintenanceProvider>
              <Router>
                <div className="App">
                  <Routes>
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/qr/:code" element={<QRClaimPage />} />
                    <Route path="/" element={
                      <ProtectedRoute>
                        <>
                          <Index />
                          <NavBar />
                        </>
                      </ProtectedRoute>
                    } />
                    <Route path="/dashboard" element={
                      <ProtectedRoute>
                        <>
                          <Dashboard />
                          <NavBar />
                        </>
                      </ProtectedRoute>
                    } />
                    <Route path="/items" element={
                      <ProtectedRoute>
                        <>
                          <ItemsPage />
                          <NavBar />
                        </>
                      </ProtectedRoute>
                    } />
                    <Route path="/items/:id" element={
                      <ProtectedRoute>
                        <>
                          <ItemDetailPage />
                          <NavBar />
                        </>
                      </ProtectedRoute>
                    } />
                    <Route path="/calendar" element={
                      <ProtectedRoute>
                        <>
                          <MaintenancePage />
                          <NavBar />
                        </>
                      </ProtectedRoute>
                    } />
                    <Route path="/maintenance-tasks" element={
                      <ProtectedRoute>
                        <>
                          <MaintenanceTasksPage />
                          <NavBar />
                        </>
                      </ProtectedRoute>
                    } />
                    <Route path="/tasks/:status" element={
                      <ProtectedRoute>
                        <>
                          <TasksPage />
                          <NavBar />
                        </>
                      </ProtectedRoute>
                    } />
                    <Route path="/tasks" element={
                      <ProtectedRoute>
                        <>
                          <TasksPage />
                          <NavBar />
                        </>
                      </ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                      <ProtectedRoute>
                        <>
                          <ProfilePage />
                          <NavBar />
                        </>
                      </ProtectedRoute>
                    } />
                    <Route path="/settings" element={
                      <ProtectedRoute>
                        <>
                          <SettingsPage />
                          <NavBar />
                        </>
                      </ProtectedRoute>
                    } />
                    <Route path="/scanner" element={
                      <ProtectedRoute>
                        <>
                          <ScannerPage />
                          <NavBar />
                        </>
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/qr" element={
                      <ProtectedRoute>
                        <>
                          <AdminQrPage />
                          <NavBar />
                        </>
                      </ProtectedRoute>
                    } />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
                <Toaster />
              </Router>
            </MaintenanceProvider>
          </ItemsProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
