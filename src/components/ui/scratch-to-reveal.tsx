'use client';

import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

interface ScratchToRevealProps {
  children: React.ReactNode;
  className?: string;
  width: number;
  height: number;
  minScratchPercentage?: number;
  gradientColors?: [string, string, string];
  onComplete?: () => void;
  onReset?: () => void;
}

export const ScratchToReveal = forwardRef((
  {
    className,
    children,
    width,
    height,
    minScratchPercentage = 50,
    gradientColors = ['#A97CF8', '#F38CB8', '#FDCC92'],
    onComplete,
    onReset,
  }: ScratchToRevealProps, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isScratching = useRef(false);
    const isComplete = useRef(false);

    const drawCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) return;
      
      isComplete.current = false;

      context.clearRect(0, 0, width, height);

      const gradient = context.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, gradientColors[0]);
      gradient.addColorStop(0.5, gradientColors[1]);
      gradient.addColorStop(1, gradientColors[2]);
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);
    };
    
    useImperativeHandle(ref, () => ({
        reset: () => {
            drawCanvas();
            if (onReset) onReset();
        }
    }));


    useEffect(() => {
        drawCanvas();
    }, [width, height, gradientColors]);

    const scratch = (clientX: number, clientY: number) => {
        const canvas = canvasRef.current;
        if (!canvas || isComplete.current) return;
        const context = canvas.getContext('2d');
        if (!context) return;
    
        const rect = canvas.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
    
        context.globalCompositeOperation = 'destination-out';
        context.beginPath();
        context.arc(x, y, 20, 0, Math.PI * 2);
        context.fill();
    };
    
    const checkCompletion = () => {
        if (isComplete.current) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d', { willReadFrequently: true });
        if (!context) return;

        const imageData = context.getImageData(0, 0, width, height);
        const pixels = imageData.data;
        const totalPixels = pixels.length / 4;
        let clearPixels = 0;

        for (let i = 3; i < pixels.length; i += 4) {
            if (pixels[i] === 0) {
                clearPixels++;
            }
        }

        const percentage = (clearPixels / totalPixels) * 100;
        if (percentage >= minScratchPercentage) {
            isComplete.current = true;
            context.clearRect(0, 0, width, height);
            confetti({
                particleCount: 150,
                spread: 80,
                origin: { y: 0.6 },
            });
            if (onComplete) onComplete();
        }
    };

    const handleMouseDown = () => { isScratching.current = true; };
    const handleMouseUp = () => { 
      isScratching.current = false;
      checkCompletion();
    };
    const handleMouseMove = (e: React.MouseEvent) => {
      if (!isScratching.current) return;
      scratch(e.clientX, e.clientY);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        isScratching.current = true;
        const touch = e.touches[0];
        scratch(touch.clientX, touch.clientY);
    };
    const handleTouchEnd = () => {
        isScratching.current = false;
        checkCompletion();
    };
    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isScratching.current) return;
        const touch = e.touches[0];
        scratch(touch.clientX, touch.clientY);
    };

    return (
      <motion.div
        className={cn('relative select-none', className)}
        style={{ width, height }}
      >
        <div className="absolute inset-0 z-20 flex items-center justify-center">
            {children}
        </div>
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="absolute inset-0 z-30"
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchMove={handleTouchMove}
            style={{ cursor: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj4KICA8Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNCIgc3R5bGU9ImZpbGw6I2ZmZjtvcGFjaXR5OjAuNTtzdHJva2U6IzAwMDtzdHJva2Utd2lkdGg6MXB4OyIgLz4KPC9zdmc+'), auto" }}
        />
      </motion.div>
    );
});
ScratchToReveal.displayName = 'ScratchToReveal';
