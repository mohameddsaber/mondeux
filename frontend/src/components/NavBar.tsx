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
            <button
              className="relative w-6 h-[14px] flex flex-col justify-between cursor-pointer group"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {/* Top line: gap near right edge */}
              <div className={`flex w-full transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-[6.5px] gap-0' : 'gap-[3px]'}`}>
                <span className="h-[1px] w-[17px] bg-foreground group-hover:bg-ring transition-colors duration-300"></span>
                <span className="h-[1px] flex-1 bg-foreground group-hover:bg-ring transition-colors duration-300"></span>
              </div>
              {/* Center line: solid */}
              <div className={`h-[1px] w-full bg-foreground group-hover:bg-ring transition-all duration-300 ${isOpen ? 'opacity-0' : 'opacity-100'}`}></div>
              {/* Bottom line: gap near left edge */}
              <div className={`flex w-full transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-[6.5px] gap-0' : 'gap-[3px]'}`}>
                <span className="h-[1px] w-[4px] bg-foreground group-hover:bg-ring transition-colors duration-300"></span>
                <span className="h-[1px] flex-1 bg-foreground group-hover:bg-ring transition-colors duration-300"></span>
              </div>
            </button>
          </div>

          {/* Center section */}
          <a href="/" className="flex justify-center items-center">
            <img src="/logo-black.png" alt="MONDEUX" className="h-6 object-contain" />
          </a>

          {/* Right section */}
          <div className="flex items-center gap-4 justify-end text-foreground text-md">
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
              <svg className="cursor-pointer text-foreground hover:text-ring transition-colors duration-300 w-8 h-8" onClick={submitSearch}>
                <use href="/sprite.svg#search"></use>
              </svg>
            </div>
            <Link to="/wishlist" className="p-2 relative group">
              <svg className="cursor-pointer text-foreground group-hover:text-ring transition-colors duration-300 w-8 h-8">
                <use href="/sprite.svg#bookmark"></use>
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-sans">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <button
              className="p-2 relative group"
              onClick={() => setIsCartOpen(true)}
            >
              <svg className="w-8 h-8 text-foreground group-hover:text-ring transition-colors duration-300">
                <use href="/sprite.svg#cart"></use>
              </svg>
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-sans">
                  {cartItemCount}
                </span>
              )}
            </button>
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
