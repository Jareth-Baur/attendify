import { NextRequest } from "next/server";

import { errorResponse, json } from "@/lib/api";
import { getAuthorizedUser } from "@/lib/auth-server";
import { UnauthorizedError } from "@/lib/errors";
import { studentService } from "@/services/student.service";
import { studentIdSchema, studentInputSchema } from "@/validators/student.validator";
import { parseOrThrow } from "@/utils/validation";

interface StudentRouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_: NextRequest, context: StudentRouteContext) {
  try {
    if (!await getAuthorizedUser()) throw new UnauthorizedError();
    return json(await studentService.get(parseOrThrow(studentIdSchema, (await context.params).id)), "Student retrieved.");
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: NextRequest, context: StudentRouteContext) {
  try {
    const user = await getAuthorizedUser();
    if (!user) throw new UnauthorizedError();
    const input = parseOrThrow(studentInputSchema, await request.json());
    return json(await studentService.update(parseOrThrow(studentIdSchema, (await context.params).id), input, { actorId: user.id, requestId: request.headers.get("x-request-id") ?? undefined }), "Student updated.");
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: NextRequest, context: StudentRouteContext) {
  try {
    const user = await getAuthorizedUser();
    if (!user) throw new UnauthorizedError();
    return json(await studentService.delete(parseOrThrow(studentIdSchema, (await context.params).id), { actorId: user.id, role: user.role ?? "", requestId: request.headers.get("x-request-id") ?? undefined }), "Student deleted.");
  } catch (error) {
    return errorResponse(error);
  }
}
