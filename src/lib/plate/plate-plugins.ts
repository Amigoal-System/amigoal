
import { createAutoformatPlugin } from '@udecode/plate-autoformat';
import {
  createBoldPlugin,
  createCodePlugin,
  createItalicPlugin,
  createStrikethroughPlugin,
  createSubscriptPlugin,
  createSuperscriptPlugin,
  createUnderlinePlugin,
} from '@udecode/plate-basic-marks';
import { createBlockquotePlugin } from '@udecode/plate-block-quote';
import {
  createExitBreakPlugin,
  createSoftBreakPlugin,
} from '@udecode/plate-break';
import { createCodeBlockPlugin, ELEMENT_CODE_BLOCK } from '@udecode/plate-code-block';
import {
  createReactPlugin,
  createHistoryPlugin,
} from '@udecode/plate-common';
import { createDndPlugin } from '@udecode/plate-dnd';
import {
  createFontColorPlugin,
  createFontBackgroundColorPlugin,
  createFontSizePlugin,
} from '@udecode/plate-font';
import { createHeadingPlugin, ELEMENT_H1, ELEMENT_H2, ELEMENT_H3, ELEMENT_H4, ELEMENT_H5, ELEMENT_H6 } from '@udecode/plate-heading';
import { createHorizontalRulePlugin } from '@udecode/plate-horizontal-rule';
import { createIndentListPlugin } from '@udecode/plate-indent-list';
import { createJuicePlugin } from '@udecode/plate-juice';
import { createColumnPlugin } from '@udecode/plate-layout';
import { createLinkPlugin } from '@udecode/plate-link';
import { createListPlugin, createTodoListPlugin } from '@udecode/plate-list';
import { createMediaEmbedPlugin } from '@udecode/plate-media';
import { createNodeIdPlugin } from '@udecode/plate-node-id';
import { createParagraphPlugin, ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph';
import { createResetNodePlugin } from '@udecode/plate-reset-node';
import { createSelectOnBackspacePlugin } from '@udecode/plate-select';
import { createTablePlugin } from '@udecode/plate-table';

import { autoformatRules } from './autoformat-rules';
import { dragOverCursor } from './drag-over-cursor';

const resetBlockTypesCommonRule = {
  types: [
    ELEMENT_H1,
    ELEMENT_H2,
    ELEMENT_H3,
    ELEMENT_H4,
    ELEMENT_H5,
    ELEMENT_H6,
  ],
  defaultType: ELEMENT_PARAGRAPH,
};

export const plugins = [
  createReactPlugin(),
  createHistoryPlugin(),
  createParagraphPlugin(),
  createBlockquotePlugin(),
  createTodoListPlugin(),
  createHeadingPlugin(),
  createHorizontalRulePlugin(),
  createLinkPlugin(),
  createListPlugin(),
  createMediaEmbedPlugin(),
  createCodeBlockPlugin(),
  createTablePlugin(),
  createBoldPlugin(),
  createItalicPlugin(),
  createUnderlinePlugin(),
  createStrikethroughPlugin(),
  createCodePlugin(),
  createSubscriptPlugin(),
  createSuperscriptPlugin(),
  createNodeIdPlugin(),
  createFontColorPlugin(),
  createFontBackgroundColorPlugin(),
  createFontSizePlugin(),
  createAutoformatPlugin({
    options: {
      rules: autoformatRules,
    },
  }),
  createResetNodePlugin({
    options: {
      rules: [
        {
          ...resetBlockTypesCommonRule,
          hotkey: 'Enter',
          predicate: (editor) => !editor.selection,
        },
        {
          ...resetBlockTypesCommonRule,
          hotkey: 'Backspace',
          predicate: (editor) => !editor.selection,
        },
      ],
    },
  }),
  createSoftBreakPlugin({
    options: {
      rules: [
        { hotkey: 'shift+enter' },
        {
          hotkey: 'enter',
          query: {
            allow: [
              ELEMENT_H1,
              ELEMENT_H2,
              ELEMENT_H3,
              ELEMENT_H4,
              ELEMENT_H5,
              ELEMENT_H6,
            ],
          },
        },
      ],
    },
  }),
  createExitBreakPlugin({
    options: {
      rules: [
        {
          hotkey: 'mod+enter',
        },
        {
          hotkey: 'mod+shift+enter',
          before: true,
        },
        {
          hotkey: 'enter',
          query: {
            start: true,
            end: true,
            allow: [
              ELEMENT_H1,
              ELEMENT_H2,
              ELEMENT_H3,
              ELEMENT_H4,
              ELEMENT_H5,
              ELEMENT_H6,
            ],
          },
        },
      ],
    },
  }),
  createSelectOnBackspacePlugin({
    options: {
      query: {
        allow: [
          ELEMENT_H1,
        ],
      },
    },
  }),
  createIndentListPlugin(),
  createDndPlugin({
    options: {
      enableScroller: true,
      dragOverCursor,
    },
  }),
  createJuicePlugin(),
  createColumnPlugin({
    inject: {
      props: {
        validTypes: [
          ELEMENT_PARAGRAPH,
          ELEMENT_H1,
          ELEMENT_H2,
          ELEMENT_H3,
          ELEMENT_H4,
          ELEMENT_H5,
          ELEMENT_H6,
          ELEMENT_CODE_BLOCK,
        ],
      },
    },
  }),
];
