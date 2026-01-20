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
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Table as TableIcon,
  Image as ImageIcon,
} from 'lucide-react';
import { Toggle } from '@/shared/ui/toggle';
import { Button } from '@/shared/ui/button';
import { Separator } from '@/shared/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/shared/ui/dropdown-menu';
import { Overflow } from '@/shared/ui/overflow';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';
import { useState } from 'react';

type ToolbarItem = {
  id: string;
  type: 'button' | 'separator' | 'custom';
  label?: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  render?: () => React.ReactNode;
  renderOverflow?: () => React.ReactNode;
};

export function EditorToolbar() {
  const { editor } = useCurrentEditor();
  const [imageUrl, setImageUrl] = useState('');
  const [showImageDialog, setShowImageDialog] = useState(false);

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
    isAlignLeft,
    isAlignCenter,
    isAlignRight,
    isAlignJustify,
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
        isAlignLeft: editor.isActive({ textAlign: 'left' }),
        isAlignCenter: editor.isActive({ textAlign: 'center' }),
        isAlignRight: editor.isActive({ textAlign: 'right' }),
        isAlignJustify: editor.isActive({ textAlign: 'justify' }),
        canUndo: editor.can().chain().focus().undo().run(),
        canRedo: editor.can().chain().focus().redo().run(),
      };
    },
  });

  if (!editor) return null;

  const insertImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl('');
      setShowImageDialog(false);
    }
  };

  const toolbarItems: ToolbarItem[] = [
    {
      id: 'bold',
      type: 'button',
      label: 'Bold',
      icon: <Bold className="h-4 w-4" />,
      isActive: isBold,
      onClick: () => editor.chain().focus().toggleBold().run(),
    },
    {
      id: 'italic',
      type: 'button',
      label: 'Italic',
      icon: <Italic className="h-4 w-4" />,
      isActive: isItalic,
      onClick: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      id: 'strike',
      type: 'button',
      label: 'Strikethrough',
      icon: <Strikethrough className="h-4 w-4" />,
      isActive: isStrike,
      onClick: () => editor.chain().focus().toggleStrike().run(),
    },
    {
      id: 'code',
      type: 'button',
      label: 'Code',
      icon: <Code className="h-4 w-4" />,
      isActive: isCode,
      onClick: () => editor.chain().focus().toggleCode().run(),
    },
    { id: 'sep1', type: 'separator' },
    {
      id: 'h1',
      type: 'button',
      label: 'Heading 1',
      icon: <Heading1 className="h-4 w-4" />,
      isActive: isHeading1,
      onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      id: 'h2',
      type: 'button',
      label: 'Heading 2',
      icon: <Heading2 className="h-4 w-4" />,
      isActive: isHeading2,
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    { id: 'sep2', type: 'separator' },
    {
      id: 'align-left',
      type: 'button',
      label: 'Align Left',
      icon: <AlignLeft className="h-4 w-4" />,
      isActive: isAlignLeft,
      onClick: () => editor.chain().focus().setTextAlign('left').run(),
    },
    {
      id: 'align-center',
      type: 'button',
      label: 'Align Center',
      icon: <AlignCenter className="h-4 w-4" />,
      isActive: isAlignCenter,
      onClick: () => editor.chain().focus().setTextAlign('center').run(),
    },
    {
      id: 'align-right',
      type: 'button',
      label: 'Align Right',
      icon: <AlignRight className="h-4 w-4" />,
      isActive: isAlignRight,
      onClick: () => editor.chain().focus().setTextAlign('right').run(),
    },
    {
      id: 'align-justify',
      type: 'button',
      label: 'Align Justify',
      icon: <AlignJustify className="h-4 w-4" />,
      isActive: isAlignJustify,
      onClick: () => editor.chain().focus().setTextAlign('justify').run(),
    },
    { id: 'sep3', type: 'separator' },
    {
      id: 'bullet-list',
      type: 'button',
      label: 'Bullet List',
      icon: <List className="h-4 w-4" />,
      isActive: isBulletList,
      onClick: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      id: 'ordered-list',
      type: 'button',
      label: 'Ordered List',
      icon: <ListOrdered className="h-4 w-4" />,
      isActive: isOrderedList,
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      id: 'blockquote',
      type: 'button',
      label: 'Blockquote',
      icon: <Quote className="h-4 w-4" />,
      isActive: isBlockquote,
      onClick: () => editor.chain().focus().toggleBlockquote().run(),
    },
    { id: 'sep4', type: 'separator' },
    {
      id: 'table',
      type: 'custom',
      label: 'Table',
      render: () => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <TableIcon className="h-4 w-4" />
              <span className="sr-only">Table</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onSelect={() =>
                editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
              }>
              Insert Table (3x3)
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => editor.chain().focus().addRowBefore().run()}>
              Add Row Before
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => editor.chain().focus().addRowAfter().run()}>
              Add Row After
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => editor.chain().focus().deleteRow().run()}>
              Delete Row
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => editor.chain().focus().addColumnBefore().run()}>
              Add Column Before
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => editor.chain().focus().addColumnAfter().run()}>
              Add Column After
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => editor.chain().focus().deleteColumn().run()}>
              Delete Column
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => editor.chain().focus().deleteTable().run()}>
              Delete Table
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      renderOverflow: () => (
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <TableIcon className="mr-2 h-4 w-4" />
            Table
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem
              onSelect={() =>
                editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
              }>
              Insert Table (3x3)
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => editor.chain().focus().addRowBefore().run()}>
              Add Row Before
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => editor.chain().focus().addRowAfter().run()}>
              Add Row After
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => editor.chain().focus().deleteRow().run()}>
              Delete Row
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => editor.chain().focus().addColumnBefore().run()}>
              Add Column Before
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => editor.chain().focus().addColumnAfter().run()}>
              Add Column After
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => editor.chain().focus().deleteColumn().run()}>
              Delete Column
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => editor.chain().focus().deleteTable().run()}>
              Delete Table
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      ),
    },
    {
      id: 'image',
      type: 'button',
      label: 'Image',
      icon: <ImageIcon className="h-4 w-4" />,
      onClick: () => setShowImageDialog(true),
    },
  ];

  const renderItem = (item: ToolbarItem) => {
    if (item.type === 'separator') {
      return <Separator orientation="vertical" className="h-6 mx-1" />;
    }
    if (item.type === 'custom' && item.render) {
      if (item.label) {
        return (
          <Tooltip>
            <TooltipTrigger asChild>{item.render()}</TooltipTrigger>
            <TooltipContent>{item.label}</TooltipContent>
          </Tooltip>
        );
      }
      return item.render();
    }

    // Default button
    const content = (
      <Toggle
        size="sm"
        pressed={item.isActive}
        onPressedChange={item.onClick}
        disabled={item.disabled}>
        {item.icon}
      </Toggle>
    );

    if (item.label) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent>{item.label}</TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  const renderOverflowItem = (item: ToolbarItem) => {
    if (item.type === 'separator') {
      return <DropdownMenuSeparator className="first:hidden" />;
    }
    if (item.type === 'custom' && item.renderOverflow) {
      return item.renderOverflow();
    }
    // Fallback if no specific overflow render
    if (item.type === 'custom' && item.render) {
      return <div className="p-2">{item.render()}</div>;
    }

    return (
      <DropdownMenuItem onSelect={item.onClick} disabled={item.disabled}>
        {item.icon && <span className="mr-2">{item.icon}</span>}
        {item.label}
      </DropdownMenuItem>
    );
  };

  return (
    <div className="border-b bg-background p-2 flex gap-2 items-center sticky top-0 z-10 w-full">
      <Overflow
        items={toolbarItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderOverflowItem={renderOverflowItem}
        className="gap-1"
        buffer={40}
      />

      <div className="ml-auto flex items-center gap-1 shrink-0">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!canUndo}>
              <Undo className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Undo</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!canRedo}>
              <Redo className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Redo</TooltipContent>
        </Tooltip>
      </div>

      {showImageDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Insert Image</h3>
            <input
              type="text"
              placeholder="Enter image URL"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-3 py-2 border rounded-md mb-4"
              onKeyDown={(e) => {
                if (e.key === 'Enter') insertImage();
              }}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowImageDialog(false)}>
                Cancel
              </Button>
              <Button onClick={insertImage}>Insert</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
