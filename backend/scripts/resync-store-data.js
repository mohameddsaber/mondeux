import mongoose from 'mongoose';

import connectDB from '../db/db.js';
import Product from '../models/product.model.js';
import { computeProductDerivedFields } from '../utils/productDerivedFields.js';

const resyncProducts = async () => {
  await connectDB();

  const cursor = Product.find().cursor();
  let updatedCount = 0;

  for await (const product of cursor) {
    const derivedFields = computeProductDerivedFields(product.materialVariants);

    product.minVariantPrice = derivedFields.minVariantPrice;
    product.totalStock = derivedFields.totalStock;
    product.availableMaterials = derivedFields.availableMaterials;

    if (!product.isModified()) {
      continue;
    }

    await product.save();
    updatedCount += 1;
  }

  console.log(`Resynced ${updatedCount} product documents.`);
};

resyncProducts()
  .catch((error) => {
    console.error('Failed to resync store data:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
