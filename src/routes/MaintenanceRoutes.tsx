
import { Routes, Route } from "react-router-dom";
import MaintenancePage from "@/pages/MaintenancePage";

const MaintenanceRoutes = () => (
  <Routes>
    <Route path="/" element={<MaintenancePage />} />
  </Routes>
);

export default MaintenanceRoutes;
