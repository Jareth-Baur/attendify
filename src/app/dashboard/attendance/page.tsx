import { redirect } from "next/navigation";
import { getAuthorizedUser } from "@/lib/auth-server";
import { getPhilippineDate } from "@/lib/date";
import AttendanceTable from "./AttendanceTable";
import FinalizeAttendanceButton from "./FinalizeAttendanceButton";
import { getAttendanceDashboard } from "./actions";

interface AttendancePageProps { searchParams: Promise<{ date?: string }> }

export default async function AttendancePage({ searchParams }: AttendancePageProps) {
  const { date } = await searchParams;
  const selectedDate = date || getPhilippineDate();
  if (!await getAuthorizedUser()) redirect("/login");
  const result = await getAttendanceDashboard(selectedDate);
  if (!result.success) return <PageError message={result.message} />;
  const { section, session, roster } = result.data;
  const counts = roster.reduce((total, student) => ({ ...total, [student.attendance?.status.toLowerCase() ?? "notRecorded"]: total[student.attendance?.status.toLowerCase() ?? "notRecorded"] + 1 }), { present: 0, late: 0, absent: 0, excused: 0, notRecorded: 0 });
  return <div>
    <div><h1 className="text-3xl font-bold">Attendance</h1><p className="mt-1 text-gray-500">Review and manage daily attendance.</p></div>
    <form className="mt-6"><label htmlFor="date" className="text-sm font-medium">Attendance Date</label><div className="mt-2 flex gap-3"><input id="date" name="date" type="date" defaultValue={selectedDate} className="rounded-lg border bg-white px-4 py-2" /><button type="submit" className="rounded-lg bg-black px-5 py-2 text-sm font-medium text-white">View</button></div></form>
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5"><SummaryCard label="Present" value={counts.present} /><SummaryCard label="Late" value={counts.late} /><SummaryCard label="Absent" value={counts.absent} /><SummaryCard label="Excused" value={counts.excused} /><SummaryCard label="Not Recorded" value={counts.notRecorded} /></div>
    {section ? <><div className="mt-6 flex items-center justify-between rounded-xl border bg-white p-5"><div><p className="font-medium">Daily Attendance Status</p><p className="mt-1 text-sm text-gray-500">{session?.state === "FINALIZED" ? "Attendance has been finalized for this date." : session ? `${counts.notRecorded} student(s) have not been recorded.` : "Start attendance for this date to record the class."}</p></div><FinalizeAttendanceButton sectionId={section.id} selectedDate={selectedDate} sessionId={session?.id ?? null} isFinalized={session?.state === "FINALIZED"} notRecordedCount={counts.notRecorded} /></div><AttendanceTable students={roster} sessionId={session?.id ?? null} isFinalized={session?.state === "FINALIZED"} /></> : <p className="mt-8 rounded-xl border bg-white p-6 text-sm text-gray-500">No authorized active section is available.</p>}
  </div>;
}

function SummaryCard({ label, value }: { label: string; value: number }) { return <div className="rounded-xl border bg-white p-5"><p className="text-sm text-gray-500">{label}</p><p className="mt-1 text-2xl font-bold">{value}</p></div>; }
function PageError({ message }: { message: string }) { return <div><h1 className="text-3xl font-bold">Attendance</h1><p className="mt-4 text-red-500">Failed to load attendance: {message}</p></div>; }
