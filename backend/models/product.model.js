import mongoose from 'mongoose';
import { applyDerivedProductFields, computeProductDerivedFields } from '../utils/productDerivedFields.js';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  images: [{ url: String, alt: String, isPrimary: Boolean }],

  productType: {
    type: String,
    enum: ['jewellery', 'clothing', 'accessories', 'bags'],
    default: 'jewellery'
  },
  gender: {
    type: String,
    enum: ['men', 'women', 'unisex', 'kids', 'unspecified'],
    default: 'unspecified'
  },
  extraAttributes: {
    type: Map,
    of: String
  },

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

  variants: [
    {
      attribute: {
        type: { type: String, required: true },
        value: { type: String, required: true },
        meta: String
      },
      images: [{ url: String, alt: String, isPrimary: Boolean }],
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
  availableAttributes: [{ type: String }],

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

productSchema.index({ 'variants.attribute.value': 1 });
productSchema.index({ availableAttributes: 1, isActive: 1 });
productSchema.index({ isFeatured: 1, isActive: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

productSchema.pre('save', function(next) {
  applyDerivedProductFields(this, this.variants);
  next();
});

productSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate() || {};
  const variants =
    update.variants
    || update.$set?.variants
    || null;

  if (!variants) {
    return next();
  }

  const derivedFields = computeProductDerivedFields(variants);
  const nextUpdate = { ...update };
  nextUpdate.$set = {
    ...(update.$set || {}),
    minVariantPrice: derivedFields.minVariantPrice,
    totalStock: derivedFields.totalStock,
    availableAttributes: derivedFields.availableAttributes,
  };

  if ('variants' in nextUpdate) {
    delete nextUpdate.variants;
    nextUpdate.$set.variants = variants;
  }

  this.setUpdate(nextUpdate);
  next();
});

productSchema.post('findOneAndUpdate', async function(doc) {
  if (!doc) return;

  const update = this.getUpdate() || {};
  const setPaths = Object.keys(update.$set || {});
  const updatePaths = Object.keys(update);
  
  const hasPositionalVariantUpdate = 
    setPaths.some(path => path.startsWith('variants.')) ||
    updatePaths.some(path => path.startsWith('variants.'));

  const hasRootVariantUpdate = !!(update.variants || update.$set?.variants);

  if (hasPositionalVariantUpdate && !hasRootVariantUpdate) {
    const ProductModel = this.model;
    const updatedDoc = await ProductModel.findById(doc._id);
    if (!updatedDoc) return;

    const derivedFields = computeProductDerivedFields(updatedDoc.variants);
    
    const currentAttrs = updatedDoc.availableAttributes || [];
    const newAttrs = derivedFields.availableAttributes || [];
    const attrsChanged = 
      currentAttrs.length !== newAttrs.length || 
      !currentAttrs.every(a => newAttrs.includes(a));
    
    if (
      updatedDoc.totalStock !== derivedFields.totalStock ||
      updatedDoc.minVariantPrice !== derivedFields.minVariantPrice ||
      attrsChanged
    ) {
      await ProductModel.updateOne({ _id: doc._id }, {
        $set: {
          minVariantPrice: derivedFields.minVariantPrice,
          totalStock: derivedFields.totalStock,
          availableAttributes: derivedFields.availableAttributes
        }
      });
    }
  }
});

const Product = mongoose.model('Product', productSchema);
export default Product;
