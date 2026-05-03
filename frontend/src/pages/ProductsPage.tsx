import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Star, Leaf, Filter, SlidersHorizontal, Heart, ShoppingCart, ChevronDown } from 'lucide-react';
import { products, categories } from '@/data/products';
import { useStore } from '@/stores/useStore';

export default function ProductsPage() {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMaterial, setSelectedMaterial] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const { addToCart, toggleWishlist, wishlist } = useStore();

  const materials = ['All', 'Organic Cotton', 'Bamboo Fiber', 'Recycled Polyester', 'Hemp Blend', 'Recycled Cotton'];

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.material.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== 'All') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (selectedMaterial !== 'All') {
      result = result.filter((p) => p.material === selectedMaterial);
    }

    result = result.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);

    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'eco':
        result.sort((a, b) => b.ecoScore - a.ecoScore);
        break;
      default:
        break;
    }

    return result;
  }, [searchQuery, selectedCategory, selectedMaterial, sortBy, priceRange]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a201d] pt-8 pb-16">
      <div className="max-w-[1440px] mx-auto section-padding">
        {/* Header */}
        <div className="mb-8">
          {searchQuery && (
            <p className="text-sm text-white/50 mb-2">
              Search results for: <span className="text-[#83f0c7]">"{searchQuery}"</span>
            </p>
          )}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-[#fffefa]">All T-Shirts</h1>
              <p className="text-sm text-white/50 mt-1">{filteredProducts.length} eco-friendly designs</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-full text-sm text-white/70 hover:bg-white/10 transition-all"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none px-4 py-2.5 pr-10 bg-white/5 border border-white/10 rounded-full text-sm text-white/70 focus:outline-none focus:border-[#83f0c7]/50 cursor-pointer"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="eco">Eco Score</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className={`${showFilters ? 'fixed inset-0 z-50 bg-[#0a201d] p-6 overflow-auto' : 'hidden'} lg:block lg:static lg:w-64 lg:bg-transparent lg:p-0 shrink-0`}>
            <div className="lg:sticky lg:top-24 space-y-8">
              <div className="flex items-center justify-between lg:hidden mb-6">
                <h3 className="text-lg font-bold text-[#fffefa]">Filters</h3>
                <button onClick={() => setShowFilters(false)} className="p-2 text-white/70">
                  Close
                </button>
              </div>

              {/* Categories */}
              <div>
                <h4 className="text-sm font-semibold text-[#fffefa] uppercase tracking-wider mb-4 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  Category
                </h4>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                        selectedCategory === cat
                          ? 'bg-[#1d4c43] text-[#83f0c7]'
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Materials */}
              <div>
                <h4 className="text-sm font-semibold text-[#fffefa] uppercase tracking-wider mb-4">Material</h4>
                <div className="space-y-2">
                  {materials.map((mat) => (
                    <button
                      key={mat}
                      onClick={() => setSelectedMaterial(mat)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                        selectedMaterial === mat
                          ? 'bg-[#1d4c43] text-[#83f0c7]'
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {mat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="text-sm font-semibold text-[#fffefa] uppercase tracking-wider mb-4">Price Range</h4>
                <div className="px-2">
                  <input
                    type="range"
                    min="0"
                    max="2000"
                    step="50"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                    className="w-full accent-[#83f0c7]"
                  />
                  <div className="flex justify-between text-xs text-white/50 mt-2">
                    <span>₹0</span>
                    <span>₹{priceRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Reset */}
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedMaterial('All');
                  setPriceRange([0, 2000]);
                  setSortBy('featured');
                }}
                className="w-full py-2.5 border border-white/10 rounded-full text-sm text-white/60 hover:text-[#83f0c7] hover:border-[#83f0c7]/30 transition-all"
              >
                Reset All Filters
              </button>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <Leaf className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-[#fffefa] mb-2">No products found</h3>
                <p className="text-sm text-white/50">Try adjusting your filters or search query</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group relative bg-white/5 rounded-2xl overflow-hidden border border-white/10 hover:border-[#83f0c7]/30 transition-all duration-500 hover:shadow-xl hover:shadow-[#83f0c7]/5"
                  >
                    {/* Image */}
                    <Link to={`/product/${product.id}`} className="block aspect-[3/4] overflow-hidden relative">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a201d]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {product.badge && (
                          <span className="px-2.5 py-1 bg-[#f5a623] text-[#0a201d] text-xs font-bold rounded-full">
                            {product.badge}
                          </span>
                        )}
                      </div>

                      {/* Eco Score */}
                      <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-[#0a201d]/80 backdrop-blur flex items-center justify-center">
                        <span className="text-xs font-bold text-[#83f0c7]">{product.ecoScore}</span>
                      </div>

                      {/* Wishlist */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggleWishlist(product.id);
                        }}
                        className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-[#0a201d]/60 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-[#0a201d]/80"
                      >
                        <Heart
                          className={`w-5 h-5 ${wishlist.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-white/70'}`}
                        />
                      </button>
                    </Link>

                    {/* Info */}
                    <div className="p-4">
                      <div className="flex items-center gap-1 mb-1">
                        <Star className="w-3 h-3 fill-[#f5a623] text-[#f5a623]" />
                        <span className="text-xs text-white/60">{product.rating}</span>
                        <span className="text-xs text-white/30">({product.reviews})</span>
                      </div>

                      <Link to={`/product/${product.id}`}>
                        <h3 className="text-sm font-semibold text-[#fffefa] truncate mb-1 hover:text-[#83f0c7] transition-colors">
                          {product.name}
                        </h3>
                      </Link>

                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg font-bold text-[#83f0c7]">₹{product.price}</span>
                        <span className="text-sm text-white/30 line-through">₹{product.originalPrice}</span>
                        <span className="text-xs text-[#f5a623]">
                          {Math.round((1 - product.price / product.originalPrice) * 100)}% off
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Leaf className="w-3 h-3 text-[#83f0c7]" />
                          <span className="text-xs text-[#83f0c7]/70">{product.material}</span>
                        </div>

                        <button
                          onClick={() =>
                            addToCart({
                              id: product.id,
                              name: product.name,
                              price: product.price,
                              image: product.image,
                              color: product.colors[0],
                              size: product.sizes[1] || product.sizes[0],
                              material: product.material,
                              quantity: 1,
                            })
                          }
                          className="w-8 h-8 rounded-lg bg-[#1d4c43] flex items-center justify-center hover:bg-[#2a6b5e] transition-colors"
                        >
                          <ShoppingCart className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
