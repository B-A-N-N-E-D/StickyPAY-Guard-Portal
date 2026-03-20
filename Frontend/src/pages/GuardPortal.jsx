import React, { useEffect, useMemo, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';


import { updateGuard } from '../components/localStore';
import GuardSignIn from '../components/guard/GuardSignIn';
import GuardHeader from '../components/guard/GuardHeader';
import CameraScanner from '../components/guard/CameraScanner';
import ManualInput from '../components/guard/ManualInput';
import VerificationResult from '../components/guard/VerificationResult';
import CreditsBar from '../components/guard/CreditsBar';
import OrderHistory from '../components/guard/OrderHistory';

export default function GuardPortal() {
  const [guard, setGuard] = useState(null);
  const [inputCode, setInputCode] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('scan');
  const successSound = useMemo(
    () => (typeof Audio !== 'undefined' ? new Audio('/success.mp3') : null),
    []
  );
  const failSound = useMemo(
    () => (typeof Audio !== 'undefined' ? new Audio('/fail.mp3') : null),
    []
  );

  

  useEffect(() => {
    if (!result) return;

    // ❌ ERROR CASE
    if (result.error) {
      // 🔊 sound
      if (failSound) {
        failSound.currentTime = 0;
        failSound.play().catch(() => {});
      }

      // 📳 vibration (error pattern)
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }

      return;
    }

    // ✅ SUCCESS CASE
    if (successSound) {
      successSound.currentTime = 0;
      successSound.play().catch(() => {});
    }

    // 📳 vibration (success pattern)
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }

  }, [result, successSound, failSound]);

  const reset = () => {
    setResult(null);
    setInputCode('');
  };

  const verifyCode = async (code) => {
    if (!code) return;

    setLoading(true);

    try {
      const API_URL = "https://your-backend.onrender.com";

      const res = await fetch(`${API_URL}/api/orders/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ code })
      });

      const data = await res.json();
      setResult(data);

    } catch {
      setResult({ error: "Server error" });
    }

    setLoading(false);
  };

  const handleSignOut = () => {
    if (guard) {
      updateGuard(guard.id, { is_active: false, shift_end: new Date().toISOString() });
    }
    setGuard(null);
    setResult(null);
    setInputCode('');
    setActiveTab('scan');
  };

  if (!guard) {
    return <GuardSignIn onSignIn={setGuard} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <GuardHeader
        guard={guard}
        credits={guard?.credits ?? 0}
        onSignOut={handleSignOut}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="flex-1 px-4 py-5 space-y-4 max-w-lg mx-auto w-full overflow-y-auto">
        {activeTab === 'scan' ? (
          <>
            <CreditsBar credits={guard?.credits ?? 0} totalVerified={guard?.total_verified ?? 0} />
            
            <CameraScanner
              onCodeDetected={(code) => {
                setInputCode(code);
                verifyCode(code);
              }}
            />

            <ManualInput
              inputCode={inputCode}
              setInputCode={setInputCode}
              onVerify={() => verifyCode(inputCode)}
              onClearResult={() => setResult(null)}
            />


            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center py-8"
              >
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </motion.div>
            )}

            <AnimatePresence>
              {!loading && result && (
                <VerificationResult result={result} onReset={reset} />
              )}
            </AnimatePresence>

            {!result && !loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center text-muted-foreground text-xs pt-4 pb-6 space-y-1"
              >
                <ShieldCheck className="w-10 h-10 text-border mx-auto mb-3" />
                <p className="text-sm">Point camera at customer's QR receipt</p>
                <p>or enter the Transaction ID manually</p>
              </motion.div>
            )}
          </>
        ) : (
          <OrderHistory />
        )}
      </div>
    </div>
  );
}
