# Graph Report - nuxtjs-boilerplate  (2026-09-20)

## Corpus Check
- 1 files · ~144 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 21 nodes · 16 edges · 6 communities (3 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Package Dependencies
- NPM Scripts
- README Overview
- TypeScript Config

## God Nodes (most connected - your core abstractions)
1. `scripts` - 6 edges
2. `Nuxt Example Project` - 2 edges
3. `engines` - 2 edges
4. `extends` - 1 edges
5. `./.nuxt/tsconfig.json` - 1 edges
6. `Nuxt Development Server` - 1 edges
7. `Vercel Zero-Config Deployment` - 1 edges
8. `private` - 1 edges
9. `node` - 1 edges
10. `build` - 1 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (6 total, 3 thin omitted)

### Community 0 - "Package Dependencies"
Cohesion: 0.29
Nodes (6): devDependencies, nuxt, engines, node, private, nuxt

### Community 1 - "NPM Scripts"
Cohesion: 0.33
Nodes (6): scripts, build, dev, generate, postinstall, preview

### Community 2 - "README Overview"
Cohesion: 0.67
Nodes (3): Nuxt Development Server, Nuxt Example Project, Vercel Zero-Config Deployment

## Knowledge Gaps
- **13 isolated node(s):** `extends`, `./.nuxt/tsconfig.json`, `Nuxt Development Server`, `Vercel Zero-Config Deployment`, `private` (+8 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 15 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `scripts` connect `NPM Scripts` to `Package Dependencies`?**
  _High betweenness centrality (0.237) - this node is a cross-community bridge._
- **What connects `extends`, `./.nuxt/tsconfig.json`, `Nuxt Development Server` to the rest of the system?**
  _13 weakly-connected nodes found - possible documentation gaps or missing edges._