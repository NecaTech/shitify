# Necatech Boilerplate

Production-ready Next.js fullstack starter kit.

## Stack

- **Next.js 16** — App Router
- **TypeScript 5**
- **Tailwind CSS 4**
- **Drizzle ORM** — PostgreSQL
- **Better Auth** — Authentication
- **Zod** — Validation
- **Vercel** — Deployment

## Project Structure

```
src/
├── app/              # Routing only
├── components/       # Reusable UI
│   ├── ui/           # Generic components
│   └── layout/       # Header, footer, sidebar
├── features/         # Feature-based modules
├── lib/              # Shared technical layer
│   ├── db/           # Drizzle + schema + migrations
│   ├── auth/         # Better Auth
│   └── validations/  # Shared Zod schemas
├── hooks/            # Reusable React hooks
└── types/            # Global types
```

## Getting Started

### 1. Clone and install

git clone https://github.com/your-username/necatech-boilerplate.git
cd necatech-boilerplate
pnpm install

### 2. Environment variables

cp .env.example .env.local

Fill in the required variables in `.env.local`.

### 3. Database

pnpm db:generate
pnpm db:migrate

### 4. Start development server

pnpm dev

## Scripts

| Command            | Description                |
| ------------------ | -------------------------- |
| `pnpm dev`         | Start development server   |
| `pnpm build`       | Build for production       |
| `pnpm db:generate` | Generate migrations        |
| `pnpm db:migrate`  | Apply migrations           |
| `pnpm db:studio`   | Open Drizzle visual studio |
| `pnpm db:seed`     | Seed the database          |

## License

MIT
