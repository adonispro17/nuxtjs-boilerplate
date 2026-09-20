import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { randomUUID, randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';

let db: DatabaseSync | null = null;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  employee_code TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Enfermera/o',
  department TEXT NOT NULL DEFAULT 'Enfermería',
  email TEXT,
  biometric_id TEXT UNIQUE,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'supervisor',
  employee_id TEXT REFERENCES employees(id),
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  expires_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS devices (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  api_key TEXT UNIQUE NOT NULL,
  last_seen_at TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS attendance_records (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL REFERENCES employees(id),
  clock_in_at TEXT NOT NULL,
  clock_out_at TEXT,
  clock_in_source TEXT NOT NULL DEFAULT 'manual',
  clock_out_source TEXT,
  clock_in_device_id TEXT REFERENCES devices(id),
  clock_out_device_id TEXT REFERENCES devices(id),
  notes TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_attendance_employee ON attendance_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_clock_in ON attendance_records(clock_in_at);
`;

function seed(database: DatabaseSync) {
  const userCount = database
    .prepare('SELECT COUNT(*) as count FROM users')
    .get() as { count: number };

  if (userCount.count > 0) return;

  const config = useRuntimeConfig();
  const now = new Date().toISOString();

  const passwordHash = bcrypt.hashSync(config.seedAdminPassword, 10);
  database
    .prepare(
      'INSERT INTO users (id, username, password_hash, role, employee_id, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    )
    .run(randomUUID(), 'admin', passwordHash, 'admin', null, now);

  const deviceId = randomUUID();
  const deviceApiKey = randomBytes(24).toString('hex');
  database
    .prepare(
      'INSERT INTO devices (id, name, location, api_key, created_at) VALUES (?, ?, ?, ?, ?)'
    )
    .run(deviceId, 'Lector biométrico - Estación de enfermería', 'Piso 1', deviceApiKey, now);

  const demoEmployees = [
    { code: 'ENF-001', name: 'María López', role: 'Enfermera Jefe', biometricId: 'BIO-0001' },
    { code: 'ENF-002', name: 'Carlos Ramírez', role: 'Enfermero', biometricId: 'BIO-0002' },
    { code: 'ENF-003', name: 'Ana Martínez', role: 'Auxiliar de Enfermería', biometricId: 'BIO-0003' },
  ];

  const insertEmployee = database.prepare(
    'INSERT INTO employees (id, employee_code, full_name, role, department, biometric_id, active, created_at) VALUES (?, ?, ?, ?, ?, ?, 1, ?)'
  );
  for (const e of demoEmployees) {
    insertEmployee.run(randomUUID(), e.code, e.name, e.role, 'Enfermería', e.biometricId, now);
  }

  // eslint-disable-next-line no-console
  console.log('[nursing-app] Base de datos inicializada.');
  // eslint-disable-next-line no-console
  console.log(`[nursing-app] Usuario admin creado -> usuario: admin / password: ${config.seedAdminPassword}`);
  // eslint-disable-next-line no-console
  console.log(`[nursing-app] Dispositivo biométrico de ejemplo -> id: ${deviceId} / api_key: ${deviceApiKey}`);
}

export function getDb(): DatabaseSync {
  if (db) return db;

  const config = useRuntimeConfig();
  const dbPath = resolve(process.cwd(), config.dbPath);
  const dir = dirname(dbPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  db = new DatabaseSync(dbPath);
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec(SCHEMA);
  seed(db);

  return db;
}

export function newId(): string {
  return randomUUID();
}

export function nowIso(): string {
  return new Date().toISOString();
}
