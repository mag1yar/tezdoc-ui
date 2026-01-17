import { createServerFn } from '@tanstack/react-start';
import { redirect } from '@tanstack/react-router';
import { useAppSession } from '@/shared/lib/session';
import ky from 'ky';

// TODO: Move base URL to env or shared config
// Server functions run on Node, so they can talk directly to backend
const API_URL = 'http://localhost:4000/api';

type LoginData = {
  email: string;
  password: string;
};

type AuthResponse = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    role: string;
    orgId: string;
  };
};

export const loginFn = createServerFn({ method: 'POST' })
  .inputValidator((data: LoginData) => data)
  .handler(async ({ data }) => {
    try {
      const res = await ky
        .post(`${API_URL}/auth/login`, {
          json: data,
        })
        .json<AuthResponse>();

      const session = await useAppSession();
      await session.update({
        accessToken: res.accessToken,
        userId: res.user.id,
        email: res.user.email,
        orgId: res.user.orgId,
        role: res.user.role,
      });

      return { success: true, user: res.user };
    } catch (error) {
      console.error('Login failed:', error);
      return { error: 'Invalid credentials or server error' };
    }
  });

export const logoutFn = createServerFn({ method: 'POST' }).handler(async () => {
  const session = await useAppSession();
  await session.clear();
  throw redirect({ to: '/auth/login' });
});

export const userFn = createServerFn({ method: 'GET' }).handler(async () => {
  const session = await useAppSession();

  if (!session.data.userId || !session.data.accessToken) {
    return null;
  }

  // Optional: Validate token with backend /users/me if strictly needed,
  // or trust the encrypted session for now to save a request.
  // For better security/freshness, we should call /users/me.
  try {
    const user = await ky
      .get(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${session.data.accessToken}`,
        },
      })
      .json<any>();
    return user;
  } catch (e) {
    // Token expired or invalid
    await session.clear();
    return null;
  }
});
