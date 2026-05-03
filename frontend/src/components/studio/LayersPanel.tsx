/**
 * Right sidebar — Layers and contextual Properties.
 */
import { useDesignStore } from "@/stores/useDesignStore";
import {
  Type,
  Image as ImageIcon,
  Square,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Lock,
  Unlock,
} from "lucide-react";
import type { CanvasElement } from "@/types/design";
import {
  FONT_FAMILIES,
  PALETTE_COLORS,
} from "@/types/design";

function elementLabel(el: CanvasElement): string {
  if (el.type === "text") return el.text.slice(0, 18) || "Text";
  if (el.type === "image") return "Image";
  return `Shape: ${el.shape}`;
}

function ElementIcon({ el }: { el: CanvasElement }) {
  if (el.type === "text") return <Type className="w-3.5 h-3.5" />;
  if (el.type === "image") return <ImageIcon className="w-3.5 h-3.5" />;
  return <Square className="w-3.5 h-3.5" />;
}

export default function LayersPanel() {
  const elements = useDesignStore((s) => s.elements);
  const view = useDesignStore((s) => s.view);
  const selectedId = useDesignStore((s) => s.selectedId);
  const setSelected = useDesignStore((s) => s.setSelected);
  const update = useDesignStore((s) => s.updateElement);
  const remove = useDesignStore((s) => s.removeElement);
  const dup = useDesignStore((s) => s.duplicateElement);
  const fwd = useDesignStore((s) => s.bringForward);
  const back = useDesignStore((s) => s.sendBackward);

  // Render list top-to-bottom so the "front-most" appears first.
  const list = elements.filter((e) => e.view === view).slice().reverse();
  const selected = elements.find((e) => e.id === selectedId) || null;

  return (
    <aside
      className="h-full flex flex-col bg-[#0d2925] border-l border-white/10 w-[280px] flex-shrink-0"
      data-testid="layers-panel"
    >
      <div className="px-4 py-3 border-b border-white/10">
        <h3 className="text-xs uppercase tracking-wider text-white/40 font-semibold">
          Layers
        </h3>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1 scroll-hidden">
        {list.length === 0 ? (
          <p className="text-xs text-white/30 px-3 py-6 text-center">
            No layers yet — add text, an image, or generate one with AI.
          </p>
        ) : (
          list.map((el) => {
            const active = selectedId === el.id;
            return (
              <div
                key={el.id}
                onClick={() => setSelected(el.id)}
                data-testid={`layer-${el.id}`}
                className={`group flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-all border ${
                  active
                    ? "bg-[#83f0c7]/10 border-[#83f0c7]/30"
                    : "bg-white/[0.02] border-transparent hover:bg-white/5"
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-md flex items-center justify-center ${
                    active ? "text-[#83f0c7]" : "text-white/50"
                  }`}
                >
                  <ElementIcon el={el} />
                </span>
                <span
                  className={`flex-1 truncate text-xs ${
                    active ? "text-[#fffefa]" : "text-white/70"
                  }`}
                >
                  {elementLabel(el)}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    update(el.id, { visible: !el.visible });
                  }}
                  className="text-white/30 hover:text-white/80"
                  title={el.visible ? "Hide" : "Show"}
                >
                  {el.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    update(el.id, { locked: !el.locked });
                  }}
                  className="text-white/30 hover:text-white/80"
                  title={el.locked ? "Unlock" : "Lock"}
                >
                  {el.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                </button>
              </div>
            );
          })
        )}
      </div>

      {selected && (
        <div className="border-t border-white/10 p-3 space-y-3 bg-[#0a201d] max-h-[60vh] overflow-y-auto scroll-hidden" data-testid="properties-panel">
          <div className="flex items-center justify-between">
            <h3 className="text-xs uppercase tracking-wider text-white/40 font-semibold">
              {selected.type === "text"
                ? "Text"
                : selected.type === "image"
                  ? "Image"
                  : "Shape"}{" "}
              properties
            </h3>
            <div className="flex items-center gap-1">
              <button
                onClick={() => fwd(selected.id)}
                title="Bring forward"
                data-testid="bring-forward-button"
                className="p-1.5 text-white/40 hover:text-[#83f0c7]"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => back(selected.id)}
                title="Send backward"
                data-testid="send-backward-button"
                className="p-1.5 text-white/40 hover:text-[#83f0c7]"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => dup(selected.id)}
                title="Duplicate"
                data-testid="duplicate-layer-button"
                className="p-1.5 text-white/40 hover:text-[#83f0c7]"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => remove(selected.id)}
                title="Delete"
                data-testid="delete-layer-button"
                className="p-1.5 text-white/40 hover:text-red-400"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {selected.type === "text" && (
            <>
              <div>
                <label className="block text-[10px] text-white/50 mb-1">Text</label>
                <textarea
                  value={selected.text}
                  onChange={(e) => update(selected.id, { text: e.target.value })}
                  data-testid="prop-text-content"
                  className="w-full h-16 px-2.5 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-[#fffefa] focus:outline-none focus:border-[#83f0c7]/50 resize-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-white/50 mb-1">Font</label>
                <select
                  value={selected.fontFamily}
                  onChange={(e) => update(selected.id, { fontFamily: e.target.value })}
                  data-testid="prop-font-family"
                  className="w-full px-2.5 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-[#fffefa] focus:outline-none focus:border-[#83f0c7]/50"
                >
                  {FONT_FAMILIES.map((f) => (
                    <option key={f} value={f} className="bg-[#0a201d]">
                      {f}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-white/50 mb-1">Size</label>
                  <input
                    type="number"
                    min={8}
                    max={200}
                    value={selected.fontSize}
                    onChange={(e) =>
                      update(selected.id, { fontSize: parseInt(e.target.value || "16") })
                    }
                    data-testid="prop-font-size"
                    className="w-full px-2.5 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-[#fffefa] focus:outline-none focus:border-[#83f0c7]/50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-white/50 mb-1">Style</label>
                  <div className="flex gap-1">
                    {(["normal", "bold", "italic", "bold italic"] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => update(selected.id, { fontStyle: s })}
                        className={`flex-1 px-1 py-1.5 text-[10px] rounded ${
                          selected.fontStyle === s
                            ? "bg-[#83f0c7]/20 text-[#83f0c7]"
                            : "bg-white/5 text-white/50 hover:bg-white/10"
                        }`}
                      >
                        {s === "bold italic" ? "BI" : s.slice(0, 1).toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-white/50 mb-1">Alignment</label>
                <div className="flex gap-1">
                  {(["left", "center", "right"] as const).map((a) => (
                    <button
                      key={a}
                      onClick={() => update(selected.id, { align: a })}
                      data-testid={`prop-align-${a}`}
                      className={`flex-1 py-1.5 text-[10px] rounded capitalize ${
                        selected.align === a
                          ? "bg-[#83f0c7]/20 text-[#83f0c7]"
                          : "bg-white/5 text-white/50 hover:bg-white/10"
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
              <ColorPicker
                label="Text color"
                value={selected.fill}
                onChange={(c) => update(selected.id, { fill: c })}
                testId="prop-text-color"
              />
            </>
          )}

          {selected.type === "shape" && (
            <ColorPicker
              label="Fill"
              value={selected.fill}
              onChange={(c) => update(selected.id, { fill: c })}
              testId="prop-shape-fill"
            />
          )}

          {/* Common: opacity, position, rotation */}
          <div>
            <label className="block text-[10px] text-white/50 mb-1">
              Opacity {Math.round(selected.opacity * 100)}%
            </label>
            <input
              type="range"
              min={0.1}
              max={1}
              step={0.05}
              value={selected.opacity}
              onChange={(e) =>
                update(selected.id, { opacity: parseFloat(e.target.value) })
              }
              data-testid="prop-opacity"
              className="w-full accent-[#83f0c7]"
            />
          </div>

          <div>
            <label className="block text-[10px] text-white/50 mb-1">
              Rotation {Math.round(selected.rotation)}°
            </label>
            <input
              type="range"
              min={-180}
              max={180}
              step={1}
              value={selected.rotation}
              onChange={(e) =>
                update(selected.id, { rotation: parseFloat(e.target.value) })
              }
              data-testid="prop-rotation"
              className="w-full accent-[#83f0c7]"
            />
          </div>
        </div>
      )}
    </aside>
  );
}

function ColorPicker({
  label,
  value,
  onChange,
  testId,
}: {
  label: string;
  value: string;
  onChange: (c: string) => void;
  testId?: string;
}) {
  return (
    <div data-testid={testId}>
      <label className="block text-[10px] text-white/50 mb-1">{label}</label>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {PALETTE_COLORS.map((c) => (
          <button
            key={c}
            onClick={() => onChange(c)}
            style={{ backgroundColor: c }}
            className={`w-6 h-6 rounded-full border-2 transition-all ${
              value.toLowerCase() === c.toLowerCase()
                ? "border-[#83f0c7] scale-110"
                : "border-white/20"
            }`}
          />
        ))}
        <input
          type="color"
          value={value || "#ffffff"}
          onChange={(e) => onChange(e.target.value)}
          className="w-6 h-6 rounded cursor-pointer bg-transparent border border-white/20"
          title="Custom"
        />
      </div>
    </div>
  );
}
