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
        <div className="px-8 py-6">
          <div className="grid grid-cols-3 items-center mb-6">
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
            <a href="/" className="flex justify-center">
              <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-widest text-foreground">
                MONDEUX
              </h1>
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
                <Search className="cursor-pointer text-foreground hover:text-ring transition-colors duration-300 w-5 h-5" onClick={submitSearch} />
              </div>
              <Link to="/wishlist" className="p-2 relative group">
                <Heart className="w-5 h-5 text-foreground group-hover:text-ring transition-colors duration-300" />
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
                <ShoppingBag className="w-5 h-5 text-foreground group-hover:text-ring transition-colors duration-300" />
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
              SHOP ALL
            </Link>

            <Link to="/products?sort=newest&title=NEW IN" className="whitespace-nowrap hover:text-ring transition-colors duration-300 relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-[1px] after:bottom-0 after:left-0 after:bg-ring after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left pb-1">
              NEW IN
            </Link>

            <Link to="/products?sort=best-selling&title=BEST SELLERS" className="whitespace-nowrap hover:text-ring transition-colors duration-300 relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-[1px] after:bottom-0 after:left-0 after:bg-ring after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left pb-1">
              BEST SELLERS
            </Link>
            <Link to="/subcategory/gold-rings" className="whitespace-nowrap hover:text-ring transition-colors duration-300 relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-[1px] after:bottom-0 after:left-0 after:bg-ring after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left pb-1">
              GOLD RINGS
            </Link>
            <Link to="/subcategory/silver-rings" className="whitespace-nowrap hover:text-ring transition-colors duration-300 relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-[1px] after:bottom-0 after:left-0 after:bg-ring after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left pb-1">
              SILVER RINGS
            </Link>
            <Link to="/my-orders" className="whitespace-nowrap hover:text-ring transition-colors duration-300 relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-[1px] after:bottom-0 after:left-0 after:bg-ring after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left pb-1">
              MY ORDERS
            </Link>
          </nav>
        </div>
        
        {/* Sidebar component */}
        <Sidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />
      </header>

      {/* Shopping Cart Panel */}
      <ShoppingCartPanel 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)}
      />
    </>
  );
}

export default Header;
