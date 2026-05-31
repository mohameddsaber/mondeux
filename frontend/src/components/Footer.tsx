import { FaFacebookF, FaInstagram, FaTwitter, FaTiktok } from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      {/* === Top Section: Hallmark Info === */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 px-8 md:px-24 py-20 text-center md:text-left">
        {/* Year Mark */}
        <div className="flex flex-col items-center md:items-start space-y-4">
          <div className="w-12 h-12 border border-background/20 flex items-center justify-center font-serif text-lg">
            X
          </div>
          <p className="font-sans text-sm tracking-[0.2em] text-ring">YEAR MARK</p>
          <p className="text-sm font-sans tracking-wide text-background/70 font-light leading-relaxed">
            The year that the article was marked.
          </p>
          <Link to="#" className="text-xs font-sans tracking-[0.2em] border-b border-background/30 pb-1 hover:text-ring hover:border-ring transition-colors duration-500">
            LEARN MORE
          </Link>
        </div>

        {/* Sponsors Mark */}
        <div className="flex flex-col items-center md:items-start space-y-4">
          <div className="px-4 h-12 border border-background/20 flex items-center justify-center font-serif text-lg">
            MON
          </div>
          <p className="font-sans text-sm tracking-[0.2em] text-ring">MAKERS MARK</p>
          <p className="text-sm font-sans tracking-wide text-background/70 font-light leading-relaxed">
            Shows the atelier that crafted the product.
          </p>
          <Link to="#" className="text-xs font-sans tracking-[0.2em] border-b border-background/30 pb-1 hover:text-ring hover:border-ring transition-colors duration-500">
            LEARN MORE
          </Link>
        </div>

        {/* Fineness Mark */}
        <div className="flex flex-col items-center md:items-start space-y-4">
          <div className="w-12 h-12 border border-background/20 flex items-center justify-center font-serif text-xl">
            狮
          </div>
          <p className="font-sans text-sm tracking-[0.2em] text-ring">FINENESS MARK</p>
          <p className="text-sm font-sans tracking-wide text-background/70 font-light leading-relaxed">
            The product is crafted from pure materials.
          </p>
          <Link to="#" className="text-xs font-sans tracking-[0.2em] border-b border-background/30 pb-1 hover:text-ring hover:border-ring transition-colors duration-500">
            LEARN MORE
          </Link>
        </div>
      </div>

      <div className="px-8 md:px-24">
        <hr className="border-background/10" />
      </div>

      {/* === Bottom Section: Footer Links === */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-12 px-8 md:px-24 py-20 text-center md:text-left">
        {/* About Us */}
        <div>
          <h4 className="font-serif text-lg tracking-widest mb-6 text-white">THE HOUSE</h4>
          <ul className="space-y-4 text-xs font-sans tracking-[0.15em] text-background/60">
            <li><Link to="#" className="hover:text-ring transition-colors duration-300">ABOUT US</Link></li>
            <li><Link to="#" className="hover:text-ring transition-colors duration-300">CRAFTSMANSHIP</Link></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="font-serif text-lg tracking-widest mb-6 text-white">LEGAL</h4>
          <ul className="space-y-4 text-xs font-sans tracking-[0.15em] text-background/60">
            <li><Link to="#" className="hover:text-ring transition-colors duration-300">TERMS & CONDITIONS</Link></li>
            <li><Link to="#" className="hover:text-ring transition-colors duration-300">PRIVACY POLICY</Link></li>
          </ul>
        </div>

        {/* Information */}
        <div>
          <h4 className="font-serif text-lg tracking-widest mb-6 text-white">INFORMATION</h4>
          <ul className="space-y-4 text-xs font-sans tracking-[0.15em] text-background/60">
            <li><Link to="#" className="hover:text-ring transition-colors duration-300">SHIPPING</Link></li>
            <li><Link to="#" className="hover:text-ring transition-colors duration-300">RETURNS</Link></li>
            <li><Link to="/products" className="hover:text-ring transition-colors duration-300">CATALOGUE</Link></li>
          </ul>
        </div>

        {/* Customer Services */}
        <div>
          <h4 className="font-serif text-lg tracking-widest mb-6 text-white">CLIENT SERVICES</h4>
          <ul className="space-y-4 text-xs font-sans tracking-[0.15em] text-background/60">
            <li><Link to="#" className="hover:text-ring transition-colors duration-300">CARE GUIDE</Link></li>
            <li><Link to="#" className="hover:text-ring transition-colors duration-300">SIZE GUIDE</Link></li>
            <li><Link to="#" className="hover:text-ring transition-colors duration-300">CONTACT US</Link></li>
            <li><Link to="#" className="hover:text-ring transition-colors duration-300">ORDER TRACKING</Link></li>
          </ul>
        </div>

        {/* Socials & Brand */}
        <div className="flex flex-col items-center md:items-start">
          <h4 className="font-serif text-2xl tracking-widest mb-8 text-white">MONDEUX</h4>
          <div className="flex justify-center md:justify-start space-x-6 text-background/60">
            <a href="#" className="hover:text-ring transition-colors duration-300"><FaFacebookF className="w-5 h-5" /></a>
            <a href="#" className="hover:text-ring transition-colors duration-300"><FaInstagram className="w-5 h-5" /></a>
            <a href="#" className="hover:text-ring transition-colors duration-300"><FaTwitter className="w-5 h-5" /></a>
            <a href="#" className="hover:text-ring transition-colors duration-300"><FaTiktok className="w-5 h-5" /></a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-background/10 text-center py-8">
        <p className="text-xs font-sans tracking-[0.2em] text-background/40">
          © {new Date().getFullYear()} MONDEUX. ALL RIGHTS RESERVED.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
