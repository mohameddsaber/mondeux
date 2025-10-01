import { Menu, Search, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import Sidebar from './Sidebar';
import ShoppingCartPanel from './CartPanel';

function Header() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [cartItemCount, setCartItemCount] = useState<number>(2); // Track cart items count

  return (
    <>
      <header className="bg-white border-b border-gray-200 shadow-md">
        <p className='w-full text-[12px] h-[23px] font-[Karla] bg-black text-white flex justify-center items-center'>
          Welcome to Mondeux We are Live
        </p>
        <div className="px-4 py-4">
          <div className="grid grid-cols-3 items-center mb-4">
            {/* Left section */}
            <div className="flex justify-start">
              {isOpen ? (
                <FaTimes
                  className="cursor-pointer text-xl"
                  onClick={() => setIsOpen(false)}
                />
              ) : (
                <Menu
                  className="cursor-pointer text-xl"
                  onClick={() => setIsOpen(true)}
                />
              )}
            </div>

            {/* Center section */}
            <h1 className="text-2xl font-bold tracking-widest font-[Karla] text-center">MONDEUX</h1>
            
            {/* Right section */}
            <div className="flex items-center gap-2 justify-end">
              <div className="group flex items-center">
                <div className="w-0 group-hover:w-40 transition-all duration-500 ease-in-out overflow-hidden ml-2 min-w-0">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full h-[30px] px-2 border border-gray-300 rounded bg-gray-100 outline-none"
                  />
                </div>
                <Search className="cursor-pointer" />
              </div>
              
              <button 
                className="p-2 hover:bg-gray-100 rounded relative"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingBag className="w-6 h-6" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
          
          <nav className="flex items-center justify-center gap-6 text-[12px] color-[#121212] font-medium overflow-x-auto font-[Karla] tracking-wider">
            <a href="#" className="whitespace-nowrap hover:text-gray-600 transition">SHOP ALL</a>
            <a href="#" className="whitespace-nowrap hover:text-gray-600 transition">NEW IN</a>
            <a href="#" className="whitespace-nowrap hover:text-gray-600 transition">BEST SELLERS</a>
            <a href="#" className="whitespace-nowrap hover:text-gray-600 transition">SHOP GOLD</a>
            <a href="#" className="whitespace-nowrap hover:text-gray-600 transition">SHOP SILVER</a>
            <a href="#" className="whitespace-nowrap hover:text-gray-600 transition">PERLE</a>
            <a href="#" className="whitespace-nowrap hover:text-gray-600 transition">MODERN RODEO</a>
          </nav>
        </div>
        
        {/* Sidebar component */}
        <Sidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />
      </header>

      {/* Shopping Cart Panel */}
      <ShoppingCartPanel 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)}
        onCartUpdate={(count) => setCartItemCount(count)}
      />
    </>
  );
}

export default Header;