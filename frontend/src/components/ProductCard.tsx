import React from "react";
import { motion } from "framer-motion";

export interface SizeVariant {
  label: string;
  sku: string;
  stock: number;
  price: number;
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

export interface Product {
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
}

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, index = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: "easeOut"
      }}
      whileHover={{ y: -8 }}
      className="group cursor-pointer"
    >
      {/* Image */}
      <motion.div 
        className="bg-gray-100 aspect-square mb-4 overflow-hidden rounded"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        <motion.img
          src={product.images[0].url}
          alt={product.name}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </motion.div>

      {/* Name */}
      <motion.h3 
        className="font-medium text-sm mb-1 uppercase"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.1 + 0.2 }}
      >
        {product.name}
      </motion.h3>

      {/* Price */}
      <motion.p 
        className="text-sm text-gray-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.1 + 0.3 }}
      >
        {product.materialVariants[0]?.price} LE
      </motion.p>
    </motion.div>
  );
};

export default ProductCard;