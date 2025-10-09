import mongoose from 'mongoose';

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

  metaTitle: String,
  metaDescription: String,

  rating: { type: Number, default: 0, min: 0, max: 5 },
  numReviews: { type: Number, default: 0 }
}, { timestamps: true });

productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ subCategory: 1, isActive: 1 });
productSchema.index({ category: 1, subCategory: 1, isActive: 1 });

productSchema.index({ 'materialVariants.material': 1 });
productSchema.index({ price: 1 });
productSchema.index({ isFeatured: 1, isActive: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

const Product = mongoose.model('Product', productSchema);
export default Product;
