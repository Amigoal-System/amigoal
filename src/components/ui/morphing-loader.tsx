'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MorphingLoaderProps {
  texts?: string[];
  colors?: string[][];
  className?: string;
  subtitle?: string;
}

const shapes = [
  // Circle
  { d: "M50,10 A40,40 0 1,1 50,90 A40,40 0 1,1 50,10 Z" },
  // Square
  { d: "M10,10 H90 V90 H10 Z" },
  // Triangle
  { d: "M50,10 L90,90 H10 Z" },
  // Star
  { d: "M50,10 L61.8,40.4 L95.1,40.4 L68.2,61.8 L79.4,92.2 L50,70.8 L20.6,92.2 L31.8,61.8 L4.9,40.4 L38.2,40.4 Z" },
];

const defaultColors = [
    ['#9b87f5', '#D946EF'],
    ['#F97316', '#0EA5E9'],
    ['#ea384c', '#10B981'],
    ['#FCD34D', '#F97316']
];
const defaultTexts = ['Loading...', 'Please wait', 'Almost there', 'Just a moment'];

const MorphingLoader: React.FC<MorphingLoaderProps> = ({
  texts = defaultTexts,
  colors = defaultColors,
  className,
  subtitle,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % shapes.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const currentShape = shapes[currentIndex];
  const currentColorPair = colors[currentIndex % colors.length];
  const currentText = texts[currentIndex % texts.length];

  return (
    <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
      <div className="w-24 h-24">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient id={`gradient-${currentIndex}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: currentColorPair[0] }} />
              <stop offset="100%" style={{ stopColor: currentColorPair[1] }} />
            </linearGradient>
          </defs>
          <AnimatePresence mode="wait">
            <motion.path
              key={currentIndex}
              d={currentShape.d}
              fill={`url(#gradient-${currentIndex})`}
              initial={{ opacity: 0, scale: 0.8, rotate: -90 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotate: 90 }}
              transition={{
                duration: 0.8,
                ease: 'easeInOut',
              }}
            />
          </AnimatePresence>
        </svg>
      </div>
       <AnimatePresence mode="out-in">
        <motion.h3
          key={currentText}
          className="text-lg font-semibold text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {currentText}
        </motion.h3>
      </AnimatePresence>
      {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  );
};

export default MorphingLoader;
