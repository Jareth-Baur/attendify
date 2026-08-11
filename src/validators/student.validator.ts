import { z } from "zod";

const nullableTrimmedString = z.string().trim().min(1).max(120).nullable().optional();

export const studentSexSchema = z.enum(["MALE", "FEMALE"]);

export const studentInputSchema = z.object({
  lrn: z.string().trim().regex(/^\d{12}$/).nullable().optional(),
  firstName: z.string().trim().min(1).max(100),
  middleName: nullableTrimmedString,
  lastName: z.string().trim().min(1).max(100),
  birthDate: z.coerce.date().max(new Date()).nullable().optional(),
  sex: studentSexSchema,
  guardianName: nullableTrimmedString,
  guardianContact: z.string().trim().regex(/^\+?[0-9()\-\s]{7,32}$/).nullable().optional(),
  contactEmail: z.string().trim().email().max(320).nullable().optional(),
  sectionId: z.string().uuid(),
});

export const studentListQuerySchema = z.object({
  search: z.string().trim().max(200).optional(),
  grade: z.string().trim().max(100).optional(),
  sectionId: z.string().uuid().optional(),
  sex: studentSexSchema.optional(),
  enrollmentStatus: z.enum(["active", "inactive", "all"]).default("active"),
  schoolYearId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  sortBy: z.enum(["lastName", "firstName", "lrn", "grade", "section"]).default("lastName"),
  sortDirection: z.enum(["asc", "desc"]).default("asc"),
});

export const studentIdSchema = z.string().uuid();
