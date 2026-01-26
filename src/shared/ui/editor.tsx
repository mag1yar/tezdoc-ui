import { useEditor, EditorContent, EditorContext } from '@tiptap/react';
import { useState, useEffect, useMemo, useRef } from 'react';
import { cn } from '../lib/utils';
import { EditorToolbar } from './editor-toolbar';
import { useTheme } from 'next-themes';
import { getEditorExtensions } from './editor/extensions';
import { generatePreviewJson } from '../lib/doc-generator/client-generator';
import { Eye, Pencil } from 'lucide-react';
import { Button } from './button';
import { EditorBubbleMenu } from './editor/editor-bubble-menu';
import { VariableSettingsDialog } from './editor/variable-settings-dialog';
import type { VariableAttributes } from './editor/extensions/variable-extension';
import { extractVariables } from '../lib/variable-utils';
import { setNestedValue } from '../lib/add-nested-field';

interface EditorProps {
  content: string | Record<string, any>;
  onChange: (content: Record<string, any>) => void;
  className?: string;
  editable?: boolean;
  sampleData?: string;
  onSampleDataChange?: (data: string) => void;
}

export function Editor({
  content,
  onChange,
  className,
  editable = true,
  sampleData = '{}',
  onSampleDataChange,
}: EditorProps) {
  const { theme } = useTheme();
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const isPreviewModeRef = useRef(false); // Ref to track preview mode in callbacks

  // Dialog state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentVariableAttrs, setCurrentVariableAttrs] = useState<VariableAttributes | null>(null);

  // Store the original template content to restore after preview
  const [templateContent, setTemplateContent] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    isPreviewModeRef.current = isPreviewMode;
  }, [isPreviewMode]);

  const variables = useMemo(() => {
    try {
      if (!sampleData) return [];
      return extractVariables(JSON.parse(sampleData));
    } catch (e) {
      return [];
    }
  }, [sampleData]);

  // Use refs to pass dynamic values to extensions without recreating them
  const variablesRef = useRef(variables);
  useEffect(() => {
    variablesRef.current = variables;
  }, [variables]);

  const onSampleDataChangeRef = useRef(onSampleDataChange);
  useEffect(() => {
    onSampleDataChangeRef.current = onSampleDataChange;
  }, [onSampleDataChange]);

  // Stable callback for extensions
  const getVariables = useRef(() => variablesRef.current).current;

  // Handler for adding new variables to sample data
  const handleAddVariable = (variableId: string) => {
    if (!onSampleDataChangeRef.current) return;

    try {
      const currentData = sampleData ? JSON.parse(sampleData) : {};
      const updatedData = setNestedValue(currentData, variableId, '');
      // No need for setTimeout anymore as we don't recreate the editor
      onSampleDataChangeRef.current(JSON.stringify(updatedData, null, 2));
    } catch (e) {
      console.error('Failed to add variable to sample data', e);
    }
  };

  const editor = useEditor(
    {
      extensions: getEditorExtensions({ theme, getVariables, onAddVariable: handleAddVariable }),
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
    },
    [theme], // Removed variables from dependencies to prevent recreation
  );

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
        editor.chain().setContent(content).setMeta('addToHistory', false).run();
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

  const handleOpenVariableSettings = () => {
    if (editor && editor.isActive('variable')) {
      const { attrs } = editor.getAttributes('variable');
      setCurrentVariableAttrs(attrs as VariableAttributes);
      setIsSettingsOpen(true);
    }
  };

  const handleSaveVariableSettings = (values: Partial<VariableAttributes>) => {
    if (editor) {
      editor.chain().focus().updateAttributes('variable', values).run();
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
              </div>
            </div>
          )}

          {editor && !isPreviewMode && (
            <EditorBubbleMenu editor={editor} onOpenVariableSettings={handleOpenVariableSettings} />
          )}

          <div className="flex-1 overflow-auto bg-slate-100 dark:bg-slate-900 py-8 px-4">
            <EditorContent editor={editor} className="w-full h-full" />
          </div>
        </div>

        <VariableSettingsDialog
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          initialValues={currentVariableAttrs}
          onSave={handleSaveVariableSettings}
        />
      </div>
    </EditorContext.Provider>
  );
}
