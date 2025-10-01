import { useState, useEffect } from 'react';
import { Lock, Leaf } from 'lucide-react';
import { 
  type CartItem,
  getCartItems,
  updateCartItemQuantity,
  removeFromCart,
  subscribeToCart,
  getCartCount
} from '../utils/cartManager';

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [packageProtection, setPackageProtection] = useState(true);
  const protectionPrice = 493.45;

  // Subscribe to cart changes
  useEffect(() => {
    setItems(getCartItems());
    const unsubscribe = subscribeToCart((updatedItems) => {
      setItems(updatedItems);
    });
    return unsubscribe;
  }, []);

  const handleUpdateQuantity = (id: number, size: string, delta: number) => {
    updateCartItemQuantity(id, size, delta);
  };

  const handleRemoveItem = (id: number, size: string) => {
    removeFromCart(id, size);
  };

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal + (packageProtection ? protectionPrice : 0);
  const totalItems = getCartCount();

  return (
    <div className="min-h-screen bg-white pt-24 pb-12 ">
      <div className="max-w-7xl mx-auto px-7.5 sm:px-6 lg:px-8">
        {/* Page Title */}
        <h1 className="text-3xl font-normal mb-8">My Bag</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Cart Items */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-sm font-semibold tracking-wider mb-4">ORDER SUMMARY</h2>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">Your cart is empty</p>
                <button className="px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors">
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-8 ">
                {items.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="border-b border-gray-200 pb-8">
                    <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
                      {/* Product Image */}
                      <div className="w-full sm:max-w-48 sm:max-h-48 bg-gray-100 ">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4">
                          <div>
                            <h3 className="font-medium tracking-wide mb-1 sm:mb-2 break-words leading-tight text-[12px]">
                              {item.name.toUpperCase()}
                            </h3>
                            <p className="text-gray-600 text-[12px]">
                              {item.size}
                            </p>
                          </div>
                          <p className="text-[14px] sm:text-lg font-normal mt-2 sm:mt-0">
                            LE {(item.price * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>

                        {/* Remove Button (hidden on sm and below) */}
                        <button 
                          onClick={() => handleRemoveItem(item.id, item.size)}
                          className="hidden sm:block text-sm underline hover:no-underline mb-4"
                        >
                          REMOVE
                        </button>

                        {/* Quantity Controls (hidden on sm and below) */}
                        <div className="hidden sm:flex items-center border border-gray-300 w-fit">
                          <button 
                            onClick={() => handleUpdateQuantity(item.id, item.size, -1)}
                            className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 transition-colors border-r border-gray-300"
                          >
                            -
                          </button>
                          <div className="w-12 h-12 flex items-center justify-center font-medium">
                            {item.quantity}
                          </div>
                          <button 
                            onClick={() => handleUpdateQuantity(item.id, item.size, 1)}
                            className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 transition-colors border-l border-gray-300"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Order Summary & Checkout */}
          <div className="lg:col-span-1  flex justify-center w-full min-w-0">
            <div className="sticky top-24 w-full max-w-[388px] mx-auto px-4">
              {/* Total Summary */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{totalItems} ITEMS</p>
                    <p className="max:text-2xl font-medium">TOTAL</p>
                  </div>
                  <p className="max:text-3xl font-medium">
                    LE {total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>

                {/* Checkout Buttons */}
                <div className="space-y-3">
                  <button className="w-full py-4 bg-black text-white text-sm font-medium tracking-wider hover:bg-gray-800 transition-colors">
                    Check out
                  </button>
                  
                  <button className="w-full py-4 bg-[#5A31F4] text-white text-sm font-medium tracking-wider hover:bg-[#4A21D4] transition-colors flex items-center justify-center gap-2">
                    <svg viewBox="0 0 40 40" className="w-16 h-6">
                      <path fill="white" d="M28.5 14.1c-.5.2-.9.6-1.1 1.1l-1.4 3.4c-.2.5-.7.8-1.2.8h-4.5c-.6 0-1 .4-1 1s.4 1 1 1h4.5c1.4 0 2.6-.9 3.1-2.2l1.4-3.4c.1-.2.1-.4 0-.6-.2-.6-.9-.9-1.8-1.1zm-15.8 5.6h6.6c.6 0 1-.4 1-1s-.4-1-1-1h-6.6c-.6 0-1 .4-1 1s.5 1 1 1z"/>
                    </svg>
                  </button>

                  <button className="w-full py-4 bg-black text-white text-sm font-medium tracking-wider hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                    <svg viewBox="0 0 41 17" className="w-12 h-5">
                      <g fill="white">
                        <path d="M19.526 2.635v4.083h2.518c.6 0 1.096-.202 1.488-.605.403-.402.605-.882.605-1.437 0-.544-.202-1.018-.605-1.422-.392-.413-.888-.62-1.488-.62h-2.518zm0 5.52v4.736h-1.504V1.198h4.022c1.033 0 1.898.364 2.596 1.1.7.738 1.05 1.63 1.05 2.716 0 1.076-.35 1.963-1.05 2.716-.698.738-1.563 1.1-2.596 1.1h-2.518z"/>
                        <path d="M35.495 7.31c0-.8-.164-1.456-.493-1.966-.328-.51-.793-.764-1.394-.764-.6 0-1.066.254-1.394.764-.328.51-.493 1.166-.493 1.966 0 .8.165 1.456.493 1.966.328.51.793.764 1.394.764.6 0 1.066-.254 1.394-.764.329-.51.493-1.166.493-1.966zm1.51 0c0 1.304-.406 2.36-1.216 3.167-.81.807-1.863 1.21-3.158 1.21-1.295 0-2.348-.403-3.158-1.21-.81-.807-1.216-1.863-1.216-3.167 0-1.304.406-2.36 1.216-3.167.81-.807 1.863-1.21 3.158-1.21 1.295 0 2.348.403 3.158 1.21.81.807 1.216 1.863 1.216 3.167z"/>
                      </g>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Package Protection */}
              <div className="border border-gray-200 p-4 mb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <Lock size={20} className="text-gray-600 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-sm mb-1">
                        Package Protection - LE {protectionPrice.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-600 mb-2">
                        Against loss, theft, or damage in transit and instant resolution with Swap.
                      </p>
                      <button className="text-xs underline hover:no-underline">
                        Learn More
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => setPackageProtection(!packageProtection)}
                    className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${
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
        </div>
      </div>
    </div>
  );
}