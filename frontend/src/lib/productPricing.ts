type ProductPricingShape = {
  minVariantPrice?: number;
  materialVariants?: Array<{
    price?: number;
  }>;
};

const formatLe = (amount: number) =>
  `${Number(amount || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} LE`;

export const getProductPriceBounds = (product: ProductPricingShape) => {
  const prices = (product.materialVariants || [])
    .map((variant) => Number(variant?.price || 0))
    .filter((price) => price > 0);

  if (prices.length === 0) {
    const fallbackPrice = Number(product.minVariantPrice || 0);

    return fallbackPrice > 0
      ? { min: fallbackPrice, max: fallbackPrice }
      : null;
  }

  const min = Math.min(...prices);
  const max = Math.max(...prices);

  return { min, max };
};

export const formatProductPriceRange = (product: ProductPricingShape) => {
  const bounds = getProductPriceBounds(product);

  if (!bounds) {
    return "";
  }

  if (bounds.min === bounds.max) {
    return formatLe(bounds.min);
  }

  return `${formatLe(bounds.min)} - ${formatLe(bounds.max)}`;
};
