import { Heart, Menu, Search, ShoppingBag } from 'lucide-react';
import { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import Sidebar from './Sidebar';
import ShoppingCartPanel from './CartPanel';
import { Link, useNavigate } from 'react-router-dom';
import { useCartSummary, useWishlistSummary } from '../hooks/useStoreData';

function Header() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const { totalItems: cartItemCount } = useCartSummary();
  const { totalItems: wishlistCount } = useWishlistSummary();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const submitSearch = () => {
    const query = searchValue.trim();

    if (!query) {
      return;
    }

    navigate(`/products?q=${encodeURIComponent(query)}&title=SEARCH%20RESULTS`);
  };

  return (
    <>
      <header className={`w-full transition-all duration-500 z-50 ${scrolled ? 'bg-background shadow-md' : 'bg-background/90 backdrop-blur-sm shadow-sm'}`}>
        <p className='w-full text-[12px] h-[30px] font-sans bg-primary text-primary-foreground flex justify-center items-center tracking-widest'>
          WELCOME TO MONDEUX. WE ARE LIVE.
        </p>
        <div className="px-8 py-3">
          <div className="grid grid-cols-3 items-center mb-6">
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
            <a href="/" className="flex justify-center">
              <img src="/logo-black.png" alt="MONDEUX" className="h-6 md:h-8 object-contain" />
            </a>

            {/* Right section */}
            <div className="flex items-center gap-4 justify-end">
              <div className="group flex items-center">
                <div className="w-0 group-hover:w-48 transition-all duration-500 ease-in-out overflow-hidden ml-2 min-w-0">
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
                    className="w-full h-[36px] px-4 border-b border-border bg-transparent outline-none font-sans text-sm focus:border-ring transition-colors"
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
                <svg className="w-8 h-8 text-foreground group-hover:text-ring transition-colors duration-300 ">
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

          <nav className="flex items-center justify-center gap-10 text-[13px] text-foreground font-medium overflow-x-auto font-sans tracking-[0.15em]">
            <Link to="/products?sort=price_asc" className="whitespace-nowrap hover:text-ring transition-colors duration-300 relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-[1px] after:bottom-0 after:left-0 after:bg-ring after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left pb-1">
              Shop All
            </Link>
            <Link to="/products?sort=best-selling&title=BEST SELLERS" className="whitespace-nowrap hover:text-ring transition-colors duration-300 relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-[1px] after:bottom-0 after:left-0 after:bg-ring after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left pb-1">
              Best Sellers
            </Link>
            <Link to="/category/tops" className="whitespace-nowrap hover:text-ring transition-colors duration-300 relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-[1px] after:bottom-0 after:left-0 after:bg-ring after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left pb-1">
              Tops
            </Link>
            <Link to="/category/bottoms" className="whitespace-nowrap hover:text-ring transition-colors duration-300 relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-[1px] after:bottom-0 after:left-0 after:bg-ring after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left pb-1">
              Bottoms
            </Link>
            <Link to="/category/jewellery" className="whitespace-nowrap hover:text-ring transition-colors duration-300 relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-[1px] after:bottom-0 after:left-0 after:bg-ring after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left pb-1">
              Jewellery
            </Link>
            <Link to="/my-orders" className="whitespace-nowrap hover:text-ring transition-colors duration-300 relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-[1px] after:bottom-0 after:left-0 after:bg-ring after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left pb-1">
              My Orders
            </Link>
          </nav>
        </div>
      </header>

      {/* Sidebar component */}
      <Sidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />

      {/* Shopping Cart Panel */}
      <ShoppingCartPanel
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </>
  );
}

export default Header;
