import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Minus, Plus, Trash2, Leaf, ArrowRight, Shield, Truck, Package } from 'lucide-react';
import { useStore } from '@/stores/useStore';
import { toast } from 'sonner';

export default function CartPage() {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useStore();

  const deliveryFee = cartTotal() > 999 ? 0 : 49;
  const discount = Math.round(cartTotal() * 0.1); // 10% eco discount
  const total = cartTotal() + deliveryFee - discount;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a201d] flex items-center justify-center pt-8 pb-16">
        <div className="text-center">
          <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-12 h-12 text-white/20" />
          </div>
          <h2 className="text-2xl font-bold text-[#fffefa] mb-2">Your cart is empty</h2>
          <p className="text-sm text-white/50 mb-6">Looks like you have not added any eco-friendly tees yet</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/products" className="btn-primary" data-testid="continue-shopping-button">Continue Shopping</Link>
            <Link to="/design-studio" className="btn-secondary">Create Custom Design</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a201d] pt-8 pb-16">
      <div className="max-w-[1440px] mx-auto section-padding">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Link to="/" className="text-sm text-white/50 hover:text-[#83f0c7]">Home</Link>
            <ArrowRight className="w-4 h-4 text-white/30" />
            <span className="text-sm text-[#83f0c7]">Shopping Cart</span>
          </div>
          <h1 className="text-3xl font-bold text-[#fffefa]">Shopping Cart ({cart.length} items)</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={`${item.id}-${item.color}-${item.size}`}
                className="glass-card p-4 rounded-xl flex gap-4"
              >
                {/* Image */}
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-white/5 shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm sm:text-base font-semibold text-[#fffefa] truncate">{item.name}</h3>
                      {item.isCustom && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#83f0c7]/10 text-[#83f0c7] text-xs rounded-full mt-1">
                          <Leaf className="w-3 h-3" />
                          Custom Design
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        removeFromCart(item.id, item.color, item.size);
                        toast.success('Item removed from cart');
                      }}
                      className="p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-all shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mt-2 text-xs text-white/50">
                    <span>Color:</span>
                    <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: item.color }} />
                    <span className="mx-1">|</span>
                    <span>Size: {item.size}</span>
                    <span className="mx-1">|</span>
                    <span>{item.material}</span>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQuantity(item.id, item.color, item.size, item.quantity - 1)}
                        className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:bg-white/10 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold text-[#fffefa]">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.color, item.size, item.quantity + 1)}
                        className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:bg-white/10 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-bold text-[#83f0c7]">₹{item.price * item.quantity}</p>
                      <p className="text-xs text-white/40">₹{item.price} each</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Clear Cart */}
            <button
              onClick={() => {
                clearCart();
                toast.success('Cart cleared');
              }}
              className="text-sm text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              Clear all items
            </button>
          </div>

          {/* Price Summary */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-4">
              <div className="glass-card p-5 rounded-xl">
                <h3 className="text-lg font-bold text-[#fffefa] mb-4">Price Details</h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                    <span className="text-[#fffefa]">₹{cartTotal()}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60 flex items-center gap-1">
                      <Leaf className="w-3 h-3 text-[#83f0c7]" />
                      Eco Discount (10%)
                    </span>
                    <span className="text-[#83f0c7]">-₹{discount}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60 flex items-center gap-1">
                      <Truck className="w-3 h-3" />
                      Delivery
                    </span>
                    <span className={deliveryFee === 0 ? 'text-[#83f0c7]' : 'text-[#fffefa]'}>
                      {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                    </span>
                  </div>

                  {deliveryFee === 0 && (
                    <p className="text-xs text-[#83f0c7]">You saved ₹49 on delivery!</p>
                  )}

                  <div className="border-t border-white/10 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-[#fffefa]">Total Amount</span>
                      <span className="text-xl font-bold text-[#83f0c7]">₹{total}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full mt-6 btn-primary flex items-center justify-center gap-2"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <Shield className="w-3 h-3" />
                    <span>Secure SSL Encryption</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <Package className="w-3 h-3" />
                    <span>7-Day Easy Returns</span>
                  </div>
                </div>
              </div>

              {/* Eco Impact */}
              <div className="glass-card p-5 rounded-xl border border-[#83f0c7]/20">
                <div className="flex items-center gap-2 mb-3">
                  <Leaf className="w-5 h-5 text-[#83f0c7]" />
                  <h4 className="text-sm font-semibold text-[#83f0c7]">Your Eco Impact</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/50">Water Saved</span>
                    <span className="text-[#83f0c7]">~2,700L</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/50">CO2 Reduced</span>
                    <span className="text-[#83f0c7]">~3.5 kg</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/50">Plastic Bottles</span>
                    <span className="text-[#83f0c7]">~12 saved</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
