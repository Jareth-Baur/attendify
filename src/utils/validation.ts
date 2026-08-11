import { z } from "zod";

import { ValidationError } from "@/lib/errors";
import { consoleLogger } from "@/utils/logger";

export function parseOrThrow<TOutput>(schema: z.ZodType<TOutput>, input: unknown): TOutput {
  const result = schema.safeParse(input);

  if (result.success) {
    return result.data;
  }

  const details = {
    fields: result.error.flatten().fieldErrors,
  };
  consoleLogger.warn("Validation Errors", details);
  throw new ValidationError("Validation failed.", details);
}

export function normalizePagination(input: { page?: number; pageSize?: number }) {
  const page = Math.max(1, input.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, input.pageSize ?? 25));

  return { page, pageSize, skip: (page - 1) * pageSize };
}
