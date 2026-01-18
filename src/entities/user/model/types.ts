import { z } from 'zod';
import { userMeSchema, userRoleSchema } from './schemas';

export type UserRole = z.infer<typeof userRoleSchema>;
export type UserMe = z.infer<typeof userMeSchema>;

export type User = {
  id: string;
  email: string;
  role: UserRole;
  orgId: string;
};
