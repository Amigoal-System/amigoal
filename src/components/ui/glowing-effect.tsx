
"use client";

import { cn } from "@/lib/utils";
import { useMotionValue, useSpring, motion } from "framer-motion";
import React, { useRef, useState, useEffect } from "react";

export const GlowingEffect = ({
  children,
  className,
  glow,
  spread = 40,
  proximity = 64,
  disabled = false,
  inactiveZone = 0.01,
}: {
  children?: React.ReactNode;
  className?: string;
  glow?: boolean;
  spread?: number;
  proximity?: number;
  disabled?: boolean;
  inactiveZone?: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = {
    damping: 100,
    stiffness: 800,
  };

  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (ref.current) {
      const { left, top } = ref.current.getBoundingClientRect();
      const x = e.clientX - left;
      const y = e.clientY - top;
      mouseX.set(x);
      mouseY.set(y);
    }
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={cn("group relative size-full", className)}
    >
      {children}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(${
            proximity * 2
          }px at ${smoothMouseX}px ${smoothMouseY}px, hsla(var(--primary) / 0.1), transparent 80%)`,
        }}
      />
      {glow && (
        <motion.div
          className={cn(
            "pointer-events-none absolute -inset-px rounded-[inherit] opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-100",
            { "animate-pulse": disabled },
          )}
          style={{
            background: `radial-gradient(${
              proximity * 2
            }px at ${smoothMouseX}px ${smoothMouseY}px, hsla(var(--primary)), transparent 80%)`,
            opacity: disabled ? 0.05 : undefined,
          }}
        />
      )}

      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[inherit] opacity-0 ring-1 ring-inset ring-black/10 transition-opacity duration-300 group-hover:opacity-100 dark:ring-white/10"
        style={{
          background: `radial-gradient(${
            proximity * 2
          }px at ${smoothMouseX}px ${smoothMouseY}px, hsla(0 0% 100% / 0.1), transparent 80%)`,
        }}
      />
    </div>
  );
};
