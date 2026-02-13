
'use client';

import React from 'react';
import { useMediaToolbarButton } from '@udecode/plate-media';

import { Image as ImageIcon } from 'lucide-react';

import { ToolbarButton } from './toolbar';

export function MediaToolbarButton({ nodeType }: { nodeType: string }) {
  const { props } = useMediaToolbarButton({ nodeType });

  return (
    <ToolbarButton {...props}>
      <ImageIcon />
    </ToolbarButton>
  );
}
