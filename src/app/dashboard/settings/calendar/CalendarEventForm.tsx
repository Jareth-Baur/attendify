"use client";

import { FormEvent, useRef, useState } from "react";

import { createCalendarEvent } from "./actions";

export default function CalendarEventForm() {
  const formRef = useRef<HTMLFormElement>(null);

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");

  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    const formData = new FormData(event.currentTarget);

    const result = await createCalendarEvent(formData);

    setSuccess(result.success);
    setMessage(result.message);
    setLoading(false);

    if (result.success) {
      formRef.current?.reset();
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="rounded-xl border bg-white p-6"
    >
      <h2 className="text-lg font-semibold">Add Non-School Day</h2>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="calendar_date" className="text-sm font-medium">
            Date
          </label>

          <input
            id="calendar_date"
            name="calendar_date"
            type="date"
            required
            className="mt-2 w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label htmlFor="day_type" className="text-sm font-medium">
            Type
          </label>

          <select
            id="day_type"
            name="day_type"
            required
            className="mt-2 w-full rounded-lg border p-3"
          >
            <option value="">Select type</option>

            <option value="holiday">Holiday</option>

            <option value="suspension">Class Suspension</option>

            <option value="special_non_school_day">
              Special Non-School Day
            </option>
          </select>
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>

        <input
          id="description"
          name="description"
          required
          className="mt-2 w-full rounded-lg border p-3"
          placeholder="e.g. National Holiday"
        />
      </div>

      {message && (
        <p
          className={`mt-4 text-sm ${
            success ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 rounded-lg bg-black px-5 py-3 text-sm font-medium text-white disabled:opacity-50"
      >
        {loading ? "Adding..." : "Add Calendar Event"}
      </button>
    </form>
  );
}
