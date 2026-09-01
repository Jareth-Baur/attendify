"use server";

import { getAuthorizedUser } from "@/lib/auth-server";
import { AppError, InternalServerError, UnauthorizedError } from "@/lib/errors";
import { attendanceService } from "@/services/attendance.service";
import type { AttendanceRole } from "@/types/attendance";
import { attendanceRecordSchema, attendanceRecordUpdateSchema, attendanceSessionListSchema, createAttendanceSessionSchema } from "@/validators/attendance.validator";
import { parseOrThrow } from "@/utils/validation";

export async function getAttendanceDashboard(sessionDate: string) { return execute(async () => { const actor = await actorContext(); const query = parseOrThrow(attendanceSessionListSchema, { sessionDate }); return attendanceService.dashboard(query.sessionDate!, actor); }); }
export async function startAttendance(sectionId: string, sessionDate: string) { return execute(async () => attendanceService.createSession(parseOrThrow(createAttendanceSessionSchema, { sectionId, sessionDate }), await actorContext())); }
export async function saveAttendance(sessionId: string, enrollmentId: string, recordId: string | null, status: string) { return execute(async () => { const actor = await actorContext(); if (recordId) return attendanceService.updateRecord(recordId, parseOrThrow(attendanceRecordUpdateSchema, { status, source: "MANUAL", scannedAt: null }), actor); return attendanceService.record(sessionId, parseOrThrow(attendanceRecordSchema, { enrollmentId, status, source: "MANUAL", scannedAt: null }), actor); }); }
export async function finalizeAttendance(sessionId: string) { return execute(async () => attendanceService.finalize(sessionId, await actorContext())); }

async function actorContext() { const user = await getAuthorizedUser(); if (!user) throw new UnauthorizedError(); return { actorId: user.id, role: user.role as AttendanceRole }; }
async function execute<T>(operation: () => Promise<T>) { try { return { success: true as const, data: await operation() }; } catch (error) { const appError = error instanceof AppError ? error : new InternalServerError(); return { success: false as const, status: appError.statusCode, message: appError.message }; } }
