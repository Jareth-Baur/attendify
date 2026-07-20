import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

function firstOrNull<T>(value: T | T[] | null) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
}

export default async function StudentsPage() {
  const supabase = await createClient();

  const { data: students, error } = await supabase
    .from("students")
    .select(`
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
    `)
    .eq("is_active", true)
    .order("last_name", { ascending: true });

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

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Students
          </h1>

          <p className="mt-1 text-gray-500">
            Manage registered students.
          </p>
        </div>

        <Link
          href="/dashboard/students/new"
          className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white"
        >
          Add Student
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border bg-white">
        {students.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-gray-500">
              No students registered yet.
            </p>

            <Link
              href="/dashboard/students/new"
              className="mt-4 inline-block font-medium underline"
            >
              Register your first student
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm">
                    LRN
                  </th>

                  <th className="px-6 py-4 text-left text-sm">
                    Student
                  </th>

                  <th className="px-6 py-4 text-left text-sm">
                    Sex
                  </th>

                  <th className="px-6 py-4 text-left text-sm">
                    Section
                  </th>

                  <th className="px-6 py-4 text-right text-sm">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {students.map((student) => (
                  <tr
                    key={student.id}
                    className="border-b last:border-0"
                  >
                    <td className="px-6 py-4 text-sm">
                      {student.lrn ?? "—"}
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-medium">
                        {student.last_name},{" "}
                        {student.first_name}{" "}
                        {student.middle_name ?? ""}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-sm capitalize">
                      {student.sex}
                    </td>

                    <td className="px-6 py-4 text-sm">
                      {firstOrNull(student.sections)?.name ?? "—"}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/dashboard/students/${student.id}`}
                        className="text-sm font-medium underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
