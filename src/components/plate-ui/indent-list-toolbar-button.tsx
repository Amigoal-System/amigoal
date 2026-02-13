
'use client';

import React from 'react';
import {
  useIndentListToolbarButton,
  useIndentListToolbarButtonState,
} from '@udecode/plate-indent-list';

import { List, ListOrdered } from 'lucide-react';

import { ToolbarButton } from './toolbar';

export function IndentListToolbarButton({
  nodeType,
}: {
  nodeType: 'ul' | 'ol';
}) {
  const state = useIndentListToolbarButtonState({ nodeType });
  const { props } = useIndentListToolbarButton(state);

  return (
    <ToolbarButton
      tooltip={nodeType === 'ul' ? 'Bulleted List' : 'Numbered List'}
      {...props}
    >
      {nodeType === 'ul' ? <List /> : <ListOrdered />}
    </ToolbarButton>
  );
}
