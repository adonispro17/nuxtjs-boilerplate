## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

## Proyecto: Control de Asistencia - Enfermería

Software para el área de enfermería de un hospital: registra hora de
entrada/salida del personal, se integra con lectores biométricos y guarda
todo en una base de datos. Se construyó sobre este boilerplate Nuxt 3, en la
rama `claude/exciting-hawking-th3xn5`.

### Decisiones tomadas

- **Stack**: Nuxt 3 (Vue 3 + Nitro) para frontend y API, Tailwind CSS para
  estilos, `bcryptjs` + sesiones por cookie (tabla `sessions`) para login
  (sin librería de auth externa).
- **Base de datos**: empezó como SQLite embebido (`node:sqlite`), pero se
  **migró a Postgres** (`postgres` / postgres.js) para poder usar
  **Supabase** como base de datos administrada. El esquema (`employees`,
  `users`, `sessions`, `devices`, `attendance_records`) se crea solo la
  primera vez que arranca el servidor; no hay migraciones manuales.
- **Por qué no "todo en Supabase"**: Supabase no aloja la app (solo DB/Auth/
  Storage), así que el plan quedó **Supabase (Postgres) + Vercel (hosting de
  la app)**. Se descartó Railway/Docker como plan principal, pero se dejó
  como alternativa (ver `Dockerfile`).
- **Variables de entorno en runtime** (no en build): `NUXT_DATABASE_URL`,
  `NUXT_DATABASE_SSL` (default `true`, poner `false` solo en Postgres local
  sin TLS), `NUXT_SEED_ADMIN_PASSWORD` (default `admin123`, cambiar en
  producción). Ojo: deben llevar el prefijo `NUXT_` para que Nuxt las tome en
  tiempo de ejecución (un bug inicial las leía en tiempo de build y no
  funcionaban).
- **Nitro preset**: sin preset forzado (antes estaba fijo en `vercel-edge`,
  incompatible con Postgres/TCP y con el `node:sqlite` original). Ahora se
  autodetecta: Vercel usa su preset serverless normal, y Docker/Railway/VPS
  caen al default `node-server`.
- **Integración biométrica**: webhook genérico `POST /api/biometric/webhook`
  con header `x-api-key` por dispositivo (no atado a ninguna marca de
  hardware específica: ZKTeco/Suprema/Hikvision/etc. pueden apuntar ahí
  directo o vía un "bridge"). Detecta automáticamente entrada vs. salida.
- **Verificación**: se probó el flujo completo (login, CRUD de personal y
  dispositivos, marcado manual, webhook biométrico, reportes con filtros de
  fecha) contra un Postgres real levantado localmente antes de subir cada
  cambio, no solo contra SQLite.

### Pendientes / próximos pasos

- El usuario todavía no ha creado su proyecto real de **Supabase** ni de
  **Vercel** — falta obtener el `NUXT_DATABASE_URL` real y hacer el primer
  deploy.
- Tras el primer deploy: entrar como `admin`, **reemplazar los 3 empleados
  de ejemplo** (María López, Carlos Ramírez, Ana Martínez) y el
  **dispositivo biométrico de ejemplo** por los datos reales del hospital.
- **Cambiar la contraseña de `admin`** en producción vía
  `NUXT_SEED_ADMIN_PASSWORD` (por defecto queda `admin123`).
- Configurar el lector biométrico físico (o su bridge/SDK) para que llame
  al webhook con la `api_key` real generada al registrar el dispositivo.
- No hay pruebas automatizadas (unit/e2e) todavía, solo verificación manual.
- No se ha abierto ningún Pull Request para esta rama (no se ha pedido).
- Pendiente de decidir: manejo de zona horaria para "hoy"/filtros de fecha
  (hoy usa la zona horaria del servidor Postgres, típicamente UTC).
- Posible integración futura mencionada pero no implementada: enviar
  eventos de entrada/salida hacia un workflow de **GoHighLevel** (la
  herramienta que usa el usuario para su agencia).
