import User from '../models/user.model.js';
import Product from '../models/product.model.js';
import bcrypt from 'bcryptjs';
import { generateTokenAndSetCookie } from '../utils/generateToken.js';
import { protect, admin } from '../middleware/auth.js';
import { appConfig } from '../config/env.js';
import { trackEvent } from '../utils/trackEvent.js';
import {
  awardLoyaltyPoints,
  serializeSessionUser,
} from '../utils/loyaltyHelpers.js';
import { LOYALTY_SIGNUP_BONUS } from '../utils/loyaltyProgram.js';

const getComparableProductPrice = (product) => {
  const minVariantPrice = Number(product?.minVariantPrice || 0);

  if (minVariantPrice > 0) {
    return minVariantPrice;
  }

  const prices = (product?.materialVariants || [])
    .map((variant) => Number(variant?.price || 0))
    .filter((price) => price > 0);

  return prices.length > 0 ? Math.min(...prices) : 0;
};

const serializeWishlistProducts = (products, snapshots = []) => {
  const snapshotByProductId = new Map(
    snapshots.map((snapshot) => [snapshot.product?.toString(), snapshot])
  );

  return products.map((product) => {
    const productId = product._id.toString();
    const currentPrice = getComparableProductPrice(product);
    const snapshot = snapshotByProductId.get(productId);
    const savedPrice = Number(snapshot?.savedPrice || currentPrice || 0);
    const totalStock = Number(product.totalStock || 0);
    const lowStockThreshold = Number(product.lowStockThreshold || 0);

    return {
      _id: product._id,
      name: product.name,
      slug: product.slug,
      images: product.images || [],
      rating: Number(product.rating || 0),
      isActive: Boolean(product.isActive),
      category: product.category || null,
      subCategory: product.subCategory || null,
      materialVariants: product.materialVariants || [],
      minVariantPrice: currentPrice,
      totalStock,
      lowStockThreshold,
      savedPrice,
      addedAt: snapshot?.addedAt || null,
      isLowStock: totalStock > 0 && totalStock <= lowStockThreshold,
      isOutOfStock: totalStock <= 0,
      priceDropped: currentPrice > 0 && savedPrice > currentPrice,
      priceDropAmount: savedPrice > currentPrice ? savedPrice - currentPrice : 0,
    };
  });
};

const populateWishlistProducts = (userQuery) =>
  userQuery.populate({
    path: 'wishlist',
    select: `
      name slug images rating isActive category subCategory
      materialVariants minVariantPrice totalStock lowStockThreshold
    `,
    populate: {
      path: 'category subCategory',
      select: 'name slug',
    },
  });


export const isAuthenticated = [
  protect,
  (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }
    next();
  },
];

export const isAdmin = [
  protect,
  admin,
];

export const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      await trackEvent({
        eventType: 'signup_failure',
        req,
        sessionId: req.body.sessionId || '',
        metadata: {
          reason: 'email_already_exists',
        },
      });

      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    const user = await User.create({ name, email, password, phone });
    awardLoyaltyPoints({
      user,
      points: LOYALTY_SIGNUP_BONUS,
      type: 'signup_bonus',
      description: 'Welcome bonus for joining Mondeux',
    });
    await user.save();

    generateTokenAndSetCookie(user._id, res);

    await trackEvent({
      eventType: 'signup_success',
      req,
      userId: user._id,
      sessionId: req.body.sessionId || '',
      metadata: {
        role: user.role,
      },
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: serializeSessionUser(user),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      await trackEvent({
        eventType: 'login_failure',
        req,
        sessionId: req.body.sessionId || '',
        metadata: {
          reason: 'invalid_credentials',
        },
      });

      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await trackEvent({
        eventType: 'login_failure',
        req,
        sessionId: req.body.sessionId || '',
        metadata: {
          reason: 'invalid_credentials',
        },
      });

      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    generateTokenAndSetCookie(user._id, res);

    await trackEvent({
      eventType: 'login_success',
      req,
      userId: user._id,
      sessionId: req.body.sessionId || '',
      metadata: {
        role: user.role,
      },
    });

    res.json({
      success: true,
      message: "Logged in successfully",
      data: serializeSessionUser(user),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('wishlist', 'name slug price images');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      data: {
        ...serializeSessionUser(updatedUser),
        token: generateTokenAndSetCookie(updatedUser._id,res)
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};


export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", {
      httpOnly: true,
      sameSite: appConfig.authCookieSameSite,
      secure: appConfig.authCookieSecure,
      expires: new Date(0) // Expire the cookie immediately
    });

    res.json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



export const getWishlist = async (req, res) => {
  try {
    const user = await populateWishlistProducts(User.findById(req.user._id));

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Filter out inactive products
    const activeWishlist = serializeWishlistProducts(
      user.wishlist.filter((item) => item.isActive),
      user.wishlistSnapshots || []
    );

    res.json({
      success: true,
      data: activeWishlist
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const addToWishlist = async (req, res) => {
  try {
    const [user, targetProduct] = await Promise.all([
      User.findById(req.user._id),
      Product.findById(req.params.productId)
        .select(`
          name slug images rating isActive category subCategory
          materialVariants minVariantPrice totalStock lowStockThreshold
        `)
        .populate('category subCategory', 'name slug'),
    ]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!targetProduct || !targetProduct.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if product already in wishlist
    const alreadyInWishlist = user.wishlist.some(
      item => item.toString() === req.params.productId
    );

    if (alreadyInWishlist) {
      return res.status(400).json({
        success: false,
        message: 'Product already in wishlist'
      });
    }

    user.wishlist.push(req.params.productId);
    user.wishlistSnapshots = Array.isArray(user.wishlistSnapshots)
      ? user.wishlistSnapshots.filter(
        (snapshot) => snapshot.product?.toString() !== req.params.productId
      )
      : [];
    user.wishlistSnapshots.push({
      product: req.params.productId,
      savedPrice: getComparableProductPrice(targetProduct),
      addedAt: new Date(),
    });
    await user.save();

    await populateWishlistProducts(user);

    res.json({
      success: true,
      data: serializeWishlistProducts(
        user.wishlist.filter((item) => item.isActive),
        user.wishlistSnapshots || []
      )
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};


export const removeFromWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.wishlist = user.wishlist.filter(
      item => item.toString() !== req.params.productId
    );
    user.wishlistSnapshots = (user.wishlistSnapshots || []).filter(
      (snapshot) => snapshot.product?.toString() !== req.params.productId
    );

    await user.save();

    await populateWishlistProducts(user);

    res.json({
      success: true,
      data: serializeWishlistProducts(
        user.wishlist.filter((item) => item.isActive),
        user.wishlistSnapshots || []
      )
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { street, city, state, zipCode, country, isDefault } = req.body;

    if (isDefault) {
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    user.addresses.push({
      street,
      city,
      state,
      zipCode,
      country,
      isDefault: isDefault || user.addresses.length === 0
    });

    await user.save();

    res.status(201).json({
      success: true,
      data: user.addresses
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};


export const updateAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const address = user.addresses.id(req.params.addressId);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    const { street, city, state, zipCode, country, isDefault } = req.body;

    // If setting as default, unset all others
    if (isDefault) {
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    address.street = street || address.street;
    address.city = city || address.city;
    address.state = state || address.state;
    address.zipCode = zipCode || address.zipCode;
    address.country = country || address.country;
    address.isDefault = isDefault !== undefined ? isDefault : address.isDefault;

    await user.save();

    res.json({
      success: true,
      data: user.addresses
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};


export const deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const address = user.addresses.id(req.params.addressId);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    user.addresses.pull({ _id: req.params.addressId });
    await user.save();

    res.json({
      success: true,
      data: user.addresses
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//admin
export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await User.countDocuments();

    res.json({
      success: true,
      data: users,
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


export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('wishlist', 'name slug price');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Don't allow deleting yourself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    await user.deleteOne();

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
