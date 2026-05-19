"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type ServiceVisual = {
  slug: string;
  color: string;
  glow: string;
  labelSq: string;
  labelEn: string;
  icon: "support" | "cloud" | "cctv" | "web" | "network" | "software" | "telecom" | "printer";
};

export const HERO_ORBIT_SERVICES: ServiceVisual[] = [
  { slug: "it-support", color: "#2563eb", glow: "#60a5fa", labelSq: "IT Support", labelEn: "IT Support", icon: "support" },
  { slug: "cloud", color: "#0ea5e9", glow: "#38bdf8", labelSq: "Cloud", labelEn: "Cloud", icon: "cloud" },
  { slug: "cctv-siguri", color: "#e11d48", glow: "#fb7185", labelSq: "CCTV", labelEn: "CCTV", icon: "cctv" },
  { slug: "web-marketing", color: "#7c3aed", glow: "#a78bfa", labelSq: "Web", labelEn: "Web", icon: "web" },
  { slug: "rrjet", color: "#059669", glow: "#34d399", labelSq: "Rrjet", labelEn: "Network", icon: "network" },
  { slug: "software", color: "#d97706", glow: "#fbbf24", labelSq: "Software", labelEn: "Software", icon: "software" },
  { slug: "telekomunikacion", color: "#4f46e5", glow: "#818cf8", labelSq: "Telekom", labelEn: "Telecom", icon: "telecom" },
  { slug: "printere", color: "#ea580c", glow: "#fb923c", labelSq: "Printerë", labelEn: "Printers", icon: "printer" },
];

function drawServiceIcon(ctx: CanvasRenderingContext2D, icon: ServiceVisual["icon"], s: number) {
  ctx.lineWidth = Math.max(1.2, s * 0.09);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#ffffff";
  ctx.fillStyle = "rgba(255,255,255,0.15)";

  switch (icon) {
    case "support":
      ctx.beginPath();
      ctx.arc(0, -s * 0.12, s * 0.28, Math.PI, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-s * 0.35, s * 0.05);
      ctx.lineTo(-s * 0.42, s * 0.38);
      ctx.lineTo(-s * 0.18, s * 0.38);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(s * 0.35, s * 0.05);
      ctx.lineTo(s * 0.42, s * 0.38);
      ctx.lineTo(s * 0.18, s * 0.38);
      ctx.stroke();
      break;
    case "cloud":
      ctx.beginPath();
      ctx.arc(-s * 0.12, s * 0.05, s * 0.18, Math.PI * 0.85, Math.PI * 2.15);
      ctx.arc(s * 0.15, s * 0.02, s * 0.22, Math.PI * 1.05, Math.PI * 1.95);
      ctx.arc(s * 0.38, s * 0.08, s * 0.14, Math.PI * 1.2, Math.PI * 1.85);
      ctx.stroke();
      break;
    case "cctv":
      ctx.strokeRect(-s * 0.32, -s * 0.18, s * 0.64, s * 0.38);
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.12, 0, Math.PI * 2);
      ctx.stroke();
      break;
    case "web":
      ctx.strokeRect(-s * 0.34, -s * 0.28, s * 0.68, s * 0.56);
      ctx.beginPath();
      ctx.moveTo(-s * 0.34, -s * 0.08);
      ctx.lineTo(s * 0.34, -s * 0.08);
      ctx.stroke();
      break;
    case "network":
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 - Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * s * 0.38, Math.sin(a) * s * 0.38);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(Math.cos(a) * s * 0.38, Math.sin(a) * s * 0.38, s * 0.07, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      break;
    case "software":
      ctx.font = `bold ${s * 0.42}px ui-monospace, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#ffffff";
      ctx.fillText("<>", 0, s * 0.02);
      break;
    case "telecom":
      ctx.beginPath();
      ctx.moveTo(-s * 0.08, s * 0.35);
      ctx.lineTo(-s * 0.08, -s * 0.05);
      ctx.quadraticCurveTo(-s * 0.08, -s * 0.35, s * 0.2, -s * 0.35);
      ctx.stroke();
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(s * 0.08, -s * 0.05 + i * s * 0.12, s * (0.12 + i * 0.08), -Math.PI * 0.35, Math.PI * 0.35);
        ctx.stroke();
      }
      break;
    case "printer":
      ctx.strokeRect(-s * 0.32, -s * 0.05, s * 0.64, s * 0.38);
      ctx.strokeRect(-s * 0.22, -s * 0.28, s * 0.44, s * 0.18);
      break;
  }
}

function ellipseNorm(x: number, y: number, cx: number, cy: number, rx: number, ry: number) {
  const dx = (x - cx) / rx;
  const dy = (y - cy) / ry;
  return Math.hypot(dx, dy);
}

function getMobileNodeAlpha(
  x: number,
  y: number,
  cx: number,
  cy: number,
  innerRx: number,
  innerRy: number,
  w: number,
  h: number,
  boundsHalfW: number,
  boundsHalfH: number
) {
  const minX = x - boundsHalfW;
  const maxX = x + boundsHalfW;
  const minY = y - boundsHalfH;
  const maxY = y + boundsHalfH;

  if (maxX < 2 || minX > w - 2 || maxY < 2 || minY > h - 2) return 0;

  const distFromCenter = ellipseNorm(x, y, cx, cy, innerRx, innerRy);
  if (distFromCenter < 0.95) return 0;

  let alpha = 1;
  if (distFromCenter < 1.12) {
    alpha = (distFromCenter - 0.95) / 0.17;
  }

  const edgeDist = Math.min(minX, w - maxX, minY, h - maxY);
  if (edgeDist < 18) alpha *= Math.max(0, edgeDist / 18);

  return Math.max(0, Math.min(1, alpha));
}

function getOrbitLayout(w: number, h: number) {
  const mobile = w < 768;
  const tablet = w < 1024;
  const cx = w * 0.5;
  const cy = h * 0.5;
  const nodeR = mobile ? 18 : tablet ? 22 : 24;
  const labelStack = mobile ? 18 : 22;
  const nodeMargin = nodeR + labelStack + (mobile ? 8 : 12);

  const innerRx = mobile ? w * 0.4 : tablet ? w * 0.13 : Math.min(w * 0.12, 160);
  const innerRy = mobile ? h * 0.3 : tablet ? h * 0.13 : h * 0.14;

  const ringRx = Math.min(w * 0.5 - nodeMargin, w * (mobile ? 0.47 : tablet ? 0.44 : 0.44));
  const ringRy = Math.min(h * 0.5 - nodeMargin, h * (mobile ? 0.44 : tablet ? 0.38 : 0.38));

  return { cx, cy, innerRx, innerRy, ringRx, ringRy, mobile, tablet, nodeR };
}

type OrbitNode = {
  svc: ServiceVisual;
  angle: number;
  x: number;
  y: number;
  label: string;
};

function drawNode(
  ctx: CanvasRenderingContext2D,
  node: OrbitNode,
  opts: {
    r: number;
    mobile: boolean;
    cx: number;
    cy: number;
    alpha: number;
  }
) {
  const { r, mobile, cx, cy, alpha } = opts;
  if (alpha <= 0.01) return;

  ctx.save();
  ctx.globalAlpha = alpha;

  ctx.fillStyle = node.svc.color;
  ctx.beginPath();
  ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = mobile ? 2 : 2.5;
  ctx.beginPath();
  ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
  ctx.stroke();

  ctx.save();
  ctx.translate(node.x, node.y);
  drawServiceIcon(ctx, node.svc.icon, r * 1.3);
  ctx.restore();

  const outwardX = node.x - cx;
  const outwardY = node.y - cy;
  const outwardLen = Math.hypot(outwardX, outwardY) || 1;
  const ox = outwardX / outwardLen;
  const oy = outwardY / outwardLen;

  const fontSize = mobile ? 9 : 10;
  ctx.font = `700 ${fontSize}px system-ui, sans-serif`;
  const metrics = ctx.measureText(node.label);
  const padX = mobile ? 5 : 6;
  const padY = 3;
  const bw = metrics.width + padX * 2;
  const bh = (mobile ? 11 : 12) + padY * 2;
  const labelGap = mobile ? 4 : 6;
  const labelCenterX = node.x + ox * (r + labelGap + bh / 2);
  const labelCenterY = node.y + oy * (r + labelGap + bh / 2);

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.roundRect(labelCenterX - bw / 2, labelCenterY - bh / 2, bw, bh, 6);
  ctx.fill();
  ctx.strokeStyle = node.svc.color;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = node.svc.color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(node.label, labelCenterX, labelCenterY);

  ctx.restore();
}

export function HomeHero3dBackground({
  className,
  locale = "sq",
}: {
  className?: string;
  locale?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    let time = 0;

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const layout = getOrbitLayout(w, h);
      const { cx, cy, innerRx, innerRy, ringRx, ringRy, mobile, nodeR } = layout;
      const t = reducedMotion ? 0 : time;

      ctx.clearRect(0, 0, w, h);

      const spin = t * (mobile ? 0.32 : 0.42);

      const nodes: OrbitNode[] = HERO_ORBIT_SERVICES.map((svc, i) => {
        const angle = (i / HERO_ORBIT_SERVICES.length) * Math.PI * 2 - Math.PI / 2 + spin;
        const bob = reducedMotion ? 0 : Math.sin(t * 1.35 + i * 0.85) * (mobile ? 2 : 3);
        const bx = Math.cos(angle) * bob;
        const by = Math.sin(angle) * bob;
        return {
          svc,
          angle,
          x: cx + Math.cos(angle) * ringRx + bx,
          y: cy + Math.sin(angle) * ringRy + by,
          label: locale === "sq" ? svc.labelSq : svc.labelEn,
        };
      });

      const getAlpha = (node: OrbitNode) => {
        if (!mobile) return 1;
        const boundsHalfW = nodeR + 36;
        const boundsHalfH = nodeR + 28;
        return getMobileNodeAlpha(node.x, node.y, cx, cy, innerRx, innerRy, w, h, boundsHalfW, boundsHalfH);
      };

      if (!mobile) {
        nodes.forEach((node, i) => {
          const endX = cx + Math.cos(node.angle) * innerRx * 0.92;
          const endY = cy + Math.sin(node.angle) * innerRy * 0.92;
          const grad = ctx.createLinearGradient(node.x, node.y, endX, endY);
          grad.addColorStop(0, `${node.svc.color}aa`);
          grad.addColorStop(1, `${node.svc.color}33`);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.75;
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(endX, endY);
          ctx.stroke();

          if (!reducedMotion) {
            const pulse = (t * 0.85 + i * 0.125) % 1;
            const px = node.x + (endX - node.x) * pulse;
            const py = node.y + (endY - node.y) * pulse;
            ctx.fillStyle = node.svc.color;
            ctx.beginPath();
            ctx.arc(px, py, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      }

      nodes.forEach((node) => {
        drawNode(ctx, node, { r: nodeR, mobile, cx, cy, alpha: getAlpha(node) });
      });

      time += reducedMotion ? 0 : 0.014;
      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [locale]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("pointer-events-none h-full w-full", className)}
      aria-hidden
    />
  );
}
