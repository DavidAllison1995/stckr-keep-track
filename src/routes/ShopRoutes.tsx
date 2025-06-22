
import { Routes, Route } from "react-router-dom";
import ShopPage from "@/pages/ShopPage";
import ShopSuccessPage from "@/pages/ShopSuccessPage";

const ShopRoutes = () => (
  <Routes>
    <Route path="/" element={<ShopPage />} />
    <Route path="/success" element={<ShopSuccessPage />} />
  </Routes>
);

export default ShopRoutes;
