import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Image } from '@tiptap/extension-image';
import { Underline } from '@tiptap/extension-underline';
import { TextAlign } from '@tiptap/extension-text-align';
import { PAGE_SIZES, PaginationPlus } from 'tiptap-pagination-plus';
import { VariableExtension } from './extensions/variable-extension';

interface GetExtensionsProps {
  theme?: string;
}

export const getEditorExtensions = ({ theme }: GetExtensionsProps) => [
  StarterKit.configure({
    dropcursor: {
      width: 2,
      class: 'ProseMirror-dropcursor',
    },
  }),
  Table.configure({
    resizable: true,
  }),
  TableRow,
  TableHeader,
  TableCell,
  Image,
  Underline,
  TextAlign.configure({
    types: ['heading', 'paragraph'],
  }),
  PaginationPlus.configure({
    ...PAGE_SIZES.A4,
    pageBreakBackground: theme === 'dark' ? 'var(--color-slate-900)' : 'var(--color-slate-100)',
  }),
  VariableExtension,
];
