import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Leaf, Truck, CreditCard, Wallet, Check, MapPin, Phone, User } from 'lucide-react';
import { useStore } from '@/stores/useStore';
import { toast } from 'sonner';
import { api } from '@/lib/api';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, cartTotal, addOrder, clearCart, user } = useStore();
  const [step, setStep] = useState<'address' | 'payment'>('address');
  const [isPlacing, setIsPlacing] = useState(false);

  const [address, setAddress] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('upi');

  const deliveryFee = cartTotal() > 999 ? 0 : 49;
  const discount = Math.round(cartTotal() * 0.1);
  const total = cartTotal() + deliveryFee - discount;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a201d] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#fffefa] mb-4">Your cart is empty</h2>
          <Link to="/products" className="btn-primary">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    if (step === 'address') {
      if (!address.name || !address.phone || !address.address || !address.city || !address.pincode) {
        toast.error('Please fill in all address fields');
        return;
      }
      setStep('payment');
      return;
    }

    const fullAddress = `${address.address}, ${address.city}, ${address.state} - ${address.pincode}`;

    if (paymentMethod === 'upi') {
      // Real Stripe checkout
      setIsPlacing(true);
      try {
        const items = cart.map((c) => ({
          id: c.id,
          name: c.name,
          price: c.price,
          image: c.image,
          color: c.color,
          size: c.size,
          material: c.material,
          quantity: c.quantity,
          isCustom: c.isCustom || false,
          designData: c.designData || null,
        }));
        const res = await api<{ url: string; session_id: string }>(`/checkout/session`, {
          method: 'POST',
          auth: true,
          body: {
            items,
            origin_url: window.location.origin,
            address: fullAddress,
          },
        });
        // Redirect to Stripe-hosted checkout
        window.location.href = res.url;
      } catch (e) {
        setIsPlacing(false);
        toast.error((e as Error).message || 'Could not start checkout');
      }
      return;
    }

    // Cash on Delivery — local order (mock for now)
    setIsPlacing(true);
    setTimeout(() => {
      const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;
      addOrder({
        id: orderId,
        items: [...cart],
        total,
        status: 'confirmed',
        date: new Date().toISOString().split('T')[0],
        deliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        address: fullAddress,
        trackingNumber: `ECO${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      });
      clearCart();
      setIsPlacing(false);
      toast.success(`Order ${orderId} placed successfully!`);
      navigate('/dashboard');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#0a201d] pt-8 pb-16">
      <div className="max-w-[1440px] mx-auto section-padding">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Link to="/cart" className="text-sm text-white/50 hover:text-[#83f0c7]">Cart</Link>
            <ArrowRight className="w-4 h-4 text-white/30" />
            <span className="text-sm text-[#83f0c7]">Checkout</span>
          </div>
          <h1 className="text-3xl font-bold text-[#fffefa]">Checkout</h1>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-4 mb-8">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${step === 'address' ? 'bg-[#1d4c43] text-[#83f0c7]' : 'bg-white/5 text-white/60'}`}>
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-medium">Address</span>
          </div>
          <div className="flex-1 h-0.5 bg-white/10" />
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${step === 'payment' ? 'bg-[#1d4c43] text-[#83f0c7]' : 'bg-white/5 text-white/60'}`}>
            <CreditCard className="w-4 h-4" />
            <span className="text-sm font-medium">Payment</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {step === 'address' ? (
              <div className="glass-card p-6 rounded-xl">
                <h3 className="text-lg font-bold text-[#fffefa] mb-6 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#83f0c7]" />
                  Delivery Address
                </h3>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/60 mb-2">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input
                        type="text"
                        value={address.name}
                        onChange={(e) => setAddress({ ...address, name: e.target.value })}
                        placeholder="John Doe"
                        className="w-full h-11 pl-10 pr-4 bg-white/5 border border-white/10 rounded-lg text-sm text-[#fffefa] placeholder:text-white/30 focus:outline-none focus:border-[#83f0c7]/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-white/60 mb-2">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input
                        type="tel"
                        value={address.phone}
                        onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full h-11 pl-10 pr-4 bg-white/5 border border-white/10 rounded-lg text-sm text-[#fffefa] placeholder:text-white/30 focus:outline-none focus:border-[#83f0c7]/50"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs text-white/60 mb-2">Address</label>
                    <textarea
                      value={address.address}
                      onChange={(e) => setAddress({ ...address, address: e.target.value })}
                      placeholder="Street address, apartment, building..."
                      rows={3}
                      className="w-full p-4 bg-white/5 border border-white/10 rounded-lg text-sm text-[#fffefa] placeholder:text-white/30 focus:outline-none focus:border-[#83f0c7]/50 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-white/60 mb-2">City</label>
                    <input
                      type="text"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      placeholder="Mumbai"
                      className="w-full h-11 px-4 bg-white/5 border border-white/10 rounded-lg text-sm text-[#fffefa] placeholder:text-white/30 focus:outline-none focus:border-[#83f0c7]/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-white/60 mb-2">State</label>
                    <input
                      type="text"
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      placeholder="Maharashtra"
                      className="w-full h-11 px-4 bg-white/5 border border-white/10 rounded-lg text-sm text-[#fffefa] placeholder:text-white/30 focus:outline-none focus:border-[#83f0c7]/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-white/60 mb-2">PIN Code</label>
                    <input
                      type="text"
                      value={address.pincode}
                      onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                      placeholder="400001"
                      className="w-full h-11 px-4 bg-white/5 border border-white/10 rounded-lg text-sm text-[#fffefa] placeholder:text-white/30 focus:outline-none focus:border-[#83f0c7]/50"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Address Summary */}
                <div className="glass-card p-5 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-[#fffefa]">Delivery Address</h3>
                    <button onClick={() => setStep('address')} className="text-xs text-[#83f0c7] hover:underline">Change</button>
                  </div>
                  <p className="text-sm text-white/60">{address.name}</p>
                  <p className="text-sm text-white/60">{address.phone}</p>
                  <p className="text-sm text-white/60">{address.address}, {address.city}, {address.state} - {address.pincode}</p>
                </div>

                {/* Payment Methods */}
                <div className="glass-card p-6 rounded-xl">
                  <h3 className="text-lg font-bold text-[#fffefa] mb-6 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-[#83f0c7]" />
                    Payment Method
                  </h3>

                  <div className="space-y-3">
                    <button
                      onClick={() => setPaymentMethod('cod')}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                        paymentMethod === 'cod'
                          ? 'border-[#83f0c7]/30 bg-[#1d4c43]/30'
                          : 'border-white/10 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-[#83f0c7]' : 'border-white/30'}`}>
                        {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 rounded-full bg-[#83f0c7]" />}
                      </div>
                      <Wallet className="w-5 h-5 text-white/60" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-[#fffefa]">Cash on Delivery</p>
                        <p className="text-xs text-white/50">Pay when you receive</p>
                      </div>
                    </button>

                    <button
                      onClick={() => setPaymentMethod('upi')}
                      data-testid="payment-method-card"
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                        paymentMethod === 'upi'
                          ? 'border-[#83f0c7]/30 bg-[#1d4c43]/30'
                          : 'border-white/10 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'upi' ? 'border-[#83f0c7]' : 'border-white/30'}`}>
                        {paymentMethod === 'upi' && <div className="w-2.5 h-2.5 rounded-full bg-[#83f0c7]" />}
                      </div>
                      <CreditCard className="w-5 h-5 text-white/60" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-[#fffefa]">Card / UPI <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-[#83f0c7]/20 text-[#83f0c7] rounded">via Stripe</span></p>
                        <p className="text-xs text-white/50">Secure checkout · Test mode</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-4">
              <div className="glass-card p-5 rounded-xl">
                <h3 className="text-lg font-bold text-[#fffefa] mb-4">Order Summary</h3>

                {/* Items */}
                <div className="space-y-3 mb-4 max-h-48 overflow-auto">
                  {cart.map((item) => (
                    <div key={`${item.id}-${item.color}-${item.size}`} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/5 shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#fffefa] truncate">{item.name}</p>
                        <p className="text-xs text-white/50">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium text-[#83f0c7]">₹{item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/10 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Subtotal</span>
                    <span className="text-[#fffefa]">₹{cartTotal()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60 flex items-center gap-1">
                      <Leaf className="w-3 h-3 text-[#83f0c7]" />
                      Eco Discount
                    </span>
                    <span className="text-[#83f0c7]">-₹{discount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60 flex items-center gap-1">
                      <Truck className="w-3 h-3" />
                      Delivery
                    </span>
                    <span className={deliveryFee === 0 ? 'text-[#83f0c7]' : 'text-[#fffefa]'}>
                      {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                    </span>
                  </div>
                  <div className="border-t border-white/10 pt-2">
                    <div className="flex justify-between">
                      <span className="text-base font-bold text-[#fffefa]">Total</span>
                      <span className="text-xl font-bold text-[#83f0c7]">₹{total}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={isPlacing}
                  data-testid="checkout-place-order-button"
                  className="w-full mt-6 btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isPlacing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Placing Order...
                    </>
                  ) : step === 'address' ? (
                    <>
                      Continue
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Place Order
                    </>
                  )}
                </button>

                <p className="text-xs text-white/40 text-center mt-3">
                  By placing this order, you agree to our eco-friendly shipping practices
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
