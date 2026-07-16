"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { finalizeAttendance } from "./actions";

interface Props {
  sectionId: string;
  selectedDate: string;
  isFinalized: boolean;
  notRecordedCount: number;
}

export default function FinalizeAttendanceButton({
  sectionId,
  selectedDate,
  isFinalized,
  notRecordedCount,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");

  async function handleFinalize() {
    if (isFinalized) {
      return;
    }

    const confirmed = window.confirm(
      notRecordedCount > 0
        ? `${notRecordedCount} student(s) have no attendance record. They will be marked absent. Continue?`
        : "Finalize attendance for this date?",
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setMessage("");

    const result = await finalizeAttendance(sectionId, selectedDate);

    setMessage(result.message);
    setLoading(false);

    if (result.success) {
      router.refresh();
    }
  }

  return (
    <div>
      <button
        type="button"
        disabled={loading || isFinalized}
        onClick={handleFinalize}
        className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isFinalized
          ? "Attendance Finalized"
          : loading
            ? "Finalizing..."
            : "Finalize Attendance"}
      </button>

      {message && <p className="mt-2 text-sm text-gray-600">{message}</p>}
    </div>
  );
}
