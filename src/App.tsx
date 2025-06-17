
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { MaintenanceProvider } from "@/hooks/useMaintenance";
import { ItemsProvider } from "@/hooks/useItems";
import AuthForm from "@/components/auth/AuthForm";
import NavBar from "@/components/navigation/NavBar";
import DashboardPage from "./pages/Dashboard";
import ItemsPage from "./pages/ItemsPage";
import ItemDetailPage from "./pages/ItemDetailPage";
import MaintenancePage from "./pages/MaintenancePage";
import TasksPage from "./pages/TasksPage";
import ScannerPage from "./pages/ScannerPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <AuthForm />;
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/items" element={<ItemsPage />} />
        <Route path="/items/:itemId" element={<ItemDetailPage />} />
        <Route path="/maintenance" element={<MaintenancePage />} />
        <Route path="/tasks/:status" element={<TasksPage />} />
        <Route path="/scanner" element={<ScannerPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <NavBar />
    </>
  );
};

const App = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <ItemsProvider>
            <MaintenanceProvider>
              <AppContent />
              <Toaster />
              <Sonner />
            </MaintenanceProvider>
          </ItemsProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;
