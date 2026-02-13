'use client';

import { cn } from "@/lib/utils";
import React, { useState, useRef, useEffect, useCallback } from "react";

interface Card {
  logo: string;
}

interface AnimateGridProps {
  cards: Card[];
  perspective?: number;
  rotateX?: number;
  rotateY?: number;
  className?: string;
  logoSlot?: (logo: string, index: number) => React.ReactNode;
}

export const AnimateGrid: React.FC<AnimateGridProps> = ({
  cards,
  perspective = 600,
  rotateX = -1,
  rotateY = -15,
  className,
  logoSlot,
}) => {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const getAdjacentCardItems = useCallback((i: number): (HTMLDivElement | null)[] => {
    const totalCards = cards.length;
    const columns = totalCards < 4 ? totalCards : 4;
    
    return [i - 1, i + 1, i - columns, i + columns]
      .filter((index) => {
        if (index < 0 || index >= totalCards) return false;
        if (i % columns === 0 && index === i - 1) return false;
        if (i % columns === columns - 1 && index === i + 1) return false;
        return true;
      })
      .map((index) => cardRefs.current[index]);
  }, [cards.length]);

  useEffect(() => {
    cardRefs.current = cardRefs.current.slice(0, cards.length);

    const timeouts = new Map<HTMLElement, NodeJS.Timeout>();

    cardRefs.current.forEach((el, i) => {
      if (!el) return;

      const adjacentCards = getAdjacentCardItems(i);

      const handleMouseEnter = () => {
        if (timeouts.has(el)) {
          clearTimeout(timeouts.get(el));
          timeouts.delete(el);
        }
        el.classList.add("card-raised-big");
        adjacentCards.forEach((adjacentCard) => {
          adjacentCard?.classList.add("card-raised-small");
        });
      };

      const handleMouseLeave = () => {
        const timeoutId = setTimeout(() => {
          el.classList.remove("card-raised-big");
          adjacentCards.forEach((adjacentCard) => {
            adjacentCard?.classList.remove("card-raised-small");
          });
        }, 200);
        timeouts.set(el, timeoutId);
      };

      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
        if (timeouts.has(el)) {
            clearTimeout(timeouts.get(el));
        }
      };
    });
  }, [cards, getAdjacentCardItems]);

  return (
    <div className={cn("relative block", className)}>
      <div
        className={cn(
          "relative grid w-full max-w-full items-center justify-center",
          cards.length < 4 ? `grid-cols-${cards.length}` : 'grid-cols-4',
        )}
        style={{
          transform: `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        }}
      >
        {cards.map((item, index) => (
          <div
            key={index}
            ref={(el) => (cardRefs.current[index] = el)}
            className="card block rounded border border-transparent px-3 py-5 transition-all duration-200"
            style={{ zIndex: index + 1 }}
          >
            {logoSlot ? logoSlot(item.logo, index) : null}
          </div>
        ))}
      </div>
    </div>
  );
};
