import { ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useCategoryProductsQuery } from '../hooks/useStoreData';
import { FadeIn } from '../components/ui/FadeIn';
import ProductCard from '../components/ProductCard';
import { useRef } from 'react';

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
    <section className="py-24 px-1 md:px-2">
      <div className="max-w-[1600px] mx-auto">
        <FadeIn yOffset={40}>
          {/* Category Header with Image */}
          <div
            onClick={onCategoryClick}
            className="block relative h-[60vh] md:h-[80vh] mb-16 overflow-hidden group cursor-pointer"
          >
            <img
              src={categoryImage}
              alt={categoryName}
              className="w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-700 flex items-center justify-center">
              <div className="text-white text-center p-8">
                <h2 className="text-5xl md:text-7xl font-serif tracking-widest mb-6">
                  {categoryName.toUpperCase()}
                </h2>
                <div className="flex items-center justify-center gap-3 text-sm font-sans tracking-[0.2em]">
                  <span className="border-b border-white pb-1">EXPLORE COLLECTION</span>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Products Grid */}
        <FadeIn delay={0.2}>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-0.5 gap-y-6 px-1 md:gap-x-1 md:gap-y-8 md:px-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse flex flex-col gap-4">
                  <div className="bg-secondary aspect-[4/5]"></div>
                  <div className="h-6 bg-secondary w-3/4 mx-auto"></div>
                  <div className="h-4 bg-secondary w-1/4 mx-auto"></div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-0.5 gap-y-6 px-1 md:gap-x-1 md:gap-y-8 md:px-2">
              {products.map((product, idx) => (
                <Link key={product._id} to={`/products/${product.slug}`}>
                  <ProductCard product={product} index={idx} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground font-sans tracking-wider">
              No pieces available in this collection yet.
            </div>
          )}
        </FadeIn>

        {/* View All Link */}
        {products.length > 0 && (
          <FadeIn delay={0.4} className="mt-16 text-center">
            <button
              onClick={onViewAllClick}
              className="inline-flex items-center gap-3 text-sm font-sans tracking-[0.2em] border-b border-foreground pb-1 hover:text-ring hover:border-ring transition-colors duration-500"
            >
              VIEW ALL {categoryName.toUpperCase()} <ArrowRight size={16} />
            </button>
          </FadeIn>
        )}
      </div>
    </section>
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
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const yParallax = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacityParallax = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const handleCategoryClick = (slug: string) => {
    navigate(`/category/${slug}`);
  };

  const handleViewAllClick = (slug: string) => {
    navigate(`/category/${slug}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-ring selection:text-white">
      {/* Hero Section */}
      <section ref={heroRef} className="relative h-screen overflow-hidden bg-black">
        <motion.div 
          className="absolute inset-0"
          style={{ y: yParallax, opacity: opacityParallax }}
        >
          <img
            src="/hero-pic.png"
            alt="Luxury Jewelry Collection"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-black/30" />
        </motion.div>
        
        <div className="relative flex flex-col items-center justify-center h-full text-white text-center px-4 pt-20">
          <FadeIn duration={1.2} yOffset={40}>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif mb-8 tracking-widest leading-none">
              TIMELESS<br/>HERITAGE
            </h1>
          </FadeIn>

          <FadeIn delay={0.4} duration={1} yOffset={20}>
            <p className="text-lg md:text-xl mb-12 max-w-2xl font-sans tracking-[0.2em] font-light">
              CRAFTED FOR ETERNITY.
            </p>
          </FadeIn>

          <FadeIn delay={0.8} duration={0.8}>
            <button
              onClick={() => navigate('/products')}
              className="bg-transparent border border-white text-white px-10 py-4 text-sm font-sans tracking-[0.2em] hover:bg-white hover:text-black transition-colors duration-500"
            >
              DISCOVER THE COLLECTION
            </button>
          </FadeIn>
        </div>
      </section>

      {/* Editorial Intro */}
      <section className="py-32 px-4 md:px-8 bg-background">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-5xl font-serif mb-8 leading-relaxed text-foreground">
              A commitment to unparalleled craftsmanship and understated elegance.
            </h2>
            <p className="text-muted-foreground font-sans tracking-widest leading-loose max-w-2xl mx-auto">
              Every piece in our collection is thoughtfully designed to transcend seasonal trends, embodying a quiet luxury that speaks to those who appreciate the finer details.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Category Sections */}
      {categories.map((category) => (
        <div key={category.slug}>
          <CategorySection
            categoryName={category.name}
            categoryImage={category.image}
            categorySlug={category.slug}
            onCategoryClick={() => handleCategoryClick(category.slug)}
            onViewAllClick={() => handleViewAllClick(category.slug)}
          />
        </div>
      ))}

      {/* Newsletter Section */}
      <section className="bg-foreground text-background py-32 px-4 md:px-8 mt-12">
        <FadeIn>
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl mb-8 font-serif tracking-widest">
              JOIN MONDEUX
            </h2>
            <p className="mb-12 font-sans tracking-[0.1em] text-background/80">
              Receive exclusive invitations and early access to new collections.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="EMAIL ADDRESS"
                className="flex-1 px-6 py-4 bg-transparent border border-background/30 text-background placeholder:text-background/50 focus:outline-none focus:border-ring transition-colors font-sans tracking-widest text-sm"
              />
              <button
                className="bg-background text-foreground px-8 py-4 text-sm font-sans tracking-[0.2em] hover:bg-ring hover:text-white transition-colors duration-500"
              >
                SUBSCRIBE
              </button>
            </div>
          </div>
        </FadeIn>
      </section>
    </div>
  );
}
