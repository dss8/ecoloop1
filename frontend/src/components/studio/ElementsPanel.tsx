/**
 * Left sidebar — add elements (text/image/shape), AI generate, templates.
 */
import { useRef, useState } from "react";
import { useDesignStore } from "@/stores/useDesignStore";
import { toast } from "sonner";
import {
  Type,
  Sparkles,
  Square,
  Circle as CircleIcon,
  Star as StarIcon,
  Triangle,
  Heart,
  Wand2,
  Upload,
  Shapes,
} from "lucide-react";
import { api } from "@/lib/api";

const SHAPE_OPTIONS: {
  shape: "rect" | "circle" | "star" | "triangle" | "heart";
  label: string;
  Icon: React.ElementType;
}[] = [
  { shape: "rect", label: "Square", Icon: Square },
  { shape: "circle", label: "Circle", Icon: CircleIcon },
  { shape: "star", label: "Star", Icon: StarIcon },
  { shape: "triangle", label: "Triangle", Icon: Triangle },
  { shape: "heart", label: "Heart", Icon: Heart },
];

const PROMPT_TEMPLATES = [
  "Ganpati festival design",
  "Minimalist mountain at sunset",
  "Botanical leaf illustration",
  "Geometric tribal print",
  "Vintage tree ring pattern",
  "Watercolor flowers bouquet",
  "Constellation star map",
  "Abstract ocean wave",
];

export default function ElementsPanel() {
  const addText = useDesignStore((s) => s.addText);
  const addShape = useDesignStore((s) => s.addShape);
  const addImage = useDesignStore((s) => s.addImage);
  const fileRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<"add" | "ai">("add");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 6 * 1024 * 1024) {
      toast.error("Image too large (max 6 MB)");
      return;
    }
    const dataUrl = await new Promise<string>((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result as string);
      r.onerror = rej;
      r.readAsDataURL(file);
    });
    const img = new Image();
    img.onload = () => {
      addImage(dataUrl, img.naturalWidth, img.naturalHeight);
      toast.success("Image added");
    };
    img.onerror = () => toast.error("Could not read image");
    img.src = dataUrl;
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Describe your design first");
      return;
    }
    setIsGenerating(true);
    try {
      const res = await api<{ image_base64: string; mime_type: string }>(
        "/generate-design",
        { method: "POST", body: { prompt: prompt.trim() } },
      );
      // Get natural dimensions for proper aspect ratio
      const img = new Image();
      img.onload = () => {
        addImage(res.image_base64, img.naturalWidth, img.naturalHeight);
        toast.success("AI design added to canvas");
      };
      img.onerror = () => toast.error("Could not load generated image");
      img.src = res.image_base64;
    } catch (e) {
      toast.error((e as Error).message || "Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      className="h-full flex flex-col bg-[#0d2925] border-r border-white/10 w-[260px] flex-shrink-0"
      data-testid="elements-panel"
    >
      <div className="flex border-b border-white/10">
        <button
          onClick={() => setActiveTab("add")}
          data-testid="tab-add-elements"
          className={`flex-1 py-3 text-xs font-medium transition-colors ${
            activeTab === "add"
              ? "text-[#83f0c7] border-b-2 border-[#83f0c7]"
              : "text-white/50 hover:text-white"
          }`}
        >
          Elements
        </button>
        <button
          onClick={() => setActiveTab("ai")}
          data-testid="tab-ai-generate"
          className={`flex-1 py-3 text-xs font-medium transition-colors ${
            activeTab === "ai"
              ? "text-[#83f0c7] border-b-2 border-[#83f0c7]"
              : "text-white/50 hover:text-white"
          }`}
        >
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> AI Studio
          </span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5 scroll-hidden">
        {activeTab === "add" && (
          <>
            <div>
              <h4 className="text-[10px] uppercase tracking-wider text-white/40 mb-2">
                Add Text
              </h4>
              <button
                onClick={() => addText()}
                data-testid="add-text-button"
                className="w-full flex items-center gap-3 px-3 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-left group"
              >
                <Type className="w-4 h-4 text-[#83f0c7]" />
                <div>
                  <p className="text-sm text-[#fffefa] font-medium">Add a heading</p>
                  <p className="text-[10px] text-white/40">Drag to position</p>
                </div>
              </button>
            </div>

            <div>
              <h4 className="text-[10px] uppercase tracking-wider text-white/40 mb-2">
                Upload
              </h4>
              <button
                onClick={() => fileRef.current?.click()}
                data-testid="upload-image-button"
                className="w-full flex items-center gap-3 px-3 py-3 bg-white/5 hover:bg-white/10 border border-dashed border-white/15 rounded-xl transition-all text-left"
              >
                <Upload className="w-4 h-4 text-[#83f0c7]" />
                <div>
                  <p className="text-sm text-[#fffefa] font-medium">Upload image</p>
                  <p className="text-[10px] text-white/40">PNG, JPG (max 6 MB)</p>
                </div>
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(file);
                  e.target.value = "";
                }}
              />
            </div>

            <div>
              <h4 className="text-[10px] uppercase tracking-wider text-white/40 mb-2">
                Shapes
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {SHAPE_OPTIONS.map(({ shape, label, Icon }) => (
                  <button
                    key={shape}
                    onClick={() => addShape(shape)}
                    data-testid={`add-shape-${shape}`}
                    title={label}
                    className="aspect-square flex items-center justify-center bg-white/5 hover:bg-[#83f0c7]/15 hover:text-[#83f0c7] border border-white/10 rounded-lg text-white/60 transition-all"
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-white/5">
              <h4 className="text-[10px] uppercase tracking-wider text-white/40 mb-2 flex items-center gap-1.5">
                <Shapes className="w-3 h-3" /> Quick text
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {["ECOLOOP", "Plant Mom", "Save Earth", "Eco Vibes"].map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      const id = addText();
                      // update text after creation via store
                      useDesignStore.getState().updateElement(id, {
                        text: q,
                      } as Partial<import("@/types/design").TextElement>);
                    }}
                    className="px-2.5 py-1 text-[11px] bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white/60"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === "ai" && (
          <div className="space-y-4">
            <div className="rounded-xl bg-gradient-to-br from-[#83f0c7]/10 to-[#1d4c43]/30 border border-[#83f0c7]/20 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-[#83f0c7]" />
                <h4 className="text-sm font-semibold text-[#fffefa]">Nano Banana</h4>
              </div>
              <p className="text-[11px] text-white/50">
                Describe your idea and let AI generate a print-ready design.
              </p>
            </div>

            <textarea
              data-testid="design-prompt-input"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A minimalist Ganpati design with golden details…"
              className="w-full h-28 p-3 bg-white/5 border border-white/10 rounded-xl text-sm text-[#fffefa] placeholder:text-white/30 focus:outline-none focus:border-[#83f0c7]/50 resize-none"
            />

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              data-testid="generate-design-button"
              className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" /> Generate
                </>
              )}
            </button>

            <div>
              <h4 className="text-[10px] uppercase tracking-wider text-white/40 mb-2">
                Try a template
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {PROMPT_TEMPLATES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setPrompt(t)}
                    className="px-2.5 py-1 text-[11px] bg-white/5 hover:bg-[#83f0c7]/15 hover:text-[#83f0c7] border border-white/10 rounded-full text-white/60 transition-all"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
