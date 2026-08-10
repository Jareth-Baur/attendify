import {
  NextRequest,
  NextResponse,
} from "next/server";

import { createClient } from "@/lib/supabase/server";
import { generateSF2 } from "@/lib/reports/generate-sf2";
import { getAuthorizedUser } from "@/lib/auth-server";

export async function GET(
  request: NextRequest
) {
  try {
    const supabase =
      await createClient();

    /*
     * =========================
     * AUTHENTICATION
     * =========================
     */

    const user = await getAuthorizedUser();

    if (!user) {
      return NextResponse.json(
        {
          message: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    /*
     * =========================
     * MONTH PARAMETER
     * =========================
     */

    const month =
      request.nextUrl.searchParams.get(
        "month"
      );

    if (
      !month ||
      !/^\d{4}-\d{2}$/.test(month)
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid month. Expected YYYY-MM.",
        },
        {
          status: 400,
        }
      );
    }

    const [year, monthNumber] =
      month.split("-").map(Number);

    /*
     * Validate the month number.
     */

    if (
      monthNumber < 1 ||
      monthNumber > 12
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid month number.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * =========================
     * DATE RANGE
     * =========================
     */

    const daysInMonth = new Date(
      year,
      monthNumber,
      0
    ).getDate();

    const startDate =
      `${month}-01`;

    const endDate =
      `${month}-${String(
        daysInMonth
      ).padStart(2, "0")}`;

    /*
     * =========================
     * GET TEACHER'S SECTION
     * =========================
     */

    const {
      data: section,
      error: sectionError,
    } = await supabase
      .from("sections")
      .select(`
        id,
        name,
        grade_level,
        school_years (
          name
        )
      `)
      .eq(
        "adviser_id",
        user.id
      )
      .limit(1)
      .maybeSingle();

    if (
      sectionError ||
      !section
    ) {
      console.error(
        "Section error:",
        sectionError
      );

      return NextResponse.json(
        {
          message:
            "No section assigned to this teacher.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * =========================
     * GET STUDENTS
     * =========================
     *
     * Load active students from
     * the teacher's section and
     * their attendance records
     * for the selected month.
     */

    const {
      data: students,
      error: studentsError,
    } = await supabase
      .from("students")
      .select(`
        id,
        lrn,
        first_name,
        middle_name,
        last_name,
        sex,
        enrollment_date,
        is_active,
        attendance_records (
          attendance_date,
          status
        )
      `)
      .eq(
        "section_id",
        section.id
      )
      .gte(
        "attendance_records.attendance_date",
        startDate
      )
      .lte(
        "attendance_records.attendance_date",
        endDate
      )
      .order(
        "last_name",
        {
          ascending: true,
        }
      );

    if (studentsError) {
      console.error(
        "Students error:",
        studentsError
      );

      return NextResponse.json(
        {
          message:
            "Failed to load students.",
        },
        {
          status: 500,
        }
      );
    }

    /*
     * =========================
     * GET SCHOOL CALENDAR
     * =========================
     *
     * These dates are excluded
     * from the SF2 class days.
     */

    const {
      data: calendarEvents,
      error: calendarError,
    } = await supabase
      .from("school_calendar")
      .select(`
        calendar_date,
        day_type
      `)
      .gte(
        "calendar_date",
        startDate
      )
      .lte(
        "calendar_date",
        endDate
      );

    if (calendarError) {
      console.error(
        "School calendar error:",
        calendarError
      );

      return NextResponse.json(
        {
          message:
            "Failed to load school calendar.",
        },
        {
          status: 500,
        }
      );
    }

    /*
     * =========================
     * GET FINALIZED
     * ATTENDANCE DAYS
     * =========================
     *
     * Only finalized attendance
     * days should be considered
     * completed attendance days
     * when generating the SF2.
     */

    const {
      data: attendanceDays,
      error: attendanceDaysError,
    } = await supabase
      .from("attendance_days")
      .select(`
        attendance_date,
        is_finalized
      `)
      .eq(
        "section_id",
        section.id
      )
      .gte(
        "attendance_date",
        startDate
      )
      .lte(
        "attendance_date",
        endDate
      )
      .eq(
        "is_finalized",
        true
      );

    if (attendanceDaysError) {
      console.error(
        "Attendance days error:",
        attendanceDaysError
      );

      return NextResponse.json(
        {
          message:
            "Failed to load finalized attendance days.",
        },
        {
          status: 500,
        }
      );
    }

    /*
     * =========================
     * GET STUDENT MOVEMENTS
     * =========================
     *
     * Load student movements
     * within the selected month.
     *
     * Examples:
     * - transferred_in
     * - transferred_out
     * - dropped_out
     */

    const {
      data: studentMovements,
      error: studentMovementsError,
    } = await supabase
      .from("student_movements")
      .select(`
        student_id,
        movement_type,
        effective_date
      `)
      .eq(
        "section_id",
        section.id
      )
      .lte(
        "effective_date",
        endDate
      )
      .order(
        "effective_date",
        {
          ascending: true,
        }
      );

    if (studentMovementsError) {
      console.error(
        "Student movements error:",
        studentMovementsError
      );

      return NextResponse.json(
        {
          message:
            "Failed to load student movements.",
        },
        {
          status: 500,
        }
      );
    }

    /*
     * =========================
     * GENERATE SF2
     * =========================
     */

    const {
      workbook,
      monthName,
    } = await generateSF2({
      year,
      month: monthNumber,
      section,
      students:
        students ?? [],
      calendarEvents:
        calendarEvents ?? [],
      attendanceDays:
        attendanceDays ?? [],
      studentMovements:
        studentMovements ?? [],
    });

    /*
     * =========================
     * GENERATE EXCEL BUFFER
     * =========================
     */

    const buffer =
      await workbook.xlsx.writeBuffer();

    /*
     * Remove characters that may
     * cause problems in filenames.
     */

    const safeSectionName =
      section.name.replace(
        /[<>:"/\\|?*]/g,
        "_"
      );

    const fileName =
      `SF2_${safeSectionName}_${monthName}_${year}.xlsx`;

    /*
     * =========================
     * DOWNLOAD RESPONSE
     * =========================
     */

    return new NextResponse(
      Buffer.from(buffer),
      {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

          "Content-Disposition":
            `attachment; filename="${fileName}"`,
        },
      }
    );
  } catch (error) {
    /*
     * =========================
     * UNEXPECTED ERROR
     * =========================
     */

    console.error(
      "SF2 generation error:",
      error
    );

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to generate SF2.",
      },
      {
        status: 500,
      }
    );
  }
}
