import Cart from '../models/cart.model.js';
import Product from '../models/product.model.js';
import { trackEvent } from '../utils/trackEvent.js';

const prepareCart = async (cart) => {
  await cart.populate({
    path: 'items.product',
    select: 'name slug price images stock isActive'
  });

  const activeItems = cart.items.filter(item =>
    item.product && item.product.isActive && item.quantity > 0
  );

  const totalAmount = activeItems.reduce((total, item) => {
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 0;
    return total + (price * quantity);
  }, 0);

  const itemsChanged = activeItems.length !== cart.items.length;
  const totalChanged = cart.totalAmount !== totalAmount;

  if (itemsChanged) {
    cart.items = activeItems;
  }

  if (totalChanged) {
    cart.totalAmount = totalAmount;
  }

  return itemsChanged || totalChanged;
};

const sendCartResponse = (cart, res) => {

  res.json({
    success: true,
    data: cart
  });
};
// ----------------------------------------------------------------------

export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const shouldPersist = await prepareCart(cart);

    if (shouldPersist) {
      await cart.save();
    }

    sendCartResponse(cart, res);

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, size, material } = req.body; 

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not found or inactive' });
    }
    
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(item => 
      item.product.toString() === productId && 
      item.size === size &&
      item.material === material
    );

    const price = product.materialVariants.find(mv => mv.material === material)?.price || product.price;

    if (existingItemIndex > -1) {

      cart.items[existingItemIndex].quantity += quantity;
    } else {

      cart.items.push({
        product: productId,
        quantity,
        price, 
        size,
        material
      });
    }
    await prepareCart(cart);
    await cart.save();
    await trackEvent({
      eventType: 'add_to_cart',
      req,
      userId: req.user?._id || null,
      sessionId: req.body.sessionId || '',
      productId: product._id,
      metadata: {
        quantity,
        size,
        material,
        price,
      },
    });
    sendCartResponse(cart, res);

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const { size, material, delta } = req.body;
    const { productId } = req.params;

    if (!size || !material || typeof delta !== 'number' || !Number.isInteger(delta) || delta === 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing or invalid fields: size, material, or delta must be a non-zero integer'
      });
    }

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId &&
              item.size === size &&
              item.material === material
    );

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    const currentQuantity = cart.items[itemIndex].quantity;
    const newQuantity = currentQuantity + delta;
    
    if (newQuantity <= 0) {

      cart.items = cart.items.filter((_, index) => index !== itemIndex);
    } else {
        const product = await Product.findById(productId);
        if (!product || !product.isActive) {

          cart.items = cart.items.filter((_, index) => index !== itemIndex);
        } else {
            const materialVariant = product.materialVariants.find(mv => mv.material === material);
            const sizeVariant = materialVariant?.sizeVariants.find(sv => sv.label === size);

            if (!materialVariant || !sizeVariant) {

              cart.items = cart.items.filter((_, index) => index !== itemIndex);
            }
            else if (sizeVariant.stock < newQuantity) {
                return res.status(400).json({
                    success: false,
                    message: `Only ${sizeVariant.stock} items available in stock`
                });
            } else {

              cart.items[itemIndex].quantity = newQuantity;
                cart.items[itemIndex].price = materialVariant.price; 
            }
        }
    }

    await prepareCart(cart);
    await cart.save();
    sendCartResponse(cart, res);

  } catch (error) {
    console.error('Error in updateCartItem:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const { size, material } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter(
      (item) =>
        !(
          item.product.toString() === productId &&
          item.size === size &&
          item.material === material
        )
    );

    await prepareCart(cart);
    await cart.save();
    sendCartResponse(cart, res);

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = [];
    await prepareCart(cart);
    await cart.save();
    sendCartResponse(cart, res);

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
