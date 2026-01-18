import { z } from 'zod';

export const templateVersionSchema = z.object({
  content: z.json(),
  versionNumber: z.number(),
});

export const templateSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  description: z.string().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  versions: z.array(templateVersionSchema).optional(),
});
