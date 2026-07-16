"use client";

import {
  Html5Qrcode,
  Html5QrcodeSupportedFormats,
} from "html5-qrcode";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { recordAttendance } from "./actions";

interface ScanResult {
  success: boolean;
  message: string;
  studentName?: string;
  scannedAt?: string;
  alreadyRecorded?: boolean;
}

const SCANNER_ID = "attendance-qr-reader";

export default function AttendanceScanner() {
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const processingRef = useRef(false);

  const lastTokenRef = useRef("");
  const lastScanTimeRef = useRef(0);

  const [isScanning, setIsScanning] =
    useState(false);

  const [isProcessing, setIsProcessing] =
    useState(false);

  const [result, setResult] =
    useState<ScanResult | null>(null);

  const handleDecodedText = useCallback(
    async (decodedText: string) => {
      const now = Date.now();

      if (processingRef.current) {
        return;
      }

      if (
        lastTokenRef.current === decodedText &&
        now - lastScanTimeRef.current < 5000
      ) {
        return;
      }

      processingRef.current = true;
      lastTokenRef.current = decodedText;
      lastScanTimeRef.current = now;

      setIsProcessing(true);

      try {
        const response =
          await recordAttendance(decodedText);

        setResult(response);
      } catch (error) {
        console.error(error);

        setResult({
          success: false,
          message:
            "Something went wrong while recording attendance.",
        });
      } finally {
        setIsProcessing(false);
        processingRef.current = false;
      }
    },
    []
  );

  async function startScanner() {
    if (scannerRef.current || isScanning) {
      return;
    }

    setResult(null);

    try {
      const scanner = new Html5Qrcode(
        SCANNER_ID,
        {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.QR_CODE,
          ],
          verbose: false,
        }
      );

      scannerRef.current = scanner;

      await scanner.start(
        {
          facingMode: "environment",
        },
        {
          fps: 10,
          qrbox: {
            width: 250,
            height: 250,
          },
        },
        handleDecodedText,
        () => {
          // Ignore normal frame scan failures.
        }
      );

      setIsScanning(true);
    } catch (error) {
      console.error(
        "Failed to start scanner:",
        error
      );

      scannerRef.current = null;

      setResult({
        success: false,
        message:
          "Unable to access the camera. Check camera permissions.",
      });
    }
  }

  async function stopScanner() {
    const scanner = scannerRef.current;

    if (!scanner) {
      return;
    }

    try {
      if (scanner.isScanning) {
        await scanner.stop();
      }

      scanner.clear();
    } catch (error) {
      console.error(
        "Failed to stop scanner:",
        error
      );
    } finally {
      scannerRef.current = null;
      setIsScanning(false);
    }
  }

  useEffect(() => {
    return () => {
      const scanner = scannerRef.current;

      if (scanner?.isScanning) {
        scanner.stop().catch(() => {});
      }

      scannerRef.current = null;
    };
  }, []);

  return (
    <div className="mt-8">
      <div className="overflow-hidden rounded-xl border bg-white p-4">
        <div
          id={SCANNER_ID}
          className="mx-auto w-full max-w-lg"
        />
      </div>

      <div className="mt-4 flex justify-center gap-3">
        {!isScanning ? (
          <button
            type="button"
            onClick={startScanner}
            className="rounded-lg bg-black px-6 py-3 font-medium text-white"
          >
            Start Scanner
          </button>
        ) : (
          <button
            type="button"
            onClick={stopScanner}
            className="rounded-lg border px-6 py-3 font-medium"
          >
            Stop Scanner
          </button>
        )}
      </div>

      {isProcessing && (
        <div className="mt-6 rounded-xl border bg-white p-6 text-center">
          <p className="font-medium">
            Recording attendance...
          </p>
        </div>
      )}

      {!isProcessing && result && (
        <div
          className={`mt-6 rounded-xl border p-6 text-center ${
            result.success &&
            !result.alreadyRecorded
              ? "border-green-200 bg-green-50"
              : result.alreadyRecorded
                ? "border-yellow-200 bg-yellow-50"
                : "border-red-200 bg-red-50"
          }`}
        >
          <p className="text-xl font-bold">
            {result.success
              ? result.alreadyRecorded
                ? "Already Recorded"
                : "Attendance Recorded"
              : "Scan Failed"}
          </p>

          {result.studentName && (
            <p className="mt-2 text-lg font-medium">
              {result.studentName}
            </p>
          )}

          <p className="mt-1 text-sm">
            {result.message}
          </p>
        </div>
      )}
    </div>
  );
}