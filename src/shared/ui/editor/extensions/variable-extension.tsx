import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';

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

import { VariableNodeView } from './variable-node-view';

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
    return ReactNodeViewRenderer(VariableNodeView);
  },
});
