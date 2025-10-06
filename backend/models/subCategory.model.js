import mongoose from 'mongoose';

const subCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    lowercase: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  description: String,
  image: String,
  isActive: {
    type: Boolean,
    default: true
  },
  displayOrder: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Compound index for unique subcategory names within a category
subCategorySchema.index({ category: 1, slug: 1 }, { unique: true });
subCategorySchema.index({ isActive: 1 });

const SubCategory = mongoose.model('SubCategory', subCategorySchema);
export default SubCategory 
