import { createClient } from "@/lib/supabase/server";
import { getPhilippineDate } from "@/lib/date";

import MonthlyAttendanceTable from "./MonthlyAttendanceTable";

interface ReportsPageProps {
  searchParams: Promise<{
    month?: string;
  }>;
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const { month } = await searchParams;

  const today = getPhilippineDate();

  const currentMonth = today.slice(0, 7);

  const selectedMonth =
    month && /^\d{4}-\d{2}$/.test(month) ? month : currentMonth;

  const [year, monthNumber] = selectedMonth.split("-").map(Number);

  const daysInMonth = new Date(year, monthNumber, 0).getDate();

  const startDate = `${selectedMonth}-01`;

  const endDate = `${selectedMonth}-${String(daysInMonth).padStart(2, "0")}`;

  const supabase = await createClient();

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
        attendance_date,
        status
      )
    `,
    )
    .eq("is_active", true)
    .gte("attendance_records.attendance_date", startDate)
    .lte("attendance_records.attendance_date", endDate)
    .order("sex", {
      ascending: false,
    })
    .order("last_name", {
      ascending: true,
    });

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>

        <p className="mt-4 text-red-500">
          Failed to load monthly attendance: {error.message}
        </p>
      </div>
    );
  }

  const monthLabel = new Intl.DateTimeFormat("en-PH", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, monthNumber - 1));

  return (
    <div>
      <div>
        <h1 className="text-3xl font-bold">Monthly Attendance</h1>

        <p className="mt-1 text-gray-500">
          Review attendance records before generating the SF2 report.
        </p>
      </div>

      <form className="mt-6">
        <label htmlFor="month" className="text-sm font-medium">
          Select Month
        </label>

        <div className="mt-2 flex gap-3">
          <input
            id="month"
            name="month"
            type="month"
            defaultValue={selectedMonth}
            className="rounded-lg border bg-white px-4 py-2"
          />

          <button
            type="submit"
            className="rounded-lg bg-black px-5 py-2 text-sm font-medium text-white"
          >
            View
          </button>
          <a
            href={`/api/reports/sf2?month=${selectedMonth}`}
            className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white"
          >
            Generate SF2 Excel
          </a>
        </div>
      </form>

      <div className="mt-8">
        <div>
          <h2 className="text-xl font-semibold">{monthLabel}</h2>

          <p className="text-sm text-gray-500">
            {students.length} active students
          </p>
        </div>

        <MonthlyAttendanceTable
          students={students}
          year={year}
          month={monthNumber}
          daysInMonth={daysInMonth}
        />
      </div>
    </div>
  );
}
