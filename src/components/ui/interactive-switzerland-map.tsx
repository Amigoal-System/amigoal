
'use client';

import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { X } from 'lucide-react';
import { cantonPaths } from '@/lib/canton-paths';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


export const InteractiveSwitzerlandMap = ({ onSelectionChange }) => {
    const [selectedCantons, setSelectedCantons] = useState<string[]>([]);
    
    const handleCantonClick = (cantonName: string) => {
        const newSelection = selectedCantons.includes(cantonName)
            ? selectedCantons.filter(c => c !== cantonName)
            : [...selectedCantons, cantonName];
        setSelectedCantons(newSelection);
        if (onSelectionChange) {
            onSelectionChange(newSelection);
        }
    };

    const handleReset = () => {
        setSelectedCantons([]);
        if (onSelectionChange) {
            onSelectionChange([]);
        }
    };

    return (
        <div className="w-full h-full flex flex-col gap-2">
            <TooltipProvider>
                <svg viewBox="0 0 1600 1000" className="w-full h-full">
                    <g transform="scale(0.8) translate(100, 50)">
                        {Object.entries(cantonPaths).map(([code, data]) => (
                            <Tooltip key={code}>
                                <TooltipTrigger asChild>
                                    <path
                                        d={data.path}
                                        data-code={code}
                                        className={cn(
                                            "cursor-pointer transition-all duration-200 stroke-[#555] stroke-[3] hover:fill-blue-300",
                                            selectedCantons.includes(data.name) 
                                                ? "fill-blue-500" 
                                                : "fill-gray-200"
                                        )}
                                        onClick={() => handleCantonClick(data.name)}
                                    />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{data.name}</p>
                                </TooltipContent>
                            </Tooltip>
                        ))}
                    </g>
                </svg>
            </TooltipProvider>
            {selectedCantons.length > 0 && (
                <Button onClick={handleReset} variant="outline" size="sm">
                    <X className="mr-2 h-4 w-4" />
                    Auswahl zurücksetzen
                </Button>
            )}
        </div>
    );
};
