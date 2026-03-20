import React, { useRef, useState, useEffect } from "react";
import { Camera, CameraOff } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";

export default function CameraScanner({ onCodeDetected }) {
  const [isOpen, setIsOpen] = useState(false);
  const scannerRef = useRef(null);

  const startCamera = async () => {
    setIsOpen(true);

    setTimeout(async () => {
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      try {
        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 15,
            qrbox: { width: 280, height: 280 },
          },
          (decodedText) => {
            stopCamera();
            onCodeDetected(decodedText);
          },
          () => {}
        );
      } catch (err) {
        console.error(err);
      }
    }, 200);
  };

  const stopCamera = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop().catch(() => {});
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setIsOpen(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <>
      {/* BUTTON */}
      <button
        onClick={startCamera}
        className="w-full flex items-center justify-center gap-2 py-4 gradient-banner rounded-xl text-sm font-bold text-black"
      >
        <Camera className="w-5 h-5" />
        Open Camera to Scan
      </button>

      {/* FULLSCREEN SCANNER */}
      {isOpen && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">

          {/* HEADER */}
          <div className="flex justify-between items-center p-4 text-white">
            <h2 className="text-sm font-semibold">Scan QR Code</h2>
            <button onClick={stopCamera}>
              <CameraOff />
            </button>
          </div>

          {/* SCANNER */}
          <div id="qr-reader" className="flex-1"></div>

          {/* OVERLAY */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-64 border-4 border-primary rounded-xl" />
          </div>

        </div>
      )}
    </>
  );
}