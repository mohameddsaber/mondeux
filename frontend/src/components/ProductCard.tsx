import React from "react";

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
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="group cursor-pointer">
      {/* Image */}
      <div className="bg-gray-100 aspect-square mb-4 overflow-hidden rounded">
        <img
          src={product.images[0].url}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Name */}
      <h3 className="font-medium text-sm mb-1 uppercase">{product.name}</h3>

      {/* Price */}
      <p className="text-sm text-gray-600">{product.materialVariants[0]?.price} LE</p>
    </div>
  );
};

export default ProductCard;
