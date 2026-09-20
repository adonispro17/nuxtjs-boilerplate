# Graph Report - nuxtjs-boilerplate  (2026-09-20)

## Corpus Check
- Corpus is ~139 words - fits in a single context window. You may not need a graph.

## Summary
- 19 nodes · 14 edges · 6 communities (3 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- NPM Scripts
- Package Dependencies
- README Overview
- TypeScript Config

## God Nodes (most connected - your core abstractions)
1. `scripts` - 6 edges
2. `Nuxt Example Project` - 2 edges
3. `private` - 1 edges
4. `build` - 1 edges
5. `dev` - 1 edges
6. `generate` - 1 edges
7. `preview` - 1 edges
8. `postinstall` - 1 edges
9. `nuxt` - 1 edges
10. `nuxt` - 1 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (6 total, 3 thin omitted)

### Community 0 - "NPM Scripts"
Cohesion: 0.33
Nodes (6): scripts, build, dev, generate, postinstall, preview

### Community 1 - "Package Dependencies"
Cohesion: 0.40
Nodes (4): devDependencies, nuxt, private, nuxt

### Community 2 - "README Overview"
Cohesion: 0.67
Nodes (3): Nuxt Development Server, Nuxt Example Project, Vercel Zero-Config Deployment

## Knowledge Gaps
- **12 isolated node(s):** `private`, `build`, `dev`, `generate`, `preview` (+7 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 14 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `scripts` connect `NPM Scripts` to `Package Dependencies`?**
  _High betweenness centrality (0.229) - this node is a cross-community bridge._
- **What connects `private`, `build`, `dev` to the rest of the system?**
  _12 weakly-connected nodes found - possible documentation gaps or missing edges._