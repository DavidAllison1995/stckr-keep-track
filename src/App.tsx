
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useSupabaseAuth";
import { AdminAuthProvider } from "@/hooks/useAdminAuth";
import { ItemsProvider } from "@/hooks/useSupabaseItems";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AdminProtectedRoute from "@/components/admin/AdminProtectedRoute";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import ItemsPage from "./pages/ItemsPage";
import ItemDetailPage from "./pages/ItemDetailPage";
import MaintenancePage from "./pages/MaintenancePage";
import TasksPage from "./pages/TasksPage";
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
                  
                  {/* Protected user routes - wrapped with ItemsProvider */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <ItemsProvider>
                          <Dashboard />
                        </ItemsProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/items"
                    element={
                      <ProtectedRoute>
                        <ItemsProvider>
                          <ItemsPage />
                        </ItemsProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/items/:id"
                    element={
                      <ProtectedRoute>
                        <ItemsProvider>
                          <ItemDetailPage />
                        </ItemsProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/maintenance"
                    element={
                      <ProtectedRoute>
                        <ItemsProvider>
                          <MaintenancePage />
                        </ItemsProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/tasks"
                    element={
                      <ProtectedRoute>
                        <ItemsProvider>
                          <TasksPage />
                        </ItemsProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/maintenance-tasks"
                    element={
                      <ProtectedRoute>
                        <ItemsProvider>
                          <MaintenanceTasksPage />
                        </ItemsProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/scanner"
                    element={
                      <ProtectedRoute>
                        <ItemsProvider>
                          <ScannerPage />
                        </ItemsProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/claim/:code"
                    element={
                      <ProtectedRoute>
                        <ItemsProvider>
                          <QRClaimPage />
                        </ItemsProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <SettingsPage />
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
