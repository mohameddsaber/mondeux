import React from "react";

// Define product type (you can extend as needed)
export interface Product {
  id: number | string;
  name: string;
  price: string;
  image: string;
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
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Name */}
      <h3 className="font-medium text-sm mb-1 uppercase">{product.name}</h3>

      {/* Price */}
      <p className="text-sm text-gray-600">{product.price}</p>
    </div>
  );
};

export default ProductCard;
