
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

  const today = new Date().toISOString().split("T")[0];

  const { count: attendanceCount } = await supabase
    .from("attendance_records")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("attendance_date", today);

  const students = studentCount ?? 0;
  const presentToday = attendanceCount ?? 0;

  const attendanceRate =
    students > 0
      ? Math.round((presentToday / students) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-400">
              Overview
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              Dashboard
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Monitor your school attendance and student records.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-900 px-5 py-3">
            <p className="text-xs text-slate-500">
              Active School Year
            </p>

            <p className="mt-1 font-semibold text-slate-200">
              {schoolYear?.name ?? "Not configured"}
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardCard
            title="Total Students"
            value={students}
            description="Registered students"
            icon="ST"
          />

          <DashboardCard
            title="Present Today"
            value={presentToday}
            description="Attendance recorded"
            icon="PR"
          />

          <DashboardCard
            title="Attendance Rate"
            value={`${attendanceRate}%`}
            description="Today's attendance"
            icon="AT"
          />

          <DashboardCard
            title="School Year"
            value={schoolYear?.name ?? "N/A"}
            description="Current academic year"
            icon="SY"
          />
        </div>

        {/* Main Content */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Attendance Overview */}
          <section className="lg:col-span-2 rounded-2xl border border-white/10 bg-slate-900 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Today
                </p>

                <h2 className="mt-1 text-xl font-semibold">
                  Attendance Overview
                </h2>
              </div>

              <div className="rounded-lg bg-blue-500/10 px-3 py-2 text-xs font-medium text-blue-400">
                {attendanceRate}% Attendance
              </div>
            </div>

            {/* Attendance visual */}
            <div className="mt-8 flex items-center gap-8">
              <div className="relative flex h-40 w-40 shrink-0 items-center justify-center rounded-full border-[14px] border-blue-500/20">
                <div className="absolute inset-0 rounded-full border-[14px] border-transparent border-t-blue-500 border-r-blue-500" />

                <div className="text-center">
                  <p className="text-3xl font-bold">
                    {attendanceRate}%
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Present
                  </p>
                </div>
              </div>

              <div className="flex-1 space-y-5">
                <AttendanceStat
                  label="Present"
                  value={presentToday}
                  total={students}
                />

                <AttendanceStat
                  label="Absent"
                  value={Math.max(students - presentToday, 0)}
                  total={students}
                />

                <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all"
                    style={{
                      width: `${attendanceRate}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Quick Actions */}
          <section className="rounded-2xl border border-white/10 bg-slate-900 p-6">
            <div>
              <p className="text-sm text-slate-500">
                Shortcuts
              </p>

              <h2 className="mt-1 text-xl font-semibold">
                Quick Actions
              </h2>
            </div>

            <div className="mt-6 space-y-3">
              <QuickAction
                title="Start Attendance"
                description="Create a new attendance session"
                icon="QR"
                href="/dashboard/attendance"
              />

              <QuickAction
                title="Students"
                description="Manage student records"
                icon="ST"
                href="/dashboard/students"
              />

              <QuickAction
                title="Attendance Records"
                description="View attendance history"
                icon="AT"
                href="/dashboard/attendance/records"
              />

              <QuickAction
                title="Reports"
                description="Generate attendance reports"
                icon="RP"
                href="/dashboard/reports"
              />
            </div>
          </section>
        </div>

        {/* Bottom Section */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Today's Summary */}
          <section className="rounded-2xl border border-white/10 bg-slate-900 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Daily Summary
                </p>

                <h2 className="mt-1 text-xl font-semibold">
                  Today's Attendance
                </h2>
              </div>

              <span className="rounded-full bg-green-400/10 px-3 py-1 text-xs font-medium text-green-400">
                Live
              </span>
            </div>

            <div className="mt-6 space-y-4">
              <SummaryRow
                label="Total Students"
                value={students}
              />

              <SummaryRow
                label="Present"
                value={presentToday}
              />

              <SummaryRow
                label="Absent"
                value={Math.max(students - presentToday, 0)}
              />

              <div className="border-t border-white/10 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">
                    Attendance Rate
                  </span>

                  <span className="font-semibold text-blue-400">
                    {attendanceRate}%
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* System Information */}
          <section className="rounded-2xl border border-white/10 bg-slate-900 p-6">
            <div>
              <p className="text-sm text-slate-500">
                System
              </p>

              <h2 className="mt-1 text-xl font-semibold">
                Attendify Information
              </h2>
            </div>

            <div className="mt-6 space-y-4">
              <InfoRow
                label="School Year"
                value={schoolYear?.name ?? "Not configured"}
              />

              <InfoRow
                label="Students Registered"
                value={students.toString()}
              />

              <InfoRow
                label="Attendance Records Today"
                value={presentToday.toString()}
              />

              <InfoRow
                label="System Status"
                value="Operational"
                status
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------
   Components
--------------------------------- */

function DashboardCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900 p-5 transition hover:border-blue-400/30">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {description}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-xs font-bold text-blue-400">
          {icon}
        </div>
      </div>
    </div>
  );
}

function AttendanceStat({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}) {
  const percentage =
    total > 0
      ? Math.round((value / total) * 100)
      : 0;

  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-400">
          {label}
        </span>

        <span className="font-medium text-slate-200">
          {value}
        </span>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-blue-500"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}

function QuickAction({
  title,
  description,
  icon,
  href,
}: {
  title: string;
  description: string;
  icon: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="group flex items-center gap-4 rounded-xl border border-white/5 bg-slate-950 p-4 transition hover:border-blue-400/30 hover:bg-slate-950/80"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-xs font-bold text-blue-400 transition group-hover:bg-blue-500/20">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-200">
          {title}
        </p>

        <p className="mt-1 truncate text-xs text-slate-500">
          {description}
        </p>
      </div>

      <span className="text-slate-600 transition group-hover:translate-x-1 group-hover:text-blue-400">
        →
      </span>
    </a>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-400">
        {label}
      </span>

      <span className="text-sm font-semibold text-slate-200">
        {value}
      </span>
    </div>
  );
}

function InfoRow({
  label,
  value,
  status = false,
}: {
  label: string;
  value: string;
  status?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0 last:pb-0">
      <span className="text-sm text-slate-500">
        {label}
      </span>

      <span
        className={
          status
            ? "text-sm font-medium text-green-400"
            : "text-sm font-medium text-slate-200"
        }
      >
        {value}
      </span>
    </div>
  );
}