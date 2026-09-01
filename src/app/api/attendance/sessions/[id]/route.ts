import { NextRequest } from "next/server";
import { errorResponse, json } from "@/lib/api";
import { getAuthorizedUser } from "@/lib/auth-server";
import { UnauthorizedError } from "@/lib/errors";
import { attendanceService } from "@/services/attendance.service";
import { uuidSchema } from "@/validators/attendance.validator";
import { parseOrThrow } from "@/utils/validation";
import type { AttendanceRole } from "@/types/attendance";
interface Context { params: Promise<{ id: string }> }
export async function GET(_: NextRequest, context: Context) { try { const user = await getAuthorizedUser(); if (!user) throw new UnauthorizedError(); return json(await attendanceService.getSession(parseOrThrow(uuidSchema, (await context.params).id), { actorId: user.id, role: user.role as AttendanceRole }), "Attendance session retrieved."); } catch (error) { return errorResponse(error); } }
