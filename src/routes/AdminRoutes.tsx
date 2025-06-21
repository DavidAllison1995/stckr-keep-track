
import { Routes, Route } from "react-router-dom";
import AdminProtectedRoute from "@/components/admin/AdminProtectedRoute";
import AdminLoginPage from "@/pages/admin/AdminLoginPage";
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import AdminQrPage from "@/pages/admin/AdminQrPage";
import AdminShopPage from "@/pages/admin/AdminShopPage";
import AdminAnalyticsPage from "@/pages/admin/AdminAnalyticsPage";

const AdminRoutes = () => (
  <Routes>
    <Route path="/login" element={<AdminLoginPage />} />
    <Route
      path="/"
      element={
        <AdminProtectedRoute>
          <AdminDashboardPage />
        </AdminProtectedRoute>
      }
    />
    <Route
      path="/qr"
      element={
        <AdminProtectedRoute>
          <AdminQrPage />
        </AdminProtectedRoute>
      }
    />
    <Route
      path="/shop"
      element={
        <AdminProtectedRoute>
          <AdminShopPage />
        </AdminProtectedRoute>
      }
    />
    <Route
      path="/analytics"
      element={
        <AdminProtectedRoute>
          <AdminAnalyticsPage />
        </AdminProtectedRoute>
      }
    />
  </Routes>
);

export default AdminRoutes;
