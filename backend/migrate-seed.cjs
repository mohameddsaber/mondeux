const fs = require('fs');

let content = fs.readFileSync('seedProducts.js', 'utf8');

// Replace materialVariants: [ with productType, gender, extraAttributes, variants: [
content = content.replace(/materialVariants:\s*\[/g, `productType: 'jewellery',
    gender: 'unisex',
    extraAttributes: {
      weight: '12g',
      metalPurity: '925'
    },
    variants: [`);

// Replace material with attribute object
content = content.replace(/material:\s*'([^']+)',\n\s*metalPurity:\s*'([^']+)',\n\s*weight:\s*([^,]+),/g, "attribute: { type: 'material', value: '$1', meta: '$2' },\n        images: [],");
content = content.replace(/material:\s*'([^']+)',\n\s*weight:\s*([^,]+),/g, "attribute: { type: 'material', value: '$1' },\n        images: [],");

// Update insertion loop
content = content.replace(/const materialVariants = productData\.materialVariants\.map\(\(mv\) => \{/g, "const variants = productData.variants.map((mv) => {");
content = content.replace(/sku: generateSKU\(slug, mv\.material, sv\.label\),/g, "sku: generateSKU(slug, mv.attribute.value, sv.label),");
content = content.replace(/materialVariants,/g, "productType: productData.productType,\n        gender: productData.gender,\n        extraAttributes: productData.extraAttributes,\n        variants,");
content = content.replace(/\$\{materialVariants\.length\}/g, "${variants.length}");

fs.writeFileSync('seedProducts.js', content);
console.log('Migration script completed');
