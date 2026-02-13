
import {
  autoformatArrow,
  autoformatLegal,
  autoformatLegalHtml,
  autoformatMath,
  autoformatBlock,
  autoformatPunctuation,
  autoformatSmartQuotes,
} from '@udecode/plate-autoformat';
import {
  MARK_BOLD,
  MARK_CODE,
  MARK_ITALIC,
  MARK_STRIKETHROUGH,
  MARK_SUBSCRIPT,
  MARK_SUPERSCRIPT,
  MARK_UNDERLINE,
} from '@udecode/plate-basic-marks';
import { ELEMENT_BLOCKQUOTE } from '@udecode/plate-block-quote';
import { ELEMENT_CODE_BLOCK } from '@udecode/plate-code-block';
import {
  getParentNode,
  isElement,
  isType,
} from '@udecode/plate-common';
import {
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
} from '@udecode/plate-heading';
import { ELEMENT_HR } from '@udecode/plate-horizontal-rule';
import {
  ELEMENT_LI,
  ELEMENT_OL,
  ELEMENT_TODO_LI,
  ELEMENT_UL,
  toggleList,
  unwrapList,
} from '@udecode/plate-list';

const preFormat = (editor: any) => {
  unwrapList(editor);
};

export const autoformatRules = [
  ...autoformatPunctuation,
  ...autoformatSmartQuotes,
  ...autoformatLegal,
  ...autoformatLegalHtml,
  ...autoformatArrow,
  ...autoformatMath,
  {
    mode: 'mark',
    type: [MARK_BOLD, MARK_ITALIC],
    match: '***',
  },
  {
    mode: 'mark',
    type: [MARK_UNDERLINE, MARK_ITALIC],
    match: '__*',
  },
  {
    mode: 'mark',
    type: [MARK_UNDERLINE, MARK_BOLD],
    match: '__**',
  },
  {
    mode: 'mark',
    type: [MARK_UNDERLINE, MARK_BOLD, MARK_ITALIC],
    match: '___***',
  },
  ...(autoformatBlock.rules ?? []),
  {
    mode: 'block',
    type: ELEMENT_CODE_BLOCK,
    match: '```',
    triggerAtBlockStart: false,
    preFormat,
  },
  {
    mode: 'block',
    type: ELEMENT_TODO_LI,
    match: ['[] ', '[x] '],
  },
  {
    mode: 'block',
    type: ELEMENT_HR,
    match: ['---', '—-'],
    preFormat,
  },
  {
    mode: 'block',
    type: ELEMENT_BLOCKQUOTE,
    match: '> ',
    preFormat,
  },
  {
    mode: 'block',
    type: ELEMENT_H1,
    match: '# ',
    preFormat,
  },
  {
    mode: 'block',
    type: ELEMENT_H2,
    match: '## ',
    preFormat,
  },
  {
    mode: 'block',
    type: ELEMENT_H3,
    match: '### ',
    preFormat,
  },
  {
    mode: 'block',
    type: ELEMENT_H4,
    match: '#### ',
    preFormat,
  },
  {
    mode: 'block',
    type: ELEMENT_H5,
    match: '##### ',
    preFormat,
  },
  {
    mode: 'block',
    type: ELEMENT_H6,
    match: '###### ',
    preFormat,
  },
  {
    mode: 'block',
    type: ELEMENT_UL,
    match: ['* ', '- '],
    preFormat,
    format: (editor: any) => {
      toggleList(editor, { type: ELEMENT_UL });
    },
  },
  {
    mode: 'block',
    type: ELEMENT_OL,
    match: ['1. ', '1) '],
    preFormat,
    format: (editor: any) => {
      toggleList(editor, { type: ELEMENT_OL });
    },
  },
  {
    mode: 'block',
    query: (editor: any, { match }: any) => {
      const [start] = match;
      const parent = getParentNode(editor, editor.selection.focus.path);
      const isLvl2 = parent && parent[0].type === ELEMENT_LI && getParentNode(editor, parent[1]);

      return !isLvl2 && isElement(parent[0]) && !isType(editor, parent[0], ELEMENT_CODE_BLOCK);
    },
    trigger: 'space',
    type: [MARK_BOLD, MARK_ITALIC, MARK_STRIKETHROUGH, MARK_SUBSCRIPT, MARK_SUPERSCRIPT, MARK_UNDERLINE, MARK_CODE],
    match: ['`', '*', '_', '~', '^', '`'],
  }
];
