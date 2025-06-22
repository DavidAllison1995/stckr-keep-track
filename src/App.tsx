import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/hooks/useSupabaseAuth";
import { UserSettingsProvider } from "@/contexts/UserSettingsContext";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AdminProtectedRoute from "@/components/admin/AdminProtectedRoute";
import ProtectedLayout from "@/components/layouts/ProtectedLayout";
import { ItemsProvider } from "@/hooks/useSupabaseItems";
import { MaintenanceProvider } from "@/hooks/useSupabaseMaintenance";

// Lazy load route components
const PublicRoutes = lazy(() => import("@/routes/PublicRoutes"));
const ClaimRoutes = lazy(() => import("@/routes/ClaimRoutes"));
const AdminRoutes = lazy(() => import("@/routes/AdminRoutes"));
const MaintenanceRoutes = lazy(() => import("@/routes/MaintenanceRoutes"));
const MaintenanceTasksRoutes = lazy(() => import("@/routes/MaintenanceTasksRoutes"));
const ShopRoutes = lazy(() => import("@/routes/ShopRoutes"));

// Lazy load pages
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const ItemsPage = lazy(() => import("@/pages/ItemsPage"));
const ItemDetailPage = lazy(() => import("@/pages/ItemDetailPage"));
const ScannerPage = lazy(() => import("@/pages/ScannerPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <UserSettingsProvider>
            <TooltipProvider>
              <BrowserRouter>
                <Routes>
                  {/* Public routes */}
                  <Route path="/*" element={
                    <Suspense fallback={<div>Loading...</div>}>
                      <PublicRoutes />
                    </Suspense>
                  } />
                  
                  {/* QR Claim routes */}
                  <Route path="/claim/*" element={
                    <Suspense fallback={<div>Loading...</div>}>
                      <ClaimRoutes />
                    </Suspense>
                  } />

                  {/* Protected routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <ProtectedLayout>
                        <ItemsProvider>
                          <MaintenanceProvider>
                            <Suspense fallback={<div>Loading...</div>}>
                              <Dashboard />
                            </Suspense>
                          </MaintenanceProvider>
                        </ItemsProvider>
                      </ProtectedLayout>
                    </ProtectedRoute>
                  } />

                  <Route path="/items" element={
                    <ProtectedRoute>
                      <ProtectedLayout>
                        <ItemsProvider>
                          <MaintenanceProvider>
                            <Suspense fallback={<div>Loading...</div>}>
                              <ItemsPage />
                            </Suspense>
                          </MaintenanceProvider>
                        </ItemsProvider>
                      </ProtectedLayout>
                    </ProtectedRoute>
                  } />

                  <Route path="/items/:id" element={
                    <ProtectedRoute>
                      <ProtectedLayout>
                        <ItemsProvider>
                          <MaintenanceProvider>
                            <Suspense fallback={<div>Loading...</div>}>
                              <ItemDetailPage />
                            </Suspense>
                          </MaintenanceProvider>
                        </ItemsProvider>
                      </ProtectedLayout>
                    </ProtectedRoute>
                  } />

                  <Route path="/maintenance/*" element={
                    <ProtectedRoute>
                      <ProtectedLayout>
                        <ItemsProvider>
                          <MaintenanceProvider>
                            <Suspense fallback={<div>Loading...</div>}>
                              <MaintenanceRoutes />
                            </Suspense>
                          </MaintenanceProvider>
                        </ItemsProvider>
                      </ProtectedLayout>
                    </ProtectedRoute>
                  } />

                  <Route path="/tasks/*" element={
                    <ProtectedRoute>
                      <ProtectedLayout>
                        <ItemsProvider>
                          <MaintenanceProvider>
                            <Suspense fallback={<div>Loading...</div>}>
                              <MaintenanceTasksRoutes />
                            </Suspense>
                          </MaintenanceProvider>
                        </ItemsProvider>
                      </ProtectedLayout>
                    </ProtectedRoute>
                  } />

                  <Route path="/scanner" element={
                    <ProtectedRoute>
                      <ProtectedLayout>
                        <ItemsProvider>
                          <Suspense fallback={<div>Loading...</div>}>
                            <ScannerPage />
                          </Suspense>
                        </ItemsProvider>
                      </ProtectedLayout>
                    </ProtectedRoute>
                  } />

                  <Route path="/shop/*" element={
                    <ProtectedRoute>
                      <ProtectedLayout>
                        <Suspense fallback={<div>Loading...</div>}>
                          <ShopRoutes />
                        </Suspense>
                      </ProtectedLayout>
                    </ProtectedRoute>
                  } />

                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <ProtectedLayout>
                        <Suspense fallback={<div>Loading...</div>}>
                          <ProfilePage />
                        </Suspense>
                      </ProtectedLayout>
                    </ProtectedRoute>
                  } />

                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <ProtectedLayout>
                        <Suspense fallback={<div>Loading...</div>}>
                          <SettingsPage />
                        </Suspense>
                      </ProtectedLayout>
                    </ProtectedRoute>
                  } />

                  {/* Admin routes */}
                  <Route path="/admin/*" element={
                    <AdminProtectedRoute>
                      <Suspense fallback={<div>Loading...</div>}>
                        <AdminRoutes />
                      </Suspense>
                    </AdminProtectedRoute>
                  } />

                  {/* 404 page */}
                  <Route path="*" element={
                    <Suspense fallback={<div>Loading...</div>}>
                      <NotFound />
                    </Suspense>
                  } />
                </Routes>
                <Toaster />
              </BrowserRouter>
            </TooltipProvider>
          </UserSettingsProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
