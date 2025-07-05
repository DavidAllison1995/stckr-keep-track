
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Capacitor } from "@capacitor/core";
import { AuthProvider } from "./hooks/useSupabaseAuth";
import { AdminAuthProvider } from "./hooks/useAdminAuth";
import { UserSettingsProvider } from "./contexts/UserSettingsContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ItemsProvider } from "./hooks/useSupabaseItems";
import { MaintenanceProvider } from "./hooks/useSupabaseMaintenance";
import { CartProvider } from "./contexts/CartContext";

// Page imports
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import ItemsPage from "./pages/ItemsPage";
import ItemDetailPage from "./pages/ItemDetailPage";
import CalendarPage from "./pages/CalendarPage";
import TasksPage from "./pages/TasksPage";
import ScannerPage from "./pages/ScannerPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import QRRedirectPage from "./pages/QRRedirectPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";

// Route components
import PublicRoutes from "./routes/PublicRoutes";
import ClaimRoutes from "./routes/ClaimRoutes";
import ShopRoutes from "./routes/ShopRoutes";
import AdminRoutes from "./routes/AdminRoutes";
import CalendarRoutes from "./routes/CalendarRoutes";
import MaintenanceTasksRoutes from "./routes/MaintenanceTasksRoutes";
import TaskRoutes from "./routes/TaskRoutes";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ProtectedLayout from "./components/layouts/ProtectedLayout";
import { GlobalQRScannerProvider } from "./contexts/GlobalQRScannerContext";
import { useShop } from "./hooks/useShop";

const queryClient = new QueryClient();

// Create a platform-aware root component
const PlatformAwareRoot = () => {
  const isNative = Capacitor.isNativePlatform();
  
  // On native platforms, redirect directly to auth page
  if (isNative) {
    return <Navigate to="/auth" replace />;
  }
  
  // On web platforms, show the landing page
  return <Index />;
};

// Create a wrapper component to access useShop hook
const CartProviderWrapper = ({ children }: { children: React.ReactNode }) => {
  const { products } = useShop();
  return <CartProvider products={products}>{children}</CartProvider>;
};

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
                    <Route path="/" element={<PlatformAwareRoot />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                    
                    {/* Universal QR code route - publicly accessible */}
                    <Route 
                      path="/qr/:code" 
                      element={
                        <ItemsProvider>
                          <MaintenanceProvider>
                            <QRRedirectPage />
                          </MaintenanceProvider>
                        </ItemsProvider>
                      } 
                    />
                    
                    <Route path="/public/*" element={<PublicRoutes />} />
                    <Route path="/claim/*" element={<ClaimRoutes />} />
                    
                    {/* Legacy route for backward compatibility */}
                    <Route 
                      path="/:code" 
                      element={
                        <ItemsProvider>
                          <MaintenanceProvider>
                            <QRRedirectPage />
                          </MaintenanceProvider>
                        </ItemsProvider>
                      } 
                    />
                    
                    {/* Protected routes with Cart Context */}
                    <Route 
                      path="/dashboard" 
                      element={
                        <ProtectedRoute>
                          <ItemsProvider>
                            <MaintenanceProvider>
                              <CartProviderWrapper>
                                <ProtectedLayout>
                                  <Dashboard />
                                </ProtectedLayout>
                              </CartProviderWrapper>
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
                              <CartProviderWrapper>
                                <ProtectedLayout>
                                  <ItemsPage />
                                </ProtectedLayout>
                              </CartProviderWrapper>
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
                              <CartProviderWrapper>
                                <ProtectedLayout>
                                  <ItemDetailPage />
                                </ProtectedLayout>
                              </CartProviderWrapper>
                            </MaintenanceProvider>
                          </ItemsProvider>
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Calendar routes - updated from /maintenance to /calendar */}
                    <Route 
                      path="/calendar" 
                      element={
                        <ProtectedRoute>
                          <ItemsProvider>
                            <MaintenanceProvider>
                              <CartProviderWrapper>
                                <ProtectedLayout>
                                  <CalendarPage />
                                </ProtectedLayout>
                              </CartProviderWrapper>
                            </MaintenanceProvider>
                          </ItemsProvider>
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/calendar/*" 
                      element={
                        <ProtectedRoute>
                          <ItemsProvider>
                            <MaintenanceProvider>
                              <CartProviderWrapper>
                                <CalendarRoutes />
                              </CartProviderWrapper>
                            </MaintenanceProvider>
                          </ItemsProvider>
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Redirect from old /maintenance route to /calendar for backward compatibility */}
                    <Route path="/maintenance" element={<Navigate to="/calendar" replace />} />
                    <Route path="/maintenance/*" element={<Navigate to="/calendar" replace />} />
                    
                    <Route 
                      path="/maintenance-tasks/*" 
                      element={
                        <ProtectedRoute>
                          <ItemsProvider>
                            <MaintenanceProvider>
                              <CartProviderWrapper>
                                <MaintenanceTasksRoutes />
                              </CartProviderWrapper>
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
                              <CartProviderWrapper>
                                <ProtectedLayout>
                                  <TasksPage />
                                </ProtectedLayout>
                              </CartProviderWrapper>
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
                              <CartProviderWrapper>
                                <TaskRoutes />
                              </CartProviderWrapper>
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
                              <CartProviderWrapper>
                                <ProtectedLayout>
                                  <ScannerPage />
                                </ProtectedLayout>
                              </CartProviderWrapper>
                            </MaintenanceProvider>
                          </ItemsProvider>
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/profile" 
                      element={
                        <ProtectedRoute>
                          <CartProviderWrapper>
                            <ProtectedLayout>
                              <ProfilePage />
                            </ProtectedLayout>
                          </CartProviderWrapper>
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/settings" 
                      element={
                        <ProtectedRoute>
                          <CartProviderWrapper>
                            <ProtectedLayout>
                              <SettingsPage />
                            </ProtectedLayout>
                          </CartProviderWrapper>
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Shop routes - now wrapped with CartProvider in ShopRoutes */}
                    <Route 
                      path="/shop/*" 
                      element={
                        <ProtectedRoute>
                          <CartProviderWrapper>
                            <ProtectedLayout>
                              <ShopRoutes />
                            </ProtectedLayout>
                          </CartProviderWrapper>
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Admin routes - wrapped with AdminAuthProvider */}
                    <Route 
                      path="/admin/*" 
                      element={
                        <AdminAuthProvider>
                          <AdminRoutes />
                        </AdminAuthProvider>
                      } 
                    />
                    
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
