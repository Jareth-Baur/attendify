import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: schoolYear } = await supabase
    .from("school_years")
    .select("*")
    .eq("is_active", true)
    .maybeSingle();

  const { count: studentCount } = await supabase
    .from("students")
    .select("*", {
      count: "exact",
      head: true,
    });

  const today = new Date()
    .toISOString()
    .split("T")[0];

  const { count: attendanceCount } = await supabase
    .from("attendance_records")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("attendance_date", today);

  return (
    <div>
      <div>
        <h1 className="text-3xl font-bold">
          Dashboard
        </h1>

        <p className="mt-1 text-gray-500">
          School Year{" "}
          {schoolYear?.name ?? "Not configured"}
        </p>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <DashboardCard
          title="Students"
          value={studentCount ?? 0}
        />

        <DashboardCard
          title="Present Today"
          value={attendanceCount ?? 0}
        />

        <DashboardCard
          title="School Year"
          value={schoolYear?.name ?? "N/A"}
        />
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <p className="text-sm text-gray-500">
        {title}
      </p>

      <p className="mt-2 text-3xl font-bold">
        {value}
      </p>
    </div>
  );
}