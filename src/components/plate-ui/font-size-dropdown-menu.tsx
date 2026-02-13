
'use client';

import React from 'react';
import {
  useColorDropdownMenu,
  useColorDropdownMenuState,
  MARK_FONT_SIZE,
} from '@udecode/plate-font';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  useOpenState,
} from './dropdown-menu';
import { ToolbarButton } from './toolbar';

const items = [
  {
    value: '12',
    label: '12',
  },
  {
    value: '14',
    label: '14',
  },
  {
    value: '16',
    label: '16',
  },
  {
    value: '18',
    label: '18',
  },
  {
    value: '24',
    label: '24',
  },
  {
    value: '30',
    label: '30',
  },
  {
    value: '36',
    label: '36',
  },
];

const defaultSize = '16';

export function FontSizeDropdownMenu() {
  const openState = useOpenState();

  const state = useColorDropdownMenuState({
    nodeType: MARK_FONT_SIZE,
    colors: items,
    defaultColor: defaultSize,
    closeOnSelect: true,
  });

  const { radioGroupProps } = useColorDropdownMenu(state);

  return (
    <DropdownMenu modal={false} {...openState}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton
          pressed={openState.open}
          tooltip="Font Size"
          isDropdown
          className="w-[50px]"
        >
          {state.selectedColor ?? defaultSize}
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="min-w-0">
        <DropdownMenuRadioGroup
          className="flex flex-col gap-0.5"
          {...radioGroupProps}
        >
          {items.map(({ value: itemValue, label }) => (
            <DropdownMenuRadioItem
              key={itemValue}
              value={itemValue}
              className="w-20"
              hideIcon
            >
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
