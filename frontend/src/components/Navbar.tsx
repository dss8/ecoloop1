import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, User, Heart, Menu, X, Leaf, Sparkles, LogOut } from 'lucide-react';
import { useStore } from '@/stores/useStore';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { user: fbUser, signOut, configured } = useAuth();
  const { user: storeUser, cartCount, wishlist, isLoggedIn: storeIsLoggedIn } = useStore();
  // In real mode, trust Firebase. In dev mode, trust the local store.
  const isLoggedIn = configured ? Boolean(fbUser) : storeIsLoggedIn;
  const user = fbUser
    ? {
        name: fbUser.displayName || (fbUser.email ? fbUser.email.split('@')[0] : 'Eco User'),
        email: fbUser.email || '',
      }
    : storeUser;
  const logout = async () => {
    try {
      await signOut();
      toast.success('Logged out');
      navigate('/');
    } catch (e) {
      toast.error('Logout failed');
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#0a201d]/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-[1440px] mx-auto section-padding">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#83f0c7] to-[#1d4c43] flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#fffefa] hidden sm:block">
              ECO<span className="text-[#83f0c7]">LOOP</span>
            </span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search eco-friendly t-shirts..."
                className="w-full h-10 pl-10 pr-4 bg-white/5 border border-white/10 rounded-full text-sm text-[#fffefa] placeholder:text-white/40 focus:outline-none focus:border-[#83f0c7]/50 focus:bg-white/10 transition-all"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-[#1d4c43] text-white text-xs rounded-full hover:bg-[#2a6b5e] transition-colors"
              >
                Search
              </button>
            </div>
          </form>

          {/* Nav Actions */}
          <div className="flex items-center gap-2 lg:gap-4">
            <Link
              to="/design-studio"
              data-testid="navbar-studio-link"
              className={`hidden lg:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isActive('/design-studio')
                  ? 'bg-[#83f0c7]/20 text-[#83f0c7]'
                  : 'text-white/70 hover:text-[#83f0c7] hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              AI Studio
            </Link>

            <Link
              to="/design-history"
              data-testid="navbar-history-link"
              className={`hidden lg:flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all ${
                isActive('/design-history')
                  ? 'bg-[#83f0c7]/20 text-[#83f0c7]'
                  : 'text-white/70 hover:text-[#83f0c7] hover:bg-white/5'
              }`}
            >
              History
            </Link>

            <Link
              to="/products"
              className={`hidden lg:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isActive('/products')
                  ? 'bg-[#83f0c7]/20 text-[#83f0c7]'
                  : 'text-white/70 hover:text-[#83f0c7] hover:bg-white/5'
              }`}
            >
              Shop
            </Link>

            <Link
              to="/cart"
              className="relative flex items-center gap-2 px-3 py-2 rounded-full text-white/70 hover:text-[#83f0c7] hover:bg-white/5 transition-all"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="hidden lg:inline text-sm font-medium">Cart</span>
              {cartCount() > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#f5a623] text-[#0a201d] text-xs font-bold rounded-full flex items-center justify-center">
                  {cartCount()}
                </span>
              )}
            </Link>

            <Link
              to="/dashboard"
              className="relative flex items-center gap-2 px-3 py-2 rounded-full text-white/70 hover:text-[#83f0c7] hover:bg-white/5 transition-all"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#83f0c7] text-[#0a201d] text-xs font-bold rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {isLoggedIn ? (
              <div className="hidden lg:flex items-center gap-2">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-3 py-2 rounded-full text-white/70 hover:text-[#83f0c7] hover:bg-white/5 transition-all"
                  data-testid="navbar-user-link"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#83f0c7] to-[#1d4c43] flex items-center justify-center text-sm font-bold text-white">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-medium">{user?.name?.split(' ')[0]}</span>
                </Link>
                <button
                  onClick={logout}
                  data-testid="navbar-logout-button"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full text-white/60 hover:text-red-300 hover:bg-red-500/10 transition-all text-sm"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                data-testid="navbar-login-link"
                className="hidden lg:flex items-center gap-2 px-5 py-2 bg-[#1d4c43] text-white rounded-full text-sm font-medium hover:bg-[#2a6b5e] transition-all"
              >
                <User className="w-4 h-4" />
                Login
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-white/70 hover:text-[#83f0c7] transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <form onSubmit={handleSearch} className="md:hidden pb-3">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search eco-friendly t-shirts..."
              className="w-full h-10 pl-10 pr-4 bg-white/5 border border-white/10 rounded-full text-sm text-[#fffefa] placeholder:text-white/40 focus:outline-none focus:border-[#83f0c7]/50"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          </div>
        </form>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-[#0a201d]/95 backdrop-blur-xl border-t border-white/10 animate-slide-in">
          <div className="section-padding py-4 space-y-2">
            <Link
              to="/"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:text-[#83f0c7] hover:bg-white/5 transition-all"
            >
              <Leaf className="w-5 h-5" />
              Home
            </Link>
            <Link
              to="/products"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:text-[#83f0c7] hover:bg-white/5 transition-all"
            >
              <Search className="w-5 h-5" />
              Shop All
            </Link>
            <Link
              to="/design-studio"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:text-[#83f0c7] hover:bg-white/5 transition-all"
            >
              <Sparkles className="w-5 h-5" />
              AI Design Studio
            </Link>
            <Link
              to="/cart"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:text-[#83f0c7] hover:bg-white/5 transition-all"
            >
              <ShoppingCart className="w-5 h-5" />
              Cart ({cartCount()})
            </Link>
            <Link
              to="/dashboard"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:text-[#83f0c7] hover:bg-white/5 transition-all"
            >
              <User className="w-5 h-5" />
              My Account
            </Link>
            {isLoggedIn ? (
              <button
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-all"
              >
                <X className="w-5 h-5" />
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#1d4c43] text-white hover:bg-[#2a6b5e] transition-all"
              >
                <User className="w-5 h-5" />
                Login / Register
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
