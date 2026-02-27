"use client";

import { useEffect, useRef } from "react";

interface SleekLineCursorProps {
  friction?: number;
  trails?: number;
  size?: number;
  dampening?: number;
  tension?: number;
}

interface NodeType {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface WaveOptions {
  phase?: number;
  offset?: number;
  frequency?: number;
  amplitude?: number;
}

class Wave {
  phase = 0;
  offset = 0;
  frequency = 0.001;
  amplitude = 1;
  private e = 0;

  constructor(options: WaveOptions = {}) {
    this.phase = options.phase || 0;
    this.offset = options.offset || 0;
    this.frequency = options.frequency || 0.001;
    this.amplitude = options.amplitude || 1;
  }

  update(): number {
    this.phase += this.frequency;
    this.e = this.offset + Math.sin(this.phase) * this.amplitude;
    return this.e;
  }
}

class Node implements NodeType {
  x = 0;
  y = 0;
  vx = 0;
  vy = 0;
}

export default function SleekLineCursor({
  friction = 0.5,
  trails = 20,
  size = 50,
  dampening = 0.25,
  tension = 0.98,
}: SleekLineCursorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D & {
      running?: boolean;
      frame?: number;
    };
    if (!ctx) return;

    ctx.running = true;
    ctx.frame = 1;

    const pos = { x: 0, y: 0 };
    let lines: { spring: number; friction: number; nodes: NodeType[]; }[] = [];

    const f = new Wave({
      phase: Math.random() * 2 * Math.PI,
      amplitude: 85,
      frequency: 0.0015,
      offset: 285,
    });

    function createLine(spring: number) {
      const line = {
        spring: spring + 0.1 * Math.random() - 0.02,
        friction: friction + 0.01 * Math.random() - 0.002,
        nodes: [] as NodeType[],
      };
      for (let n = 0; n < size; n++) {
        const node = new Node();
        node.x = pos.x;
        node.y = pos.y;
        line.nodes.push(node);
      }
      return line;
    }

    function createLines() {
      lines = [];
      for (let e = 0; e < trails; e++) {
        lines.push(createLine(0.4 + (e / trails) * 0.025));
      }
    }

    function updateLine(line: typeof lines[0]) {
      let e = line.spring;
      let t = line.nodes[0];

      t.vx += (pos.x - t.x) * e;
      t.vy += (pos.y - t.y) * e;

      for (let i = 0; i < line.nodes.length; i++) {
        t = line.nodes[i];
        if (i > 0) {
          const n = line.nodes[i - 1];
          t.vx += (n.x - t.x) * e;
          t.vy += (n.y - t.y) * e;
          t.vx += n.vx * dampening;
          t.vy += n.vy * dampening;
        }
        t.vx *= line.friction;
        t.vy *= line.friction;
        t.x += t.vx;
        t.y += t.vy;
        e *= tension;
      }
    }

    function drawLine(line: typeof lines[0]) {
      let e: NodeType, t: NodeType;
      let n = line.nodes[0].x;
      let i = line.nodes[0].y;

      ctx.beginPath();
      ctx.moveTo(n, i);

      for (let a = 1, o = line.nodes.length - 2; a < o; a++) {
        e = line.nodes[a];
        t = line.nodes[a + 1];
        n = 0.5 * (e.x + t.x);
        i = 0.5 * (e.y + t.y);
        ctx.quadraticCurveTo(e.x, e.y, n, i);
      }

      e = line.nodes[line.nodes.length - 2];
      t = line.nodes[line.nodes.length - 1];
      ctx.quadraticCurveTo(e.x, e.y, t.x, t.y);
      ctx.stroke();
      ctx.closePath();
    }

    function render() {
      if (!ctx.running) return;
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.globalCompositeOperation = "lighter";
      ctx.strokeStyle = `hsla(${Math.round(f.update())},50%,50%,0.2)`;
      ctx.lineWidth = 1;

      for (let t = 0; t < trails; t++) {
        updateLine(lines[t]);
        drawLine(lines[t]);
      }

      ctx.frame = (ctx.frame || 0) + 1;
      window.requestAnimationFrame(render);
    }

    function resizeCanvas() {
      if (canvas) {
        canvas.width = window.innerWidth - 20;
        canvas.height = window.innerHeight;
      }
    }

    function updatePosition(e: MouseEvent | TouchEvent) {
      if ("touches" in e) {
        pos.x = e.touches[0].pageX;
        pos.y = e.touches[0].pageY;
      } else {
        pos.x = e.clientX;
        pos.y = e.clientY;
      }
    }

    function handleTouchMove(e: TouchEvent) {
      if (e.touches.length === 1) {
        pos.x = e.touches[0].pageX;
        pos.y = e.touches[0].pageY;
      }
    }

    function onFirstMove(e: MouseEvent | TouchEvent) {
      document.removeEventListener("mousemove", onFirstMove);
      document.removeEventListener("touchstart", onFirstMove);
      document.addEventListener("mousemove", updatePosition);
      document.addEventListener("touchmove", updatePosition);
      document.addEventListener("touchstart", handleTouchMove);
      updatePosition(e);
      createLines();
      render();
    }

    function handleFocus() {
      if (!ctx.running) {
        ctx.running = true;
        render();
      }
    }

    function handleBlur() {
      ctx.running = true;
    }

    document.addEventListener("mousemove", onFirstMove);
    document.addEventListener("touchstart", onFirstMove);
    document.body.addEventListener("orientationchange", resizeCanvas);
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);
    resizeCanvas();

    return () => {
      ctx.running = false;
      document.removeEventListener("mousemove", onFirstMove);
      document.removeEventListener("mousemove", updatePosition);
      document.removeEventListener("touchstart", onFirstMove);
      document.removeEventListener("touchstart", handleTouchMove);
      document.removeEventListener("touchmove", updatePosition);
      document.body.removeEventListener("orientationchange", resizeCanvas);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, [friction, trails, size, dampening, tension]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50"
    />
  );
}
