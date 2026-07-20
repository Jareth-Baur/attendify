"use client";

import { useState } from "react";

import { deleteCalendarEvent } from "./actions";

interface Props {
  eventId: string;
}

export default function DeleteCalendarEvent({ eventId }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm("Delete this calendar event?");

    if (!confirmed) {
      return;
    }

    setLoading(true);

    const result = await deleteCalendarEvent(eventId);

    if (!result.success) {
      alert(result.message);
    }

    setLoading(false);
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={handleDelete}
      className="text-sm font-medium text-red-600 disabled:opacity-50"
    >
      {loading ? "Deleting..." : "Delete"}
    </button>
  );
}
