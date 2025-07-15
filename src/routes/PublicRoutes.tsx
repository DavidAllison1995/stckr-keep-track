
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
    {/* New direct QR code route with query parameters */}
    <Route 
      path="/qr" 
      element={
        <ItemsProvider>
          <MaintenanceProvider>
            <QRRedirectPage />
          </MaintenanceProvider>
        </ItemsProvider>
      } 
    />
    {/* Legacy QR code route for backward compatibility */}
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
  </Routes>
);

export default PublicRoutes;
