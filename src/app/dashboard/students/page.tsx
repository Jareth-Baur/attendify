"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import type { ApiResponse } from "@/types/api";
import type { StudentSummary } from "@/types/student";

interface StudentListData {
  items: StudentSummary[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export default function StudentsPage() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status") === "inactive" ? "inactive" : searchParams.get("status") === "all" ? "all" : "active";
  const [data, setData] = useState<StudentListData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStudents() {
      const response = await fetch(`/api/students?enrollmentStatus=${status}`);
      const payload = await response.json() as ApiResponse<StudentListData>;
      if (!payload.success) return setError(payload.error.message);
      setData(payload.data);
    }
    void loadStudents();
  }, [status]);

  const students = data?.items ?? [];
  return <div>
    <div className="flex items-center justify-between"><div><h1 className="text-3xl font-bold">Students</h1><p className="mt-1 text-gray-500">Manage registered students.</p></div><Link href="/dashboard/students/new" className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white">Add Student</Link></div>
    <div className="mt-8 flex gap-2 border-b">
      {(["active", "inactive", "all"] as const).map((item) => <Link key={item} href={`/dashboard/students?status=${item}`} className={`border-b-2 px-4 py-3 text-sm font-medium ${status === item ? "border-black text-black" : "border-transparent text-gray-500 hover:text-black"}`}>{item[0].toUpperCase() + item.slice(1)}</Link>)}
    </div>
    <div className="mt-6 overflow-hidden rounded-xl border bg-white">
      {error ? <p className="p-10 text-center text-red-500">{error}</p> : students.length === 0 ? <div className="p-10 text-center"><p className="text-gray-500">No students registered yet.</p><Link href="/dashboard/students/new" className="mt-4 inline-block font-medium underline">Register a student</Link></div> : <div className="overflow-x-auto"><table className="w-full"><thead className="border-b bg-gray-50"><tr><th className="px-6 py-4 text-left text-sm">LRN</th><th className="px-6 py-4 text-left text-sm">Student</th><th className="px-6 py-4 text-left text-sm">Sex</th><th className="px-6 py-4 text-left text-sm">Section</th><th className="px-6 py-4 text-left text-sm">Status</th><th className="px-6 py-4 text-right text-sm">Actions</th></tr></thead><tbody>{students.map((student) => <tr key={student.id} className="border-b last:border-0"><td className="px-6 py-4 text-sm">{student.lrn ?? "—"}</td><td className="px-6 py-4"><p className="font-medium">{[student.lastName, student.firstName, student.middleName].filter(Boolean).join(", ")}</p></td><td className="px-6 py-4 text-sm capitalize">{student.sex.toLowerCase()}</td><td className="px-6 py-4 text-sm">{student.section?.name ?? "—"}</td><td className="px-6 py-4"><span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">Active</span></td><td className="px-6 py-4 text-right"><Link href={`/dashboard/students/${student.id}`} className="text-sm font-medium underline">View</Link></td></tr>)}</tbody></table></div>}
    </div>
  </div>;
}
