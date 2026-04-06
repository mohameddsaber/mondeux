import { FaTimes } from "react-icons/fa";
import { Menu, Search, ShoppingBag } from 'lucide-react';
import { useState } from "react";
import Sidebar from "./Sidebar";
import ShoppingCartPanel from "./CartPanel";
import { useCartSummary } from "../hooks/useStoreData";

function NavBar() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const { totalItems: cartItemCount } = useCartSummary();

  return (
    <>
      <div className="relative">
        {/* Top bar with menu button */}
        <p className='w-full text-[12px] h-[23px] font-[Karla] bg-black text-white flex justify-center items-center'>
          Welcome to Mondeux We are Live
        </p>
        <div className="grid grid-cols-3 items-center h-[52px] bg-white shadow-md px-4">
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
          <a href="/" className="flex justify-center">
            <img src="/Mondeux.png" alt="Mondeux Logo" className="w-14 h-14" />
          </a>       

          {/* Right section */}
          <div className="flex gap-6 text-[#2a3a51] text-md justify-end items-center">
            <div className="group flex items-center">
              {/* wrapper that animates width; input inside is full-width */}
              <div className="w-0 group-hover:w-40 transition-all duration-500 ease-in-out overflow-hidden ml-2 min-w-0">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full h-[30px] px-2 border border-gray-300 rounded bg-gray-100 outline-none"
                />
              </div>
              <Search className="cursor-pointer" />
            </div>
            <div className="relative">
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative"
              >
                <ShoppingBag className="cursor-pointer" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar menu */}
        <Sidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />
      </div>

      {/* Shopping Cart Panel */}
      <ShoppingCartPanel 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)}
      />
    </>
  );
}

export default NavBar;
