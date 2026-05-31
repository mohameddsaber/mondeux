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

    let variantStock = 0;

    if (Array.isArray(variant?.sizeVariants) && variant.sizeVariants.length > 0) {
      for (const size of variant.sizeVariants) {
        const sizeStock = Number(size?.stock);
        if (Number.isFinite(sizeStock) && sizeStock > 0) {
          variantStock += sizeStock;
        }
      }
    } else {
      const stock = Number(variant?.stock);
      if (Number.isFinite(stock) && stock > 0) {
        variantStock = stock;
      }
    }

    if (variantStock > 0) {
      totalStock += variantStock;
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
