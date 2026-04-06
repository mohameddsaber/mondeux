import { useEffect, useState } from "react";
import { Routes, Route, useParams, Navigate, useNavigate, useLocation } from "react-router-dom";
import Header from "./components/Header";
import NavBar from "./components/NavBar";
import ProductsPage from "./pages/ProductsPage";
import HomePage from "./pages/HomePage";
import ProductItemPage from "./pages/ProductItemPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import AuthPage from "./pages/AuthPage";
import CategoryPage from "./pages/CategoryPage";
import SubCategoryPage from "./pages/SubCategoryPage";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import WishlistPage from "./pages/WishlistPage";
import LoyaltyScheme from "./pages/LoyalityScheme";
import LoyaltySchemeNoAuth from "./pages/LoyaltySchemeNoAuth";
import { Award} from "lucide-react";
import Dashboard from "./pages/Admin/Dashboard";
import Users from "./pages/Admin/Users";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import ProductPage from "./pages/Admin/ProductPage";
import OrderPage from "./pages/Admin/OrdersPage";
import CategoriesPageAdmin from "./pages/Admin/CategoriesPage";
import Footer from './components/Footer';
import TestimonialsSection from "./components/TestimonialsSection";
import HeaderAdmin from "./components/HeaderAdmin";
import { useCurrentUserQuery } from "./hooks/useStoreData";

const CategoryPageWrapper = () => {
    const { categorySlug } = useParams<{ categorySlug: string }>();
    if (!categorySlug) return <div>Error: Category not specified.</div>;
    return <CategoryPage categorySlug={categorySlug} />;
}
const SubCategoryPageWrapper = () => {
    const { subCategorySlug } = useParams<{ subCategorySlug: string }>();
    if (!subCategorySlug) return <div>Error: SubCategory not specified.</div>;
    return <SubCategoryPage subCategorySlug={subCategorySlug} />;
}
function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoyaltyOpen, setIsLoyaltyOpen] = useState(false);
  const { data: currentUser, isPending: isCheckingAdmin } = useCurrentUserQuery();
  const isAuthenticated = Boolean(currentUser);
  const isAdmin = currentUser?.role === "admin";
  const loyaltyPoints = currentUser?.loyalty?.pointsBalance ?? 0;

  useEffect(() => {
    if (
      isAdmin &&
      (location.pathname === "/" || location.pathname === "/auth")
    ) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [isAdmin, location.pathname, navigate]);

  return (
    <>
      {/* Header */}
   {isAdmin  ? (
      <>
      <div className="fixed top-0 left-0 right-0 z-50">
        <HeaderAdmin />
      </div>
      <div className="md:hidden h-[110px] bg-[#f4f4f5]"></div>
      </>
    ) : isCheckingAdmin ? null : (
      <>
        <div className="hidden md:block fixed top-0 left-0 right-0 z-50">
          <Header />

        </div>
        <div className="md:hidden fixed top-0 left-0 right-0 z-50">
          <NavBar />
        </div>
        <div className="md:hidden h-[76px] bg-[#f4f4f5]"></div>
      </>
    )}
      <div className="hidden md:block h-[140px] bg-[#f4f4f5]"></div>

      {/* Routes */}
          <Routes>
            {/* User-facing routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/category/:categorySlug" element={<CategoryPageWrapper />} />
            <Route path="/subcategory/:subCategorySlug" element={<SubCategoryPageWrapper />} />
            <Route path="/products/:slug" element={<ProductItemPage />} />
            <Route path="/my-orders" element={<OrderHistoryPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />

            {/* Admin Routes */}

            <Route 
              path="/admin" 
              element={
                <ProtectedAdminRoute isAdmin={isAdmin} isCheckingAdmin={isCheckingAdmin}>
                  <Navigate to="/admin/dashboard" />
                </ProtectedAdminRoute>
              } 
            />
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedAdminRoute isAdmin={isAdmin} isCheckingAdmin={isCheckingAdmin}>
                  <Dashboard />
                </ProtectedAdminRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <ProtectedAdminRoute isAdmin={isAdmin} isCheckingAdmin={isCheckingAdmin}>
                  <Users />
                </ProtectedAdminRoute>
              } 
            />
            <Route 
              path="/admin/orders" 
              element={
                <ProtectedAdminRoute isAdmin={isAdmin} isCheckingAdmin={isCheckingAdmin}>
                  <OrderPage />
                </ProtectedAdminRoute>
              } 
            />
            <Route 
              path="/admin/products" 
              element={
                <ProtectedAdminRoute isAdmin={isAdmin} isCheckingAdmin={isCheckingAdmin}>
                  <ProductPage />
                </ProtectedAdminRoute>
              } 
            />
            <Route 
              path="/admin/categories" 
              element={
                <ProtectedAdminRoute isAdmin={isAdmin} isCheckingAdmin={isCheckingAdmin}>
                  <CategoriesPageAdmin />
                </ProtectedAdminRoute>
              } 
            />
          </Routes>


      {/* Loyalty Scheme Button */}
      {!isAdmin && (
        <button
          onClick={() => setIsLoyaltyOpen(true)}
          className="fixed bottom-6 right-6 bg-black text-white px-6 py-3 rounded-full shadow-lg hover:bg-gray-800 transition-all duration-300 flex items-center gap-2 z-40 font-[Karla] font-bold text-sm tracking-wider"
        >
          <Award className="w-5 h-5" />
          <span className="hidden sm:inline">Loyalty Scheme</span>
          <span className="inline sm:hidden">Loyalty</span>
          <span className="bg-white text-black rounded-full min-w-6 h-6 px-1 flex items-center justify-center text-xs">
            {loyaltyPoints}
          </span>
        </button>
      )}

      {/* Loyalty Scheme Modal */}
      {isAuthenticated && <LoyaltyScheme
        isOpen={isLoyaltyOpen}
        setIsOpen={setIsLoyaltyOpen}        
      />}
      {!isAuthenticated && <LoyaltySchemeNoAuth
        isOpen={isLoyaltyOpen}
        setIsOpen={setIsLoyaltyOpen}        
      />}
      < TestimonialsSection />
      <Footer />
    </>
  );
}

export default App;
