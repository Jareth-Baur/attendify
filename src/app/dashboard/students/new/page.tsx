"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import type { ApiResponse } from "@/types/api";

interface SectionOption { id: string; name: string; gradeLevel: string; schoolYear: { name: string } }

export default function NewStudentPage() {
  const router = useRouter();
  const [sections, setSections] = useState<SectionOption[]>([]);
  const [error, setError] = useState("");

  useEffect(() => { void fetch("/api/students/sections").then(async (response) => { const payload = await response.json() as ApiResponse<SectionOption[]>; if (payload.success) setSections(payload.data); else setError(payload.error.message); }); }, []);

  async function createStudent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    const fields = new FormData(event.currentTarget);
    const response = await fetch("/api/students", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lrn: fields.get("lrn") || null, firstName: fields.get("first_name"), middleName: fields.get("middle_name") || null, lastName: fields.get("last_name"), sex: fields.get("sex"), sectionId: fields.get("section_id") }) });
    const payload = await response.json() as ApiResponse<unknown>;
    if (!payload.success) return setError(payload.error.message);
    router.push("/dashboard/students"); router.refresh();
  }

  return <div className="max-w-2xl"><div><h1 className="text-3xl font-bold">Add Student</h1><p className="mt-1 text-gray-500">Register a new student.</p></div><form onSubmit={createStudent} className="mt-8 space-y-6 rounded-xl border bg-white p-6"><div><label htmlFor="lrn" className="block text-sm font-medium">LRN</label><input id="lrn" name="lrn" type="text" inputMode="numeric" maxLength={12} pattern="[0-9]{12}" className="mt-2 w-full rounded-lg border p-3" placeholder="12-digit LRN" /><p className="mt-1 text-xs text-gray-500">Optional. Must contain exactly 12 digits.</p></div><div className="grid gap-4 md:grid-cols-2"><div><label htmlFor="first_name" className="block text-sm font-medium">First Name</label><input id="first_name" name="first_name" required className="mt-2 w-full rounded-lg border p-3" /></div><div><label htmlFor="middle_name" className="block text-sm font-medium">Middle Name</label><input id="middle_name" name="middle_name" className="mt-2 w-full rounded-lg border p-3" /></div></div><div><label htmlFor="last_name" className="block text-sm font-medium">Last Name</label><input id="last_name" name="last_name" required className="mt-2 w-full rounded-lg border p-3" /></div><div><label htmlFor="sex" className="block text-sm font-medium">Sex</label><select id="sex" name="sex" required className="mt-2 w-full rounded-lg border p-3"><option value="">Select sex</option><option value="MALE">Male</option><option value="FEMALE">Female</option></select></div><div><label htmlFor="section_id" className="block text-sm font-medium">Section</label><select id="section_id" name="section_id" required className="mt-2 w-full rounded-lg border p-3"><option value="">Select section</option>{sections.map((section) => <option key={section.id} value={section.id}>{section.gradeLevel} - {section.name}</option>)}</select></div>{error && <p className="text-sm text-red-500">{error}</p>}<div className="flex justify-end gap-3"><Link href="/dashboard/students" className="rounded-lg border px-5 py-3 text-sm font-medium">Cancel</Link><button type="submit" className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white">Add Student</button></div></form></div>;
}
