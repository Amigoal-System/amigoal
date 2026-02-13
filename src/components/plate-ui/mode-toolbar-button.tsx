
import React from 'react';
import { useEditorReadOnly, useEditorRef, usePlateStore } from '@udecode/plate-common';

import { Eye, FileEdit } from 'lucide-react';

import { ToolbarButton } from './toolbar';

export function ModeToolbarButton() {
  const editor = useEditorRef();
  const setReadOnly = usePlateStore().set.readOnly();
  const readOnly = useEditorReadOnly();

  return (
    <ToolbarButton
      tooltip={readOnly ? 'Editable' : 'Read-only'}
      isDropdown={false}
      onClick={() => {
        setReadOnly!(!readOnly);
      }}
    >
      {readOnly ? <Eye /> : <FileEdit />}
    </ToolbarButton>
  );
}
