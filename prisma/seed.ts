import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import {
  AttendanceSessionStatus,
  AttendanceSource,
  AttendanceStatus,
  EnrollmentEntryType,
  PrismaClient,
  SchoolYearStatus,
  StudentSex,
  UserRole,
} from "../src/generated/prisma/client";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl?.startsWith("postgresql:")) {
  throw new Error("DATABASE_URL must be a standard PostgreSQL connection URL.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

const studentSeeds = [
  ["Mabini", "106000000001", "Angelo", null, "Reyes", StudentSex.MALE],
  ["Mabini", "106000000002", "Bianca", null, "Santos", StudentSex.FEMALE],
  ["Mabini", "106000000003", "Carlo", null, "Villanueva", StudentSex.MALE],
  ["Mabini", "106000000004", "Danica", null, "Flores", StudentSex.FEMALE],
  ["Mabini", "106000000005", "Emilio", null, "Garcia", StudentSex.MALE],
  ["Mabini", "106000000006", "Faith", null, "Ramos", StudentSex.FEMALE],
  ["Mabini", "106000000007", "Gabriel", null, "Navarro", StudentSex.MALE],
  ["Mabini", "106000000008", "Hazel", null, "Mendoza", StudentSex.FEMALE],
  ["Mabini", "106000000009", "Ivan", null, "Bautista", StudentSex.MALE],
  ["Mabini", "106000000010", "Jasmine", null, "Aquino", StudentSex.FEMALE],
  ["Bonifacio", "106000000011", "Kent", null, "De Guzman", StudentSex.MALE],
  ["Bonifacio", "106000000012", "Lara", "Mae", "Castillo", StudentSex.FEMALE],
  ["Bonifacio", "106000000013", "Miguel", "Antonio", "Cruz", StudentSex.MALE],
  ["Bonifacio", "106000000014", "Nina", "Mae", "Torres", StudentSex.FEMALE],
  ["Bonifacio", "106000000015", "Paolo", "Lorenzo", "Mercado", StudentSex.MALE],
  ["Bonifacio", "106000000016", "Queenie", "Mae", "Salazar", StudentSex.FEMALE],
  ["Bonifacio", "106000000017", "Rafael", null, "Domingo", StudentSex.MALE],
  ["Bonifacio", "106000000018", "Sofia", null, "Reyes", StudentSex.FEMALE],
  ["Bonifacio", "106000000019", "Tristan", null, "Valdez", StudentSex.MALE],
  ["Bonifacio", "106000000020", "Yna", null, "Villareal", StudentSex.FEMALE],
  ["Rizal", "106000000021", "Adrian", null, "Manalo", StudentSex.MALE],
  ["Rizal", "106000000022", "Clarisse", null, "Evangelista", StudentSex.FEMALE],
  ["Rizal", "106000000023", "Diego", null, "Fernandez", StudentSex.MALE],
  ["Rizal", "106000000024", "Erika", null, "Lopez", StudentSex.FEMALE],
  ["Rizal", "106000000025", "Francis", null, "Javier", StudentSex.MALE],
  ["Rizal", "106000000026", "Gia", null, "Morales", StudentSex.FEMALE],
  ["Rizal", "106000000027", "Harold", null, "Pascual", StudentSex.MALE],
  ["Rizal", "106000000028", "Isabel", null, "Soriano", StudentSex.FEMALE],
  ["Rizal", "106000000029", "Joshua", null, "Dela Pena", StudentSex.MALE],
  ["Rizal", "106000000030", "Katrina", null, "Pineda", StudentSex.FEMALE],
] as const;

const subjectSeeds = [
  ["FIL-7", "Filipino"],
  ["ENG-7", "English"],
  ["MAT-7", "Mathematics"],
  ["SCI-7", "Science"],
  ["AP-7", "Araling Panlipunan"],
  ["MAPEH-7", "MAPEH"],
] as const;

const enrollmentDate = new Date("2026-06-15T00:00:00.000Z");
const sessionDates = [
  new Date("2026-08-03T00:00:00.000Z"),
  new Date("2026-08-04T00:00:00.000Z"),
  new Date("2026-08-05T00:00:00.000Z"),
] as const;

async function upsertUser(name: string, email: string, role: UserRole) {
  return prisma.user.upsert({
    where: { email },
    update: { name, role },
    create: { name, email, role, emailVerified: true },
  });
}

async function seedTeachers(adminId: string) {
  const teacherUsers = await Promise.all([
    upsertUser("Maria Lourdes Santiago", "maria.santiago@attendify.test", UserRole.TEACHER),
    upsertUser("Jose Manuel Villanueva", "jose.villanueva@attendify.test", UserRole.TEACHER),
    upsertUser("Rochelle Mae Garcia", "rochelle.garcia@attendify.test", UserRole.TEACHER),
  ]);

  await Promise.all(
    teacherUsers.map((teacher) =>
      prisma.teacher.upsert({
        where: { userId: teacher.id },
        update: { updatedById: adminId, deletedAt: null, deletedById: null },
        create: { userId: teacher.id, createdById: adminId, updatedById: adminId },
      }),
    ),
  );

  return teacherUsers;
}

async function seedSections(schoolYearId: string, teacherIds: string[], adminId: string) {
  const names = ["Mabini", "Bonifacio", "Rizal"];

  return Promise.all(
    names.map((name, index) =>
      prisma.section.upsert({
        where: { schoolYearId_name: { schoolYearId, name } },
        update: { adviserId: teacherIds[index], updatedById: adminId, deletedAt: null, deletedById: null },
        create: {
          name,
          gradeLevel: "Grade 7",
          schoolYearId,
          adviserId: teacherIds[index],
          createdById: adminId,
          updatedById: adminId,
        },
      }),
    ),
  );
}

async function seedSubjects(adminId: string) {
  return Promise.all(
    subjectSeeds.map(([code, name]) =>
      prisma.subject.upsert({
        where: { code },
        update: { name, updatedById: adminId, deletedAt: null, deletedById: null },
        create: { code, name, createdById: adminId, updatedById: adminId },
      }),
    ),
  );
}

async function seedAssignments(sectionIds: string[], subjectIds: string[], teacherIds: string[], adminId: string) {
  const pairs = [
    [0, 0, 0], [0, 1, 0], [1, 2, 1], [1, 3, 1], [2, 4, 2], [2, 5, 2],
  ] as const;

  await Promise.all(
    pairs.map(([sectionIndex, subjectIndex, teacherIndex]) =>
      prisma.teachingAssignment.upsert({
        where: {
          sectionId_subjectId_teacherId: {
            sectionId: sectionIds[sectionIndex],
            subjectId: subjectIds[subjectIndex],
            teacherId: teacherIds[teacherIndex],
          },
        },
        update: { updatedById: adminId, deletedAt: null, deletedById: null },
        create: {
          sectionId: sectionIds[sectionIndex],
          subjectId: subjectIds[subjectIndex],
          teacherId: teacherIds[teacherIndex],
          createdById: adminId,
          updatedById: adminId,
        },
      }),
    ),
  );
}

async function seedEnrollments(sectionIds: Record<string, string>, adminId: string) {
  const enrollmentIds: Record<string, string[]> = { Mabini: [], Bonifacio: [], Rizal: [] };

  for (const [sectionName, lrn, firstName, middleName, lastName, sex] of studentSeeds) {
    const student = await prisma.student.upsert({
      where: { lrn },
      update: { firstName, middleName, lastName, sex, updatedById: adminId, deletedAt: null, deletedById: null },
      create: { lrn, firstName, middleName, lastName, sex, createdById: adminId, updatedById: adminId },
    });
    const enrollment = await prisma.enrollment.upsert({
      where: { studentId_sectionId_enrolledOn: { studentId: student.id, sectionId: sectionIds[sectionName], enrolledOn: enrollmentDate } },
      update: { updatedById: adminId, endedOn: null, exitType: null },
      create: {
        studentId: student.id,
        sectionId: sectionIds[sectionName],
        enrolledOn: enrollmentDate,
        entryType: EnrollmentEntryType.INITIAL_ENROLLMENT,
        createdById: adminId,
        updatedById: adminId,
      },
    });
    enrollmentIds[sectionName].push(enrollment.id);
  }

  return enrollmentIds;
}

async function seedAttendance(sectionIds: Record<string, string>, enrollmentIds: Record<string, string[]>, teacherIds: string[]) {
  const sections = ["Mabini", "Bonifacio", "Rizal"] as const;
  const statuses = [
    AttendanceStatus.PRESENT, AttendanceStatus.PRESENT, AttendanceStatus.LATE, AttendanceStatus.PRESENT, AttendanceStatus.ABSENT,
    AttendanceStatus.PRESENT, AttendanceStatus.PRESENT, AttendanceStatus.EXCUSED, AttendanceStatus.PRESENT, AttendanceStatus.PRESENT,
  ];

  for (const [index, sectionName] of sections.entries()) {
    const session = await prisma.attendanceSession.upsert({
      where: { sectionId_sessionDate: { sectionId: sectionIds[sectionName], sessionDate: sessionDates[index] } },
      update: { status: AttendanceSessionStatus.FINALIZED, updatedById: teacherIds[index], finalizedAt: sessionDates[index], finalizedById: teacherIds[index] },
      create: {
        sectionId: sectionIds[sectionName],
        sessionDate: sessionDates[index],
        status: AttendanceSessionStatus.FINALIZED,
        createdById: teacherIds[index],
        updatedById: teacherIds[index],
        finalizedAt: sessionDates[index],
        finalizedById: teacherIds[index],
      },
    });

    await Promise.all(
      enrollmentIds[sectionName].map((enrollmentId, studentIndex) => {
        const status = statuses[studentIndex];
        const scannedAt = status === AttendanceStatus.PRESENT || status === AttendanceStatus.LATE
          ? new Date(`${sessionDates[index].toISOString().slice(0, 10)}T00:${String(5 + studentIndex).padStart(2, "0")}:00.000Z`)
          : null;

        return prisma.attendanceRecord.upsert({
          where: { attendanceSessionId_enrollmentId: { attendanceSessionId: session.id, enrollmentId } },
          update: { status, source: scannedAt ? AttendanceSource.QR_SCAN : AttendanceSource.FINALIZATION, scannedAt, updatedById: teacherIds[index] },
          create: {
            attendanceSessionId: session.id,
            enrollmentId,
            status,
            source: scannedAt ? AttendanceSource.QR_SCAN : AttendanceSource.FINALIZATION,
            scannedAt,
            recordedById: teacherIds[index],
            updatedById: teacherIds[index],
          },
        });
      }),
    );
  }
}

async function main() {
  const admin = await upsertUser("Luzviminda Mercado", "luzviminda.mercado@attendify.test", UserRole.ADMIN);
  const teachers = await seedTeachers(admin.id);
  const schoolYear = await prisma.schoolYear.upsert({
    where: { name: "2026-2027" },
    update: { startDate: new Date("2026-06-08T00:00:00.000Z"), endDate: new Date("2027-04-09T00:00:00.000Z"), status: SchoolYearStatus.ACTIVE, updatedById: admin.id, deletedAt: null, deletedById: null },
    create: {
      name: "2026-2027",
      startDate: new Date("2026-06-08T00:00:00.000Z"),
      endDate: new Date("2027-04-09T00:00:00.000Z"),
      status: SchoolYearStatus.ACTIVE,
      createdById: admin.id,
      updatedById: admin.id,
    },
  });
  const sections = await seedSections(schoolYear.id, teachers.map((teacher) => teacher.id), admin.id);
  const subjects = await seedSubjects(admin.id);
  await seedAssignments(sections.map((section) => section.id), subjects.map((subject) => subject.id), teachers.map((teacher) => teacher.id), admin.id);
  const sectionIds = Object.fromEntries(sections.map((section) => [section.name, section.id]));
  const enrollmentIds = await seedEnrollments(sectionIds, admin.id);
  await seedAttendance(sectionIds, enrollmentIds, teachers.map((teacher) => teacher.id));
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
