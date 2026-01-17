import { useSession } from '@tanstack/react-start/server';

type SessionData = {
  accessToken?: string;
  userId?: string;
  email?: string;
  orgId?: string;
  role?: string;
};

export function useAppSession() {
  return useSession<SessionData>({
    name: 'app-session',
    password: process.env.SESSION_SECRET!,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30, // 30 days
    },
  });
}
