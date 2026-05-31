import React from "react";
import { motion } from "framer-motion";
import WishlistButton from "@/components/WishlistButton";
import { formatProductPriceRange } from "@/lib/productPricing";

export interface SizeVariant {
  label: string;
  sku: string;
  stock: number;
  price: number;
  isAvailable: boolean;
}

export interface Variant {
  attribute: { type: string; value: string; meta?: string };
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  stock: number;
  sizeVariants: SizeVariant[];
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  images: { url: string; alt: string; isPrimary: boolean }[];
  category: string;
  subCategory: string; 
  variants: Variant[];
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
  minVariantPrice?: number;
}

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, index = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.8,
        delay: index * 0.1,
        ease: [0.25, 0.1, 0.25, 1] // Slow ease out
      }}
      className="group cursor-pointer flex flex-col gap-4"
    >
      {/* Image Container */}
      <div className="bg-secondary aspect-[4/5] overflow-hidden relative">
        <div className="absolute right-4 top-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <WishlistButton productId={product._id} />
        </div>
        <img
          src={product.images[0].url}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
        />
      </div>

      {/* Details */}
      <div className="flex flex-col items-center text-center gap-2">
        <h3 className="font-serif font-medium text-lg text-foreground tracking-wide">
          {product.name}
        </h3>
        <p className="text-sm font-sans text-muted-foreground tracking-wider">
          {formatProductPriceRange(product)}
        </p>
      </div>
    </motion.div>
  );
};

export default ProductCard;
