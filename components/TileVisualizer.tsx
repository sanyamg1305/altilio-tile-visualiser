"use client";
import { useEffect, useRef } from "react";

const ROOM_IMAGE = "/rooms/bathroom-1.png";
const ROOM_W = 2816;
const ROOM_H = 1536;

// Floor quad [back-left, back-right, front-right, front-left] in original image pixels.
// Back edge ≈ 57% down the 1536px image — where the floor meets the back wall.
const FLOOR_QUAD: [number, number][] = [
  [0, 895],
  [2816, 875],
  [2816, 1536],
  [0, 1536],
];

const FLOOR_W_MM = 4200;
const FLOOR_D_MM = 6000;

// ── Tile texture ──────────────────────────────────────────────────────────────

export type TileParams = {
  color: string;      // CSS color, e.g. "#F2F1EC"
  groutColor?: string;
  widthMM: number;
  heightMM: number;
};

function buildFloorCanvas(params: TileParams): HTMLCanvasElement {
  const PPM = 0.22; // pixels per mm in texture space
  const tileW = Math.round(params.widthMM * PPM);
  const tileH = Math.round(params.heightMM * PPM);
  const grout = 4; // grout line width px
  const groutColor = params.groutColor ?? "#a0a0a0";

  // Single tile
  const tileCanvas = document.createElement("canvas");
  tileCanvas.width = tileW;
  tileCanvas.height = tileH;
  const tc = tileCanvas.getContext("2d")!;

  // Grout border
  tc.fillStyle = groutColor;
  tc.fillRect(0, 0, tileW, tileH);

  // Tile face — solid color with a soft diagonal gradient for surface depth
  const g = tc.createLinearGradient(grout, grout, tileW - grout, tileH - grout);
  g.addColorStop(0, shiftBrightness(params.color, 12));
  g.addColorStop(0.5, params.color);
  g.addColorStop(1, shiftBrightness(params.color, -8));
  tc.fillStyle = g;
  tc.fillRect(grout, grout, tileW - grout * 2, tileH - grout * 2);

  // Tiled floor texture
  const floorW = Math.round(FLOOR_W_MM * PPM);
  const floorH = Math.round(FLOOR_D_MM * PPM);
  const floor = document.createElement("canvas");
  floor.width = floorW;
  floor.height = floorH;
  const fc = floor.getContext("2d")!;
  for (let y = 0; y * tileH <= floorH + tileH; y++) {
    for (let x = 0; x * tileW <= floorW + tileW; x++) {
      fc.drawImage(tileCanvas, x * tileW, y * tileH);
    }
  }
  return floor;
}

function shiftBrightness(hex: string, delta: number): string {
  const parse = (s: string, i: number) => parseInt(s.slice(i, i + 2), 16);
  const clamp = (v: number) => Math.min(255, Math.max(0, Math.round(v + delta * 2.55)));
  let h = hex.startsWith("#") ? hex : "#C8C8C4";
  if (h.length === 4) h = `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}`;
  return `rgb(${clamp(parse(h, 1))},${clamp(parse(h, 3))},${clamp(parse(h, 5))})`;
}

// ── Perspective scanline renderer ─────────────────────────────────────────────

function drawPerspectiveQuad(
  ctx: CanvasRenderingContext2D,
  tex: HTMLCanvasElement,
  quad: [number, number][],
  steps = 160
) {
  const [tl, tr, br, bl] = quad;
  const tw = tex.width;
  const th = tex.height;

  for (let i = 0; i < steps; i++) {
    const t0 = i / steps;
    const t1 = (i + 1) / steps;
    const ty0 = t0 * th;
    const stripH = (t1 - t0) * th;

    const l0x = tl[0] + t0 * (bl[0] - tl[0]), l0y = tl[1] + t0 * (bl[1] - tl[1]);
    const l1x = tl[0] + t1 * (bl[0] - tl[0]), l1y = tl[1] + t1 * (bl[1] - tl[1]);
    const r0x = tr[0] + t0 * (br[0] - tr[0]), r0y = tr[1] + t0 * (br[1] - tr[1]);
    const r1x = tr[0] + t1 * (br[0] - tr[0]), r1y = tr[1] + t1 * (br[1] - tr[1]);

    const ux = r0x - l0x, uy = r0y - l0y;
    const vx = l1x - l0x, vy = l1y - l0y;

    ctx.save();
    ctx.transform(ux / tw, uy / tw, vx / stripH, vy / stripH,
      l0x - (vx / stripH) * ty0, l0y - (vy / stripH) * ty0);
    ctx.beginPath();
    ctx.rect(0, ty0 - 0.5, tw, stripH + 1);
    ctx.clip();
    ctx.drawImage(tex, 0, 0);
    ctx.restore();
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  tile: TileParams;
}

export default function TileVisualizer({ tile }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const displayW = canvas.offsetWidth || 1200;
    const displayH = Math.round(displayW * (ROOM_H / ROOM_W));
    canvas.width = displayW;
    canvas.height = displayH;

    const img = new Image();
    img.src = ROOM_IMAGE;
    img.onload = () => {
      const scale = displayW / ROOM_W;

      // 1. Draw room
      ctx.drawImage(img, 0, 0, displayW, displayH);

      const scaledQuad = FLOOR_QUAD.map(([x, y]) => [x * scale, y * scale] as [number, number]);
      const tex = buildFloorCanvas(tile);

      // 2. Apply tile using "color" blend — maps tile hue onto the room's existing
      //    luminance, so shadows and depth from the photo remain intact.
      ctx.save();
      ctx.globalCompositeOperation = "color";
      ctx.globalAlpha = 0.92;
      drawPerspectiveQuad(ctx, tex, scaledQuad);
      ctx.restore();

      // 3. Redraw room at low opacity to restore fixtures / bathtub contrast
      ctx.save();
      ctx.globalAlpha = 0.22;
      ctx.drawImage(img, 0, 0, displayW, displayH);
      ctx.restore();
    };
  }, [tile]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", display: "block" }}
      className="rounded-xl"
    />
  );
}
