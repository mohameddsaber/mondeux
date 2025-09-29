import { FaTimes } from "react-icons/fa";
import { Menu, Search, ShoppingBag } from 'lucide-react';
import { useState } from "react";
import Sidebar from "./Sidebar";

function NavBar() {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div className="relative">
      {/* Top bar with menu button */}
      <div className="flex justify-start items-center h-[52px] bg-white shadow-md px-4">
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
        
        <a href="/" className="ml-auto">
          <h1 className="text-2xl font-bold tracking-widest font-[Karla]">MONDEUX</h1>

        </a>       

        <div className="flex gap-6 text-[#2a3a51] text-md justify-center items-center ml-auto">
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
          <div>
            <a href="#">
              <ShoppingBag className="cursor-pointer" />
            </a>
          </div>
        </div>
      </div>

      {/* Sidebar menu */}
      <Sidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}

export default NavBar;