import ProductCard, { type Product } from "../components/ProductCard.tsx";
import { useState, useEffect } from "react";
import FilterSidebar from "../components/FilterSidebar.tsx"
import { Plus, Minus } from "lucide-react";
import { Link } from "react-router-dom";

interface CategoryPageProps {
  categorySlug: string; 
}

const CategoryPage: React.FC<CategoryPageProps> = ({ categorySlug }) => {

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const availabilityOptions = ["In Stock", "Out of Stock", "Pre-Order"];
  const toggleAvailability = (option: string) => {
    setSelectedAvailability((prev) =>
      prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]
    );
  };

  const [sortBy, setSortBy] = useState('newest');
  const sortOptions = [
    { value: "featured", label: "FEATURED" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
    { value: "newest", label: "Newest" },
    { value: "best-selling", label: "Best Selling" },
  ];

  const [filterOpen, setFilterOpen] = useState(false);

  const onSortChange = (value: string) => {
    setSortBy(value);
  };


  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      
      let sortQuery = '';
      
      let endpoint = `http://localhost:4000/api/products/category/${categorySlug}?limit=20`; 
      
      if (sortBy === 'featured') {

         sortQuery = 'sort=featured'; 
      } else if (sortBy === 'best-selling') {

        sortQuery = 'sort=popular'; 
      } else {

        sortQuery = `sort=${sortBy}`;
      }

      if (sortQuery) {
          endpoint += `&${sortQuery}`;
      }
      
      try {
        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        
        setProducts(result.data || []); 
      } catch (e) {
        if (e instanceof Error) {
            setError(e.message);
        } else {
            setError('An unknown error occurred.');
        }
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [sortBy, categorySlug]);


  const pageTitle = categorySlug 
    ? categorySlug.toUpperCase().replace(/-/g, ' ') 
    : 'Category Products';

  return (
    <div className="min-h-screen bg-white">
      <main className=" mt-[77px] md:mt-[130px]">
        <div className="text-center md:px-[80px] md:pt-[50px] md:pb-[20px] pt-[37.5px] px-[60px] pb-[15px] mb-6">
          <h2 className="md:text-[28px] text-[22px] font-ui text-[#121212] mb-3 -tracking-tight">
            Shop {pageTitle}
          </h2>
          <p className="text-gray-600 text-[12px]">Bold rings, minimal earrings, refined necklaces, understated bracelets, 
            and essential accessories all in one place - designed to elevate the everyday.</p>
        </div>
        
        
        <div className="pb-[10px] border-b border-gray-200 mx-5">

           <div className="hidden md:flex items-center justify-between ">
            {/* Availability Filter */}
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

            {/* Sort Dropdown */}
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
          
          <div className="flex md:hidden items-center justify-between">
              <button 
              onClick={() => setFilterOpen(!filterOpen)}
              className="text-sm font-medium mx-[15px] px-[18px] font-[Karla] tracking-wide uppercase cursor-pointertracking-wide hover:text-gray-600"
              >
              FILTER
              </button>
          </div>
          
          <FilterSidebar 
              isOpen={filterOpen}
              onClose={() => setFilterOpen(false)}
              sortBy={sortBy}
              onSortChange={setSortBy}
          />
        </div>


        {/* Product Display Area */}
        {loading ? (
            <div className="text-center p-8">Loading products...</div>
        ) : error ? (
            <div className="text-center p-8 text-red-600">Error fetching products: {error}</div>
        ) : products.length === 0 ? (
            <div className="text-center p-8 text-gray-500">No products found for this category.</div>
        ) : (
            <div className="grid grid-cols-2 p-[20px] md:grid-cols-4 gap-4">
              {products.map((product) => (
                <Link 
                    to={`/products/${product.slug}`} 
                    key={product._id}
                >
                    <ProductCard product={product} />
                </Link>                   
              ))}
            </div>
        )}
      </main>
    </div>
  );
};

export default CategoryPage;