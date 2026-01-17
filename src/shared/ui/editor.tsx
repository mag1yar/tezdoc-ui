import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { cn } from '../lib/utils';
import { EditorToolbar } from './editor-toolbar';

interface EditorProps {
  content: string | Record<string, any>;
  onChange: (content: Record<string, any>) => void;
  className?: string;
  editable?: boolean;
}

export function Editor({ content, onChange, className, editable = true }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Начните печатать...',
      }),
    ],
    content: content || '',
    editable,
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-stone dark:prose-invert max-w-none focus:outline-none',
          // Tailwind typography defaults are good, but we can customize if needed
        ),
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
  });

  if (!editor) return null;

  return (
    <div className={cn('flex flex-col h-full w-full', className)}>
      {/* Toolbar - Fixed at top */}
      {editable && (
        <div className="shrink-0 border-b bg-background">
          <EditorToolbar editor={editor} />
        </div>
      )}

      {/* Scrollable Editor Area with Gray Background */}
      <div
        className="flex-1 overflow-y-auto bg-slate-100 dark:bg-slate-900 py-8 px-4"
        onClick={() => editor.chain().focus().run()}>
        {/* Paper Sheet */}
        <div className="max-w-[816px] min-h-[1056px] mx-auto bg-background shadow-md cursor-text">
          <EditorContent editor={editor} className="px-16 py-12" />
        </div>
      </div>
    </div>
  );
}
