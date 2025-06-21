
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ProtectedLayout from "@/components/layouts/ProtectedLayout";
import ProfilePage from "@/pages/ProfilePage";

const ProfileRoutes = () => (
  <Routes>
    <Route
      path="/"
      element={
        <ProtectedRoute>
          <ProtectedLayout>
            <ProfilePage />
          </ProtectedLayout>
        </ProtectedRoute>
      }
    />
  </Routes>
);

export default ProfileRoutes;
