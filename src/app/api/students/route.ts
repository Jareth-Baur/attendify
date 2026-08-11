import { NextRequest } from "next/server";

import { errorResponse, json } from "@/lib/api";
import { getAuthorizedUser } from "@/lib/auth-server";
import { UnauthorizedError } from "@/lib/errors";
import { studentService } from "@/services/student.service";
import { studentInputSchema, studentListQuerySchema } from "@/validators/student.validator";
import { parseOrThrow } from "@/utils/validation";

export async function GET(request: NextRequest) {
  try {
    if (!await getAuthorizedUser()) throw new UnauthorizedError();
    const query = parseOrThrow(studentListQuerySchema, Object.fromEntries(request.nextUrl.searchParams));
    return json(await studentService.list(query), "Students retrieved.");
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthorizedUser();
    if (!user) throw new UnauthorizedError();
    const input = parseOrThrow(studentInputSchema, await request.json());
    return json(await studentService.create(input, { actorId: user.id, requestId: request.headers.get("x-request-id") ?? undefined }), "Student created.", { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
