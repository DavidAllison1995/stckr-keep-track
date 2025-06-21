
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useSupabaseAuth";
import { AdminAuthProvider } from "@/hooks/useAdminAuth";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { queryClient } from "@/config/queryClient";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ProtectedLayout from "@/components/layouts/ProtectedLayout";
import { ItemsProvider } from "@/hooks/useSupabaseItems";
import { MaintenanceProvider } from "@/hooks/useSupabaseMaintenance";
import PublicRoutes from "@/routes/PublicRoutes";
import AdminRoutes from "@/routes/AdminRoutes";
import Dashboard from "@/pages/Dashboard";
import ItemsPage from "@/pages/ItemsPage";
import ItemDetailPage from "@/pages/ItemDetailPage";
import MaintenancePage from "@/pages/MaintenancePage";
import ScannerPage from "@/pages/ScannerPage";
import ProfilePage from "@/pages/ProfilePage";
import SettingsPage from "@/pages/SettingsPage";
import NavBar from "@/components/navigation/NavBar";
import NotFound from "./pages/NotFound";
import "./App.css";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <AdminAuthProvider>
                <Routes>
                  {/* Admin routes - most specific first */}
                  <Route path="/admin/*" element={<AdminRoutes />} />
                  
                  {/* User protected routes - wrapped with providers */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <ItemsProvider>
                          <MaintenanceProvider>
                            <ProtectedLayout>
                              <Dashboard />
                            </ProtectedLayout>
                            <NavBar />
                          </MaintenanceProvider>
                        </ItemsProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <ItemsProvider>
                          <MaintenanceProvider>
                            <ProtectedLayout>
                              <Dashboard />
                            </ProtectedLayout>
                            <NavBar />
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
                          <MaintenanceProvider>
                            <ProtectedLayout>
                              <ItemsPage />
                            </ProtectedLayout>
                            <NavBar />
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
                            <NavBar />
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
                            <NavBar />
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
                            <NavBar />
                          </MaintenanceProvider>
                        </ItemsProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ItemsProvider>
                          <MaintenanceProvider>
                            <ProtectedLayout>
                              <ProfilePage />
                            </ProtectedLayout>
                            <NavBar />
                          </MaintenanceProvider>
                        </ItemsProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <ItemsProvider>
                          <MaintenanceProvider>
                            <ProtectedLayout>
                              <SettingsPage />
                            </ProtectedLayout>
                            <NavBar />
                          </MaintenanceProvider>
                        </ItemsProvider>
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Public routes */}
                  <Route path="/*" element={<PublicRoutes />} />

                  {/* 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AdminAuthProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
