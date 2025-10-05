import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  
  // Category references - CRUCIAL for easy querying
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
  
  // Jewelry specific fields
  material: {
    type: String,
    enum: ['gold', 'silver', 'platinum', 'diamond', 'gemstone', 'pearl', 'other']
  },
  metalPurity: String, // e.g., "14K", "18K", "925"
  weight: Number, // in grams
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  
  // Pricing
  price: {
    type: Number,
    required: true,
    min: 0
  },
  compareAtPrice: Number, // Original price for sale display
  costPrice: Number, // For profit calculation
  
  // Inventory
  sku: {
    type: String,
    required: true,
    unique: true
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  lowStockThreshold: {
    type: Number,
    default: 5
  },
  
  // Images
  images: [{
    url: String,
    alt: String,
    isPrimary: Boolean
  }],
  
  // Product attributes
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  // SEO
  metaTitle: String,
  metaDescription: String,
  
  // Reviews/Ratings
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  numReviews: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Indexes for efficient querying
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ subCategory: 1, isActive: 1 });
productSchema.index({ category: 1, subCategory: 1, isActive: 1 });

productSchema.index({ price: 1 });
productSchema.index({ isFeatured: 1, isActive: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

const Product = mongoose.model('Product', productSchema);
export default Product;