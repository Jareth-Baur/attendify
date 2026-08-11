import { ConflictError, ForbiddenError, NotFoundError } from "@/lib/errors";
import { StudentRepository } from "@/repositories/student.repository";
import type { StudentDetail, StudentInput, StudentListQuery, StudentSummary } from "@/types/student";
import { createLogger } from "@/utils/logger";
import type { ServiceContext } from "@/services/base.service";

const logger = createLogger({ service: "StudentService" });

export class StudentService {
  constructor(private readonly repository = new StudentRepository()) {}

  async list(query: StudentListQuery) {
    const { students, total } = await this.repository.findMany(query);
    return { items: students.map((student) => this.toSummary(student)), total, totalPages: Math.ceil(total / query.pageSize), currentPage: query.page };
  }

  async get(id: string) {
    const student = await this.repository.findById(id);
    if (!student) throw new NotFoundError("Student");
    return this.toDetail(student);
  }

  async listSections() {
    return this.repository.findSections();
  }

  async create(input: StudentInput, context: ServiceContext) {
    await this.requireSection(input.sectionId);
    const student = await this.repository.create(input, context.actorId);
    if (!student) throw new NotFoundError("Student");
    logger.info("Student Created", { ...context, studentId: student.id });
    return this.toDetail(student);
  }

  async update(id: string, input: StudentInput, context: ServiceContext) {
    await this.get(id);
    await this.requireSection(input.sectionId);
    const student = await this.repository.update(id, input, context.actorId);
    if (!student) throw new NotFoundError("Student");
    logger.info("Student Updated", { ...context, studentId: id });
    return this.toDetail(student);
  }

  async delete(id: string, context: ServiceContext & { role: string }) {
    this.requireAdmin(context.role);
    const changed = await this.repository.softDelete(id, context.actorId);
    if (!changed) throw new NotFoundError("Active student");
    logger.info("Student Deleted", { ...context, studentId: id });
    return { id };
  }

  async restore(id: string, context: ServiceContext & { role: string }) {
    this.requireAdmin(context.role);
    const changed = await this.repository.restore(id, context.actorId);
    if (!changed) throw new ConflictError("Student is already active or does not exist.");
    logger.info("Student Restored", { ...context, studentId: id });
    return { id };
  }

  private async requireSection(sectionId: string) {
    if (!await this.repository.findSection(sectionId)) throw new NotFoundError("Section");
  }

  private requireAdmin(role: string) {
    if (role !== "ADMIN") throw new ForbiddenError("Only administrators can delete or restore students.");
  }

  private toSummary(student: Awaited<ReturnType<StudentRepository["findById"]>> extends infer T ? Exclude<T, null> : never): StudentSummary {
    const enrollment = student.enrollments.find((item) => item.endedOn === null) ?? student.enrollments[0] ?? null;
    return { id: student.id, lrn: student.lrn, firstName: student.firstName, middleName: student.middleName, lastName: student.lastName, sex: student.sex, deletedAt: student.deletedAt, section: enrollment ? { id: enrollment.section.id, name: enrollment.section.name, gradeLevel: enrollment.section.gradeLevel, schoolYear: enrollment.section.schoolYear.name } : null };
  }

  private toDetail(student: Awaited<ReturnType<StudentRepository["findById"]>> extends infer T ? Exclude<T, null> : never): StudentDetail {
    return { ...this.toSummary(student), birthDate: student.birthDate, guardianName: student.guardianName, guardianContact: student.guardianContact, contactEmail: student.contactEmail, qrToken: student.qrToken, enrollments: student.enrollments.map((item) => ({ id: item.id, enrolledOn: item.enrolledOn, endedOn: item.endedOn, section: { id: item.section.id, name: item.section.name, gradeLevel: item.section.gradeLevel, schoolYear: item.section.schoolYear.name } })) };
  }
}

export const studentService = new StudentService();
