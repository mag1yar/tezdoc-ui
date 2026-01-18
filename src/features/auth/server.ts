import { createServerFn } from '@tanstack/react-start';
import { useAppSession } from '@/shared/lib/session';
import ky from 'ky';
import { env } from '@/env';

import { User } from '@/entities/user/model/types';

const API_URL = env.SERVER_URL;

type LoginData = {
  email: string;
  password: string;
};

type AuthResponse = {
  accessToken: string;
  user: User;
};

export const loginFn = createServerFn({ method: 'POST' })
  .inputValidator((data: LoginData) => data)
  .handler(async ({ data }) => {
    try {
      const { accessToken, user } = await ky
        .post(`${API_URL}/auth/login`, {
          json: data,
        })
        .json<AuthResponse>();

      const session = await useAppSession();
      await session.update({
        accessToken,
        userId: user.id,
        email: user.email,
        orgId: user.orgId,
        role: user.role,
      });

      return { success: true, user };
    } catch (error) {
      console.error('Login failed:', error);
      return { error: 'Invalid credentials or server error' };
    }
  });

export const logoutFn = createServerFn({ method: 'POST' }).handler(async () => {
  const session = await useAppSession();
  await session.clear();

  return { success: true };
});
