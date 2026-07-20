import { createClient } from "@/lib/supabase/server";
import { getPhilippineDate } from "@/lib/date";

import { redirect } from "next/navigation";

import AttendanceTable from "./AttendanceTable";
import FinalizeAttendanceButton from "./FinalizeAttendanceButton";

interface AttendancePageProps {
  searchParams: Promise<{
    date?: string;
  }>;
}

export default async function AttendancePage({
  searchParams,
}: AttendancePageProps) {
  const { date } = await searchParams;

  const selectedDate = date || getPhilippineDate();

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: section } = await supabase
    .from("sections")
    .select("id, name")
    .eq("adviser_id", user.id)
    .limit(1)
    .maybeSingle();

  // ADD THIS HERE
  const { data: attendanceDay } = section
    ? await supabase
        .from("attendance_days")
        .select("is_finalized, finalized_at")
        .eq("section_id", section.id)
        .eq("attendance_date", selectedDate)
        .maybeSingle()
    : { data: null };

  const { data: students, error } = await supabase
    .from("students")
    .select(
      `
      id,
      first_name,
      middle_name,
      last_name,
      sex,
      attendance_records (
        id,
        status,
        scanned_at
      )
    `,
    )
    .eq("is_active", true)
    .eq("attendance_records.attendance_date", selectedDate)
    .order("sex", {
      ascending: false,
    })
    .order("last_name", {
      ascending: true,
    });

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold">Attendance</h1>

        <p className="mt-4 text-red-500">
          Failed to load attendance: {error.message}
        </p>
      </div>
    );
  }

  const attendanceData = (students ?? []).map((student) => ({
    id: student.id,

    name: [student.last_name, student.first_name, student.middle_name]
      .filter(Boolean)
      .join(", "),

    sex: student.sex,

    attendance: student.attendance_records?.[0] ?? null,
  }));

  const presentCount = attendanceData.filter(
    (student) => student.attendance?.status === "present",
  ).length;

  const lateCount = attendanceData.filter(
    (student) => student.attendance?.status === "late",
  ).length;

  const absentCount = attendanceData.filter(
    (student) => student.attendance?.status === "absent",
  ).length;

  const excusedCount = attendanceData.filter(
    (student) => student.attendance?.status === "excused",
  ).length;

  const notRecordedCount = attendanceData.filter(
    (student) => !student.attendance,
  ).length;

  return (
    <div>
      <div>
        <h1 className="text-3xl font-bold">Attendance</h1>

        <p className="mt-1 text-gray-500">
          Review and manage daily attendance.
        </p>
      </div>

      <form className="mt-6">
        <label htmlFor="date" className="text-sm font-medium">
          Attendance Date
        </label>

        <div className="mt-2 flex gap-3">
          <input
            id="date"
            name="date"
            type="date"
            defaultValue={selectedDate}
            className="rounded-lg border bg-white px-4 py-2"
          />

          <button
            type="submit"
            className="rounded-lg bg-black px-5 py-2 text-sm font-medium text-white"
          >
            View
          </button>
        </div>
      </form>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <SummaryCard label="Present" value={presentCount} />

        <SummaryCard label="Late" value={lateCount} />

        <SummaryCard label="Absent" value={absentCount} />

        <SummaryCard label="Excused" value={excusedCount} />

        <SummaryCard label="Not Recorded" value={notRecordedCount} />
      </div>

      {section && (
        <div className="mt-6 flex items-center justify-between rounded-xl border bg-white p-5">
          <div>
            <p className="font-medium">Daily Attendance Status</p>

            <p className="mt-1 text-sm text-gray-500">
              {attendanceDay?.is_finalized
                ? "Attendance has been finalized for this date."
                : `${notRecordedCount} student(s) have not been recorded.`}
            </p>
          </div>

          <FinalizeAttendanceButton
            sectionId={section.id}
            selectedDate={selectedDate}
            isFinalized={attendanceDay?.is_finalized ?? false}
            notRecordedCount={notRecordedCount}
          />
        </div>
      )}

      <AttendanceTable students={attendanceData} selectedDate={selectedDate} />
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <p className="text-sm text-gray-500">{label}</p>

      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
