import { useState, useEffect } from 'react';
import { Minus, Plus, Lock, Leaf, X } from 'lucide-react'; // Added X for remove
import { 
  type CartItem,
  getCartItems,
  updateCartItemQuantity,
  removeFromCart,
  subscribeToCart,
  fetchCart,
  getCartSubtotal
} from '../utils/cartManager';
import { Link } from 'react-router-dom';

interface ShoppingCartPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onCartUpdate?: (count: number) => void;
}

export default function ShoppingCartPanel({ 
  isOpen, 
  onClose, 
  onCartUpdate
}: ShoppingCartPanelProps) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false); 
  const [packageProtection, setPackageProtection] = useState(true);
  const protectionPrice = 493.76;

  useEffect(() => {
    const loadCart = async () => {
        setLoading(true);
        await fetchCart();
        setItems(getCartItems());
        setLoading(false);
    };

    if (isOpen) {
        loadCart();
    } else {
        setItems(getCartItems());
    }

    const unsubscribe = subscribeToCart((updatedItems) => {
      setItems(updatedItems);
    });

    return unsubscribe;
  }, [isOpen]); 

  useEffect(() => {
    if (onCartUpdate) {
      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
      onCartUpdate(totalItems);
    }
  }, [items, onCartUpdate]);

  const handleUpdateQuantity = (item: CartItem, delta: number) => {

    updateCartItemQuantity(item.productId, item.size, item.material, delta);
  };

  const handleRemoveItem = (productId: string, size: string, material: string) => {
    removeFromCart(productId, size, material);
  };

  const subtotal = getCartSubtotal();
  const total = subtotal + (packageProtection ? protectionPrice : 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div
      className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0 animate-slide-in' : 'translate-x-full'
      }`}
      style={{ willChange: 'transform' }}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold font-[Karla] tracking-wide uppercase">
            SHOPPING BAG ({totalItems})
          </h2>
          <button onClick={onClose} className="p-2 -mr-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Loading State */}
        {loading && (
             <div className="flex-grow flex items-center justify-center text-gray-500">
                Loading cart...
            </div>
        )}

        {/* Cart Content (Items) */}
        {!loading && (
          <div className="flex-grow overflow-y-auto p-6 space-y-6">
            {items.length === 0 ? (
              <div className="text-center pt-10 text-gray-500">
                Your shopping bag is empty.
              </div>
            ) : (
              items.map((item) => (
                <div key={`${item.productId}-${item.size}-${item.material}`} className="flex items-start">
                  {/* Item Image */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover mr-4 rounded-lg flex-shrink-0"
                  />

                  {/* Item Details */}
                  <div className="flex-grow">
                    <h3 className="text-sm font-semibold">{item.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Size: {item.size}</p>
                    <p className="text-xs text-gray-500">Material: {item.material}</p>
                    <p className="font-medium text-sm mt-1">LE {item.price.toFixed(2)}</p>

                    {/* Quantity Selector and Remove */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-gray-300 rounded-full h-7 overflow-hidden">
                        <button 
                            // 🎯 PASS all variant identifiers
                            onClick={() =>handleUpdateQuantity(item, -1)}
                            // disabled={item.quantity <= 1}
                            className="p-1.5 h-full disabled:opacity-50 hover:bg-gray-100 transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-3 text-xs font-medium">{item.quantity}</span>
                        <button 
                            // 🎯 PASS all variant identifiers
                            onClick={() => handleUpdateQuantity(item, +1)}
                            className="p-1.5 h-full hover:bg-gray-100 transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <button 
                          onClick={() => handleRemoveItem(item.productId, item.size, item.material)}
                          className="text-xs text-red-600 hover:text-red-800 transition-colors underline"
                      >
                         Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Loyalty/Protection/Shipping Blocks (Simplified for Panel) */}
            <div className='pt-4 space-y-3'>
                 {/* Package Protection Toggle */}
                <div className="border border-gray-200 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-grow pr-4">
                      <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <Lock size={18} className="text-white" />
                      </div>
                      <div>
                        <span className="text-sm font-semibold">Package Protection</span>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Protects your order for <span className='font-bold'>LE {protectionPrice.toFixed(2)}</span>
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setPackageProtection(!packageProtection)}
                      className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 mt-1 ${
                        packageProtection ? 'bg-gray-800' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        packageProtection ? 'translate-x-7' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
                 {/* Carbon Neutral Shipping */}
                <div className="border border-gray-200 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center">
                      <Leaf size={18} className="text-green-600" />
                    </div>
                    <span className="text-sm font-semibold">100% Carbon Neutral Shipping</span>
                  </div>
                  <div className="text-sm font-bold">Swap</div>
                </div>
            </div>

          </div>
        )}


        {/* Footer / Total and Buttons */}
        {!loading && totalItems > 0 && (
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
              <a href="/cart"><button className="w-full py-4 bg-white border-2 border-black text-sm font-medium tracking-wider hover:bg-gray-50 transition-colors">
                VIEW CART
              </button>
              </a>
              <Link to="/checkout">
                <button className="w-full py-4 bg-black text-white text-sm font-medium tracking-wider hover:bg-gray-800 transition-colors">
                  CHECK OUT
                </button>              
              </Link>


              <div className="text-center pt-2">
                <button className="text-sm underline hover:no-underline">
                  Loyalty Scheme
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
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
