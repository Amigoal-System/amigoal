
'use client';

import { cn } from '@udecode/cn';
import { Plate } from '@udecode/plate-common';
import { ELEMENT_H1 } from '@udecode/plate-heading';
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph';
import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Editor } from '@/components/plate-ui/editor';
import { FixedToolbar } from '@/components/plate-ui/fixed-toolbar';
import { FixedToolbarButtons } from '@/components/plate-ui/fixed-toolbar-buttons';
import { FloatingToolbar } from '@/components/plate-ui/floating-toolbar';
import { FloatingToolbarButtons } from '@/components/plate-ui/floating-toolbar-buttons';
import { plugins } from '@/lib/plate/plate-plugins';

export function PlateEditor({
  className,
  ...props
}: {
  className?: string;
  [key: string]: any;
}) {
  const initialValue = [
    {
      id: '1',
      type: ELEMENT_PARAGRAPH,
      children: [{ text: '' }],
    },
  ];

  const [debug, setDebug] = React.useState(false);

  return (
    <DndProvider backend={HTML5Backend}>
      <Plate
        plugins={plugins}
        initialValue={initialValue}
        onChange={(newValue) => {
          if (debug) {
            console.log(newValue);
          }
        }}
        {...props}
      >
        <div
          className={cn(
            'relative',
            // Block selection
            '[&_.slate-start-area-left]:!w-[64px] [&_.slate-start-area-right]:!w-[64px] [&_.slate-start-area-top]:!h-4'
          )}
        >
          <FixedToolbar>
            <FixedToolbarButtons />
          </FixedToolbar>

          <Editor
            className={cn('px-[58px] py-4', className)}
            autoFocus
            focusRing={false}
            variant="ghost"
            size="md"
          />

          <FloatingToolbar>
            <FloatingToolbarButtons />
          </FloatingToolbar>
        </div>
      </Plate>
    </DndProvider>
  );
}
