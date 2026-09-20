import { getDb } from '../../utils/db';
import { verifyPassword, createSession, SESSION_COOKIE } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  const body = await readBody<{ username?: string; password?: string }>(event);
  const username = body?.username?.trim();
  const password = body?.password;

  if (!username || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Usuario y contraseña son requeridos' });
  }

  const db = getDb();
  const user = db
    .prepare('SELECT id, username, password_hash as passwordHash, role, employee_id as employeeId FROM users WHERE username = ?')
    .get(username) as
    | { id: string; username: string; passwordHash: string; role: string; employeeId: string | null }
    | undefined;

  if (!user || !verifyPassword(password, user.passwordHash)) {
    throw createError({ statusCode: 401, statusMessage: 'Usuario o contraseña incorrectos' });
  }

  const session = createSession(user.id);
  setCookie(event, SESSION_COOKIE, session.token, {
    httpOnly: true,
    sameSite: 'lax',
    expires: new Date(session.expiresAt),
    path: '/',
  });

  return {
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      employeeId: user.employeeId,
    },
  };
});
