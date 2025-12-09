"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

interface Snowflake {
  x: number;
  y: number;
  radius: number;
  speed: number;
  wind: number;
  opacity: number;
}

interface SnowfallProps {
  enabled?: boolean;
  snowflakeCount?: number;
}

function subscribeToReducedMotion(callback: () => void) {
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

export function Snowfall({
  enabled = true,
  snowflakeCount = 50,
}: SnowfallProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  useEffect(() => {
    if (!enabled || prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const snowflakes: Snowflake[] = [];
    const config = {
      count: snowflakeCount,
      speed: { min: 1, max: 3 },
      wind: { min: -0.5, max: 0.5 },
      radius: { min: 1, max: 4 },
      opacity: { min: 0.4, max: 0.8 },
    };

    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      snowflakes.forEach((flake) => {
        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
        ctx.fill();

        flake.y += flake.speed;
        flake.x += flake.wind;

        if (flake.y > canvas.height) {
          flake.y = -flake.radius;
          flake.x = Math.random() * canvas.width;
        }
        if (flake.x > canvas.width) flake.x = 0;
        if (flake.x < 0) flake.x = canvas.width;
      });

      animationId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    // Set canvas size BEFORE initializing snowflakes
    handleResize();
    window.addEventListener("resize", handleResize);

    // Initialize snowflakes after canvas has proper dimensions
    for (let i = 0; i < config.count; i++) {
      snowflakes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius:
          Math.random() * (config.radius.max - config.radius.min) +
          config.radius.min,
        speed:
          Math.random() * (config.speed.max - config.speed.min) +
          config.speed.min,
        wind:
          Math.random() * (config.wind.max - config.wind.min) + config.wind.min,
        opacity:
          Math.random() * (config.opacity.max - config.opacity.min) +
          config.opacity.min,
      });
    }

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, [enabled, prefersReducedMotion, snowflakeCount]);

  if (!enabled || prefersReducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50"
      aria-hidden="true"
    />
  );
}
