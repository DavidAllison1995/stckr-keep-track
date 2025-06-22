
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./hooks/useSupabaseAuth";
import { UserSettingsProvider } from "./contexts/UserSettingsContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { GlobalQRScannerProvider } from "./contexts/GlobalQRScannerContext";

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
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/items" element={<ItemsPage />} />
                    <Route path="/items/:id" element={<ItemDetailPage />} />
                    <Route path="/maintenance" element={<MaintenancePage />} />
                    <Route path="/maintenance/*" element={<MaintenanceRoutes />} />
                    <Route path="/maintenance-tasks/*" element={<MaintenanceTasksRoutes />} />
                    <Route path="/tasks" element={<TasksPage />} />
                    <Route path="/tasks/*" element={<TaskRoutes />} />
                    <Route path="/scanner" element={<ScannerPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    
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
