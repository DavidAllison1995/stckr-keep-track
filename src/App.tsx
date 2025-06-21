
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useSupabaseAuth";
import { AdminAuthProvider } from "@/hooks/useAdminAuth";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { queryClient } from "@/config/queryClient";
import PublicRoutes from "@/routes/PublicRoutes";
import DashboardRoutes from "@/routes/DashboardRoutes";
import ItemsRoutes from "@/routes/ItemsRoutes";
import MaintenanceRoutes from "@/routes/MaintenanceRoutes";
import TasksRoutes from "@/routes/TasksRoutes";
import MaintenanceTasksRoutes from "@/routes/MaintenanceTasksRoutes";
import ScannerRoutes from "@/routes/ScannerRoutes";
import ClaimRoutes from "@/routes/ClaimRoutes";
import ProfileRoutes from "@/routes/ProfileRoutes";
import SettingsRoutes from "@/routes/SettingsRoutes";
import AdminRoutes from "@/routes/AdminRoutes";
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
                  
                  {/* User protected routes */}
                  <Route path="/dashboard/*" element={<DashboardRoutes />} />
                  <Route path="/items/*" element={<ItemsRoutes />} />
                  <Route path="/maintenance/*" element={<MaintenanceRoutes />} />
                  <Route path="/tasks/*" element={<TasksRoutes />} />
                  <Route path="/maintenance-tasks/*" element={<MaintenanceTasksRoutes />} />
                  <Route path="/scanner/*" element={<ScannerRoutes />} />
                  <Route path="/claim/*" element={<ClaimRoutes />} />
                  <Route path="/profile/*" element={<ProfileRoutes />} />
                  <Route path="/settings/*" element={<SettingsRoutes />} />
                  
                  {/* Public routes */}
                  <Route path="/" element={<PublicRoutes />} />
                  <Route path="/auth" element={<PublicRoutes />} />
                  <Route path="/qr/*" element={<PublicRoutes />} />

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
