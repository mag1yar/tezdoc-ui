import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/api';
import { Editor } from '@/shared/ui/editor';
import { Loader2, ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

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
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [content, setContent] = useState<any>(null);

  const { data: template, isLoading } = useQuery({
    queryKey: ['templates', templateId],
    queryFn: async () => {
      const data = await api.get(`templates/${templateId}`).json<Template>();
      // Initialize content from latest version
      if (data.versions && data.versions.length > 0) {
        setContent(data.versions[0].content);
      }
      return data;
    },
  });

  // Sync content if it wasn't set initially (e.g. first load)
  useEffect(() => {
    if (template && !content && template.versions.length > 0) {
      setContent(template.versions[0].content);
    }
  }, [template, content]);

  const updateMutation = useMutation({
    mutationFn: async (newContent: any) => {
      return await api
        .patch(`templates/${templateId}`, {
          json: {
            content: newContent,
          },
        })
        .json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates', templateId] });
      toast.success('Шаблон сохранен');
    },
    onError: () => {
      toast.error('Ошибка сохранения');
    },
  });

  const handleSave = () => {
    if (content) {
      updateMutation.mutate(content);
    }
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

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex items-center justify-between border-b px-4 py-2 bg-background">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: '/dashboard/templates' })}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">{template.name}</h1>
            {template.description && (
              <p className="text-xs text-muted-foreground">{template.description}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
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

      <div className="flex-1 overflow-hidden">
        <Editor content={content} onChange={(json) => setContent(json)} className="h-full" />
      </div>
    </div>
  );
}
