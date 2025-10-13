import React from "react";
import { FaFacebookF, FaInstagram, FaTwitter, FaTiktok } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-50 text-gray-800 border-t border-gray-200">
      {/* === Top Section: Hallmark Info === */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-6 md:px-16 py-10 text-center md:text-left">
        {/* Year Mark */}
        <div className="flex flex-col items-center md:items-start space-y-2">
          <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-bold rounded">
            X
          </div>
          <p className="font-semibold text-sm">YEAR MARK</p>
          <p className="text-sm text-gray-600">
            The year that the article was marked.
          </p>
          <a href="#" className="text-sm underline hover:text-black">
            Learn More
          </a>
        </div>

        {/* Sponsors Mark */}
        <div className="flex flex-col items-center md:items-start space-y-2">
          <div className="w-12 h-10 bg-black text-white flex items-center justify-center font-semibold rounded">
            SDN
          </div>
          <p className="font-semibold text-sm">SPONSORS MARK</p>
          <p className="text-sm text-gray-600">
            Shows the company that made the product.
          </p>
          <a href="#" className="text-sm underline hover:text-black">
            Learn More
          </a>
        </div>

        {/* Fineness Mark */}
        <div className="flex flex-col items-center md:items-start space-y-2">
          <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-bold rounded">
            🦁
          </div>
          <p className="font-semibold text-sm">FINENESS MARK</p>
          <p className="text-sm text-gray-600">
            The product is made from sterling silver.
          </p>
          <a href="#" className="text-sm underline hover:text-black">
            Learn More
          </a>
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* === Bottom Section: Footer Links === */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-10 px-6 md:px-16 py-12 text-center md:text-left">
        {/* About Us */}
        <div>
          <h4 className="font-semibold mb-3">ABOUT US</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li><a href="#" className="hover:text-black">About Us</a></li>
            <li><a href="#" className="hover:text-black">Hallmarking</a></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="font-semibold mb-3">LEGAL</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li><a href="#" className="hover:text-black">Terms & Conditions</a></li>
            <li><a href="#" className="hover:text-black">Privacy Policy</a></li>
          </ul>
        </div>

        {/* Information */}
        <div>
          <h4 className="font-semibold mb-3">INFORMATION</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li><a href="#" className="hover:text-black">Delivery</a></li>
            <li><a href="#" className="hover:text-black">Returns</a></li>
            <li><a href="#" className="hover:text-black">Product Search</a></li>
          </ul>
        </div>

        {/* Customer Services */}
        <div>
          <h4 className="font-semibold mb-3">CUSTOMER SERVICES</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li><a href="#" className="hover:text-black">Care Guide</a></li>
            <li><a href="#" className="hover:text-black">Size Guide</a></li>
            <li><a href="#" className="hover:text-black">Student Discount</a></li>
            <li><a href="#" className="hover:text-black">Help Centre</a></li>
            <li><a href="#" className="hover:text-black">Track Your Order</a></li>
          </ul>
        </div>

        {/* Stockists & Socials */}
        <div>
          <h4 className="font-semibold mb-3">STOCKISTS</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li><a href="#" className="hover:text-black">View Stockists</a></li>
          </ul>
          <div className="flex justify-center md:justify-start space-x-4 mt-4">
            <a href="#"><FaFacebookF className="hover:text-black" /></a>
            <a href="#"><FaInstagram className="hover:text-black" /></a>
            <a href="#"><FaTwitter className="hover:text-black" /></a>
            <a href="#"><FaTiktok className="hover:text-black" /></a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-200 text-center py-6 text-xs text-gray-600">
        ©2025 Serge DeNimes. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;
