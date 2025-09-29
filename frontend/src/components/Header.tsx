import { Menu, Search, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import Sidebar from './Sidebar';

function Header() {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-6">
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
          
          <h1 className="text-2xl font-bold tracking-widest font-[Karla]">MONDEUX</h1>
          
          <div className="flex items-center gap-2">
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
            
            <button className="p-2 hover:bg-gray-100 rounded">
              <ShoppingBag className="w-6 h-6" />
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
  );
}

export default Header;