import {
    NextResponse,
} from "next/server";

import {
    generateSF2,
} from "@/lib/reports/generate-sf2";

export async function GET() {
    try {
        const {
            worksheet,
            monthName,
        } = await generateSF2({
            year: 2026,
            month: 7,
            section: {
                id: "test-section",
                name: "Test Section",
                grade_level: "1",
                school_years: {
                    name: "2026-2027",
                },
            },
            students: [],
            calendarEvents: [],
            attendanceDays: [],
            studentMovements: [],
        });

        return NextResponse.json({
            success: true,

            worksheet:
                worksheet.name,

            rows:
                worksheet.rowCount,

            columns:
                worksheet.columnCount,

            month:
                monthName,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                success: false,

                message:
                    error instanceof Error
                        ? error.message
                        : "Unknown error",
            },
            {
                status: 500,
            }
        );
    }
}
