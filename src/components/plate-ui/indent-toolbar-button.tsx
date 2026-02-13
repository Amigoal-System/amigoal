
'use client';

import React from 'react';
import { useIndentButton } from '@udecode/plate-indent';

import { Indent } from 'lucide-react';

import { ToolbarButton } from './toolbar';

export function IndentToolbarButton() {
  const { props } = useIndentButton();

  return (
    <ToolbarButton tooltip="Indent" {...props}>
      <Indent />
    </ToolbarButton>
  );
}
