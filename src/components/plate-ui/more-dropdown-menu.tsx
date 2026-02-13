
'use client';

import React from 'react';
import {
  MARK_SUBSCRIPT,
  MARK_SUPERSCRIPT,
} from '@udecode/plate-basic-marks';
import { focusEditor } from '@udecode/plate-common';
import {
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
} from '@udecode/plate-heading';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  useOpenState,
} from './dropdown-menu';
import { MarkToolbarButton } from './mark-toolbar-button';
import { ToolbarButton } from './toolbar';
import { MoreVertical, Heading1, Heading2, Heading3, Subscript, Superscript } from 'lucide-react';

export function MoreDropdownMenu() {
  const openState = useOpenState();

  return (
    <DropdownMenu modal={false} {...openState}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton pressed={openState.open} tooltip="Insert" isDropdown>
          <MoreVertical />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="flex max-h-[500px] min-w-0 flex-col gap-0.5 overflow-y-auto"
      >
        <DropdownMenuItem
          onSelect={() => {
            // editor.insertNode({ type: ELEMENT_H1, children: [{ text: '' }] });
            // focusEditor(editor);
          }}
        >
          <Heading1 className="mr-2 size-5" />
          Heading 1
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
            // editor.insertNode({ type: ELEMENT_H2, children: [{ text: '' }] });
            // focusEditor(editor);
          }}
        >
          <Heading2 className="mr-2 size-5" />
          Heading 2
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
            // editor.insertNode({ type: ELEMENT_H3, children: [{ text: '' }] });
            // focusEditor(editor);
          }}
        >
          <Heading3 className="mr-2 size-5" />
          Heading 3
        </DropdownMenuItem>
        <MarkToolbarButton nodeType={MARK_SUBSCRIPT}>
          <Superscript className="mr-2 size-5" />
          Superscript
        </MarkToolbarButton>
        <MarkToolbarButton nodeType={MARK_SUPERSCRIPT}>
          <Subscript className="mr-2 size-5" />
          Subscript
        </MarkToolbarButton>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
