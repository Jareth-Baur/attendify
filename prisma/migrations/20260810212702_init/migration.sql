-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'TEACHER');

-- CreateEnum
CREATE TYPE "StudentSex" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "SchoolYearStatus" AS ENUM ('PLANNED', 'ACTIVE', 'CLOSED');

-- CreateEnum
CREATE TYPE "EnrollmentEntryType" AS ENUM ('INITIAL_ENROLLMENT', 'TRANSFERRED_IN');

-- CreateEnum
CREATE TYPE "EnrollmentExitType" AS ENUM ('TRANSFERRED_OUT', 'DROPPED_OUT');

-- CreateEnum
CREATE TYPE "AttendanceSessionStatus" AS ENUM ('DRAFT', 'FINALIZED');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED');

-- CreateEnum
CREATE TYPE "AttendanceSource" AS ENUM ('MANUAL', 'QR_SCAN', 'FINALIZATION', 'IMPORT', 'API', 'NFC_SCAN', 'BIOMETRIC');

-- CreateEnum
CREATE TYPE "SchoolCalendarEventType" AS ENUM ('HOLIDAY', 'SUSPENSION', 'SPECIAL_NON_SCHOOL_DAY');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'TEACHER',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" UUID NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMPTZ(3),
    "refreshTokenExpiresAt" TIMESTAMPTZ(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verifications" (
    "id" UUID NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teachers" (
    "userId" UUID NOT NULL,
    "createdById" UUID NOT NULL,
    "updatedById" UUID NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),
    "deletedById" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "teachers_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "students" (
    "id" UUID NOT NULL,
    "lrn" VARCHAR(12),
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "lastName" TEXT NOT NULL,
    "sex" "StudentSex" NOT NULL,
    "qrToken" UUID NOT NULL,
    "createdById" UUID NOT NULL,
    "updatedById" UUID NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),
    "deletedById" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_years" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "status" "SchoolYearStatus" NOT NULL DEFAULT 'PLANNED',
    "createdById" UUID NOT NULL,
    "updatedById" UUID NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),
    "deletedById" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "school_years_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sections" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "gradeLevel" TEXT NOT NULL,
    "schoolYearId" UUID NOT NULL,
    "adviserId" UUID NOT NULL,
    "createdById" UUID NOT NULL,
    "updatedById" UUID NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),
    "deletedById" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subjects" (
    "id" UUID NOT NULL,
    "code" VARCHAR(32) NOT NULL,
    "name" TEXT NOT NULL,
    "createdById" UUID NOT NULL,
    "updatedById" UUID NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),
    "deletedById" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teaching_assignments" (
    "id" UUID NOT NULL,
    "sectionId" UUID NOT NULL,
    "subjectId" UUID NOT NULL,
    "teacherId" UUID NOT NULL,
    "createdById" UUID NOT NULL,
    "updatedById" UUID NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),
    "deletedById" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "teaching_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enrollments" (
    "id" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "sectionId" UUID NOT NULL,
    "enrolledOn" DATE NOT NULL,
    "entryType" "EnrollmentEntryType" NOT NULL DEFAULT 'INITIAL_ENROLLMENT',
    "endedOn" DATE,
    "exitType" "EnrollmentExitType",
    "createdById" UUID NOT NULL,
    "updatedById" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_sessions" (
    "id" UUID NOT NULL,
    "sectionId" UUID NOT NULL,
    "sessionDate" DATE NOT NULL,
    "status" "AttendanceSessionStatus" NOT NULL DEFAULT 'DRAFT',
    "createdById" UUID NOT NULL,
    "updatedById" UUID NOT NULL,
    "finalizedAt" TIMESTAMPTZ(3),
    "finalizedById" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "attendance_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_records" (
    "id" UUID NOT NULL,
    "attendanceSessionId" UUID NOT NULL,
    "enrollmentId" UUID NOT NULL,
    "status" "AttendanceStatus" NOT NULL,
    "source" "AttendanceSource" NOT NULL DEFAULT 'MANUAL',
    "scannedAt" TIMESTAMPTZ(3),
    "notes" TEXT,
    "recordedById" UUID NOT NULL,
    "updatedById" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "attendance_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_calendar_events" (
    "id" UUID NOT NULL,
    "schoolYearId" UUID NOT NULL,
    "eventDate" DATE NOT NULL,
    "type" "SchoolCalendarEventType" NOT NULL,
    "description" TEXT NOT NULL,
    "createdById" UUID NOT NULL,
    "updatedById" UUID NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),
    "deletedById" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "school_calendar_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE INDEX "sessions_expiresAt_idx" ON "sessions"("expiresAt");

-- CreateIndex
CREATE INDEX "accounts_userId_idx" ON "accounts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_providerId_accountId_key" ON "accounts"("providerId", "accountId");

-- CreateIndex
CREATE INDEX "verifications_expiresAt_idx" ON "verifications"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "verifications_identifier_value_key" ON "verifications"("identifier", "value");

-- CreateIndex
CREATE INDEX "teachers_deletedAt_idx" ON "teachers"("deletedAt");

-- CreateIndex
CREATE INDEX "teachers_createdById_idx" ON "teachers"("createdById");

-- CreateIndex
CREATE INDEX "teachers_updatedById_idx" ON "teachers"("updatedById");

-- CreateIndex
CREATE INDEX "teachers_deletedById_idx" ON "teachers"("deletedById");

-- CreateIndex
CREATE UNIQUE INDEX "students_lrn_key" ON "students"("lrn");

-- CreateIndex
CREATE UNIQUE INDEX "students_qrToken_key" ON "students"("qrToken");

-- CreateIndex
CREATE INDEX "students_lastName_firstName_idx" ON "students"("lastName", "firstName");

-- CreateIndex
CREATE INDEX "students_deletedAt_idx" ON "students"("deletedAt");

-- CreateIndex
CREATE INDEX "students_createdById_idx" ON "students"("createdById");

-- CreateIndex
CREATE INDEX "students_updatedById_idx" ON "students"("updatedById");

-- CreateIndex
CREATE INDEX "students_deletedById_idx" ON "students"("deletedById");

-- CreateIndex
CREATE UNIQUE INDEX "school_years_name_key" ON "school_years"("name");

-- CreateIndex
CREATE INDEX "school_years_status_idx" ON "school_years"("status");

-- CreateIndex
CREATE INDEX "school_years_deletedAt_idx" ON "school_years"("deletedAt");

-- CreateIndex
CREATE INDEX "school_years_createdById_idx" ON "school_years"("createdById");

-- CreateIndex
CREATE INDEX "school_years_updatedById_idx" ON "school_years"("updatedById");

-- CreateIndex
CREATE INDEX "school_years_deletedById_idx" ON "school_years"("deletedById");

-- CreateIndex
CREATE INDEX "sections_adviserId_idx" ON "sections"("adviserId");

-- CreateIndex
CREATE INDEX "sections_schoolYearId_idx" ON "sections"("schoolYearId");

-- CreateIndex
CREATE INDEX "sections_deletedAt_idx" ON "sections"("deletedAt");

-- CreateIndex
CREATE INDEX "sections_createdById_idx" ON "sections"("createdById");

-- CreateIndex
CREATE INDEX "sections_updatedById_idx" ON "sections"("updatedById");

-- CreateIndex
CREATE INDEX "sections_deletedById_idx" ON "sections"("deletedById");

-- CreateIndex
CREATE UNIQUE INDEX "sections_schoolYearId_name_key" ON "sections"("schoolYearId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "subjects_code_key" ON "subjects"("code");

-- CreateIndex
CREATE INDEX "subjects_deletedAt_idx" ON "subjects"("deletedAt");

-- CreateIndex
CREATE INDEX "subjects_createdById_idx" ON "subjects"("createdById");

-- CreateIndex
CREATE INDEX "subjects_updatedById_idx" ON "subjects"("updatedById");

-- CreateIndex
CREATE INDEX "subjects_deletedById_idx" ON "subjects"("deletedById");

-- CreateIndex
CREATE INDEX "teaching_assignments_subjectId_idx" ON "teaching_assignments"("subjectId");

-- CreateIndex
CREATE INDEX "teaching_assignments_teacherId_idx" ON "teaching_assignments"("teacherId");

-- CreateIndex
CREATE INDEX "teaching_assignments_deletedAt_idx" ON "teaching_assignments"("deletedAt");

-- CreateIndex
CREATE INDEX "teaching_assignments_createdById_idx" ON "teaching_assignments"("createdById");

-- CreateIndex
CREATE INDEX "teaching_assignments_updatedById_idx" ON "teaching_assignments"("updatedById");

-- CreateIndex
CREATE INDEX "teaching_assignments_deletedById_idx" ON "teaching_assignments"("deletedById");

-- CreateIndex
CREATE UNIQUE INDEX "teaching_assignments_sectionId_subjectId_teacherId_key" ON "teaching_assignments"("sectionId", "subjectId", "teacherId");

-- CreateIndex
CREATE INDEX "enrollments_sectionId_endedOn_idx" ON "enrollments"("sectionId", "endedOn");

-- CreateIndex
CREATE INDEX "enrollments_studentId_enrolledOn_idx" ON "enrollments"("studentId", "enrolledOn");

-- CreateIndex
CREATE INDEX "enrollments_createdById_idx" ON "enrollments"("createdById");

-- CreateIndex
CREATE INDEX "enrollments_updatedById_idx" ON "enrollments"("updatedById");

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_studentId_sectionId_enrolledOn_key" ON "enrollments"("studentId", "sectionId", "enrolledOn");

-- CreateIndex
CREATE INDEX "attendance_sessions_sessionDate_status_idx" ON "attendance_sessions"("sessionDate", "status");

-- CreateIndex
CREATE INDEX "attendance_sessions_createdById_idx" ON "attendance_sessions"("createdById");

-- CreateIndex
CREATE INDEX "attendance_sessions_updatedById_idx" ON "attendance_sessions"("updatedById");

-- CreateIndex
CREATE INDEX "attendance_sessions_finalizedById_idx" ON "attendance_sessions"("finalizedById");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_sessions_sectionId_sessionDate_key" ON "attendance_sessions"("sectionId", "sessionDate");

-- CreateIndex
CREATE INDEX "attendance_records_enrollmentId_idx" ON "attendance_records"("enrollmentId");

-- CreateIndex
CREATE INDEX "attendance_records_recordedById_createdAt_idx" ON "attendance_records"("recordedById", "createdAt");

-- CreateIndex
CREATE INDEX "attendance_records_updatedById_idx" ON "attendance_records"("updatedById");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_records_attendanceSessionId_enrollmentId_key" ON "attendance_records"("attendanceSessionId", "enrollmentId");

-- CreateIndex
CREATE INDEX "school_calendar_events_eventDate_idx" ON "school_calendar_events"("eventDate");

-- CreateIndex
CREATE INDEX "school_calendar_events_deletedAt_idx" ON "school_calendar_events"("deletedAt");

-- CreateIndex
CREATE INDEX "school_calendar_events_createdById_idx" ON "school_calendar_events"("createdById");

-- CreateIndex
CREATE INDEX "school_calendar_events_updatedById_idx" ON "school_calendar_events"("updatedById");

-- CreateIndex
CREATE INDEX "school_calendar_events_deletedById_idx" ON "school_calendar_events"("deletedById");

-- CreateIndex
CREATE UNIQUE INDEX "school_calendar_events_schoolYearId_eventDate_key" ON "school_calendar_events"("schoolYearId", "eventDate");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_years" ADD CONSTRAINT "school_years_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_years" ADD CONSTRAINT "school_years_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_years" ADD CONSTRAINT "school_years_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sections" ADD CONSTRAINT "sections_schoolYearId_fkey" FOREIGN KEY ("schoolYearId") REFERENCES "school_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sections" ADD CONSTRAINT "sections_adviserId_fkey" FOREIGN KEY ("adviserId") REFERENCES "teachers"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sections" ADD CONSTRAINT "sections_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sections" ADD CONSTRAINT "sections_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sections" ADD CONSTRAINT "sections_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teaching_assignments" ADD CONSTRAINT "teaching_assignments_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teaching_assignments" ADD CONSTRAINT "teaching_assignments_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teaching_assignments" ADD CONSTRAINT "teaching_assignments_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teaching_assignments" ADD CONSTRAINT "teaching_assignments_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teaching_assignments" ADD CONSTRAINT "teaching_assignments_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teaching_assignments" ADD CONSTRAINT "teaching_assignments_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_sessions" ADD CONSTRAINT "attendance_sessions_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_sessions" ADD CONSTRAINT "attendance_sessions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_sessions" ADD CONSTRAINT "attendance_sessions_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_sessions" ADD CONSTRAINT "attendance_sessions_finalizedById_fkey" FOREIGN KEY ("finalizedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_attendanceSessionId_fkey" FOREIGN KEY ("attendanceSessionId") REFERENCES "attendance_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "enrollments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_calendar_events" ADD CONSTRAINT "school_calendar_events_schoolYearId_fkey" FOREIGN KEY ("schoolYearId") REFERENCES "school_years"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_calendar_events" ADD CONSTRAINT "school_calendar_events_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_calendar_events" ADD CONSTRAINT "school_calendar_events_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_calendar_events" ADD CONSTRAINT "school_calendar_events_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
