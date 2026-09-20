import { getUserBySession, SESSION_COOKIE } from '../utils/auth';

const PUBLIC_API_PATHS = [
  '/api/auth/login',
  '/api/biometric/webhook',
];

export default defineEventHandler((event) => {
  const path = event.path || event.node.req.url || '';

  const token = getCookie(event, SESSION_COOKIE);
  const user = getUserBySession(token);
  if (user) {
    event.context.user = user;
  }

  if (!path.startsWith('/api/')) return;
  if (PUBLIC_API_PATHS.some((p) => path.startsWith(p))) return;

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'No autenticado' });
  }
});
