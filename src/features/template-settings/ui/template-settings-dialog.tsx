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

import { Template } from '@/entities/template/model/types';
import { templateQueries } from '@/entities/template';

interface TemplateSettingsDialogProps {
  template: Template;
}

export function TemplateSettingsDialog({ template }: TemplateSettingsDialogProps) {
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

  return (
    <Dialog open={opened} onOpenChange={toggle}>
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
      </DialogContent>
    </Dialog>
  );
}
