import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Image } from '@tiptap/extension-image';
import { TextAlign } from '@tiptap/extension-text-align';
import { PAGE_SIZES, PaginationPlus } from 'tiptap-pagination-plus';
import { VariableExtension } from './extensions/variable-extension';
import { VariableSuggestion } from './extensions/variable-suggestion';
import { VariableDefinition } from '@/shared/lib/variable-utils';

interface GetExtensionsProps {
  theme?: string;
  getVariables: () => VariableDefinition[];
  onAddVariable?: (variableId: string) => void;
}

export const getEditorExtensions = ({ theme, getVariables, onAddVariable }: GetExtensionsProps) => [
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
  TextAlign.configure({
    types: ['heading', 'paragraph'],
  }),
  PaginationPlus.configure({
    ...PAGE_SIZES.A4,
    pageBreakBackground: theme === 'dark' ? 'var(--color-slate-900)' : 'var(--color-slate-100)',
  }),
  VariableExtension,
  VariableSuggestion.configure({
    getVariables,
    onAddVariable,
  }),
];
