import React, { useRef, useState, useEffect } from 'react';
import { Camera, CameraOff, Zap, ZapOff } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CameraScanner({ onCodeDetected }) {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [scanning, setScanning] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const trackRef = useRef(null);

  const startCamera = async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      const track = stream.getVideoTracks()[0];
      trackRef.current = track;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);

      if ('BarcodeDetector' in window) {
        const detector = new window.BarcodeDetector({
          formats: ['qr_code', 'code_128', 'ean_13', 'ean_8', 'code_39']
        });
        setScanning(true);
        intervalRef.current = setInterval(async () => {
          if (videoRef.current && videoRef.current.readyState === 4) {
            const barcodes = await detector.detect(videoRef.current).catch(() => []);
            if (barcodes.length > 0) {
              const code = barcodes[0].rawValue;
              stopCamera();
              onCodeDetected(code);
            }
          }
        }, 500);
      } else {
        setCameraError(
          'BarcodeDetector not supported. Use Chrome on Android for real scanning, or type the Transaction ID manually.'
        );
      }
    } catch {
      setCameraError('Camera access denied. Please allow camera permission and try again.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    // Turn off flashlight before stopping
    if (trackRef.current && flashOn) {
      trackRef.current.applyConstraints({ advanced: [{ torch: false }] }).catch(() => {});
    }
    setFlashOn(false);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    trackRef.current = null;
    setCameraActive(false);
    setScanning(false);
  };

  const toggleFlash = async () => {
    if (!trackRef.current) return;
    const newState = !flashOn;
    try {
      await trackRef.current.applyConstraints({ advanced: [{ torch: newState }] });
      setFlashOn(newState);
    } catch {
      setCameraError('Flashlight not supported on this device.');
    }
  };

  useEffect(() => () => stopCamera(), []);

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
                  ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/30'
                  : 'bg-secondary border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {flashOn ? <Zap className="w-3.5 h-3.5" /> : <ZapOff className="w-3.5 h-3.5" />}
              {flashOn ? 'Flash ON' : 'Flash OFF'}
            </button>
          )}
        </div>

        {!cameraActive ? (
          <button
            onClick={startCamera}
            className="w-full flex items-center justify-center gap-2 py-4 gradient-banner rounded-xl text-sm font-bold text-black transition-opacity hover:opacity-90 active:opacity-80"
          >
            <Camera className="w-5 h-5" />
            Open Camera to Scan
          </button>
        ) : (
          <div className="space-y-3">
            <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
              <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
              {/* Scan overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-52 h-52 relative">
                  {/* Corner brackets */}
                  <div className="absolute top-0 left-0 w-7 h-7 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-7 h-7 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-7 h-7 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-7 h-7 border-b-4 border-r-4 border-primary rounded-br-lg" />
                  {scanning && (
                    <motion.div
                      animate={{ y: ['0%', '100%', '0%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="absolute left-0 right-0 h-0.5 bg-primary shadow-lg shadow-primary/60"
                      style={{ top: 0 }}
                    />
                  )}
                </div>
              </div>
              {/* Flash indicator overlay */}
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
        )}

        {cameraError && (
          <p className="text-primary text-xs mt-3 bg-primary/10 border border-primary/30 rounded-xl px-3 py-2">
            ⚠️ {cameraError}
          </p>
        )}
      </div>
    </motion.div>
  );
}