# Attendify Migration Roadmap

## Goal

Transform Attendify from:

- Next.js
- Supabase
- Supabase Auth
- Supabase Database

into

- Next.js
- Neon PostgreSQL
- Prisma
- Better Auth

without changing the UI or user experience.

---

# Rules

- Never redesign pages.
- Never remove features.
- Keep filenames when possible.
- Preserve existing routing.
- Remove Supabase completely after each feature is migrated.
- Always keep the project runnable.

---

# Tech Stack

Frontend

- Next.js 16
- React
- TypeScript
- Tailwind CSS

Backend

- Route Handlers

Database

- Neon PostgreSQL

ORM

- Prisma

Authentication

- Better Auth

Validation

- Zod

Password

- bcrypt

---

# Folder Structure

src/

app/

components/

lib/
prisma.ts
auth.ts
validation.ts

services/

repositories/

types/

utils/

middlewares/

---

# Migration Order

## Phase 1

- Install Prisma
- Configure Neon
- Configure Better Auth
- Configure Zod
- Configure bcrypt

---

## Phase 2

Create Prisma schema.

Models

- User
- Teacher
- Student
- Section
- Attendance
- AttendanceRecord
- Subject
- SchoolYear

---

## Phase 3

Database migration and seeding

- Review the generated migration SQL
- Apply Prisma migrations to Neon PostgreSQL
- Seed the initial administrator and reference data
- Verify database constraints and indexes

---

## Phase 4

Authentication

- Login
- Logout
- Session
- Register

---

## Phase 5

Core Data Layer

- repositories
- services
- API response helpers
- error handling

---

## Phase 6

Student module

---

## Phase 7

Teacher Module

---

## Phase 8

Attendance

---

## Phase 9

QR Attendance

---

## Phase 10

Reports

- SF2


---

## Phase 11

Deployment



# After every phase

Run

npm run lint

npm run type-check

npm run build

Fix all errors before continuing.

---

# Completion Criteria

Every phase must:

- compile
- pass lint
- preserve existing functionality

before moving to the next phase.
