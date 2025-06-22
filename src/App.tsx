
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./hooks/useSupabaseAuth";
import { UserSettingsProvider } from "./contexts/UserSettingsContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { GlobalQRScannerProvider } from "./contexts/GlobalQRScannerContext";
import { ItemsProvider } from "./hooks/useSupabaseItems";
import { MaintenanceProvider } from "./hooks/useSupabaseMaintenance";

// Page imports
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import ItemsPage from "./pages/ItemsPage";
import ItemDetailPage from "./pages/ItemDetailPage";
import MaintenancePage from "./pages/MaintenancePage";
import TasksPage from "./pages/TasksPage";
import ScannerPage from "./pages/ScannerPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";

// Route components
import PublicRoutes from "./routes/PublicRoutes";
import ClaimRoutes from "./routes/ClaimRoutes";
import ShopRoutes from "./routes/ShopRoutes";
import AdminRoutes from "./routes/AdminRoutes";
import MaintenanceRoutes from "./routes/MaintenanceRoutes";
import MaintenanceTasksRoutes from "./routes/MaintenanceTasksRoutes";
import TaskRoutes from "./routes/TaskRoutes";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ProtectedLayout from "./components/layouts/ProtectedLayout";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UserSettingsProvider>
          <ThemeProvider>
            <Router>
              <GlobalQRScannerProvider>
                <div className="min-h-screen bg-gray-50">
                  <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/public/*" element={<PublicRoutes />} />
                    <Route path="/claim/*" element={<ClaimRoutes />} />
                    
                    {/* Protected routes */}
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
                    <Route 
                      path="/items" 
                      element={
                        <ProtectedRoute>
                          <ItemsProvider>
                            <ProtectedLayout>
                              <ItemsPage />
                            </ProtectedLayout>
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
                    <Route 
                      path="/maintenance/*" 
                      element={
                        <ProtectedRoute>
                          <ItemsProvider>
                            <MaintenanceProvider>
                              <MaintenanceRoutes />
                            </MaintenanceProvider>
                          </ItemsProvider>
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/maintenance-tasks/*" 
                      element={
                        <ProtectedRoute>
                          <ItemsProvider>
                            <MaintenanceProvider>
                              <MaintenanceTasksRoutes />
                            </MaintenanceProvider>
                          </ItemsProvider>
                        </ProtectedRoute>
                      } 
                    />
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
                      path="/tasks/*" 
                      element={
                        <ProtectedRoute>
                          <ItemsProvider>
                            <MaintenanceProvider>
                              <TaskRoutes />
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
                            <ProtectedLayout>
                              <ScannerPage />
                            </ProtectedLayout>
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
                    
                    {/* Shop routes */}
                    <Route path="/shop/*" element={<ShopRoutes />} />
                    
                    {/* Admin routes */}
                    <Route path="/admin/*" element={<AdminRoutes />} />
                    
                    {/* 404 */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <Toaster />
                </div>
              </GlobalQRScannerProvider>
            </Router>
          </ThemeProvider>
        </UserSettingsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
