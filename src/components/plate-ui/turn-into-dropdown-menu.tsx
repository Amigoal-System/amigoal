
'use client';

import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  useOpenState,
} from './dropdown-menu';
import {
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
} from '@udecode/plate-heading';
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph';
import { ELEMENT_TABLE } from '@udecode/plate-table';
import {
  someNode,
  useEditorState,
  toggleNodeType,
} from '@udecode/plate-common';

import { Pilcrow, Heading1, Heading2, Heading3, Heading4, Heading5, Heading6, Table } from 'lucide-react';

import { ToolbarButton } from './toolbar';

const items = [
  {
    value: ELEMENT_PARAGRAPH,
    label: 'Paragraph',
    description: 'Paragraph',
    icon: Pilcrow,
  },
  {
    value: ELEMENT_H1,
    label: 'Heading 1',
    description: 'Heading 1',
    icon: Heading1,
  },
  {
    value: ELEMENT_H2,
    label: 'Heading 2',
    description: 'Heading 2',
    icon: Heading2,
  },
  {
    value: ELEMENT_H3,
    label: 'Heading 3',
    description: 'Heading 3',
    icon: Heading3,
  },
  {
    value: ELEMENT_H4,
    label: 'Heading 4',
    description: 'Heading 4',
    icon: Heading4,
  },
  {
    value: ELEMENT_H5,
    label: 'Heading 5',
    description: 'Heading 5',
    icon: Heading5,
  },
  {
    value: ELEMENT_H6,
    label: 'Heading 6',
    description: 'Heading 6',
    icon: Heading6,
  },
  {
    value: ELEMENT_TABLE,
    label: 'Table',
    description: 'Table',
    icon: Table,
  },
];

const defaultItem = items.find((item) => item.value === ELEMENT_PARAGRAPH)!;

export function TurnIntoDropdownMenu() {
  const openState = useOpenState();
  const editor = useEditorState();

  const activeItem =
    items.find((item) => someNode(editor, { match: { type: item.value } })) ??
    defaultItem;

  const { icon: SelectedItemIcon, label: selectedItemLabel } = activeItem;

  return (
    <DropdownMenu modal={false} {...openState}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton
          pressed={openState.open}
          tooltip="Turn into"
          isDropdown
          className="lg:min-w-[130px]"
        >
          <SelectedItemIcon className="size-5 lg:hidden" />
          <span className="max-lg:hidden">{selectedItemLabel}</span>
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="min-w-0">
        <DropdownMenuLabel>Turn into</DropdownMenuLabel>

        {items.map(({ value: itemValue, label, icon: Icon }) => (
          <DropdownMenuItem
            key={itemValue}
            className="min-w-[180px]"
            onSelect={() => {
              toggleNodeType(editor, { activeType: itemValue });
              openState.onOpenChange(false);
            }}
          >
            <Icon className="mr-2 size-5" />
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
