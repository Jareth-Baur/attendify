import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import StudentQRCode from "./StudentQRCode";

interface StudentPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function StudentPage({ params }: StudentPageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: student, error } = await supabase
    .from("students")
    .select(
      `
    id,
    lrn,
    first_name,
    middle_name,
    last_name,
    sex,
    qr_token,
    is_active,
    enrollment_date,
    sections!students_section_id_fkey (
      name,
      grade_level,
      school_years!sections_school_year_id_fkey (
        name
      )
    )
  `,
    )
    .eq("id", id)
    .single();

  if (error || !student) {
    notFound();
  }

  const fullName = [student.first_name, student.middle_name, student.last_name]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <Link
          href="/dashboard/students"
          className="text-sm text-gray-500 hover:text-black"
        >
          ← Back to Students
        </Link>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{fullName}</h1>

          <p className="mt-1 text-gray-500">Student Profile</p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${
            student.is_active
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {student.is_active ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-6">
          <h2 className="text-lg font-semibold">Student Information</h2>

          <dl className="mt-6 space-y-4">
            <InfoRow label="LRN" value={student.lrn ?? "Not provided"} />

            <InfoRow label="First Name" value={student.first_name} />

            <InfoRow label="Middle Name" value={student.middle_name ?? "—"} />

            <InfoRow label="Last Name" value={student.last_name} />

            <InfoRow label="Sex" value={student.sex} />

            <InfoRow
              label="Grade Level"
              value={student.sections?.grade_level ?? "—"}
            />

            <InfoRow label="Section" value={student.sections?.name ?? "—"} />

            <InfoRow
              label="School Year"
              value={student.sections?.school_years?.name ?? "—"}
            />
          </dl>
        </div>

        <div className="rounded-xl border bg-white p-6">
          <h2 className="text-lg font-semibold">Attendance QR Code</h2>

          <p className="mt-1 text-sm text-gray-500">
            This QR code uniquely identifies this student when recording
            attendance.
          </p>

          <StudentQRCode qrToken={student.qr_token} studentName={fullName} />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b pb-3 last:border-0">
      <dt className="text-sm text-gray-500">{label}</dt>

      <dd className="text-right text-sm font-medium capitalize">{value}</dd>
    </div>
  );
}
