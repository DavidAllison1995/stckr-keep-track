
import { Routes, Route } from "react-router-dom";
import ShopPage from "@/pages/ShopPage";
import ShopSuccessPage from "@/pages/ShopSuccessPage";
import { CartProvider } from "@/contexts/CartContext";
import { useShop } from "@/hooks/useShop";

const ShopRoutes = () => {
  const { products } = useShop();
  
  return (
    <CartProvider products={products}>
      <Routes>
        <Route path="/" element={<ShopPage />} />
        <Route path="/success" element={<ShopSuccessPage />} />
      </Routes>
    </CartProvider>
  );
};

export default ShopRoutes;
