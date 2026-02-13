
'use client';

import React from 'react';
import {
  useAlignDropdownMenu,
  useAlignDropdownMenuState,
} from '@udecode/plate-alignment';

import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';

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
    value: 'left',
    icon: AlignLeft,
  },
  {
    value: 'center',
    icon: AlignCenter,
  },
  {
    value: 'right',
    icon: AlignRight,
  },
  {
    value: 'justify',
    icon: AlignJustify,
  },
];

export function AlignDropdownMenu({ children }: { children?: React.ReactNode }) {
  const state = useAlignDropdownMenuState();
  const { radioGroupProps } = useAlignDropdownMenu(state);

  const openState = useOpenState();
  const IconValue =
    items.find((item) => item.value === radioGroupProps.value)?.icon ??
    AlignLeft;

  return (
    <DropdownMenu modal={false} {...openState} {...state}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton
          pressed={openState.open}
          tooltip="Align"
          isDropdown
        >
          <IconValue />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="min-w-0">
        <DropdownMenuRadioGroup
          className="flex flex-col gap-0.5"
          {...radioGroupProps}
        >
          {items.map(({ value: itemValue, icon: Icon }) => (
            <DropdownMenuRadioItem
              key={itemValue}
              value={itemValue}
              hideIcon
            >
              <Icon className="mr-2 size-4" />
              {itemValue}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
