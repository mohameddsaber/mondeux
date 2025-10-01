import { useState, useEffect } from 'react';
import { Minus, Plus, Lock, Leaf, ShoppingBag } from 'lucide-react';

export interface CartItem {
  id: number;
  name: string;
  size: string;
  price: number;
  quantity: number;
  image: string;
}

interface ShoppingCartPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onCartUpdate?: (count: number) => void;
  initialItems?: CartItem[];
}

// This will be used to manage cart state globally
let globalCartItems: CartItem[] = [];
let globalCartListeners: ((items: CartItem[]) => void)[] = [];

// Helper functions to manage cart globally
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
  globalCartListeners.forEach(listener => listener([...globalCartItems]));
};

export const getCartItems = () => [...globalCartItems];

export const getCartCount = () => globalCartItems.reduce((sum, item) => sum + item.quantity, 0);

export const clearCart = () => {
  globalCartItems = [];
  globalCartListeners.forEach(listener => listener([]));
};

export default function ShoppingCartPanel({ 
  isOpen, 
  onClose, 
  onCartUpdate,
  initialItems = []
}: ShoppingCartPanelProps) {
  const [items, setItems] = useState<CartItem[]>(initialItems);
  const [packageProtection, setPackageProtection] = useState(true);
  const protectionPrice = 493.76;

  // Subscribe to global cart changes
  useEffect(() => {
    const listener = (updatedItems: CartItem[]) => {
      setItems(updatedItems);
    };
    globalCartListeners.push(listener);

    // Initialize with global items if available
    if (globalCartItems.length > 0) {
      setItems([...globalCartItems]);
    } else if (initialItems.length > 0) {
      globalCartItems = [...initialItems];
    }

    return () => {
      globalCartListeners = globalCartListeners.filter(l => l !== listener);
    };
  }, []);

  // Update parent component when cart items change
  useEffect(() => {
    if (onCartUpdate) {
      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
      onCartUpdate(totalItems);
    }
  }, [items, onCartUpdate]);

  const updateQuantity = (id: number, size: string, delta: number) => {
    const newItems = items.map(item => 
      item.id === id && item.size === size
        ? { ...item, quantity: Math.max(1, item.quantity + delta) }
        : item
    );
    setItems(newItems);
    globalCartItems = newItems;
    globalCartListeners.forEach(listener => listener([...newItems]));
  };

  const removeItem = (id: number, size: string) => {
    const newItems = items.filter(item => !(item.id === id && item.size === size));
    setItems(newItems);
    globalCartItems = newItems;
    globalCartListeners.forEach(listener => listener([...newItems]));
  };

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal + (packageProtection ? protectionPrice : 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="flex-1 bg-black/30 transition-opacity"
        onClick={onClose}
      />
      
      {/* Cart Panel */}
      <div className="w-full max-w-md bg-white h-full overflow-y-auto flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-sm font-medium tracking-wider">REVIEW SHOPPING BAG</h2>
          <button 
            onClick={onClose}
            className="text-sm hover:text-gray-600 transition-colors tracking-wider"
          >
            CLOSE
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
              <p className="text-gray-600 text-sm mb-6">Add items to get started</p>
              <button 
                onClick={onClose}
                className="px-6 py-3 bg-black text-white text-sm tracking-wider hover:bg-gray-800 transition-colors"
              >
                CONTINUE SHOPPING
              </button>
            </div>
          ) : (
            <>
              {items.map((item) => (
                <div key={`${item.id}-${item.size}`} className="p-6 border-b border-gray-200">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="w-20 h-20 bg-gray-100 rounded flex-shrink-0">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-medium tracking-wider mb-2">
                        {item.name}
                      </h3>
                      <p className="text-xs text-gray-600 mb-2">{item.size}</p>
                      <button 
                        onClick={() => removeItem(item.id, item.size)}
                        className="text-xs underline hover:no-underline"
                      >
                        REMOVE
                      </button>
                    </div>
                  </div>

                  {/* Quantity and Price */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border border-gray-300">
                      <button 
                        onClick={() => updateQuantity(item.id, item.size, -1)}
                        className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <input 
                        type="text" 
                        value={item.quantity}
                        readOnly
                        className="w-16 h-10 text-center border-x border-gray-300 text-sm"
                      />
                      <button 
                        onClick={() => updateQuantity(item.id, item.size, 1)}
                        className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <p className="text-sm font-medium">
                      LE {(item.price * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              ))}

              {/* Package Protection */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-50 rounded flex items-center justify-center flex-shrink-0">
                    <Lock size={20} className="text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xs font-medium mb-1">
                          Package Protection - LE {protectionPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </h3>
                        <p className="text-xs text-gray-600 mb-2">
                          Against loss, theft, or damage in transit and instant resolution with Swap.
                        </p>
                        <button className="text-xs underline hover:no-underline">
                          LEARN MORE
                        </button>
                      </div>
                      <button
                        onClick={() => setPackageProtection(!packageProtection)}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          packageProtection ? 'bg-gray-800' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          packageProtection ? 'translate-x-7' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Carbon Neutral Shipping */}
              <div className="p-6 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                      <Leaf size={20} className="text-green-600" />
                    </div>
                    <span className="text-sm font-medium">100% Carbon Neutral Shipping</span>
                  </div>
                  <div className="px-3 py-1 bg-white rounded text-xs font-medium">
                    Swap
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 p-6 bg-white">
            {/* Total */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium tracking-wider">TOTAL</h3>
              <p className="text-2xl font-medium">
                LE {total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              <button className="w-full py-4 bg-white border-2 border-black text-sm font-medium tracking-wider hover:bg-gray-50 transition-colors">
                VIEW CART
              </button>
              <button className="w-full py-4 bg-black text-white text-sm font-medium tracking-wider hover:bg-gray-800 transition-colors">
                CHECK OUT
              </button>
              <div className="text-center pt-2">
                <button className="text-sm underline hover:no-underline">
                  Loyalty Scheme
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}