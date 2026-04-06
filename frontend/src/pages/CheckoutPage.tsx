// CheckoutPage.tsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, CreditCard, Truck, MapPin, Phone, Mail, User, Tag } from 'lucide-react';
import { getApiErrorMessage } from '../lib/api';
import { useCartSummary, useCreateOrderMutation, useOrderPricingQuery } from '../hooks/useStoreData';
import { trackClientEvent } from '../lib/analytics';

interface ShippingAddress {
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

interface CheckoutFormData {
  shippingAddress: ShippingAddress;
  paymentMethod: 'card' | 'paypal' | 'cash_on_delivery';
  customerNotes: string;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCouponCode, setAppliedCouponCode] = useState('');
  const [formData, setFormData] = useState<CheckoutFormData>({
    shippingAddress: {
      name: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Egypt',
      phone: ''
    },
    paymentMethod: 'cash_on_delivery',
    customerNotes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const createOrderMutation = useCreateOrderMutation();
  const { items, subtotal, isPending: loading } = useCartSummary();
  const pricingQuery = useOrderPricingQuery(appliedCouponCode, items.length > 0);
  const trackedCheckoutStartRef = useRef("");

  // Redirect if cart is empty
  useEffect(() => {
    if (!loading && items.length === 0) {
      navigate('/cart');
    }
  }, [items, loading, navigate]);

  useEffect(() => {
    if (loading || items.length === 0) {
      return;
    }

    const trackingKey = `${items.length}:${subtotal}`;

    if (trackedCheckoutStartRef.current === trackingKey) {
      return;
    }

    trackedCheckoutStartRef.current = trackingKey;

    trackClientEvent({
      eventType: "checkout_started",
      metadata: {
        itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
        subtotal,
      },
    });
  }, [items, loading, subtotal]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const pricing = pricingQuery.data?.data;
  const couponResult = pricingQuery.data?.coupon;
  const hasInvalidCoupon = couponResult?.status === 'invalid';

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.shippingAddress.name.trim()) {
      newErrors.name = 'Full name is required';
    }
    if (!formData.shippingAddress.street.trim()) {
      newErrors.street = 'Street address is required';
    }
    if (!formData.shippingAddress.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!formData.shippingAddress.zipCode.trim()) {
      newErrors.zipCode = 'Zip code is required';
    }
    if (!formData.shippingAddress.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      setSubmitting(true);
      const data = await createOrderMutation.mutateAsync({
          shippingAddress: formData.shippingAddress,
          paymentMethod: formData.paymentMethod,
          customerNotes: formData.customerNotes,
          couponCode: appliedCouponCode,
      });

      if (data.success) {
        // Redirect to order confirmation
        navigate(`/order-confirmation/${data.data._id}`);
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert(getApiErrorMessage(error, 'Failed to place order. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleApplyCoupon = () => {
    setAppliedCouponCode(couponInput.trim().toUpperCase());
  };

  const handleRemoveCoupon = () => {
    setCouponInput('');
    setAppliedCouponCode('');
  };

  const updateShippingField = (field: keyof ShippingAddress, value: string) => {
    setFormData(prev => ({
      ...prev,
      shippingAddress: {
        ...prev.shippingAddress,
        [field]: value
      }
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-[Karla] tracking-wide uppercase">
            Checkout
          </h1>
          <p className="text-sm text-gray-600 mt-2">Complete your purchase</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Shipping Information */}
              <div className="bg-white border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                    <Truck size={18} className="text-white" />
                  </div>
                  <h2 className="text-xl font-bold font-[Karla] tracking-wide uppercase">
                    Shipping Information
                  </h2>
                </div>

                <div className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="inline w-4 h-4 mr-1" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.shippingAddress.name}
                      onChange={(e) => updateShippingField('name', e.target.value)}
                      className={`w-full px-4 py-3 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-black transition-colors`}
                      placeholder="John Doe"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="inline w-4 h-4 mr-1" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={formData.shippingAddress.phone}
                      onChange={(e) => updateShippingField('phone', e.target.value)}
                      className={`w-full px-4 py-3 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-black transition-colors`}
                      placeholder="+20 123 456 7890"
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>

                  {/* Street Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="inline w-4 h-4 mr-1" />
                      Street Address *
                    </label>
                    <input
                      type="text"
                      value={formData.shippingAddress.street}
                      onChange={(e) => updateShippingField('street', e.target.value)}
                      className={`w-full px-4 py-3 border ${errors.street ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-black transition-colors`}
                      placeholder="123 Main Street, Apt 4B"
                    />
                    {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street}</p>}
                  </div>

                  {/* City and State */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        value={formData.shippingAddress.city}
                        onChange={(e) => updateShippingField('city', e.target.value)}
                        className={`w-full px-4 py-3 border ${errors.city ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-black transition-colors`}
                        placeholder="Cairo"
                      />
                      {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State/Province
                      </label>
                      <input
                        type="text"
                        value={formData.shippingAddress.state}
                        onChange={(e) => updateShippingField('state', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-black transition-colors"
                        placeholder="Cairo Governorate"
                      />
                    </div>
                  </div>

                  {/* Zip Code and Country */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Zip Code *
                      </label>
                      <input
                        type="text"
                        value={formData.shippingAddress.zipCode}
                        onChange={(e) => updateShippingField('zipCode', e.target.value)}
                        className={`w-full px-4 py-3 border ${errors.zipCode ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-black transition-colors`}
                        placeholder="11511"
                      />
                      {errors.zipCode && <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country
                      </label>
                      <select
                        value={formData.shippingAddress.country}
                        onChange={(e) => updateShippingField('country', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-black transition-colors"
                      >
                        <option value="Egypt">Egypt</option>
                        <option value="UAE">UAE</option>
                        <option value="Saudi Arabia">Saudi Arabia</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                    <CreditCard size={18} className="text-white" />
                  </div>
                  <h2 className="text-xl font-bold font-[Karla] tracking-wide uppercase">
                    Payment Method
                  </h2>
                </div>

                <div className="space-y-3">
                  {/* Cash on Delivery */}
                  <label className={`flex items-center p-4 border-2 rounded cursor-pointer transition-colors ${
                    formData.paymentMethod === 'cash_on_delivery' ? 'border-black bg-gray-50' : 'border-gray-200'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash_on_delivery"
                      checked={formData.paymentMethod === 'cash_on_delivery'}
                      onChange={() => setFormData(prev => ({ ...prev, paymentMethod: 'cash_on_delivery' }))}
                      className="w-4 h-4 text-black"
                    />
                    <span className="ml-3 font-medium">Cash on Delivery</span>
                  </label>

                  {/* Credit Card */}
                  <label className={`flex items-center p-4 border-2 rounded cursor-pointer transition-colors ${
                    formData.paymentMethod === 'card' ? 'border-black bg-gray-50' : 'border-gray-200'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={formData.paymentMethod === 'card'}
                      onChange={() => setFormData(prev => ({ ...prev, paymentMethod: 'card' }))}
                      className="w-4 h-4 text-black"
                    />
                    <span className="ml-3 font-medium">Credit/Debit Card</span>
                  </label>


             
                </div>
              </div>

              {/* Order Notes */}
              <div className="bg-white border border-gray-200 p-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="inline w-4 h-4 mr-1" />
                  Order Notes (Optional)
                </label>
                <textarea
                  value={formData.customerNotes}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerNotes: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-black transition-colors resize-none"
                  placeholder="Special instructions for delivery..."
                />
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-6 font-[Karla] tracking-wide uppercase">
                  Order Summary
                </h2>

                {/* Items List */}
                <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
                  {items.map((item) => (
                    <div key={`${item.productId}-${item.size}-${item.material}`} className="flex gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-gray-500">
                          {item.size} • {item.material}
                        </p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        <p className="text-sm font-medium">LE {(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 border-t border-gray-300 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                    <span className="font-medium">LE {(pricing?.subtotal ?? subtotal).toFixed(2)}</span>
                  </div>
                  {pricing?.firstOrderDiscount ? (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">First order discount</span>
                      <span className="font-medium text-green-700">
                        -LE {pricing.firstOrderDiscount.toFixed(2)}
                      </span>
                    </div>
                  ) : null}
                  {pricing?.campaignDiscount ? (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Campaign discount</span>
                      <span className="font-medium text-green-700">
                        -LE {pricing.campaignDiscount.toFixed(2)}
                      </span>
                    </div>
                  ) : null}
                  {pricing?.couponDiscount ? (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Coupon discount</span>
                      <span className="font-medium text-green-700">
                        -LE {pricing.couponDiscount.toFixed(2)}
                      </span>
                    </div>
                  ) : null}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className={`font-medium ${(pricing?.shippingCost ?? 0) === 0 ? 'text-green-600' : ''}`}>
                      {(pricing?.shippingCost ?? 0) === 0 ? 'FREE' : `LE ${(pricing?.shippingCost ?? 0).toFixed(2)}`}
                    </span>
                  </div>
                  {pricing?.shippingDiscount ? (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping savings</span>
                      <span className="font-medium text-green-700">
                        -LE {pricing.shippingDiscount.toFixed(2)}
                      </span>
                    </div>
                  ) : null}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (14%)</span>
                    <span className="font-medium">LE {(pricing?.tax ?? 0).toFixed(2)}</span>
                  </div>
                </div>

                <div className="border border-gray-200 p-4 my-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Tag size={16} className="text-gray-600" />
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      Coupon Code
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(event) => setCouponInput(event.target.value)}
                      placeholder="Enter coupon"
                      className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm uppercase focus:outline-none focus:border-black transition-colors"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="rounded bg-black px-4 py-2 text-xs font-semibold tracking-wider text-white transition hover:bg-gray-800"
                    >
                      Apply
                    </button>
                  </div>
                  {appliedCouponCode ? (
                    <div className={`rounded border px-3 py-2 text-xs ${
                      hasInvalidCoupon
                        ? 'border-red-200 bg-red-50 text-red-700'
                        : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    }`}>
                      <div className="flex items-center justify-between gap-3">
                        <span>{couponResult?.message || `Coupon ${appliedCouponCode} applied`}</span>
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="font-semibold underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : null}
                  <p className="text-xs text-gray-500">
                    Coupons, campaign discounts, free shipping thresholds, and first-order discounts are calculated automatically.
                  </p>
                </div>

                {/* Carbon Neutral */}
                <div className="border border-gray-200 p-3 flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Leaf size={16} className="text-green-600" />
                    <span className="text-xs font-semibold">Carbon Neutral Shipping</span>
                  </div>
                </div>

                <div className="mb-6 rounded border border-dashed border-gray-300 bg-white p-3 text-xs text-gray-600">
                  {pricing && pricing.amountToFreeShipping > 0
                    ? `Add LE ${pricing.amountToFreeShipping.toFixed(2)} more to unlock free shipping.`
                    : 'Free shipping threshold reached.'}
                </div>

                {pricing?.appliedPromotions.length ? (
                  <div className="mb-6 rounded border border-gray-200 bg-white p-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Applied Promotions
                    </p>
                    <div className="mt-3 space-y-2">
                      {pricing.appliedPromotions.map((promotion, index) => (
                        <div key={`${promotion.name}-${index}`} className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">
                            {promotion.name}
                            {promotion.code ? ` (${promotion.code})` : ''}
                          </span>
                          <span className="font-medium text-green-700">
                            -LE {promotion.amount.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Total */}
                <div className="flex justify-between text-xl font-bold border-t border-gray-300 pt-4 mb-6">
                  <span>TOTAL</span>
                  <span>LE {(pricing?.totalAmount ?? subtotal).toFixed(2)}</span>
                </div>

                {/* Place Order Button */}
                <button
                  type="submit"
                  disabled={submitting || pricingQuery.isPending || hasInvalidCoupon || !pricing}
                  className="w-full py-4 bg-black text-white text-sm font-medium tracking-wider hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {submitting ? 'PLACING ORDER...' : pricingQuery.isPending ? 'CALCULATING...' : 'PLACE ORDER'}
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  By placing your order, you agree to our terms and conditions
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
