
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
                  {/* Public routes */}
                  <Route path="/*" element={<PublicRoutes />} />
                  
                  {/* User routes */}
                  <Route path="/*" element={<UserRoutes />} />

                  {/* Admin routes */}
                  <Route path="/*" element={<AdminRoutes />} />

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
