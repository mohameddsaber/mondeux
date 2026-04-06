import Product from '../models/product.model.js';
import Category from '../models/category.model.js';
import SubCategory from '../models/subCategory.model.js';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

const splitCsvValue = (value) => {
  if (typeof value !== 'string') {
    return [];
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const toNullableNumber = (value) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : null;
};

const getCatalogSort = (requestedSort, hasSearchQuery) => {
  if (requestedSort) {
    return requestedSort === 'best-selling' ? 'popular' : requestedSort;
  }

  return hasSearchQuery ? 'relevance' : 'newest';
};

const getCatalogSortStage = (sort) => {
  switch (sort) {
    case 'featured':
      return { isFeatured: -1, createdAt: -1 };
    case 'price_asc':
      return { minVariantPrice: 1, createdAt: -1 };
    case 'price_desc':
      return { minVariantPrice: -1, createdAt: -1 };
    case 'popular':
      return { numReviews: -1, rating: -1, createdAt: -1 };
    case 'relevance':
      return { searchScore: -1, isFeatured: -1, createdAt: -1 };
    case 'newest':
    default:
      return { createdAt: -1 };
  }
};

const getAvailabilityFilterStages = (selectedAvailability) => {
  const availabilitySet = new Set(selectedAvailability);

  if (
    availabilitySet.size === 0
    || (availabilitySet.has('in_stock') && availabilitySet.has('out_of_stock'))
  ) {
    return [];
  }

  if (availabilitySet.has('in_stock')) {
    return [{ $match: { totalStock: { $gt: 0 } } }];
  }

  return [{ $match: { totalStock: { $lte: 0 } } }];
};

const toCatalogRef = (value) => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  if (!value.name || !value.slug) {
    return null;
  }

  return {
    name: value.name,
    slug: value.slug,
  };
};

const formatCatalogProduct = (
  product,
  {
    categoryOverride = null,
    subCategoryOverride = null,
  } = {}
) => ({
  ...product,
  category: toCatalogRef(categoryOverride) || toCatalogRef(product.category),
  subCategory: toCatalogRef(subCategoryOverride) || toCatalogRef(product.subCategory),
});

const mapAvailabilityFacet = (facet = []) => facet.map((item) => ({
  value: item.value,
  label: item.value === 'in_stock' ? 'In Stock' : 'Out of Stock',
  count: item.count,
}));

const createCatalogError = (status, message) => {
  const error = new Error(message);
  error.statusCode = status;
  return error;
};

const resolveCategoryContext = async (categorySlug) => {
  if (!categorySlug) {
    return null;
  }

  const category = await Category.findOne({
    slug: categorySlug,
    isActive: true,
  })
    .select('name slug description')
    .lean();

  if (!category) {
    throw createCatalogError(404, 'Category not found');
  }

  return category;
};

const resolveSubCategoryContext = async (subCategorySlug, categoryId = null) => {
  if (!subCategorySlug) {
    return null;
  }

  const match = {
    slug: subCategorySlug,
    isActive: true,
  };

  if (categoryId) {
    match.category = categoryId;
  }

  const subCategory = await SubCategory.findOne(match)
    .populate('category', 'name slug description')
    .select('name slug description category')
    .lean();

  if (!subCategory) {
    throw createCatalogError(404, 'Subcategory not found');
  }

  return subCategory;
};

const createFacetPipeline = ({
  includeCategories = true,
  includeSubCategories = true,
}) => {
  const facets = {
    materials: [
      { $unwind: '$availableMaterials' },
      {
        $group: {
          _id: '$availableMaterials',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      {
        $project: {
          _id: 0,
          value: '$_id',
          label: '$_id',
          count: 1,
        },
      },
    ],
    availability: [
      {
        $group: {
          _id: {
            $cond: [{ $gt: ['$totalStock', 0] }, 'in_stock', 'out_of_stock'],
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          value: '$_id',
          count: 1,
        },
      },
    ],
    priceRange: [
      {
        $group: {
          _id: null,
          min: { $min: '$minVariantPrice' },
          max: { $max: '$minVariantPrice' },
        },
      },
      {
        $project: {
          _id: 0,
          min: 1,
          max: 1,
        },
      },
    ],
  };

  if (includeCategories) {
    facets.categories = [
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' },
      {
        $project: {
          _id: 0,
          value: '$category.slug',
          label: '$category.name',
          count: 1,
        },
      },
    ];
  }

  if (includeSubCategories) {
    facets.subCategories = [
      {
        $group: {
          _id: '$subCategory',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      {
        $lookup: {
          from: 'subcategories',
          localField: '_id',
          foreignField: '_id',
          as: 'subCategory',
        },
      },
      { $unwind: '$subCategory' },
      {
        $project: {
          _id: 0,
          value: '$subCategory.slug',
          label: '$subCategory.name',
          count: 1,
        },
      },
    ];
  }

  return facets;
};

const getCatalogDataPipeline = ({
  sort,
  skip,
  limit,
  includeCategoryLookup,
  includeSubCategoryLookup,
}) => {
  const pipeline = [
    { $sort: getCatalogSortStage(sort) },
    { $skip: skip },
    { $limit: limit },
  ];

  if (includeCategoryLookup) {
    pipeline.push(
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category',
        },
      },
      {
        $unwind: {
          path: '$category',
          preserveNullAndEmptyArrays: true,
        },
      }
    );
  }

  if (includeSubCategoryLookup) {
    pipeline.push(
      {
        $lookup: {
          from: 'subcategories',
          localField: 'subCategory',
          foreignField: '_id',
          as: 'subCategory',
        },
      },
      {
        $unwind: {
          path: '$subCategory',
          preserveNullAndEmptyArrays: true,
        },
      }
    );
  }

  pipeline.push({
    $project: {
      __v: 0,
      minVariantPrice: 0,
      totalStock: 0,
      searchScore: 0,
      'category.description': 0,
      'subCategory.description': 0,
    },
  });

  return pipeline;
};

const getCatalogPayload = async ({
  req,
  scopedCategorySlug = '',
  scopedSubCategorySlug = '',
}) => {
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  const page = Number(req.query.page || DEFAULT_PAGE);
  const limit = Number(req.query.limit || DEFAULT_LIMIT);
  const skip = (page - 1) * limit;
  const selectedCategorySlug = scopedCategorySlug || (typeof req.query.category === 'string' ? req.query.category.trim() : '');
  const selectedSubCategorySlug = scopedSubCategorySlug || (typeof req.query.subCategory === 'string' ? req.query.subCategory.trim() : '');
  const selectedMaterials = splitCsvValue(req.query.material);
  const selectedAvailability = splitCsvValue(req.query.availability);
  const minPrice = toNullableNumber(req.query.minPrice);
  const maxPrice = toNullableNumber(req.query.maxPrice);
  const hasScopedCategory = Boolean(scopedCategorySlug);
  const hasScopedSubCategory = Boolean(scopedSubCategorySlug);
  const sort = getCatalogSort(
    typeof req.query.sort === 'string' ? req.query.sort : '',
    Boolean(q)
  );

  const categoryContext = await resolveCategoryContext(selectedCategorySlug);
  const subCategoryContext = await resolveSubCategoryContext(
    selectedSubCategorySlug,
    categoryContext?._id || null
  );

  const effectiveCategory =
    categoryContext
    || (subCategoryContext?.category && typeof subCategoryContext.category === 'object'
      ? subCategoryContext.category
      : null);

  const baseMatch = {
    isActive: true,
  };

  if (q) {
    baseMatch.$text = { $search: q };
  }

  if (effectiveCategory?._id) {
    baseMatch.category = effectiveCategory._id;
  }

  if (subCategoryContext?._id) {
    baseMatch.subCategory = subCategoryContext._id;
  }

  if (selectedMaterials.length > 0) {
    baseMatch['materialVariants.material'] = {
      $in: selectedMaterials,
    };
  }

  const catalogPipeline = [
    { $match: baseMatch },
  ];

  if (q) {
    catalogPipeline.push({
      $addFields: {
        searchScore: { $meta: 'textScore' },
      },
    });
  }

  if (minPrice !== null || maxPrice !== null) {
    const priceMatch = {};

    if (minPrice !== null) {
      priceMatch.$gte = minPrice;
    }

    if (maxPrice !== null) {
      priceMatch.$lte = maxPrice;
    }

    catalogPipeline.push({
      $match: {
        minVariantPrice: priceMatch,
      },
    });
  }

  catalogPipeline.push(...getAvailabilityFilterStages(selectedAvailability));

  const includeCategoryLookup = !(hasScopedCategory || hasScopedSubCategory);
  const includeSubCategoryLookup = !hasScopedSubCategory;
  const facetPipeline = createFacetPipeline({
    includeCategories: !(hasScopedCategory || hasScopedSubCategory),
    includeSubCategories: !hasScopedSubCategory,
  });

  const [catalogResult] = await Product.aggregate([
    ...catalogPipeline,
    {
      $facet: {
        data: getCatalogDataPipeline({
          sort,
          skip,
          limit,
          includeCategoryLookup,
          includeSubCategoryLookup,
        }),
        total: [{ $count: 'total' }],
        ...facetPipeline,
      },
    },
  ]);

  const total = catalogResult?.total?.[0]?.total || 0;
  const finalProducts = (catalogResult?.data || []).map((product) =>
    formatCatalogProduct(product, {
      categoryOverride: effectiveCategory || null,
      subCategoryOverride: subCategoryContext || null,
    })
  );
  const priceRange = catalogResult?.priceRange?.[0] || {
    min: 0,
    max: 0,
  };

  return {
    success: true,
    query: q,
    category: effectiveCategory
      ? {
        name: effectiveCategory.name,
        slug: effectiveCategory.slug,
        description: effectiveCategory.description,
      }
      : undefined,
    subCategory: subCategoryContext
      ? {
        name: subCategoryContext.name,
        slug: subCategoryContext.slug,
        description: subCategoryContext.description,
      }
      : undefined,
    data: finalProducts,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
    filters: {
      q,
      sort,
      category: selectedCategorySlug,
      subCategory: selectedSubCategorySlug,
      materials: selectedMaterials,
      availability: selectedAvailability,
      minPrice,
      maxPrice,
    },
    facets: {
      categories: catalogResult?.categories || [],
      subCategories: catalogResult?.subCategories || [],
      materials: catalogResult?.materials || [],
      availability: mapAvailabilityFacet(catalogResult?.availability || []),
      priceRange: {
        min: Number(priceRange.min || 0),
        max: Number(priceRange.max || 0),
      },
    },
  };
};

const handleCatalogError = (res, error) => {
  if (error?.statusCode) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: error.message,
  });
};

export const getAllProducts = async (req, res) => {
  try {
    const payload = await getCatalogPayload({ req });
    res.json(payload);
  } catch (error) {
    console.error('Catalog Error in getAllProducts:', error);
    handleCatalogError(res, error);
  }
};

export const getProductsByCategory = async (req, res) => {
  try {
    const payload = await getCatalogPayload({
      req,
      scopedCategorySlug: req.params.categorySlug,
    });
    res.json(payload);
  } catch (error) {
    handleCatalogError(res, error);
  }
};

export const getProductsBySubCategory = async (req, res) => {
  try {
    const payload = await getCatalogPayload({
      req,
      scopedSubCategorySlug: req.params.subCategorySlug,
    });
    res.json(payload);
  } catch (error) {
    handleCatalogError(res, error);
  }
};

export const getProductsByCategoryAndSubCategory = async (req, res) => {
  try {
    const payload = await getCatalogPayload({
      req,
      scopedCategorySlug: req.params.categorySlug,
      scopedSubCategorySlug: req.params.subCategorySlug,
    });
    res.json(payload);
  } catch (error) {
    handleCatalogError(res, error);
  }
};

export const searchProducts = async (req, res) => {
  try {
    const searchQuery = typeof req.query.q === 'string' ? req.query.q.trim() : '';

    if (!searchQuery) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    const payload = await getCatalogPayload({ req });

    res.json({
      ...payload,
      query: searchQuery,
    });
  } catch (error) {
    handleCatalogError(res, error);
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const products = await Product.find({
      isFeatured: true,
      isActive: true,
    })
      .populate('category', 'name slug')
      .populate('subCategory', 'name slug')
      .limit(limit)
      .select('-__v');

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({
      slug: req.params.slug,
      isActive: true,
    })
      .populate('category', 'name slug description')
      .populate('subCategory', 'name slug description');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const relatedProducts = await Product.find({
      subCategory: product.subCategory._id,
      _id: { $ne: product._id },
      isActive: true,
    })
      .limit(4)
      .select('name slug images rating minVariantPrice materialVariants');

    res.json({
      success: true,
      data: product,
      relatedProducts,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

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
        message: 'Product not found',
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
