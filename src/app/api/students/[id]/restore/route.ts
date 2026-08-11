import { NextRequest } from "next/server";

import { errorResponse, json } from "@/lib/api";
import { getAuthorizedUser } from "@/lib/auth-server";
import { UnauthorizedError } from "@/lib/errors";
import { studentService } from "@/services/student.service";
import { studentIdSchema } from "@/validators/student.validator";
import { parseOrThrow } from "@/utils/validation";

interface RestoreStudentContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, context: RestoreStudentContext) {
  try {
    const user = await getAuthorizedUser();
    if (!user) throw new UnauthorizedError();
    return json(await studentService.restore(parseOrThrow(studentIdSchema, (await context.params).id), { actorId: user.id, role: user.role ?? "", requestId: request.headers.get("x-request-id") ?? undefined }), "Student restored.");
  } catch (error) {
    return errorResponse(error);
  }
}
