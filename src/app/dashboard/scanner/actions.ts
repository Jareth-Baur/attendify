"use server";

import { createClient } from "@/lib/supabase/server";
import { getPhilippineDate } from "@/lib/date";
import { getAuthorizedUser } from "@/lib/auth-server";

interface ScanResult {
  success: boolean;
  message: string;
  studentName?: string;
  scannedAt?: string;
  alreadyRecorded?: boolean;
}

export async function recordAttendance(
  qrToken: string
): Promise<ScanResult> {
  const supabase = await createClient();

  const user = await getAuthorizedUser();

  if (!user) {
    return {
      success: false,
      message: "You must be logged in.",
    };
  }

  const token = qrToken.trim();

  if (!token) {
    return {
      success: false,
      message: "Invalid QR code.",
    };
  }

  const { data: student, error: studentError } =
    await supabase
      .from("students")
      .select(`
        id,
        first_name,
        middle_name,
        last_name,
        is_active,
        sections!inner (
          id,
          adviser_id
        )
      `)
      .eq("qr_token", token)
      .eq("is_active", true)
      .single();

  if (studentError || !student) {
    return {
      success: false,
      message: "Student not found or QR code is invalid.",
    };
  }

  const fullName = [
    student.first_name,
    student.middle_name,
    student.last_name,
  ]
    .filter(Boolean)
    .join(" ");

  const now = new Date();

  const attendanceDate = getPhilippineDate();

  const { data: existingAttendance } =
    await supabase
      .from("attendance_records")
      .select("id, status, scanned_at")
      .eq("student_id", student.id)
      .eq("attendance_date", attendanceDate)
      .maybeSingle();

  if (existingAttendance) {
    return {
      success: true,
      alreadyRecorded: true,
      studentName: fullName,
      scannedAt:
        existingAttendance.scanned_at ?? undefined,
      message: "Attendance already recorded today.",
    };
  }

  const { data: attendance, error: attendanceError } =
    await supabase
      .from("attendance_records")
      .insert({
        student_id: student.id,
        attendance_date: attendanceDate,
        status: "present",
        scanned_at: now.toISOString(),
        recorded_by: user.id,
      })
      .select("scanned_at")
      .single();

  if (attendanceError) {
    console.error(
      "Attendance insert error:",
      attendanceError
    );

    return {
      success: false,
      message: "Failed to record attendance.",
    };
  }

  return {
    success: true,
    alreadyRecorded: false,
    studentName: fullName,
    scannedAt: attendance.scanned_at,
    message: "Attendance recorded successfully.",
  };
}
