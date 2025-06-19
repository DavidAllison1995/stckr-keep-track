import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useSupabaseAuth";
import { AdminAuthProvider } from "@/hooks/useAdminAuth";
import { ItemsProvider } from "@/hooks/useSupabaseItems";
import { MaintenanceProvider } from "@/hooks/useSupabaseMaintenance";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AdminProtectedRoute from "@/components/admin/AdminProtectedRoute";
import NavBar from "@/components/navigation/NavBar";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import ItemsPage from "./pages/ItemsPage";
import ItemDetailPage from "./pages/ItemDetailPage";
import MaintenancePage from "./pages/MaintenancePage";
import TasksPage from "./pages/TasksPage";
import UpToDateTasksPage from "./pages/UpToDateTasksPage";
import DueSoonTasksPage from "./pages/DueSoonTasksPage";
import OverdueTasksPage from "./pages/OverdueTasksPage";
import MaintenanceTasksPage from "./pages/MaintenanceTasksPage";
import ScannerPage from "./pages/ScannerPage";
import QRClaimPage from "./pages/QRClaimPage";
import QRRedirectPage from "./pages/QRRedirectPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

// Admin pages
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminQrPage from "./pages/admin/AdminQrPage";
import AdminShopPage from "./pages/admin/AdminShopPage";
import AdminAnalyticsPage from "./pages/admin/AdminAnalyticsPage";

import "./App.css";

const queryClient = new QueryClient();

// Wrapper component for protected routes with navigation
const ProtectedLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen">
    {children}
    <NavBar />
  </div>
);

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
                  {/* Public routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/qr/:code" element={<QRRedirectPage />} />
                  
                  {/* Protected user routes - wrapped with ItemsProvider and MaintenanceProvider */}
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
                  {/* Refactored task status routes with focused components */}
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

                  {/* Admin routes */}
                  <Route path="/admin/login" element={<AdminLoginPage />} />
                  <Route
                    path="/admin"
                    element={
                      <AdminProtectedRoute>
                        <AdminDashboardPage />
                      </AdminProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/qr"
                    element={
                      <AdminProtectedRoute>
                        <AdminQrPage />
                      </AdminProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/shop"
                    element={
                      <AdminProtectedRoute>
                        <AdminShopPage />
                      </AdminProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/analytics"
                    element={
                      <AdminProtectedRoute>
                        <AdminAnalyticsPage />
                      </AdminProtectedRoute>
                    }
                  />

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
