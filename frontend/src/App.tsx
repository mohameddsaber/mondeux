import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import NavBar from "./components/NavBar";
import ProductsPage from "./pages/ProductsPage";
import HomePage from "./pages/HomePage";
import ProductItemPage from "./pages/ProductItemPage";
import CartPage from "./pages/CartPage";
import AuthPage from "./pages/AuthPage";
import LoyaltyScheme from "./pages/LoyalityScheme";
import LoyaltySchemeNoAuth from "./pages/LoyaltySchemeNoAuth";
import { Award } from "lucide-react";

function App() {
  const [isLoyaltyOpen, setIsLoyaltyOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/users/profile", {
          method: "GET",
          credentials: "include", // important if using cookies
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        setIsAuthenticated(false);
        console.log(err);
      }
    };

    checkAuth();
  }, []);

  return (
    <>
      {/* Header */}
      <div className="hidden md:block fixed top-0 left-0 right-0 z-50">
        <Header />
      </div>

      {/* Mobile Nav */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50">
        <NavBar  />
      </div>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="products/:category" element={<ProductsPage />} />
        <Route path="products/:category/:subcategory" element={<ProductsPage />} />
        <Route
          path="products/:category/:subcategory/:productId"
          element={<ProductItemPage />}
        />
      </Routes>

      {/* Loyalty Scheme Button */}
      <button
        onClick={() => setIsLoyaltyOpen(true)}
        className="fixed bottom-6 right-6 bg-black text-white px-6 py-3 rounded-full shadow-lg hover:bg-gray-800 transition-all duration-300 flex items-center gap-2 z-40 font-[Karla] font-bold text-sm tracking-wider"
      >
        <Award className="w-5 h-5" />
        <span className="hidden sm:inline">Loyalty Scheme</span>
        <span className="inline sm:hidden">Loyalty</span>
        <span className="bg-white text-black rounded-full w-6 h-6 flex items-center justify-center text-xs">
          6
        </span>
      </button>

      {/* Loyalty Scheme Modal */}
      {isAuthenticated && <LoyaltyScheme
        isOpen={isLoyaltyOpen}
        setIsOpen={setIsLoyaltyOpen}        
      />}
      {!isAuthenticated && <LoyaltySchemeNoAuth
        isOpen={isLoyaltyOpen}
        setIsOpen={setIsLoyaltyOpen}        
      />}
    </>
  );
}

export default App;
