import { NextRequest } from "next/server";
import { errorResponse, json } from "@/lib/api";
import { getAuthorizedUser } from "@/lib/auth-server";
import { UnauthorizedError } from "@/lib/errors";
import { attendanceService } from "@/services/attendance.service";
import { attendanceRecordUpdateSchema, uuidSchema } from "@/validators/attendance.validator";
import { parseOrThrow } from "@/utils/validation";
import type { AttendanceRole } from "@/types/attendance";
interface Context { params: Promise<{ id: string }> }
export async function PATCH(request: NextRequest, context: Context) { try { const user = await getAuthorizedUser(); if (!user) throw new UnauthorizedError(); return json(await attendanceService.updateRecord(parseOrThrow(uuidSchema, (await context.params).id), parseOrThrow(attendanceRecordUpdateSchema, await request.json()), { actorId: user.id, role: user.role as AttendanceRole, requestId: request.headers.get("x-request-id") ?? undefined }), "Attendance updated."); } catch (error) { return errorResponse(error); } }
export async function DELETE(request: NextRequest, context: Context) { try { const user = await getAuthorizedUser(); if (!user) throw new UnauthorizedError(); return json(await attendanceService.deleteRecord(parseOrThrow(uuidSchema, (await context.params).id), { actorId: user.id, role: user.role as AttendanceRole, requestId: request.headers.get("x-request-id") ?? undefined }), "Attendance deleted."); } catch (error) { return errorResponse(error); } }
