import ExcelJS from "exceljs";
import path from "path";

type AttendanceStatus =
    | "present"
    | "absent"
    | "late"
    | "excused";

interface AttendanceRecord {
    attendance_date: string;
    status: AttendanceStatus;
}

interface AttendanceDay {
    attendance_date: string;
    is_finalized: boolean;
}

interface Student {
    id: string;
    lrn: string | null;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    sex: string;
    enrollment_date: string | null;
    attendance_records: AttendanceRecord[];
}

interface Section {
    id: string;
    name: string;
    grade_level: string | null;

    school_years:
    | {
        name: string;
    }
    | {
        name: string;
    }[]
    | null;
}

interface CalendarEvent {
    calendar_date: string;
    day_type:
    | "holiday"
    | "suspension"
    | "special_non_school_day";
}

interface GenerateSF2Options {
    year: number;
    month: number;
    section: Section;
    students: Student[];
    calendarEvents: CalendarEvent[];
    attendanceDays: AttendanceDay[];
    studentMovements:
    StudentMovement[];
}

type StudentMovementType =
    | "transferred_in"
    | "transferred_out"
    | "dropped_out";

interface StudentMovement {
    student_id: string;
    movement_type:
    StudentMovementType;
    effective_date: string;
}

const SF2_ATTENDANCE_COLUMNS = [
    6, // F
    8, // H
    9, // I
    10, // J
    11, // K
    12, // L
    14, // N
    15, // O
    16, // P
    17, // Q
    18, // R
    20, // T
    21, // U
    22, // V
    24, // X
    26, // Z
    28, // AB
    29, // AC
    30, // AD
    31, // AE
    32, // AF
    33, // AG
    35, // AI
    36, // AJ
    37, // AK
];

/*
 * =========================
 * DATE HELPERS
 * =========================
 */

function getDateString(
    year: number,
    month: number,
    day: number
) {
    return `${year}-${String(
        month
    ).padStart(2, "0")}-${String(
        day
    ).padStart(2, "0")}`;
}

function isWeekend(
    year: number,
    month: number,
    day: number
) {
    const date = new Date(
        Date.UTC(
            year,
            month - 1,
            day
        )
    );

    const weekday =
        date.getUTCDay();

    return (
        weekday === 0 ||
        weekday === 6
    );
}

function getDayLabel(
    year: number,
    month: number,
    day: number
) {
    const date = new Date(
        Date.UTC(
            year,
            month - 1,
            day
        )
    );

    const weekday =
        date.getUTCDay();

    const labels: Record<
        number,
        string
    > = {
        0: "SUN",
        1: "M",
        2: "T",
        3: "W",
        4: "TH",
        5: "F",
        6: "SAT",
    };

    return labels[weekday];
}

function getClassDays(
    year: number,
    month: number,
    calendarEvents: CalendarEvent[]
) {
    const daysInMonth =
        new Date(
            year,
            month,
            0
        ).getDate();

    const excludedDates =
        new Set(
            calendarEvents.map(
                (event) =>
                    event.calendar_date
            )
        );

    const classDays: {
        day: number;
        date: string;
        weekday: string;
    }[] = [];

    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {
        const date =
            getDateString(
                year,
                month,
                day
            );

        if (
            isWeekend(
                year,
                month,
                day
            ) ||
            excludedDates.has(
                date
            )
        ) {
            continue;
        }

        classDays.push({
            day,
            date,
            weekday:
                getDayLabel(
                    year,
                    month,
                    day
                ),
        });
    }

    return classDays;
}

/*
 * =========================
 * STUDENT HELPERS
 * =========================
 */

function formatStudentName(
    student: Student
) {
    const middleName =
        student.middle_name?.trim();

    return [
        `${student.last_name},`,
        student.first_name,
        middleName || null,
    ]
        .filter(Boolean)
        .join(" ")
        .toUpperCase();
}

function normalizeSex(
    sex: string
) {
    return sex
        .trim()
        .toLowerCase();
}

function getSchoolYearName(
    section: Section
) {
    if (
        Array.isArray(
            section.school_years
        )
    ) {
        return (
            section.school_years[0]
                ?.name ?? ""
        );
    }

    return (
        section.school_years
            ?.name ?? ""
    );
}

/*
 * =========================
 * EXCEL STYLE HELPER
 * =========================
 */

function copyRowStyle(
    worksheet: ExcelJS.Worksheet,
    sourceRowNumber: number,
    targetRowNumber: number
) {
    const sourceRow =
        worksheet.getRow(
            sourceRowNumber
        );

    const targetRow =
        worksheet.getRow(
            targetRowNumber
        );

    targetRow.height =
        sourceRow.height;

    for (
        let column = 1;
        column <=
        worksheet.columnCount;
        column++
    ) {
        const sourceCell =
            sourceRow.getCell(
                column
            );

        const targetCell =
            targetRow.getCell(
                column
            );

        targetCell.style =
            structuredClone(
                sourceCell.style
            );

        targetCell.numFmt =
            sourceCell.numFmt;

        targetCell.alignment =
            structuredClone(
                sourceCell.alignment
            );

        targetCell.border =
            structuredClone(
                sourceCell.border
            );

        targetCell.fill =
            structuredClone(
                sourceCell.fill
            );

        targetCell.font =
            structuredClone(
                sourceCell.font
            );

        targetCell.protection =
            structuredClone(
                sourceCell.protection
            );
    }
}

/*
 * =========================
 * GENERATE SF2
 * =========================
 */

export async function generateSF2({
    year,
    month,
    section,
    students,
    calendarEvents,
    attendanceDays,
    studentMovements,
}: GenerateSF2Options) {
    const workbook =
        new ExcelJS.Workbook();

    /*
     * =========================
     * LOAD TEMPLATE
     * =========================
     */

    const templatePath =
        path.join(
            process.cwd(),
            "templates",
            "SF2_Template.xlsx"
        );

    await workbook.xlsx.readFile(
        templatePath
    );

    const worksheet =
        workbook.getWorksheet(
            "school_form_2_ver2014.2.1.1"
        );

    if (!worksheet) {
        throw new Error(
            "SF2 worksheet not found."
        );
    }

    /*
     * =========================
     * CLASS DAYS
     * =========================
     */

    const classDays =
        getClassDays(
            year,
            month,
            calendarEvents
        );

    if (
        classDays.length >
        SF2_ATTENDANCE_COLUMNS.length
    ) {
        throw new Error(
            `The SF2 template supports ${SF2_ATTENDANCE_COLUMNS.length} class days, but ${classDays.length} were found.`
        );
    }

    /*
     * Dates where attendance
     * has been finalized.
     */

    const finalizedDates =
        new Set(
            attendanceDays
                .filter(
                    (day) =>
                        day.is_finalized
                )
                .map(
                    (day) =>
                        day.attendance_date
                )
        );

    /*
     * Valid class days that also
     * have finalized attendance.
     */

    const finalizedClassDays =
        classDays.filter(
            (classDay) =>
                finalizedDates.has(
                    classDay.date
                )
        );

    /*
     * =========================
     * REPORT INFORMATION
     * =========================
     */

    const monthName =
        new Intl.DateTimeFormat(
            "en-PH",
            {
                month: "long",
            }
        )
            .format(
                new Date(
                    year,
                    month - 1,
                    1
                )
            )
            .toUpperCase();

    /*
     * =========================
     * HEADER
     * =========================
     */

    worksheet.getCell(
        "M3"
    ).value =
        getSchoolYearName(
            section
        );

    worksheet.getCell(
        "AA3"
    ).value =
        monthName;

    worksheet.getCell(
        "AA4"
    ).value =
        section.grade_level ??
        "Non-Graded";

    worksheet.getCell(
        "AM4"
    ).value =
        section.name;

    /*
     * =========================
     * ATTENDANCE HEADERS
     * =========================
     */

    for (
        const column of
        SF2_ATTENDANCE_COLUMNS
    ) {
        worksheet
            .getRow(6)
            .getCell(column)
            .value = null;

        worksheet
            .getRow(7)
            .getCell(column)
            .value = null;
    }

    classDays.forEach(
        (classDay, index) => {
            const column =
                SF2_ATTENDANCE_COLUMNS[
                index
                ];

            worksheet
                .getRow(6)
                .getCell(column)
                .value =
                classDay.day;

            worksheet
                .getRow(7)
                .getCell(column)
                .value =
                classDay.weekday;
        }
    );

    /*
     * =========================
     * SPLIT STUDENTS
     * =========================
     */

    const maleStudents =
        students
            .filter(
                (student) =>
                    normalizeSex(
                        student.sex
                    ) === "male"
            )
            .sort((a, b) =>
                a.last_name.localeCompare(
                    b.last_name
                )
            );

    const femaleStudents =
        students
            .filter(
                (student) =>
                    normalizeSex(
                        student.sex
                    ) ===
                    "female"
            )
            .sort((a, b) =>
                a.last_name.localeCompare(
                    b.last_name
                )
            );

    /*
     * =========================
     * STUDENT MOVEMENT TOTALS
     * =========================
     */

    function countMovements(
        movementType:
            StudentMovementType
    ) {
        const matchingMovements =
            studentMovements.filter(
                (movement) =>
                    movement.movement_type ===
                    movementType
            );

        let male = 0;
        let female = 0;

        matchingMovements.forEach(
            (movement) => {
                const student =
                    students.find(
                        (student) =>
                            student.id ===
                            movement.student_id
                    );

                if (!student) {
                    return;
                }

                const sex =
                    normalizeSex(
                        student.sex
                    );

                if (sex === "male") {
                    male++;
                }

                if (
                    sex === "female"
                ) {
                    female++;
                }
            }
        );

        return {
            male,
            female,
            total:
                male + female,
        };
    }

    const transferredIn =
        countMovements(
            "transferred_in"
        );

    const transferredOut =
        countMovements(
            "transferred_out"
        );

    const droppedOut =
        countMovements(
            "dropped_out"
        );

    /*
     * =========================
     * SUMMARY CALCULATIONS
     * =========================
     */

    function calculateGroupSummary(
        groupStudents: Student[]
    ) {
        let totalAttendance = 0;

        finalizedClassDays.forEach(
            (classDay) => {
                groupStudents.forEach(
                    (student) => {
                        const record =
                            student.attendance_records.find(
                                (
                                    attendance
                                ) =>
                                    attendance.attendance_date ===
                                    classDay.date
                            );

                        if (
                            record?.status ===
                            "present" ||
                            record?.status ===
                            "late"
                        ) {
                            totalAttendance++;
                        }
                    }
                );
            }
        );

        const numberOfStudents =
            groupStudents.length;

        const numberOfDays =
            finalizedClassDays.length;

        const averageDailyAttendance =
            numberOfDays > 0
                ? totalAttendance /
                numberOfDays
                : 0;

        const possibleAttendance =
            numberOfStudents *
            numberOfDays;

        const attendancePercentage =
            possibleAttendance > 0
                ? (totalAttendance /
                    possibleAttendance) *
                100
                : 0;

        return {
            numberOfStudents,
            totalAttendance,
            averageDailyAttendance,
            attendancePercentage,
        };
    }

    const maleSummary =
        calculateGroupSummary(
            maleStudents
        );

    const femaleSummary =
        calculateGroupSummary(
            femaleStudents
        );

    const combinedSummary =
        calculateGroupSummary(
            students
        );

    console.log(
        "SF2 Summary:",
        {
            month:
                monthName,
            finalizedDays:
                finalizedClassDays.length,
            male:
                maleSummary,
            female:
                femaleSummary,
            combined:
                combinedSummary,
        }
    );

    /*
     * =========================
     * DYNAMIC SUMMARY TEXT
     * =========================
     */

    function replaceTextInWorksheet(
        searchText: string,
        replacement: string
    ) {
        worksheet.eachRow(
            {
                includeEmpty:
                    false,
            },
            (row) => {
                row.eachCell(
                    {
                        includeEmpty:
                            false,
                    },
                    (cell) => {
                        if (
                            typeof cell.value !==
                            "string"
                        ) {
                            return;
                        }

                        if (
                            cell.value
                                .trim()
                                .toUpperCase() ===
                            searchText
                                .trim()
                                .toUpperCase()
                        ) {
                            cell.value =
                                replacement;
                        }
                    }
                );
            }
        );
    }

    /*
     * Replace the static JUNE
     * value in the template.
     */

    replaceTextInWorksheet(
        "JUNE",
        monthName
    );

    /*
     * Replace static number of
     * class days with the number
     * of finalized class days.
     */

    worksheet.eachRow(
        {
            includeEmpty: false,
        },
        (row) => {
            row.eachCell(
                {
                    includeEmpty:
                        false,
                },
                (cell) => {
                    if (
                        typeof cell.value !==
                        "string"
                    ) {
                        return;
                    }

                    if (
                        cell.value.includes(
                            "No. of Days of Classes:"
                        )
                    ) {
                        cell.value =
                            `No. of Days of Classes: ${finalizedClassDays.length}`;
                    }
                }
            );
        }
    );

    /*
     * =========================
     * STUDENT ROW SETUP
     * =========================
     */

    const studentStartRow = 8;

    const requiredStudentRows =
        maleStudents.length +
        femaleStudents.length;

    const templateStudentCapacity =
        3;

    const additionalRows =
        Math.max(
            0,
            requiredStudentRows -
            templateStudentCapacity
        );

    if (
        additionalRows > 0
    ) {
        worksheet.spliceRows(
            13,
            0,
            ...Array.from(
                {
                    length:
                        additionalRows,
                },
                () => []
            )
        );

        for (
            let i = 0;
            i <
            additionalRows;
            i++
        ) {
            copyRowStyle(
                worksheet,
                8,
                13 + i
            );
        }
    }

    /*
     * Clear sample students.
     */

    const totalAreaEnd =
        13 +
        additionalRows;

    for (
        let row = 8;
        row <= totalAreaEnd;
        row++
    ) {
        for (
            let column = 1;
            column <= 47;
            column++
        ) {
            worksheet
                .getRow(row)
                .getCell(
                    column
                ).value =
                null;
        }
    }

    /*
     * =========================
     * WRITE STUDENT
     * =========================
     */

    function writeStudent(
        student: Student,
        rowNumber: number,
        number: number
    ) {
        const row =
            worksheet.getRow(
                rowNumber
            );

        row.getCell(1).value =
            number;

        row.getCell(3).value =
            formatStudentName(
                student
            );

        const attendanceMap =
            new Map(
                student.attendance_records.map(
                    (record) => [
                        record.attendance_date,
                        record.status,
                    ]
                )
            );

        let absentCount = 0;
        let presentCount = 0;
        let tardyCount = 0;

        classDays.forEach(
            (
                classDay,
                index
            ) => {
                const column =
                    SF2_ATTENDANCE_COLUMNS[
                    index
                    ];

                if (
                    !finalizedDates.has(
                        classDay.date
                    )
                ) {
                    row.getCell(
                        column
                    ).value =
                        null;

                    return;
                }

                const status =
                    attendanceMap.get(
                        classDay.date
                    );

                switch (
                status
                ) {
                    case "absent":
                        row.getCell(
                            column
                        ).value =
                            "X";

                        absentCount++;
                        break;

                    case "late":
                        row.getCell(
                            column
                        ).value =
                            null;

                        presentCount++;
                        tardyCount++;
                        break;

                    case "present":
                        row.getCell(
                            column
                        ).value =
                            null;

                        presentCount++;
                        break;

                    case "excused":
                        row.getCell(
                            column
                        ).value =
                            "E";
                        break;

                    default:
                        row.getCell(
                            column
                        ).value =
                            null;
                }
            }
        );

        /*
         * AM = absent
         * AO = present
         */

        row.getCell(
            39
        ).value =
            absentCount;

        row.getCell(
            41
        ).value =
            presentCount;

        void tardyCount;
    }

    /*
     * =========================
     * GROUP DAILY TOTALS
     * =========================
     */

    function writeGroupTotals(
        groupStudents: Student[],
        rowNumber: number
    ) {
        const row =
            worksheet.getRow(
                rowNumber
            );

        classDays.forEach(
            (
                classDay,
                index
            ) => {
                const column =
                    SF2_ATTENDANCE_COLUMNS[
                    index
                    ];

                /*
                 * Don't calculate
                 * unfinished dates.
                 */

                if (
                    !finalizedDates.has(
                        classDay.date
                    )
                ) {
                    row.getCell(
                        column
                    ).value =
                        null;

                    return;
                }

                let presentForDay =
                    0;

                groupStudents.forEach(
                    (student) => {
                        const record =
                            student.attendance_records.find(
                                (
                                    attendance
                                ) =>
                                    attendance.attendance_date ===
                                    classDay.date
                            );

                        if (
                            record?.status ===
                            "present" ||
                            record?.status ===
                            "late"
                        ) {
                            presentForDay++;
                        }
                    }
                );

                row.getCell(
                    column
                ).value =
                    presentForDay;
            }
        );
    }

    /*
     * =========================
     * MALE SECTION
     * =========================
     */

    let currentRow =
        studentStartRow;

    maleStudents.forEach(
        (
            student,
            index
        ) => {
            copyRowStyle(
                worksheet,
                8,
                currentRow
            );

            writeStudent(
                student,
                currentRow,
                index + 1
            );

            currentRow++;
        }
    );

    const maleTotalRow =
        currentRow;

    copyRowStyle(
        worksheet,
        10,
        maleTotalRow
    );

    worksheet
        .getRow(
            maleTotalRow
        )
        .getCell(1)
        .value =
        maleStudents.length;

    worksheet
        .getRow(
            maleTotalRow
        )
        .getCell(3)
        .value =
        "<=== MALE | TOTAL Per Day ===>";

    writeGroupTotals(
        maleStudents,
        maleTotalRow
    );

    currentRow++;

    /*
     * =========================
     * FEMALE SECTION
     * =========================
     */

    femaleStudents.forEach(
        (
            student,
            index
        ) => {
            copyRowStyle(
                worksheet,
                11,
                currentRow
            );

            writeStudent(
                student,
                currentRow,
                index + 1
            );

            currentRow++;
        }
    );

    const femaleTotalRow =
        currentRow;

    copyRowStyle(
        worksheet,
        12,
        femaleTotalRow
    );

    worksheet
        .getRow(
            femaleTotalRow
        )
        .getCell(1)
        .value =
        femaleStudents.length;

    worksheet
        .getRow(
            femaleTotalRow
        )
        .getCell(3)
        .value =
        "<=== FEMALE | TOTAL Per Day ===>";

    writeGroupTotals(
        femaleStudents,
        femaleTotalRow
    );

    currentRow++;

    /*
     * =========================
     * COMBINED TOTAL
     * =========================
     */

    const combinedTotalRow =
        currentRow;

    copyRowStyle(
        worksheet,
        13 +
        additionalRows,
        combinedTotalRow
    );

    worksheet
        .getRow(
            combinedTotalRow
        )
        .getCell(1)
        .value =
        students.length;

    worksheet
        .getRow(
            combinedTotalRow
        )
        .getCell(3)
        .value =
        "Combined TOTAL Per Day";

    writeGroupTotals(
        students,
        combinedTotalRow
    );

    /*
    * =========================
    * BOTTOM SUMMARY
    * =========================
    *
    * Summary columns:
    *
    * AR = Male
    * AS = Female
    * AT = Total
    *
    * We search only column AM
    * for summary labels to avoid
    * accidentally matching text
    * inside the Guidelines section.
    */

    const SUMMARY_LABEL_COLUMN = 39; // AM
    const SUMMARY_MALE_COLUMN = 44; // AR
    const SUMMARY_FEMALE_COLUMN = 45; // AS
    const SUMMARY_TOTAL_COLUMN = 46; // AT

    function findSummaryRow(
        searchText: string
    ): number | null {
        for (
            let rowNumber = 1;
            rowNumber <= worksheet.rowCount;
            rowNumber++
        ) {
            const value =
                worksheet
                    .getRow(rowNumber)
                    .getCell(
                        SUMMARY_LABEL_COLUMN
                    ).value;

            if (
                typeof value === "string" &&
                value
                    .trim()
                    .toLowerCase()
                    .includes(
                        searchText
                            .trim()
                            .toLowerCase()
                    )
            ) {
                return rowNumber;
            }
        }

        return null;
    }

    function writeSummaryValues(
        rowNumber: number,
        maleValue: number,
        femaleValue: number,
        totalValue: number,
        numberFormat = "0"
    ) {
        const row =
            worksheet.getRow(
                rowNumber
            );

        const maleCell =
            row.getCell(
                SUMMARY_MALE_COLUMN
            );

        const femaleCell =
            row.getCell(
                SUMMARY_FEMALE_COLUMN
            );

        const totalCell =
            row.getCell(
                SUMMARY_TOTAL_COLUMN
            );

        maleCell.value =
            maleValue;

        femaleCell.value =
            femaleValue;

        totalCell.value =
            totalValue;

        /*
         * Reset number formatting.
         *
         * The original SF2 template
         * contains percentage formats
         * in some summary cells.
         */
        maleCell.numFmt =
            numberFormat;

        femaleCell.numFmt =
            numberFormat;

        totalCell.numFmt =
            numberFormat;
    }

    /*
     * =========================
     * MONTH
     * =========================
     */

    const monthSummaryRow =
        findSummaryRow(
            "Month :"
        );

    if (
        monthSummaryRow !== null
    ) {
        worksheet
            .getRow(
                monthSummaryRow
            )
            .getCell(
                SUMMARY_LABEL_COLUMN
            ).value =
            `Month : ${monthName}`;
    }

    /*
     * =========================
     * NUMBER OF CLASS DAYS
     * =========================
     *
     * The label is in AP rather
     * than AM, so search the
     * worksheet directly.
     */

    worksheet.eachRow(
        {
            includeEmpty: false,
        },
        (row) => {
            row.eachCell(
                {
                    includeEmpty:
                        false,
                },
                (cell) => {
                    if (
                        typeof cell.value ===
                        "string" &&
                        cell.value.includes(
                            "No. of Days of Classes:"
                        )
                    ) {
                        cell.value =
                            `No. of Days of Classes: ${finalizedClassDays.length}`;
                    }
                }
            );
        }
    );

    /*
     * =========================
     * ENROLMENT
     * =========================
     *
     * The current template has
     * existing enrolment values.
     *
     * For now, use the currently
     * registered students.
     *
     * Later we'll calculate this
     * using actual enrollment and
     * transfer dates.
     */

    const enrollmentSummaryRow =
        findSummaryRow(
            "Enrolment as of"
        );

    if (
        enrollmentSummaryRow !== null
    ) {
        writeSummaryValues(
            enrollmentSummaryRow,
            maleSummary.numberOfStudents,
            femaleSummary.numberOfStudents,
            combinedSummary.numberOfStudents
        );
    }

    /*
     * =========================
     * REGISTERED LEARNERS
     * =========================
     */

    const registeredSummaryRow =
        findSummaryRow(
            "Registered Learners"
        );

    if (
        registeredSummaryRow !== null
    ) {
        writeSummaryValues(
            registeredSummaryRow,
            maleSummary.numberOfStudents,
            femaleSummary.numberOfStudents,
            combinedSummary.numberOfStudents
        );
    }

    /*
    * =========================
    * PERCENTAGE OF ENROLMENT
    * =========================
    */

    const enrollmentPercentageSummaryRow =
        findSummaryRow(
            "Percentage of Enrolment"
        );

    if (
        enrollmentPercentageSummaryRow !==
        null
    ) {
        const row =
            worksheet.getRow(
                enrollmentPercentageSummaryRow
            );

        const maleEnrollment =
            maleSummary.numberOfStudents;

        const femaleEnrollment =
            femaleSummary.numberOfStudents;

        const totalEnrollment =
            combinedSummary.numberOfStudents;

        const maleRegistered =
            maleSummary.numberOfStudents;

        const femaleRegistered =
            femaleSummary.numberOfStudents;

        const totalRegistered =
            combinedSummary.numberOfStudents;

        const malePercentage =
            maleEnrollment > 0
                ? maleRegistered /
                maleEnrollment
                : 0;

        const femalePercentage =
            femaleEnrollment > 0
                ? femaleRegistered /
                femaleEnrollment
                : 0;

        const totalPercentage =
            totalEnrollment > 0
                ? totalRegistered /
                totalEnrollment
                : 0;

        const maleCell =
            row.getCell(
                SUMMARY_MALE_COLUMN
            );

        const femaleCell =
            row.getCell(
                SUMMARY_FEMALE_COLUMN
            );

        const totalCell =
            row.getCell(
                SUMMARY_TOTAL_COLUMN
            );

        maleCell.value =
            malePercentage;

        femaleCell.value =
            femalePercentage;

        totalCell.value =
            totalPercentage;

        maleCell.numFmt = "0%";
        femaleCell.numFmt = "0%";
        totalCell.numFmt = "0%";
    }

    function roundToTwoDecimals(
        value: number
    ) {
        return Math.round(
            (value + Number.EPSILON) *
            100
        ) / 100;
    }

    /*
    * =========================
    * AVERAGE DAILY ATTENDANCE
    * =========================
    */

    const averageAttendanceSummaryRow =
        findSummaryRow(
            "Average Daily Attendance"
        );

    if (
        averageAttendanceSummaryRow !==
        null
    ) {
        const row =
            worksheet.getRow(
                averageAttendanceSummaryRow
            );

        const maleCell =
            row.getCell(
                SUMMARY_MALE_COLUMN
            );

        const femaleCell =
            row.getCell(
                SUMMARY_FEMALE_COLUMN
            );

        const totalCell =
            row.getCell(
                SUMMARY_TOTAL_COLUMN
            );

        maleCell.value =
            roundToTwoDecimals(
                maleSummary
                    .averageDailyAttendance
            );

        femaleCell.value =
            roundToTwoDecimals(
                femaleSummary
                    .averageDailyAttendance
            );

        totalCell.value =
            roundToTwoDecimals(
                combinedSummary
                    .averageDailyAttendance
            );

        maleCell.numFmt = "0.##";
        femaleCell.numFmt = "0.##";
        totalCell.numFmt = "0.##";
    }

    /*
    * =========================
    * ATTENDANCE PERCENTAGE
    * =========================
    */

    const attendancePercentageSummaryRow =
        findSummaryRow(
            "Percentage of Attendance"
        );

    if (
        attendancePercentageSummaryRow !==
        null
    ) {
        const row =
            worksheet.getRow(
                attendancePercentageSummaryRow
            );

        const maleCell =
            row.getCell(
                SUMMARY_MALE_COLUMN
            );

        const femaleCell =
            row.getCell(
                SUMMARY_FEMALE_COLUMN
            );

        const totalCell =
            row.getCell(
                SUMMARY_TOTAL_COLUMN
            );

        maleCell.value =
            maleSummary
                .attendancePercentage /
            100;

        femaleCell.value =
            femaleSummary
                .attendancePercentage /
            100;

        totalCell.value =
            combinedSummary
                .attendancePercentage /
            100;

        maleCell.numFmt = "0%";
        femaleCell.numFmt = "0%";
        totalCell.numFmt = "0%";
    }
    /*
     * =========================
     * 5 CONSECUTIVE ABSENCES
     * =========================
     *
     * Count learners who have
     * been absent for at least
     * 5 consecutive finalized
     * class days.
     */

    function hasFiveConsecutiveAbsences(
        student: Student
    ) {
        let consecutiveAbsences = 0;

        for (
            const classDay of
            finalizedClassDays
        ) {
            const record =
                student.attendance_records.find(
                    (attendance) =>
                        attendance.attendance_date ===
                        classDay.date
                );

            if (
                record?.status ===
                "absent"
            ) {
                consecutiveAbsences++;

                if (
                    consecutiveAbsences >= 5
                ) {
                    return true;
                }
            } else {
                /*
                 * Present, late, excused,
                 * or another recorded
                 * status breaks the
                 * absence streak.
                 */
                consecutiveAbsences = 0;
            }
        }

        return false;
    }

    const maleFiveDayAbsent =
        maleStudents.filter(
            hasFiveConsecutiveAbsences
        ).length;

    const femaleFiveDayAbsent =
        femaleStudents.filter(
            hasFiveConsecutiveAbsences
        ).length;

    const totalFiveDayAbsent =
        maleFiveDayAbsent +
        femaleFiveDayAbsent;

    /*
     * Find the corresponding
     * Summary row.
     */

    const fiveDayAbsentSummaryRow =
        findSummaryRow(
            "absent for 5 consecutive days"
        );

    if (
        fiveDayAbsentSummaryRow !==
        null
    ) {
        writeSummaryValues(
            fiveDayAbsentSummaryRow,
            maleFiveDayAbsent,
            femaleFiveDayAbsent,
            totalFiveDayAbsent
        );
    }

    /*
* =========================
* DROPPED OUT
* =========================
*/

    const droppedOutSummaryRow =
        findSummaryRow(
            "Dropped out"
        );

    if (
        droppedOutSummaryRow !==
        null
    ) {
        writeSummaryValues(
            droppedOutSummaryRow,
            droppedOut.male,
            droppedOut.female,
            droppedOut.total
        );
    }

    /*
     * =========================
     * TRANSFERRED OUT
     * =========================
     */

    const transferredOutSummaryRow =
        findSummaryRow(
            "Transferred out"
        );

    if (
        transferredOutSummaryRow !==
        null
    ) {
        writeSummaryValues(
            transferredOutSummaryRow,
            transferredOut.male,
            transferredOut.female,
            transferredOut.total
        );
    }

    /*
     * =========================
     * TRANSFERRED IN
     * =========================
     */

    const transferredInSummaryRow =
        findSummaryRow(
            "Transferred in"
        );

    if (
        transferredInSummaryRow !==
        null
    ) {
        writeSummaryValues(
            transferredInSummaryRow,
            transferredIn.male,
            transferredIn.female,
            transferredIn.total
        );
    }

    /*
     * =========================
     * RETURN
     * =========================
     */

    return {
        workbook,
        worksheet,
        monthName,
    };
}