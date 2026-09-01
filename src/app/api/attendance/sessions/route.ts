import { NextRequest } from "next/server";
import { errorResponse, json } from "@/lib/api";
import { getAuthorizedUser } from "@/lib/auth-server";
import { UnauthorizedError } from "@/lib/errors";
import { attendanceService } from "@/services/attendance.service";
import { createAttendanceSessionSchema } from "@/validators/attendance.validator";
import { attendanceSessionListSchema } from "@/validators/attendance.validator";
import { parseOrThrow } from "@/utils/validation";
import type { AttendanceRole } from "@/types/attendance";

export async function POST(request: NextRequest) {
  try { const user = await getAuthorizedUser(); if (!user) throw new UnauthorizedError(); const input = parseOrThrow(createAttendanceSessionSchema, await request.json()); return json(await attendanceService.createSession(input, { actorId: user.id, role: user.role as AttendanceRole, requestId: request.headers.get("x-request-id") ?? undefined }), "Attendance session created.", { status: 201 }); } catch (error) { return errorResponse(error); }
}

export async function GET(request: NextRequest) {
  try { const user = await getAuthorizedUser(); if (!user) throw new UnauthorizedError(); const query = parseOrThrow(attendanceSessionListSchema, Object.fromEntries(request.nextUrl.searchParams)); return json(await attendanceService.listSessions(query, { actorId: user.id, role: user.role as AttendanceRole }), "Attendance sessions retrieved."); } catch (error) { return errorResponse(error); }
}
