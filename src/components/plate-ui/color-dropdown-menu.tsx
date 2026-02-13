
'use client';

import React from 'react';
import {
  useColorDropdownMenu,
  useColorDropdownMenuState,
} from '@udecode/plate-font';

import { COLOR_PALETTE } from '@/lib/plate/color-palette';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { ToolbarButton } from './toolbar';
import { ColorPicker } from './color-picker';

export function ColorDropdownMenu({
  nodeType,
  tooltip,
  children,
}: {
  nodeType: string;
  tooltip?: string;
  children: React.ReactNode;
}) {
  const state = useColorDropdownMenuState({
    nodeType,
    colors: COLOR_PALETTE,
    customColors: COLOR_PALETTE,
  });

  const { buttonProps, colorPickerProps } = useColorDropdownMenu(state);

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton tooltip={tooltip} {...buttonProps}>
          {children}
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start">
        <ColorPicker
          color={state.selectedColor || state.color}
          colors={state.colors}
          customColors={state.customColors}
          updateColor={state.updateColorAndClose}
          updateCustomColor={state.updateCustomColor}
          clearColor={state.clearColor}
          {...colorPickerProps}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
