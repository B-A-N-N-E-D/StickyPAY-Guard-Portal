import React, { useRef, useState, useEffect, useCallback } from "react";
import { Camera, CameraOff, Zap, ZapOff } from "lucide-react";
import { motion } from "framer-motion";
import { Html5Qrcode } from "html5-qrcode";

export default function CameraScanner({ onCodeDetected }) {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [scanning, setScanning] = useState(false);
  const [flashOn, setFlashOn] = useState(false);

  const scannerRef = useRef(null);
  const trackRef = useRef(null);
  const isStartingRef = useRef(false);
  const flashOnRef = useRef(false);

  const startCamera = async () => {
    if (cameraActive || isStartingRef.current) return;

    isStartingRef.current = true;
    setCameraError("");

    try {
      if (scannerRef.current) {
        await scannerRef.current.stop().catch(() => {});
        scannerRef.current.clear();
        scannerRef.current = null;
      }

      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      const devices = await Html5Qrcode.getCameras();
      if (!devices || devices.length === 0) {
        setCameraError("No camera found on this device.");
        if (scannerRef.current) {
          scannerRef.current.clear();
          scannerRef.current = null;
        }
        return;
      }

      const cameraId = devices.find(d => d.label.toLowerCase().includes("back"))?.id || devices[0].id;

      await scanner.start(
        cameraId,
        {
          fps: 10,
          qrbox: 250,
          aspectRatio: 1.7
        },
        (decodedText) => {
          stopCamera();
          onCodeDetected(decodedText); // 🔥 THIS IS IMPORTANT
        },
        () => {}
      );

      // Access video track for flash control
      const video = document.querySelector("#qr-reader video");

      if (video instanceof HTMLVideoElement) {
        const stream = video.srcObject;

        if (stream && stream instanceof MediaStream) {
          const track = stream.getVideoTracks()[0];
          trackRef.current = track;
        }
      }

      setCameraActive(true);
      setScanning(true);

    } catch (err) {
      console.error(err);
      setCameraError("Camera access denied. Please allow permission.");
    } finally {
      isStartingRef.current = false;
    }
  };

  const stopCamera = useCallback(async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop().catch(() => {});
      scannerRef.current.clear();
      scannerRef.current = null;
    }

    if (trackRef.current && flashOnRef.current) {
      trackRef.current.applyConstraints({ advanced: [{ torch: false }] }).catch(() => {});
    }

    trackRef.current = null;
    setFlashOn(false);
    setCameraActive(false);
    setScanning(false);
  }, []);

  const toggleFlash = async () => {
    if (!trackRef.current) return;

    const newState = !flashOn;

    try {
      await trackRef.current.applyConstraints({
        advanced: [{ torch: newState }]
      });

      setFlashOn(newState);
    } catch {
      setCameraError("Flashlight not supported on this device.");
    }
  };

  useEffect(() => {
    flashOnRef.current = flashOn;
  }, [flashOn]);

  useEffect(() => {
    return () => {
      void stopCamera();
    };
  }, [stopCamera]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl border border-border overflow-hidden"
    >
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Camera className="w-4 h-4 text-primary" />
            QR / Barcode Scanner
          </p>

          {cameraActive && (
            <button
              onClick={toggleFlash}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                flashOn
                  ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/30"
                  : "bg-secondary border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {flashOn ? <Zap className="w-3.5 h-3.5" /> : <ZapOff className="w-3.5 h-3.5" />}
              {flashOn ? "Flash ON" : "Flash OFF"}
            </button>
          )}
        </div>

        <div className="space-y-3">

          {!cameraActive && (
            <button
              onClick={startCamera}
              className="w-full flex items-center justify-center gap-2 py-4 gradient-banner rounded-xl text-sm font-bold text-black"
            >
              <Camera className="w-5 h-5" />
              Open Camera to Scan
            </button>
          )}

          <div className="relative rounded-xl overflow-hidden bg-black aspect-video">

    {/* Scanner container ALWAYS present */}
    <div id="qr-reader" className="w-full h-full"></div>

              {/* Scanner container */}
              <div id="qr-reader" className="w-full h-full"></div>

              {/* Scan overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-52 h-52 relative">

                  <div className="absolute top-0 left-0 w-7 h-7 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-7 h-7 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-7 h-7 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-7 h-7 border-b-4 border-r-4 border-primary rounded-br-lg" />

                </div>
              </div>

              {flashOn && (
                <div className="absolute top-2 left-2 bg-primary/90 rounded-full px-2 py-0.5 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-black" />
                  <span className="text-black text-xs font-bold">FLASH</span>
                </div>
              )}
            </div>

            <button
              onClick={stopCamera}
              className="w-full flex items-center justify-center gap-2 py-3 bg-destructive/10 hover:bg-destructive/20 border border-destructive/30 text-destructive rounded-xl text-sm font-semibold transition-colors"
            >
              <CameraOff className="w-4 h-4" />
              Stop Camera
            </button>
          </div>
        

        {cameraError && (
          <p className="text-primary text-xs mt-3 bg-primary/10 border border-primary/30 rounded-xl px-3 py-2">
            Warning: {cameraError}
          </p>
        )}
      </div>
    </motion.div>
  );
}





