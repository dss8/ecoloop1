/**
 * Top toolbar — view (front/back), shirt color, zoom, undo/redo, save, share.
 */
import { useDesignStore } from "@/stores/useDesignStore";
import { TSHIRT_COLORS } from "@/types/design";
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Save,
  ShoppingCart,
  Shirt,
} from "lucide-react";
import type { ReactNode } from "react";

interface ToolbarProps {
  onSave: () => void;
  onAddToCart: () => void;
  isSaving: boolean;
  designName: string;
  onNameChange: (n: string) => void;
}

function ToolbarButton({
  onClick,
  disabled,
  children,
  testId,
  title,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
  testId?: string;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      data-testid={testId}
      className="p-2 rounded-lg text-white/60 hover:text-[#83f0c7] hover:bg-white/5 disabled:opacity-30 disabled:hover:text-white/60 disabled:hover:bg-transparent transition-all"
    >
      {children}
    </button>
  );
}

export default function StudioToolbar({
  onSave,
  onAddToCart,
  isSaving,
  designName,
  onNameChange,
}: ToolbarProps) {
  const view = useDesignStore((s) => s.view);
  const setView = useDesignStore((s) => s.setView);
  const tshirtColor = useDesignStore((s) => s.tshirtColor);
  const setTshirtColor = useDesignStore((s) => s.setTshirtColor);
  const zoom = useDesignStore((s) => s.zoom);
  const setZoom = useDesignStore((s) => s.setZoom);
  const undo = useDesignStore((s) => s.undo);
  const redo = useDesignStore((s) => s.redo);
  const canUndo = useDesignStore((s) => s.canUndo());
  const canRedo = useDesignStore((s) => s.canRedo());

  return (
    <div className="h-14 px-4 flex items-center gap-3 bg-[#0d2925] border-b border-white/10">
      {/* Left: design name */}
      <div className="flex items-center gap-2 min-w-[180px]">
        <Shirt className="w-4 h-4 text-[#83f0c7]" />
        <input
          value={designName}
          onChange={(e) => onNameChange(e.target.value)}
          data-testid="design-name-input"
          className="bg-transparent text-sm text-[#fffefa] placeholder:text-white/30 focus:outline-none focus:bg-white/5 px-2 py-1 rounded w-44"
          placeholder="Untitled design"
        />
      </div>

      {/* Centre: view toggle + shirt color */}
      <div className="flex items-center gap-2">
        <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/10">
          <button
            onClick={() => setView("front")}
            data-testid="view-front-button"
            className={`px-3 py-1 text-xs rounded transition-all ${
              view === "front" ? "bg-[#1d4c43] text-[#83f0c7]" : "text-white/50 hover:text-white"
            }`}
          >
            Front
          </button>
          <button
            onClick={() => setView("back")}
            data-testid="view-back-button"
            className={`px-3 py-1 text-xs rounded transition-all ${
              view === "back" ? "bg-[#1d4c43] text-[#83f0c7]" : "text-white/50 hover:text-white"
            }`}
          >
            Back
          </button>
        </div>

        <div className="h-6 w-px bg-white/10" />

        {/* Shirt colour swatches */}
        <div className="flex items-center gap-1" data-testid="tshirt-color-swatches">
          {TSHIRT_COLORS.map((c) => (
            <button
              key={c.value}
              onClick={() => setTshirtColor(c.value)}
              title={c.name}
              style={{ backgroundColor: c.value }}
              className={`w-6 h-6 rounded-full border-2 transition-all ${
                tshirtColor === c.value
                  ? "border-[#83f0c7] scale-110"
                  : "border-white/15 hover:border-white/40"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Right side: zoom, history, save, cart */}
      <div className="ml-auto flex items-center gap-1">
        <ToolbarButton onClick={() => undo()} disabled={!canUndo} testId="undo-button" title="Undo">
          <Undo2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => redo()} disabled={!canRedo} testId="redo-button" title="Redo">
          <Redo2 className="w-4 h-4" />
        </ToolbarButton>

        <div className="h-6 w-px bg-white/10 mx-1" />

        <ToolbarButton onClick={() => setZoom(zoom - 0.1)} testId="zoom-out-button" title="Zoom out">
          <ZoomOut className="w-4 h-4" />
        </ToolbarButton>
        <span className="text-[11px] text-white/50 w-10 text-center" data-testid="zoom-level">
          {Math.round(zoom * 100)}%
        </span>
        <ToolbarButton onClick={() => setZoom(zoom + 0.1)} testId="zoom-in-button" title="Zoom in">
          <ZoomIn className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => setZoom(1)} testId="zoom-fit-button" title="Reset zoom">
          <Maximize2 className="w-4 h-4" />
        </ToolbarButton>

        <div className="h-6 w-px bg-white/10 mx-1" />

        <button
          onClick={onSave}
          disabled={isSaving}
          data-testid="save-design-button"
          className="px-3 py-1.5 text-xs rounded-lg border border-white/10 text-white/70 hover:border-[#83f0c7]/30 hover:text-[#83f0c7] transition-all flex items-center gap-1.5 disabled:opacity-50"
        >
          {isSaving ? (
            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          Save
        </button>
        <button
          onClick={onAddToCart}
          data-testid="studio-add-to-cart-button"
          className="ml-1 px-3 py-1.5 text-xs rounded-lg bg-[#1d4c43] text-white hover:bg-[#2a6b5e] transition-all flex items-center gap-1.5 font-medium"
        >
          <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
        </button>
      </div>
    </div>
  );
}
