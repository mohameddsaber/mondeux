import mongoose from 'mongoose';
import connectDB from '../db/db.js';
import Product from '../models/product.model.js';

const migrateDatabaseSchema = async () => {
  await connectDB();
  // Find products that still have the old materialVariants field
  const cursor = Product.find({ materialVariants: { $exists: true } }).cursor();
  let updatedCount = 0;

  for await (const product of cursor) {
    // Only process if it hasn't been migrated
    if (product.get('materialVariants') && product.get('materialVariants').length > 0) {
      const oldVariants = product.get('materialVariants');
      
      // 1. Transform materialVariants to variants
      const newVariants = oldVariants.map((mv) => ({
        attribute: {
          type: 'material',
          value: mv.material,
          meta: mv.metalPurity || undefined
        },
        images: mv.images || [],
        price: mv.price,
        compareAtPrice: mv.compareAtPrice,
        costPrice: mv.costPrice,
        stock: mv.stock,
        sizeVariants: mv.sizeVariants
      }));

      // 2. Set new root fields
      product.productType = 'jewellery';
      product.gender = 'unisex';
      
      // Extract weight and purity from the first variant to put at the root
      const weight = oldVariants[0]?.weight ? `${oldVariants[0].weight}g` : undefined;
      const metalPurity = oldVariants[0]?.metalPurity || undefined;
      
      product.extraAttributes = {};
      if (weight) product.extraAttributes.set('weight', weight);
      if (metalPurity) product.extraAttributes.set('metalPurity', metalPurity);
      
      product.variants = newVariants;
      
      // 3. Mark old field as undefined so Mongoose hook logic uses variants instead
      product.set('materialVariants', undefined);
      
      await product.save();
      updatedCount += 1;
    }
  }

  try {
    console.log('Dropping old materialVariants index...');
    await Product.collection.dropIndex('materialVariants.sizeVariants.sku_1');
  } catch (err) {
    console.log('Index might not exist, skipping drop:', err.message);
  }

  // Force fully unset the old removed fields at the MongoDB level to clean up documents
  await Product.collection.updateMany(
    {},
    { $unset: { materialVariants: "", availableMaterials: "" } }
  );

  console.log(`Migrated ${updatedCount} products in the database to the new variants schema.`);
};

migrateDatabaseSchema()
  .catch((error) => {
    console.error('Failed to migrate db:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
