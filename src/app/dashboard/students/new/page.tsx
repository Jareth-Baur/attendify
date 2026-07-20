import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export default async function NewStudentPage() {
  const supabase = await createClient();

  const { data: sections } = await supabase
    .from("sections")
    .select(`
      id,
      name,
      grade_level,
      school_years (
        name
      )
    `)
    .order("name");

  async function createStudent(formData: FormData) {
    "use server";

    const supabase = await createClient();

    const lrn =
      formData.get("lrn")?.toString().trim() || null;

    const firstName =
      formData.get("first_name")?.toString().trim();

    const middleName =
      formData.get("middle_name")?.toString().trim() || null;

    const lastName =
      formData.get("last_name")?.toString().trim();

    const sex =
      formData.get("sex")?.toString();

    const sectionId =
      formData.get("section_id")?.toString();

    if (
      !firstName ||
      !lastName ||
      !sex ||
      !sectionId
    ) {
      return;
    }

    const { error } = await supabase
      .from("students")
      .insert({
        lrn,
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        sex,
        section_id: sectionId,
      });

    if (error) {
      console.error(error);
      return;
    }

    redirect("/dashboard/students");
  }

  return (
    <div className="max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">
          Add Student
        </h1>

        <p className="mt-1 text-gray-500">
          Register a new student.
        </p>
      </div>

      <form
        action={createStudent}
        className="mt-8 space-y-6 rounded-xl border bg-white p-6"
      >
        <div>
          <label
            htmlFor="lrn"
            className="block text-sm font-medium"
          >
            LRN
          </label>

          <input
            id="lrn"
            name="lrn"
            type="text"
            inputMode="numeric"
            maxLength={12}
            pattern="[0-9]{12}"
            className="mt-2 w-full rounded-lg border p-3"
            placeholder="12-digit LRN"
          />

          <p className="mt-1 text-xs text-gray-500">
            Optional. Must contain exactly 12 digits.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="first_name"
              className="block text-sm font-medium"
            >
              First Name
            </label>

            <input
              id="first_name"
              name="first_name"
              required
              className="mt-2 w-full rounded-lg border p-3"
            />
          </div>

          <div>
            <label
              htmlFor="middle_name"
              className="block text-sm font-medium"
            >
              Middle Name
            </label>

            <input
              id="middle_name"
              name="middle_name"
              className="mt-2 w-full rounded-lg border p-3"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="last_name"
            className="block text-sm font-medium"
          >
            Last Name
          </label>

          <input
            id="last_name"
            name="last_name"
            required
            className="mt-2 w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label
            htmlFor="sex"
            className="block text-sm font-medium"
          >
            Sex
          </label>

          <select
            id="sex"
            name="sex"
            required
            className="mt-2 w-full rounded-lg border p-3"
          >
            <option value="">
              Select sex
            </option>

            <option value="male">
              Male
            </option>

            <option value="female">
              Female
            </option>
          </select>
        </div>

        <div>
          <label
            htmlFor="section_id"
            className="block text-sm font-medium"
          >
            Section
          </label>

          <select
            id="section_id"
            name="section_id"
            required
            className="mt-2 w-full rounded-lg border p-3"
          >
            <option value="">
              Select section
            </option>

            {sections?.map((section) => (
              <option
                key={section.id}
                value={section.id}
              >
                {section.grade_level
                  ? `${section.grade_level} - `
                  : ""}
                {section.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-3">
          <Link
            href="/dashboard/students"
            className="rounded-lg border px-5 py-3 text-sm font-medium"
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white"
          >
            Add Student
          </button>
        </div>
      </form>
    </div>
  );
}
