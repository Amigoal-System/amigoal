
'use client';

import React from 'react';
import {
    deleteColumn,
    deleteRow,
    deleteTable,
    insertTable,
    insertTableRow,
    insertTableColumn,
} from '@udecode/plate-table';
import { useEditorRef } from '@udecode/plate-common';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  useOpenState,
} from './dropdown-menu';
import { ToolbarButton } from './toolbar';
import { Table, Plus, Minus, Trash2 } from 'lucide-react';

export function TableDropdownMenu() {
    const editor = useEditorRef();
    const openState = useOpenState();

    return (
        <DropdownMenu modal={false} {...openState}>
            <DropdownMenuTrigger asChild>
                <ToolbarButton pressed={openState.open} tooltip="Table" isDropdown>
                <Table />
                </ToolbarButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                className="min-w-0"
                align="start"
            >
                <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                    <Table className="mr-2 h-5 w-5" />
                    <span>Table</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                    <DropdownMenuItem
                    onSelect={() => {
                        insertTable(editor);
                    }}
                    >
                    <Plus className="mr-2 h-5 w-5" />
                    Insert table
                    </DropdownMenuItem>
                    <DropdownMenuItem
                    onSelect={() => {
                        insertTableRow(editor);
                    }}
                    >
                    <Plus className="mr-2 h-5 w-5" />
                    Insert row
                    </DropdownMenuItem>
                    <DropdownMenuItem
                    onSelect={() => {
                        insertTableColumn(editor);
                    }}
                    >
                    <Plus className="mr-2 h-5 w-5" />
                    Insert column
                    </DropdownMenuItem>
                </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuItem
                onSelect={() => {
                    deleteColumn(editor);
                }}
                >
                <Minus className="mr-2 h-5 w-5" />
                Delete column
                </DropdownMenuItem>

                <DropdownMenuItem
                onSelect={() => {
                    deleteRow(editor);
                }}
                >
                <Minus className="mr-2 h-5 w-5" />
                Delete row
                </DropdownMenuItem>

                <DropdownMenuItem
                onSelect={() => {
                    deleteTable(editor);
                }}
                >
                <Trash2 className="mr-2 h-5 w-5" />
                Delete table
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
