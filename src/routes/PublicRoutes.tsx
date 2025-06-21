
import { Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import AuthPage from "@/pages/AuthPage";
import QRRedirectPage from "@/pages/QRRedirectPage";

const PublicRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/auth" element={<AuthPage />} />
    <Route path="/:code" element={<QRRedirectPage />} />
  </Routes>
);

export default PublicRoutes;
