import postgres from 'postgres';
import { randomUUID, randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';

let sql: postgres.Sql | null = null;
let ready: Promise<void> | null = null;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  employee_code TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Enfermera/o',
  department TEXT NOT NULL DEFAULT 'Enfermería',
  email TEXT,
  biometric_id TEXT UNIQUE,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'supervisor',
  employee_id TEXT REFERENCES employees(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS devices (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  api_key TEXT UNIQUE NOT NULL,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS attendance_records (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL REFERENCES employees(id),
  clock_in_at TIMESTAMPTZ NOT NULL,
  clock_out_at TIMESTAMPTZ,
  clock_in_source TEXT NOT NULL DEFAULT 'manual',
  clock_out_source TEXT,
  clock_in_device_id TEXT REFERENCES devices(id),
  clock_out_device_id TEXT REFERENCES devices(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_attendance_employee ON attendance_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_clock_in ON attendance_records(clock_in_at);
`;

async function seed(db: postgres.Sql) {
  const [{ count }] = await db<{ count: number }[]>`SELECT COUNT(*)::int as count FROM users`;
  if (count > 0) return;

  const config = useRuntimeConfig();
  const passwordHash = bcrypt.hashSync(config.seedAdminPassword, 10);

  await db`INSERT INTO users (id, username, password_hash, role) VALUES (${randomUUID()}, 'admin', ${passwordHash}, 'admin')`;

  const deviceId = randomUUID();
  const deviceApiKey = randomBytes(24).toString('hex');
  await db`
    INSERT INTO devices (id, name, location, api_key)
    VALUES (${deviceId}, 'Lector biométrico - Estación de enfermería', 'Piso 1', ${deviceApiKey})
  `;

  const demoEmployees = [
    { code: 'ENF-001', name: 'María López', role: 'Enfermera Jefe', biometricId: 'BIO-0001' },
    { code: 'ENF-002', name: 'Carlos Ramírez', role: 'Enfermero', biometricId: 'BIO-0002' },
    { code: 'ENF-003', name: 'Ana Martínez', role: 'Auxiliar de Enfermería', biometricId: 'BIO-0003' },
  ];
  for (const e of demoEmployees) {
    await db`
      INSERT INTO employees (id, employee_code, full_name, role, department, biometric_id, active)
      VALUES (${randomUUID()}, ${e.code}, ${e.name}, ${e.role}, 'Enfermería', ${e.biometricId}, true)
    `;
  }

  // eslint-disable-next-line no-console
  console.log('[nursing-app] Base de datos inicializada.');
  // eslint-disable-next-line no-console
  console.log(`[nursing-app] Usuario admin creado -> usuario: admin / password: ${config.seedAdminPassword}`);
  // eslint-disable-next-line no-console
  console.log(`[nursing-app] Dispositivo biométrico de ejemplo -> id: ${deviceId} / api_key: ${deviceApiKey}`);
}

/**
 * Devuelve el cliente de Postgres, garantizando que el esquema exista y los
 * datos de ejemplo estén sembrados. Se puede llamar en cada request: la
 * inicialización solo corre una vez por proceso (importante en serverless,
 * donde cada instancia fría vuelve a ejecutar este módulo).
 */
export async function getDb(): Promise<postgres.Sql> {
  if (!sql) {
    const config = useRuntimeConfig();
    if (!config.databaseUrl) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Falta configurar DATABASE_URL (cadena de conexión a Postgres/Supabase)',
      });
    }
    sql = postgres(config.databaseUrl, {
      ssl: config.databaseSsl ? 'require' : false,
      // El modo "Transaction pooler" de Supabase (pgbouncer) no soporta
      // sentencias preparadas, por lo que se desactivan aquí.
      prepare: false,
      transform: postgres.camel,
    });
  }

  if (!ready) {
    const db = sql;
    ready = (async () => {
      await db.unsafe(SCHEMA);
      await seed(db);
    })();
  }
  await ready;

  return sql;
}

export function newId(): string {
  return randomUUID();
}
