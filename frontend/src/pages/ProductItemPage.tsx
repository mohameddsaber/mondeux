import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronDown} from 'lucide-react';
import ProductImageSlider from '../components/ProductImageSlider.tsx';
import ProductAccordian from '../components/ProductAccordian.tsx';
import RelatedProducts from '../components/RelatedProducts.tsx';
import TrustBadges from '../components/TrustBadges.tsx';
import { type Product } from '../components/ProductCard.tsx'; 

export interface SizeVariant {
  label: string; 
  sku: string;
  stock: number;
  price?: number; 
  isAvailable: boolean;
}

export interface MaterialVariant {
  material: "gold" | "silver" | "stainless steel";
  metalPurity?: string;
  weight?: number;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  stock: number;
  sizeVariants: SizeVariant[];
}

export interface ProductDetails {
  _id: string;
  name: string;
  slug: string;
  description: string;
  metaDescription?: string; 
  images: { url: string; alt: string; isPrimary: boolean }[];
  category: { name: string; slug: string } | null; 
  subCategory: { name: string; slug: string } | null;
  materialVariants: MaterialVariant[];
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  rating: number;
  numReviews: number;
  createdAt: string;
}


const ProductItemPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>(); 
  const navigate = useNavigate(); 

  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedMaterial, setSelectedMaterial] = useState<MaterialVariant | null>(null);
  const [selectedSize, setSelectedSize] = useState<SizeVariant | null>(null);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  
  // --- Data Fetching Effect (Retained) ---
  useEffect(() => {
    if (!slug) {
      setError("Product slug is missing.");
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      const endpoint = `http://localhost:4000/api/products/${slug}`;

      try {
        const response = await fetch(endpoint);
        
        if (!response.ok) {
           if (response.status === 404) {
             throw new Error("Product not found.");
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        const fetchedProduct: ProductDetails = result.data;
        const fetchedRelatedProducts: Product[] = result.relatedProducts || []; 

        setProduct(fetchedProduct);
        setRelatedProducts(fetchedRelatedProducts);
        
        // Initialize selected states to the first available variant
        if (fetchedProduct.materialVariants.length > 0) {
            const initialMaterial = fetchedProduct.materialVariants[0];
            setSelectedMaterial(initialMaterial);
            if (initialMaterial.sizeVariants.length > 0) {
                setSelectedSize(initialMaterial.sizeVariants[0]);
            }
        }
        
      } catch (e) {
        if (e instanceof Error) {
            setError(e.message);
        } else {
            setError('An unknown error occurred.');
        }
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);


  const displayPrice = selectedSize?.price || selectedMaterial?.price || product?.materialVariants[0]?.price || 0;
  const isAvailable = selectedSize ? selectedSize.stock > 0 : false;
  const imageUrls = product?.images.map(img => img.url) || [];
  const selectedVariantLabel = selectedSize?.label 
    ? `${selectedMaterial?.material.toUpperCase()} - ${selectedSize.label}`
    : selectedMaterial?.material.toUpperCase() || 'Select Variant';

  const combinedOptions = product?.materialVariants.flatMap(m => 
    m.sizeVariants.map(s => ({
      id: `${m.material}-${s.sku}`,
      label: `${m.material.charAt(0).toUpperCase() + m.material.slice(1)} - ${s.label}`,
      material: m,
      size: s,
      isAvailable: s.isAvailable && s.stock > 0
    }))
  ) || [];

  const handleAddToCart = () => {
    // ... (Add to cart logic remains the same)
  };


  const getProductDetails = (product: ProductDetails, selectedMaterial: MaterialVariant | null): string[] => {
    if (!product || !selectedMaterial) return [];

    const detailsArray: string[] = [];

    const materialLine = [];
    if (selectedMaterial.metalPurity) {
        materialLine.push(selectedMaterial.metalPurity);
    }
    materialLine.push(selectedMaterial.material.charAt(0).toUpperCase() + selectedMaterial.material.slice(1));
    detailsArray.push(materialLine.join(' '));


    const descriptionToUse = product.metaDescription || product.description;
    if (descriptionToUse) {


      const featureLine = descriptionToUse.split(/[.!?]/)[0].trim();
        if (featureLine.length > 0) {
            detailsArray.push(featureLine);
        }
    }

    // 3. Static Details
    detailsArray.push("Mondeux branding");
    detailsArray.push("Hallmarked by the Mondeux' Company Assay Office");


    if (selectedMaterial.sizeVariants.length > 0) {

      const uniqueSizes = selectedMaterial.sizeVariants
            .map(v => v.label)
            .filter((value, index, self) => self.indexOf(value) === index);
        
        detailsArray.push(`Available in ${uniqueSizes.join(', ')}`);
    }


    if (selectedMaterial.weight) {
        detailsArray.push(`This product weighs ${selectedMaterial.weight}g`);
    }
    
    return detailsArray;
  };

  const details = getProductDetails(product!, selectedMaterial);



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

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-32">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-4">404</h1>
          <p className="text-xl mb-8">{error || 'Product not found'}</p>
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


  return (
    <div className="min-h-screen bg-gray-50 pt-20 md:pt-22">
      <main className="max-w-9xl md:py-12 py-0">
        <div className="grid md:grid-cols-2 gap-10">
          {/* Product Image */}
          <div>
            <ProductImageSlider images={imageUrls} /> 
            <div className='md:block hidden pl-4'><TrustBadges /></div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col pt-15 px-[47px] xl:px-[80px]">
            <h2 className="text-[24px] font-ui text-[#121212] mb-2">{product.name}</h2>
            <p className="text-[19px] text-gray-600 mb-6">LE {displayPrice.toFixed(2)}</p>

            {/* Product Details*/}
            <div className="mb-6">
              {details.map((detail, index) => (
                <p key={index} className="text-[12px] text-[#121212] leading-relaxed">
                  - {detail}
                </p>
              ))}
            </div>

            <div className="max-w-lg w-full"> 
              {/* Variant Selector (Retained) */}
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
                        {combinedOptions.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => {
                              setSelectedMaterial(option.material);
                              setSelectedSize(option.size);
                              setIsDropdownOpen(false);
                            }}
                            disabled={!option.isAvailable}
                            className={`w-full px-4 py-3 text-left transition-colors ${
                              (selectedMaterial?.material === option.material.material && selectedSize?.label === option.size.label)
                                ? 'bg-gray-100 font-semibold' 
                                : 'hover:bg-gray-50'
                            } ${!option.isAvailable ? 'text-gray-400 cursor-not-allowed' : ''}`}
                          >
                            {option.label}
                            {!option.isAvailable && ' (Sold Out)'}
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

              {/* Add to Cart Button (Retained) */}
              <button 
                onClick={handleAddToCart}
                disabled={!selectedSize || !isAvailable || addedToCart}
                className={`w-full py-3 border text-[12px] transition-all mb-3 ${
                  addedToCart 
                    ? 'bg-green-600 text-white border-green-600' 
                    : isAvailable 
                        ? 'bg-white border-black text-black hover:bg-black hover:text-white'
                        : 'bg-gray-200 border-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {!selectedSize ? 'SELECT VARIANT' : (isAvailable ? (addedToCart ? 'ADDED TO CART ✓' : 'ADD TO CART') : 'SOLD OUT')}
              </button>

              {/* Other Buttons (Retained) */}
              <button className="w-full py-3 bg-blue-600 text-white hover:bg-blue-700 transition-colors mb-3">
                Buy with Shop
              </button>

              <button className="w-full text-[12px] text-center underline mb-8 hover:text-gray-600">
                More payment options
              </button>

              {/* Visual Search (Retained) */}
              <div className="border border-gray-200 py-[18px] px-[22px] flex items-start gap-4">
                <div>
                  <p className="text-sm font-semibold mb-[-3px]">View Visually</p>
                  <p className="text-sm font-semibold mb-3">Similar Products</p>
                  <button className="text-md text-white bg-gray-300 py-1.5 px-8 cursor-pointer font-semibold">
                    Explore Now ›
                  </button>
                </div>
              </div>
              <ProductAccordian description={product.description} />
            </div>
          </div>
        </div>
        
        <div className='md:hidden block px-8'><TrustBadges /></div>
        <RelatedProducts products={relatedProducts} />
      </main>


    </div>
  );
};

export default ProductItemPage;