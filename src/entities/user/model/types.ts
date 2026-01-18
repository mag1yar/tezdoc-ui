export type UserRole = string;

export type User = {
  id: string;
  email: string;
  role: UserRole;
  orgId: string;
};
