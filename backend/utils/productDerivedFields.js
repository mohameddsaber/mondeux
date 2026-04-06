export const computeProductDerivedFields = (materialVariants = []) => {
  const normalizedVariants = Array.isArray(materialVariants) ? materialVariants : [];
  const priceValues = [];
  const availableMaterials = new Set();
  let totalStock = 0;

  for (const variant of normalizedVariants) {
    const price = Number(variant?.price);
    if (Number.isFinite(price)) {
      priceValues.push(price);
    }

    const stock = Number(variant?.stock);
    if (Number.isFinite(stock) && stock > 0) {
      totalStock += stock;
      if (variant?.material) {
        availableMaterials.add(variant.material);
      }
    }
  }

  return {
    minVariantPrice: priceValues.length > 0 ? Math.min(...priceValues) : 0,
    totalStock,
    availableMaterials: Array.from(availableMaterials),
  };
};

export const applyDerivedProductFields = (target, materialVariants = []) => {
  const derivedFields = computeProductDerivedFields(materialVariants);
  target.minVariantPrice = derivedFields.minVariantPrice;
  target.totalStock = derivedFields.totalStock;
  target.availableMaterials = derivedFields.availableMaterials;
  return target;
};
