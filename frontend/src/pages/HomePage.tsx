import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, Sparkles, Droplets, Wind, Recycle, Star, ChevronRight } from 'lucide-react';
import { products, materials } from '@/data/products';
import { useStore } from '@/stores/useStore';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const statementRef = useRef<HTMLDivElement>(null);
  const materialsRef = useRef<HTMLDivElement>(null);
  const featuredRef = useRef<HTMLDivElement>(null);
  const studioRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useStore();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Hero parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // GSAP Scroll Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Statement text reveal
      if (statementRef.current) {
        gsap.fromTo(
          statementRef.current.querySelectorAll('.reveal-word'),
          { opacity: 0, y: 40, rotateX: -45 },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 0.8,
            stagger: 0.05,
            ease: 'back.out(1.2)',
            scrollTrigger: {
              trigger: statementRef.current,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      // Materials cards
      if (materialsRef.current) {
        gsap.fromTo(
          materialsRef.current.querySelectorAll('.material-card'),
          { opacity: 0, y: 60, scale: 0.9 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            stagger: 0.15,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: materialsRef.current,
              start: 'top 75%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      // Featured products
      if (featuredRef.current) {
        gsap.fromTo(
          featuredRef.current.querySelectorAll('.product-card'),
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: featuredRef.current,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      // Studio section
      if (studioRef.current) {
        gsap.fromTo(
          studioRef.current.querySelector('.studio-content'),
          { opacity: 0, x: -60 },
          {
            opacity: 1,
            x: 0,
            duration: 1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: studioRef.current,
              start: 'top 70%',
              toggleActions: 'play none none none',
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  const statementWords = "ECOLOOP IS THE ONLY PLATFORM THAT USES AI TO CREATE CUSTOM ECO-FRIENDLY APPAREL. WE COMBINE SUSTAINABLE MATERIALS WITH CUTTING-EDGE TECHNOLOGY TO HELP YOU DESIGN T-SHIRTS THAT ARE AS UNIQUE AS YOUR COMMITMENT TO THE PLANET.".split(' ');

  const featuredProducts = products.slice(0, 8);

  return (
    <div className="overflow-hidden">
      {/* ===== HERO SECTION ===== */}
      <section
        ref={heroRef}
        className="relative min-h-[90vh] flex items-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0a201d 0%, #143a33 50%, #0a201d 100%)' }}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-20 right-20 w-96 h-96 rounded-full opacity-20"
            style={{
              background: 'radial-gradient(circle, #83f0c7 0%, transparent 70%)',
              transform: `translate(${mousePos.x}px, ${mousePos.y}px)`,
              transition: 'transform 0.3s ease-out',
            }}
          />
          <div
            className="absolute bottom-20 left-20 w-72 h-72 rounded-full opacity-15"
            style={{
              background: 'radial-gradient(circle, #f5a623 0%, transparent 70%)',
              transform: `translate(${-mousePos.x * 0.5}px, ${-mousePos.y * 0.5}px)`,
              transition: 'transform 0.3s ease-out',
            }}
          />
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `linear-gradient(rgba(131, 240, 199, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(131, 240, 199, 0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }} />
        </div>

        <div className="max-w-[1440px] mx-auto section-padding relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#83f0c7]/10 border border-[#83f0c7]/30 rounded-full">
                <Leaf className="w-4 h-4 text-[#83f0c7]" />
                <span className="text-xs font-medium text-[#83f0c7] uppercase tracking-wider">Sustainable Fashion Redefined</span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-[#fffefa] leading-[0.95] tracking-tight">
                CREATE<br />
                <span className="text-gradient">WITH</span><br />
                NATURE
              </h1>

              <p className="text-lg text-white/60 max-w-lg leading-relaxed">
                Design your own eco-friendly t-shirts with AI-powered tools. Choose from organic cotton, bamboo, and recycled materials. Every design, every thread, every choice — made for the planet.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link to="/design-studio" className="btn-primary inline-flex items-center gap-2 text-base">
                  <Sparkles className="w-5 h-5" />
                  Launch AI Studio
                </Link>
                <Link to="/products" className="btn-secondary inline-flex items-center gap-2 text-base">
                  Explore Collection
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-8 pt-4">
                {[
                  { value: '20+', label: 'Eco Designs' },
                  { value: '5', label: 'Materials' },
                  { value: '50K+', label: 'Trees Planted' },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-2xl font-bold text-[#83f0c7]">{stat.value}</div>
                    <div className="text-xs text-white/40 uppercase tracking-wider">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Hero Banner Image */}
            <div className="relative hidden lg:block">
              <div
                className="relative rounded-3xl overflow-hidden shadow-2xl shadow-[#83f0c7]/10 border border-white/10"
                style={{
                  transform: `perspective(1000px) rotateY(${mousePos.x * 0.3}deg) rotateX(${-mousePos.y * 0.3}deg)`,
                  transition: 'transform 0.3s ease-out',
                }}
              >
                <img
                  src="/images/hero/hero_banner.jpg"
                  alt="ECOLOOP Organic Design"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a201d]/60 via-transparent to-transparent" />

                {/* Floating Badge */}
                <div className="absolute bottom-6 left-6 right-6 glass-card p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#83f0c7]/20 flex items-center justify-center">
                    <Recycle className="w-6 h-6 text-[#83f0c7]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#fffefa]">100% Eco-Friendly Materials</p>
                    <p className="text-xs text-white/50">GOTS Certified & Carbon Neutral</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== ECO-STATEMENT SECTION ===== */}
      <section
        ref={statementRef}
        className="py-32 lg:py-40 bg-[#fffefa]"
      >
        <div className="max-w-5xl mx-auto section-padding text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#0a201d]/5 rounded-full mb-12">
            <Leaf className="w-4 h-4 text-[#1d4c43]" />
            <span className="text-xs font-medium text-[#1d4c43] uppercase tracking-wider">Our Mission</span>
          </div>

          <p className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-[#0a201d] leading-tight tracking-tight" style={{ perspective: '1000px' }}>
            {statementWords.map((word, i) => (
              <span key={i} className="reveal-word inline-block mr-[0.3em]">
                {word}
              </span>
            ))}
          </p>

          <div className="mt-16 flex flex-wrap justify-center gap-8">
            {[
              { icon: Droplets, label: 'Water Saved', value: '50M+ Liters' },
              { icon: Wind, label: 'CO2 Offset', value: '120K Tons' },
              { icon: Leaf, label: 'Materials', value: '100% Organic' },
              { icon: Recycle, label: 'Recycled', value: '1M+ Bottles' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#0a201d]/5 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-[#1d4c43]" />
                </div>
                <div className="text-left">
                  <p className="text-lg font-bold text-[#0a201d]">{item.value}</p>
                  <p className="text-xs text-[#0a201d]/50">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== MATERIALS SHOWCASE ===== */}
      <section
        ref={materialsRef}
        className="py-24 lg:py-32 bg-[#0a201d]"
      >
        <div className="max-w-[1440px] mx-auto section-padding">
          <div className="text-center mb-16">
            <span className="text-xs font-medium text-[#83f0c7] uppercase tracking-wider">Sustainable Materials</span>
            <h2 className="text-4xl lg:text-5xl font-bold text-[#fffefa] mt-3">Choose Your Impact</h2>
            <p className="text-white/50 mt-4 max-w-2xl mx-auto">Every material we offer is carefully selected for its environmental credentials and wearing comfort.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {materials.map((mat) => (
              <div
                key={mat.name}
                className="material-card group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-500"
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={mat.image}
                    alt={mat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a201d] via-[#0a201d]/50 to-transparent" />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-[#fffefa]">{mat.name}</h3>
                    <span className="eco-badge">{mat.ecoScore}% Eco</span>
                  </div>
                  <p className="text-sm text-white/60 mb-4 line-clamp-2">{mat.description}</p>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="glass-card p-2 rounded-lg">
                      <p className="text-xs text-white/40">Water Saved</p>
                      <p className="text-sm font-semibold text-[#83f0c7]">{mat.waterSaved}</p>
                    </div>
                    <div className="glass-card p-2 rounded-lg">
                      <p className="text-xs text-white/40">Carbon</p>
                      <p className="text-sm font-semibold text-[#f5a623]">{mat.carbonFootprint}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/40">Lifespan:</span>
                    <span className="text-xs font-medium text-[#fffefa]">{mat.lifespan}</span>
                  </div>
                </div>
              </div>
            ))}

            {/* AI Material Card */}
            <div className="material-card group relative overflow-hidden rounded-2xl border border-[#83f0c7]/30 bg-gradient-to-br from-[#83f0c7]/10 to-[#1d4c43]/20 hover:border-[#83f0c7]/60 transition-all duration-500 flex flex-col items-center justify-center p-8 text-center">
              <Sparkles className="w-12 h-12 text-[#83f0c7] mb-4 animate-pulse-slow" />
              <h3 className="text-xl font-bold text-[#fffefa] mb-2">AI Material Predictor</h3>
              <p className="text-sm text-white/60 mb-6">Let our AI recommend the best material based on your lifestyle and preferences.</p>
              <Link to="/design-studio" className="btn-primary text-sm">
                Try AI Predictor
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURED PRODUCTS ===== */}
      <section
        ref={featuredRef}
        className="py-24 lg:py-32 bg-[#0a201d]"
      >
        <div className="max-w-[1440px] mx-auto section-padding">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-medium text-[#83f0c7] uppercase tracking-wider">Curated Collection</span>
              <h2 className="text-4xl lg:text-5xl font-bold text-[#fffefa] mt-3">Featured Tees</h2>
            </div>
            <Link to="/products" className="btn-secondary text-sm inline-flex items-center gap-2">
              View All
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="product-card group relative bg-white/5 rounded-2xl overflow-hidden border border-white/10 hover:border-[#83f0c7]/30 transition-all duration-500 hover:shadow-xl hover:shadow-[#83f0c7]/5"
              >
                {/* Image */}
                <Link to={`/product/${product.id}`} className="block aspect-[3/4] overflow-hidden relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a201d]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Badge */}
                  {product.badge && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-[#f5a623] text-[#0a201d] text-xs font-bold rounded-full">
                      {product.badge}
                    </span>
                  )}

                  {/* Eco Score */}
                  <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-[#0a201d]/80 backdrop-blur flex items-center justify-center">
                    <span className="text-xs font-bold text-[#83f0c7]">{product.ecoScore}</span>
                  </div>

                  {/* Quick Add */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      addToCart({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image: product.image,
                        color: product.colors[0],
                        size: product.sizes[1] || product.sizes[0],
                        material: product.material,
                        quantity: 1,
                      });
                    }}
                    className="absolute bottom-4 left-4 right-4 py-2.5 bg-[#1d4c43] text-white text-sm font-medium rounded-xl opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-[#2a6b5e]"
                  >
                    Quick Add
                  </button>
                </Link>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-center gap-1 mb-1">
                    <Star className="w-3 h-3 fill-[#f5a623] text-[#f5a623]" />
                    <span className="text-xs text-white/60">{product.rating}</span>
                    <span className="text-xs text-white/30">({product.reviews})</span>
                  </div>
                  <h3 className="text-sm font-semibold text-[#fffefa] truncate mb-1">{product.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-[#83f0c7]">₹{product.price}</span>
                    <span className="text-sm text-white/30 line-through">₹{product.originalPrice}</span>
                    <span className="text-xs text-[#f5a623]">
                      {Math.round((1 - product.price / product.originalPrice) * 100)}% off
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-1">
                    <Leaf className="w-3 h-3 text-[#83f0c7]" />
                    <span className="text-xs text-[#83f0c7]/70">{product.material}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== AI DESIGN STUDIO TEASER ===== */}
      <section
        ref={studioRef}
        className="py-24 lg:py-32 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #143a33 0%, #0a201d 100%)' }}
      >
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#83f0c7]/20 blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#f5a623]/10 blur-[100px]" />
        </div>

        <div className="max-w-[1440px] mx-auto section-padding relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="studio-content space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#83f0c7]/10 border border-[#83f0c7]/30 rounded-full">
                <Sparkles className="w-4 h-4 text-[#83f0c7]" />
                <span className="text-xs font-medium text-[#83f0c7] uppercase tracking-wider">AI-Powered Design</span>
              </div>

              <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-[#fffefa] leading-tight">
                Feels like cotton.<br />
                <span className="text-gradient">Behaves like the future.</span>
              </h2>

              <p className="text-lg text-white/60 leading-relaxed max-w-lg">
                Design with our AI. Describe your vision, choose your materials, and watch as our intelligent system creates a unique design tailored to your style and eco-preferences.
              </p>

              <div className="space-y-4">
                {[
                  { icon: Sparkles, text: 'AI-generated unique designs from text prompts' },
                  { icon: Leaf, text: 'Eco-friendly material recommendations with AI scoring' },
                  { icon: Droplets, text: 'Real-time water footprint and lifespan prediction' },
                  { icon: Recycle, text: 'One-click order with sustainable packaging' },
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#83f0c7]/10 flex items-center justify-center shrink-0">
                      <feature.icon className="w-4 h-4 text-[#83f0c7]" />
                    </div>
                    <span className="text-sm text-white/70">{feature.text}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4 pt-4">
                <Link to="/design-studio" className="btn-primary inline-flex items-center gap-2 text-base">
                  <Sparkles className="w-5 h-5" />
                  Start Designing
                </Link>
              </div>
            </div>

            {/* Design Preview */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-[#83f0c7]/10">
                <img
                  src="/images/products/tshirt_09.jpg"
                  alt="AI Design Preview"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a201d]/90 via-[#0a201d]/30 to-transparent" />

                {/* Floating Design Elements */}
                <div className="absolute top-6 right-6 glass-card px-4 py-3 rounded-xl animate-float">
                  <p className="text-xs text-white/50">AI Predicted Lifespan</p>
                  <p className="text-xl font-bold text-[#83f0c7]">5-7 Years</p>
                </div>

                <div className="absolute bottom-6 left-6 right-6">
                  <div className="glass-card p-4 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-[#fffefa]">Design Prompt</span>
                      <Sparkles className="w-4 h-4 text-[#83f0c7]" />
                    </div>
                    <p className="text-xs text-white/50 italic">"Tree ring pattern representing growth and sustainability, printed with algae-based bio-ink on deep teal organic cotton"</p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="eco-badge">Organic Cotton</span>
                      <span className="eco-badge">95% Eco Score</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TRUST BADGES ===== */}
      <section className="py-16 bg-[#0a201d] border-t border-white/5">
        <div className="max-w-[1440px] mx-auto section-padding">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Leaf, title: '100% Organic', desc: 'Certified sustainable materials' },
              { icon: Droplets, title: 'Water Positive', desc: 'We save more than we use' },
              { icon: Recycle, title: 'Zero Waste', desc: 'Circular production process' },
              { icon: Wind, title: 'Carbon Neutral', desc: 'Offset every shipment' },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="w-12 h-12 rounded-xl bg-[#83f0c7]/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-6 h-6 text-[#83f0c7]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#fffefa]">{item.title}</p>
                  <p className="text-xs text-white/50">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
