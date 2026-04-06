import mongoose from 'mongoose';
import { applyDerivedProductFields, computeProductDerivedFields } from '../utils/productDerivedFields.js';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  images: [{ url: String, alt: String, isPrimary: Boolean }],


  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  subCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubCategory',
    required: true
  },

  materialVariants: [
    {
      material: {
        type: String,
        enum: ['gold', 'silver', 'stainless steel'],
        required: true
      },
      metalPurity: String, 
      weight: Number,
      price: { type: Number, required: true, min: 0 },
      compareAtPrice: Number,
      costPrice: Number,

      sizeVariants: [
        {
          label: { type: String, required: true }, 
          sku: { type: String, required: true, unique: true },
          stock: { type: Number, default: 0, min: 0 },
          price: { type: Number }, 
          isAvailable: { type: Boolean, default: true }
        }
      ],

      stock: { type: Number, default: 0, min: 0 }, 
    }
  ],

  tags: [String],
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  lowStockThreshold: { type: Number, default: 5 },
  minVariantPrice: { type: Number, default: 0, min: 0, index: true },
  totalStock: { type: Number, default: 0, min: 0, index: true },
  availableMaterials: [{ type: String, enum: ['gold', 'silver', 'stainless steel'] }],

  metaTitle: String,
  metaDescription: String,

  rating: { type: Number, default: 0, min: 0, max: 5 },
  numReviews: { type: Number, default: 0 }
}, { timestamps: true });

productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ subCategory: 1, isActive: 1 });
productSchema.index({ category: 1, subCategory: 1, isActive: 1 });
productSchema.index({ isActive: 1, category: 1, createdAt: -1 });
productSchema.index({ isActive: 1, subCategory: 1, createdAt: -1 });
productSchema.index({ isActive: 1, category: 1, subCategory: 1, createdAt: -1 });
productSchema.index({ isActive: 1, category: 1, minVariantPrice: 1, createdAt: -1 });
productSchema.index({ isActive: 1, category: 1, minVariantPrice: -1, createdAt: -1 });
productSchema.index({ isActive: 1, subCategory: 1, minVariantPrice: 1, createdAt: -1 });
productSchema.index({ isActive: 1, subCategory: 1, minVariantPrice: -1, createdAt: -1 });
productSchema.index({ isActive: 1, category: 1, totalStock: 1, createdAt: -1 });
productSchema.index({ isActive: 1, subCategory: 1, totalStock: 1, createdAt: -1 });
productSchema.index({ isActive: 1, category: 1, numReviews: -1, rating: -1, createdAt: -1 });
productSchema.index({ isActive: 1, subCategory: 1, numReviews: -1, rating: -1, createdAt: -1 });
productSchema.index({ isActive: 1, category: 1, isFeatured: -1, createdAt: -1 });
productSchema.index({ isActive: 1, subCategory: 1, isFeatured: -1, createdAt: -1 });

productSchema.index({ 'materialVariants.material': 1 });
productSchema.index({ availableMaterials: 1, isActive: 1 });
productSchema.index({ isFeatured: 1, isActive: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

productSchema.pre('save', function(next) {
  applyDerivedProductFields(this, this.materialVariants);
  next();
});

productSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate() || {};
  const materialVariants =
    update.materialVariants
    || update.$set?.materialVariants
    || null;

  if (!materialVariants) {
    return next();
  }

  const derivedFields = computeProductDerivedFields(materialVariants);
  const nextUpdate = { ...update };
  nextUpdate.$set = {
    ...(update.$set || {}),
    minVariantPrice: derivedFields.minVariantPrice,
    totalStock: derivedFields.totalStock,
    availableMaterials: derivedFields.availableMaterials,
  };

  if ('materialVariants' in nextUpdate) {
    delete nextUpdate.materialVariants;
    nextUpdate.$set.materialVariants = materialVariants;
  }

  this.setUpdate(nextUpdate);
  next();
});

const Product = mongoose.model('Product', productSchema);
export default Product;
