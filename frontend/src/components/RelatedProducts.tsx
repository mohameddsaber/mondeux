import { useState } from 'react';
import { ChevronLeft, ChevronRight, Camera } from 'lucide-react';

interface StyleProduct {
  id: string;
  name: string;
  price: number;
  currency: string;
  image: string;
}

// Mock related products data
const relatedProducts: StyleProduct[] = [
  {
    id: '1',
    name: 'Silver Polaris Necklace',
    price: 79.00,
    currency: '£',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80'
  },
  {
    id: '2',
    name: 'Silver Emerald Birthstone Ring',
    price: 300.00,
    currency: '£',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80'
  },
  {
    id: '3',
    name: 'Silver Traditional Hallmark Ring',
    price: 85.00,
    currency: '£',
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=80'
  },
  {
    id: '4',
    name: 'Silver Dove Cameo Ring',
    price: 95.00,
    currency: '£',
    image: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=400&q=80'
  },
  {
    id: '5',
    name: 'Silver Chain Bracelet',
    price: 120.00,
    currency: '£',
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=80'
  }
];

export default function StyleWithSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerView = 4;
  const maxIndex = Math.max(0, relatedProducts.length - itemsPerView);

  const handlePrev = () => {
    setCurrentIndex(prev => Math.max(0, prev - itemsPerView));
  };

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(maxIndex, prev + itemsPerView));
  };

  return (
    <div className="bg-white py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <h2 className="text-2xl md:text-3xl font-normal mb-8">Style With</h2>

        {/* Slider Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          {currentIndex > 0 && (
            <button
              onClick={handlePrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"
              aria-label="Previous products"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {currentIndex < maxIndex && (
            <button
              onClick={handleNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"
              aria-label="Next products"
            >
              <ChevronRight size={24} />
            </button>
          )}

          {/* Products Grid */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)` }}
            >
              {relatedProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex-shrink-0 px-2"
                  style={{ width: `${100 / itemsPerView}%` }}
                >
                  <div className="group cursor-pointer">
                    {/* Product Image */}
                    <div className="relative bg-gray-100 mb-4 overflow-hidden aspect-square">
                      <img
                        src={product.image}
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
                      <p className="text-base font-semibold">
                        {product.currency}{product.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-black' : 'bg-gray-300'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}