
import React from 'react';
import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";

// Page imports
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import ItemsPage from "@/pages/ItemsPage";
import ItemDetailPage from "@/pages/ItemDetailPage";
import MaintenancePage from "@/pages/MaintenancePage";
import TasksPage from "@/pages/TasksPage";
import ScannerPage from "@/pages/ScannerPage";
import ProfilePage from "@/pages/ProfilePage";
import SettingsPage from "@/pages/SettingsPage";
import AuthPage from "@/pages/AuthPage";
import NotFound from "@/pages/NotFound";

// Route components
import PublicRoutes from "./PublicRoutes";
import ClaimRoutes from "./ClaimRoutes";
import ShopRoutes from "./ShopRoutes";
import AdminRoutes from "./AdminRoutes";
import MaintenanceRoutes from "./MaintenanceRoutes";
import MaintenanceTasksRoutes from "./MaintenanceTasksRoutes";
import TaskRoutes from "./TaskRoutes";
import ProtectedLayout from "@/components/layouts/ProtectedLayout";
import RouteWrapper from "@/components/routes/RouteWrapper";

const AppRoutes = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/public/*" element={<PublicRoutes />} />
        <Route path="/claim/*" element={<ClaimRoutes />} />
        
        {/* Protected routes */}
        <Route 
          path="/dashboard" 
          element={
            <RouteWrapper requiresItems requiresMaintenance requiresLayout>
              <Dashboard />
            </RouteWrapper>
          } 
        />
        <Route 
          path="/items" 
          element={
            <RouteWrapper requiresItems requiresMaintenance requiresLayout>
              <ItemsPage />
            </RouteWrapper>
          } 
        />
        <Route 
          path="/items/:id" 
          element={
            <RouteWrapper requiresItems requiresMaintenance requiresLayout>
              <ItemDetailPage />
            </RouteWrapper>
          } 
        />
        <Route 
          path="/maintenance" 
          element={
            <RouteWrapper requiresItems requiresMaintenance requiresLayout>
              <MaintenancePage />
            </RouteWrapper>
          } 
        />
        <Route 
          path="/maintenance/*" 
          element={
            <RouteWrapper requiresItems requiresMaintenance>
              <MaintenanceRoutes />
            </RouteWrapper>
          } 
        />
        <Route 
          path="/maintenance-tasks/*" 
          element={
            <RouteWrapper requiresItems requiresMaintenance>
              <MaintenanceTasksRoutes />
            </RouteWrapper>
          } 
        />
        <Route 
          path="/tasks" 
          element={
            <RouteWrapper requiresItems requiresMaintenance requiresLayout>
              <TasksPage />
            </RouteWrapper>
          } 
        />
        <Route 
          path="/tasks/*" 
          element={
            <RouteWrapper requiresItems requiresMaintenance>
              <TaskRoutes />
            </RouteWrapper>
          } 
        />
        <Route 
          path="/scanner" 
          element={
            <RouteWrapper requiresItems requiresMaintenance requiresLayout>
              <ScannerPage />
            </RouteWrapper>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <RouteWrapper requiresLayout>
              <ProfilePage />
            </RouteWrapper>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <RouteWrapper requiresLayout>
              <SettingsPage />
            </RouteWrapper>
          } 
        />
        
        {/* Shop routes */}
        <Route path="/shop/*" element={<ShopRoutes />} />
        
        {/* Admin routes */}
        <Route path="/admin/*" element={<AdminRoutes />} />
        
        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </div>
  );
};

export default AppRoutes;
