"use client";

import { useEffect, useRef, useState } from "react";

export function PixelCursor() {
  const mainRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const isPointerRef = useRef(false);
  const [isPointer, setIsPointer] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Don't render on touch-only devices
    if (!window.matchMedia("(hover: hover)").matches) return;

    const mouse = { x: -300, y: -300 };
    const trail = { x: -300, y: -300 };
    let rafId: number;

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      setVisible(true);

      const el = e.target as HTMLElement;
      const ptr = !!el.closest("a, button, [role='button'], input, select, label");
      isPointerRef.current = ptr;
      setIsPointer(ptr);
    };

    const animate = () => {
      trail.x += (mouse.x - trail.x) * 0.12;
      trail.y += (mouse.y - trail.y) * 0.12;

      if (mainRef.current) {
        mainRef.current.style.transform = `translate(${mouse.x - 1}px, ${mouse.y - 1}px)`;
      }
      if (trailRef.current) {
        const half = isPointerRef.current ? 14 : 10;
        trailRef.current.style.transform = `translate(${Math.round(trail.x) - half}px, ${Math.round(trail.y) - half}px)`;
      }

      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", onMove);
    document.documentElement.addEventListener("mouseleave", () => setVisible(false));
    document.documentElement.addEventListener("mouseenter", () => setVisible(true));
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      <div
        ref={trailRef}
        className={`pixel-cursor-trail${isPointer ? " is-pointer" : ""}`}
        style={{ opacity: visible ? 1 : 0 }}
      />
      <div
        ref={mainRef}
        className={`pixel-cursor-main${isPointer ? " is-pointer" : ""}`}
        style={{ opacity: visible ? 1 : 0 }}
      />
    </>
  );
}
