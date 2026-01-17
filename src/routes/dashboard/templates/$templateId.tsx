import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api/api';
import { Editor } from '@/shared/ui/editor';
import { Loader2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';

export const Route = createFileRoute('/dashboard/templates/$templateId')({
  component: TemplateEditorPage,
});

type Template = {
  id: string;
  name: string;
  description?: string;
  versions: {
    content: any;
    versionNumber: number;
  }[];
};

function TemplateEditorPage() {
  const { templateId } = Route.useParams();

  const { data: template, isLoading } = useQuery({
    queryKey: ['templates', templateId],
    queryFn: async () => {
      return await api.get(`templates/${templateId}`).json<Template>();
    },
  });

  const handleSave = async (content: any) => {
    // TODO: Implement save
    console.log('Saving content:', content);
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!template) {
    return <div>Шаблон не найден</div>;
  }

  const initialContent = template.versions[0]?.content || '';

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex items-center justify-between border-b px-4 py-2 bg-background">
        <div>
          <h1 className="text-xl font-semibold">{template.name}</h1>
          {template.description && (
            <p className="text-xs text-muted-foreground">{template.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Отмена
          </Button>
          <Button size="sm">Сохранить</Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <Editor content={initialContent} onChange={(json) => handleSave(json)} className="h-full" />
      </div>
    </div>
  );
}
