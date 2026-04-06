// OrderConfirmationPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, Truck, CreditCard, Phone, Mail } from 'lucide-react';
import { apiFetch } from '../lib/api';

interface OrderItem {
  product: {
    _id: string;
    name: string;
  };
  name: string;
  size: string;
  material: string;
  quantity: number;
  price: number;
  image: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
  };
  subtotal: number;
  shippingCost: number;
  tax: number;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

export default function OrderConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await apiFetch(`/orders/${orderId}`);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch order');
        }

        if (data.success) {
          setOrder(data.data);
        }
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching order:', err);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-white pt-24 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">✕</div>
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'Unable to load order details'}</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-black text-white px-6 py-3 text-sm font-medium tracking-wider hover:bg-gray-800 transition-colors"
          >
            CONTINUE SHOPPING
          </button>
        </div>
      </div>
    );
  }

  const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="min-h-screen bg-white  pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold font-[Karla] tracking-wide uppercase mb-2">
            Order Confirmed!
          </h1>
          <p className="text-gray-600">Thank you for your purchase</p>
          <p className="text-sm text-gray-500 mt-2">
            Order Number: <span className="font-bold">{order.orderNumber}</span>
          </p>
          <p className="text-sm text-gray-500">
            Placed on: {orderDate}
          </p>
        </div>

        {/* Order Status */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-8">
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-semibold text-blue-900">
                Order Status: <span className="uppercase">{order.status}</span>
              </p>
              <p className="text-sm text-blue-700">
                We'll send you shipping confirmation when your items ship.
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          
          {/* Shipping Address */}
          <div className="border border-gray-200 p-6 rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              <Truck className="w-5 h-5" />
              <h2 className="text-lg font-bold font-[Karla] tracking-wide uppercase">
                Shipping Address
              </h2>
            </div>
            <div className="space-y-1 text-sm text-gray-700">
              <p className="font-semibold">{order.shippingAddress.name}</p>
              <p>{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.city}
                {order.shippingAddress.state && `, ${order.shippingAddress.state}`}
              </p>
              <p>{order.shippingAddress.zipCode}</p>
              <p>{order.shippingAddress.country}</p>
              <p className="flex items-center gap-2 mt-2">
                <Phone className="w-4 h-4" />
                {order.shippingAddress.phone}
              </p>
            </div>
          </div>

          {/* Payment Method */}
          <div className="border border-gray-200 p-6 rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5" />
              <h2 className="text-lg font-bold font-[Karla] tracking-wide uppercase">
                Payment Method
              </h2>
            </div>
            <div className="space-y-2 text-sm text-gray-700">
              <p className="font-semibold capitalize">
                {order.paymentMethod.replace('_', ' ')}
              </p>
              <p className="text-xs">
                Status: <span className={`font-semibold uppercase ${
                  order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {order.paymentStatus}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="border border-gray-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-bold font-[Karla] tracking-wide uppercase mb-6">
            Order Items
          </h2>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex gap-4 pb-4 border-b last:border-b-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-gray-600">
                    Size: {item.size} • Material: {item.material}
                  </p>
                  <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    LE {(item.price * item.quantity).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">
                    LE {item.price.toFixed(2)} each
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-lg font-bold font-[Karla] tracking-wide uppercase mb-4">
            Order Summary
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">LE {order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping</span>
              <span className="font-medium text-green-600">
                {order.shippingCost === 0 ? 'FREE' : `LE ${order.shippingCost.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax</span>
              <span className="font-medium">LE {order.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold border-t border-gray-300 pt-3 mt-3">
              <span>Total</span>
              <span>LE {order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <button
            onClick={() => navigate('/orders')}
            className="flex-1 py-3 bg-black text-white text-sm font-medium tracking-wider hover:bg-gray-800 transition-colors"
          >
            VIEW ALL ORDERS
          </button>
          <button
            onClick={() => navigate('/products')}
            className="flex-1 py-3 border-2 border-black text-black text-sm font-medium tracking-wider hover:bg-gray-50 transition-colors"
          >
            CONTINUE SHOPPING
          </button>
        </div>

        {/* Contact Support */}
        <div className="text-center mt-8 p-6 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">
            Questions about your order?
          </p>
          <a 
            href="mailto:support@mondeux.com"
            className="inline-flex items-center gap-2 text-sm font-semibold text-black hover:underline"
          >
            <Mail className="w-4 h-4" />
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
