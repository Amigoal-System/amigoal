'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export const LiveTickerLoader = ({ className }: { className?: string }) => {
  return (
    <div className={cn("flex items-center justify-center h-full w-full", className)}>
        <div className="loader">
            <div className="ph1">
            <div className="record" />
            <div className="record-text">REC</div>
            </div>
            <div className="ph2">
            <div className="laptop-b" />
            <svg className="laptop-t" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 42 30">
                <path d="M21 1H5C2.78 1 1 2.78 1 5V25a4 4 90 004 4H37a4 4 90 004-4V5c0-2.22-1.8-4-4-4H21" pathLength={100} strokeWidth={2} stroke="currentColor" fill="none" />
            </svg>
            </div>
            <div className="icon" />
        </div>
    </div>
  );
}

export default LiveTickerLoader;
