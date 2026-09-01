import { z } from "zod";

export const attendanceStatusSchema = z.enum(["PRESENT", "LATE", "ABSENT", "EXCUSED"]);
export const attendanceSourceSchema = z.enum(["MANUAL", "QR_SCAN", "IMPORT", "API", "NFC_SCAN", "BIOMETRIC"]);
export const uuidSchema = z.string().uuid();
const calendarDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(isCalendarDate, "Invalid calendar date.").transform((value) => new Date(`${value}T00:00:00.000Z`));
export const createAttendanceSessionSchema = z.object({ sectionId: uuidSchema, sessionDate: calendarDateSchema });
export const attendanceRecordSchema = z.object({ enrollmentId: uuidSchema, status: attendanceStatusSchema, source: attendanceSourceSchema.default("MANUAL"), notes: z.string().trim().max(2000).nullable().optional(), scannedAt: z.coerce.date().nullable().optional() });
export const attendanceRecordUpdateSchema = attendanceRecordSchema.omit({ enrollmentId: true });
export const attendanceSearchSchema = z.object({ status: attendanceStatusSchema.optional(), search: z.string().trim().max(200).optional(), page: z.coerce.number().int().min(1).default(1), pageSize: z.coerce.number().int().min(1).max(100).default(25) });
export const attendanceSessionListSchema = z.object({ sessionDate: calendarDateSchema.optional(), sectionId: uuidSchema.optional(), schoolYearId: uuidSchema.optional(), page: z.coerce.number().int().min(1).default(1), pageSize: z.coerce.number().int().min(1).max(100).default(25) });

function isCalendarDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}
