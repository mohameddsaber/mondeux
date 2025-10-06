import Category from '../models/category.model.js';
import SubCategory from '../models/subCategory.model.js';
import Product from '../models/product.model.js';

//public routes
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ displayOrder: 1, name: 1 })
      .select('-__v');

    // Get product count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const productCount = await Product.countDocuments({
          category: category._id,
          isActive: true
        });
        return {
          ...category.toObject(),
          productCount
        };
      })
    );

    res.json({
      success: true,
      data: categoriesWithCount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getCategoryBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({ 
      slug: req.params.slug,
      isActive: true 
    });

    if (!category) {
      return res.status(404).json({ 
        success: false, 
        message: 'Category not found' 
      });
    }

    // Get subcategories
    const subCategories = await SubCategory.find({
      category: category._id,
      isActive: true
    }).sort({ displayOrder: 1, name: 1 });

    // Get product count
    const productCount = await Product.countDocuments({
      category: category._id,
      isActive: true
    });

    res.json({
      success: true,
      data: {
        ...category.toObject(),
        subCategories,
        productCount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getSubCategoriesByCategory = async (req, res) => {
  try {
    const subCategories = await SubCategory.find({
      category: req.params.categoryId,
      isActive: true
    })
    .sort({ displayOrder: 1, name: 1 })
    .select('-__v');

    res.json({
      success: true,
      data: subCategories
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//admin routes
export const createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};


export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ 
        success: false, 
        message: 'Category not found' 
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};


export const deleteCategory = async (req, res) => {
  try {
    // Check if category has products
    const productCount = await Product.countDocuments({
      category: req.params.id
    });

    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category with ${productCount} products. Delete or reassign products first.`
      });
    }

    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({ 
        success: false, 
        message: 'Category not found' 
      });
    }

    // Also delete all subcategories
    await SubCategory.deleteMany({ category: req.params.id });

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};