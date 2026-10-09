# Graph Report - E-Commerce Store  (2026-10-09)

## Corpus Check
- 172 files · ~77,424 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: (none) 5, .example 1, .css 1)

## Summary
- 557 nodes · 1630 edges · 42 communities (19 shown, 23 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 28 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- General UI & Page Layouts
- Product Display & Modals
- Catalog & Wishlist Services
- Supabase & Infrastructure
- Auth & Gemini Integration
- Global App Shell & Navigation
- Core Services & Error Handling
- Verification Scripts
- Order Management
- Community 9
- Cart Management
- Community 11
- Community 12
- Postgres Best Practices - Indexing/Data
- Project Specs & Concepts
- Community 15
- Community 17
- Community 18
- Ponytail Efficiency Suite
- Community 20
- Community 21
- Community 25
- Community 26
- Community 27
- Community 28
- Community 29
- Community 30
- Community 31
- Community 32
- Community 35
- Community 37

## God Nodes (most connected - your core abstractions)
1. `cn()` - 67 edges
2. `Button` - 52 edges
3. `lucide-react` - 44 edges
4. `next` - 42 edges
5. `react` - 38 edges
6. `Badge()` - 37 edges
7. `Container()` - 32 edges
8. `formatCurrency()` - 23 edges
9. `ProductDetailPage()` - 22 edges
10. `createClient()` - 22 edges

## Surprising Connections (you probably didn't know these)
- `Use tsvector for Full-Text Search` --conceptually_related_to--> `Supabase Postgres Best Practices Skill`  [INFERRED]
  .agents/skills/supabase-postgres-best-practices/references/advanced-full-text-search.md → .agents/skills/supabase-postgres-best-practices/SKILL.md
- `Index JSONB Columns for Efficient Querying` --conceptually_related_to--> `Supabase Postgres Best Practices Skill`  [INFERRED]
  .agents/skills/supabase-postgres-best-practices/references/advanced-jsonb-indexing.md → .agents/skills/supabase-postgres-best-practices/SKILL.md
- `Configure Idle Connection Timeouts` --conceptually_related_to--> `Supabase Postgres Best Practices Skill`  [INFERRED]
  .agents/skills/supabase-postgres-best-practices/references/conn-idle-timeout.md → .agents/skills/supabase-postgres-best-practices/SKILL.md
- `Set Appropriate Connection Limits` --conceptually_related_to--> `Supabase Postgres Best Practices Skill`  [INFERRED]
  .agents/skills/supabase-postgres-best-practices/references/conn-limits.md → .agents/skills/supabase-postgres-best-practices/SKILL.md
- `Use Connection Pooling for All Applications` --conceptually_related_to--> `Supabase Postgres Best Practices Skill`  [INFERRED]
  .agents/skills/supabase-postgres-best-practices/references/conn-pooling.md → .agents/skills/supabase-postgres-best-practices/SKILL.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Ponytail Skill Suite** — agents_skills_ponytail_skill, agents_skills_ponytail_review_skill, agents_skills_ponytail_audit_skill, agents_skills_ponytail_debt_skill, agents_skills_ponytail_gain_skill, agents_skills_ponytail_help_skill [EXTRACTED 1.00]
- **Postgres Locking and Concurrency Strategies** — agents_skills_supabase_postgres_best_practices_references_lock_deadlock_prevention, agents_skills_supabase_postgres_best_practices_references_lock_short_transactions, agents_skills_supabase_postgres_best_practices_references_lock_skip_locked [INFERRED 0.95]
- **Postgres Indexing Best Practices** — agents_skills_supabase_postgres_best_practices_references_query_composite_indexes, agents_skills_supabase_postgres_best_practices_references_query_covering_indexes, agents_skills_supabase_postgres_best_practices_references_query_index_types, agents_skills_supabase_postgres_best_practices_references_query_missing_indexes, agents_skills_supabase_postgres_best_practices_references_query_partial_indexes, agents_skills_supabase_postgres_best_practices_references_schema_foreign_key_indexes [INFERRED 0.95]
- **Postgres Security Layer** — agents_skills_supabase_postgres_best_practices_references_security_privileges, agents_skills_supabase_postgres_best_practices_references_security_rls_basics, agents_skills_supabase_postgres_best_practices_references_security_rls_performance [INFERRED 0.95]
- **Core Architecture Stack** — concept_nextjs_frontend, concept_supabase_backend, concept_gemini_api [INFERRED 0.95]

## Communities (42 total, 23 thin omitted)

### Community 0 - "General UI & Page Layouts"
Cohesion: 0.10
Nodes (33): class-variance-authority, lucide-react, next, react, AdminCustomersPage(), AdminError(), AdminOrdersPage(), ALL_STATUSES (+25 more)

### Community 1 - "Product Display & Modals"
Cohesion: 0.11
Nodes (39): AdminLoading(), CheckoutPage(), ShopProductsPage(), ProductDetailPage(), CanvasContainer(), CanvasContainerProps, CartDrawer(), LoadingState() (+31 more)

### Community 2 - "Catalog & Wishlist Services"
Cohesion: 0.10
Nodes (22): HomePage(), SUGGESTIONS, CategoryCard(), CategoryCardProps, ProductCardProps, CATEGORIES, MOCK_USER, Order (+14 more)

### Community 3 - "Supabase & Infrastructure"
Cohesion: 0.08
Nodes (24): @supabase/ssr, AdminLayout(), PATCH(), VALID_STATUSES, GET(), AdminHeader(), AdminSidebar(), env (+16 more)

### Community 4 - "Auth & Gemini Integration"
Cohesion: 0.20
Nodes (29): AdminDashboardPage(), AdminSettingsPage(), ForgotPasswordPage(), LoginPage(), RegisterPage(), ResetPasswordPage(), AccountPage(), init() (+21 more)

### Community 5 - "Global App Shell & Navigation"
Cohesion: 0.09
Nodes (26): zustand, fontAbel, fontBerkshireSwash, fontCourgette, fontRobotoMono, metadata, ShopLayout(), navItems (+18 more)

### Community 6 - "Core Services & Error Handling"
Cohesion: 0.10
Nodes (11): AppError, AuthenticationError, AuthorizationError, ConflictError, NotFoundError, ValidationError, authService, BaseService (+3 more)

### Community 7 - "Verification Scripts"
Cohesion: 0.14
Nodes (6): @supabase/supabase-js, supabase, run(), TEST_PRODUCTS, TestAddressStore, TestOrderEngine

### Community 8 - "Order Management"
Cohesion: 0.23
Nodes (12): SHIPPING_OPTIONS, MOCK_ORDERS, orderService, OrderStatus, PaymentStatus, CreateOrderInput, Order, OrderItemDetail (+4 more)

### Community 9 - "Community 9"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 10 - "Cart Management"
Cohesion: 0.24
Nodes (7): cartService, ProductImage, RawJoinedCartItem, CartState, CartItem, CartSummary, sortProductImages()

### Community 11 - "Community 11"
Cohesion: 0.13
Nodes (14): name, private, version, autoprefixer, clsx, eslint, eslint-config-next, postcss (+6 more)

### Community 12 - "Community 12"
Cohesion: 0.15
Nodes (13): dependencies, animejs, class-variance-authority, clsx, lucide-react, next, react, react-dom (+5 more)

### Community 14 - "Project Specs & Concepts"
Cohesion: 0.20
Nodes (11): Admin Flow, AI Shopping Assistant, Customer Flow, Google Gemini API, PostgreSQL Database, Supabase Backend, App Flow, Product Requirements Document (PRD) (+3 more)

### Community 15 - "Community 15"
Cohesion: 0.20
Nodes (10): devDependencies, autoprefixer, eslint, eslint-config-next, postcss, tailwindcss, @types/node, @types/react (+2 more)

### Community 18 - "Community 18"
Cohesion: 0.29
Nodes (5): zod, LoginInput, loginSchema, RegisterInput, registerSchema

### Community 19 - "Ponytail Efficiency Suite"
Cohesion: 0.33
Nodes (6): Ponytail Audit Skill, Ponytail Debt Skill, Ponytail Gain Skill, Ponytail Help Skill, Ponytail Review Skill, Ponytail Skill

### Community 20 - "Community 20"
Cohesion: 0.47
Nodes (4): animejs, animateEntrance(), animatePulse(), animateStagger()

### Community 21 - "Community 21"
Cohesion: 0.33
Nodes (6): scripts, build, dev, lint, start, typecheck

## Knowledge Gaps
- **23 isolated node(s):** `next/core-web-vitals`, `react-dom`, `@types/node`, `@types/react`, `@types/react-dom` (+18 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 200 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **23 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `General UI & Page Layouts` to `Product Display & Modals`, `Catalog & Wishlist Services`, `Supabase & Infrastructure`, `Auth & Gemini Integration`, `Global App Shell & Navigation`, `Order Management`, `Community 11`, `Community 29`?**
  _High betweenness centrality (0.129) - this node is a cross-community bridge._
- **What connects `next/core-web-vitals`, `react-dom`, `@types/node` to the rest of the system?**
  _23 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `General UI & Page Layouts` be split into smaller, more focused modules?**
  _Cohesion score 0.10192307692307692 - nodes in this community are weakly interconnected._
- **Why does `@supabase/supabase-js` connect `Verification Scripts` to `Supabase & Infrastructure`, `Community 11`, `Auth & Gemini Integration`?**
  _High betweenness centrality (0.077) - this node is a cross-community bridge._
- **Should `Product Display & Modals` be split into smaller, more focused modules?**
  _Cohesion score 0.10707803992740472 - nodes in this community are weakly interconnected._
- **Why does `lucide-react` connect `General UI & Page Layouts` to `Product Display & Modals`, `Catalog & Wishlist Services`, `Supabase & Infrastructure`, `Auth & Gemini Integration`, `Global App Shell & Navigation`, `Order Management`, `Community 11`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **Should `Catalog & Wishlist Services` be split into smaller, more focused modules?**
  _Cohesion score 0.10303030303030303 - nodes in this community are weakly interconnected._