"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

interface Props {
  studentId: string;
  studentName: string;
  isActive: boolean;
}

type MovementType = "transferred_in" | "transferred_out" | "dropped_out";

export default function ManageStudentStatus({
  studentId,
  studentName,
  isActive,
}: Props) {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);

  const [movementType, setMovementType] = useState<MovementType>(
    isActive ? "transferred_out" : "transferred_in",
  );

  const [effectiveDate, setEffectiveDate] = useState("");

  const [remarks, setRemarks] = useState("");

  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    setError("");

    if (!effectiveDate) {
      setError("Please select an effective date.");

      return;
    }

    try {
      setIsSaving(true);

      const response = await fetch(`/api/students/${studentId}/movement`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          movement_type: movementType,

          effective_date: effectiveDate,

          remarks: remarks.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Failed to record student movement.");
      }

      setIsOpen(false);

      setMovementType(isActive ? "transferred_out" : "transferred_in");

      setEffectiveDate("");

      setRemarks("");

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="text-sm font-medium underline"
      >
        Manage Status
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 text-left shadow-xl">
            <div>
              <h2 className="text-xl font-bold">Manage Student Status</h2>

              <p className="mt-1 text-sm text-gray-500">{studentName}</p>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor={`movement-${studentId}`}
                  className="mb-2 block text-sm font-medium"
                >
                  Movement Type
                </label>

                <select
                  id={`movement-${studentId}`}
                  value={movementType}
                  onChange={(event) =>
                    setMovementType(event.target.value as MovementType)
                  }
                  className="w-full rounded-lg border px-3 py-2"
                >
                  {isActive ? (
                    <>
                      <option value="transferred_out">Transferred Out</option>

                      <option value="dropped_out">Dropped Out</option>
                    </>
                  ) : (
                    <option value="transferred_in">Transferred In</option>
                  )}
                </select>
              </div>

              <div>
                <label
                  htmlFor={`date-${studentId}`}
                  className="mb-2 block text-sm font-medium"
                >
                  Effective Date
                </label>

                <input
                  id={`date-${studentId}`}
                  type="date"
                  required
                  value={effectiveDate}
                  onChange={(event) => setEffectiveDate(event.target.value)}
                  className="w-full rounded-lg border px-3 py-2"
                />
              </div>

              <div>
                <label
                  htmlFor={`remarks-${studentId}`}
                  className="mb-2 block text-sm font-medium"
                >
                  Remarks
                </label>

                <textarea
                  id={`remarks-${studentId}`}
                  value={remarks}
                  onChange={(event) => setRemarks(event.target.value)}
                  rows={3}
                  placeholder="Optional remarks"
                  className="w-full resize-none rounded-lg border px-3 py-2"
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => {
                    setIsOpen(false);

                    setError("");
                  }}
                  className="rounded-lg border px-4 py-2 text-sm font-medium"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save Movement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
