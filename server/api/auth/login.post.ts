import { getDb } from '../../utils/db';
import { verifyPassword, createSession, SESSION_COOKIE } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  const body = await readBody<{ username?: string; password?: string }>(event);
  const username = body?.username?.trim();
  const password = body?.password;

  if (!username || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Usuario y contraseña son requeridos' });
  }

  const db = await getDb();
  const rows = await db<
    { id: string; username: string; passwordHash: string; role: string; employeeId: string | null }[]
  >`
    SELECT id, username, password_hash, role, employee_id FROM users WHERE username = ${username}
  `;
  const user = rows[0];

  if (!user || !verifyPassword(password, user.passwordHash)) {
    throw createError({ statusCode: 401, statusMessage: 'Usuario o contraseña incorrectos' });
  }

  const session = await createSession(user.id);
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
