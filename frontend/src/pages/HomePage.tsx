import { ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCategoryProductsQuery } from '../hooks/useStoreData';
import WishlistButton from '../components/WishlistButton';
import { formatProductPriceRange } from '../lib/productPricing';

// Product and variant interfaces
interface SizeVariant {
  label: string;
  sku: string;
  stock: number;
  price: number;
  isAvailable: boolean;
}

interface MaterialVariant {
  material: "gold" | "silver" | "stainless steel";
  metalPurity?: string;
  weight?: number;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  stock: number;
  sizeVariants: SizeVariant[];
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  images: { url: string; alt: string; isPrimary: boolean }[];
  category: string;
  subCategory: string;
  materialVariants: MaterialVariant[];
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
  minVariantPrice?: number;
}

// ProductCard Component
const ProductCard = ({ product }: { product: Product }) => {
  return (
    <div className="group cursor-pointer">
      <div className="bg-gray-100 aspect-square mb-4 overflow-hidden rounded relative">
        <div className="absolute right-3 top-3 z-10">
          <WishlistButton productId={product._id} />
        </div>
        <img
          src={product.images[0]?.url || '/placeholder.jpg'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <h3 className="font-medium text-sm mb-1 uppercase">{product.name}</h3>
      <p className="text-sm text-gray-600">{formatProductPriceRange(product)}</p>
    </div>
  );
};

// CategorySection Component
interface CategorySectionProps {
  categoryName: string;
  categoryImage: string;
  categorySlug: string;
  onCategoryClick?: () => void;
  onViewAllClick?: () => void;
}

const CategorySection = ({
  categoryName,
  categoryImage,
  categorySlug,
  onCategoryClick,
  onViewAllClick
}: CategorySectionProps) => {
  const { data, isPending } = useCategoryProductsQuery(categorySlug, 'newest', 4);
  const products = data?.data || [];
  const loading = isPending;

  return (
    <motion.section
      className="py-12 px-4 md:px-8"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Category Header with Image */}
        <motion.div
          onClick={onCategoryClick}
          className="block relative h-70 md:h-110 mb-8 overflow-hidden rounded-lg group cursor-pointer"
          whileHover={{ scale: 1.02 }}
        >
          <img
            src={categoryImage}
            alt={categoryName}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
            <div className="p-6 md:p-8 text-white w-full">
              <h2 className="text-3xl md:text-4xl font-light tracking-wider mb-2">
                {categoryName.toUpperCase()}
              </h2>
              <div className="flex items-center gap-2 text-sm">
                <span>Explore Collection</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 aspect-square mb-4 rounded"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1 } },
            }}
          >
            {products.map((product) => (
              <motion.div
                key={product._id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Link to={`/products/${product.slug}`}>
                  <ProductCard product={product} />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No products available in this category yet.
          </div>
        )}

        {/* View All Link */}
        {products.length > 0 && (
          <div className="mt-8 text-center">
            <motion.button
              onClick={onViewAllClick}
              className="inline-flex items-center gap-2 text-sm border-b border-black pb-1 hover:text-gray-600 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View All {categoryName} <ArrowRight size={16} />
            </motion.button>
          </div>
        )}
      </div>
    </motion.section>
  );
};

// HomePage Component
export default function HomePage() {
  const categories = [
    { name: 'Rings', slug: 'rings', image: 'https://saltydagger.com/cdn/shop/files/YETZ_98of180.jpg?v=1758541739' },
    { name: 'Necklaces', slug: 'necklaces', image: 'https://saltydagger.com/cdn/shop/files/YETZ_72of180_70fadd73-eeb4-4c60-acc0-0665f8766804.jpg?v=1758645249' },
    { name: 'Bracelets', slug: 'bracelets', image: 'https://saltydagger.com/cdn/shop/files/YETZ_161of180.jpg?v=1758541990' },
  ];

  const navigate = useNavigate();

  const handleCategoryClick = (slug: string) => {
    navigate(`/category/${slug}`);
  };

  const handleViewAllClick = (slug: string) => {
    navigate(`/category/${slug}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[90vh] bg-black">
        <div className="absolute inset-0">
          <img
            src="/hero-pic.png"
            alt="Luxury Jewelry Collection"
            className="w-full h-full object-cover opacity-70"
          />
        </div>
        <div className="relative flex flex-col items-center justify-center h-full text-white text-center px-4">
          <motion.h1
            className="text-4xl md:text-6xl font-light mb-6 tracking-wider"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            TIMELESS ELEGANCE
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl mb-8 max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Discover our collection of pieces that tell your unique story.
          </motion.p>

          <motion.button
            className="bg-white text-black px-8 py-3 text-sm tracking-wider hover:bg-gray-100 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            SHOP NOW
          </motion.button>
        </div>
      </section>

      {/* Category Sections */}
      {categories.map((category, index) => (
        <div key={category.slug}>
          <CategorySection
            categoryName={category.name}
            categoryImage={category.image}
            categorySlug={category.slug}
            onCategoryClick={() => handleCategoryClick(category.slug)}
            onViewAllClick={() => handleViewAllClick(category.slug)}
          />
          {index < categories.length - 1 && (
            <div className="max-w-7xl mx-auto px-4 md:px-8">
              <hr className="border-gray-200" />
            </div>
          )}
        </div>
      ))}

      {/* Newsletter Section */}
      <motion.section
        className="bg-black text-white py-16 px-4 md:px-8 mt-12"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl mb-6 font-light tracking-wider">
            JOIN THE MONDEUX FAMILY
          </h2>
          <p className="mb-8 text-gray-300">
            Subscribe to receive updates, access to exclusive deals, and more.
          </p>
          <div className="flex gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 text-black"
            />
            <motion.button
              className="bg-white text-black px-6 py-3 text-sm tracking-wider hover:bg-gray-100 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              SUBSCRIBE
            </motion.button>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
