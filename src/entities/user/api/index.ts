import { createServerFn } from '@tanstack/react-start';
import { useAppSession } from '@/shared/lib/session';
import ky from 'ky';
import { env } from '@/env';
import type { User } from '../model/types';

const API_URL = env.SERVER_URL;

export const userFn = createServerFn({ method: 'GET' }).handler(async () => {
  const session = await useAppSession();

  if (!session.data.userId || !session.data.accessToken) {
    return null;
  }

  try {
    const user = await ky
      .get(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${session.data.accessToken}`,
        },
      })
      .json<User>();

    return user;
  } catch (e) {
    await session.clear();

    return null;
  }
});
