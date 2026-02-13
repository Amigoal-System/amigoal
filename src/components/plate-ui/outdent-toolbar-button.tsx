
'use client';

import React from 'react';
import { useOutdentButton } from '@udecode/plate-indent';

import { Outdent } from 'lucide-react';

import { ToolbarButton } from './toolbar';

export function OutdentToolbarButton() {
  const { props } = useOutdentButton();

  return (
    <ToolbarButton tooltip="Outdent" {...props}>
      <Outdent />
    </ToolbarButton>
  );
}
