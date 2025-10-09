
import Product from '../models/product.model.js';
import Category from '../models/category.model.js';
import SubCategory from '../models/subCategory.model.js';


export const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : null;
    const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : null;
    const materialFilter = req.query.material;

    // --- Aggregation Pipeline Setup ---
    const pipeline = [];

    // Stage 1: Base Filter
    const baseFilter = { isActive: true };
    if (materialFilter) {
      baseFilter['materialVariants.material'] = materialFilter;
    }
    pipeline.push({ $match: baseFilter });

    // Stage 2: Extract the 'silver' variant's price
    // We assume 'silver' is always present, so we filter the materialVariants array
    // to find the silver object, and then take the first element (the silver variant).
    pipeline.push({
        $addFields: {
            silverPrice: {
                $arrayElemAt: [
                    {
                        $filter: {
                            input: '$materialVariants',
                            as: 'variant',
                            cond: { $eq: ['$$variant.material', 'silver'] }
                        }
                    },
                    0
                ]
            }
        }
    });

    // Stage 3: Promote the price to a top-level field for easy sorting/filtering
    pipeline.push({
        $addFields: {
            silverPrice: '$silverPrice.price'
        }
    });

    // Stage 4: Apply Price Range Filter using the extracted silverPrice
    if (minPrice || maxPrice) {
      const priceFilter = {};
      if (minPrice) priceFilter.$gte = minPrice;
      if (maxPrice) priceFilter.$lte = maxPrice;
      
      pipeline.push({ $match: { silverPrice: priceFilter } });
    }

    // Stage 5: Sorting
    const sortStage = {};
    if (req.query.sort === 'price_asc') sortStage.silverPrice = 1;
    else if (req.query.sort === 'price_desc') sortStage.silverPrice = -1;
    else if (req.query.sort === 'newest') sortStage.createdAt = -1;
    else if (req.query.sort === 'popular') sortStage.numReviews = -1;
    else sortStage.createdAt = -1; 

    pipeline.push({ $sort: sortStage });
    
    // --- Pagination and Count ---
    const countPipeline = [...pipeline, { $count: 'total' }];
    const totalResult = await Product.aggregate(countPipeline);
    const total = totalResult.length > 0 ? totalResult[0].total : 0;
    
    // Add pagination stages
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });
    
    // --- Manual Population (using $lookup) ---
    // (Ensure you have Category and SubCategory models imported)
    pipeline.push(
        { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'category' } },
        { $unwind: '$category' },
        { $lookup: { from: 'subcategories', localField: 'subCategory', foreignField: '_id', as: 'subCategory' } },
        { $unwind: '$subCategory' }
    );

    // Stage 6: Final Projection
    pipeline.push({ 
        $project: { 
            __v: 0, 
            silverPrice: 0, // Exclude the temporary field
            'category.description': 0, 
            'subCategory.description': 0 
        } 
    });
    
    const products = await Product.aggregate(pipeline);

    // Re-map the populated category/subcategory for clean output
    const finalProducts = products.map(p => ({
        ...p,
        category: { name: p.category.name, slug: p.category.slug },
        subCategory: { name: p.subCategory.name, slug: p.subCategory.slug },
    }));


    res.json({
      success: true,
      data: finalProducts, 
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Aggregation Error in getAllProducts:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getProductsByCategory = async (req, res) => {
  try {
    const { categorySlug } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // First, find the category by slug
    const category = await Category.findOne({ slug: categorySlug, isActive: true });
    
    if (!category) {
      return res.status(404).json({ 
        success: false, 
        message: 'Category not found' 
      });
    }

    // Build filter with category ID (indexed field - fast query!)
    // This will automatically get ALL products where category matches,
    // regardless of their subcategory - NO RECURSION NEEDED!
    const filter = { 
      category: category._id, 
      isActive: true 
    };

    // Add additional filters
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
    }

    // Optional: Filter by specific subcategory if provided
    if (req.query.subCategory) {
      const subCategory = await SubCategory.findOne({ 
        slug: req.query.subCategory,
        category: category._id 
      });
      if (subCategory) {
        filter.subCategory = subCategory._id;
      }
    }

    // Sort options
    const sortOptions = {};
    if (req.query.sort === 'price_asc') sortOptions.price = 1;
    else if (req.query.sort === 'price_desc') sortOptions.price = -1;
    else sortOptions.createdAt = -1;

    const products = await Product.find(filter)
      .populate('subCategory', 'name slug')
      .sort(sortOptions)
      .limit(limit)
      .skip(skip)
      .select('-__v');

    const total = await Product.countDocuments(filter);

    // Get all subcategories for this category (for filter sidebar)
    // This also shows the user what subcategories exist
    const subCategories = await SubCategory.find({ 
      category: category._id, 
      isActive: true 
    }).select('name slug');

    // Optional: Get product count per subcategory for better UX
    const subCategoryStats = await Promise.all(
      subCategories.map(async (subCat) => {
        const count = await Product.countDocuments({
          subCategory: subCat._id,
          isActive: true
        });
        return {
          ...subCat.toObject(),
          productCount: count
        };
      })
    );

    res.json({
      success: true,
      category: {
        name: category.name,
        slug: category.slug,
        description: category.description
      },
      subCategories: subCategoryStats,
      data: products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductsBySubCategory = async (req, res) => {
  try {
    const { subCategorySlug } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const subCategory = await SubCategory.findOne({ 
      slug: subCategorySlug, 
      isActive: true 
    }).populate('category', 'name slug');
    
    if (!subCategory) {
      return res.status(404).json({ 
        success: false, 
        message: 'Subcategory not found' 
      });
    }

    const filter = { 
      subCategory: subCategory._id, 
      isActive: true 
    };

    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
    }

    const sortOptions = {};
    if (req.query.sort === 'price_asc') sortOptions.price = 1;
    else if (req.query.sort === 'price_desc') sortOptions.price = -1;
    else sortOptions.createdAt = -1;

    const products = await Product.find(filter)
      .sort(sortOptions)
      .limit(limit)
      .skip(skip)
      .select('-__v');

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      category: subCategory.category,
      subCategory: {
        name: subCategory.name,
        slug: subCategory.slug,
        description: subCategory.description
      },
      data: products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductsByCategoryAndSubCategory = async (req, res) => {
  try {
    const { categorySlug, subCategorySlug } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Find category
    const category = await Category.findOne({ slug: categorySlug, isActive: true });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Find subcategory that belongs to this category
    const subCategory = await SubCategory.findOne({ 
      slug: subCategorySlug, 
      category: category._id,
      isActive: true 
    });
    
    if (!subCategory) {
      return res.status(404).json({ success: false, message: 'Subcategory not found' });
    }

    // Query using compound index (category + subCategory)
    const filter = { 
      category: category._id,
      subCategory: subCategory._id,
      isActive: true 
    };

    const products = await Product.find(filter)
      .limit(limit)
      .skip(skip)
      .select('-__v');

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      category: { name: category.name, slug: category.slug },
      subCategory: { name: subCategory.name, slug: subCategory.slug },
      data: products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const searchProducts = async (req, res) => {
  try {
    const { q } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    if (!q) {
      return res.status(400).json({ 
        success: false, 
        message: 'Search query is required' 
      });
    }

    // Text search using index
    const products = await Product.find({
      $text: { $search: q },
      isActive: true
    })
    .populate('category', 'name slug')
    .populate('subCategory', 'name slug')
    .limit(limit)
    .skip(skip)
    .select('-__v');

    const total = await Product.countDocuments({
      $text: { $search: q },
      isActive: true
    });

    res.json({
      success: true,
      query: q,
      data: products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}; //not tested

export const getFeaturedProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const products = await Product.find({ 
      isFeatured: true, 
      isActive: true 
    })
    .populate('category', 'name slug')
    .populate('subCategory', 'name slug')
    .limit(limit)
    .select('-__v');

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}; //tested works

// Get single product by slug
export const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ 
      slug: req.params.slug,
      isActive: true 
    })
    .populate('category', 'name slug description')
    .populate('subCategory', 'name slug description');

    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }

    // Get related products from same subcategory
    const relatedProducts = await Product.find({
      subCategory: product.subCategory._id,
      _id: { $ne: product._id },
      isActive: true
    })
    .limit(4)
    .select('name slug price images rating');

    res.json({
      success: true,
      data: product,
      relatedProducts
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


//admin routes 
export const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}; //tested works

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}; //tested works

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}; // tested works