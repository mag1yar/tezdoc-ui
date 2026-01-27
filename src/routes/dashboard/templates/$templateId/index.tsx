import { createFileRoute, useBlocker } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { Editor } from '@/shared/ui/editor';
import { Loader2, Save } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { toast } from 'sonner';
import { useState, useEffect, useRef, useMemo } from 'react';
import { SidebarTrigger } from '@/shared/ui/sidebar';
import { SmartBreadcrumbs } from '@/shared/ui/smart-breadcrumbs';

import { Template } from '@/entities/template/model/types';
import { templateQueries } from '@/entities/template';

export const Route = createFileRoute('/dashboard/templates/$templateId/')({
  ssr: false,

  loader: async ({ context: { queryClient }, params: { templateId } }) => {
    const template = await queryClient.fetchQuery(templateQueries.detail(templateId));

    return {
      template,
      breadcrumb: {
        title: template.name,
      },
    };
  },

  component: TemplateEditorPage,
});

import { TemplateSettingsDialog } from '@/features/template-settings';

// Helper for deterministic JSON stringification to handle key reordering
const canonicalJson = (obj: any): string => {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return '[' + obj.map(canonicalJson).join(',') + ']';
  }
  const keys = Object.keys(obj).sort();
  return '{' + keys.map(key => JSON.stringify(key) + ':' + canonicalJson(obj[key])).join(',') + '}';
};

function TemplateEditorPage() {
  const { templateId } = Route.useParams();

  const queryClient = useQueryClient();

  const [content, setContent] = useState<any>(null);
  const [sampleData, setSampleData] = useState<string | null>(null); // Will be loaded from template
  const [lastSavedTime, setLastSavedTime] = useState<number>(0); // Force re-calc of isDirty on save

  const defaultSampleData = '{\n  "client": {\n    "name": "John Doe",\n    "address": "123 Main St",\n    "balance": 1500.50\n  },\n  "date": "2024-03-20"\n}';


  const { data: latestTemplate, isLoading } = useQuery(templateQueries.detail(templateId));

  // Track the last persisted state for dirty comparison
  const persistedContentRef = useRef<string | null>(null);
  const persistedSampleDataRef = useRef<string | null>(null);

  useEffect(() => {
    if (latestTemplate && !content && latestTemplate.versions && latestTemplate.versions.length > 0) {
      setContent(latestTemplate.versions[0].content);
      // Store canonical string immediately to match isDirty logic
      persistedContentRef.current = canonicalJson(latestTemplate.versions[0].content);
    }
    // Load sampleData from backend (only once)
    if (latestTemplate && sampleData === null) {
      const initialSampleData = latestTemplate.sampleData || defaultSampleData;
      setSampleData(initialSampleData);
      persistedSampleDataRef.current = initialSampleData;
    }
  }, [latestTemplate, content, sampleData]);

  const isDirty = useMemo(() => {
    if (!content || persistedContentRef.current === null) return false;
    
    // Use canonical JSON string for comparison to ignore key order
    const contentStr = canonicalJson(content);
    const persistedStr = persistedContentRef.current; // Now proven to be canonical

    const contentChanged = contentStr !== persistedStr;
    const currentSampleData = sampleData || defaultSampleData;
    const sampleDataChanged = currentSampleData !== persistedSampleDataRef.current;

    return contentChanged || sampleDataChanged;
  }, [content, sampleData, lastSavedTime]);

  // Block in-app navigation when dirty
  const blocker = useBlocker({
    condition: isDirty,
  });

  useEffect(() => {
    if (blocker.status === 'blocked') {
      const confirm = window.confirm('У вас есть несохранённые изменения. Вы уверены, что хотите покинуть страницу?');
      if (confirm) {
        blocker.proceed();
      } else {
        blocker.reset();
      }
    }
  }, [blocker.status, blocker]);

  // Block browser refresh/close when dirty
  useEffect(() => {
    if (!isDirty) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Template> & { content?: any }) =>
      templateQueries.update({ id: templateId, data }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: templateQueries.detail(templateId).queryKey });
      if (variables.content !== undefined) {
        persistedContentRef.current = canonicalJson(variables.content);
      }
      if (variables.sampleData !== undefined) {
        persistedSampleDataRef.current = variables.sampleData;
      }
      setLastSavedTime(Date.now()); // Force isDirty check
      toast.success('Сохранено');
    },
    onError: () => {
      toast.error('Ошибка сохранения');
    },
  });

  const handleSave = () => {
    if (content) {
      updateMutation.mutate({ content, sampleData: sampleData || defaultSampleData });
    }
  };

  // Auto-save sampleData when a new variable is created dynamically
  const handleAutoSaveSampleData = (newSampleData: string) => {
    updateMutation.mutate({ sampleData: newSampleData });
  };

  if (isLoading || !latestTemplate) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col flex-1">
      <div className="flex items-center justify-between border-b px-4 py-2 bg-background z-20 sticky top-0">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <SidebarTrigger className="-ml-1" />
          <SmartBreadcrumbs />
        </div>
        <div className="flex gap-2 shrink-0">
          <TemplateSettingsDialog
            template={latestTemplate}
            sampleData={sampleData ?? defaultSampleData}
            onSampleDataChange={setSampleData}
          />
          {updateMutation.isPending ? (
            <Button disabled size="sm">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Сохранение...
            </Button>
          ) : (
            <Button size="sm" variant={isDirty ? 'default' : 'outline'} onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              {isDirty ? 'Сохранить *' : 'Сохранить'}
            </Button>
          )}
        </div>
      </div>

      <Editor 
        content={content} 
        onChange={setContent} 
        className="h-full" 
        sampleData={sampleData ?? defaultSampleData} 
        onSampleDataChange={setSampleData} 
        onAutoSaveSampleData={handleAutoSaveSampleData}
      />
    </div>
  );
}
