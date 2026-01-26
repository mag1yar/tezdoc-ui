import { VariableDefinition } from '@/shared/lib/variable-utils';
import { cn } from '@/shared/lib/utils';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Editor } from '@tiptap/react';

export interface VariableSuggestionListProps {
  items: VariableDefinition[];
  command: (item: any) => void;
  query?: string;
  editor: Editor;
  range: { from: number; to: number };
}

export interface VariableSuggestionListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

export const VariableSuggestionList = forwardRef<
  VariableSuggestionListRef,
  VariableSuggestionListProps
>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // Show "Create" option when there's a query but no exact match
  const hasCreateOption = Boolean(
    props.query && 
    props.query.trim().length > 0 && 
    !props.items.some(item => item.id.toLowerCase() === props.query?.toLowerCase())
  );
  
  const totalItems = props.items.length + (hasCreateOption ? 1 : 0);
  const createOptionIndex = props.items.length; // Last item if showing

  const selectItem = (index: number) => {
    // Handle "Create new" selection
    if (hasCreateOption && index === createOptionIndex) {
      const newVarId = props.query!.trim();
      props.command({ 
        id: newVarId, 
        label: newVarId, 
        type: 'string',
        isNew: true 
      });
      return;
    }
    
    const item = props.items[index];
    if (item) {
      props.command({ id: item.id, label: item.label, type: item.type });
    }
  };

  const autocompleteItem = (index: number) => {
      // If "Create new" is selected, we just keep what is typed (or maybe fill the query?)
      // For now, only autocomplete existing items
      if (index < props.items.length) {
          const item = props.items[index];
          if (item) {
            // Replace the current range (e.g. "{{cl") with full text "{{client.name"
            // This allows the user to continue typing
            props.editor
                .chain()
                .focus()
                .insertContentAt(props.range, `{{${item.id}`)
                .run();
          }
      }
  };

  const upHandler = () => {
    setSelectedIndex((selectedIndex + totalItems - 1) % totalItems);
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % totalItems);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  const tabHandler = () => {
    autocompleteItem(selectedIndex);
  };

  useEffect(() => {
    setSelectedIndex(0);
  }, [props.items, props.query]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === 'ArrowUp') {
        upHandler();
        return true;
      }

      if (event.key === 'ArrowDown') {
        downHandler();
        return true;
      }

      if (event.key === 'Enter') {
        // If create option is selected, Enter creates.
        // If item is selected, Enter creates node (standard behavior).
        enterHandler();
        return true;
      }

      if (event.key === 'Tab') {
        tabHandler();
        return true;
      }

      return false;
    },
  }));

  useEffect(() => {
    const list = document.getElementById('variable-suggestion-list');
    const selectedElement = list?.children[selectedIndex] as HTMLElement;
    if (selectedElement) {
      selectedElement.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  // Show popup if there are items OR if we can create a new variable
  if (props.items.length === 0 && !hasCreateOption) {
    return null;
  }

  return (
    <div className="z-50 w-72 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95">
      <div
        id="variable-suggestion-list"
        className="flex flex-col gap-1 max-h-[300px] overflow-y-auto">
        {props.items.map((item, index) => (
          <button
            key={item.id}
            className={cn(
              'relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
              index === selectedIndex
                ? 'bg-accent text-accent-foreground'
                : 'hover:bg-accent hover:text-accent-foreground',
            )}
            onClick={() => selectItem(index)}>
            <div className="flex items-center gap-2 overflow-hidden w-full">
              <div
                className={cn(
                  'h-5 w-5 rounded flex items-center justify-center text-[10px] font-bold uppercase shrink-0',
                  item.type === 'string' && 'bg-slate-100 text-slate-600 dark:bg-slate-800',
                  item.type === 'number' && 'bg-blue-100 text-blue-600 dark:bg-blue-900/30',
                  item.type === 'date' && 'bg-purple-100 text-purple-600 dark:bg-purple-900/30',
                  item.type === 'array' && 'bg-orange-100 text-orange-600 dark:bg-orange-900/30',
                  item.type === 'boolean' && 'bg-green-100 text-green-600 dark:bg-green-900/30',
                )}>
                {item.type === 'string' && 'T'}
                {item.type === 'number' && '#'}
                {item.type === 'date' && 'D'}
                {item.type === 'array' && '[]'}
                {item.type === 'boolean' && 'B'}
              </div>
              <div className="flex flex-col items-start min-w-0 flex-1">
                <span className="truncate w-full font-medium">{item.id}</span>
              </div>
            </div>
          </button>
        ))}
        
        {/* Create new variable option */}
        {hasCreateOption && (
          <button
            className={cn(
              'relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none border-t border-border mt-1 pt-2',
              selectedIndex === createOptionIndex
                ? 'bg-accent text-accent-foreground'
                : 'hover:bg-accent hover:text-accent-foreground',
            )}
            onClick={() => selectItem(createOptionIndex)}>
            <div className="flex items-center gap-2 overflow-hidden w-full">
              <div className="h-5 w-5 rounded flex items-center justify-center text-[10px] font-bold bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 shrink-0">
                +
              </div>
              <div className="flex flex-col items-start min-w-0 flex-1">
                <span className="truncate w-full font-medium">
                  Создать "{props.query}"
                </span>
              </div>
            </div>
          </button>
        )}
      </div>
    </div>
  );
});

VariableSuggestionList.displayName = 'VariableSuggestionList';
