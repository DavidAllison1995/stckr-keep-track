
import { Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import AuthPage from "@/pages/AuthPage";
import QRRedirectPage from "@/pages/QRRedirectPage";
import { ItemsProvider } from "@/hooks/useSupabaseItems";
import { MaintenanceProvider } from "@/hooks/useSupabaseMaintenance";

const PublicRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/auth" element={<AuthPage />} />
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
  </Routes>
);

export default PublicRoutes;
