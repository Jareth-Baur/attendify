interface AttendanceRecord {
  attendance_date: string;
  status:
    | "present"
    | "absent"
    | "late"
    | "excused";
}

interface Student {
  id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  sex: string;
  attendance_records: AttendanceRecord[];
}

interface MonthlyAttendanceTableProps {
  students: Student[];
  year: number;
  month: number;
  daysInMonth: number;
}

function getStatusCode(
  status?: AttendanceRecord["status"]
) {
  switch (status) {
    case "present":
      return "P";

    case "absent":
      return "A";

    case "late":
      return "L";

    case "excused":
      return "E";

    default:
      return "";
  }
}

export default function MonthlyAttendanceTable({
  students,
  year,
  month,
  daysInMonth,
}: MonthlyAttendanceTableProps) {
  const days = Array.from(
    {
      length: daysInMonth,
    },
    (_, index) => index + 1
  );

  return (
    <div className="mt-6 overflow-hidden rounded-xl border bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-max text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="sticky left-0 z-10 min-w-56 bg-gray-50 px-4 py-3 text-left">
                Student
              </th>

              {days.map((day) => {
                const date = new Date(
                  year,
                  month - 1,
                  day
                );

                const dayName =
                  new Intl.DateTimeFormat(
                    "en-PH",
                    {
                      weekday: "short",
                    }
                  ).format(date);

                return (
                  <th
                    key={day}
                    className="min-w-12 border-l px-2 py-2 text-center"
                  >
                    <div>{day}</div>

                    <div className="text-xs font-normal text-gray-400">
                      {dayName}
                    </div>
                  </th>
                );
              })}

              <th className="min-w-20 border-l px-3 py-3 text-center">
                Present
              </th>

              <th className="min-w-20 border-l px-3 py-3 text-center">
                Absent
              </th>

              <th className="min-w-20 border-l px-3 py-3 text-center">
                Late
              </th>
            </tr>
          </thead>

          <tbody>
            {students.map((student) => {
              const attendanceMap =
                new Map(
                  student.attendance_records.map(
                    (record) => [
                      record.attendance_date,
                      record.status,
                    ]
                  )
                );

              let present = 0;
              let absent = 0;
              let late = 0;

              const dailyStatuses = days.map(
                (day) => {
                  const date =
                    `${year}-${String(
                      month
                    ).padStart(2, "0")}-${String(
                      day
                    ).padStart(2, "0")}`;

                  const status =
                    attendanceMap.get(date);

                  if (status === "present") {
                    present++;
                  }

                  if (status === "absent") {
                    absent++;
                  }

                  if (status === "late") {
                    late++;
                  }

                  return {
                    day,
                    status,
                    code:
                      getStatusCode(status),
                  };
                }
              );

              const fullName = [
                student.last_name,
                student.first_name,
                student.middle_name,
              ]
                .filter(Boolean)
                .join(", ");

              return (
                <tr
                  key={student.id}
                  className="border-b last:border-0"
                >
                  <td className="sticky left-0 z-10 bg-white px-4 py-3 font-medium">
                    <div>
                      {fullName}
                    </div>

                    <div className="text-xs font-normal capitalize text-gray-400">
                      {student.sex}
                    </div>
                  </td>

                  {dailyStatuses.map(
                    ({
                      day,
                      status,
                      code,
                    }) => (
                      <td
                        key={day}
                        className="border-l px-2 py-3 text-center"
                        title={
                          status ??
                          "Not recorded"
                        }
                      >
                        {code}
                      </td>
                    )
                  )}

                  <td className="border-l px-3 py-3 text-center font-medium">
                    {present}
                  </td>

                  <td className="border-l px-3 py-3 text-center font-medium">
                    {absent}
                  </td>

                  <td className="border-l px-3 py-3 text-center font-medium">
                    {late}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {students.length === 0 && (
        <div className="p-10 text-center text-gray-500">
          No students found.
        </div>
      )}
    </div>
  );
}