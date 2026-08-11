import type { StudentSex } from "@/generated/prisma/enums";

export type StudentSortField = "lastName" | "firstName" | "lrn" | "grade" | "section";
export type SortDirection = "asc" | "desc";
export type EnrollmentStatusFilter = "active" | "inactive" | "all";

export interface StudentInput {
  lrn?: string | null;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  birthDate?: Date | null;
  sex: StudentSex;
  guardianName?: string | null;
  guardianContact?: string | null;
  contactEmail?: string | null;
  sectionId: string;
}

export interface StudentListQuery {
  search?: string;
  grade?: string;
  sectionId?: string;
  sex?: StudentSex;
  enrollmentStatus?: EnrollmentStatusFilter;
  schoolYearId?: string;
  page: number;
  pageSize: number;
  sortBy: StudentSortField;
  sortDirection: SortDirection;
}

export interface StudentSummary {
  id: string;
  lrn: string | null;
  firstName: string;
  middleName: string | null;
  lastName: string;
  sex: StudentSex;
  deletedAt: Date | null;
  section: { id: string; name: string; gradeLevel: string; schoolYear: string } | null;
}

export interface StudentDetail extends StudentSummary {
  birthDate: Date | null;
  guardianName: string | null;
  guardianContact: string | null;
  contactEmail: string | null;
  qrToken: string;
  enrollments: Array<{
    id: string;
    enrolledOn: Date;
    endedOn: Date | null;
    section: { id: string; name: string; gradeLevel: string; schoolYear: string };
  }>;
}
