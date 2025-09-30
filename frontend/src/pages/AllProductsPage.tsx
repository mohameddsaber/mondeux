import ProductCard, { type Product } from "../components/ProductCard";
import { useState } from "react";
import FilterSidebar from "../components/FilterSidebar.tsx"
import { Plus, Minus } from "lucide-react";

const AllProductsPage: React.FC = () => {
  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const availabilityOptions = ["In Stock", "Out of Stock", "Pre-Order"];
    const toggleAvailability = (option: string) => {
    setSelectedAvailability((prev) =>
      prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]
    );
  };
  

  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortOptions = [
  { value: "featured", label: "FEATURED" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "newest", label: "Newest" },
  { value: "best-selling", label: "Best Selling" },
  ];

  const products: Product[] = [
    {
      id: 1,
      name: "SILVER WILD WEST RING",
      price: "LE 4,331.31",
      image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&h=500&fit=crop"
    },
    {
      id: 2,
      name: "SILVER WESTERN RING",
      price: "LE 4,880.05",
      image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&h=500&fit=crop"
    },
    {
      id: 3,
      name: "SILVER MOONLIGHT RING",
      price: "LE 4,331.31",
      image: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=500&h=500&fit=crop"
    },
    {
      id: 4,
      name: "GOLD MOONLIGHT RING",
      price: "LE 4,880.05",
      image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&h=500&fit=crop"
    }
  ];

  const [sortBy, setSortBy] = useState('featured');
  const [filterOpen, setFilterOpen] = useState(false);

  const onSortChange = (value: string) => {
    setSortBy(value);
    setIsSortOpen(false);
  };

  return (
    <div className="min-h-screen bg-white">

      
      <main className=" mt-[52px] md:mt-[114px]">
        <div className="text-center px-[80px] pt-[50px] pb-[20px] mb-5">
          <h2 className="text-[28px] font-ui text-[#121212] mb-5 -tracking-tight">Shop All</h2>
          <p className="text-gray-600 text-[12px]">Bold rings, minimal earrings, refined necklaces, understated bracelets, 
            and essential accessories all in one place - designed to elevate the everyday.</p>
        </div>
        
      <div className="pb-[10px] border-b border-gray-200 mx-5">

        {/* Desktop (md and up) */}
        <div className="hidden md:flex items-center justify-between ">
          <div className="relative">
            <button
              onClick={() => setAvailabilityOpen(!availabilityOpen)}
              className="w-full flex items-center justify-between text-sm font-medium tracking-wide"
            >
              <span className="text-gray-500 text-[12px] font-[Karla] tracking-widest cursor-pointer">AVAILABILITY</span>
              {availabilityOpen ? <Minus size={12} /> : <Plus size={12} />}
            </button>

            {availabilityOpen && (
              <div className="absolute left-0 top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="px-6 py-6 space-y-3">
                  {availabilityOptions.map((option) => (
                    <label key={option} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedAvailability.includes(option)}
                        onChange={() => toggleAvailability(option)}
                        className="w-5 h-5 border-gray-400 rounded"
                      />
                      <span className="ml-3 text-sm">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

            <div className="flex justify-end">
              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => onSortChange(e.target.value)}
                  className="appearance-none border-0 text-[12px] font-[Karla] tracking-widest text-gray-500 rounded px-1 bg-white cursor-pointer focus:outline-none focus:ring-3 focus:ring-gray-300 text-right"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <Plus size={12} className="text-gray-700" />
              </div>
            </div>
        </div>

        {/* Mobile (below md) */}
        <div className="flex md:hidden items-center justify-between">
            <button 
            onClick={() => setFilterOpen(!filterOpen)}
            className="text-sm font-medium mx-[15px] px-[18px] font-[Karla] tracking-wide uppercase cursor-pointertracking-wide hover:text-gray-600"
            >
            FILTER
            </button>
        </div>
        
        {/* Filter Sidebar */}
        <FilterSidebar 
            isOpen={filterOpen}
            onClose={() => setFilterOpen(false)}
            sortBy={sortBy}
            onSortChange={setSortBy}
        />

        </div>

        
        <div className="grid grid-cols-2 p-[20px] md:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default AllProductsPage;