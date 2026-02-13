
'use client';

import React from 'react';
import {
  collapseSelection,
  findNode,
  getBlockAbove,
  getPluginType,
  isBlock,
  isCollapsed,
  someNode,
  useEditorRef,
  useEditorSelector,
  setNodes,
} from '@udecode/plate-common';
import {
  getLayoutNode,
  TLayoutElement,
  useColumnState,
  ELEMENT_COLUMN,
} from '@udecode/plate-layout';

import { Icons } from '@/components/icons';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  useOpenState,
} from './dropdown-menu';
import { ToolbarButton, ToolbarGroup } from './toolbar';

// The ELEMENT_LAYOUT constant is not exported from the package anymore.
// It is defined as a string literal.
export const ELEMENT_LAYOUT = 'layout';


export function LayoutToolbarButton() {
  const editor = useEditorRef();
  const openState = useOpenState();

  const { minColumns, maxColumns } = useColumnState();

  const layoutNode = useEditorSelector(
    (editor) => getBlockAbove<TLayoutElement>(editor, {
      match: { type: getPluginType(editor, ELEMENT_LAYOUT) },
    }),
    []
  )?.[0];

  const numColumns = layoutNode?.children.length ?? 0;
  
  return (
    <DropdownMenu modal={false} {...openState}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton
          pressed={openState.open}
          tooltip="Layout"
          isDropdown
        >
          <Icons.layout />
        </ToolbarButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="flex min-w-0"
      >
        <ToolbarGroup className='flex-wrap'>
          <DropdownMenuItem
            className="h-auto"
            onClick={() => {
              if (numColumns > minColumns) {
                setNodes<TLayoutElement>(editor, {
                  layout: [
                    ...layoutNode.layout,
                    ...Array(numColumns - minColumns).fill(1),
                  ].slice(0, numColumns - 1)
                });
              }
            }}
          >
            <Icons.minus />
          </DropdownMenuItem>

          {Array.from({ length: maxColumns }, (_, i) => i + 1).map((i) => (
            <DropdownMenuItem
              className="h-auto"
              key={i}
              onClick={() => {
                const newLayout = Array(i).fill(1);
                
                setNodes<TLayoutElement>(
                  editor,
                  { layout: newLayout },
                );
              }}
            >
              {i}
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem
            className="h-auto"
            onClick={() => {
              if (numColumns < maxColumns) {
                setNodes<TLayoutElement>(editor, {
                  layout: [
                    ...layoutNode.layout,
                    ...Array(maxColumns - numColumns).fill(1),
                  ].slice(0, numColumns + 1)
                });
              }
            }}
          >
            <Icons.add />
          </DropdownMenuItem>
        </ToolbarGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
