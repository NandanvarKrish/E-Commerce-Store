# Graph Report - E-Commerce Store  (2026-09-24)

## Corpus Check
- Corpus is ~35,901 words - fits in a single context window. You may not need a graph.

## Summary
- 391 nodes · 748 edges · 36 communities (14 shown, 22 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 27 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 14
- Community 15
- Community 16
- Community 17
- Community 18
- Community 19
- Community 20
- Community 21
- Community 22
- Community 23
- Community 24
- Community 25
- Community 26
- Community 27
- Community 28
- Community 29
- Community 30
- Community 31

## God Nodes (most connected - your core abstractions)
1. `cn()` - 62 edges
2. `lucide-react` - 29 edges
3. `next` - 26 edges
4. `react` - 26 edges
5. `compilerOptions` - 17 edges
6. `Postgres Rule Categories` - 17 edges
7. `Button` - 13 edges
8. `createClient()` - 12 edges
9. `useUIStore` - 9 edges
10. `Badge()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `Use tsvector for Full-Text Search` --conceptually_related_to--> `Postgres Rule Categories`  [INFERRED]
  .agents/skills/supabase-postgres-best-practices/references/advanced-full-text-search.md → .agents/skills/supabase-postgres-best-practices/references/_sections.md
- `Index JSONB Columns for Efficient Querying` --conceptually_related_to--> `Postgres Rule Categories`  [INFERRED]
  .agents/skills/supabase-postgres-best-practices/references/advanced-jsonb-indexing.md → .agents/skills/supabase-postgres-best-practices/references/_sections.md
- `Configure Idle Connection Timeouts` --conceptually_related_to--> `Postgres Rule Categories`  [INFERRED]
  .agents/skills/supabase-postgres-best-practices/references/conn-idle-timeout.md → .agents/skills/supabase-postgres-best-practices/references/_sections.md
- `Set Appropriate Connection Limits` --conceptually_related_to--> `Postgres Rule Categories`  [INFERRED]
  .agents/skills/supabase-postgres-best-practices/references/conn-limits.md → .agents/skills/supabase-postgres-best-practices/references/_sections.md
- `Use Connection Pooling for All Applications` --conceptually_related_to--> `Postgres Rule Categories`  [INFERRED]
  .agents/skills/supabase-postgres-best-practices/references/conn-pooling.md → .agents/skills/supabase-postgres-best-practices/references/_sections.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Concurrency and Locking Best Practices** — agents_skills_supabase_postgres_best_practices_references_lock_advisory, agents_skills_supabase_postgres_best_practices_references_lock_deadlock_prevention, agents_skills_supabase_postgres_best_practices_references_lock_short_transactions, agents_skills_supabase_postgres_best_practices_references_lock_skip_locked [INFERRED 0.95]
- **Connection Management Best Practices** — agents_skills_supabase_postgres_best_practices_references_conn_idle_timeout, agents_skills_supabase_postgres_best_practices_references_conn_limits, agents_skills_supabase_postgres_best_practices_references_conn_pooling, agents_skills_supabase_postgres_best_practices_references_conn_prepared_statements [INFERRED 0.95]
- **Monitoring and Diagnostics Best Practices** — agents_skills_supabase_postgres_best_practices_references_monitor_explain_analyze, agents_skills_supabase_postgres_best_practices_references_monitor_pg_stat_statements [INFERRED 0.95]
- **PostgreSQL Indexing Strategies** — agents_skills_supabase_postgres_best_practices_references_query_composite_indexes, agents_skills_supabase_postgres_best_practices_references_query_covering_indexes, agents_skills_supabase_postgres_best_practices_references_query_index_types, agents_skills_supabase_postgres_best_practices_references_query_missing_indexes, agents_skills_supabase_postgres_best_practices_references_query_partial_indexes, agents_skills_supabase_postgres_best_practices_references_schema_foreign_key_indexes [INFERRED 0.95]
- **Project Foundational Documents** — docs_prd, docs_trd, docs_app_flow, docs_ui_ux_design_brief [INFERRED 0.95]
- **Supabase Security Model** — agents_skills_supabase_postgres_best_practices_references_security_privileges, agents_skills_supabase_postgres_best_practices_references_security_rls_basics, agents_skills_supabase_postgres_best_practices_references_security_rls_performance [INFERRED 0.95]

## Communities (36 total, 22 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (41): zustand, CartDrawer(), SearchModal(), SUGGESTIONS, ShopFooter(), ShopHeader(), CategoryCard(), CategoryCardProps (+33 more)

### Community 1 - "Community 1"
Cohesion: 0.07
Nodes (33): clsx, tailwind-merge, CanvasContainer(), CanvasContainerProps, ErrorState(), ErrorStateProps, LoadingState(), LoadingStateProps (+25 more)

### Community 2 - "Community 2"
Cohesion: 0.05
Nodes (39): devDependencies, autoprefixer, eslint, eslint-config-next, postcss, tailwindcss, @types/node, @types/react (+31 more)

### Community 3 - "Community 3"
Cohesion: 0.10
Nodes (17): next, dynamic, fontAbel, fontBerkshireSwash, fontCourgette, fontRobotoMono, src_app_globals, metadata (+9 more)

### Community 4 - "Community 4"
Cohesion: 0.20
Nodes (19): lucide-react, LoginPage(), RegisterPage(), GeminiKeyCard(), Card, CardContent, CardDescription, CardFooter (+11 more)

### Community 5 - "Community 5"
Cohesion: 0.11
Nodes (13): @supabase/supabase-js, AppError, AuthenticationError, AuthorizationError, ConflictError, NotFoundError, ValidationError, createClient() (+5 more)

### Community 6 - "Community 6"
Cohesion: 0.14
Nodes (8): react, NotFound(), EmptyStateProps, Button, ButtonProps, buttonVariants, Container(), ContainerProps

### Community 7 - "Community 7"
Cohesion: 0.17
Nodes (10): @supabase/ssr, env, envSchema, parsedEnv, processEnv, Database, Json, AuthUser (+2 more)

### Community 8 - "Community 8"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 9 - "Community 9"
Cohesion: 0.12
Nodes (18): Use tsvector for Full-Text Search, Index JSONB Columns for Efficient Querying, Configure Idle Connection Timeouts, Set Appropriate Connection Limits, Use Connection Pooling for All Applications, Use Prepared Statements Correctly with Pooling, Batch INSERT Statements for Bulk Data, Eliminate N+1 Queries with Batch Loading (+10 more)

### Community 10 - "Community 10"
Cohesion: 0.15
Nodes (13): dependencies, animejs, class-variance-authority, clsx, lucide-react, next, react, react-dom (+5 more)

### Community 11 - "Community 11"
Cohesion: 0.27
Nodes (6): class-variance-authority, AdminHeader(), AdminSidebar(), Badge(), BadgeProps, badgeVariants

### Community 12 - "Community 12"
Cohesion: 0.50
Nodes (4): Create Composite Indexes for Multi-Column Queries, Use Covering Indexes to Avoid Table Lookups, Choose the Right Index Type for Your Data, Use Partial Indexes for Filtered Queries

### Community 13 - "Community 13"
Cohesion: 0.67
Nodes (4): App Flow, Product Requirements Document (PRD), Technical Requirements Document (TRD), UI/UX Design Brief

## Knowledge Gaps
- **117 isolated node(s):** `next/core-web-vitals`, `nextConfig`, `name`, `version`, `private` (+112 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 183 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `Community 3` to `Community 0`, `Community 1`, `Community 2`, `Community 4`, `Community 6`, `Community 7`?**
  _High betweenness centrality (0.169) - this node is a cross-community bridge._
- **Why does `lucide-react` connect `Community 4` to `Community 0`, `Community 1`, `Community 2`, `Community 3`, `Community 6`, `Community 11`?**
  _High betweenness centrality (0.106) - this node is a cross-community bridge._
- **Why does `react` connect `Community 6` to `Community 0`, `Community 1`, `Community 2`, `Community 4`, `Community 11`?**
  _High betweenness centrality (0.094) - this node is a cross-community bridge._
- **What connects `next/core-web-vitals`, `nextConfig`, `name` to the rest of the system?**
  _117 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06557377049180328 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.07493061979648474 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.046464646464646465 - nodes in this community are weakly interconnected._