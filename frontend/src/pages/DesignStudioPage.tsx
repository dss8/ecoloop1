/**
 * ECOLOOP Design Studio — Canva-style interactive editor.
 *
 * Layout:
 *   ┌─────────────────────── toolbar ─────────────────────┐
 *   │  name | front/back | shirt colour | zoom | save     │
 *   ├─────────┬───────────────────────────┬──────────────┤
 *   │elements │       Konva canvas        │   layers +   │
 *   │ panel   │       (t-shirt)           │ properties   │
 *   └─────────┴───────────────────────────┴──────────────┘
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { toast } from "sonner";
import StudioToolbar from "@/components/studio/StudioToolbar";
import ElementsPanel from "@/components/studio/ElementsPanel";
import LayersPanel from "@/components/studio/LayersPanel";
import DesignCanvas from "@/components/studio/DesignCanvas";
import { useDesignStore } from "@/stores/useDesignStore";
import { useStore } from "@/stores/useStore";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { ArrowRight } from "lucide-react";

const PRICE = 1299;

export default function DesignStudioPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");

  const elements = useDesignStore((s) => s.elements);
  const view = useDesignStore((s) => s.view);
  const tshirtColor = useDesignStore((s) => s.tshirtColor);
  const material = useDesignStore((s) => s.material);
  const name = useDesignStore((s) => s.name);
  const setName = useDesignStore((s) => s.setName);
  const loadCanvas = useDesignStore((s) => s.loadCanvas);
  const resetCanvas = useDesignStore((s) => s.resetCanvas);

  const addToCart = useStore((s) => s.addToCart);
  const { user: fbUser, configured } = useAuth();

  const [isSaving, setIsSaving] = useState(false);
  const [editingDesignId, setEditingDesignId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 700, height: 720 });

  // Reset on mount, then optionally load an existing design
  useEffect(() => {
    resetCanvas();
    if (editId) {
      (async () => {
        try {
          const all = await api<Array<{ id: string; canvas_json?: string; prompt: string }>>(
            "/saved-designs",
            { auth: true },
          );
          const target = all.find((d) => d.id === editId);
          if (target?.canvas_json) {
            const parsed = JSON.parse(target.canvas_json);
            loadCanvas(parsed);
            setEditingDesignId(target.id);
            toast.success("Design loaded");
          }
        } catch (e) {
          toast.error("Could not load saved design");
        }
      })();
    }
  }, [editId, loadCanvas, resetCanvas]);

  // Keep canvas sized to its container
  useEffect(() => {
    const obs = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setContainerSize({ width: Math.max(320, width), height: Math.max(400, height) });
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const canvasJson = useMemo(
    () =>
      JSON.stringify({
        elements,
        view,
        tshirtColor,
        material,
        name,
      }),
    [elements, view, tshirtColor, material, name],
  );

  const handleSave = async () => {
    if (configured && !fbUser) {
      toast.error("Please log in to save designs");
      navigate("/login");
      return;
    }
    if (elements.length === 0) {
      toast.error("Add at least one element first");
      return;
    }
    setIsSaving(true);
    try {
      // Try to find a generated AI image to use as preview
      const firstImg = elements.find((e) => e.type === "image");
      const previewImage = firstImg && firstImg.type === "image" ? firstImg.src : "";

      await api("/saved-designs", {
        method: "POST",
        auth: true,
        body: {
          prompt: name,
          image_base64: previewImage,
          tshirt_color: tshirtColor,
          text: elements.find((e) => e.type === "text")?.text || "",
          text_color:
            (elements.find((e) => e.type === "text") as { fill?: string } | undefined)?.fill ||
            "#ffffff",
          material,
          canvas_json: canvasJson,
        },
      });
      toast.success("Design saved to history!");
    } catch (e) {
      toast.error((e as Error).message || "Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddToCart = () => {
    if (elements.length === 0) {
      toast.error("Add at least one element first");
      return;
    }
    const text = elements.find((e) => e.type === "text");
    const itemName = `Custom: ${name || (text && "text" in text ? text.text : "Design")}`;
    addToCart({
      id: Date.now(),
      name: itemName.slice(0, 60),
      price: PRICE,
      image: "/images/hero/blank_tshirt.png",
      color: tshirtColor,
      size: "M",
      material,
      quantity: 1,
      isCustom: true,
      designData: canvasJson,
    });
    toast.success("Added to cart!");
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-[#0a201d]" data-testid="design-studio">
      {/* Breadcrumb */}
      <div className="px-4 py-2 text-xs flex items-center gap-2 border-b border-white/5">
        <Link to="/" className="text-white/50 hover:text-[#83f0c7]">
          Home
        </Link>
        <ArrowRight className="w-3 h-3 text-white/30" />
        <span className="text-[#83f0c7]">Design Studio</span>
        {editingDesignId && (
          <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-[#83f0c7]/15 text-[#83f0c7] font-medium">
            EDITING SAVED DESIGN
          </span>
        )}
      </div>

      <StudioToolbar
        onSave={handleSave}
        onAddToCart={handleAddToCart}
        isSaving={isSaving}
        designName={name}
        onNameChange={setName}
      />

      <div className="flex-1 flex min-h-0">
        <ElementsPanel />

        <div
          ref={containerRef}
          className="flex-1 min-h-0 relative bg-gradient-to-br from-[#0a201d] via-[#0d2925] to-[#0a201d]"
          data-testid="canvas-container"
        >
          {/* dot grid */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(131,240,199,0.08) 1px, transparent 1px)",
              backgroundSize: "16px 16px",
            }}
          />
          <DesignCanvas
            containerWidth={containerSize.width}
            containerHeight={containerSize.height}
          />

          {/* Footer hint */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-wider text-white/30">
            Click an element to edit • Scroll to zoom • Drag to move
          </div>
        </div>

        <LayersPanel />
      </div>
    </div>
  );
}
