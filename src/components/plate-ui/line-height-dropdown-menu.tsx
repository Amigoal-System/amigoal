
'use client';

import React from 'react';
import {
  useLineHeightDropdownMenu,
  useLineHeightDropdownMenuState,
} from '@udecode/plate-line-height';

import { Baseline } from 'lucide-react';

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
    value: '1',
    icon: Baseline,
  },
  {
    value: '1.25',
    icon: Baseline,
  },
  {
    value: '1.5',
    icon: Baseline,
  },
  {
    value: '2',
    icon: Baseline,
  },
  {
    value: '3',
    icon: Baseline,
  },
];

export function LineHeightDropdownMenu({
  children,
}: {
  children?: React.ReactNode;
}) {
  const state = useLineHeightDropdownMenuState();
  const { radioGroupProps } = useLineHeightDropdownMenu(state);

  const openState = useOpenState();

  return (
    <DropdownMenu modal={false} {...openState} {...state}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton
          pressed={openState.open}
          tooltip="Line Height"
          isDropdown
        >
          <Baseline />
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
