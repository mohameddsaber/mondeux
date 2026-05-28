export const computeProductDerivedFields = (variants = []) => {
  const normalizedVariants = Array.isArray(variants) ? variants : [];
  const priceValues = [];
  const availableAttributes = new Set();
  let totalStock = 0;

  for (const variant of normalizedVariants) {
    const price = Number(variant?.price);
    if (Number.isFinite(price)) {
      priceValues.push(price);
    }

    const stock = Number(variant?.stock);
    if (Number.isFinite(stock) && stock > 0) {
      totalStock += stock;
      if (variant?.attribute?.value) {
        availableAttributes.add(variant.attribute.value);
      }
    }
  }

  return {
    minVariantPrice: priceValues.length > 0 ? Math.min(...priceValues) : 0,
    totalStock,
    availableAttributes: Array.from(availableAttributes),
  };
};

export const applyDerivedProductFields = (target, variants = []) => {
  const derivedFields = computeProductDerivedFields(variants);
  target.minVariantPrice = derivedFields.minVariantPrice;
  target.totalStock = derivedFields.totalStock;
  target.availableAttributes = derivedFields.availableAttributes;
  return target;
};
