import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import ManageStudentStatus from "@/components/students/ManageStudentStatus";

function firstOrNull<T>(value: T | T[] | null) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
}

type StatusFilter = "active" | "inactive" | "all";

interface StudentsPageProps {
  searchParams: Promise<{
    status?: string;
  }>;
}

export default async function StudentsPage({
  searchParams,
}: StudentsPageProps) {
  const params = await searchParams;

  /*
   * =========================
   * STATUS FILTER
   * =========================
   */

  const status: StatusFilter =
    params.status === "inactive" || params.status === "all"
      ? params.status
      : "active";

  /*
   * =========================
   * SUPABASE
   * =========================
   */

  const supabase = await createClient();

  let query = supabase
    .from("students")
    .select(
      `
        id,
        lrn,
        first_name,
        middle_name,
        last_name,
        sex,
        is_active,
        created_at,
        sections (
          name,
          grade_level
        )
      `,
    )
    .order("last_name", {
      ascending: true,
    });

  /*
   * Only apply is_active filter
   * when Active or Inactive
   * is selected.
   */

  if (status === "active") {
    query = query.eq("is_active", true);
  }

  if (status === "inactive") {
    query = query.eq("is_active", false);
  }

  const { data: students, error } = await query;

  /*
   * =========================
   * ERROR
   * =========================
   */

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold">Students</h1>

        <p className="mt-4 text-red-500">
          Failed to load students: {error.message}
        </p>
      </div>
    );
  }

  /*
   * =========================
   * PAGE
   * =========================
   */

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Students</h1>

          <p className="mt-1 text-gray-500">Manage registered students.</p>
        </div>

        <Link
          href="/dashboard/students/new"
          className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white"
        >
          Add Student
        </Link>
      </div>

      {/* =====================
          STATUS TABS
      ===================== */}

      <div className="mt-8 flex gap-2 border-b">
        <Link
          href="/dashboard/students?status=active"
          className={`border-b-2 px-4 py-3 text-sm font-medium ${
            status === "active"
              ? "border-black text-black"
              : "border-transparent text-gray-500 hover:text-black"
          }`}
        >
          Active
        </Link>

        <Link
          href="/dashboard/students?status=inactive"
          className={`border-b-2 px-4 py-3 text-sm font-medium ${
            status === "inactive"
              ? "border-black text-black"
              : "border-transparent text-gray-500 hover:text-black"
          }`}
        >
          Inactive
        </Link>

        <Link
          href="/dashboard/students?status=all"
          className={`border-b-2 px-4 py-3 text-sm font-medium ${
            status === "all"
              ? "border-black text-black"
              : "border-transparent text-gray-500 hover:text-black"
          }`}
        >
          All
        </Link>
      </div>

      {/* =====================
          STUDENT TABLE
      ===================== */}

      <div className="mt-6 overflow-hidden rounded-xl border bg-white">
        {students.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-gray-500">
              {status === "active" && "No active students."}

              {status === "inactive" && "No inactive students."}

              {status === "all" && "No students registered yet."}
            </p>

            {status === "active" && (
              <Link
                href="/dashboard/students/new"
                className="mt-4 inline-block font-medium underline"
              >
                Register a student
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm">LRN</th>

                  <th className="px-6 py-4 text-left text-sm">Student</th>

                  <th className="px-6 py-4 text-left text-sm">Sex</th>

                  <th className="px-6 py-4 text-left text-sm">Section</th>

                  <th className="px-6 py-4 text-left text-sm">Status</th>

                  <th className="px-6 py-4 text-right text-sm">Actions</th>
                </tr>
              </thead>

              <tbody>
                {students.map((student) => {
                  const studentName = `${student.last_name}, ${student.first_name}${
                    student.middle_name ? ` ${student.middle_name}` : ""
                  }`;

                  return (
                    <tr key={student.id} className="border-b last:border-0">
                      <td className="px-6 py-4 text-sm">
                        {student.lrn ?? "—"}
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-medium">{studentName}</p>
                      </td>

                      <td className="px-6 py-4 text-sm capitalize">
                        {student.sex}
                      </td>

                      <td className="px-6 py-4 text-sm">
                        {firstOrNull(student.sections)?.name ?? "—"}
                      </td>

                      {/* STATUS */}

                      <td className="px-6 py-4">
                        {student.is_active ? (
                          <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* ACTIONS */}

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-4">
                          <Link
                            href={`/dashboard/students/${student.id}`}
                            className="text-sm font-medium underline"
                          >
                            View
                          </Link>

                          <ManageStudentStatus
                            studentId={student.id}
                            studentName={studentName}
                            isActive={student.is_active}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
