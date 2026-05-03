/**
 * The main Konva stage for the Design Studio.
 *
 * - Renders a stylised t-shirt path with the chosen colour
 * - Renders elements (text/image/shape) for the current view
 * - Manages selection, drag, transform (resize/rotate)
 * - Wheel-to-zoom and click-to-deselect
 */
import { useEffect, useMemo, useRef } from "react";
import { Stage, Layer, Path, Text, Image as KImage, Rect, Circle, Star, Line, Transformer, Group } from "react-konva";
import type Konva from "konva";
import useImage from "use-image";
import { useDesignStore } from "@/stores/useDesignStore";
import type { CanvasElement, ImageElement, ShapeElement, TextElement } from "@/types/design";

// Stage logical size (the inner coordinate system)
const STAGE_W = 600;
const STAGE_H = 720;

// Heart path used in shape rendering
const HEART_PATH =
  "M 60,30 C 60,10 90,0 90,30 C 90,50 60,80 60,80 C 60,80 30,50 30,30 C 30,0 60,10 60,30 Z";

/**
 * A vague t-shirt silhouette as an SVG path. Coordinates are inside the stage.
 */
const TSHIRT_PATH =
  "M 160,90 L 90,150 L 130,210 L 180,180 L 180,640 L 420,640 L 420,180 L 470,210 L 510,150 L 440,90 L 360,90 C 360,140 240,140 240,90 Z";

/**
 * One renderable element. Wraps the Konva primitive and stores element id on
 * the node so the parent can attach a Transformer.
 */
function ElementNode({ el, onSelect }: { el: CanvasElement; onSelect: (id: string) => void }) {
  const update = useDesignStore((s) => s.updateElement);
  const pushHistory = useDesignStore((s) => s.pushHistory);

  const commonProps = {
    id: el.id,
    name: "design-element",
    x: el.x,
    y: el.y,
    rotation: el.rotation,
    opacity: el.visible ? el.opacity : 0,
    listening: el.visible && !el.locked,
    draggable: !el.locked,
    onClick: () => onSelect(el.id),
    onTap: () => onSelect(el.id),
    onDragStart: () => pushHistory(),
    onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => {
      update(el.id, { x: e.target.x(), y: e.target.y() });
    },
    onTransformStart: () => pushHistory(),
    onTransformEnd: (e: Konva.KonvaEventObject<Event>) => {
      const node = e.target;
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();
      node.scaleX(1);
      node.scaleY(1);
      update(el.id, {
        x: node.x(),
        y: node.y(),
        rotation: node.rotation(),
        width: Math.max(20, (el.width || 100) * scaleX),
        height: Math.max(20, (el.height || 100) * scaleY),
      });
    },
  };

  if (el.type === "text") {
    const t = el as TextElement;
    return (
      <Text
        {...commonProps}
        text={t.text}
        width={t.width}
        height={t.height}
        fontSize={t.fontSize}
        fontFamily={t.fontFamily}
        fontStyle={t.fontStyle}
        align={t.align}
        fill={t.fill}
        wrap="word"
      />
    );
  }

  if (el.type === "image") {
    return <ImageNode el={el as ImageElement} commonProps={commonProps} />;
  }

  // shape
  const s = el as ShapeElement;
  if (s.shape === "rect") {
    return (
      <Rect
        {...commonProps}
        width={s.width}
        height={s.height}
        fill={s.fill}
        stroke={s.stroke || undefined}
        strokeWidth={s.strokeWidth || 0}
        cornerRadius={6}
      />
    );
  }
  if (s.shape === "circle") {
    return (
      <Circle
        {...commonProps}
        radius={Math.min(s.width, s.height) / 2}
        offsetX={-s.width / 2}
        offsetY={-s.height / 2}
        fill={s.fill}
        stroke={s.stroke || undefined}
        strokeWidth={s.strokeWidth || 0}
      />
    );
  }
  if (s.shape === "star") {
    return (
      <Star
        {...commonProps}
        numPoints={5}
        innerRadius={Math.min(s.width, s.height) / 4}
        outerRadius={Math.min(s.width, s.height) / 2}
        offsetX={-s.width / 2}
        offsetY={-s.height / 2}
        fill={s.fill}
        stroke={s.stroke || undefined}
        strokeWidth={s.strokeWidth || 0}
      />
    );
  }
  if (s.shape === "triangle") {
    return (
      <Line
        {...commonProps}
        points={[s.width / 2, 0, s.width, s.height, 0, s.height]}
        closed
        fill={s.fill}
        stroke={s.stroke || undefined}
        strokeWidth={s.strokeWidth || 0}
      />
    );
  }
  // heart
  return (
    <Path
      {...commonProps}
      data={HEART_PATH}
      scaleX={s.width / 120}
      scaleY={s.height / 80}
      fill={s.fill}
      stroke={s.stroke || undefined}
      strokeWidth={s.strokeWidth || 0}
    />
  );
}

function ImageNode({
  el,
  commonProps,
}: {
  el: ImageElement;
  commonProps: Record<string, unknown>;
}) {
  const [img] = useImage(el.src, "anonymous");
  return (
    <KImage
      {...commonProps}
      image={img}
      width={el.width}
      height={el.height}
    />
  );
}

interface DesignCanvasProps {
  /** rendered width in screen px */
  containerWidth: number;
  containerHeight: number;
}

export default function DesignCanvas({ containerWidth, containerHeight }: DesignCanvasProps) {
  const elements = useDesignStore((s) => s.elements);
  const view = useDesignStore((s) => s.view);
  const tshirtColor = useDesignStore((s) => s.tshirtColor);
  const selectedId = useDesignStore((s) => s.selectedId);
  const setSelected = useDesignStore((s) => s.setSelected);
  const zoom = useDesignStore((s) => s.zoom);
  const setZoom = useDesignStore((s) => s.setZoom);

  const stageRef = useRef<Konva.Stage>(null);
  const trRef = useRef<Konva.Transformer>(null);

  // Fit-to-container scale (independent from user zoom)
  const fitScale = useMemo(() => {
    const sx = containerWidth / STAGE_W;
    const sy = containerHeight / STAGE_H;
    return Math.min(sx, sy);
  }, [containerWidth, containerHeight]);

  // Attach Transformer to selected node whenever selection or elements change
  useEffect(() => {
    const tr = trRef.current;
    if (!tr) return;
    if (!selectedId) {
      tr.nodes([]);
      tr.getLayer()?.batchDraw();
      return;
    }
    const stage = stageRef.current;
    if (!stage) return;
    const node = stage.findOne(`#${selectedId}`);
    if (node) {
      tr.nodes([node]);
      tr.getLayer()?.batchDraw();
    } else {
      tr.nodes([]);
    }
  }, [selectedId, elements, view]);

  const visibleElements = elements.filter((e) => e.view === view);

  const totalScale = fitScale * zoom;
  const stageW = containerWidth;
  const stageH = containerHeight;

  // Centre the stage content within the container
  const offsetX = (stageW - STAGE_W * totalScale) / 2;
  const offsetY = (stageH - STAGE_H * totalScale) / 2;

  return (
    <Stage
      ref={stageRef}
      width={stageW}
      height={stageH}
      onWheel={(e) => {
        e.evt.preventDefault();
        const delta = e.evt.deltaY > 0 ? -0.05 : 0.05;
        setZoom(zoom + delta);
      }}
      onMouseDown={(e) => {
        if (e.target === e.target.getStage()) setSelected(null);
      }}
      onTouchStart={(e) => {
        if (e.target === e.target.getStage()) setSelected(null);
      }}
    >
      <Layer scaleX={totalScale} scaleY={totalScale} x={offsetX} y={offsetY}>
        {/* shadow under shirt */}
        <Path data={TSHIRT_PATH} y={6} fill="rgba(0,0,0,0.35)" listening={false} />
        {/* t-shirt silhouette */}
        <Path data={TSHIRT_PATH} fill={tshirtColor} stroke="rgba(0,0,0,0.18)" strokeWidth={2} listening={false} />
        {/* fabric highlight */}
        <Path data={TSHIRT_PATH} fill="rgba(255,255,255,0.06)" listening={false} />
        {/* back/front label badge */}
        <Group listening={false} opacity={0.5}>
          <Text
            text={view === "front" ? "FRONT" : "BACK"}
            x={STAGE_W - 90}
            y={STAGE_H - 40}
            fontSize={14}
            fontFamily="Inter"
            fontStyle="bold"
            fill="#ffffff"
          />
        </Group>

        {/* user elements */}
        {visibleElements.map((el) => (
          <ElementNode key={el.id} el={el} onSelect={setSelected} />
        ))}

        <Transformer
          ref={trRef}
          rotateEnabled
          flipEnabled={false}
          anchorSize={10}
          anchorStroke="#83f0c7"
          anchorFill="#0a201d"
          borderStroke="#83f0c7"
          borderDash={[4, 4]}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 20 || newBox.height < 20) return oldBox;
            return newBox;
          }}
        />
      </Layer>
    </Stage>
  );
}

export { STAGE_W, STAGE_H };
