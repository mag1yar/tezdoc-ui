import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';

import { cn } from '../../../lib/utils';
import type { VariableAttributes } from './variable-extension';

export const VariableNodeView = (props: NodeViewProps) => {
  const { node, selected } = props;
  const { label, type } = node.attrs as VariableAttributes;

  const isBold = node.marks.find((m) => m.type.name === 'bold');
  const isItalic = node.marks.find((m) => m.type.name === 'italic');
  const isStrike = node.marks.find((m) => m.type.name === 'strike');

  return (
    <NodeViewWrapper as="span" className="mx-0.5 outline-none">
      <span
        className={cn(
          'inline-flex items-baseline gap-[0.3em] rounded-md px-[0.4em] py-0 transition-colors cursor-default select-none border box-border leading-none outline-none',
          selected ? 'ring-2 ring-ring ring-offset-1' : '',
          type === 'number'
            ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
            : type === 'date'
              ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800'
              : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
        )}
        style={{ fontSize: 'inherit' }}>
        <span
          className="opacity-60 text-[0.6em] uppercase tracking-wider font-bold select-none relative top-[-0.05em]"
          contentEditable={false}>
          {type === 'date' ? 'DATE' : type === 'number' ? 'NUM' : 'VAR'}
        </span>
        <span
          className={cn(isBold && 'font-bold', isItalic && 'italic', isStrike && 'line-through')}>
          {label}
        </span>
      </span>
    </NodeViewWrapper>
  );
};
