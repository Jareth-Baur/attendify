import { createClient } from "@/lib/supabase/server";
import QRCardGrid from "./QRCardGrid";

function firstOrNull<T>(value: T | T[] | null) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
}

export default async function QRCardsPage() {
  const supabase = await createClient();

  const { data: students, error } = await supabase
    .from("students")
    .select(`
      id,
      first_name,
      middle_name,
      last_name,
      qr_token,
      sections (
        name,
        grade_level,
        school_years (
          name
        )
      )
    `)
    .eq("is_active", true)
    .order("last_name", {
      ascending: true,
    });

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold">
          QR Cards
        </h1>

        <p className="mt-4 text-red-500">
          Failed to load students: {error.message}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div>
        <h1 className="text-3xl font-bold">
          QR Cards
        </h1>

        <p className="mt-1 text-gray-500">
          Generate and print attendance QR cards for
          registered students.
        </p>
      </div>

      {students.length === 0 ? (
        <div className="mt-8 rounded-xl border bg-white p-10 text-center">
          <p className="text-gray-500">
            No active students found.
          </p>
        </div>
      ) : (
        <QRCardGrid
          students={students.map((student) => {
            const section = firstOrNull(
              student.sections
            );

            return {
              ...student,
              sections: section
                ? {
                    ...section,
                    school_years: firstOrNull(
                      section.school_years
                    ),
                  }
                : null,
            };
          })}
        />
      )}
    </div>
  );
}
