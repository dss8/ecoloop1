import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, Package, Users, TrendingUp, DollarSign, Leaf, Truck, Check, ArrowRight, Search, Filter, Download
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

export default function AdminDashboardPage() {
  const { orders } = useStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'analytics'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Stats
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const deliveredOrders = orders.filter((o) => o.status === 'delivered').length;
  const totalCustomers = 24;

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const recentOrders = [...orders].slice(0, 10);

  return (
    <div className="min-h-screen bg-[#0a201d] pt-8 pb-16">
      <div className="max-w-[1440px] mx-auto section-padding">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Link to="/" className="text-sm text-white/50 hover:text-[#83f0c7]">Home</Link>
            <ArrowRight className="w-4 h-4 text-white/30" />
            <span className="text-sm text-[#83f0c7]">Admin Dashboard</span>
          </div>
          <h1 className="text-3xl font-bold text-[#fffefa]">Admin Dashboard</h1>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: DollarSign, label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, color: '#83f0c7', trend: '+12%' },
            { icon: Package, label: 'Total Orders', value: totalOrders.toString(), color: '#f5a623', trend: '+8%' },
            { icon: Check, label: 'Delivered', value: deliveredOrders.toString(), color: '#22c55e', trend: '+15%' },
            { icon: Users, label: 'Customers', value: totalCustomers.toString(), color: '#a78bfa', trend: '+5%' },
          ].map((stat) => (
            <div key={stat.label} className="glass-card p-5 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${stat.color}20` }}>
                  <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
                <span className="text-xs font-medium text-[#83f0c7]">{stat.trend}</span>
              </div>
              <p className="text-2xl font-bold text-[#fffefa]">{stat.value}</p>
              <p className="text-xs text-white/50">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-8 p-1 bg-white/5 rounded-xl w-fit border border-white/10">
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
            { id: 'orders', icon: Package, label: 'Orders' },
            { id: 'products', icon: TrendingUp, label: 'Products' },
            { id: 'analytics', icon: Leaf, label: 'Eco Impact' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id ? 'bg-[#1d4c43] text-[#83f0c7]' : 'text-white/60 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Recent Orders */}
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="p-5 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#fffefa]">Recent Orders</h3>
                <button onClick={() => setActiveTab('orders')} className="text-sm text-[#83f0c7] hover:underline">
                  View All
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left px-5 py-3 text-xs font-medium text-white/50 uppercase">Order ID</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-white/50 uppercase">Customer</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-white/50 uppercase">Items</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-white/50 uppercase">Total</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-white/50 uppercase">Status</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-white/50 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-5 py-4 text-sm font-medium text-[#fffefa]">{order.id}</td>
                        <td className="px-5 py-4 text-sm text-white/60">Demo User</td>
                        <td className="px-5 py-4 text-sm text-white/60">{order.items.length} item(s)</td>
                        <td className="px-5 py-4 text-sm font-bold text-[#83f0c7]">₹{order.total}</td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-white/50">{order.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Order Status Breakdown */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="glass-card p-5 rounded-xl">
                <h4 className="text-sm font-semibold text-[#fffefa] mb-4">Order Status</h4>
                <div className="space-y-3">
                  {['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => {
                    const count = orders.filter((o) => o.status === status).length;
                    const percentage = totalOrders > 0 ? (count / totalOrders) * 100 : 0;
                    return (
                      <div key={status}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-white/60 capitalize">{status}</span>
                          <span className="text-[#fffefa]">{count}</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#83f0c7] rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="glass-card p-5 rounded-xl">
                <h4 className="text-sm font-semibold text-[#fffefa] mb-4">Revenue Overview</h4>
                <div className="text-center py-6">
                  <p className="text-4xl font-bold text-[#83f0c7]">₹{totalRevenue.toLocaleString()}</p>
                  <p className="text-sm text-white/50 mt-2">Total revenue this month</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Avg. Order Value</span>
                    <span className="text-[#fffefa]">₹{totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Pending Revenue</span>
                    <span className="text-[#f5a623]">₹{orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled').reduce((s, o) => s + o.total, 0)}</span>
                  </div>
                </div>
              </div>

              <div className="glass-card p-5 rounded-xl">
                <h4 className="text-sm font-semibold text-[#fffefa] mb-4 flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-[#83f0c7]" />
                  Environmental Impact
                </h4>
                <div className="space-y-4">
                  <div className="text-center p-4 rounded-xl bg-[#83f0c7]/10">
                    <p className="text-3xl font-bold text-[#83f0c7]">12K L</p>
                    <p className="text-xs text-white/50 mt-1">Water Saved</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 rounded-xl bg-white/5">
                      <p className="text-xl font-bold text-[#f5a623]">45 kg</p>
                      <p className="text-xs text-white/50">CO2 Offset</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-white/5">
                      <p className="text-xl font-bold text-[#83f0c7]">180</p>
                      <p className="text-xs text-white/50">Trees Planted</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search orders..."
                  className="w-full h-10 pl-10 pr-4 bg-white/5 border border-white/10 rounded-lg text-sm text-[#fffefa] placeholder:text-white/30 focus:outline-none focus:border-[#83f0c7]/50"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none h-10 pl-10 pr-8 bg-white/5 border border-white/10 rounded-lg text-sm text-white/70 focus:outline-none focus:border-[#83f0c7]/50 cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <button
                onClick={() => toast.success('Orders exported!')}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white/60 hover:text-[#83f0c7] hover:border-[#83f0c7]/30 transition-all"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>

            {/* Orders Table */}
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left px-5 py-4 text-xs font-medium text-white/50 uppercase">Order ID</th>
                      <th className="text-left px-5 py-4 text-xs font-medium text-white/50 uppercase">Customer</th>
                      <th className="text-left px-5 py-4 text-xs font-medium text-white/50 uppercase">Items</th>
                      <th className="text-left px-5 py-4 text-xs font-medium text-white/50 uppercase">Total</th>
                      <th className="text-left px-5 py-4 text-xs font-medium text-white/50 uppercase">Status</th>
                      <th className="text-left px-5 py-4 text-xs font-medium text-white/50 uppercase">Tracking</th>
                      <th className="text-left px-5 py-4 text-xs font-medium text-white/50 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-5 py-4 text-sm font-medium text-[#fffefa]">{order.id}</td>
                        <td className="px-5 py-4 text-sm text-white/60">Demo User</td>
                        <td className="px-5 py-4 text-sm text-white/60">{order.items.length} item(s)</td>
                        <td className="px-5 py-4 text-sm font-bold text-[#83f0c7]">₹{order.total}</td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-white/60">{order.trackingNumber || '-'}</td>
                        <td className="px-5 py-4 text-sm text-white/50">{order.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredOrders.length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-white/20 mx-auto mb-3" />
                  <p className="text-white/50">No orders found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="p-5 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#fffefa]">Product Performance</h3>
                <span className="text-sm text-white/50">20 products</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left px-5 py-4 text-xs font-medium text-white/50 uppercase">Product</th>
                      <th className="text-left px-5 py-4 text-xs font-medium text-white/50 uppercase">Category</th>
                      <th className="text-left px-5 py-4 text-xs font-medium text-white/50 uppercase">Price</th>
                      <th className="text-left px-5 py-4 text-xs font-medium text-white/50 uppercase">Eco Score</th>
                      <th className="text-left px-5 py-4 text-xs font-medium text-white/50 uppercase">Rating</th>
                      <th className="text-left px-5 py-4 text-xs font-medium text-white/50 uppercase">Material</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/5">
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            </div>
                            <span className="text-sm font-medium text-[#fffefa]">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-white/60">{product.category}</td>
                        <td className="px-5 py-4 text-sm font-bold text-[#83f0c7]">₹{product.price}</td>
                        <td className="px-5 py-4">
                          <span className="px-2 py-1 bg-[#83f0c7]/10 text-[#83f0c7] text-xs rounded-full">{product.ecoScore}%</span>
                        </td>
                        <td className="px-5 py-4 text-sm text-[#f5a623]">{product.rating}</td>
                        <td className="px-5 py-4 text-sm text-white/60">{product.material}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass-card p-6 rounded-xl">
                <h4 className="text-sm font-semibold text-[#fffefa] mb-4 flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-[#83f0c7]" />
                  Material Distribution
                </h4>
                <div className="space-y-4">
                  {['Organic Cotton', 'Bamboo Fiber', 'Recycled Polyester', 'Hemp Blend', 'Recycled Cotton'].map((mat) => {
                    const count = products.filter((p) => p.material === mat).length;
                    const pct = (count / products.length) * 100;
                    return (
                      <div key={mat}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-white/60">{mat}</span>
                          <span className="text-[#fffefa]">{count} products ({Math.round(pct)}%)</span>
                        </div>
                        <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[#83f0c7] to-[#1d4c43] rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="glass-card p-6 rounded-xl">
                <h4 className="text-sm font-semibold text-[#fffefa] mb-4 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#f5a623]" />
                  Delivery Performance
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                    <span className="text-sm text-white/60">Avg. Delivery Time</span>
                    <span className="text-sm font-bold text-[#83f0c7]">4.2 days</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                    <span className="text-sm text-white/60">On-Time Delivery</span>
                    <span className="text-sm font-bold text-[#83f0c7]">96%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                    <span className="text-sm text-white/60">Return Rate</span>
                    <span className="text-sm font-bold text-[#83f0c7]">2.1%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                    <span className="text-sm text-white/60">Customer Satisfaction</span>
                    <span className="text-sm font-bold text-[#83f0c7]">4.8/5</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 rounded-xl">
              <h4 className="text-sm font-semibold text-[#fffefa] mb-4">Monthly Eco Impact Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-5 rounded-xl bg-gradient-to-br from-[#83f0c7]/20 to-[#1d4c43]/20 border border-[#83f0c7]/20">
                  <p className="text-3xl font-bold text-[#83f0c7]">54K L</p>
                  <p className="text-xs text-white/50 mt-1">Water Saved This Month</p>
                </div>
                <div className="text-center p-5 rounded-xl bg-gradient-to-br from-[#f5a623]/20 to-[#8b4513]/20 border border-[#f5a623]/20">
                  <p className="text-3xl font-bold text-[#f5a623]">210 kg</p>
                  <p className="text-xs text-white/50 mt-1">CO2 Offset This Month</p>
                </div>
                <div className="text-center p-5 rounded-xl bg-gradient-to-br from-green-500/20 to-green-800/20 border border-green-500/20">
                  <p className="text-3xl font-bold text-green-400">850</p>
                  <p className="text-xs text-white/50 mt-1">Trees Planted This Month</p>
                </div>
                <div className="text-center p-5 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-800/20 border border-purple-500/20">
                  <p className="text-3xl font-bold text-purple-400">1.2K</p>
                  <p className="text-xs text-white/50 mt-1">Plastic Bottles Recycled</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
