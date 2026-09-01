# Attendify

> A modern, enterprise-grade school attendance management platform built for educators and administrators.

Attendify provides a unified solution for managing student attendance across educational institutions. It seamlessly integrates student records, QR-based attendance capture, session management, and regulatory compliance reporting into a single, intuitive web application.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [API Routes](#api-routes)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)

## Features

### Core Functionality

- **Student Management** — Maintain complete student profiles with enrollment history, transfer tracking, and unique QR token generation
- **Attendance Capture** — Dual-mode recording via manual entry or real-time QR code scanning with `html5-qrcode`
- **Session Management** — Granular control over attendance sessions with open, review, finalize, and reopen workflows with role-based authorization
- **Reporting** — Generate monthly attendance analytics and export SF2 Excel reports for regulatory compliance
- **School Administration** — Manage school years, sections, subjects, teaching assignments, and calendar events
- **Access Control** — Role-based authorization (`ADMIN`, `TEACHER`) enforced at both route and data-layer levels

### Technical Highlights

- **Type-Safe** — Strict TypeScript with comprehensive type coverage across client and server
- **Real-Time** — Server actions for optimistic updates and consistent state management
- **Performant** — Optimized queries, efficient component architecture, and server-side rendering where appropriate
- **Validated** — End-to-end Zod schema validation from request to persistence layer
- **Auditable** — Complete audit trail with `createdById`, `updatedById`, and soft-deletion support

## Tech Stack

### Frontend

- **Framework**: [Next.js 16](https://nextjs.org) (App Router) — React server components for data fetching, optimal code splitting
- **Language**: TypeScript 5 — Strict mode enabled for compile-time safety
- **UI**: [React 19](https://react.dev) — Latest reconciliation with compiler support
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com) — Utility-first design with PostCSS 4
- **Scanning**: [`html5-qrcode`](https://nimblewebguru.com/html5-qrcode/) — Browser-native QR code detection
- **Reporting**: [ExcelJS](https://github.com/exceljs/exceljs) — Programmatic Excel generation

### Backend

- **Database**: PostgreSQL — Relational schema with UUID identifiers and computed indexes for performance
- **ORM**: [Prisma 7](https://www.prisma.io) with [`@prisma/adapter-pg`](https://www.prisma.io/docs/orm/drivers/databases/postgresql) — Native PostgreSQL driver for zero-ORM-overhead queries
- **Authentication**: [Better Auth](https://www.betterauth.dev) — Session-based auth with email/password flow and audit trails
- **Validation**: [Zod](https://zod.dev) — Runtime schema validation for request/response integrity

### Development

- **Linting**: ESLint 9 with Next.js and TypeScript plugins
- **Type Checking**: TypeScript compiler without emit (`tsc --noEmit`)
- **Seed Data**: Custom Prisma seed script for reproducible test environments

## Architecture

This project follows a layered, services-oriented architecture designed for maintainability and testability:

```
React Components (UI Layer)
        ↓
Next.js Route Handlers / Server Actions
        ↓
Service Layer (Business Logic)
        ↓
Repository Layer (Data Access Abstraction)
        ↓
Prisma Client (ORM)
        ↓
PostgreSQL Database
```

### Design Principles

- **Never Access Prisma Directly** — All database queries route through repositories
- **Business Logic in Services** — Controllers/handlers delegate to service classes
- **Type-Safe Queries** — Generated Prisma types ensure compile-time correctness
- **Composition Over Inheritance** — Reusable service and repository base classes
- **SOLID Principles** — Single responsibility, dependency injection where appropriate

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed design patterns and [PROJECT_RULES.md](PROJECT_RULES.md) for coding standards.

## Quick Start

### Prerequisites

- **Node.js** 20+ (LTS recommended)
- **npm** 10+
- **PostgreSQL** 14+ (local or remote)

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd attendify
npm install
```

### 2. Configure Environment

Create `.env.local` in the project root (never commit credentials):

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/attendify?schema=public"

# Authentication (Better Auth)
BETTER_AUTH_SECRET="$(openssl rand -base64 32)"
BETTER_AUTH_URL="http://localhost:3000"

# Optional: Supabase (for existing dashboard workflows)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

**Why these variables?**
- `DATABASE_URL`: Prisma connection string for PostgreSQL
- `BETTER_AUTH_SECRET`: Signing key for session tokens (generate with OpenSSL)
- `BETTER_AUTH_URL`: Callback URL for auth redirects (must match deployment domain)
- Supabase keys: Required by existing dashboard components still using Supabase client (migration in progress)

### 3. Set Up Database

```bash
# Generate Prisma Client in src/generated/prisma
npx prisma generate

# Run migrations against your database
npx prisma migrate dev

# Load development seed data (optional, review before running)
npx prisma db seed
```

The seed creates:
- Two test users (admin + teacher)
- Active school year (2024-2025)
- Sample sections, subjects, and students
- Pre-finalized attendance records for testing

> ⚠️ **Caution**: Review `prisma/seed.ts` before running against a shared database.

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Configuration

| Variable | Required | Purpose | Example |
|----------|----------|---------|---------|
| `DATABASE_URL` | ✓ | PostgreSQL connection string | `postgresql://user:pass@host/db` |
| `BETTER_AUTH_SECRET` | ✓ | Session signing key (32+ chars) | `<base64-encoded-random>` |
| `BETTER_AUTH_URL` | ✓ | Auth redirect base URL | `http://localhost:3000` (dev) |
| `NEXT_PUBLIC_SUPABASE_URL` | ✗ | Supabase project URL | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✗ | Supabase anon key (public) | `eyJhbGc...` |
| `NODE_ENV` | ✗ | Runtime environment | `development`, `production` |

## Database Setup

### Schema Overview

The database is designed around these core entities:

- **User** — Authentication identity with role (`ADMIN`, `TEACHER`)
- **Teacher** — Domain extension of User for section advisers and teaching assignments
- **Student** — Permanent learner records with LRN and QR token
- **SchoolYear** — Academic year container (`PLANNED`, `ACTIVE`, `CLOSED`)
- **Section** — Class grouping within a school year
- **Enrollment** — Student membership with entry type and history preservation
- **AttendanceSession** — Daily session with open/finalized state
- **AttendanceRecord** — Per-student attendance entry
- **TeachingAssignment** — Subject-teacher-section binding
- **CalendarEvent** — School year exceptions (holidays, etc.)

For detailed schema documentation, see [docs/DATABASE.md](docs/DATABASE.md) and [docs/ERD.md](docs/ERD.md).

### Migrations

Migrations are stored in `prisma/migrations/`. To create a new migration:

```bash
npx prisma migrate dev --name <descriptive_name>
```

Prisma will:
1. Detect schema changes in `prisma/schema.prisma`
2. Generate migration SQL
3. Prompt you to review and accept
4. Apply immediately to dev database

For production, use:
```bash
npx prisma migrate deploy
```

## API Routes

### Authentication (`/api/auth`)

- `POST /api/auth/[...all]` — Better Auth endpoint (sign-up, sign-in, sign-out, session refresh)

### Students (`/api/students`)

- `GET /api/students` — List all students (teacher+ view)
- `POST /api/students` — Create student (admin only)
- `GET /api/students/[id]` — Fetch student details
- `PATCH /api/students/[id]` — Update student profile
- `GET /api/students/[id]/sections` — Get student's active sections

### Attendance (`/api/attendance`)

- `GET /api/attendance/sessions` — List attendance sessions
- `POST /api/attendance/sessions` — Create session (teacher)
- `GET /api/attendance/sessions/[id]` — Get session details
- `PATCH /api/attendance/sessions/[id]` — Update/finalize session
- `POST /api/attendance/records` — Log attendance (manual or scan)
- `GET /api/attendance/records/[id]` — Fetch attendance record

### Reports (`/api/reports`)

- `GET /api/reports/sf2` — Generate SF2 Excel report

### Note on Authorization

All endpoints validate user roles server-side. Token validation occurs at the route handler level; business logic is secured at the service layer.

## Development

### Available Scripts

```bash
npm run dev           # Start Next.js dev server (watches files, fast refresh)
npm run build         # Create optimized production build
npm run start         # Start production server
npm run lint          # Run ESLint on src/ and prisma/
npm run type-check    # Run TypeScript compiler (no emit)
```

### Code Style & Standards

This project enforces:

- **No `any` types** — Strict TypeScript
- **No ESLint disables** — Address all linting issues
- **Descriptive names** — Variable/function names must convey intent
- **Small functions** — Keep to ~40 lines for readability
- **Small components** — Keep to ~300 lines (split large screens)
- **Reusable utilities** — Extract common patterns into `src/lib` and `src/utils`
- **Composition** — Prefer higher-order functions over inheritance

See [PROJECT_RULES.md](PROJECT_RULES.md) for complete guidelines.

### Testing & Debugging

- **Type Checking**: `npm run type-check` before committing
- **Linting**: `npm run lint` catches code quality issues
- **Database Inspection**: Use `npx prisma studio` to browse/edit database interactively
- **Request Logging**: Check `src/utils/logger.ts` for structured logging

### Prisma Studio

Inspect and edit database records in a browser GUI:

```bash
npx prisma studio
```

Opens at [http://localhost:5555](http://localhost:5555).

## Deployment

### Build Verification

```bash
npm run build          # Creates .next directory
npm run type-check     # Ensures no TypeScript errors
```

### Environment Variables

Ensure all production variables are set in your deployment platform:

```env
DATABASE_URL=          # Production PostgreSQL connection
BETTER_AUTH_SECRET=    # Long, random secret (different from dev)
BETTER_AUTH_URL=       # Your domain (e.g., https://attendance.school.edu)
NODE_ENV=production
```

### Database Migrations

Before deploying a new build:

```bash
npx prisma migrate deploy
```

This applies pending migrations idempotently.

### Platform-Specific Guides

- **Vercel**: Environment variables set in project settings; database must be externally hosted
- **Railway/Render**: Set DATABASE_URL via dashboard; migrations run automatically if configured
- **Docker**: Build with `npm ci && npm run build` in Dockerfile; expose port 3000

## Contributing

### Submitting Changes

1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Make changes following [PROJECT_RULES.md](PROJECT_RULES.md)
3. Run linting and type-checking:
   ```bash
   npm run lint
   npm run type-check
   ```
4. Commit with clear messages: `git commit -m "feat: add QR code validation"`
5. Push and open a pull request with a description of changes

### Code Review Checklist

- [ ] TypeScript: No `any`, strict mode passes
- [ ] Linting: ESLint passes without warnings
- [ ] Architecture: Follows services/repositories pattern
- [ ] Testing: Manual testing for new features
- [ ] Database: Migrations tested on fresh schema

## Troubleshooting

### "Cannot find module @prisma/client"

**Solution**: Generate Prisma Client:
```bash
npx prisma generate
```

The generated types live in `src/generated/prisma/`.

### "NEXT_PUBLIC_SUPABASE_URL is not set"

Supabase variables are only required if using Supabase client components (current code still has references). You can either:
1. Set the variables in `.env.local`
2. Remove Supabase client usage from dashboard components (planned refactor)

### "Role-based access denied" on protected routes

Verify:
1. User is logged in: Check `Better Auth` session cookie in DevTools
2. User role is correct: Query database or use `npx prisma studio`
3. Route handler checks role: Review `src/lib/auth-server.ts` for role validation logic

### Database connection times out

**For local PostgreSQL:**
```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT version();"

# Verify DATABASE_URL is correct
echo $DATABASE_URL
```

**For remote PostgreSQL:**
- Verify firewall allows connection from your IP
- Check connection string format: `postgresql://user:password@host:5432/dbname?schema=public`
- Test with psql: `psql $DATABASE_URL`

### Hot reload not working

Next.js dev server detects file changes automatically. If stuck:
```bash
# Stop server (Ctrl+C)
rm -rf .next
npm run dev
```

### Build fails with TypeScript errors

```bash
npm run type-check     # See all errors at once
```

Address all errors — the build won't complete otherwise.

## License

[Add your license here — MIT, Apache 2.0, etc.]

---

**Questions or issues?** Open an issue on the repository or review the documentation files in `docs/`.

### Authenticated dashboard

- `/dashboard` - Attendance and student overview
- `/dashboard/students` - Search and manage students
- `/dashboard/students/new` - Register a student
- `/dashboard/students/[id]` - View a student profile and QR code
- `/dashboard/scanner` - Scan QR codes for attendance
- `/dashboard/attendance` - Review and update attendance
- `/dashboard/qr-cards` - Generate student QR cards
- `/dashboard/reports` - Review monthly attendance and export SF2
- `/dashboard/settings/calendar` - Manage school-calendar events

Unauthenticated users are redirected to `/login`. Dashboard access is enforced by the application proxy and server-side authorization helpers, not by client-side UI state alone.

## Architecture

The intended request flow is:

```text
Pages and components
        |
Route handlers and server actions
        |
Services
        |
Repositories
        |
Prisma
```

- React components handle presentation and submit user actions.
- Route handlers and server actions handle the application boundary.
- Services contain business rules and authorization decisions.
- Repositories own database queries and transactions.
- Zod validators parse and validate external input.
- Prisma should not be accessed directly from React components.

See [ARCHITECTURE.md](ARCHITECTURE.md), [src/services](src/services), and [src/repositories](src/repositories).

## Data Model

The canonical Prisma schema is in [prisma/schema.prisma](prisma/schema.prisma). It uses PostgreSQL UUIDs and models:

- Users, teachers, sessions, accounts, and verification records
- Students and historical enrollments
- School years, sections, subjects, and teaching assignments
- Attendance sessions and attendance records
- School-calendar events

Student section membership is represented by `Enrollment`, rather than a direct section column on `Student`. Attendance is represented by an `AttendanceSession` plus its `AttendanceRecord` rows. Domain records use audit fields and soft deletion where historical preservation matters.

Database migrations are version-controlled in [prisma/migrations](prisma/migrations). For production, apply committed migrations with:

```bash
npx prisma migrate deploy
```

## Authentication and Authorization

Better Auth stores users, sessions, accounts, and verification records through Prisma. New registrations default to the `TEACHER` role. The supported roles are:

- `ADMIN` - Administrative operations such as deleting or restoring students and reopening finalized attendance sessions.
- `TEACHER` - Day-to-day student and attendance workflows permitted by the service layer.

Server-side session and role helpers live in [src/lib/auth-server.ts](src/lib/auth-server.ts). Never commit `.env`, database URLs, auth secrets, or local credential files.

## API Surface

The App Router exposes route handlers for:

- Better Auth at `/api/auth/[...all]`
- Students, restoration, movement, and section lookup under `/api/students`
- Attendance sessions and records under `/api/attendance`
- SF2 reports under `/api/reports/sf2`

The API layer is implemented under [src/app/api](src/app/api).

## Current Implementation Notes

The project is in an active migration toward the Prisma-backed architecture. The newer student and attendance APIs use Prisma repositories and services, while selected dashboard pages and server actions still query Supabase directly. The files [dbCreation.txt](dbCreation.txt) and [Add RLS policies.txt](Add%20RLS%20policies.txt) describe an older Supabase-oriented schema and should not be treated as a replacement for the current Prisma schema without verification.

Before deploying, verify that the Supabase-backed workflows and their RLS policies are aligned with Better Auth sessions and the current database model. Also review [BACKLOG.md](BACKLOG.md) for unfinished authorization, audit, import, and portal work.

## Project Layout

```text
src/app/          Pages, layouts, route handlers, and server actions
src/components/   Reusable UI components
src/lib/           Auth, Prisma, Supabase, validation, and reporting utilities
src/repositories/ Database access abstractions
src/services/     Business logic and authorization
src/validators/   Zod validation schemas
prisma/           Schema, migrations, and seed
docs/             Database and ERD documentation
```

## Contributing

Before opening a pull request:

```bash
npm run type-check
npm run lint
npm run build
```

Keep business logic in services, database logic in repositories, and secrets in environment variables. Update migrations and relevant documentation whenever the data model changes.