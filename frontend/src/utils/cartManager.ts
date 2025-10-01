export interface CartItem {
  id: number;
  name: string;
  size: string;
  price: number;
  quantity: number;
  image: string;
}

// Storage key for localStorage
const CART_STORAGE_KEY = 'shopping_cart';

// Load cart from localStorage on initialization
const loadCartFromStorage = (): CartItem[] => {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading cart from storage:', error);
    return [];
  }
};

// Save cart to localStorage
const saveCartToStorage = (items: CartItem[]) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Error saving cart to storage:', error);
  }
};

// Global cart state - initialize from localStorage
let globalCartItems: CartItem[] = loadCartFromStorage();
let globalCartListeners: ((items: CartItem[]) => void)[] = [];

/**
 * Add an item to the cart
 * If item already exists with same id and size, increase quantity
 */
export const addToCart = (product: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
  const existingItemIndex = globalCartItems.findIndex(item => 
    item.id === product.id && item.size === product.size
  );

  if (existingItemIndex > -1) {
    // Update quantity if item exists
    globalCartItems[existingItemIndex].quantity += quantity;
  } else {
    // Add new item
    globalCartItems.push({ ...product, quantity });
  }

  // Notify all listeners
  notifyListeners();
};

/**
 * Update the quantity of a specific cart item
 */
export const updateCartItemQuantity = (id: number, size: string, delta: number) => {
  const itemIndex = globalCartItems.findIndex(item => 
    item.id === id && item.size === size
  );

  if (itemIndex > -1) {
    globalCartItems[itemIndex].quantity = Math.max(1, globalCartItems[itemIndex].quantity + delta);
    notifyListeners();
  }
};

/**
 * Remove an item from the cart
 */
export const removeFromCart = (id: number, size: string) => {
  globalCartItems = globalCartItems.filter(item => 
    !(item.id === id && item.size === size)
  );
  notifyListeners();
};

/**
 * Get all cart items
 */
export const getCartItems = (): CartItem[] => {
  return [...globalCartItems];
};

/**
 * Get total number of items in cart
 */
export const getCartCount = (): number => {
  return globalCartItems.reduce((sum, item) => sum + item.quantity, 0);
};

/**
 * Get cart subtotal
 */
export const getCartSubtotal = (): number => {
  return globalCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
};

/**
 * Clear all items from cart
 */
export const clearCart = () => {
  globalCartItems = [];
  notifyListeners();
};

/**
 * Subscribe to cart changes
 * Returns unsubscribe function
 */
export const subscribeToCart = (listener: (items: CartItem[]) => void): (() => void) => {
  globalCartListeners.push(listener);
  
  // Return unsubscribe function
  return () => {
    globalCartListeners = globalCartListeners.filter(l => l !== listener);
  };
};

/**
 * Initialize cart with items (useful for loading from storage)
 */
export const initializeCart = (items: CartItem[]) => {
  globalCartItems = [...items];
  notifyListeners();
};

/**
 * Notify all listeners of cart changes
 */
const notifyListeners = () => {
  saveCartToStorage(globalCartItems);
  globalCartListeners.forEach(listener => listener([...globalCartItems]));
};