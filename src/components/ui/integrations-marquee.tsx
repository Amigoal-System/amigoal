
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';
import useMeasure from 'react-use-measure';
import Link from 'next/link';

import {
  GitMerge,
  Container,
  CodeXml,
  Database,
  Bot,
  PenTool,
  Shapes,
  BarChart2,
  Users,
  ClipboardList,
  Wallet,
  Trophy,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

const iconConfigs = [
  { icon: <BarChart2 className="size-full" />, color: "#8b5cf6" },
  { icon: <Users className="size-full" />, color: "#10b981" },
  { icon: <ClipboardList className="size-full" />, color: "#3b82f6" },
  { icon: <Wallet className="size-full" />, color: "#f97316" },
  { icon: <Trophy className="size-full" />, color: "#f59e0b" },
  { icon: <PenTool className="size-full" />, color: "#ec4899" },
];

const MainLogoIcon = () => <Shapes className="size-full" />;

export type InfiniteSliderProps = {
  children: React.ReactNode;
  gap?: number;
  speed?: number;
  speedOnHover?: number;
  direction?: 'horizontal' | 'vertical';
  reverse?: boolean;
  className?: string;
};

export function InfiniteSlider({
  children,
  gap = 16,
  speed = 100,
  speedOnHover,
  direction = 'horizontal',
  reverse = false,
  className,
}: InfiniteSliderProps) {
  const [currentSpeed, setCurrentSpeed] = useState(speed);
  const [ref, { width, height }] = useMeasure();
  const translation = useMotionValue(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    let controls;
    const size = direction === 'horizontal' ? width : height;
    if (size === 0) return; // Don't start animation until size is measured

    const contentSize = size + gap;
    const from = reverse ? -contentSize / 2 : 0;
    const to = reverse ? 0 : -contentSize / 2;

    const distanceToTravel = Math.abs(to - from);
    const duration = distanceToTravel / currentSpeed;

    if (isTransitioning) {
      const remainingDistance = Math.abs(translation.get() - to);
      const transitionDuration = remainingDistance / currentSpeed;

      controls = animate(translation, [translation.get(), to], {
        ease: 'linear',
        duration: transitionDuration,
        onComplete: () => {
          setIsTransitioning(false);
          setKey((prevKey) => prevKey + 1);
        },
      });
    } else {
      // Set initial position before starting the loop
      translation.set(from);
      controls = animate(translation, [from, to], {
        ease: 'linear',
        duration: duration,
        repeat: Infinity,
        repeatType: 'loop',
        repeatDelay: 0,
      });
    }

    return () => controls?.stop();
  }, [
    key,
    translation,
    currentSpeed,
    width,
    height,
    gap,
    isTransitioning,
    direction,
    reverse,
  ]);

  const hoverProps = speedOnHover
    ? {
        onHoverStart: () => {
          setIsTransitioning(true);
          setCurrentSpeed(speedOnHover);
        },
        onHoverEnd: () => {
          setIsTransitioning(true);
          setCurrentSpeed(speed);
        },
      }
    : {};

  return (
    <div className={cn('overflow-hidden', className)}>
      <motion.div
        className="flex w-max"
        style={{
          ...(direction === 'horizontal'
            ? { x: translation }
            : { y: translation }),
          gap: `${gap}px`,
          flexDirection: direction === 'horizontal' ? 'row' : 'column',
        }}
        ref={ref}
        {...hoverProps}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
}

// --- Integration Card Component ---
const IntegrationCard = ({ children, className, isCenter = false }: { children: React.ReactNode; className?: string; isCenter?: boolean }) => {
    return (
        <div className={cn('bg-background relative z-20 flex size-12 items-center justify-center rounded-full border', className)}>
            <div className={cn('m-auto size-fit text-muted-foreground *:size-5', isCenter && '*:size-8')}>{children}</div>
        </div>
    )
}


// --- Main Exported Component ---
export default function IntegrationsSection() {
    return (
        <section>
            <div className="mx-auto max-w-5xl px-6">
                <div className="bg-transparent group relative mx-auto max-w-[22rem] items-center justify-between space-y-6 sm:max-w-md">
                    
                    {/* Slider Row 1 */}
                    <div>
                        <InfiniteSlider
                            gap={24}
                            speed={20}
                            speedOnHover={10}>
                            {iconConfigs.map((cfg, idx) => (
                                 <IntegrationCard key={`r1-${idx}`}><span style={{color: cfg.color}}>{cfg.icon}</span></IntegrationCard>
                            ))}
                        </InfiniteSlider>
                    </div>

                    {/* Slider Row 2 */}
                    <div>
                        <InfiniteSlider
                            gap={24}
                            speed={20}
                            speedOnHover={10}
                            reverse>
                             {iconConfigs.slice().reverse().map((cfg, idx) => (
                                <IntegrationCard key={`r2-${idx}`}><span style={{color: cfg.color}}>{cfg.icon}</span></IntegrationCard>
                            ))}
                        </InfiniteSlider>
                    </div>

                    {/* Slider Row 3 */}
                    <div>
                        <InfiniteSlider
                            gap={24}
                            speed={20}
                            speedOnHover={10}>
                             {[...iconConfigs].sort(() => Math.random() - 0.5).map((cfg, idx) => (
                                 <IntegrationCard key={`r3-${idx}`}><span style={{color: cfg.color}}>{cfg.icon}</span></IntegrationCard>
                            ))}
                        </InfiniteSlider>
                    </div>

                    {/* Center Logo */}
                    <div className="absolute inset-0 m-auto flex size-fit justify-center gap-2">
                        <IntegrationCard
                            className="shadow-black-950/10 size-16 bg-white/25 shadow-xl backdrop-blur-md backdrop-grayscale dark:border-white/10 dark:bg-black/25 dark:shadow-white/15"
                            isCenter={true}>
                            <MainLogoIcon />
                        </IntegrationCard>
                    </div>
                </div>
            </div>
        </section>
    )
}
