import { NextResponse } from "next/server";

import { AppError, InternalServerError, isAppError } from "@/lib/errors";
import { Prisma } from "@/generated/prisma/client";
import { ConflictError, NotFoundError } from "@/lib/errors";
import { consoleLogger } from "@/utils/logger";
import type { ApiFailure, ApiMeta, ApiResponse, ApiSuccess } from "@/types/api";

export function success<TData>(data: TData, message = "Request completed.", meta?: ApiMeta): ApiSuccess<TData> {
  return meta ? { success: true, data, message, meta } : { success: true, data, message };
}

export function failure(error: AppError, meta?: ApiMeta): ApiFailure {
  const payload = {
    success: false as const,
    error: {
      code: error.code,
      message: error.message,
      details: error.details,
    },
  };

  return meta ? { ...payload, meta } : payload;
}

export function json<TData>(data: TData, message = "Request completed.", init?: ResponseInit, meta?: ApiMeta) {
  return NextResponse.json<ApiResponse<TData>>(success(data, message, meta), init);
}

export function errorResponse(error: unknown, meta?: ApiMeta) {
  const appError = toAppError(error);
  if (!isAppError(error)) consoleLogger.error("Request failed", { error: String(error) });

  return NextResponse.json(failure(appError, meta), { status: appError.statusCode });
}

function toAppError(error: unknown): AppError {
  if (isAppError(error)) return error;
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") return new ConflictError("A student with this LRN already exists.");
    if (error.code === "P2025") return new NotFoundError("Student");
  }
  return new InternalServerError();
}
