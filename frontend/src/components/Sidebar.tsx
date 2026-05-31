import { Search, Plus } from 'lucide-react';
import { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '../lib/api';
import { useLogoutMutation } from '../hooks/useStoreData';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [searchValue, setSearchValue] = useState<string>("");
  const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({});
  const logoutMutation = useLogoutMutation();
  const navigate = useNavigate();

  const baseText = "font-bold font-[Karla] tracking-wider text-[12px] text-[#121212]";
  const itemPadding = "pb-4";
  const sidebarItem = `w-full flex items-center justify-between text-left ${baseText} ${itemPadding}`;
  const sidebarLink = `block hover:opacity-70 ${baseText} ${itemPadding}`;
  const submenu = "pl-4 pb-4 space-y-2";
  const submenuLink = "block hover:opacity-70 text-[12px] font-[Karla] text-[#121212]";

  // helper function for + rotation
  const getPlusStyling = (menuName: string) =>
    `w-5 h-5 transform transition-transform duration-300 cursor-pointer h-[15px] w-[7px] ${expandedMenus[menuName] ? "rotate-45" : ""
    }`;

  const toggleMenu = (menuName: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };
  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      window.location.assign("/");
    } catch (error) {
      console.error("Error logging out:", getApiErrorMessage(error, "Logout failed"));
    }
  };

  const submitSearch = () => {
    const query = searchValue.trim();

    if (!query) {
      return;
    }

    onClose();
    navigate(`/products?q=${encodeURIComponent(query)}&title=SEARCH%20RESULTS`);
  };



  return (
    <div
      className={`fixed top-0 left-0 h-full w-[400px] bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 overflow-y-auto ${isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
    >
      <div className="px-10 py-7">
        {/* Close button */}
        <div className="mb-8 flex justify-between items-center">
          {/* Close button */}
          <button onClick={onClose} className="text-black hover:opacity-70 transition-opacity">
            <span className="text-[12px] font-[Karla] font-bold tracking-wider cursor-pointer">CLOSE</span>
          </button>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="text-black hover:opacity-70 transition-opacity"
          >
            <span className="text-[12px] font-[Karla] font-bold tracking-wider cursor-pointer">
              LOGOUT
            </span>
          </button>
        </div>


        {/* Search */}
        <div className="mb-8">
          <div className="flex items-center border-b-2 border-black pb-2">
            <input
              type="text"
              placeholder="SEARCH"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  submitSearch();
                }
              }}
              className="flex-1 outline-none text-[12px] font-[Karla] font-bold tracking-wider placeholder-black"
            />
            <Search className="w-6 h-6 cursor-pointer" onClick={submitSearch} />
          </div>
        </div>

        {/* Menu items */}
        <nav>
          <ul className="space-y-0">
            {/* New In */}
            <li>
              <Link to="/products?sort=newest" className={sidebarLink} onClick={onClose}>
                NEW IN
              </Link>
            </li>

            {/* Best Sellers */}
            <li>
              <Link to="/products?sort=best-selling" className={sidebarLink} onClick={onClose}>
                BEST SELLERS
              </Link>
            </li>

            {/* Tops - Expandable */}
            <li>
              <button
                onClick={() => toggleMenu("tops")}
                className={sidebarItem}
              >
                <span>TOPS</span>
                <Plus className={getPlusStyling("tops")} />
              </button>

              {expandedMenus["tops"] && (
                <ul className={submenu}>
                  <li><Link to="/category/tops" className={submenuLink} onClick={onClose}>All Tops</Link></li>
                  <li><Link to="/subcategory/t-shirts" className={submenuLink} onClick={onClose}>T-Shirts</Link></li>
                  <li><Link to="/subcategory/shirts" className={submenuLink} onClick={onClose}>Shirts</Link></li>
                  <li><Link to="/subcategory/sweaters" className={submenuLink} onClick={onClose}>Sweaters</Link></li>
                  <li><Link to="/subcategory/hoodies" className={submenuLink} onClick={onClose}>Hoodies</Link></li>
                  <li><Link to="/subcategory/jackets" className={submenuLink} onClick={onClose}>Jackets</Link></li>
                  <li><Link to="/subcategory/polos" className={submenuLink} onClick={onClose}>Polos</Link></li>
                  <li><Link to="/subcategory/tank-tops" className={submenuLink} onClick={onClose}>Tank Tops</Link></li>

                </ul>
              )}
            </li>

            {/* Bottoms - Expandable */}
            <li>
              <button
                onClick={() => toggleMenu("bottoms")}
                className={sidebarItem}
              >
                <span>BOTTOMS</span>
                <Plus className={getPlusStyling("bottoms")} />
              </button>

              {expandedMenus["bottoms"] && (
                <ul className={submenu}>
                  <li><Link to="/category/bottoms" className={submenuLink} onClick={onClose}>All Bottoms</Link></li>
                  <li><Link to="/subcategory/jeans" className={submenuLink} onClick={onClose}>Jeans</Link></li>
                  <li><Link to="/subcategory/trousers" className={submenuLink} onClick={onClose}>Trousers</Link></li>
                  <li><Link to="/subcategory/shorts" className={submenuLink} onClick={onClose}>Shorts</Link></li>
                  <li><Link to="/subcategory/sweatpants" className={submenuLink} onClick={onClose}>Sweatpants</Link></li>
                </ul>
              )}
            </li>

            {/* Footwear - Expandable */}
            <li>
              <button
                onClick={() => toggleMenu("footwear")}
                className={sidebarItem}
              >
                <span>FOOTWEAR</span>
                <Plus className={getPlusStyling("footwear")} />
              </button>
              {expandedMenus["footwear"] && (
                <ul className={submenu}>
                  <li><Link to="/category/footwear" className={submenuLink} onClick={onClose}>All Footwear</Link></li>
                  <li><Link to="/subcategory/sneakers" className={submenuLink} onClick={onClose}>Sneakers</Link></li>
                  <li><Link to="/subcategory/boots" className={submenuLink} onClick={onClose}>Boots</Link></li>
                  <li><Link to="/subcategory/loafers" className={submenuLink} onClick={onClose}>Loafers</Link></li>
                </ul>
              )}
            </li>

            {/* Jewellery - Expandable */}
            <li>
              <button
                onClick={() => toggleMenu("jewellery")}
                className={sidebarItem}
              >
                <span>JEWELLERY</span>
                <Plus className={getPlusStyling("jewellery")} />
              </button>
              {expandedMenus["jewellery"] && (
                <ul className={submenu}>
                  <li><Link to="/category/jewellery" className={submenuLink} onClick={onClose}>All Jewellery</Link></li>
                  <li><Link to="/subcategory/rings" className={submenuLink} onClick={onClose}>Rings</Link></li>
                  <li><Link to="/subcategory/necklaces" className={submenuLink} onClick={onClose}>Necklaces</Link></li>
                  <li><Link to="/subcategory/bracelets" className={submenuLink} onClick={onClose}>Bracelets</Link></li>
                </ul>
              )}
            </li>

            {/* Accessories - Expandable */}
            <li>
              <button
                onClick={() => toggleMenu("accessories")}
                className={sidebarItem}
              >
                <span>ACCESSORIES</span>
                <Plus className={getPlusStyling("accessories")} />
              </button>
              {expandedMenus["accessories"] && (
                <ul className={submenu}>
                  <li><Link to="/category/accessories" className={submenuLink} onClick={onClose}>All Accessories</Link></li>
                  <li><Link to="/subcategory/bags" className={submenuLink} onClick={onClose}>Bags</Link></li>
                  <li><Link to="/subcategory/belts" className={submenuLink} onClick={onClose}>Belts</Link></li>
                  <li><Link to="/subcategory/hats" className={submenuLink} onClick={onClose}>Hats</Link></li>
                  <li><Link to="/subcategory/sunglasses" className={submenuLink} onClick={onClose}>Sunglasses</Link></li>
                  <li><Link to="/subcategory/wallets" className={submenuLink} onClick={onClose}>Wallets</Link></li>
                  <li><Link to="/subcategory/gloves" className={submenuLink} onClick={onClose}>Gloves</Link></li>
                  <li><Link to="/subcategory/socks" className={submenuLink} onClick={onClose}>Socks</Link></li>
                  <li><Link to="/subcategory/ties" className={submenuLink} onClick={onClose}>Ties</Link></li>
                  <li><Link to="/subcategory/cufflinks" className={submenuLink} onClick={onClose}>Cufflinks</Link></li>
                </ul>
              )}
            </li>

            <li className={sidebarItem}>
              <Link to="/my-orders" className="" onClick={onClose}>MY ORDERS</Link>
            </li>
            <li className={sidebarItem}>
              <Link to="/wishlist" className="" onClick={onClose}>WISHLIST</Link>
            </li>

          </ul>
        </nav>

        {/* Footer links */}
        <div className="mt-12 space-y-1.5 text-[12px] font-Karla">
          <a href="#" className="block hover:opacity-70">View Stockists</a>
          <a href="#" className="block hover:opacity-70">Help Centre</a>
          <a href="#" className="block hover:opacity-70">Terms & Conditions</a>
          <a href="#" className="block hover:opacity-70">Privacy Policy</a>
        </div>

        {/* Copyright */}
        <p className="mt-12 text-[8px] text-[#121212]">
          ©2025 Mondeux. All Rights Reserved.
        </p>
      </div>
    </div>
  );
}

export default Sidebar;
