import {  Search, Plus } from 'lucide-react';
import {  useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '../lib/api';
import { useLogoutMutation } from '../hooks/useStoreData';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [searchValue, setSearchValue] = useState<string>("");
  const [expandedMenus, setExpandedMenus] = useState<{[key: string]: boolean}>({});
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
    `w-5 h-5 transform transition-transform duration-300 cursor-pointer h-[15px] w-[7px] ${
      expandedMenus[menuName] ? "rotate-45" : ""
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
      className={`fixed top-0 left-0 h-full w-[400px] bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 overflow-y-auto ${
        isOpen ? "translate-x-0" : "-translate-x-full"
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
            {/* Modern Rodeo - Expandable */}
            {/* <li>
              <button
                onClick={() => toggleMenu("modern-rodeo")}
                className={sidebarItem}
              >
                <span>MODERN RODEO</span>
                <Plus className={getPlusStyling("modern-rodeo")} />
              </button>
            </li> */}

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

            {/* Perle
            <li>
              <a href="#" className={sidebarLink}>PERLE</a>
            </li> */}


            {/* Shop All - Expandable */}
            <li>
              <button
                onClick={() => toggleMenu("shop-all")}
                className={sidebarItem}
              >
                <span>SHOP ALL</span>
                <Plus className={getPlusStyling("shop-all")} />
              </button>
              {expandedMenus["shop-all"] && (
                <ul className={submenu}>
                  <li><Link to="/products" className={submenuLink} onClick={onClose}>All Jewelry</Link></li>
                  <li><Link to="/category/rings" className={submenuLink} onClick={onClose}>Shop Rings</Link></li>
                  <li><Link to="/category/bracelets" className={submenuLink} onClick={onClose}>Shop Bracelets</Link></li>
                  <li><Link to="/category/necklaces" className={submenuLink} onClick={onClose}>Shop Necklaces</Link></li>
                  <li><Link to="/category/wallets" className={submenuLink} onClick={onClose}>Shop Wallets</Link></li>
                </ul>
              )}
            </li>

            {/* Rings - Expandable */}
            <li>
              <button
                onClick={() => toggleMenu("rings")}
                className={sidebarItem}
              >
                <span>RINGS</span>
                <Plus className={getPlusStyling("rings")} />
              </button>

              {expandedMenus["rings"] && (
                <ul className={submenu}>
                  <li><Link to="category/rings" className={submenuLink} onClick={onClose}>All Rings</Link></li>
                  <li><Link to="subcategory/silver-rings" className={submenuLink} onClick={onClose}>Silver Rings</Link></li>
                  <li><Link to="subcategory/gold-rings" className={submenuLink} onClick={onClose}>Gold Rings</Link></li>
                  {/* <li><Link to="#" className={submenuLink}>Statement Rings</Link></li>
                  <li><Link to="#" className={submenuLink}>Stone Rings</Link></li>
                  <li><Link to="#" className={submenuLink}>Signet Rings</Link></li> */}
                </ul>
              )}
            </li>

            {/* Necklaces - Expandable */}
            <li>
              <button
                onClick={() => toggleMenu("necklaces")}
                className={sidebarItem}
              >
                <span>NECKLACES</span>
                <Plus className={getPlusStyling("necklaces")} />
              </button>
              {expandedMenus["necklaces"] && (
                <ul className={submenu}>
                  <li><Link to="/category/necklaces" className={submenuLink} onClick={onClose}>All Necklaces</Link></li>
                  <li><Link to="subcategory/silver-necklaces" className={submenuLink} onClick={onClose}>Silver Necklaces</Link></li>
                  <li><Link to="subcategory/gold-necklaces" className={submenuLink} onClick={onClose}>Gold Necklaces</Link></li>
                  {/* <li><a href="#" className={submenuLink}>Pendant Necklaces</a></li>
                  <li><a href="#" className={submenuLink}>Chain Necklaces</a></li> */}
                </ul>
              )}
            </li>

            {/* Bracelets - Expandable */}
            <li>
              <button
                onClick={() => toggleMenu("bracelets")}
                className={sidebarItem}
              >
                <span>BRACELETS</span>
                <Plus className={getPlusStyling("bracelets")} />
              </button>
              {expandedMenus["bracelets"] && (
                <ul className={submenu}>
                  <li><Link to="/category/bracelets" className={submenuLink} onClick={onClose}>All Bracelets</Link></li>
                  <li><Link to="/subcategory/silver-bracelets" className={submenuLink} onClick={onClose}>Silver Bracelets</Link></li>
                  <li><Link to="/subcategory/gold-bracelets" className={submenuLink} onClick={onClose}>Gold Bracelets</Link></li>
                  {/* <li><a href="#" className={submenuLink}>Cuff Bracelets</a></li> */}
                </ul>
              )}
            </li>

            {/* Wallets - Expandable */}
            <li>
              <button
                onClick={() => toggleMenu("wallets")}
                className={sidebarItem}
              >
                <span>WALLETS</span>
                <Plus className={getPlusStyling("wallets")} />
              </button>
              {expandedMenus["wallets"] && (
                <ul className={submenu}>
                  <li><a href="#" className={submenuLink} onClick={onClose}>All Wallets</a></li>
                  <li><a href="#" className={submenuLink} onClick={onClose}>Slim Wallets</a></li>
                  <li><a href="#" className={submenuLink} onClick={onClose}>Card Holders</a></li>
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
                  <li><a href="/products" className={submenuLink} onClick={onClose}>All Accessories</a></li>
                </ul>
              )}
            </li>
            <li className={sidebarItem}>
              <Link to="/my-orders" className="" onClick={onClose}>MY ORDERS</Link>
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
