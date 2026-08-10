# Attendify Database Design

## Conventions

- All identifiers and foreign keys use PostgreSQL UUIDs.
- Domain records use `createdAt` and `updatedAt`. Mutable master data also uses `deletedAt` and `deletedById` for soft deletion.
- `createdById` and `updatedById` provide an accountable audit trail. They restrict deletion of the actor user.
- `Restrict` protects academic and attendance history. `Cascade` is limited to disposable authentication data and a section's dependent teaching assignments.
- Better Auth uses `User`, `Session`, `Account`, and `Verification`; their Prisma model names remain canonical while their database tables are pluralized.

## Models

### User

Authentication identity and authorization role. `email` is unique. It is the parent of Better Auth sessions/accounts and the audit actor for domain records. Account and session rows cascade when a user is deleted; all audit and attendance references restrict deletion to preserve history.

### Session

Better Auth session token storage. `token` is unique; `userId` and `expiresAt` are indexed for session lookup and expiry cleanup. It belongs to one user and cascades from that user.

### Account

Better Auth credential or OAuth-provider account. `[providerId, accountId]` is unique and `userId` is indexed. It belongs to one user and cascades from that user because credentials have no independent business value.

### Verification

Better Auth verification-token storage. `[identifier, value]` is unique and `expiresAt` is indexed for cleanup. It is intentionally independent of a user because verification may precede user creation.

### Teacher

One-to-one domain extension of `User`, enabling sections and teaching assignments to reference verified teaching staff. `userId` is both the primary key and foreign key. Soft deletion is indexed. Deleting the user cascades to its teacher extension, but teacher deletion is restricted while that teacher advises a section or owns a teaching assignment.

### Student

Permanent learner identity. `lrn` and `qrToken` are unique; `[lastName, firstName]` supports roster sorting. It has no direct section column: membership is represented by `Enrollment`, which preserves history. Audit and soft-delete fields are indexed.

### SchoolYear

Academic-year boundary with unique `name` and a `PLANNED`/`ACTIVE`/`CLOSED` status. It is the parent of sections and calendar events. Its status and soft-delete columns are indexed. Sections restrict deletion; calendar events cascade because they have no meaning outside their school year.

### Section

Class grouping within one school year. `[schoolYearId, name]` is unique; adviser and school-year foreign keys are indexed. It belongs to one school year and one teacher, and is the parent of enrollments, attendance sessions, and teaching assignments. Historical enrollments and sessions restrict deletion; teaching assignments cascade.

### Subject

Reusable curriculum subject with unique `code`. It is connected to sections and teachers only through `TeachingAssignment`, avoiding repeated subject details. Soft-delete and audit actor fields are indexed. Assignments restrict subject deletion.

### TeachingAssignment

Normalized three-way relation between one section, subject, and teacher. `[sectionId, subjectId, teacherId]` is unique; subject, teacher, and soft-delete fields are indexed. It exists only while its section exists, so section deletion cascades; subject and teacher deletion are restricted.

### Enrollment

Time-bounded student membership in a section. `[studentId, sectionId, enrolledOn]` is unique; `[sectionId, endedOn]` and `[studentId, enrolledOn]` support active-roster and history queries. `entryType`, `endedOn`, and `exitType` replace duplicated current-status and movement tables. Student and section deletion are restricted; attendance records restrict enrollment deletion.

### AttendanceSession

One daily attendance workflow for a section. `[sectionId, sessionDate]` is unique; `[sessionDate, status]` supports daily reporting. It stores creator, updater, and finalizer audits. Its section and user references restrict deletion because finalized attendance is historical evidence.

### AttendanceRecord

One attendance outcome for an enrolled learner in a session. `[attendanceSessionId, enrollmentId]` is unique, which prevents duplicate daily entries without duplicating `studentId`. Enrollment, recording actor, and updater are indexed. All parents restrict deletion to keep final attendance and SF2 reporting reliable.

### SchoolCalendarEvent

Non-school day or suspension scoped to one school year. `[schoolYearId, eventDate]` is unique; event date, soft-delete, and audit actor fields are indexed. It belongs to a school year and cascades with that year; audit users restrict deletion.

## Database-level checks to add with the migration

Prisma cannot express partial unique indexes or cross-column check constraints. The initial migration should therefore add PostgreSQL constraints for:

- one non-deleted `ACTIVE` school year;
- one active enrollment per student (`endedOn IS NULL`);
- `SchoolYear.endDate > startDate`;
- `Enrollment.endedOn >= enrolledOn`;
- `Enrollment.endedOn` and `exitType` being supplied together;
- `FINALIZED` attendance sessions having both finalization fields populated.
