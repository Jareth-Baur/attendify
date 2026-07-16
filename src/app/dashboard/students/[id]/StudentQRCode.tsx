"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";

interface StudentQRCodeProps {
  qrToken: string;
  studentName: string;
}

export default function StudentQRCode({
  qrToken,
  studentName,
}: StudentQRCodeProps) {
  const [qrCode, setQRCode] = useState("");

  useEffect(() => {
    async function generateQRCode() {
      try {
        const dataUrl = await QRCode.toDataURL(
          qrToken,
          {
            width: 300,
            margin: 2,
            errorCorrectionLevel: "M",
          }
        );

        setQRCode(dataUrl);
      } catch (error) {
        console.error(
          "Failed to generate QR code:",
          error
        );
      }
    }

    generateQRCode();
  }, [qrToken]);

  return (
    <div className="mt-6 text-center">
      {qrCode ? (
        <img
          src={qrCode}
          alt={`QR code for ${studentName}`}
          className="mx-auto h-64 w-64"
        />
      ) : (
        <div className="mx-auto flex h-64 w-64 items-center justify-center bg-gray-100">
          <p className="text-sm text-gray-500">
            Generating QR...
          </p>
        </div>
      )}

      <p className="mt-4 font-medium">
        {studentName}
      </p>

      <p className="mt-1 text-xs text-gray-500">
        Present this QR code when recording attendance.
      </p>
    </div>
  );
}