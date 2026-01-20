import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { Editor } from '@/shared/ui/editor';
import { Loader2, Save } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
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

function TemplateEditorPage() {
  const { templateId } = Route.useParams();

  const queryClient = useQueryClient();

  const [content, setContent] = useState<any>(null);
  const [sampleData, setSampleData] = useState(
    '{\n  "client": {\n    "name": "John Doe",\n    "address": "123 Main St",\n    "balance": 1500.50\n  },\n  "date": "2024-03-20"\n}',
  );

  const { data: latestTemplate, isLoading } = useQuery(templateQueries.detail(templateId));

  useEffect(() => {
    if (
      latestTemplate &&
      !content &&
      latestTemplate.versions &&
      latestTemplate.versions.length > 0
    ) {
      setContent(latestTemplate.versions[0].content);
    }
  }, [latestTemplate, content]);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Template> & { content?: any }) =>
      templateQueries.update({ id: templateId, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateQueries.detail(templateId).queryKey });
      toast.success('Сохранено');
    },
    onError: () => {
      toast.error('Ошибка сохранения');
    },
  });

  const handleSave = () => {
    if (content) {
      updateMutation.mutate({ content });
    }
  };

  if (isLoading || !latestTemplate) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex items-center justify-between border-b px-4 py-2 bg-background z-20 sticky top-0">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <SidebarTrigger className="-ml-1" />
          <SmartBreadcrumbs />
        </div>
        <div className="flex gap-2 shrink-0">
          <TemplateSettingsDialog
            template={latestTemplate}
            sampleData={sampleData}
            onSampleDataChange={setSampleData}
          />
          {updateMutation.isPending ? (
            <Button disabled size="sm">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Сохранение...
            </Button>
          ) : (
            <Button size="sm" onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Сохранить
            </Button>
          )}
        </div>
      </div>

      <Editor content={content} onChange={setContent} className="h-full" sampleData={sampleData} />
    </div>
  );
}
