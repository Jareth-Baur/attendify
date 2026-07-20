import AttendanceScanner from "./AttendanceScanner";

export default function ScannerPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold">
          Scan Attendance
        </h1>

        <p className="mt-1 text-gray-500">
          Scan a student&apos;s QR attendance card.
        </p>
      </div>

      <AttendanceScanner />
    </div>
  );
}
