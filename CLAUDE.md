## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
- El grafo está acotado a código del proyecto vía `.graphifyignore` (ver sección "Historial de decisiones" abajo). Para actualizaciones donde solo cambia código, `graphify update .` es suficiente; si se toca `.graphifyignore` (agregar/quitar exclusiones), hay que hacer rebuild completo con `--force` en vez de `--update` (ver por qué abajo).

## Historial de decisiones (graphify)

**2026-09-20 — Build inicial del grafo**
- Se corrió `/graphify .` sobre el repo completo (17 archivos: 5 código + 12 docs). Resultado: 79 nodos, 100 edges, 12 comunidades. Extracción AST para código + extracción semántica (subagente) para `.claude/`, `CLAUDE.md` y `README.md`. Commiteado en `graphify-out/`.

**2026-09-20 — Acotar el grafo a solo código del proyecto**
- Se creó `.graphifyignore` en la raíz excluyendo `.claude/`, `CLAUDE.md` y `graphify-out/`.
- Decisión clave: **no** se usó `--update` para aplicar la exclusión, sino un rebuild completo con `--force`. Razón: `graphify` distingue entre archivos "eliminados" (deleted) y "excluidos" (excluded) — `--update` solo poda los eliminados, así que con el nuevo `.graphifyignore` reportaba "0 archivos cambiados" y dejaba los nodos viejos de `.claude/`/`CLAUDE.md` huérfanos en el grafo. Hubo que forzar el shrink intencional.
- Resultado: el grafo bajó de 79 → 19 nodos (60 nodos y 86 edges eliminados). Quedaron: `package.json`, `app.vue`, `nuxt.config.ts`, `tsconfig.json` (código) + `README.md` (no se excluyó, no se pidió). 6 comunidades: NPM Scripts, Package Dependencies, README Overview, TypeScript Config, App Entry Component, Nuxt Runtime Configuration.
- Costo: 0 tokens (README.md vino de caché de la corrida anterior).

### Pendientes
- Decidir si `README.md` también debe excluirse del grafo (por ahora sigue incluido porque no se pidió excluirlo explícitamente).
- Hay una entrada de caché semántica obsoleta para `README.md`: contiene un edge (`conceptually_related_to`, AMBIGUOUS) hacia un nodo de `_claude_skills_graphify_skill_graphifycommand` que ya no existe en el grafo (fue excluido). El build actual lo descarta automáticamente al construir el grafo (edge "dangling"), pero la entrada de caché en `graphify-out/cache/semantic/` sigue teniendo esa referencia stale — no afecta la salida, pero conviene regenerar esa entrada si se vuelve a incluir contenido de `.claude/` en el futuro.
- No se ha abierto un Pull Request para estos cambios — están commiteados y pusheados a la rama `claude/charming-carson-2ejjfd`, pendiente de que el usuario decida si quiere PR.
- Recordatorio de flujo: si en el futuro se agregan o quitan reglas en `.graphifyignore`, repetir el rebuild con `--force` (no alcanza con `--update`).
