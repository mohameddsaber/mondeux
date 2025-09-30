import { Routes, Route } from "react-router-dom"
import Header from "./components/Header.tsx"
import NavBar from "./components/NavBar.tsx"
import AllProductsPage from "./pages/AllProductsPage.tsx"


function App() {


  return (
    <>
      <div className="hidden md:block fixed top-0 left-0 right-0 z-50">
        <Header />
      </div>

      <div className="md:hidden fixed top-0 left-0 right-0 z-50">
        <NavBar />
      </div>

      <Routes >
      <Route path="/" element={<AllProductsPage />} />
      </Routes>



    </>
  )
}

export default App
