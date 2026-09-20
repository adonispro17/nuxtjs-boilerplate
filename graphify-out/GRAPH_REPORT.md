# Graph Report - nuxtjs-boilerplate  (2026-09-20)

## Corpus Check
- Corpus is ~11,537 words - fits in a single context window. You may not need a graph.

## Summary
- 79 nodes · 100 edges · 12 communities (9 shown, 3 thin omitted)
- Extraction: 94% EXTRACTED · 5% INFERRED · 1% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.87)
- Token cost: 132,434 input · 0 output

## Community Hubs (Navigation)
- Graphify Core Pipeline
- NuxtJS Package Config
- Graphify Export Formats
- Graphify Query & Navigation
- Extraction & Automation Hooks
- Extraction Spec & Cache
- Ingest & Transcription
- Cross-Repo GitHub Merge
- Nuxt Boilerplate Overview
- TypeScript Config

## God Nodes (most connected - your core abstractions)
1. `/graphify Command` - 22 edges
2. `Incremental Update & Cluster-Only Guide` - 10 edges
3. `Query, Path, Explain Guide` - 9 edges
4. `Exports & Benchmark Guide` - 8 edges
5. `scripts` - 6 edges
6. `Subagent Extraction Prompt Template` - 6 edges
7. `Graphify Project Rules (root CLAUDE.md)` - 6 edges
8. `save-result Feedback Loop` - 5 edges
9. `Structural (AST) Extraction` - 4 edges
10. `GitHub Clone & Cross-Repo Merge Guide` - 4 edges

## Surprising Connections (you probably didn't know these)
- `Nuxt Example Project` --conceptually_related_to--> `/graphify Command`  [AMBIGUOUS]
  README.md → .claude/skills/graphify/SKILL.md
- `graphify claude install (CLAUDE.md Integration)` --shares_data_with--> `Graphify Project Rules (root CLAUDE.md)`  [INFERRED]
  .claude/skills/graphify/references/hooks.md → CLAUDE.md
- `Graphify Project Rules (root CLAUDE.md)` --references--> `GRAPH_REPORT.md Output`  [EXTRACTED]
  CLAUDE.md → .claude/skills/graphify/SKILL.md
- `MCP stdio Server (graphify.serve)` --semantically_similar_to--> `Query, Path, Explain Guide`  [INFERRED] [semantically similar]
  .claude/skills/graphify/references/exports.md → .claude/skills/graphify/references/query.md
- `graphify-out/wiki/index.md` --shares_data_with--> `Wiki Export (--wiki)`  [INFERRED]
  CLAUDE.md → .claude/skills/graphify/references/exports.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Graphify Skill Reference Documentation Set** — _claude_skills_graphify_skill_graphifycommand, _claude_skills_graphify_references_extraction_spec_extractionspec, _claude_skills_graphify_references_update_updateguide, _claude_skills_graphify_references_query_queryguide, _claude_skills_graphify_references_add_watch_addwatchguide, _claude_skills_graphify_references_hooks_hooksguide, _claude_skills_graphify_references_exports_exportsguide, _claude_skills_graphify_references_transcribe_transcribeguide, _claude_skills_graphify_references_github_and_merge_githubmergeguide [EXTRACTED 1.00]
- **Graph Auto-Rebuild Mechanisms** — _claude_skills_graphify_references_hooks_postcommithook, _claude_skills_graphify_references_add_watch_watchmodule, _claude_skills_graphify_references_hooks_claudemdintegration [INFERRED 0.85]
- **Ways to Query the Knowledge Graph** — _claude_skills_graphify_references_exports_mcpserver, _claude_skills_graphify_references_query_bfstraversal, claude_graphifyprojectrules [INFERRED 0.85]

## Communities (12 total, 3 thin omitted)

### Community 0 - "Graphify Core Pipeline"
Cohesion: 0.17
Nodes (16): Graphify Skill Reference Note, build_merge(), graphify cluster-only, detect_incremental(), graph_diff(), Incremental Update & Cluster-Only Guide, Community Detection (cluster), God Nodes Analysis (+8 more)

### Community 1 - "NuxtJS Package Config"
Cohesion: 0.18
Nodes (10): devDependencies, nuxt, private, scripts, build, dev, generate, postinstall (+2 more)

### Community 2 - "Graphify Export Formats"
Cohesion: 0.22
Nodes (9): Exports & Benchmark Guide, FalkorDB Export, GraphML Export, MCP stdio Server (graphify.serve), Neo4j Export, SVG Export, Token Reduction Benchmark, Wiki Export (--wiki) (+1 more)

### Community 3 - "Graphify Query & Navigation"
Cohesion: 0.39
Nodes (9): BFS Traversal Mode, DFS Traversal Mode, graphify explain, graphify path, Query, Path, Explain Guide, graphify reflect / LESSONS.md, save-result Feedback Loop, Constrained Query Vocabulary Expansion (+1 more)

### Community 4 - "Extraction & Automation Hooks"
Cohesion: 0.29
Nodes (8): graphify.watch File Watcher, graphify claude install (CLAUDE.md Integration), Commit Hook & CLAUDE.md Integration Guide, Post-Commit Auto-Rebuild Hook, Gemini Backend (extract_corpus_parallel), Part C: Merge AST + Semantic, Semantic (LLM) Extraction, Structural (AST) Extraction

### Community 5 - "Extraction Spec & Cache"
Cohesion: 0.25
Nodes (8): Confidence Score Rubric, Extraction Spec Guide, Hyperedge Extraction Rule, Node ID Format ({stem}_{entity}), Semantic Similarity Edge Rule, Subagent Extraction Prompt Template, Semantic Extraction Cache (Step B0), Parallel Subagent Dispatch (Step B2)

### Community 6 - "Ingest & Transcription"
Cohesion: 0.40
Nodes (6): Add & Watch Guide, ingest() URL Ingestion, transcribe_all() (Whisper), Transcribe Video/Audio Guide, Whisper Domain-Hint Prompt, Issue #1392 (write-from-Python / stale sidecar guards)

### Community 7 - "Cross-Repo GitHub Merge"
Cohesion: 0.67
Nodes (4): Cross-Repo Graph, GitHub Clone & Cross-Repo Merge Guide, graphify clone, graphify merge-graphs

### Community 8 - "Nuxt Boilerplate Overview"
Cohesion: 0.67
Nodes (3): Nuxt Development Server, Nuxt Example Project, Vercel Zero-Config Deployment

## Ambiguous Edges - Review These
- `/graphify Command` → `Nuxt Example Project`  [AMBIGUOUS]
  README.md · relation: conceptually_related_to

## Knowledge Gaps
- **30 isolated node(s):** `private`, `build`, `dev`, `generate`, `preview` (+25 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 34 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `/graphify Command` and `Nuxt Example Project`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `/graphify Command` connect `Graphify Core Pipeline` to `Graphify Export Formats`, `Graphify Query & Navigation`, `Extraction & Automation Hooks`, `Extraction Spec & Cache`, `Ingest & Transcription`, `Cross-Repo GitHub Merge`, `Nuxt Boilerplate Overview`?**
  _High betweenness centrality (0.533) - this node is a cross-community bridge._
- **Why does `Exports & Benchmark Guide` connect `Graphify Export Formats` to `Graphify Core Pipeline`?**
  _High betweenness centrality (0.142) - this node is a cross-community bridge._
- **Why does `Query, Path, Explain Guide` connect `Graphify Query & Navigation` to `Graphify Core Pipeline`, `Graphify Export Formats`?**
  _High betweenness centrality (0.127) - this node is a cross-community bridge._
- **What connects `private`, `build`, `dev` to the rest of the system?**
  _30 weakly-connected nodes found - possible documentation gaps or missing edges._