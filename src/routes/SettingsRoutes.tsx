
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ProtectedLayout from "@/components/layouts/ProtectedLayout";
import SettingsPage from "@/pages/SettingsPage";

const SettingsRoutes = () => (
  <Routes>
    <Route
      path="/"
      element={
        <ProtectedRoute>
          <ProtectedLayout>
            <SettingsPage />
          </ProtectedLayout>
        </ProtectedRoute>
      }
    />
  </Routes>
);

export default SettingsRoutes;
