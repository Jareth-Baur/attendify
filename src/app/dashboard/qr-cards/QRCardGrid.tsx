"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";

interface Student {
  id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  qr_token: string;

  sections: {
    name: string;
    grade_level: string | null;

    school_years: {
      name: string;
    } | null;
  } | null;
}

interface QRCardGridProps {
  students: Student[];
}

export default function QRCardGrid({
  students,
}: QRCardGridProps) {
  const [qrCodes, setQRCodes] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    async function generateQRCodes() {
      const generatedCodes: Record<
        string,
        string
      > = {};

      for (const student of students) {
        try {
          generatedCodes[student.id] =
            await QRCode.toDataURL(
              student.qr_token,
              {
                width: 300,
                margin: 1,
                errorCorrectionLevel: "M",
              }
            );
        } catch (error) {
          console.error(
            `Failed to generate QR for ${student.id}`,
            error
          );
        }
      }

      setQRCodes(generatedCodes);
    }

    generateQRCodes();
  }, [students]);

  function handlePrint() {
    window.print();
  }

  return (
    <div className="mt-8">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <p className="text-sm text-gray-500">
          {students.length}{" "}
          {students.length === 1
            ? "student"
            : "students"}
        </p>

        <button
          type="button"
          onClick={handlePrint}
          className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white"
        >
          Print QR Cards
        </button>
      </div>

      <div className="qr-card-grid grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {students.map((student) => {
          const fullName = [
            student.first_name,
            student.middle_name,
            student.last_name,
          ]
            .filter(Boolean)
            .join(" ");

          const sectionName = [
            student.sections?.grade_level,
            student.sections?.name,
          ]
            .filter(Boolean)
            .join(" - ");

          return (
            <div
              key={student.id}
              className="qr-card flex flex-col items-center justify-center rounded-xl border-2 border-black bg-white p-4 text-center text-black"
            >
              <p className="text-xs font-bold uppercase tracking-wide">
                Attendance Card
              </p>

              {qrCodes[student.id] ? (
                <img
                  src={qrCodes[student.id]}
                  alt={`QR code for ${fullName}`}
                  className="mt-2 h-36 w-36"
                />
              ) : (
                <div className="mt-2 flex h-36 w-36 items-center justify-center bg-gray-100">
                  <span className="text-xs">
                    Generating...
                  </span>
                </div>
              )}

              <p className="mt-2 text-sm font-bold uppercase">
                {fullName}
              </p>

              <p className="mt-1 text-xs">
                {sectionName || "No Section"}
              </p>

              <p className="text-xs">
                S.Y.{" "}
                {student.sections?.school_years
                  ?.name ?? "—"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}