import { z } from 'zod';

export const userRoleSchema = z.string();

export const organizationSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  slug: z.string(),
  subscriptionPlan: z.string(),
  billingEmail: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const userMeSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  provider: z.string().nullable(),
  firstName: z.string(),
  lastName: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  organizationId: z.uuid(),
  role: z.string(),
  organization: organizationSchema,
});
