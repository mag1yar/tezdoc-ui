import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/api';
import { Editor } from '@/shared/ui/editor';
import { Loader2, Save, Settings } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { SidebarTrigger } from '@/shared/ui/sidebar';
import { Separator } from '@/shared/ui/separator';
import { SmartBreadcrumbs } from '@/shared/ui/smart-breadcrumbs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';

export const Route = createFileRoute('/dashboard/templates/$templateId/')({
  ssr: false,

  loader: async ({ context: { queryClient }, params: { templateId } }) => {
    const template = await queryClient.fetchQuery({
      queryKey: ['templates', templateId],
      queryFn: () => api.get(`templates/${templateId}`).json<Template>(),
      staleTime: 10 * 1000,
    });

    return {
      template,
      breadcrumb: {
        title: template.name,
      },
    };
  },

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
  const queryClient = useQueryClient();
  const [content, setContent] = useState<any>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Local state for settings form
  const [settingsForm, setSettingsForm] = useState({ name: '', description: '' });

  // Use only useQuery for data (no loader dependency for protected data)
  const { data: latestTemplate, isLoading } = useQuery({
    queryKey: ['templates', templateId],
    queryFn: async () => {
      return await api.get(`templates/${templateId}`).json<Template>();
    },
  });

  // Sync content if it wasn't set initially (e.g. first load)
  useEffect(() => {
    if (
      latestTemplate &&
      !content &&
      latestTemplate.versions &&
      latestTemplate.versions.length > 0
    ) {
      setContent(latestTemplate.versions[0].content);
    }
    // Sync settings form
    if (latestTemplate) {
      setSettingsForm({
        name: latestTemplate.name,
        description: latestTemplate.description || '',
      });
    }
  }, [latestTemplate, content]);

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Template> & { content?: any }) => {
      return await api
        .patch(`templates/${templateId}`, {
          json: data,
        })
        .json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates', templateId] });
      toast.success('Сохранено');
      setIsSettingsOpen(false);
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

  const handleSettingsSave = () => {
    updateMutation.mutate({
      name: settingsForm.name,
      description: settingsForm.description,
    });
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
          <div className="flex items-center gap-2 shrink-0">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground grow">
              <SmartBreadcrumbs />
            </div>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="mr-2 h-4 w-4" />
                Настройки
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Настройки шаблона</DialogTitle>
                <DialogDescription>Измените название и описание шаблона.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Название
                  </Label>
                  <Input
                    id="name"
                    value={settingsForm.name}
                    onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Описание
                  </Label>
                  <Textarea
                    id="description"
                    value={settingsForm.description}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, description: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSettingsSave} disabled={updateMutation.isPending}>
                  {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Сохранить
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {updateMutation.isPending && !isSettingsOpen ? (
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
