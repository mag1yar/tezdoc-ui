import { useCurrentEditor, useEditorState } from '@tiptap/react';
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Quote,
  Undo,
  Redo,
  Code,
} from 'lucide-react';
import { Toggle } from '@/shared/ui/toggle';
import { Button } from '@/shared/ui/button';
import { Separator } from '@/shared/ui/separator';

export function EditorToolbar() {
  const { editor } = useCurrentEditor();

  const {
    canUndo,
    canRedo,
    isBold,
    isItalic,
    isStrike,
    isHeading1,
    isHeading2,
    isBulletList,
    isOrderedList,
    isBlockquote,
    isCode,
  } = useEditorState({
    editor: editor!,
    selector: ({ editor }) => {
      return {
        isBold: editor.isActive('bold'),
        isItalic: editor.isActive('italic'),
        isStrike: editor.isActive('strike'),
        isHeading1: editor.isActive('heading', { level: 1 }),
        isHeading2: editor.isActive('heading', { level: 2 }),
        isBulletList: editor.isActive('bulletList'),
        isOrderedList: editor.isActive('orderedList'),
        isBlockquote: editor.isActive('blockquote'),
        isCode: editor.isActive('code'),
        canUndo: editor.can().chain().focus().undo().run(),
        canRedo: editor.can().chain().focus().redo().run(),
      };
    },
  });

  if (!editor) return null;

  return (
    <div className="border-b bg-background p-2 flex flex-wrap gap-2 items-center sticky top-0 z-10 w-full">
      <div className="flex items-center gap-1">
        <Toggle
          size="sm"
          pressed={isBold}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={isItalic}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={isStrike}
          onPressedChange={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough className="h-4 w-4" />
        </Toggle>
      </div>

      <Separator orientation="vertical" className="h-6" />

      <div className="flex items-center gap-1">
        <Toggle
          size="sm"
          pressed={isHeading1}
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          <Heading1 className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={isHeading2}
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 className="h-4 w-4" />
        </Toggle>
      </div>

      <Separator orientation="vertical" className="h-6" />

      <div className="flex items-center gap-1">
        <Toggle
          size="sm"
          pressed={isBulletList}
          onPressedChange={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={isOrderedList}
          onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="h-4 w-4" />
        </Toggle>
      </div>

      <Separator orientation="vertical" className="h-6" />

      <div className="flex items-center gap-1">
        <Toggle
          size="sm"
          pressed={isBlockquote}
          onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={isCode}
          onPressedChange={() => editor.chain().focus().toggleCode().run()}>
          <Code className="h-4 w-4" />
        </Toggle>
      </div>

      <div className="ml-auto flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!canUndo}>
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!canRedo}>
          <Redo className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
