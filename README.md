# Control de Asistencia - Enfermería

Sistema para el área de enfermería de un hospital que registra la **hora de
entrada y salida** del personal, con **integración a lectores biométricos**
(huella/rostro) y una **base de datos** en Postgres (pensada para
[Supabase](https://supabase.com), aunque funciona con cualquier Postgres).

Construido sobre Nuxt 3 (Vue 3 + Nitro), pensado para desplegarse en Vercel
con Supabase como base de datos.

## Características

- **Login** con usuarios y contraseñas (hash con bcrypt) y sesiones por cookie.
- **Panel en tiempo real**: quién está en turno, turnos completados hoy,
  marcar entrada/salida manual como respaldo si el lector biométrico falla.
- **Gestión de personal**: alta/edición/baja de enfermeras/os, con su código
  de empleado y su ID biométrico (el identificador que asigna el lector al
  enrolar la huella o el rostro).
- **Dispositivos biométricos**: registra cada lector, genera una `api_key`
  única y expone un webhook para que el dispositivo reporte cada marcaje.
- **Reportes**: historial filtrable por fecha/empleado, horas trabajadas y
  exportación a CSV.
- **Base de datos en Postgres/Supabase**: las tablas se crean solas la
  primera vez que arranca el servidor (no hay que correr migraciones a mano).

## Requisitos

- Node.js 18.18 o superior.
- Un proyecto de Postgres accesible por red (Supabase, o cualquier otro).

## 1. Crear la base de datos en Supabase

1. Crea una cuenta y un proyecto en [supabase.com](https://supabase.com)
   (plan gratuito es suficiente para empezar).
2. Ve a **Project Settings → Database → Connection string** y copia la
   cadena en modo **Transaction pooler** (puerto `6543`), algo como:
   ```
   postgresql://postgres.xxxxxxxxxxxx:[TU-PASSWORD]@aws-0-xxxx.pooler.supabase.com:6543/postgres
   ```
   Ese modo es el recomendado para apps serverless (Vercel); reemplaza
   `[TU-PASSWORD]` por la contraseña de la base de datos que definiste al
   crear el proyecto.

No hace falta crear tablas manualmente: la app las crea solas (con datos de
ejemplo) la primera vez que recibe una petición.

## 2. Instalación y arranque local

```bash
npm install
NUXT_DATABASE_URL="postgresql://...tu-cadena-de-supabase..." npm run dev
```

Al iniciar por primera vez, el sistema crea automáticamente:

- Un usuario administrador (`admin` / contraseña mostrada en la consola del
  servidor, o la que definas en `NUXT_SEED_ADMIN_PASSWORD`).
- Un dispositivo biométrico de ejemplo con su `api_key` (se muestra en la
  consola del servidor).
- Tres empleados de ejemplo con sus IDs biométricos (`BIO-0001`, `BIO-0002`,
  `BIO-0003`).

**Importante:** cambia la contraseña del administrador en producción usando
la variable de entorno `NUXT_SEED_ADMIN_PASSWORD` antes del primer arranque.

## Variables de entorno

Estas variables se leen **en tiempo de ejecución** (no al compilar), tal como
lo espera Nuxt:

| Variable                     | Descripción                                            | Por defecto |
|-------------------------------|---------------------------------------------------------|-------------|
| `NUXT_DATABASE_URL`           | Cadena de conexión a Postgres/Supabase                  | *(vacío, obligatorio)* |
| `NUXT_DATABASE_SSL`           | Poner en `false` solo para un Postgres local sin TLS     | `true`      |
| `NUXT_SEED_ADMIN_PASSWORD`    | Contraseña del usuario `admin` sembrado la primera vez   | `admin123`  |

## 3. Desplegar en Vercel

1. Entra a [vercel.com](https://vercel.com) → **Add New → Project** →
   importa este repositorio de GitHub (rama `claude/exciting-hawking-th3xn5`
   o la que uses en producción). Vercel detecta Nuxt automáticamente.
2. En **Environment Variables**, agrega:
   - `NUXT_DATABASE_URL` = la cadena de conexión de Supabase del paso 1.
   - `NUXT_SEED_ADMIN_PASSWORD` = una contraseña segura para `admin`.
3. Dale a **Deploy**. Vercel te da una URL pública (`tu-proyecto.vercel.app`)
   — esa es la que le compartes al hospital.
4. Entra tú primero con `admin` y la contraseña que configuraste, ve a
   **Personal** y **Dispositivos biométricos**, y reemplaza los datos de
   ejemplo por los reales antes de dar acceso al personal.

## Conectar un lector biométrico

El sistema no depende del hardware de un fabricante específico: expone un
endpoint HTTP genérico que cualquier lector (o un pequeño "bridge"/agente que
traduzca el protocolo propietario del fabricante — por ejemplo ZKTeco,
Suprema, Hikvision, ANVIZ, que suelen soportar "HTTP push" o un SDK local)
puede llamar cada vez que alguien marca su huella o rostro:

```
POST /api/biometric/webhook
Headers: x-api-key: <api_key del dispositivo>
Content-Type: application/json

{ "biometricId": "BIO-0001" }
```

- `biometricId` es el identificador que el propio lector asigna al enrolar la
  huella/rostro de cada persona; se configura una vez en la ficha del
  empleado (pantalla **Personal**).
- Si no se envía `"type": "in" | "out"`, el sistema detecta automáticamente
  si es una entrada o una salida (si la persona no tiene un turno abierto, es
  entrada; si ya lo tiene, es salida).
- Cada dispositivo se registra desde la pantalla **Dispositivos biométricos**,
  donde se genera su `api_key` única (se puede revocar eliminando el
  dispositivo).

## Estructura del proyecto

```
server/
  utils/db.ts           # Conexión Postgres (postgres.js), esquema y datos de ejemplo
  utils/auth.ts         # Hash de contraseñas, sesiones
  utils/attendance.ts   # Lógica de entrada/salida (manual y biométrica)
  middleware/session.ts # Protege /api/* y adjunta el usuario autenticado
  api/
    auth/                # login, logout, me
    employees/           # CRUD de personal
    devices/             # alta/baja de lectores biométricos
    attendance/          # marcar entrada/salida, asistencia de hoy, historial
    biometric/webhook.ts # endpoint que consume el lector biométrico

pages/
  login.vue
  index.vue             # panel de asistencia en tiempo real
  employees/index.vue   # gestión de personal
  devices/index.vue     # gestión de dispositivos biométricos
  reports/index.vue     # historial y exportación CSV
```

## Otras formas de desplegarlo

Además de Vercel, incluye un `Dockerfile` que sirve para cualquier proveedor
de contenedores (Railway, Render, Fly.io, un VPS propio, etc.), siempre
apuntando `NUXT_DATABASE_URL` a tu proyecto de Supabase (o cualquier otro
Postgres):

```bash
docker build -t control-enfermeria .
docker run -d -p 3000:3000 \
  -e NUXT_DATABASE_URL="postgresql://...tu-cadena-de-supabase..." \
  -e NUXT_SEED_ADMIN_PASSWORD="una-contraseña-segura" \
  control-enfermeria
```

O sin Docker, directamente con Node:

```bash
npm run build
NUXT_DATABASE_URL="postgresql://..." node .output/server/index.mjs
```

Como la base de datos ya no vive en un archivo local sino en Postgres, no
necesitas disco persistente en el servidor de la app — cualquier hosting
(incluido uno serverless) funciona.
