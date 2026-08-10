# Architecture

Pages

↓

Route Handlers

↓

Services

↓

Repositories

↓

Prisma

Never access Prisma directly from React components.

Business logic belongs in services.

Database logic belongs in repositories.

React components should only fetch or submit data.

Use Zod validation everywhere.

Use async/await.

Use strict TypeScript.

No duplicated logic.

Follow SOLID principles.