
'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

const TextStaggerHover = ({
  text,
  className,
}: {
  text: string;
  className?: string;
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([]);

  useEffect(() => {
    setShuffledIndices(
      Array.from({ length: text.length }, (_, i) => i).sort(
        () => Math.random() - 0.5
      )
    );
  }, [text]);

  const handleMouseEnter = (index: number) => {
    setHoveredIndex(index);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  return (
    <div
      className={cn('flex items-center justify-center', className)}
      onMouseLeave={handleMouseLeave}
    >
      {text.split('').map((char, index) => {
        const isHovered = hoveredIndex !== null;
        let distance = 0;
        if (isHovered) {
          distance = Math.abs(hoveredIndex - index);
        }

        return (
          <motion.span
            key={index}
            className="cursor-default"
            onMouseEnter={() => handleMouseEnter(index)}
            style={{
              transition: 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
              transform: isHovered
                ? `translateY(-${Math.pow(distance, 1.75)}px)`
                : 'translateY(0px)',
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        );
      })}
    </div>
  );
};

export default TextStaggerHover;
