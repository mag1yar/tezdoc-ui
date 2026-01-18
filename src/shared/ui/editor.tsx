import { useEditor, EditorContent, EditorContext } from '@tiptap/react';
import { FloatingMenu, BubbleMenu } from '@tiptap/react/menus';
import { useEffect, useMemo } from 'react';
import StarterKit from '@tiptap/starter-kit';
import { PAGE_SIZES, PaginationPlus } from 'tiptap-pagination-plus';
import { cn } from '../lib/utils';
import { EditorToolbar } from './editor-toolbar';
import { useTheme } from 'next-themes';

interface EditorProps {
  content: string | Record<string, any>;
  onChange: (content: Record<string, any>) => void;
  className?: string;
  editable?: boolean;
}

export function Editor({ content, onChange, className, editable = true }: EditorProps) {
  const { theme } = useTheme();

  const editor = useEditor({
    extensions: [
      // StarterKit includes:
      // - Blockquote, BulletList, CodeBlock, Document, HardBreak
      // - Heading, HorizontalRule, ListItem, OrderedList, Paragraph, Text
      // - Bold, Code, Italic, Link, Strike, Underline
      // - Dropcursor, Gapcursor, Undo/Redo, ListKeymap, TrailingNode
      StarterKit,

      PaginationPlus.configure({
        ...PAGE_SIZES.A4,
        pageBreakBackground: theme === 'dark' ? 'var(--color-slate-900)' : 'var(--color-slate-100)',
      }),
    ],
    content: content || '',
    editable,
    editorProps: {
      attributes: {
        class: cn('bg-white'),
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
  });

  const providerValue = useMemo(() => ({ editor }), [editor]);

  useEffect(() => {
    if (editor && content && !editor.isDestroyed) {
      if (editor.isEmpty) {
        editor.commands.setContent(content);
        return;
      }

      const currentContent = editor.getJSON();
      if (JSON.stringify(currentContent) !== JSON.stringify(content)) {
        editor.commands.setContent(content);
      }
    }
  }, [content, editor]);

  if (!editor) return null;

  return (
    <EditorContext.Provider value={providerValue}>
      <div className={cn('flex flex-col h-full w-full', className)}>
        {editable && (
          <div className="shrink-0 border-b bg-background">
            <EditorToolbar />
          </div>
        )}

        <div className="flex-1 overflow-auto bg-slate-100 dark:bg-slate-900 py-8 px-4">
          <EditorContent
            editor={editor}
            className="w-full h-full flex flex-col [&_.tiptap]:mx-auto [&_.tiptap]:h-max"
          />
        </div>
      </div>
    </EditorContext.Provider>
  );
}
