
'use client'
import React, { useState } from 'react'
import { cn } from '@/lib/utils'

interface SubtleButtonProps {
    children: React.ReactNode;
    onClick: () => void;
    isActive?: boolean;
    className?: string;
}

export function SubtleButton({ children, onClick, isActive = false, className }: SubtleButtonProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

  return (
    <button 
        className={cn(
            'group relative border flex justify-center items-center gap-2 border-white/70 rounded-full h-9 px-4',
            'transition-all duration-300 ease-out hover:border-white hover:shadow-lg hover:scale-105 active:scale-95 overflow-hidden backdrop-blur-sm',
            isActive ? 'border-green-500/70 hover:border-green-500 hover:shadow-green-500/20' : 'border-amber-500/70 hover:border-amber-500 hover:shadow-amber-500/20',
            className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
            setIsHovered(false)
            setIsPressed(false)
        }}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onClick={onClick}
    >
        {/* Subtle glow effect */}
        <div className={cn(
            'absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500',
            isActive ? 'bg-gradient-to-r from-green-200/0 via-green-200/10 to-green-200/0' : 'bg-gradient-to-r from-amber-200/0 via-amber-200/10 to-amber-200/0'
        )}></div>
        
        {/* Text */}
        <span className={cn(
            'font-medium tracking-wide text-xs transition-all duration-300 relative z-10',
             isActive ? 'text-green-400 group-hover:text-green-300' : 'text-amber-400 group-hover:text-amber-300'
        )}>
            {children}
        </span>
        
        {/* Animated dot */}
        <span className={cn(
            `relative z-10 w-2 h-2 rounded-full transition-all duration-300 ease-out`,
            isHovered ? 'shadow-lg scale-110' : '',
            isPressed ? 'scale-90' : '',
            isActive 
                ? 'bg-green-300 group-hover:bg-green-200 shadow-green-300/50' 
                : 'bg-amber-200 group-hover:bg-amber-300 shadow-amber-300/50'
        )}>
          {/* Ripple effect */}
          <div className={cn(
              'absolute inset-0 rounded-full animate-ping opacity-0 group-hover:opacity-75',
              isActive ? 'bg-green-200' : 'bg-amber-200'
          )}
               style={{ animationDuration: '2s' }}></div>
        </span>
      </button>
  )
}
