"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { updateAttendance } from "./actions";

type AttendanceStatus =
  | "present"
  | "absent"
  | "late"
  | "excused";

interface AttendanceRecord {
  id: string;
  status: AttendanceStatus;
  scanned_at: string | null;
}

interface Student {
  id: string;
  name: string;
  sex: string;
  attendance: AttendanceRecord | null;
}

interface AttendanceTableProps {
  students: Student[];
  selectedDate: string;
}

export default function AttendanceTable({
  students,
  selectedDate,
}: AttendanceTableProps) {
  const router = useRouter();

  const [updatingId, setUpdatingId] =
    useState<string | null>(null);

  async function handleStatusChange(
    studentId: string,
    status: AttendanceStatus
  ) {
    setUpdatingId(studentId);

    const result = await updateAttendance(
      studentId,
      selectedDate,
      status
    );

    if (!result.success) {
      console.error(result.message);
    }

    setUpdatingId(null);

    router.refresh();
  }

  return (
    <div className="mt-8 overflow-hidden rounded-xl border bg-white">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm">
                Student
              </th>

              <th className="px-6 py-4 text-left text-sm">
                Sex
              </th>

              <th className="px-6 py-4 text-left text-sm">
                Scan Time
              </th>

              <th className="px-6 py-4 text-left text-sm">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {students.map((student) => (
              <tr
                key={student.id}
                className="border-b last:border-0"
              >
                <td className="px-6 py-4 font-medium">
                  {student.name}
                </td>

                <td className="px-6 py-4 text-sm capitalize">
                  {student.sex}
                </td>

                <td className="px-6 py-4 text-sm">
                  {student.attendance?.scanned_at
                    ? new Intl.DateTimeFormat(
                        "en-PH",
                        {
                          timeZone:
                            "Asia/Manila",
                          hour: "numeric",
                          minute: "2-digit",
                        }
                      ).format(
                        new Date(
                          student.attendance
                            .scanned_at
                        )
                      )
                    : "—"}
                </td>

                <td className="px-6 py-4">
                  <select
                    value={
                      student.attendance?.status ??
                      ""
                    }
                    disabled={
                      updatingId === student.id
                    }
                    onChange={(event) => {
                      const status =
                        event.target
                          .value as AttendanceStatus;

                      if (!status) {
                        return;
                      }

                      handleStatusChange(
                        student.id,
                        status
                      );
                    }}
                    className="rounded-lg border bg-white px-3 py-2 text-sm disabled:opacity-50"
                  >
                    <option value="">
                      Not Recorded
                    </option>

                    <option value="present">
                      Present
                    </option>

                    <option value="late">
                      Late
                    </option>

                    <option value="absent">
                      Absent
                    </option>

                    <option value="excused">
                      Excused
                    </option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}