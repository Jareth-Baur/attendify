"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAuthorizedUser } from "@/lib/auth-server";

type CalendarDayType =
    | "holiday"
    | "suspension"
    | "special_non_school_day";

export async function createCalendarEvent(
    formData: FormData
) {
    const supabase = await createClient();

    const user = await getAuthorizedUser();

    if (!user) {
        return {
            success: false,
            message: "Unauthorized.",
        };
    }

    const calendarDate = formData
        .get("calendar_date")
        ?.toString();

    const dayType = formData
        .get("day_type")
        ?.toString() as CalendarDayType;

    const description = formData
        .get("description")
        ?.toString()
        .trim();

    if (
        !calendarDate ||
        !dayType ||
        !description
    ) {
        return {
            success: false,
            message: "All fields are required.",
        };
    }

    const { error } = await supabase
        .from("school_calendar")
        .insert({
            calendar_date: calendarDate,
            day_type: dayType,
            description,
            created_by: user.id,
        });

    if (error) {
        if (error.code === "23505") {
            return {
                success: false,
                message:
                    "This date already has a calendar event.",
            };
        }

        return {
            success: false,
            message: error.message,
        };
    }

    revalidatePath(
        "/dashboard/settings/calendar"
    );

    revalidatePath(
        "/dashboard/attendance"
    );

    revalidatePath(
        "/dashboard/reports"
    );

    return {
        success: true,
        message: "Calendar event added.",
    };
}

export async function deleteCalendarEvent(
    eventId: string
) {
    const supabase = await createClient();

    const user = await getAuthorizedUser();

    if (!user) {
        return {
            success: false,
            message: "Unauthorized.",
        };
    }

    const { error } = await supabase
        .from("school_calendar")
        .delete()
        .eq("id", eventId);

    if (error) {
        return {
            success: false,
            message: error.message,
        };
    }

    revalidatePath(
        "/dashboard/settings/calendar"
    );

    revalidatePath(
        "/dashboard/attendance"
    );

    revalidatePath(
        "/dashboard/reports"
    );

    return {
        success: true,
        message: "Calendar event deleted.",
    };
}
