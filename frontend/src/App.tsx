import { Routes, Route } from "react-router-dom"
import Header from "./components/Header.tsx"
import NavBar from "./components/NavBar.tsx"
import ProductsPage from "./pages/ProductsPage.tsx"
import HomePage from "./pages/HomePage.tsx"
import ProductItemPage from "./pages/ProductItemPage.tsx"
import CartPage from "./pages/CartPage.tsx"


function App() {


  return (
    <>
      <div className="hidden md:block fixed top-0 left-0 right-0 z-50">
        <Header />
      </div>

      <div className="md:hidden fixed top-0 left-0 right-0 z-50">
        <NavBar />
      </div>

    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="products/:category" element={<ProductsPage />} />
      <Route path="products/:category/:subcategory" element={<ProductsPage />} />
      <Route path="products/:category/:subcategory/:productId" element={   <ProductItemPage />} />
    </Routes>



    </>
  )
}

export default App
