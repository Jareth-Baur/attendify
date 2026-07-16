"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function finalizeAttendance(
  sectionId: string,
  date: string
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "Unauthorized.",
    };
  }

  const { data: calendarEvent } = await supabase
    .from("school_calendar")
    .select("id, day_type, description")
    .eq("calendar_date", date)
    .maybeSingle();

  if (calendarEvent) {
    return {
      success: false,
      message:
        `Attendance cannot be finalized. ` +
        `${calendarEvent.description} is marked as a non-school day.`,
    };
  }

  const [year, month, day] = date
    .split("-")
    .map(Number);

  const dateObject = new Date(
    Date.UTC(year, month - 1, day)
  );

  const dayOfWeek = dateObject.getUTCDay();

  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return {
      success: false,
      message:
        "Attendance cannot be finalized on weekends.",
    };
  }

  const { data: students, error: studentsError } =
    await supabase
      .from("students")
      .select("id")
      .eq("section_id", sectionId)
      .eq("is_active", true);

  if (studentsError) {
    return {
      success: false,
      message: "Failed to load students.",
    };
  }

  if (!students?.length) {
    return {
      success: false,
      message: "No active students found.",
    };
  }

  const studentIds = students.map(
    (student) => student.id
  );

  const {
    data: existingRecords,
    error: existingRecordsError,
  } = await supabase
    .from("attendance_records")
    .select("student_id")
    .eq("attendance_date", date)
    .in("student_id", studentIds);

  if (existingRecordsError) {
    return {
      success: false,
      message:
        "Failed to load existing attendance records.",
    };
  }

  const recordedStudentIds = new Set(
    existingRecords?.map(
      (record) => record.student_id
    ) ?? []
  );

  const missingStudents = students.filter(
    (student) =>
      !recordedStudentIds.has(student.id)
  );

  if (missingStudents.length > 0) {
    const records = missingStudents.map(
      (student) => ({
        student_id: student.id,
        attendance_date: date,
        status: "absent" as const,
        recorded_by: user.id,
      })
    );

    const { error: insertError } = await supabase
      .from("attendance_records")
      .insert(records);

    if (insertError) {
      return {
        success: false,
        message:
          "Failed to mark missing students as absent.",
      };
    }
  }

  const { error: finalizeError } = await supabase
    .from("attendance_days")
    .upsert(
      {
        section_id: sectionId,
        attendance_date: date,
        is_finalized: true,
        finalized_at: new Date().toISOString(),
        finalized_by: user.id,
      },
      {
        onConflict: "section_id,attendance_date",
      }
    );

  if (finalizeError) {
    return {
      success: false,
      message:
        "Attendance records were updated, but finalization failed.",
    };
  }

  revalidatePath("/dashboard/attendance");
  revalidatePath("/dashboard/reports");

  return {
    success: true,
    message:
      `Attendance finalized. ` +
      `${missingStudents.length} student(s) marked absent.`,
  };
}

export async function updateAttendance(
  studentId: string,
  date: string,
  status: "present" | "absent" | "late" | "excused"
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "Unauthorized.",
    };
  }

  const { data: existingRecord } = await supabase
    .from("attendance_records")
    .select("id")
    .eq("student_id", studentId)
    .eq("attendance_date", date)
    .maybeSingle();

  if (existingRecord) {
    const { error } = await supabase
      .from("attendance_records")
      .update({
        status,
        recorded_by: user.id,
      })
      .eq("id", existingRecord.id);

    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  } else {
    const { error } = await supabase
      .from("attendance_records")
      .insert({
        student_id: studentId,
        attendance_date: date,
        status,
        recorded_by: user.id,
        scanned_at:
          status === "present"
            ? new Date().toISOString()
            : null,
      });

    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  revalidatePath("/dashboard/attendance");
  revalidatePath("/dashboard/reports");

  return {
    success: true,
    message: "Attendance updated.",
  };
}