"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import type { ApiResponse } from "@/types/api";
import type { StudentDetail } from "@/types/student";
import StudentQRCode from "./StudentQRCode";

export default function StudentPage() {
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<StudentDetail | null>(null);

  useEffect(() => {
    void loadStudent(id).then(setStudent);
  }, [id]);

  if (!student) return <p className="text-sm text-gray-500">Loading student...</p>;
  const fullName = [student.firstName, student.middleName, student.lastName].filter(Boolean).join(" ");

  return <div className="max-w-5xl">
    <div className="mb-6"><Link href="/dashboard/students" className="text-sm text-gray-500 hover:text-black">← Back to Students</Link></div>
    <div className="flex items-start justify-between">
      <div><h1 className="text-3xl font-bold">{fullName}</h1><p className="mt-1 text-gray-500">Student Profile</p></div>
      <span className={`rounded-full px-3 py-1 text-sm font-medium ${student.deletedAt ? "bg-gray-100 text-gray-600" : "bg-green-100 text-green-700"}`}>{student.deletedAt ? "Inactive" : "Active"}</span>
    </div>
    <div className="mt-8 grid gap-6 lg:grid-cols-2">
      <div className="rounded-xl border bg-white p-6"><h2 className="text-lg font-semibold">Student Information</h2><dl className="mt-6 space-y-4">
        <InfoRow label="LRN" value={student.lrn ?? "Not provided"} /><InfoRow label="First Name" value={student.firstName} />
        <InfoRow label="Middle Name" value={student.middleName ?? "—"} /><InfoRow label="Last Name" value={student.lastName} />
        <InfoRow label="Sex" value={student.sex} /><InfoRow label="Grade Level" value={student.section?.gradeLevel ?? "—"} />
        <InfoRow label="Section" value={student.section?.name ?? "—"} /><InfoRow label="School Year" value={student.section?.schoolYear ?? "—"} />
      </dl></div>
      <div className="rounded-xl border bg-white p-6"><h2 className="text-lg font-semibold">Attendance QR Code</h2><p className="mt-1 text-sm text-gray-500">This QR code uniquely identifies this student when recording attendance.</p><StudentQRCode qrToken={student.qrToken} studentName={fullName} /></div>
    </div>
  </div>;
}

async function loadStudent(id: string) {
  const response = await fetch(`/api/students/${id}`);
  const payload = await response.json() as ApiResponse<StudentDetail>;
  return payload.success ? payload.data : null;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-4 border-b pb-3 last:border-0"><dt className="text-sm text-gray-500">{label}</dt><dd className="text-right text-sm font-medium capitalize">{value}</dd></div>;
}
