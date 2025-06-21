
import { Routes, Route } from "react-router-dom";
import AdminProtectedRoute from "@/components/admin/AdminProtectedRoute";
import AdminLoginPage from "@/pages/admin/AdminLoginPage";
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import AdminQrPage from "@/pages/admin/AdminQrPage";
import AdminShopPage from "@/pages/admin/AdminShopPage";
import AdminAnalyticsPage from "@/pages/admin/AdminAnalyticsPage";

const AdminRoutes = () => (
  <Routes>
    <Route path="/admin/login" element={<AdminLoginPage />} />
    <Route
      path="/admin"
      element={
        <AdminProtectedRoute>
          <AdminDashboardPage />
        </AdminProtectedRoute>
      }
    />
    <Route
      path="/admin/qr"
      element={
        <AdminProtectedRoute>
          <AdminQrPage />
        </AdminProtectedRoute>
      }
    />
    <Route
      path="/admin/shop"
      element={
        <AdminProtectedRoute>
          <AdminShopPage />
        </AdminProtectedRoute>
      }
    />
    <Route
      path="/admin/analytics"
      element={
        <AdminProtectedRoute>
          <AdminAnalyticsPage />
        </AdminProtectedRoute>
      }
    />
  </Routes>
);

export default AdminRoutes;
