import { useEditor, EditorContent, EditorContext } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import { useState, useEffect, useMemo, useRef } from 'react';
import { cn } from '../lib/utils';
import { EditorToolbar } from './editor-toolbar';
import { useTheme } from 'next-themes';
import { getEditorExtensions } from './editor/extensions';
import { EditorSidebar } from './editor/editor-sidebar';
import { generatePreviewJson } from '../lib/doc-generator/client-generator';
import { PanelRight, Eye, Pencil } from 'lucide-react';
import { Button } from './button';

interface EditorProps {
  content: string | Record<string, any>;
  onChange: (content: Record<string, any>) => void;
  className?: string;
  editable?: boolean;
}

export function Editor({ content, onChange, className, editable = true }: EditorProps) {
  const { theme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const isPreviewModeRef = useRef(false); // Ref to track preview mode in callbacks
  const [sampleData, setSampleData] = useState(
    '{\n  "client": {\n    "name": "John Doe",\n    "address": "123 Main St",\n    "balance": 1500.50\n  },\n  "date": "2024-03-20"\n}',
  );

  // Store the original template content to restore after preview
  const [templateContent, setTemplateContent] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    isPreviewModeRef.current = isPreviewMode;
  }, [isPreviewMode]);

  const editor = useEditor({
    extensions: getEditorExtensions({ theme }),
    content: content || '',
    editable: editable && !isPreviewMode, // Disable editing in preview mode
    editorProps: {
      attributes: {
        class: cn('mx-auto bg-white dark:bg-slate-950 outline-none'),
      },
      handleDrop: (view, event, _slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.getData('application/json')) {
          const text = event.dataTransfer.getData('application/json');
          try {
            const data = JSON.parse(text);
            if (data.type === 'variable') {
              event.preventDefault();
              const { id, label, varType } = data;
              const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
              if (coordinates) {
                view.dispatch(
                  view.state.tr.insert(
                    coordinates.pos,
                    view.state.schema.nodes.variable.create({ id, label, type: varType }),
                  ),
                );
                return true;
              }
            }
          } catch (e) {
            console.error('Drop error', e);
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      // Use ref to avoid stale closure
      if (!isPreviewModeRef.current) {
        onChange(editor.getJSON());
      }
    },
  });

  const providerValue = useMemo(() => ({ editor }), [editor]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(editable && !isPreviewMode);
    }
  }, [editable, isPreviewMode, editor]);

  // Handle external content updates (only when not in preview)
  useEffect(() => {
    if (editor && content && !editor.isDestroyed && !isPreviewMode) {
      if (editor.isEmpty) {
        editor.commands.setContent(content);
        return;
      }

      const currentContent = editor.getJSON();
      if (JSON.stringify(currentContent) !== JSON.stringify(content)) {
        editor.commands.setContent(content);
      }
    }
  }, [content, editor, isPreviewMode]);

  const togglePreview = () => {
    if (!editor) return;

    if (!isPreviewMode) {
      // Entering Preview Mode
      const currentJson = editor.getJSON();
      setTemplateContent(currentJson);

      try {
        const data = sampleData ? JSON.parse(sampleData) : {};
        const previewJson = generatePreviewJson(currentJson, data);

        // Entering preview mode - update ref immediately to prevent onChange firing
        setIsPreviewMode(true);
        isPreviewModeRef.current = true;

        editor.commands.setContent(previewJson);
      } catch (e) {
        console.error('Failed to generate preview', e);
      }
    } else {
      // Exiting Preview Mode
      setIsPreviewMode(false);
      isPreviewModeRef.current = false;

      // Restore content from the parent prop.
      // Since we guarded onChange, 'content' should still be the template.
      if (content) {
        editor.commands.setContent(content);
      }
    }
  };

  if (!editor) return null;

  return (
    <EditorContext.Provider value={providerValue}>
      <div className={cn('flex h-full w-full overflow-hidden', className)}>
        <div className="flex-1 flex flex-col h-full min-w-0">
          {editable && (
            <div className="shrink-0 border-b bg-background flex items-center pr-2">
              <EditorToolbar />
              <div className="ml-auto flex items-center gap-2">
                <Button
                  variant={isPreviewMode ? 'default' : 'ghost'}
                  size="sm"
                  onClick={togglePreview}
                  className="gap-2">
                  {isPreviewMode ? <Pencil className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span className="hidden sm:inline">{isPreviewMode ? 'Edit' : 'Preview'}</span>
                </Button>
                <Button
                  variant={isSidebarOpen ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="gap-2"
                  disabled={isPreviewMode}>
                  <PanelRight className="h-4 w-4" />
                  <span className="hidden sm:inline">Data</span>
                </Button>
              </div>
            </div>
          )}

          {editor && !isPreviewMode && (
            <BubbleMenu editor={editor}>
              <div className="bg-background border rounded shadow-md p-1 flex gap-1">
                <button
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={cn(
                    'px-2 py-1 hover:bg-muted rounded text-sm',
                    editor.isActive('bold') ? 'bg-muted' : '',
                  )}>
                  Bold
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={cn(
                    'px-2 py-1 hover:bg-muted rounded text-sm',
                    editor.isActive('italic') ? 'bg-muted' : '',
                  )}>
                  Italic
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleStrike().run()}
                  className={cn(
                    'px-2 py-1 hover:bg-muted rounded text-sm',
                    editor.isActive('strike') ? 'bg-muted' : '',
                  )}>
                  Strike
                </button>
              </div>
            </BubbleMenu>
          )}

          <div className="flex-1 overflow-auto bg-slate-100 dark:bg-slate-900 py-8 px-4">
            <EditorContent editor={editor} className="w-full h-full" />
          </div>
        </div>

        {editable && (
          <EditorSidebar
            editor={editor}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            sampleData={sampleData}
            onSampleDataChange={setSampleData}
          />
        )}
      </div>
    </EditorContext.Provider>
  );
}
