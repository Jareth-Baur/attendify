import { EnrollmentEntryType, EnrollmentExitType, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { StudentInput, StudentListQuery } from "@/types/student";

const studentSelect = {
  id: true,
  lrn: true,
  firstName: true,
  middleName: true,
  lastName: true,
  birthDate: true,
  sex: true,
  guardianName: true,
  guardianContact: true,
  contactEmail: true,
  qrToken: true,
  deletedAt: true,
  enrollments: {
    orderBy: { enrolledOn: "desc" },
    include: { section: { include: { schoolYear: { select: { name: true } } } } },
  },
} satisfies Prisma.StudentSelect;

export class StudentRepository {
  async findById(id: string) {
    return prisma.student.findFirst({ where: { id, deletedAt: null }, select: studentSelect });
  }

  async findSection(id: string) {
    return prisma.section.findFirst({ where: { id, deletedAt: null, schoolYear: { status: "ACTIVE", deletedAt: null } }, select: { id: true } });
  }

  async findSections() {
    return prisma.section.findMany({ where: { deletedAt: null, schoolYear: { status: "ACTIVE", deletedAt: null } }, select: { id: true, name: true, gradeLevel: true, schoolYear: { select: { name: true } } }, orderBy: [{ gradeLevel: "asc" }, { name: "asc" }] });
  }

  async findMany(query: StudentListQuery) {
    const where = this.buildWhere(query);
    const [students, total] = await prisma.$transaction([
      prisma.student.findMany({ where, select: studentSelect, orderBy: this.getOrderBy(query), skip: (query.page - 1) * query.pageSize, take: query.pageSize }),
      prisma.student.count({ where }),
    ]);

    return { students, total };
  }

  async create(input: StudentInput, actorId: string) {
    const studentId = await prisma.$transaction(async (transaction) => {
      const { sectionId, ...studentData } = input;
      const student = await transaction.student.create({ data: { ...studentData, createdById: actorId, updatedById: actorId }, select: { id: true } });
      await transaction.enrollment.create({ data: { studentId: student.id, sectionId, enrolledOn: new Date(), entryType: EnrollmentEntryType.INITIAL_ENROLLMENT, createdById: actorId, updatedById: actorId } });
      return student.id;
    });
    return this.findById(studentId);
  }

  async update(id: string, input: StudentInput, actorId: string) {
    const studentId = await prisma.$transaction(async (transaction) => {
      const { sectionId, ...studentData } = input;
      const activeEnrollment = await transaction.enrollment.findFirst({ where: { studentId: id, endedOn: null }, select: { id: true, sectionId: true } });
      await transaction.student.update({ where: { id }, data: { ...studentData, updatedById: actorId } });
      if (activeEnrollment && activeEnrollment.sectionId !== sectionId) {
        await transaction.enrollment.update({ where: { id: activeEnrollment.id }, data: { endedOn: new Date(), exitType: EnrollmentExitType.TRANSFERRED_OUT, updatedById: actorId } });
        await transaction.enrollment.create({ data: { studentId: id, sectionId, enrolledOn: new Date(), entryType: EnrollmentEntryType.TRANSFERRED_IN, createdById: actorId, updatedById: actorId } });
      }
      if (!activeEnrollment) await transaction.enrollment.create({ data: { studentId: id, sectionId, enrolledOn: new Date(), entryType: EnrollmentEntryType.TRANSFERRED_IN, createdById: actorId, updatedById: actorId } });
      return id;
    });
    return this.findById(studentId);
  }

  async softDelete(id: string, actorId: string) {
    const result = await prisma.student.updateMany({ where: { id, deletedAt: null }, data: { deletedAt: new Date(), deletedById: actorId, updatedById: actorId } });
    return result.count;
  }

  async restore(id: string, actorId: string) {
    const result = await prisma.student.updateMany({ where: { id, deletedAt: { not: null } }, data: { deletedAt: null, deletedById: null, updatedById: actorId } });
    return result.count;
  }

  private buildWhere(query: StudentListQuery): Prisma.StudentWhereInput {
    const enrollmentFilter = { section: { deletedAt: null, ...(query.grade ? { gradeLevel: query.grade } : {}), ...(query.sectionId ? { id: query.sectionId } : {}), ...(query.schoolYearId ? { schoolYearId: query.schoolYearId } : {}) } };
    const enrollmentStatus = query.enrollmentStatus === "active" ? { some: { endedOn: null, ...enrollmentFilter } } : query.enrollmentStatus === "inactive" ? { none: { endedOn: null } } : undefined;
    const search = query.search ? { AND: query.search.split(/\s+/).filter(Boolean).map((token) => ({ OR: ["lrn", "firstName", "middleName", "lastName"].map((field) => ({ [field]: { contains: token, mode: "insensitive" } })) })) } : undefined;
    return { deletedAt: null, ...(query.sex ? { sex: query.sex } : {}), ...(search ?? {}), ...(enrollmentStatus ? { enrollments: enrollmentStatus } : {}) };
  }

  private getOrderBy(query: StudentListQuery): Prisma.StudentOrderByWithRelationInput {
    const field = query.sortBy === "lrn" ? "lrn" : query.sortBy === "firstName" ? "firstName" : "lastName";
    return { [field]: query.sortDirection };
  }
}
