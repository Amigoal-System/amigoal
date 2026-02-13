
"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BorderGlideProps {
  children: React.ReactNode;
  className?: string;
  autoPlayInterval?: number;
  borderDuration?: number;
  borderColor?: string;
  borderWidth?: string;
  borderHeight?: string;
}

export const BorderGlide: React.FC<BorderGlideProps> = ({
  children,
  className,
  autoPlayInterval = 0, // Disabled by default
  borderDuration = 3000,
  borderColor = "#3b82f6",
  borderWidth = "6rem",
  borderHeight = "6rem",
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (autoPlayInterval === 0) return;

    const intervalId = setInterval(() => {
      setActiveIndex(
        (prevIndex) => (prevIndex + 1) % React.Children.count(children)
      );
    }, autoPlayInterval);

    return () => clearInterval(intervalId);
  }, [activeIndex, autoPlayInterval, children]);

  const cards = React.Children.toArray(children);

  return (
    <div className={cn("relative w-full overflow-hidden p-1", className)}>
      <AnimatePresence mode="wait">
        {React.cloneElement(cards[activeIndex] as React.ReactElement, {
          borderDuration,
          borderColor,
          borderWidth,
          borderHeight,
        })}
      </AnimatePresence>
    </div>
  );
};

interface BorderGlideCardProps {
  children: React.ReactNode;
  className?: string;
  borderDuration?: number;
  borderColor?: string;
  borderWidth?: string;
  borderHeight?: string;
}

export const BorderGlideCard: React.FC<BorderGlideCardProps> = ({
  children,
  className,
  borderDuration = 3000,
  borderColor = "#3b82f6",
  borderWidth = "6rem",
  borderHeight = "6rem",
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (event: MouseEvent) => {
      const { clientX, clientY } = event;
      const { left, top } = card.getBoundingClientRect();
      const x = clientX - left;
      const y = clientY - top;
      card.style.setProperty("--x", `${x}px`);
      card.style.setProperty("--y", `${y}px`);
    };

    card.addEventListener("mousemove", handleMouseMove);

    return () => {
      card.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      ref={cardRef}
      className={cn(
        "group/bento relative flex flex-col justify-between space-y-4 overflow-hidden rounded-xl border border-border bg-card p-4 transition-all duration-300 hover:shadow-lg dark:hover:shadow-black/50",
        "before:pointer-events-none before:absolute before:inset-0 before:z-10 before:rounded-[inherit] before:opacity-0 before:transition-opacity before:duration-300",
        "before:bg-[radial-gradient(var(--border-size)_circle_at_var(--x)_var(--y),_var(--border-color),_transparent_100%)]",
        "group-hover/bento:before:opacity-100",
        className
      )}
      style={
        {
          "--border-color": borderColor,
          "--border-size": `${Math.max(
            parseInt(borderWidth),
            parseInt(borderHeight)
          )}px`,
        } as React.CSSProperties
      }
    >
      {children}
    </motion.div>
  );
};

export const BorderGlideContent = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-1 flex-col justify-between", className)}
    {...props}
  />
);

export const BorderGlideHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col gap-1.5", className)} {...props} />
);

export const BorderGlideTitle = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    className={cn("text-xl font-semibold text-foreground", className)}
    {...props}
  />
);

export const BorderGlideDescription = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
);

export const BorderGlideFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "mt-auto flex items-center justify-between text-sm text-muted-foreground",
      className
    )}
    {...props}
  />
);
