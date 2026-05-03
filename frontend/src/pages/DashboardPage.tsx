import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package, Heart, User, LogOut, Leaf, Truck, Check, Clock, X, Search, Sparkles, Settings, Bell
} from 'lucide-react';
import { useStore } from '@/stores/useStore';
import { products } from '@/data/products';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  confirmed: 'bg-blue-500/20 text-blue-400',
  processing: 'bg-purple-500/20 text-purple-400',
  shipped: 'bg-[#83f0c7]/20 text-[#83f0c7]',
  delivered: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
};

const statusIcons: Record<string, React.ElementType> = {
  pending: Clock,
  confirmed: Check,
  processing: Sparkles,
  shipped: Truck,
  delivered: Check,
  cancelled: X,
};

const trackingSteps = ['confirmed', 'processing', 'shipped', 'delivered'];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { isLoggedIn, user, logout, orders, wishlist, toggleWishlist, cancelOrder } = useStore();
  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'profile' | 'settings'>('orders');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    }
    window.scrollTo(0, 0);
  }, [isLoggedIn, navigate]);

  if (!isLoggedIn || !user) return null;

  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const getStepIndex = (status: string) => trackingSteps.indexOf(status);

  return (
    <div className="min-h-screen bg-[#0a201d] pt-8 pb-16">
      <div className="max-w-[1440px] mx-auto section-padding">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#83f0c7] to-[#1d4c43] flex items-center justify-center text-2xl font-bold text-white">
              {user.name?.[0] || 'U'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#fffefa]">{user.name}</h1>
              <p className="text-sm text-white/50">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white/60 hover:text-red-400 hover:border-red-400/30 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Package, label: 'Total Orders', value: orders.length, color: '#83f0c7' },
            { icon: Truck, label: 'In Transit', value: orders.filter((o) => o.status === 'shipped').length, color: '#f5a623' },
            { icon: Heart, label: 'Wishlist', value: wishlist.length, color: '#ff6b6b' },
            { icon: Leaf, label: 'Eco Score', value: '92%', color: '#83f0c7' },
          ].map((stat) => (
            <div key={stat.label} className="glass-card p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${stat.color}20` }}>
                  <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#fffefa]">{stat.value}</p>
                  <p className="text-xs text-white/50">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-2">
              {[
                { id: 'orders', icon: Package, label: 'My Orders' },
                { id: 'wishlist', icon: Heart, label: 'Wishlist' },
                { id: 'profile', icon: User, label: 'Profile' },
                { id: 'settings', icon: Settings, label: 'Settings' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as typeof activeTab)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                    activeTab === item.id
                      ? 'bg-[#1d4c43] text-[#83f0c7]'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              ))}

              {/* Delivery Notifications */}
              <div className="glass-card p-4 rounded-xl mt-6">
                <div className="flex items-center gap-2 mb-3">
                  <Bell className="w-4 h-4 text-[#f5a623]" />
                  <h4 className="text-xs font-semibold text-[#fffefa]">Delivery Alerts</h4>
                </div>
                {orders.filter((o) => o.status === 'shipped').length > 0 ? (
                  orders
                    .filter((o) => o.status === 'shipped')
                    .map((order) => (
                      <div key={order.id} className="flex items-start gap-2 mb-2 p-2 rounded-lg bg-[#f5a623]/10">
                        <Truck className="w-4 h-4 text-[#f5a623] mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs text-[#fffefa]">Order {order.id}</p>
                          <p className="text-xs text-white/50">Arriving by {order.deliveryDate}</p>
                        </div>
                      </div>
                    ))
                ) : (
                  <p className="text-xs text-white/40">No active deliveries</p>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-[#fffefa]">My Orders</h2>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="text"
                      placeholder="Search orders..."
                      className="h-9 pl-9 pr-4 bg-white/5 border border-white/10 rounded-lg text-sm text-[#fffefa] placeholder:text-white/30 focus:outline-none focus:border-[#83f0c7]/50"
                    />
                  </div>
                </div>

                {orders.length === 0 ? (
                  <div className="text-center py-16">
                    <Package className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <p className="text-[#fffefa] mb-2">No orders yet</p>
                    <Link to="/products" className="btn-primary text-sm">Start Shopping</Link>
                  </div>
                ) : (
                  orders.map((order) => {
                    const StatusIcon = statusIcons[order.status] || Clock;
                    return (
                      <div key={order.id} className="glass-card rounded-xl overflow-hidden">
                        {/* Order Header */}
                        <div className="p-4 border-b border-white/10">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-4">
                              <span className="text-sm font-semibold text-[#fffefa]">{order.id}</span>
                              <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusColors[order.status]}`}>
                                <StatusIcon className="w-3 h-3" />
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                            </div>
                            <span className="text-sm text-white/50">{order.date}</span>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="p-4 space-y-3">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4">
                              <div className="w-16 h-16 rounded-lg overflow-hidden bg-white/5 shrink-0">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-[#fffefa]">{item.name}</p>
                                <p className="text-xs text-white/50">Qty: {item.quantity} | {item.material}</p>
                              </div>
                              <p className="text-sm font-bold text-[#83f0c7]">₹{item.price * item.quantity}</p>
                            </div>
                          ))}
                        </div>

                        {/* Tracking */}
                        {order.status !== 'cancelled' && order.status !== 'pending' && (
                          <div className="px-4 pb-4">
                            <button
                              onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                              className="text-xs text-[#83f0c7] hover:underline mb-3"
                            >
                              {selectedOrder === order.id ? 'Hide' : 'Show'} Tracking
                            </button>

                            {selectedOrder === order.id && (
                              <div className="mt-3">
                                <div className="flex items-center justify-between mb-2">
                                  {trackingSteps.map((step, idx) => (
                                    <div key={step} className="flex flex-col items-center flex-1">
                                      <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                                          idx <= getStepIndex(order.status)
                                            ? 'bg-[#83f0c7] text-[#0a201d]'
                                            : 'bg-white/10 text-white/30'
                                        }`}
                                      >
                                        <Check className="w-4 h-4" />
                                      </div>
                                      <span className={`text-xs capitalize ${idx <= getStepIndex(order.status) ? 'text-[#83f0c7]' : 'text-white/30'}`}>
                                        {step}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                                <div className="relative h-1 bg-white/10 rounded-full mt-2">
                                  <div
                                    className="absolute h-full bg-[#83f0c7] rounded-full transition-all"
                                    style={{ width: `${((getStepIndex(order.status) + 1) / trackingSteps.length) * 100}%` }}
                                  />
                                </div>
                                {order.trackingNumber && (
                                  <p className="text-xs text-white/50 mt-3">Tracking: {order.trackingNumber}</p>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Order Footer */}
                        <div className="p-4 border-t border-white/10 flex items-center justify-between">
                          <div>
                            <p className="text-xs text-white/50">Total</p>
                            <p className="text-lg font-bold text-[#83f0c7]">₹{order.total}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {order.status === 'shipped' && (
                              <button className="px-4 py-2 bg-[#f5a623] text-[#0a201d] text-sm font-medium rounded-lg hover:bg-[#e09513] transition-colors">
                                Track Order
                              </button>
                            )}
                            {(order.status === 'confirmed' || order.status === 'processing') && (
                              <button
                                onClick={() => {
                                  cancelOrder(order.id);
                                  toast.success('Order cancelled');
                                }}
                                className="px-4 py-2 border border-red-400/30 text-red-400 text-sm rounded-lg hover:bg-red-400/10 transition-colors"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Wishlist Tab */}
            {activeTab === 'wishlist' && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-[#fffefa] mb-4">My Wishlist</h2>
                {wishlistProducts.length === 0 ? (
                  <div className="text-center py-16">
                    <Heart className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <p className="text-[#fffefa] mb-2">Your wishlist is empty</p>
                    <Link to="/products" className="btn-primary text-sm">Explore Products</Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {wishlistProducts.map((product) => (
                      <div key={product.id} className="glass-card rounded-xl overflow-hidden group">
                        <Link to={`/product/${product.id}`} className="block aspect-[3/4] overflow-hidden relative">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              toggleWishlist(product.id);
                            }}
                            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#0a201d]/60 backdrop-blur flex items-center justify-center"
                          >
                            <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                          </button>
                        </Link>
                        <div className="p-3">
                          <Link to={`/product/${product.id}`}>
                            <h3 className="text-sm font-medium text-[#fffefa] truncate hover:text-[#83f0c7] transition-colors">
                              {product.name}
                            </h3>
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-bold text-[#83f0c7]">₹{product.price}</span>
                            <span className="text-xs text-white/30 line-through">₹{product.originalPrice}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-[#fffefa]">My Profile</h2>

                <div className="glass-card p-6 rounded-xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#83f0c7] to-[#1d4c43] flex items-center justify-center text-3xl font-bold text-white">
                      {user.name?.[0] || 'U'}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#fffefa]">{user.name}</h3>
                      <p className="text-sm text-white/50">Eco Warrior since 2026</p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-white/50 mb-2">Full Name</label>
                      <input
                        type="text"
                        defaultValue={user.name}
                        className="w-full h-11 px-4 bg-white/5 border border-white/10 rounded-lg text-sm text-[#fffefa] focus:outline-none focus:border-[#83f0c7]/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-white/50 mb-2">Email</label>
                      <input
                        type="email"
                        defaultValue={user.email}
                        className="w-full h-11 px-4 bg-white/5 border border-white/10 rounded-lg text-sm text-[#fffefa] focus:outline-none focus:border-[#83f0c7]/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-white/50 mb-2">Phone</label>
                      <input
                        type="tel"
                        defaultValue={user.phone}
                        className="w-full h-11 px-4 bg-white/5 border border-white/10 rounded-lg text-sm text-[#fffefa] focus:outline-none focus:border-[#83f0c7]/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-white/50 mb-2">Location</label>
                      <input
                        type="text"
                        defaultValue="Pune, Maharashtra"
                        className="w-full h-11 px-4 bg-white/5 border border-white/10 rounded-lg text-sm text-[#fffefa] focus:outline-none focus:border-[#83f0c7]/50"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => toast.success('Profile updated!')}
                    className="mt-6 btn-primary"
                  >
                    Save Changes
                  </button>
                </div>

                {/* Eco Stats */}
                <div className="glass-card p-6 rounded-xl">
                  <h3 className="text-sm font-semibold text-[#83f0c7] mb-4 flex items-center gap-2">
                    <Leaf className="w-4 h-4" />
                    Your Eco Impact
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="text-center p-4 rounded-xl bg-white/5">
                      <p className="text-2xl font-bold text-[#83f0c7]">12</p>
                      <p className="text-xs text-white/50">Trees Planted</p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-white/5">
                      <p className="text-2xl font-bold text-[#83f0c7]">32K L</p>
                      <p className="text-xs text-white/50">Water Saved</p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-white/5">
                      <p className="text-2xl font-bold text-[#f5a623]">45 kg</p>
                      <p className="text-xs text-white/50">CO2 Offset</p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-white/5">
                      <p className="text-2xl font-bold text-[#83f0c7]">8</p>
                      <p className="text-xs text-white/50">Eco Orders</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-[#fffefa]">Settings</h2>

                <div className="glass-card p-6 rounded-xl space-y-6">
                  <div className="flex items-center justify-between py-3 border-b border-white/10">
                    <div>
                      <p className="text-sm font-medium text-[#fffefa]">Email Notifications</p>
                      <p className="text-xs text-white/50">Receive updates about your orders</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#83f0c7]" />
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-white/10">
                    <div>
                      <p className="text-sm font-medium text-[#fffefa]">SMS Alerts</p>
                      <p className="text-xs text-white/50">Get delivery updates via SMS</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#83f0c7]" />
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-white/10">
                    <div>
                      <p className="text-sm font-medium text-[#fffefa]">Eco Tips Newsletter</p>
                      <p className="text-xs text-white/50">Weekly sustainability tips</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#83f0c7]" />
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-red-400">Delete Account</p>
                      <p className="text-xs text-white/50">Permanently remove your account and data</p>
                    </div>
                    <button
                      onClick={() => toast.error('Contact support to delete your account')}
                      className="px-4 py-2 border border-red-400/30 text-red-400 text-sm rounded-lg hover:bg-red-400/10 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
