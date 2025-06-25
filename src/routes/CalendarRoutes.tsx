
import { Routes, Route } from "react-router-dom";
import CalendarPage from "@/pages/CalendarPage";

const CalendarRoutes = () => (
  <Routes>
    <Route path="/" element={<CalendarPage />} />
  </Routes>
);

export default CalendarRoutes;
