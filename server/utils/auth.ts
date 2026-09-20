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

export async function createSession(userId: string): Promise<{ token: string; expiresAt: string }> {
  const db = await getDb();
  const token = newId() + newId();
  const expiresAt = new Date(Date.now() + SESSION_TTL_HOURS * 60 * 60 * 1000).toISOString();
  await db`INSERT INTO sessions (token, user_id, expires_at) VALUES (${token}, ${userId}, ${expiresAt})`;
  return { token, expiresAt };
}

export async function destroySession(token: string) {
  const db = await getDb();
  await db`DELETE FROM sessions WHERE token = ${token}`;
}

export async function getUserBySession(token: string | undefined): Promise<SessionUser | null> {
  if (!token) return null;
  const db = await getDb();

  const rows = await db<
    { id: string; username: string; role: string; employeeId: string | null; expiresAt: string }[]
  >`
    SELECT u.id, u.username, u.role, u.employee_id, s.expires_at
    FROM sessions s JOIN users u ON u.id = s.user_id
    WHERE s.token = ${token}
  `;
  const row = rows[0];
  if (!row) return null;

  if (new Date(row.expiresAt).getTime() < Date.now()) {
    await db`DELETE FROM sessions WHERE token = ${token}`;
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

export async function verifyDeviceApiKey(apiKey: string | undefined) {
  if (!apiKey) {
    throw createError({ statusCode: 401, statusMessage: 'Falta la llave de dispositivo (x-api-key)' });
  }
  const db = await getDb();
  const rows = await db<{ id: string; name: string }[]>`
    SELECT id, name FROM devices WHERE api_key = ${apiKey}
  `;
  const device = rows[0];

  if (!device) {
    throw createError({ statusCode: 401, statusMessage: 'Dispositivo no autorizado' });
  }
  return device;
}
