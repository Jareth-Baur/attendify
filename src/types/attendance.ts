import type { AttendanceSource, AttendanceStatus } from "@/generated/prisma/enums";

export type AttendanceSessionState = "OPEN" | "FINALIZED";
export type AttendanceRole = "ADMIN" | "TEACHER";

export interface CreateAttendanceSessionInput { sectionId: string; sessionDate: Date; }
export interface AttendanceRecordInput { enrollmentId: string; status: AttendanceStatus; source: AttendanceSource; notes?: string | null; scannedAt?: Date | null; }
export interface AttendanceRecordUpdateInput { status: AttendanceStatus; source: AttendanceSource; notes?: string | null; scannedAt?: Date | null; }
export interface AttendanceSearchQuery { status?: AttendanceStatus; search?: string; page: number; pageSize: number; }
export interface AttendanceActor { actorId: string; role: AttendanceRole; requestId?: string; }
export interface AttendanceSessionListQuery { sessionDate?: Date; sectionId?: string; schoolYearId?: string; page: number; pageSize: number; }
