import { NextRequest } from "next/server";
import { errorResponse, json } from "@/lib/api";
import { getAuthorizedUser } from "@/lib/auth-server";
import { UnauthorizedError } from "@/lib/errors";
import { attendanceService } from "@/services/attendance.service";
import { attendanceRecordSchema, attendanceSearchSchema, uuidSchema } from "@/validators/attendance.validator";
import { parseOrThrow } from "@/utils/validation";
import type { AttendanceRole } from "@/types/attendance";
interface Context { params: Promise<{ id: string }> }
export async function GET(request: NextRequest, context: Context) { try { const user = await getAuthorizedUser(); if (!user) throw new UnauthorizedError(); const id = parseOrThrow(uuidSchema, (await context.params).id); return json(await attendanceService.records(id, parseOrThrow(attendanceSearchSchema, Object.fromEntries(request.nextUrl.searchParams)), { actorId: user.id, role: user.role as AttendanceRole }), "Attendance records retrieved."); } catch (error) { return errorResponse(error); } }
export async function POST(request: NextRequest, context: Context) { try { const user = await getAuthorizedUser(); if (!user) throw new UnauthorizedError(); const id = parseOrThrow(uuidSchema, (await context.params).id); return json(await attendanceService.record(id, parseOrThrow(attendanceRecordSchema, await request.json()), { actorId: user.id, role: user.role as AttendanceRole, requestId: request.headers.get("x-request-id") ?? undefined }), "Attendance recorded.", { status: 201 }); } catch (error) { return errorResponse(error); } }
