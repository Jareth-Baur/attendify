import { errorResponse, json } from "@/lib/api";
import { getAuthorizedUser } from "@/lib/auth-server";
import { UnauthorizedError } from "@/lib/errors";
import { studentService } from "@/services/student.service";

export async function GET() {
  try {
    if (!await getAuthorizedUser()) throw new UnauthorizedError();
    return json(await studentService.listSections(), "Sections retrieved.");
  } catch (error) {
    return errorResponse(error);
  }
}
