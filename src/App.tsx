
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
import UserRoutes from "@/routes/UserRoutes";
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
                  <Route path="/dashboard/*" element={<UserRoutes />} />
                  <Route path="/items/*" element={<UserRoutes />} />
                  <Route path="/maintenance/*" element={<UserRoutes />} />
                  <Route path="/tasks/*" element={<UserRoutes />} />
                  <Route path="/maintenance-tasks/*" element={<UserRoutes />} />
                  <Route path="/scanner/*" element={<UserRoutes />} />
                  <Route path="/claim/*" element={<UserRoutes />} />
                  <Route path="/profile/*" element={<UserRoutes />} />
                  <Route path="/settings/*" element={<UserRoutes />} />
                  
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
