import { Link } from 'react-router-dom'; 

const HeaderAdmin = () => {
  return (
    <header className="bg-white border-b border-gray-200 shadow-md">

      <p className='w-full text-[10px] sm:text-[12px] h-[23px] font-[Karla] bg-black text-white flex justify-center items-center'>
        Welcome to Mondeux We are Live
      </p>

      <div className="px-4 py-3 md:py-4">
        
        <div className="flex justify-center items-center mb-3 md:mb-4">
            <h1 className="text-xl sm:text-2xl font-bold tracking-widest font-[Karla] text-center">
              MONDEUX
            </h1>

        </div>
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