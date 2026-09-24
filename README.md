# Aura & Earth

Aura & Earth is a full-stack e-commerce storefront for modern organic luxury goods and mindful lifestyle essentials. It is being built with Next.js, TypeScript, Supabase, PostgreSQL, and a Gemini-powered shopping assistant.

The product direction is premium, warm, organic, and editorial rather than a generic marketplace. The MVP focuses on product discovery, authentication, cart and wishlist workflows, checkout without online payment processing, order management, and an admin workspace.

## Project Status

This project is in active development.

- The Next.js App Router UI, customer routes, admin routes, shared components, local state stores, and mock catalog are in the repository.
- The Supabase migration defines the production-oriented schema, indexes, triggers, roles, and Row Level Security policies.
- The MVP does not include an online payment gateway. Checkout is designed to create an order record and leave payment integration open for a future release.
- Product pages currently use the catalog in `src/data/mock-data.ts`; Supabase is the target backend for persisted catalog, account, cart, wishlist, and order data.

## Features

### Customer experience

- Responsive storefront homepage with featured products and category discovery
- Product catalog, product details, search modal, and category filtering
- Cart drawer and cart page with quantity management
- Wishlist and account pages
- Registration, login, logout, password recovery, and reset-password flows
- Order history and order detail pages
- Supabase Auth session handling and protected application areas
- Gemini API key configuration for the shopping assistant experience

### Administration

- Admin dashboard overview
- Product management area
- Order management area
- Customer management area
- Settings area
- Role-aware access using the `customer` and `admin` roles defined in the database

### Backend foundation

The initial Supabase migration includes tables for:

- Profiles, roles, categories, brands, and products
- Product variants, images, and inventory
- Carts, cart items, wishlists, and wishlist items
- Addresses, orders, order items, reviews, and notifications

Database access is protected with PostgreSQL constraints, indexes, helper functions, and Row Level Security policies. See `supabase/migrations/` for the source of truth.

## Technology Stack

- Next.js 14 with the App Router
- React 18 and TypeScript
- Tailwind CSS and PostCSS
- Supabase Auth and Supabase PostgreSQL
- `@supabase/ssr` and `@supabase/supabase-js`
- Zustand for client-side cart, UI, and wishlist state
- Zod for environment validation
- Lucide React for icons
- Anime.js for motion
- Gemini API integration through the application API layer
- Docker multi-stage production image with Next.js standalone output

## Getting Started

### Prerequisites

- Node.js 20 or newer
- npm
- A Supabase project

### Install dependencies

```bash
npm install
```

### Configure environment variables

Create a local environment file from the template:

```bash
cp .env.example .env.local
```

Set the values for your Supabase project in `.env.local`:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-server-only-service-role-key
```

Use either `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` or the legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser or commit real credentials.

### Apply the database schema

Run the SQL migrations in `supabase/migrations/` against the target Supabase project. The migrations create the application schema and seed the catalog data where applicable.

### Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available Scripts

```bash
npm run dev       # Start the Next.js development server
npm run build     # Create a production build
npm run start     # Start the standalone production server
npm run lint      # Run the Next.js lint command
npm run typecheck # Run the TypeScript compiler without emitting files
```

## Application Routes

### Storefront

- `/` - Home and product discovery
- `/products` - Product catalog
- `/products/[slug]` - Product details
- `/cart` - Cart review
- `/wishlist` - Saved products
- `/account` - Customer account
- `/orders` - Order history
- `/orders/[id]` - Order details

### Authentication

- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`

### Administration

- `/admin` - Dashboard
- `/admin/products` - Product management
- `/admin/orders` - Order management
- `/admin/customers` - Customer management
- `/admin/settings` - Admin settings

### API and system routes

- `/api/gemini` - Gemini integration endpoint
- `/api/health` - Health check endpoint
- `/auth/callback` - Supabase authentication callback

## Project Structure

```text
src/
	app/          Next.js routes, layouts, API routes, and application states
	components/   Shared UI, storefront, admin, and layout components
	config/       Environment and site configuration
	data/         Development catalog data
	features/     Feature-level exports and domain boundaries
	hooks/        Reusable React hooks
	lib/          Utilities, animations, errors, Gemini, and Supabase clients
	services/     Service-layer abstractions
	stores/       Zustand stores for cart, UI, and wishlist state
	types/        Shared TypeScript and database types
	utils/        Formatting and Supabase helpers
supabase/
	migrations/   PostgreSQL schema, policies, triggers, indexes, and seed data
Docs/            Product, technical, flow, and UI/UX documentation
```

## Docker

The repository includes a multi-stage Dockerfile that builds and runs the Next.js standalone server:

```bash
docker build -t aura-and-earth .
docker run --env-file .env.local -p 3000:3000 aura-and-earth
```

The container listens on port `3000`.

## Documentation

- [Product Requirements Document](Docs/PRD.md)
- [Technical Requirements Document](Docs/TRD.md)
- [Application Flow](Docs/App%20Flow.md)
- [UI/UX Design Brief](Docs/UI-UX%20Design%20Brief.md)

## Design Direction

The interface follows a modern organic luxury direction with spacious layouts, strong product imagery, subtle motion, and editorial typography. The design system uses Abel for interface text, Roboto Mono for product and order metadata, Courgette for restrained accents, and Berkshire Swash for brand display moments. The primary palette is built around Cornsilk, Black Forest, Olive Leaf, Sunlit Clay, and Copperwood.

## Security Notes

- Keep server-only Supabase credentials out of client code and version control.
- Keep privileged database operations behind server-side boundaries.
- Treat client-side totals and quantities as untrusted during order creation.
- Preserve and review Supabase Row Level Security policies when changing the schema.
- Do not commit `.env.local` or real API keys.

## Roadmap

- Replace mock catalog reads with Supabase-backed product services
- Complete persisted cart, wishlist, checkout, and order workflows
- Add product image storage and inventory administration
- Ground Gemini shopping assistance in live catalog data
- Add payment-provider integration after the MVP
- Expand analytics, reviews, notifications, and search capabilities

## License

No license has been specified for this project yet.
