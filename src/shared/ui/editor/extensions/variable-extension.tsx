import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewProps } from '@tiptap/react';

export interface VariableAttributes {
  id: string;
  label: string;
  type?: 'string' | 'number' | 'date' | 'image';
  fallback?: string;
  format?: string;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    variable: {
      setVariable: (attributes: VariableAttributes) => ReturnType;
    };
  }
}

const VariableComponent = (props: NodeViewProps) => {
  const { node, selected } = props;
  const { label, type } = node.attrs;

  const isBold = node.marks.find((m) => m.type.name === 'bold');
  const isItalic = node.marks.find((m) => m.type.name === 'italic');
  const isStrike = node.marks.find((m) => m.type.name === 'strike');

  return (
    <NodeViewWrapper as="span" className="inline">
      <span
        className={`
          inline-flex items-center align-baseline gap-1 rounded-md px-1.5 py-0.5 transition-colors cursor-default select-none
          ${selected ? 'ring-2 ring-primary' : ''}
          ${
            type === 'number'
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              : type === 'date'
                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                : 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
          }
          ${isBold ? 'font-bold' : ''}
          ${isItalic ? 'italic' : ''}
          ${isStrike ? 'line-through' : ''}
        `}>
        {/* We can add icons here based on type */}
        <span className="opacity-70 text-xs no-underline">
          {type === 'date' ? '📅' : type === 'number' ? '#' : 'T'}
        </span>
        {label}
      </span>
    </NodeViewWrapper>
  );
};

export const VariableExtension = Node.create({
  name: 'variable',

  inline: true,

  group: 'inline',

  atom: true,

  marks: '_', // Allow all marks (bold, italic, etc.) on this node

  addAttributes() {
    return {
      id: {
        default: null,
      },
      label: {
        default: 'Variable',
      },
      type: {
        default: 'string',
      },
      fallback: {
        default: '',
      },
      format: {
        default: '',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="variable"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-type': 'variable' })];
  },

  renderText({ node }) {
    return `{{${node.attrs.label}}}`;
  },

  addCommands() {
    return {
      setVariable:
        (attributes: VariableAttributes) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: attributes,
          });
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(VariableComponent);
  },
});
