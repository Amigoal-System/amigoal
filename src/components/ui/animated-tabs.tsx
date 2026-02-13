
"use client" 

import * as React from "react"
import { useEffect, useRef } from "react";
 
export interface AnimatedTabsProps {
  tabs: { label: string }[];
  activeTab: string;
  setActiveTab: (label: string) => void;
}
 
export function AnimatedTabs({ tabs, activeTab, setActiveTab }: AnimatedTabsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);
 
  useEffect(() => {
    const container = containerRef.current;
 
    if (container && activeTab) {
      const activeTabElement = activeTabRef.current;
 
      if (activeTabElement) {
        const { offsetLeft, offsetWidth } = activeTabElement;
 
        const clipLeft = offsetLeft;
        const clipRight = container.offsetWidth - (offsetLeft + offsetWidth);
 
        container.style.clipPath = `inset(0 ${'\'\'\''}{clipRight}px 0 ${'\'\'\''}{clipLeft}px round 999px)`;
      }
    }
  }, [activeTab]);
 
  return (
    <div className="relative bg-secondary/50 border border-primary/10 mx-auto flex w-fit flex-col items-center rounded-full py-2 px-4">
      <div
        ref={containerRef}
        className="absolute inset-0 z-10 w-full overflow-hidden [clip-path:inset(0_75%_0_0%_round_999px)] transition-[clip-path] duration-300 ease-in-out"
      >
        <div className="relative flex w-full justify-center bg-primary">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(tab.label)}
              className="flex h-8 items-center rounded-full px-4 text-sm font-medium text-primary-foreground"
              tabIndex={-1}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
 
      <div className="relative flex w-full justify-center">
        {tabs.map(({ label }, index) => {
          const isActive = activeTab === label;
 
          return (
            <button
              key={index}
              ref={isActive ? activeTabRef : null}
              onClick={() => setActiveTab(label)}
              className="flex h-8 items-center cursor-pointer rounded-full px-4 text-sm font-medium text-muted-foreground"
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
