import { useState, useEffect } from 'react';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils';
import { Database, List, X, RefreshCw, FileText } from 'lucide-react';
import { Editor } from '@tiptap/react';
import { extractVariables, VariableDefinition } from '@/shared/lib/variable-utils';

interface EditorSidebarProps {
  editor: Editor | null;
  isOpen: boolean;
  onClose: () => void;
  sampleData: string;
  onSampleDataChange: (data: string) => void;
}

export function EditorSidebar({
  editor,
  isOpen,
  onClose,
  sampleData,
  onSampleDataChange,
}: EditorSidebarProps) {
  const [activeTab, setActiveTab] = useState<'variables' | 'data'>('variables');
  const [variables, setVariables] = useState<VariableDefinition[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    refreshVariables();
  }, [sampleData]);

  const refreshVariables = () => {
    try {
      if (!sampleData.trim()) {
        setVariables([]);
        setError(null);
        return;
      }
      const parsed = JSON.parse(sampleData);
      const extracted = extractVariables(parsed);
      setVariables(extracted);
      setError(null);
    } catch (e: any) {
      setError('Invalid JSON');
    }
  };

  const insertVariable = (variable: VariableDefinition) => {
    if (!editor) return;

    // Filter non-insertable types for safety
    if (!['string', 'number', 'date'].includes(variable.type)) {
      return;
    }

    editor
      .chain()
      .focus()
      .setVariable({
        id: variable.id,
        label: variable.id, // Use full path as label by default, or just key: variable.label
        type: variable.type as 'string' | 'number' | 'date',
      })
      .run();
  };

  if (!isOpen) return null;

  return (
    <div className="w-80 border-l bg-background flex flex-col h-full shadow-xl z-20 transition-all">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold text-sm">Template Settings</h3>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('variables')}
          className={cn(
            'flex-1 py-2 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'variables'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground',
          )}>
          <div className="flex items-center justify-center gap-2">
            <List className="h-4 w-4" />
            Variables
          </div>
        </button>
        <button
          onClick={() => setActiveTab('data')}
          className={cn(
            'flex-1 py-2 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'data'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground',
          )}>
          <div className="flex items-center justify-center gap-2">
            <Database className="h-4 w-4" />
            Data Source
          </div>
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'variables' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {variables.filter((v) => ['string', 'number', 'date'].includes(v.type)).length}{' '}
                variables found
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-6 text-xs"
                onClick={refreshVariables}>
                <RefreshCw className="h-3 w-3 mr-1" /> Refresh
              </Button>
            </div>

            {error && (
              <div className="text-red-500 text-xs p-2 bg-red-50 dark:bg-red-900/10 rounded">
                {error}
              </div>
            )}

            <div className="grid gap-2">
              {variables.length === 0 && !error && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No variables found. Add JSON data in the "Data Source" tab.
                </div>
              )}

              {variables.map((v) => (
                <div
                  key={v.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData(
                      'application/json',
                      JSON.stringify({
                        type: 'variable',
                        id: v.id,
                        label: v.id,
                        varType: v.type,
                      }),
                    );
                  }}
                  className="group flex items-center justify-between p-2 pl-3 rounded-md border hover:border-primary/50 hover:bg-muted/50 transition-all cursor-grab active:cursor-grabbing bg-card">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div
                      className={cn(
                        'h-5 w-5 rounded flex items-center justify-center text-[10px] font-bold uppercase shrink-0',
                        v.type === 'string' && 'bg-slate-100 text-slate-600 dark:bg-slate-800',
                        v.type === 'number' && 'bg-blue-100 text-blue-600 dark:bg-blue-900/30',
                        v.type === 'date' && 'bg-purple-100 text-purple-600 dark:bg-purple-900/30',
                        v.type === 'array' && 'bg-orange-100 text-orange-600 dark:bg-orange-900/30',
                      )}>
                      {v.type === 'string' && 'T'}
                      {v.type === 'number' && '#'}
                      {v.type === 'date' && 'D'}
                      {v.type === 'array' && '[]'}
                      {v.type === 'boolean' && 'B'}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium truncate" title={v.id}>
                        {v.id}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                    onClick={() => insertVariable(v)}>
                    <FileText className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'data' && (
          <div className="h-full flex flex-col gap-2">
            <p className="text-xs text-muted-foreground">
              Paste a JSON sample here to infer variables.
            </p>
            <textarea
              className="flex-1 w-full bg-muted/50 border rounded-md p-3 font-mono text-xs resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={sampleData}
              onChange={(e) => onSampleDataChange(e.target.value)}
              placeholder={'{\n  "title": "Document",\n  "date": "2024-01-01"\n}'}
            />
          </div>
        )}
      </div>
    </div>
  );
}
