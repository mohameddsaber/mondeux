import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';

const HeaderAdmin = () => {
  const  handleLogout = async() => {
      try {
    const res = await fetch(`http://localhost:4000/api/users/logout`, {
      method: "POST",
      credentials: "include", 
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (res.ok) {
      console.log("Logged out successfully");
      window.location.reload();

    } else {
      console.error(data.message || "Logout failed");
    }
  } catch (error) {
    console.error("Error logging out:", error);
  }

  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-md">

      {/* 1. BLACK BAR (Welcome Message) - Remains at the top */}
      <p className='w-full text-[10px] sm:text-[12px] h-[23px] font-[Karla] bg-black text-white flex justify-center items-center'>
        Welcome to Mondeux We are Live
      </p>


      <div className="px-4 py-3 md:py-4">

        <div className="flex justify-between items-center mb-3 md:mb-4">
            
            <button
                onClick={handleLogout}
                className="text-xs text-gray-500 hover:text-red-600 transition font-[Karla] tracking-wider font-medium uppercase p-1 cursor-pointer"
            >
                <LogOut className="w-4 h-4 inline mr-1" />
            </button>
            
            {/* Centered Title */}
            <h1 className="text-xl sm:text-2xl font-bold tracking-widest font-[Karla] text-center absolute left-1/2 transform -translate-x-1/2">
              MONDEUX
            </h1>

            {/* Placeholder for alignment (or another link on the right) */}
            <div className='w-12 h-1'></div>

        </div>
        {/* --- */}
          
        {/* 3. MAIN NAVIGATION */}
        <nav 
          className="flex items-center justify-center gap-3 sm:gap-6 text-[10px] sm:text-[12px] text-[#121212] font-medium 
          overflow-x-auto whitespace-nowrap font-[Karla] tracking-wider py-1"
        >

          <Link to="/admin/dashboard" className="hover:text-gray-600 transition">
              DASHBOARD
          </Link>

          <Link to="/admin/users" className="hover:text-gray-600 transition">
            USERS
          </Link>

          <Link to="/admin/orders" className="hover:text-gray-600 transition">
            ORDERS
          </Link>
          <Link to="/admin/products" className="hover:text-gray-600 transition">PRODUCTS</Link>
          <Link to="/admin/categories" className="hover:text-gray-600 transition">CATEGORIES</Link>

        </nav>
      </div>
    </header>
  );
};

export default HeaderAdmin;