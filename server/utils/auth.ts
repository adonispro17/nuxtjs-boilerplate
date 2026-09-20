import type { H3Event } from 'h3';
import bcrypt from 'bcryptjs';
import { getDb, newId } from './db';

export const SESSION_COOKIE = 'nurse_session';
const SESSION_TTL_HOURS = 12;

export interface SessionUser {
  id: string;
  username: string;
  role: string;
  employeeId: string | null;
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function createSession(userId: string): { token: string; expiresAt: string } {
  const db = getDb();
  const token = newId() + newId();
  const expiresAt = new Date(Date.now() + SESSION_TTL_HOURS * 60 * 60 * 1000).toISOString();
  db.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)').run(
    token,
    userId,
    expiresAt
  );
  return { token, expiresAt };
}

export function destroySession(token: string) {
  const db = getDb();
  db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
}

export function getUserBySession(token: string | undefined): SessionUser | null {
  if (!token) return null;
  const db = getDb();

  const row = db
    .prepare(
      `SELECT u.id, u.username, u.role, u.employee_id as employeeId, s.expires_at as expiresAt
       FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token = ?`
    )
    .get(token) as
    | { id: string; username: string; role: string; employeeId: string | null; expiresAt: string }
    | undefined;

  if (!row) return null;

  if (new Date(row.expiresAt).getTime() < Date.now()) {
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
    return null;
  }

  return {
    id: row.id,
    username: row.username,
    role: row.role,
    employeeId: row.employeeId,
  };
}

export function requireUser(event: H3Event): SessionUser {
  const user = event.context.user as SessionUser | undefined;
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'No autenticado' });
  }
  return user;
}

export function requireAdmin(event: H3Event): SessionUser {
  const user = requireUser(event);
  if (user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Se requiere rol de administrador' });
  }
  return user;
}

export function verifyDeviceApiKey(apiKey: string | undefined) {
  if (!apiKey) {
    throw createError({ statusCode: 401, statusMessage: 'Falta la llave de dispositivo (x-api-key)' });
  }
  const db = getDb();
  const device = db
    .prepare('SELECT id, name FROM devices WHERE api_key = ?')
    .get(apiKey) as { id: string; name: string } | undefined;

  if (!device) {
    throw createError({ statusCode: 401, statusMessage: 'Dispositivo no autorizado' });
  }
  return device;
}
