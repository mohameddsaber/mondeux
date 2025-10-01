import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {  ChevronDown } from 'lucide-react';
import  ProductImageSlider  from '../components/ProductImageSlider.tsx';
import ProductAccordian from '../components/ProductAccordian.tsx';
import RelatedProducts from '../components/RelatedProducts.tsx';
import TrustBadges from '../components/TrustBadges.tsx';



// TypeScript interfaces
interface Variant {
  id: string;
  label: string;
  available: boolean;
}

interface Product {
  id: string;
  name: string;
  price: number;
  currency: string;
  category: string;
  subcategory: string;
  images: string[];
  details: string[];
  variants: Variant[];
}

// Mock product database - Replace this with your API call
const productsDatabase = {
  'silver': {
    'rings': {
      'silver-napoleon-ring': {
        id: 'silver-napoleon-ring',
        name: 'Silver Napoleon Ring',
        price: 5438.60,
        currency: 'LE',
        category: 'shop-silver',
        subcategory: 'rings',
        images: [
          'https://www.sergedenimes.com/cdn/shop/products/Silver-Napoleon-Ring-Product-Shot-Grey_c30b0886-6c26-495a-b5ee-bfc4c5213090.jpg?v=1675880869&width=1946',
          'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80'

        ],
        details: [
          '925 Sterling Silver',
          'Iconic compass design',
          'Serge DeNimes branding',
          "Hallmarked by the Goldsmiths' Company Assay Office",
          'Available in N, P, S, U & W',
          'This product weighs 11g'
        ],
        variants: [
          { id: 'uk-n', label: 'UK N', available: true },
          { id: 'uk-p', label: 'UK P', available: true },
          { id: 'uk-s', label: 'UK S', available: true },
          { id: 'uk-u', label: 'UK U', available: true },
          { id: 'uk-w', label: 'UK W', available: true }
        ]
      },
      'silver-signet-ring': {
        id: 'silver-signet-ring',
        name: 'Silver Signet Ring',
        price: 4200.00,
        currency: 'LE',
        category: 'shop-silver',
        subcategory: 'rings',
        images: [
          'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80'
        ],
        details: [
          '925 Sterling Silver',
          'Classic signet design',
          'Serge DeNimes branding',
          'Handcrafted finish',
          'Available in multiple sizes',
          'This product weighs 9g'
        ],
        variants: [
          { id: 'uk-m', label: 'UK M', available: true },
          { id: 'uk-n', label: 'UK N', available: true },
          { id: 'uk-p', label: 'UK P', available: true },
          { id: 'uk-s', label: 'UK S', available: true }
        ]
      }
    },
    'chains': {
      'silver-cuban-chain': {
        id: 'silver-cuban-chain',
        name: 'Silver Cuban Chain',
        price: 6800.00,
        currency: 'LE',
        category: 'shop-silver',
        subcategory: 'chains',
        images: [
          'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80'
        ],
        details: [
          '925 Sterling Silver',
          'Cuban link style',
          'Lobster clasp closure',
          'Length: 20 inches',
          'Width: 6mm',
          'This product weighs 45g'
        ],
        variants: [
          { id: '18-inch', label: '18 inch', available: true },
          { id: '20-inch', label: '20 inch', available: true },
          { id: '22-inch', label: '22 inch', available: true }
        ]
      }
    }
  },
  'gold': {
    'rings': {
      'gold-compass-ring': {
        id: 'gold-compass-ring',
        name: 'Gold Compass Ring',
        price: 12500.00,
        currency: 'LE',
        category: 'shop-gold',
        subcategory: 'rings',
        images: [
          'https://www.sergedenimes.com/cdn/shop/products/Silver-Napoleon-Ring-Product-Shot-Grey_c30b0886-6c26-495a-b5ee-bfc4c5213090.jpg?v=1675880869&width=1946',

        ],
        details: [
          '18K Gold Plated',
          'Compass design',
          'Serge DeNimes branding',
          'Premium finish',
          'Available in multiple sizes',
          'This product weighs 12g'
        ],
        variants: [
          { id: 'uk-n', label: 'UK N', available: true },
          { id: 'uk-p', label: 'UK P', available: true },
          { id: 'uk-s', label: 'UK S', available: true }
        ]
      }
    }
  }
};

// Function to fetch product - Replace with your actual API call
const fetchProduct = (category: string, subcategory: string, productId: string): Product | null => {
  try {
    const db = productsDatabase as any;
    return db[category]?.[subcategory]?.[productId] || null;
  } catch (error) {
    return null;
  }
};

const ProductItemPage = () => {
  const { category, subcategory, productId } = useParams<{
    category: string;
    subcategory: string;
    productId: string;
  }>();
  const navigate = useNavigate();
  
  const [productData, setProductData] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  useEffect(() => {
    // Fetch product data based on URL params
    const loadProduct = async () => {
      setLoading(true);
      
      if (!category || !subcategory || !productId) {
        setLoading(false);
        return;
      }
      
      // Replace this with your actual API call
      // const data = await fetch(`/api/products/${category}/${subcategory}/${productId}`).then(r => r.json());
      const data = fetchProduct(category, subcategory, productId);
      
      if (data) {
        setProductData(data);
        setSelectedVariant(data.variants[0]?.id || '');
      }
      
      setLoading(false);
    };

    loadProduct();
  }, [category, subcategory, productId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-32">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!productData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-32">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-4">404</h1>
          <p className="text-xl mb-8">Product not found</p>
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-3 bg-black text-white rounded hover:bg-gray-800 transition-colors"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const selectedVariantLabel = productData.variants.find(v => v.id === selectedVariant)?.label || '';

  return (
    <div className="min-h-screen bg-gray-50 pt-20 md:pt-22">
      {/* Main Content */}
      <main className="max-w-9xl md:py-12 py-0">

        <div className="grid md:grid-cols-2 gap-10">
          {/* Product Image */}

          <div>
          <ProductImageSlider images={productData.images} />
          <div className='md:block hidden'><TrustBadges /></div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col pt-15 px-[47px] xl:px-[80px]">
            <h2 className="text-[24px]  font-ui text-[#121212] mb-2">{productData.name}</h2>
            <p className="text-[19px] text-gray-600 mb-6">{productData.currency} {productData.price.toFixed(2)}</p>

            {/* Product Details */}
            <div className="mb-6 ">
              {productData.details.map((detail, index) => (
                <p key={index} className="text-[12px] text-[#121212] leading-relaxed">
                  - {detail}
                </p>
              ))}
            </div>

            <div className="max-w-lg w-full"> 
              {/* Variant Selector */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="relative flex-1 mr-4">
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full px-4 py-3 border border-gray-300 rounded bg-white text-left flex items-center justify-between hover:border-gray-400 transition-colors"
                    >
                      <span>{selectedVariantLabel}</span>
                      <ChevronDown size={20} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
                        {productData.variants.map((variant) => (
                          <button
                            key={variant.id}
                            onClick={() => {
                              setSelectedVariant(variant.id);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                              selectedVariant === variant.id ? 'bg-gray-100' : ''
                            }`}
                          >
                            {variant.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <button className="text-sm underline whitespace-nowrap hover:text-gray-600">
                    Size Guide
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button className="w-full py-3 bg-white border border-black text-[12px] text-black hover:bg-black hover:text-white transition-all mb-3">
                ADD TO CART
              </button>

              {/* Shop Pay Button */}
              <button className="w-full py-3 bg-blue-600 text-white hover:bg-blue-700 transition-colors mb-3">
                Buy with Shop
              </button>

              <button className="w-full text-[12px] text-center underline mb-8 hover:text-gray-600">
                More payment options
              </button>

              {/* Visual Search */}
              <div className="border border-gray-200 py-[18px] px-[22px] flex items-start gap-4">

                <div>

                  <p className=" text-sm  font-semibold mb-[-3px]">View Visually</p>
                  <p className="text-sm  font-semibold mb-3">Similar Products</p>

                  <button className="text-md text-white bg-gray-300 py-1.5 px-8 cursor-pointer font-semibold  ">
                    Explore Now ›
                  </button>
                </div>
              </div>
              <ProductAccordian />


            </div>

          </div>
          
        </div>
        <div className='md:hidden block px-8'><TrustBadges /></div>
        <RelatedProducts />
      </main>

      {/* Loyalty Scheme Badge */}
      <div className="fixed bottom-4 right-4 bg-black text-white px-6 py-3 rounded shadow-lg hover:bg-gray-800 transition-colors cursor-pointer">
        Loyalty Scheme
      </div>
    </div>
  );
};

export default ProductItemPage;