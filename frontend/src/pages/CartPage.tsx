import { useState, useEffect } from 'react';
import { Lock, Leaf, Minus, Plus, X } from 'lucide-react'; 
import { Link } from 'react-router-dom';
import { 
  type CartItem,
  getCartItems,
  updateCartItemQuantity,
  removeFromCart,
  subscribeToCart,
  fetchCart,
  //getCartCount
} from '../utils/cartManager';

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [packageProtection, setPackageProtection] = useState(true);
  const protectionPrice = 493.45;

  useEffect(() => {
    fetchCart(); 

    setItems(getCartItems());
    const unsubscribe = subscribeToCart((updatedItems) => {
      setItems(updatedItems);
    });
    return unsubscribe;
  }, []);

  const handleUpdateQuantity = (productId: string, size: string, material: string, delta: number) => {
    updateCartItemQuantity(productId, size, material, delta);
  };

  const handleRemoveItem = (productId: string, size: string, material: string) => {
    removeFromCart(productId, size, material);
  };

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal + (packageProtection ? protectionPrice : 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-7.5 sm:px-6 lg:px-8">
        {/* Page Title */}
        <h1 className="text-3xl font-bold font-[Karla] tracking-wide uppercase mb-8">
          Your Cart ({totalItems})
        </h1>

        {totalItems === 0 ? (
          <div className="text-center p-20 border border-gray-200">
            <h2 className="text-xl font-medium text-gray-700">Your cart is empty.</h2>
            <p className="mt-2 text-gray-500">Add some items to get started!</p>
            <a href="/products">
              <button className="mt-6 bg-black text-white px-6 py-3 text-sm font-medium tracking-wider hover:bg-gray-800 transition-colors">
                SHOP NOW
              </button>
            </a>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-12">
            {/* Left Column: Cart Items */}
            <div className="md:col-span-2">
              <div className="divide-y divide-gray-200 border-t border-b border-gray-200">
                {items.map((item) => (
                  // Key now includes variant details for uniqueness
                  <div key={`${item.productId}-${item.size}-${item.material}`} className="flex items-center py-6">
                    {/* Item Image */}
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover mr-6 rounded-lg"
                    />
                    
                    {/* Item Details */}
                    <div className="flex-grow">
                      <h2 className="font-semibold text-lg">{item.name}</h2>
                      <p className="text-sm text-gray-500 mt-1">Size: {item.size}</p>
                      <p className="text-sm text-gray-500">Material: {item.material}</p>
                      <p className="font-bold text-lg mt-2">LE {item.price.toFixed(2)}</p>
                    </div>

                    {/* Quantity Controls and Price */}
                    <div className="flex flex-col items-center ml-4">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-gray-300 rounded-full h-8 overflow-hidden mb-2">
                        <button 

                            onClick={() => handleUpdateQuantity(item.productId, item.size, item.material, -1)}
                            disabled={item.quantity <= 1}
                            className="p-2 h-full disabled:opacity-50 hover:bg-gray-100 transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-4 text-sm font-medium">{item.quantity}</span>
                        <button 
                            onClick={() => handleUpdateQuantity(item.productId, item.size, item.material, 1)}
                            className="p-2 h-full hover:bg-gray-100 transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button 
                          onClick={() => handleRemoveItem(item.productId, item.size, item.material)}
                          className="text-xs text-red-600 hover:text-red-800 transition-colors flex items-center gap-1"
                      >
                         <X size={12} /> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="md:col-span-1 space-y-6">
              <div className="bg-gray-50 p-6">
                <h2 className="text-xl font-bold mb-6 font-[Karla] tracking-wide uppercase">
                  Order Summary
                </h2>

                {/* Subtotal */}
                <div className="flex justify-between text-lg font-medium mb-3">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>LE {subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>

                {/* Shipping */}
                <div className="flex justify-between text-sm text-gray-600 mb-4 pb-4 border-b">
                  <span>Shipping</span>
                  <span>FREE</span>
                </div>

                {/* Package Protection Toggle */}
                <div className="border border-gray-200 p-4 mb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-grow pr-4">
                      <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <Lock size={18} className="text-white" />
                      </div>
                      <div>
                        <span className="text-sm font-semibold">Package Protection</span>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Protects your order against loss, theft, and damage during shipment.
                          <br />
                          <span className="font-bold text-gray-800">LE {protectionPrice.toFixed(2)}</span>
                        </p>
                        <button className="text-xs underline hover:no-underline">
                          Learn More
                        </button>
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
                <div className="border border-gray-200 p-4 flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center">
                      <Leaf size={18} className="text-green-600" />
                    </div>
                    <span className="text-sm font-semibold">100% Carbon Neutral Shipping</span>
                  </div>
                  <div className="text-sm font-bold">Swap</div>
                </div>

                {/* Total */}
                <div className="flex justify-between text-xl font-bold mb-6 border-t border-gray-300 pt-4">
                  <span>TOTAL</span>
                  <span>LE {total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>

                {/* Checkout Button */}
               <Link to="/checkout"> 
                  <button className="w-full py-4 bg-black text-white text-sm font-medium tracking-wider hover:bg-gray-800 transition-colors">
                    CHECK OUT
                  </button> 
                </Link>


                <div className="text-center pt-3">
                  <button className="text-sm underline hover:no-underline text-gray-600">
                    Loyalty Scheme
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
