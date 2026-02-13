
import {
  MARK_BOLD,
  MARK_CODE,
  MARK_ITALIC,
  MARK_STRIKETHROUGH,
  MARK_UNDERLINE,
} from '@udecode/plate-basic-marks';
import React from 'react';
import {
  Bold,
  Code,
  Italic,
  Strikethrough,
  Underline,
} from 'lucide-react';
import { MarkToolbarButton } from './mark-toolbar-button';

export function FloatingToolbarButtons() {
  return (
    <>
      <MarkToolbarButton nodeType={MARK_BOLD} tooltip="Bold (⌘+B)">
        <Bold />
      </MarkToolbarButton>
      <MarkToolbarButton nodeType={MARK_ITALIC} tooltip="Italic (⌘+I)">
        <Italic />
      </MarkToolbarButton>
      <MarkToolbarButton nodeType={MARK_UNDERLINE} tooltip="Underline (⌘+U)">
        <Underline />
      </MarkToolbarButton>
      <MarkToolbarButton
        nodeType={MARK_STRIKETHROUGH}
        tooltip="Strikethrough (⌘+⇧+M)"
      >
        <Strikethrough />
      </MarkToolbarButton>
      <MarkToolbarButton nodeType={MARK_CODE} tooltip="Code (⌘+E)">
        <Code />
      </MarkToolbarButton>
    </>
  );
}
