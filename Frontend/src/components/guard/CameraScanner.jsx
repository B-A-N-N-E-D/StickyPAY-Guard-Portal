import React, { useRef, useState, useEffect } from "react";
import { Camera, CameraOff, Zap, ZapOff } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";

export default function CameraScanner({ onCodeDetected }) {
  const [isOpen, setIsOpen] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [error, setError] = useState("");

  const scannerRef = useRef(null);
  const trackRef = useRef(null);

  const startCamera = async () => {
    setIsOpen(true);
    setError("");

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
            // 📳 Vibrate on scan
            if (navigator.vibrate) {
              navigator.vibrate([100, 50, 100]); // 200ms vibration
            }
            stopCamera();
            onCodeDetected(decodedText);
          },
          () => {}
        );

        // ✅ Get video track for flash
        setTimeout(() => {
          const video = document.querySelector("#qr-reader video");

          if (video instanceof HTMLVideoElement && video.srcObject instanceof MediaStream) {
            const stream = video.srcObject;
            const track = stream.getVideoTracks()[0];

            if (track) {
              trackRef.current = track;
            }
          }
        }, 500);

      } catch (err) {
        console.error(err);
        setError("Camera error or permission denied");
      }
    }, 200);
  };

  const stopCamera = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop().catch(() => {});
      scannerRef.current.clear();
      scannerRef.current = null;
    }

    // turn off flash if on
    if (trackRef.current && flashOn) {
      trackRef.current.applyConstraints({
        advanced: [{ torch: false }]
      }).catch(() => {});
    }

    trackRef.current = null;
    setFlashOn(false);
    setIsOpen(false);
  };

  const toggleFlash = async () => {
    if (!trackRef.current) return;

    const capabilities = trackRef.current.getCapabilities();

    if (!capabilities.torch) {
      setError("Flash not supported on this device");
      return;
    }

    try {
      const newState = !flashOn;

      await trackRef.current.applyConstraints({
        advanced: [{ torch: newState }]
      });

      setFlashOn(newState);
    } catch {
      setError("Flash toggle failed");
    }
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
            <p className="font-semibold">Scan QR Code</p>

            <div className="flex items-center gap-3">
              {/* FLASH BUTTON */}
              <button onClick={toggleFlash}>
                {flashOn ? <Zap /> : <ZapOff />}
              </button>

              {/* CLOSE */}
              <button onClick={stopCamera}>
                <CameraOff />
              </button>
            </div>
          </div>

          {/* SCANNER */}
          <div className="relative flex-1">
            <div id="qr-reader" className="w-full h-full"></div>

            {/* SCAN BOX */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 border-4 border-primary rounded-xl relative overflow-hidden">

                {/* 🔥 SCAN LINE */}
                <div className="absolute left-0 w-full h-1 bg-primary animate-scan" />

              </div>
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <p className="text-red-400 text-center text-sm pb-4">{error}</p>
          )}

        </div>
      )}
    </>
  );
}