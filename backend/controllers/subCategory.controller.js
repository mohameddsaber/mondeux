import SubCategory from '../models/subCategory.model.js';
import Category from '../models/category.model.js';
import Product from '../models/product.model.js';


export const getAllSubCategories = async (req, res) => {
  try {
    const subCategories = await SubCategory.find({ isActive: true })
      .populate('category', 'name slug')
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

export const getSubCategoryBySlug = async (req, res) => {
  try {
    const subCategory = await SubCategory.findOne({ 
      slug: req.params.slug,
      isActive: true 
    }).populate('category', 'name slug description');

    if (!subCategory) {
      return res.status(404).json({ 
        success: false, 
        message: 'Subcategory not found' 
      });
    }

    const productCount = await Product.countDocuments({
      subCategory: subCategory._id,
      isActive: true
    });

    res.json({
      success: true,
      data: {
        ...subCategory.toObject(),
        productCount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//admin
export const createSubCategory = async (req, res) => {
  try {
    // Verify category exists
    const category = await Category.findById(req.body.category);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const subCategory = await SubCategory.create(req.body);
    res.status(201).json({
      success: true,
      data: subCategory
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateSubCategory = async (req, res) => {
  try {
    const subCategory = await SubCategory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!subCategory) {
      return res.status(404).json({ 
        success: false, 
        message: 'Subcategory not found' 
      });
    }

    res.json({
      success: true,
      data: subCategory
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteSubCategory = async (req, res) => {
  try {
    // Check if subcategory has products
    const productCount = await Product.countDocuments({
      subCategory: req.params.id
    });

    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete subcategory with ${productCount} products. Delete or reassign products first.`
      });
    }

    const subCategory = await SubCategory.findByIdAndDelete(req.params.id);

    if (!subCategory) {
      return res.status(404).json({ 
        success: false, 
        message: 'Subcategory not found' 
      });
    }

    res.json({
      success: true,
      message: 'Subcategory deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};