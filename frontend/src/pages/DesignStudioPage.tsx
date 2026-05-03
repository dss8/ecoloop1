import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Leaf, Palette, Type, Shirt, ArrowRight, Download, Wand2, Droplets, Wind, Recycle, RotateCcw, Check, ShoppingCart, Save } from 'lucide-react';
import { materials } from '@/data/products';
import { useStore } from '@/stores/useStore';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const colorPalettes = [
  { name: 'Forest', colors: ['#2d5a3d', '#1a3d2e', '#4a7c59', '#6b8f6b'] },
  { name: 'Ocean', colors: ['#1e5f8e', '#164d73', '#2a75a8', '#4a9bc7'] },
  { name: 'Earth', colors: ['#8b4513', '#a0522d', '#c4714e', '#d4a55e'] },
  { name: 'Sunset', colors: ['#e8837a', '#d47068', '#f5a623', '#f29890'] },
  { name: 'Monochrome', colors: ['#1a1a1a', '#4a4a4a', '#8a8a8a', '#fafafa'] },
  { name: 'Pastel', colors: ['#d4a5d4', '#a5c4d4', '#d4c4a5', '#c4d4a5'] },
];

const designTemplates = [
  'Minimalist leaf pattern',
  'Geometric mountain scene',
  'Abstract wave design',
  'Botanical illustration',
  'Constellation star map',
  'Tribal nature motif',
  'Watercolor flowers',
  'Vintage tree ring',
];

const fontStyles = [
  { name: 'Modern', class: 'font-sans' },
  { name: 'Elegant', class: 'font-serif' },
  { name: 'Bold', class: 'font-bold' },
];

export default function DesignStudioPage() {
  const navigate = useNavigate();
  const { addToCart } = useStore();
  const { user: fbUser, configured } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  // generatedDesign stores the AI image data URI ("data:image/png;base64,...") or null
  const [generatedDesign, setGeneratedDesign] = useState<string | null>(null);
  const [generatedImageEl, setGeneratedImageEl] = useState<HTMLImageElement | null>(null);
  const [selectedPalette, setSelectedPalette] = useState(colorPalettes[0]);
  const [text, setText] = useState('ECOLOOP');
  const [selectedFont, setSelectedFont] = useState(fontStyles[0]);
  const [textColor, setTextColor] = useState('#ffffff');
  const [selectedMaterial, setSelectedMaterial] = useState(materials[0]);
  const [tshirtColor, setTshirtColor] = useState('#2d5a3d');
  const [textPosition, setTextPosition] = useState<'center' | 'top' | 'bottom'>('center');
  const [activeTab, setActiveTab] = useState<'ai' | 'manual'>('ai');
  const [designScale, setDesignScale] = useState<number>(1.0);

  // Draw t-shirt preview on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 600;
    canvas.height = 700;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = '#0a201d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // T-shirt shape (simplified)
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2 - 20;

    // T-shirt body
    ctx.fillStyle = tshirtColor;
    ctx.beginPath();
    // Left sleeve
    ctx.moveTo(centerX - 140, centerY - 120);
    ctx.lineTo(centerX - 200, centerY - 60);
    ctx.lineTo(centerX - 170, centerY - 20);
    // Left side
    ctx.lineTo(centerX - 130, centerY + 200);
    ctx.lineTo(centerX + 130, centerY + 200);
    // Right side
    ctx.lineTo(centerX + 170, centerY - 20);
    ctx.lineTo(centerX + 200, centerY - 60);
    // Right sleeve
    ctx.lineTo(centerX + 140, centerY - 120);
    // Neck
    ctx.quadraticCurveTo(centerX, centerY - 100, centerX - 140, centerY - 120);
    ctx.fill();

    // Neck hole
    ctx.fillStyle = '#0a201d';
    ctx.beginPath();
    ctx.arc(centerX, centerY - 110, 40, 0, Math.PI * 2);
    ctx.fill();

    // Design overlay (generated AI image)
    if (generatedImageEl && generatedImageEl.complete && generatedImageEl.naturalWidth > 0) {
      const targetSize = 220 * designScale;
      const dx = centerX - targetSize / 2;
      const dy = centerY - targetSize / 2 - 5;
      ctx.save();
      ctx.beginPath();
      // Clip to a soft rounded square for nicer placement
      const radius = 14;
      ctx.moveTo(dx + radius, dy);
      ctx.arcTo(dx + targetSize, dy, dx + targetSize, dy + targetSize, radius);
      ctx.arcTo(dx + targetSize, dy + targetSize, dx, dy + targetSize, radius);
      ctx.arcTo(dx, dy + targetSize, dx, dy, radius);
      ctx.arcTo(dx, dy, dx + targetSize, dy, radius);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(generatedImageEl, dx, dy, targetSize, targetSize);
      ctx.restore();
    } else if (generatedDesign) {
      // Fallback (still loading) — show prompt text placeholder
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.beginPath();
      ctx.ellipse(centerX, centerY - 10, 80, 100, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#83f0c7';
      ctx.font = '14px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('Loading design…', centerX, centerY);
    }

    // Text on t-shirt
    if (text) {
      ctx.fillStyle = textColor;
      ctx.font = `${selectedFont.name === 'Bold' ? 'bold' : ''} 32px ${selectedFont.name === 'Elegant' ? 'serif' : 'sans-serif'}`;
      ctx.textAlign = 'center';

      let textY = centerY;
      if (textPosition === 'top') textY = centerY - 60;
      if (textPosition === 'bottom') textY = centerY + 60;

      ctx.fillText(text, centerX, textY);
    }

    // Material indicator
    ctx.fillStyle = 'rgba(131, 240, 199, 0.2)';
    ctx.font = '12px Inter';
    ctx.textAlign = 'right';
    ctx.fillText(selectedMaterial.name, canvas.width - 20, canvas.height - 20);

  }, [tshirtColor, text, textColor, selectedFont, textPosition, generatedDesign, generatedImageEl, selectedMaterial, designScale]);

  // Load AI image when generatedDesign data URI changes
  useEffect(() => {
    if (!generatedDesign) {
      setGeneratedImageEl(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setGeneratedImageEl(img);
    img.onerror = () => {
      toast.error('Failed to load generated image');
      setGeneratedImageEl(null);
    };
    img.src = generatedDesign;
  }, [generatedDesign]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a design description');
      return;
    }
    setIsGenerating(true);
    try {
      const res = await api<{ image_base64: string; mime_type: string }>(`/generate-design`, {
        method: 'POST',
        body: { prompt: prompt.trim() },
      });
      setGeneratedDesign(res.image_base64);
      toast.success('AI design generated! 🌿');
    } catch (e) {
      const msg = (e as Error).message || 'Generation failed';
      toast.error(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveDesign = async () => {
    if (!generatedDesign) {
      toast.error('Generate a design first');
      return;
    }
    if (configured && !fbUser) {
      toast.error('Please log in to save designs');
      navigate('/login');
      return;
    }
    setIsSaving(true);
    try {
      await api(`/saved-designs`, {
        method: 'POST',
        auth: true,
        body: {
          prompt,
          image_base64: generatedDesign,
          tshirt_color: tshirtColor,
          text,
          text_color: textColor,
          material: selectedMaterial.name,
        },
      });
      toast.success('Design saved to your dashboard!');
    } catch (e) {
      toast.error((e as Error).message || 'Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddToCart = () => {
    const designData = JSON.stringify({
      prompt,
      text,
      tshirtColor,
      textColor,
      font: selectedFont.name,
      material: selectedMaterial.name,
    });

    addToCart({
      id: Date.now(),
      name: `Custom Design: ${text || 'AI Design'}`,
      price: 1299,
      image: '/images/hero/blank_tshirt.png',
      color: tshirtColor,
      size: 'M',
      material: selectedMaterial.name,
      quantity: 1,
      isCustom: true,
      designData,
    });

    toast.success('Custom design added to cart!');
  };

  const handleDownloadDesign = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'ecoloop-custom-design.png';
    link.href = canvas.toDataURL();
    link.click();
    toast.success('Design downloaded!');
  };

  // AI lifespan prediction
  const aiPrediction = {
    lifespan: selectedMaterial.lifespan,
    waterSaved: selectedMaterial.waterSaved,
    carbonSaved: `${(4.5 - parseFloat(selectedMaterial.carbonFootprint)).toFixed(1)} kg CO2`,
    ecoRating: selectedMaterial.ecoScore > 90 ? 'Excellent' : selectedMaterial.ecoScore > 85 ? 'Very Good' : 'Good',
  };

  return (
    <div className="min-h-screen bg-[#0a201d] pt-8 pb-16">
      <div className="max-w-[1440px] mx-auto section-padding">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Link to="/" className="text-sm text-white/50 hover:text-[#83f0c7]">Home</Link>
            <ArrowRight className="w-4 h-4 text-white/30" />
            <span className="text-sm text-[#83f0c7]">Design Studio</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-[#fffefa]">
            {activeTab === 'ai' ? 'AI Design Studio' : 'Manual Design Studio'}
          </h1>
          <p className="text-sm text-white/50 mt-2">
            {activeTab === 'ai'
              ? 'Describe your vision and let our AI create a unique eco-friendly design'
              : 'Design your t-shirt manually with colors, text, and patterns'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 mb-8 p-1 bg-white/5 rounded-xl w-fit border border-white/10">
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'ai' ? 'bg-[#1d4c43] text-[#83f0c7]' : 'text-white/60 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2">
              <Wand2 className="w-4 h-4" />
              AI Design
            </span>
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'manual' ? 'bg-[#1d4c43] text-[#83f0c7]' : 'text-white/60 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Manual Design
            </span>
          </button>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-4 space-y-6">
            {/* AI Prompt Section */}
            {activeTab === 'ai' && (
              <div className="glass-card p-5 rounded-xl">
                <h3 className="text-sm font-semibold text-[#fffefa] mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#83f0c7]" />
                  AI Design Prompt
                </h3>
                <textarea
                  data-testid="design-prompt-input"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your design: 'A minimalist mountain landscape with pine trees at sunset'..."
                  className="w-full h-28 p-4 bg-white/5 border border-white/10 rounded-xl text-sm text-[#fffefa] placeholder:text-white/30 focus:outline-none focus:border-[#83f0c7]/50 resize-none"
                />
                <div className="flex flex-wrap gap-2 mt-3">
                  {designTemplates.map((template) => (
                    <button
                      key={template}
                      onClick={() => setPrompt(template)}
                      className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-white/60 hover:text-[#83f0c7] hover:border-[#83f0c7]/30 transition-all"
                    >
                      {template}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  data-testid="generate-design-button"
                  className="w-full mt-4 btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Generating with Nano Banana…
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5" />
                      Generate Design
                    </>
                  )}
                </button>

                {generatedDesign && (
                  <div className="mt-4 space-y-3">
                    <div>
                      <p className="text-xs text-white/50 mb-2">Design Size</p>
                      <input
                        data-testid="design-size-slider"
                        type="range"
                        min="0.5"
                        max="1.4"
                        step="0.05"
                        value={designScale}
                        onChange={(e) => setDesignScale(parseFloat(e.target.value))}
                        className="w-full accent-[#83f0c7]"
                      />
                    </div>
                    <button
                      onClick={handleSaveDesign}
                      disabled={isSaving}
                      data-testid="save-design-button"
                      className="w-full btn-secondary flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSaving ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save to My Designs
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Text Design Section */}
            <div className="glass-card p-5 rounded-xl">
              <h3 className="text-sm font-semibold text-[#fffefa] mb-4 flex items-center gap-2">
                <Type className="w-4 h-4 text-[#83f0c7]" />
                Add Text
              </h3>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Your text here"
                maxLength={20}
                className="w-full h-10 px-4 bg-white/5 border border-white/10 rounded-lg text-sm text-[#fffefa] placeholder:text-white/30 focus:outline-none focus:border-[#83f0c7]/50 mb-3"
              />

              {/* Font Selection */}
              <div className="flex gap-2 mb-3">
                {fontStyles.map((font) => (
                  <button
                    key={font.name}
                    onClick={() => setSelectedFont(font)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                      selectedFont.name === font.name
                        ? 'bg-[#1d4c43] text-[#83f0c7]'
                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    {font.name}
                  </button>
                ))}
              </div>

              {/* Text Color */}
              <div className="mb-3">
                <p className="text-xs text-white/50 mb-2">Text Color</p>
                <div className="flex items-center gap-2">
                  {['#ffffff', '#0a201d', '#83f0c7', '#f5a623', '#ff6b6b'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setTextColor(color)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        textColor === color ? 'border-[#83f0c7] scale-110' : 'border-white/20'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Text Position */}
              <div>
                <p className="text-xs text-white/50 mb-2">Position</p>
                <div className="flex gap-2">
                  {(['top', 'center', 'bottom'] as const).map((pos) => (
                    <button
                      key={pos}
                      onClick={() => setTextPosition(pos)}
                      className={`flex-1 py-2 rounded-lg text-xs capitalize transition-all ${
                        textPosition === pos
                          ? 'bg-[#1d4c43] text-[#83f0c7]'
                          : 'bg-white/5 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* T-Shirt Color */}
            <div className="glass-card p-5 rounded-xl">
              <h3 className="text-sm font-semibold text-[#fffefa] mb-4 flex items-center gap-2">
                <Shirt className="w-4 h-4 text-[#83f0c7]" />
                T-Shirt Color
              </h3>
              <div className="space-y-3">
                {colorPalettes.map((palette) => (
                  <button
                    key={palette.name}
                    onClick={() => {
                      setSelectedPalette(palette);
                      setTshirtColor(palette.colors[0]);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                      selectedPalette.name === palette.name
                        ? 'bg-[#1d4c43]/50 border border-[#83f0c7]/30'
                        : 'bg-white/5 border border-transparent hover:bg-white/10'
                    }`}
                  >
                    <div className="flex gap-1">
                      {palette.colors.map((color) => (
                        <div
                          key={color}
                          className="w-6 h-6 rounded-full border border-white/20"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-white/70">{palette.name}</span>
                    {selectedPalette.name === palette.name && (
                      <Check className="w-4 h-4 text-[#83f0c7] ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Material Selection */}
            <div className="glass-card p-5 rounded-xl">
              <h3 className="text-sm font-semibold text-[#fffefa] mb-4 flex items-center gap-2">
                <Leaf className="w-4 h-4 text-[#83f0c7]" />
                Choose Material
              </h3>
              <div className="space-y-2">
                {materials.map((mat) => (
                  <button
                    key={mat.name}
                    onClick={() => setSelectedMaterial(mat)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                      selectedMaterial.name === mat.name
                        ? 'bg-[#1d4c43]/50 border border-[#83f0c7]/30'
                        : 'bg-white/5 border border-transparent hover:bg-white/10'
                    }`}
                  >
                    <img src={mat.image} alt={mat.name} className="w-10 h-10 rounded-lg object-cover" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-[#fffefa]">{mat.name}</p>
                      <p className="text-xs text-white/50">{mat.ecoScore}% Eco Score</p>
                    </div>
                    {selectedMaterial.name === mat.name && (
                      <Check className="w-4 h-4 text-[#83f0c7] ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="lg:col-span-8 space-y-6">
            {/* Canvas Preview */}
            <div className="glass-card p-6 rounded-xl border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-[#fffefa]">Live Preview</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadDesign}
                    className="p-2 rounded-lg bg-white/5 text-white/60 hover:text-[#83f0c7] hover:bg-white/10 transition-all"
                    title="Download Design"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setPrompt('');
                      setGeneratedDesign(null);
                      setText('ECOLOOP');
                      setTshirtColor('#2d5a3d');
                    }}
                    className="p-2 rounded-lg bg-white/5 text-white/60 hover:text-red-400 hover:bg-white/10 transition-all"
                    title="Reset"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex justify-center">
                <canvas
                  ref={canvasRef}
                  className="max-w-full rounded-xl border border-white/10"
                  style={{ maxHeight: '500px' }}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAddToCart}
                  data-testid="add-to-cart-button"
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart - ₹1,299
                </button>
                <button
                  onClick={() => {
                    handleAddToCart();
                    navigate('/checkout');
                  }}
                  className="flex-1 bg-[#f5a623] text-[#0a201d] font-semibold px-6 py-3 rounded-full hover:bg-[#e09513] transition-all flex items-center justify-center gap-2"
                >
                  Buy Now
                </button>
              </div>
            </div>

            {/* AI Prediction Panel */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="glass-card p-5 rounded-xl border border-[#83f0c7]/20">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-[#83f0c7]" />
                  <h4 className="text-sm font-semibold text-[#83f0c7]">AI Lifespan Prediction</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/50">Predicted Lifespan</span>
                    <span className="text-sm font-bold text-[#fffefa]">{aiPrediction.lifespan}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/50">Eco Rating</span>
                    <span className="text-sm font-bold text-[#83f0c7]">{aiPrediction.ecoRating}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/50">Material Score</span>
                    <span className="text-sm font-bold text-[#f5a623]">{selectedMaterial.ecoScore}/100</span>
                  </div>
                </div>
              </div>

              <div className="glass-card p-5 rounded-xl border border-[#83f0c7]/20">
                <div className="flex items-center gap-2 mb-4">
                  <Leaf className="w-5 h-5 text-[#83f0c7]" />
                  <h4 className="text-sm font-semibold text-[#83f0c7]">Environmental Impact</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/50 flex items-center gap-1">
                      <Droplets className="w-3 h-3" /> Water Saved
                    </span>
                    <span className="text-sm font-bold text-[#83f0c7]">{aiPrediction.waterSaved}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/50 flex items-center gap-1">
                      <Wind className="w-3 h-3" /> Carbon Saved
                    </span>
                    <span className="text-sm font-bold text-[#f5a623]">{aiPrediction.carbonSaved}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/50 flex items-center gap-1">
                      <Recycle className="w-3 h-3" /> Recyclable
                    </span>
                    <span className="text-sm font-bold text-[#83f0c7]">100%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Certifications */}
            <div className="glass-card p-5 rounded-xl">
              <h4 className="text-sm font-semibold text-[#fffefa] mb-4">Material Certifications</h4>
              <div className="flex flex-wrap gap-2">
                {selectedMaterial.certifications.map((cert) => (
                  <span
                    key={cert}
                    className="px-3 py-1.5 bg-[#83f0c7]/10 text-[#83f0c7] text-xs font-medium rounded-full border border-[#83f0c7]/20"
                  >
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
