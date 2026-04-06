import { Camera } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatProductPriceRange } from '@/lib/productPricing';

interface MinimalProduct {
    _id: string;
    name: string;
    slug: string;
    images: { url: string; alt: string; isPrimary: boolean }[];
    rating?: number;
    minVariantPrice?: number;
    materialVariants?: Array<{ price?: number }>;
}

interface RelatedProductsProps {
  products: MinimalProduct[];
}
export default function RelatedProducts({ products }: RelatedProductsProps) {
  
  const totalItems = products.length; 

  if (totalItems === 0) {
    return null; 
  }

  return (
    <div className="pt-20 md:pt-24 pb-16">
      <div className="w-full"> 
                <h2 className="text-center text-2xl font-ui text-[#121212] mb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          YOU MIGHT ALSO LIKE
        </h2>
        
        <div className="relative">
          {/* Carousel Body: Now set up for native scrolling */}
          <div className="overflow-x-scroll custom-scroll-hide ">
            <div className="flex ">
              {products.map((product) => (
                <Link
                  to={`/products/${product.slug}`}
                  key={product._id} 
                  className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 flex-shrink-0 px-2"                  
                  >
                <div>
                  <div className="group cursor-pointer">
                    {/* Image */}
                    <div className="bg-gray-100 aspect-square mb-4 overflow-hidden rounded relative">
                      <img
                        src={product.images[0]?.url || 'placeholder.jpg'} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Camera Icon Overlay */}
                      <div className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md">
                        <Camera size={16} className="text-gray-600" />
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="text-center">
                      <h3 className="text-sm font-normal mb-2 group-hover:underline">
                        {product.name}
                      </h3>
                      <p className="text-base font-semibold text-gray-700">
                        {formatProductPriceRange(product)}
                      </p>
                    </div>
                  </div>
                </div>
                </Link>

              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
