import ky from 'ky';

export const api = ky.create({
  prefixUrl: 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  hooks: {
    beforeRequest: [
      (request) => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('accessToken');
          if (token) {
            request.headers.set('Authorization', `Bearer ${token}`);
          }
        }
      },
    ],
    afterResponse: [
      async (_request, _options, response) => {
        if (response.status === 401 && typeof window !== 'undefined') {
          // Логика разлогина или рефреша
          localStorage.removeItem('accessToken');
          window.location.href = '/auth/login';
        }
      },
    ],
  },
});
