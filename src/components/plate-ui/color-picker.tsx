
'use client';

import React from 'react';
import { cn, withRef } from '@udecode/cn';
import {
  useColorDropdownMenuState,
  useColorDropdownMenu,
} from '@udecode/plate-font';
import { Check } from 'lucide-react';

import { Button } from './button';
import { Input } from './input';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Separator } from './separator';
import { DropdownMenuItem } from './dropdown-menu';

export const ColorInput = withRef<'input'>(
  ({ value = '#000000', ...props }, ref) => {
    const [color, setColor] = React.useState(value);

    return (
      <div className="flex items-center gap-2">
        <div
          className="size-4 rounded-full border"
          style={{ backgroundColor: color }}
        />
        <Input
          ref={ref}
          className="h-8"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          {...props}
        />
      </div>
    );
  }
);

const ColorButton = ({ color, isSelected, updateColor }) => (
    <DropdownMenuItem
        asChild
        onSelect={(e) => {
            e.preventDefault();
            updateColor(color.value);
        }}
    >
        <Button
            variant="outline"
            className={cn(
                'w-full justify-start',
                isSelected && 'border-primary'
            )}
        >
            <div className="flex w-full items-center gap-2">
                <div
                    className="size-4 rounded-full border"
                    style={{ backgroundColor: color.value }}
                />
                <div className="flex-1">{color.name}</div>
                {isSelected && <Check className="size-4" />}
            </div>
        </Button>
    </DropdownMenuItem>
);


export const ColorPicker = withRef<
  'div',
  {
    color?: string;
    colors: any[];
    customColors: any[];
    updateColor: (color: string) => void;
    updateCustomColor: (color: string) => void;
    clearColor: () => void;
  }
>(
  (
    {
      color,
      colors,
      customColors,
      updateColor,
      updateCustomColor,
      clearColor,
      children,
      ...props
    },
    ref
  ) => {
    const state = useColorDropdownMenuState({
      color,
      colors,
      customColors,
      updateCustomColor,
    });

    const { colorPickerProps } = useColorDropdownMenu(state);
    const { value, inputProps } = colorPickerProps;

    return (
      <div ref={ref} className="flex flex-col gap-4 p-4" {...props}>
        <div className="flex flex-col gap-2">
             {colors.map((c, i) => (
                <ColorButton
                    key={c.name || i}
                    color={c}
                    isSelected={color === c.value}
                    updateColor={updateColor}
                />
            ))}
        </div>

        <Separator />

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-left">
              {children || 'Custom color'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-4" align="start">
            <div className="flex flex-col gap-4">
              <ColorInput {...inputProps} />
              <Button
                variant="outline"
                onClick={() => updateCustomColor(value ?? '')}
              >
                Update
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <Button
          variant="outline"
          onClick={() => {
            updateColor('transparent');
            clearColor();
          }}
        >
          Clear
        </Button>
      </div>
    );
  }
);
