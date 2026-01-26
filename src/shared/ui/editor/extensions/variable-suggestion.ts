import { ReactRenderer } from '@tiptap/react';
import Suggestion from '@tiptap/suggestion';
import { VariableSuggestionList, VariableSuggestionListRef } from '../variable-suggestion-list';
import { VariableDefinition } from '@/shared/lib/variable-utils';
import { Extension } from '@tiptap/core';
import { PluginKey } from '@tiptap/pm/state';
import { computePosition, flip, shift, offset } from '@floating-ui/dom';

export const VariableSuggestion = Extension.create({
  name: 'variableSuggestion',

  addOptions() {
    return {
      char: '{{',
      pluginKey: new PluginKey('variableSuggestion'),
      getVariables: () => [] as VariableDefinition[],
      onAddVariable: undefined as ((variableId: string) => void) | undefined,
    };
  },

  addProseMirrorPlugins() {
    const { onAddVariable, getVariables } = this.options;
    
    return [
      Suggestion({
        editor: this.editor,
        char: this.options.char,
        pluginKey: this.options.pluginKey,
        command: ({ editor, range, props }: any) => {
          // If this is a new variable, call the callback to add it to sample data
          if (props.isNew && onAddVariable) {
            onAddVariable(props.id);
          }
          
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .setVariable({
              id: props.id,
              label: props.label,
              type: props.type,
            })
            .run();
        },
        items: ({ query }: { query: string }) => {
          // Return filtered items - the query is passed to render via props
          return getVariables().filter((item: VariableDefinition) =>
            item.id.toLowerCase().includes(query.toLowerCase()),
          );
        },
        render: () => {
          let component: ReactRenderer<VariableSuggestionListRef> | null = null;
          let popup: HTMLDivElement | null = null;
          let scrollParent: HTMLElement | null = null;
          let originalOverflow: string = '';
          let isSuspended = false;

          let editor: any = null;

          const cleanupListeners = () => {
            document.removeEventListener('mousedown', handleClickOutside);
          };

          const destroy = () => {
            if (scrollParent) {
              scrollParent.style.overflow = originalOverflow;
              scrollParent = null;
            }
            popup?.remove();
            component?.destroy();
            popup = null;
            component = null;
            cleanupListeners();
          };

          const suspend = () => {
            if (!popup || isSuspended) return;

            // Hide popup
            popup.style.display = 'none';
            // Unlock scroll
            if (scrollParent) {
              scrollParent.style.overflow = originalOverflow;
            }
            isSuspended = true;
          };

          const resume = () => {
            if (!popup || !isSuspended) return;

            // Show popup
            popup.style.display = 'block';
            // Lock scroll
            if (scrollParent) {
              scrollParent.style.overflow = 'hidden';
            }
            isSuspended = false;
          };

          const handleClickOutside = (event: MouseEvent) => {
            if (popup && !popup.contains(event.target as Node)) {
              suspend();
            }
          };

          const handleFocus = () => {
            if (isSuspended) {
              resume();
            }
          };

          return {
            onStart: (props) => {
              editor = props.editor;

              component = new ReactRenderer(VariableSuggestionList, {
                props: {
                    ...props,
                    editor: props.editor,
                    range: props.range
                },
                editor: props.editor,
              });

              if (!props.clientRect) {
                return;
              }

              // Lock scroll
              const editorElement = props.editor.view.dom;
              scrollParent = editorElement.closest('.overflow-auto') as HTMLElement;
              if (scrollParent) {
                originalOverflow = scrollParent.style.overflow;
                scrollParent.style.overflow = 'hidden';
              }

              popup = document.createElement('div');
              popup.style.position = 'fixed';
              popup.style.zIndex = '9999';
              popup.style.top = '0';
              popup.style.left = '0';
              document.body.appendChild(popup);

              popup.appendChild(component.element);

              document.addEventListener('mousedown', handleClickOutside);
              editor.on('focus', handleFocus);

              const virtualEl = {
                getBoundingClientRect: () => props.clientRect!() as DOMRect,
              };

              computePosition(virtualEl, popup, {
                placement: 'bottom-start',
                strategy: 'fixed',
                middleware: [offset(5), flip(), shift({ padding: 5 })],
              }).then(({ x, y }) => {
                if (popup) {
                  Object.assign(popup.style, {
                    left: `${x}px`,
                    top: `${y}px`,
                  });
                }
              });
            },

            onUpdate: (props) => {
              if (isSuspended) {
                resume();
              }

              if (!popup || !component) return;
              component.updateProps({
                ...props,
                editor: props.editor,
                range: props.range,
              });

              if (!props.clientRect) return;

              const virtualEl = {
                getBoundingClientRect: () => props.clientRect!() as DOMRect,
              };

              computePosition(virtualEl, popup, {
                placement: 'bottom-start',
                strategy: 'fixed',
                middleware: [offset(5), flip(), shift({ padding: 5 })],
              }).then(({ x, y }) => {
                if (popup) {
                  Object.assign(popup.style, {
                    left: `${x}px`,
                    top: `${y}px`,
                  });
                }
              });
            },

            onKeyDown: (props) => {
              if (props.event.key === 'Escape') {
                destroy();
                return false;
              }
              return component?.ref?.onKeyDown(props) || false;
            },

            onExit: () => {
              destroy();
              if (editor) {
                editor.off('focus', handleFocus);
              }
            },
          };
        },
      }),
    ];
  },
});
