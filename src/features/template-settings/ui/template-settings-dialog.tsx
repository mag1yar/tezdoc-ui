import { useState, useEffect } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { Loader2, Settings } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Label } from '@/shared/ui/label';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';

import { Template } from '@/entities/template/model/types';
import { templateQueries } from '@/entities/template';

interface TemplateSettingsDialogProps {
  template: Template;
}

export function TemplateSettingsDialog({
  template,
  sampleData,
  onSampleDataChange,
}: TemplateSettingsDialogProps & {
  sampleData: string;
  onSampleDataChange: (data: string) => void;
}) {
  const [opened, { close, toggle }] = useDisclosure(false);

  const queryClient = useQueryClient();

  const [form, setForm] = useState({ name: '', description: '' });

  // Sync form with template data when dialog opens or template changes
  useEffect(() => {
    if (opened) {
      setForm({
        name: template.name,
        description: template.description || '',
      });
    }
  }, [opened, template]);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Template>) => templateQueries.update({ id: template.id, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateQueries.detail(template.id).queryKey });
      toast.success('Настройки сохранены');
      close();
    },
    onError: () => {
      toast.error('Ошибка сохранения настроек');
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      name: form.name,
      description: form.description,
    });
  };

  const [json, setJson] = useState(sampleData);

  useEffect(() => {
    setJson(sampleData);
  }, [sampleData]);

  const handleSaveJson = () => {
    try {
      JSON.parse(json); // Validate JSON
      onSampleDataChange(json);
      // Save to backend
      updateMutation.mutate({ sampleData: json });
    } catch (e) {
      toast.error('Невалидный JSON');
    }
  };

  return (
    <Dialog open={opened} onOpenChange={toggle}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="mr-2 h-4 w-4" />
          Настройки
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Настройки шаблона</DialogTitle>
          <DialogDescription>Измените название, описание и тестовые данные.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">Общие</TabsTrigger>
            <TabsTrigger value="data">Data Source</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Название
                </Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Описание
                </Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSave} disabled={updateMutation.isPending}>
                {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Сохранить
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="data" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>JSON Sample Data</Label>
              <p className="text-sm text-muted-foreground">
                Эти данные используются для автодополнения переменных (&#123;&#123;) и предпросмотра.
              </p>
              <Textarea
                className="font-mono h-[300px]"
                value={json}
                onChange={(e) => setJson(e.target.value)}
                placeholder={'{\n  "title": "Document",\n  "date": "2024-01-01"\n}'}
              />
            </div>
            <DialogFooter>
               <Button onClick={handleSaveJson} disabled={json === sampleData}>
                  Сохранить JSON
               </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
