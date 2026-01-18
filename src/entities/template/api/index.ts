import { queryOptions } from '@tanstack/react-query';
import { api } from '@/shared/api/api';
import { templateSchema } from '../model/schemas';
import { Template } from '../model/types';
import { z } from 'zod';

export const templateQueries = {
  all: () => ['templates'],

  list: () =>
    queryOptions({
      queryKey: templateQueries.all(),
      queryFn: async () => {
        const templates = await api.get('templates').json();
        return z.array(templateSchema).parse(templates);
      },
      staleTime: 10 * 1000,
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: [...templateQueries.all(), id],
      queryFn: async () => {
        const templates = await api.get(`templates/${id}`).json();
        return templateSchema.parse(templates);
      },
      staleTime: 10 * 1000,
    }),

  create: (data: { name: string; description?: string }) =>
    api.post('templates', { json: data }).json<z.infer<typeof templateSchema>>(),

  update: ({ id, data }: { id: string; data: Partial<Template> & { content?: any } }) =>
    api.patch(`templates/${id}`, { json: data }).json<Template>(),
};
