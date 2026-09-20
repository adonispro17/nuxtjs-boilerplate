# Control de Asistencia - Enfermería

Sistema para el área de enfermería de un hospital que registra la **hora de
entrada y salida** del personal, con **integración a lectores biométricos**
(huella/rostro) y una **base de datos integrada** (SQLite embebida, sin
necesidad de instalar ni configurar un servidor de base de datos aparte).

Construido sobre Nuxt 3 (Vue 3 + Nitro).

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
- **Base de datos integrada**: usa el módulo nativo `node:sqlite` de Node.js
  (sin dependencias nativas que compilar). El archivo se crea solo la primera
  vez que arranca el servidor.

## Requisitos

- Node.js 22.5 o superior (usa el módulo experimental `node:sqlite`).

## Instalación y arranque

```bash
npm install
npm run dev
```

Al iniciar por primera vez, el sistema crea automáticamente:

- Un usuario administrador (`admin` / contraseña mostrada en la consola del
  servidor, o la que definas en `NURSE_ADMIN_PASSWORD`).
- Un dispositivo biométrico de ejemplo con su `api_key` (se muestra en la
  consola del servidor).
- Tres empleados de ejemplo con sus IDs biométricos (`BIO-0001`, `BIO-0002`,
  `BIO-0003`).

**Importante:** cambia la contraseña del administrador en producción usando
la variable de entorno `NURSE_ADMIN_PASSWORD` antes del primer arranque.

## Variables de entorno

| Variable               | Descripción                                          | Por defecto          |
|-------------------------|-------------------------------------------------------|-----------------------|
| `NURSE_DB_PATH`          | Ruta del archivo SQLite                                | `.data/nursing.db`   |
| `NURSE_ADMIN_PASSWORD`   | Contraseña del usuario `admin` sembrado la primera vez | `admin123`            |

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
  utils/db.ts           # Conexión SQLite, esquema y datos de ejemplo
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

## Notas de despliegue

El preset de Nitro se configuró como `node-server` (variable
`NITRO_PRESET`) porque la base de datos integrada y el webhook biométrico
requieren un runtime Node persistente con acceso a disco; no es compatible
con funciones "edge" (Vercel Edge, Cloudflare Workers, etc.).

```bash
npm run build
node .output/server/index.mjs
```
