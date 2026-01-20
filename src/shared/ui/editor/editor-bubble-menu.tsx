import { type Editor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import { cn } from '../../lib/utils';
import { Bold, Italic, Strikethrough, Settings2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface EditorBubbleMenuProps {
  editor: Editor;
  onOpenVariableSettings: () => void;
}

export const EditorBubbleMenu = ({ editor, onOpenVariableSettings }: EditorBubbleMenuProps) => {
  const [isVariable, setIsVariable] = useState(false);

  useEffect(() => {
    const update = () => {
      setIsVariable(editor.isActive('variable'));
    };

    editor.on('selectionUpdate', update);
    editor.on('transaction', update);

    // Initial check
    update();

    return () => {
      editor.off('selectionUpdate', update);
      editor.off('transaction', update);
    };
  }, [editor]);

  const shouldShow = ({ editor }: { editor: Editor }) => {
    // Show if we have a non-empty selection OR if we are on a variable (NodeSelection)
    if (editor.isActive('variable')) {
      return true;
    }
    const { selection } = editor.state;
    return !selection.empty;
  };

  return (
    <BubbleMenu editor={editor} shouldShow={shouldShow}>
      <div className="bg-background border rounded-md shadow-md p-1 flex gap-1 items-center">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(
            'p-1.5 hover:bg-muted rounded-md transition-colors',
            editor.isActive('bold') ? 'bg-muted text-foreground' : 'text-muted-foreground',
          )}
          title="Bold"
          type="button">
          <Bold className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(
            'p-1.5 hover:bg-muted rounded-md transition-colors',
            editor.isActive('italic') ? 'bg-muted text-foreground' : 'text-muted-foreground',
          )}
          title="Italic"
          type="button">
          <Italic className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={cn(
            'p-1.5 hover:bg-muted rounded-md transition-colors',
            editor.isActive('strike') ? 'bg-muted text-foreground' : 'text-muted-foreground',
          )}
          title="Strikethrough"
          type="button">
          <Strikethrough className="h-4 w-4" />
        </button>

        {isVariable && (
          <>
            <div className="w-px h-4 bg-border mx-1" />
            <button
              onClick={onOpenVariableSettings}
              className="p-1.5 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground"
              title="Variable Settings"
              type="button">
              <Settings2 className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </BubbleMenu>
  );
};
