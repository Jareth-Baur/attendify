import {
    NextRequest,
    NextResponse,
} from "next/server";

import { createClient } from "@/lib/supabase/server";
import { getAuthorizedUser } from "@/lib/auth-server";

type MovementType =
    | "transferred_in"
    | "transferred_out"
    | "dropped_out";

interface MovementRequestBody {
    movement_type: MovementType;
    effective_date: string;
    remarks?: string | null;
}

const VALID_MOVEMENT_TYPES: MovementType[] = [
    "transferred_in",
    "transferred_out",
    "dropped_out",
];

export async function POST(
    request: NextRequest,
    context: {
        params: Promise<{
            id: string;
        }>;
    }
) {
    try {
        const { id: studentId } =
            await context.params;

        const supabase =
            await createClient();

        /*
         * =========================
         * AUTHENTICATION
         * =========================
         */

        const user =
            await getAuthorizedUser();

        if (
            !user
        ) {
            return NextResponse.json(
                {
                    message:
                        "Unauthorized.",
                },
                {
                    status: 401,
                }
            );
        }

        /*
         * =========================
         * REQUEST BODY
         * =========================
         */

        const body =
            (await request.json()) as
            MovementRequestBody;

        const {
            movement_type,
            effective_date,
            remarks,
        } = body;

        /*
         * =========================
         * VALIDATION
         * =========================
         */

        if (
            !movement_type ||
            !VALID_MOVEMENT_TYPES.includes(
                movement_type
            )
        ) {
            return NextResponse.json(
                {
                    message:
                        "Invalid movement type.",
                },
                {
                    status: 400,
                }
            );
        }

        if (
            !effective_date ||
            !/^\d{4}-\d{2}-\d{2}$/.test(
                effective_date
            )
        ) {
            return NextResponse.json(
                {
                    message:
                        "Invalid effective date. Expected YYYY-MM-DD.",
                },
                {
                    status: 400,
                }
            );
        }

        /*
         * =========================
         * GET STUDENT
         * =========================
         *
         * We also fetch the section
         * to verify that the current
         * teacher owns this student.
         */

        const {
            data: student,
            error: studentError,
        } = await supabase
            .from("students")
            .select(`
                id,
                section_id,
                is_active,
                sections!inner (
                    id,
                    adviser_id
                )
            `)
            .eq(
                "id",
                studentId
            )
            .eq(
                "sections.adviser_id",
                user.id
            )
            .maybeSingle();

        if (
            studentError ||
            !student
        ) {
            console.error(
                "Student lookup error:",
                studentError
            );

            return NextResponse.json(
                {
                    message:
                        "Student not found or you do not have permission to manage this student.",
                },
                {
                    status: 404,
                }
            );
        }

        /*
         * =========================
         * DUPLICATE CHECK
         * =========================
         *
         * Prevent accidentally
         * recording the exact same
         * movement twice.
         */

        const {
            data: existingMovement,
            error: existingError,
        } = await supabase
            .from(
                "student_movements"
            )
            .select("id")
            .eq(
                "student_id",
                studentId
            )
            .eq(
                "movement_type",
                movement_type
            )
            .eq(
                "effective_date",
                effective_date
            )
            .maybeSingle();

        if (existingError) {
            console.error(
                "Movement duplicate check error:",
                existingError
            );

            return NextResponse.json(
                {
                    message:
                        "Failed to validate student movement.",
                },
                {
                    status: 500,
                }
            );
        }

        if (
            existingMovement
        ) {
            return NextResponse.json(
                {
                    message:
                        "This student movement has already been recorded.",
                },
                {
                    status: 409,
                }
            );
        }

        /*
         * =========================
         * CREATE MOVEMENT
         * =========================
         */

        const {
            data: movement,
            error: movementError,
        } = await supabase
            .from(
                "student_movements"
            )
            .insert({
                student_id:
                    studentId,

                section_id:
                    student.section_id,

                movement_type,

                effective_date,

                remarks:
                    remarks?.trim() ||
                    null,
            })
            .select(`
                id,
                student_id,
                section_id,
                movement_type,
                effective_date,
                remarks,
                created_at
            `)
            .single();

        if (
            movementError ||
            !movement
        ) {
            console.error(
                "Movement insert error:",
                movementError
            );

            return NextResponse.json(
                {
                    message:
                        "Failed to record student movement.",
                },
                {
                    status: 500,
                }
            );
        }

        /*
         * =========================
         * UPDATE CURRENT STATUS
         * =========================
         *
         * Transferred In:
         *     active = true
         *
         * Transferred Out:
         *     active = false
         *
         * Dropped Out:
         *     active = false
         */

        const isActive =
            movement_type ===
            "transferred_in";

        const {
            error: updateError,
        } = await supabase
            .from("students")
            .update({
                is_active:
                    isActive,
            })
            .eq(
                "id",
                studentId
            );

        if (updateError) {
            console.error(
                "Student status update error:",
                updateError
            );

            /*
             * The movement was created
             * but student status failed
             * to update.
             *
             * Return an error so this
             * doesn't silently fail.
             */

            return NextResponse.json(
                {
                    message:
                        "Movement was recorded, but the student's active status could not be updated.",
                },
                {
                    status: 500,
                }
            );
        }
        /*
        * =========================
        * MOVEMENT STATE VALIDATION
        * =========================
        */

        if (
            student.is_active &&
            movement_type ===
            "transferred_in"
        ) {
            return NextResponse.json(
                {
                    message:
                        "An active student cannot be transferred in.",
                },
                {
                    status: 400,
                }
            );
        }

        if (
            !student.is_active &&
            (
                movement_type ===
                "transferred_out" ||
                movement_type ===
                "dropped_out"
            )
        ) {
            return NextResponse.json(
                {
                    message:
                        "An inactive student can only be transferred in.",
                },
                {
                    status: 400,
                }
            );
        }
        /*
         * =========================
         * SUCCESS
         * =========================
         */

        return NextResponse.json(
            {
                message:
                    "Student movement recorded successfully.",

                movement,

                student: {
                    id: studentId,
                    is_active:
                        isActive,
                },
            },
            {
                status: 201,
            }
        );
    } catch (error) {
        console.error(
            "Student movement error:",
            error
        );

        return NextResponse.json(
            {
                message:
                    error instanceof
                        Error
                        ? error.message
                        : "Failed to record student movement.",
            },
            {
                status: 500,
            }
        );
    }
}
