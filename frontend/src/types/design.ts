/**
 * Type definitions for the Design Studio canvas.
 * Each element on the canvas is one of these shapes.
 */

export type ViewSide = "front" | "back";

export type Alignment = "left" | "center" | "right";

export type FontStyle = "normal" | "bold" | "italic" | "bold italic";

export type ShapeKind = "rect" | "circle" | "star" | "triangle" | "heart";

export interface BaseElement {
  id: string;
  type: "text" | "image" | "shape";
  view: ViewSide;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number; // 0..1
  visible: boolean;
  locked?: boolean;
}

export interface TextElement extends BaseElement {
  type: "text";
  text: string;
  fontFamily: string;
  fontSize: number;
  fontStyle: FontStyle;
  align: Alignment;
  fill: string;
}

export interface ImageElement extends BaseElement {
  type: "image";
  /** data URI or remote URL */
  src: string;
}

export interface ShapeElement extends BaseElement {
  type: "shape";
  shape: ShapeKind;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
}

export type CanvasElement = TextElement | ImageElement | ShapeElement;

export interface CanvasState {
  elements: CanvasElement[];
  view: ViewSide;
  tshirtColor: string;
  material: string;
  /** name for the design (for save/history) */
  name: string;
}

export const FONT_FAMILIES = [
  "Inter",
  "Playfair Display",
  "Georgia",
  "Courier New",
  "Impact",
  "Arial",
  "Times New Roman",
  "Verdana",
];

export const TSHIRT_COLORS: { name: string; value: string }[] = [
  { name: "Forest", value: "#2d5a3d" },
  { name: "Charcoal", value: "#1a1a1a" },
  { name: "Sand", value: "#d8c8a8" },
  { name: "Cream", value: "#f4ecd8" },
  { name: "Ocean", value: "#1e5f8e" },
  { name: "Terracotta", value: "#b15842" },
  { name: "Sage", value: "#9caf88" },
  { name: "White", value: "#fafafa" },
];

export const PALETTE_COLORS = [
  "#ffffff", "#000000", "#83f0c7", "#1d4c43", "#f5a623",
  "#ff6b6b", "#4a9bc7", "#d47068", "#9caf88", "#b15842",
];
