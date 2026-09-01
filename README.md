# Attendify

Attendify is a school attendance management system for teachers and administrators. It combines student records, enrollment history, QR-based attendance capture, attendance review, school-calendar exceptions, and SF2 report generation in one web application.

## What It Does

- Manage student profiles, enrollment history, and generated QR tokens.
- Record attendance manually or by scanning student QR codes.
- Open, review, finalize, and, when authorized, reopen attendance sessions.
- Generate printable QR cards for active students.
- Review monthly attendance and export SF2 Excel reports.
- Manage school years, sections, subjects, teaching assignments, and calendar events.
- Support `ADMIN` and `TEACHER` roles with server-side authorization checks.

## Technology

- Next.js 16 App Router and React 19
- TypeScript with strict checking
- PostgreSQL and Prisma ORM 7
- `@prisma/adapter-pg` for PostgreSQL connectivity
- Better Auth for email/password authentication and sessions
- Supabase client utilities used by selected existing dashboard workflows
- Zod validation
- Tailwind CSS 4
- ExcelJS for report generation
- `html5-qrcode` for browser-based QR scanning

## Requirements

- Node.js 20 or newer
- npm
- PostgreSQL database

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create `.env` in the project root. Keep real credentials out of Git.

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
BETTER_AUTH_SECRET="a-long-random-secret"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

`DATABASE_URL`, `BETTER_AUTH_SECRET`, and `BETTER_AUTH_URL` are required for the Prisma and Better Auth paths. The Supabase URL and anon key are required by existing server actions and dashboard pages that still use the Supabase client.

### 3. Generate Prisma Client

```bash
npx prisma generate
```

### 4. Apply the database schema

For a development database:

```bash
npx prisma migrate dev
```

To load the development seed data:

```bash
npx prisma db seed
```

The seed creates representative users, an active school year, sections, subjects, students, enrollments, and finalized attendance sessions. Review [prisma/seed.ts](prisma/seed.ts) before using it against a shared database.

### 5. Start the application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create a production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript without emitting files |

## Application Routes

### Public

- `/` - Product landing page
- `/login` - Sign in
- `/register` - Create an account

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