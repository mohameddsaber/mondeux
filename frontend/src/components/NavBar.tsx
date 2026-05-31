import { FaTimes } from "react-icons/fa";
import { Heart, Menu, Search, ShoppingBag } from 'lucide-react';
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import ShoppingCartPanel from "./CartPanel";
import { useCartSummary, useWishlistSummary } from "../hooks/useStoreData";

function NavBar() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState("");
  const { totalItems: cartItemCount } = useCartSummary();
  const { totalItems: wishlistCount } = useWishlistSummary();
  const navigate = useNavigate();

  const submitSearch = () => {
    const query = searchValue.trim();

    if (!query) {
      return;
    }

    navigate(`/products?q=${encodeURIComponent(query)}&title=SEARCH%20RESULTS`);
  };

  return (
    <>
      <div className="relative z-50">
        {/* Top bar with menu button */}
        <p className='w-full text-[10px] sm:text-[12px] h-[30px] font-sans bg-primary text-primary-foreground flex justify-center items-center tracking-widest'>
          WELCOME TO MONDEUX. WE ARE LIVE.
        </p>
        <div className="grid grid-cols-3 items-center h-[60px] bg-background/90 backdrop-blur-sm shadow-sm px-4">
          {/* Left section */}
          <div className="flex justify-start">
            {isOpen ? (
              <FaTimes
                className="cursor-pointer text-xl text-foreground hover:text-ring transition-colors duration-300"
                onClick={() => setIsOpen(false)}
              />
            ) : (
              <Menu
                className="cursor-pointer text-xl text-foreground hover:text-ring transition-colors duration-300"
                onClick={() => setIsOpen(true)}
              />
            )}
          </div>
          
          {/* Center section */}
          <a href="/" className="flex justify-center items-center">
            <img src="/logo.png" alt="MONDEUX" className="h-8 sm:h-10 object-contain" />
          </a>       

          {/* Right section */}
          <div className="flex gap-4 text-foreground text-md justify-end items-center">
            <div className="group flex items-center">
              {/* wrapper that animates width; input inside is full-width */}
              <div className="w-0 group-hover:w-32 sm:group-hover:w-40 transition-all duration-500 ease-in-out overflow-hidden ml-2 min-w-0">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      submitSearch();
                    }
                  }}
                  className="w-full h-[30px] px-2 border-b border-border bg-transparent outline-none font-sans text-sm focus:border-ring transition-colors"
                />
              </div>
              <Search className="cursor-pointer text-foreground hover:text-ring transition-colors duration-300 w-5 h-5" onClick={submitSearch} />
            </div>
            <Link to="/wishlist" className="relative group">
              <Heart className="cursor-pointer text-foreground group-hover:text-ring transition-colors duration-300 w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-sans">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <div className="relative group">
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative"
              >
                <ShoppingBag className="cursor-pointer text-foreground group-hover:text-ring transition-colors duration-300 w-5 h-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-sans">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar menu */}
      <Sidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />

      {/* Shopping Cart Panel */}
      <ShoppingCartPanel 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)}
      />
    </>
  );
}

export default NavBar;
