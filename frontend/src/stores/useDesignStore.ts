/**
 * Design Studio store — Zustand store with undo/redo history.
 *
 * History is implemented as JSON snapshots of `elements`. We push a snapshot
 * before each mutation, capped at 50.
 */
import { create } from "zustand";
import type {
  CanvasElement,
  CanvasState,
  ImageElement,
  ShapeElement,
  TextElement,
  ViewSide,
} from "@/types/design";

const MAX_HISTORY = 50;

const uid = () => `el_${Math.random().toString(36).slice(2, 10)}`;

interface History {
  past: CanvasElement[][];
  future: CanvasElement[][];
}

interface DesignStudioState extends CanvasState {
  selectedId: string | null;
  zoom: number;
  history: History;

  // selection
  setSelected: (id: string | null) => void;

  // view & global
  setView: (v: ViewSide) => void;
  setTshirtColor: (c: string) => void;
  setMaterial: (m: string) => void;
  setName: (n: string) => void;
  setZoom: (z: number) => void;

  // history
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // CRUD
  addElement: (el: CanvasElement) => void;
  addText: () => string;
  addImage: (src: string, naturalWidth?: number, naturalHeight?: number) => string;
  addShape: (shape: ShapeElement["shape"]) => string;
  updateElement: (id: string, patch: Partial<CanvasElement>) => void;
  removeElement: (id: string) => void;
  duplicateElement: (id: string) => void;
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;

  // bulk
  loadCanvas: (state: Partial<CanvasState>) => void;
  resetCanvas: () => void;
}

const DEFAULT_STATE: CanvasState = {
  elements: [],
  view: "front",
  tshirtColor: "#2d5a3d",
  material: "Organic Cotton",
  name: "Untitled design",
};

export const useDesignStore = create<DesignStudioState>((set, get) => ({
  ...DEFAULT_STATE,
  selectedId: null,
  zoom: 1,
  history: { past: [], future: [] },

  setSelected: (id) => set({ selectedId: id }),
  setView: (view) => {
    set({ view, selectedId: null });
  },
  setTshirtColor: (c) => set({ tshirtColor: c }),
  setMaterial: (m) => set({ material: m }),
  setName: (n) => set({ name: n }),
  setZoom: (z) => set({ zoom: Math.max(0.4, Math.min(2, z)) }),

  pushHistory: () => {
    const { elements, history } = get();
    const past = [...history.past, JSON.parse(JSON.stringify(elements))];
    if (past.length > MAX_HISTORY) past.shift();
    set({ history: { past, future: [] } });
  },
  undo: () => {
    const { elements, history } = get();
    if (history.past.length === 0) return;
    const previous = history.past[history.past.length - 1];
    const past = history.past.slice(0, -1);
    const future = [JSON.parse(JSON.stringify(elements)), ...history.future];
    set({ elements: previous, history: { past, future }, selectedId: null });
  },
  redo: () => {
    const { elements, history } = get();
    if (history.future.length === 0) return;
    const next = history.future[0];
    const future = history.future.slice(1);
    const past = [...history.past, JSON.parse(JSON.stringify(elements))];
    set({ elements: next, history: { past, future }, selectedId: null });
  },
  canUndo: () => get().history.past.length > 0,
  canRedo: () => get().history.future.length > 0,

  addElement: (el) => {
    get().pushHistory();
    set({ elements: [...get().elements, el], selectedId: el.id });
  },

  addText: () => {
    const { view } = get();
    const el: TextElement = {
      id: uid(),
      type: "text",
      view,
      text: "Your text",
      x: 250,
      y: 320,
      width: 200,
      height: 50,
      rotation: 0,
      opacity: 1,
      visible: true,
      fontFamily: "Inter",
      fontSize: 32,
      fontStyle: "bold",
      align: "center",
      fill: "#ffffff",
    };
    get().addElement(el);
    return el.id;
  },

  addImage: (src, naturalWidth = 240, naturalHeight = 240) => {
    const { view } = get();
    const maxSide = 240;
    const ratio = naturalWidth / naturalHeight || 1;
    let w = maxSide;
    let h = maxSide;
    if (ratio > 1) h = Math.round(maxSide / ratio);
    else w = Math.round(maxSide * ratio);
    const el: ImageElement = {
      id: uid(),
      type: "image",
      view,
      src,
      x: 300 - w / 2,
      y: 350 - h / 2,
      width: w,
      height: h,
      rotation: 0,
      opacity: 1,
      visible: true,
    };
    get().addElement(el);
    return el.id;
  },

  addShape: (shape) => {
    const { view } = get();
    const el: ShapeElement = {
      id: uid(),
      type: "shape",
      view,
      shape,
      x: 250,
      y: 320,
      width: 120,
      height: 120,
      rotation: 0,
      opacity: 1,
      visible: true,
      fill: "#83f0c7",
      stroke: "",
      strokeWidth: 0,
    };
    get().addElement(el);
    return el.id;
  },

  updateElement: (id, patch) => {
    set({
      elements: get().elements.map((e) =>
        e.id === id ? ({ ...e, ...patch } as CanvasElement) : e,
      ),
    });
  },

  removeElement: (id) => {
    get().pushHistory();
    set({
      elements: get().elements.filter((e) => e.id !== id),
      selectedId: get().selectedId === id ? null : get().selectedId,
    });
  },

  duplicateElement: (id) => {
    const original = get().elements.find((e) => e.id === id);
    if (!original) return;
    const copy: CanvasElement = JSON.parse(JSON.stringify(original));
    copy.id = uid();
    copy.x = (original.x ?? 0) + 20;
    copy.y = (original.y ?? 0) + 20;
    get().pushHistory();
    set({ elements: [...get().elements, copy], selectedId: copy.id });
  },

  bringForward: (id) => {
    const els = [...get().elements];
    const idx = els.findIndex((e) => e.id === id);
    if (idx === -1 || idx === els.length - 1) return;
    [els[idx], els[idx + 1]] = [els[idx + 1], els[idx]];
    get().pushHistory();
    set({ elements: els });
  },
  sendBackward: (id) => {
    const els = [...get().elements];
    const idx = els.findIndex((e) => e.id === id);
    if (idx <= 0) return;
    [els[idx], els[idx - 1]] = [els[idx - 1], els[idx]];
    get().pushHistory();
    set({ elements: els });
  },
  bringToFront: (id) => {
    const els = get().elements.filter((e) => e.id !== id);
    const target = get().elements.find((e) => e.id === id);
    if (!target) return;
    get().pushHistory();
    set({ elements: [...els, target] });
  },
  sendToBack: (id) => {
    const els = get().elements.filter((e) => e.id !== id);
    const target = get().elements.find((e) => e.id === id);
    if (!target) return;
    get().pushHistory();
    set({ elements: [target, ...els] });
  },

  loadCanvas: (state) => {
    set({
      ...DEFAULT_STATE,
      ...state,
      selectedId: null,
      zoom: 1,
      history: { past: [], future: [] },
    });
  },
  resetCanvas: () => {
    set({ ...DEFAULT_STATE, selectedId: null, zoom: 1, history: { past: [], future: [] } });
  },
}));
