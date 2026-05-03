import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, Leaf, Heart, ShoppingCart, Truck, Shield, RefreshCw, ChevronRight, Minus, Plus, Sparkles, Droplets, Wind, Award } from 'lucide-react';
import { products } from '@/data/products';
import { useStore } from '@/stores/useStore';
import { toast } from 'sonner';
import ReviewsSection from '@/components/ReviewsSection';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const product = products.find((p) => p.id === Number(id));
  const { addToCart, toggleWishlist, wishlist } = useStore();
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (product) {
      setSelectedColor(product.colors[0]);
      setSelectedSize(product.sizes[1] || product.sizes[0]);
      window.scrollTo(0, 0);
    }
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0a201d] flex items-center justify-center">
        <div className="text-center">
          <Leaf className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#fffefa] mb-2">Product not found</h2>
          <Link to="/products" className="btn-primary">Browse Products</Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      color: selectedColor,
      size: selectedSize,
      material: product.material,
      quantity,
    });
    toast.success(`${product.name} added to cart!`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  // AI Lifespan prediction based on material
  const lifespanPrediction = {
    years: product.lifespan,
    washes: parseInt(product.lifespan) * 50,
    careTips: [
      'Wash in cold water (30°C or below)',
      'Use eco-friendly detergent',
      'Air dry when possible',
      'Turn inside out before washing',
    ],
  };

  const relatedProducts = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <div className="min-h-screen bg-[#0a201d] pt-8 pb-16">
      <div className="max-w-[1440px] mx-auto section-padding">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-white/50 mb-8">
          <Link to="/" className="hover:text-[#83f0c7] transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/products" className="hover:text-[#83f0c7] transition-colors">Products</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-[#83f0c7]">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 bg-white/5 relative group">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.badge && (
                <span className="absolute top-4 left-4 px-3 py-1.5 bg-[#f5a623] text-[#0a201d] text-sm font-bold rounded-full">
                  {product.badge}
                </span>
              )}
              <button
                onClick={() => toggleWishlist(product.id)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#0a201d]/60 backdrop-blur flex items-center justify-center hover:bg-[#0a201d]/80 transition-colors"
              >
                <Heart
                  className={`w-5 h-5 ${wishlist.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-white'}`}
                />
              </button>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="eco-badge">
                  <Leaf className="w-3 h-3" />
                  {product.material}
                </span>
                <span className="eco-badge bg-[#f5a623]/20 text-[#f5a623]">
                  <Award className="w-3 h-3" />
                  {product.ecoScore}% Eco Score
                </span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-[#fffefa] mb-2">{product.name}</h1>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-[#f5a623] text-[#f5a623]' : 'text-white/20'}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-white/60">{product.rating} ({product.reviews} reviews)</span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-[#83f0c7]">₹{product.price}</span>
              <span className="text-lg text-white/30 line-through">₹{product.originalPrice}</span>
              <span className="text-sm font-medium text-[#f5a623] bg-[#f5a623]/10 px-2 py-1 rounded-full">
                {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
              </span>
            </div>

            <p className="text-white/60 leading-relaxed">{product.description}</p>

            {/* Color Selection */}
            <div>
              <h4 className="text-sm font-semibold text-[#fffefa] mb-3">Color</h4>
              <div className="flex items-center gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      selectedColor === color ? 'border-[#83f0c7] scale-110 shadow-lg shadow-[#83f0c7]/30' : 'border-white/20'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <h4 className="text-sm font-semibold text-[#fffefa] mb-3">Size</h4>
              <div className="flex items-center gap-2 flex-wrap">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedSize === size
                        ? 'bg-[#1d4c43] text-[#83f0c7] border border-[#83f0c7]/30'
                        : 'bg-white/5 text-white/60 border border-white/10 hover:border-white/30'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <h4 className="text-sm font-semibold text-[#fffefa] mb-3">Quantity</h4>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:bg-white/10 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-lg font-semibold text-[#fffefa] w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:bg-white/10 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 bg-[#f5a623] text-[#0a201d] font-semibold px-6 py-3 rounded-full hover:bg-[#e09513] transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                Buy Now
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3 pt-4">
              {[
                { icon: Truck, label: 'Free Shipping' },
                { icon: Shield, label: 'Secure Payment' },
                { icon: RefreshCw, label: '7-Day Returns' },
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
                  <item.icon className="w-5 h-5 text-[#83f0c7]" />
                  <span className="text-xs text-white/60 text-center">{item.label}</span>
                </div>
              ))}
            </div>

            {/* AI Lifespan Prediction */}
            <div className="glass-card p-5 rounded-xl border border-[#83f0c7]/20">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-[#83f0c7]" />
                <h4 className="text-sm font-semibold text-[#83f0c7]">AI Lifespan Prediction</h4>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 rounded-lg bg-white/5">
                  <p className="text-2xl font-bold text-[#fffefa]">{lifespanPrediction.years}</p>
                  <p className="text-xs text-white/50">Expected Lifespan</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-white/5">
                  <p className="text-2xl font-bold text-[#83f0c7]">{lifespanPrediction.washes}+</p>
                  <p className="text-xs text-white/50">Washes Supported</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-white/70 mb-2">Care Tips for Maximum Lifespan:</p>
                {lifespanPrediction.careTips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Leaf className="w-3 h-3 text-[#83f0c7] mt-0.5 shrink-0" />
                    <span className="text-xs text-white/50">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-16">
          <div className="flex items-center gap-6 border-b border-white/10 mb-8">
            {['details', 'materials', 'sustainability'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-medium capitalize transition-all border-b-2 ${
                  activeTab === tab
                    ? 'text-[#83f0c7] border-[#83f0c7]'
                    : 'text-white/50 border-transparent hover:text-white/70'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'details' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-[#fffefa]">Product Features</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {product.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="w-8 h-8 rounded-lg bg-[#83f0c7]/10 flex items-center justify-center">
                      <Leaf className="w-4 h-4 text-[#83f0c7]" />
                    </div>
                    <span className="text-sm text-white/70">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'materials' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-[#fffefa]">Material Information</h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-xl bg-white/5 border border-white/10 text-center">
                  <Droplets className="w-8 h-8 text-[#83f0c7] mx-auto mb-3" />
                  <p className="text-lg font-bold text-[#fffefa]">{product.material}</p>
                  <p className="text-xs text-white/50 mt-1">Primary Material</p>
                </div>
                <div className="p-5 rounded-xl bg-white/5 border border-white/10 text-center">
                  <Wind className="w-8 h-8 text-[#f5a623] mx-auto mb-3" />
                  <p className="text-lg font-bold text-[#fffefa]">{product.ecoScore}%</p>
                  <p className="text-xs text-white/50 mt-1">Eco Score Rating</p>
                </div>
                <div className="p-5 rounded-xl bg-white/5 border border-white/10 text-center">
                  <Award className="w-8 h-8 text-[#83f0c7] mx-auto mb-3" />
                  <p className="text-lg font-bold text-[#fffefa]">{product.lifespan}</p>
                  <p className="text-xs text-white/50 mt-1">Predicted Lifespan</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sustainability' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-[#fffefa]">Sustainability Impact</h3>
              <div className="p-6 rounded-xl bg-gradient-to-r from-[#83f0c7]/10 to-[#1d4c43]/20 border border-[#83f0c7]/20">
                <div className="grid sm:grid-cols-3 gap-6">
                  <div>
                    <p className="text-3xl font-bold text-[#83f0c7]">2,700L</p>
                    <p className="text-sm text-white/60 mt-1">Water saved vs conventional cotton</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-[#f5a623]">60%</p>
                    <p className="text-sm text-white/60 mt-1">Less carbon emissions</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-[#83f0c7]">0%</p>
                    <p className="text-sm text-white/60 mt-1">Synthetic pesticides used</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Reviews */}
        <ReviewsSection productId={product.id} />

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-[#fffefa] mb-8">You May Also Like</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <Link
                  key={p.id}
                  to={`/product/${p.id}`}
                  className="group bg-white/5 rounded-xl overflow-hidden border border-white/10 hover:border-[#83f0c7]/30 transition-all"
                >
                  <div className="aspect-square overflow-hidden">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-3">
                    <h4 className="text-sm font-medium text-[#fffefa] truncate">{p.name}</h4>
                    <p className="text-sm font-bold text-[#83f0c7]">₹{p.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
