import { createClient } from "@/lib/supabase/server";

import CalendarEventForm from "./CalendarEventForm";
import DeleteCalendarEvent from "./DeleteCalendarEvent";

export default async function SchoolCalendarPage() {
  const supabase = await createClient();

  const { data: events, error } = await supabase
    .from("school_calendar")
    .select(
      `
        id,
        calendar_date,
        day_type,
        description
      `,
    )
    .order("calendar_date", {
      ascending: true,
    });

  return (
    <div className="max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold">School Calendar</h1>

        <p className="mt-1 text-gray-500">
          Manage holidays, class suspensions, and other non-school days.
        </p>
      </div>

      <div className="mt-8">
        <CalendarEventForm />
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border bg-white">
        <div className="border-b p-5">
          <h2 className="font-semibold">Non-School Days</h2>
        </div>

        {error ? (
          <p className="p-6 text-red-500">{error.message}</p>
        ) : events?.length ? (
          <table className="w-full">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm">Date</th>

                <th className="px-6 py-4 text-left text-sm">Type</th>

                <th className="px-6 py-4 text-left text-sm">Description</th>

                <th className="px-6 py-4 text-right text-sm">Action</th>
              </tr>
            </thead>

            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="border-b last:border-0">
                  <td className="px-6 py-4 text-sm">{event.calendar_date}</td>

                  <td className="px-6 py-4 text-sm capitalize">
                    {event.day_type.replaceAll("_", " ")}
                  </td>

                  <td className="px-6 py-4 text-sm">{event.description}</td>

                  <td className="px-6 py-4 text-right">
                    <DeleteCalendarEvent eventId={event.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="p-8 text-center text-gray-500">
            No non-school days configured.
          </p>
        )}
      </div>
    </div>
  );
}
