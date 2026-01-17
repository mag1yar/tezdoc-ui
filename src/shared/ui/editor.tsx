import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { PaginationPlus } from 'tiptap-pagination-plus';
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
      PaginationPlus.configure({
        pageHeight: 1123, // A4 Height in pixels (96 DPI)
        pageWidth: 794, // A4 Width in pixels (96 DPI)
        // pageMargin: 20,   // Margin in pixels
      }),
    ],
    content: content || '',
    editable,
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-stone dark:prose-invert max-w-none focus:outline-none bg-white',
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
        {/* Editor renders pages directly */}
        <EditorContent editor={editor} className="w-full h-full flex flex-col items-center" />
      </div>
    </div>
  );
}
