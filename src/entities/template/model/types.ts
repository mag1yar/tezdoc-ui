import { z } from 'zod';
import { templateSchema, templateVersionSchema } from './schemas';

export type TemplateVersion = z.infer<typeof templateVersionSchema>;
export type Template = z.infer<typeof templateSchema>;
