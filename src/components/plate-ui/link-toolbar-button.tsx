
'use client';

import React from 'react';
import {
  useLinkToolbarButton,
  useLinkToolbarButtonState,
} from '@udecode/plate-link';

import { Link } from 'lucide-react';

import { ToolbarButton } from './toolbar';

export function LinkToolbarButton() {
  const state = useLinkToolbarButtonState();
  const { props } = useLinkToolbarButton(state);

  return (
    <ToolbarButton tooltip="Link" {...props}>
      <Link />
    </ToolbarButton>
  );
}
