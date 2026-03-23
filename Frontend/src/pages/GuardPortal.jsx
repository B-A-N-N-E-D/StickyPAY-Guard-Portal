import React, { useEffect, useMemo, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import GuardSignIn from '../components/guard/GuardSignIn';
import GuardHeader from '../components/guard/GuardHeader';
import CameraScanner from '../components/guard/CameraScanner';
import ManualInput from '../components/guard/ManualInput';
import VerificationResult from '../components/guard/VerificationResult';
import CreditsBar from '../components/guard/CreditsBar';
import OrderHistory from '../components/guard/OrderHistory';

export default function GuardPortal() {

  // 🔥 USE ENV VARIABLE (IMPORTANT)
  const API_URL = import.meta.env.VITE_API_URL;

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

  // 🧠 Auto clear result
  useEffect(() => {
    if (!result) return;

    const timer = setTimeout(() => {
      setResult(null);
      setInputCode("");
    }, 2500);

    return () => clearTimeout(timer);
  }, [result]);

  // 🧠 Load guard
  useEffect(() => {
    const saved = localStorage.getItem("guard");
    if (saved) {
      setGuard(JSON.parse(saved));
    }
  }, []);

  const reset = () => {
    setResult(null);
    setInputCode('');
  };

  // 🔥 FIXED VERIFY FUNCTION
  const verifyCode = async (code) => {
    if (!code) return;

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      let cleanCode = code.trim();

      // 🔥 handle QR URLs
      if (cleanCode.includes("/")) {
        cleanCode = cleanCode.split("/").pop();
      }

      const res = await fetch(`${API_URL}/api/orders/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ code: cleanCode }) // ✅ FIXED
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "API error");
      }

      // 🔊 Sound feedback
      if (data.success) {
        successSound?.play().catch(() => {});
      } else {
        failSound?.play().catch(() => {});
      }

      setResult(data);

    } catch (err) {
      console.error(err);
      failSound?.play().catch(() => {});
      setResult({ error: "Server error" });
    }

    setLoading(false);
  };

  // 🔥 FIXED LOGOUT (use backend URL)
  const handleSignOut = async () => {
    try {
      const token = localStorage.getItem("token");

      await fetch(`${API_URL}/api/guard/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          guard_id: guard?.guard_id,
        }),
      });

    } catch (err) {
      console.error("Logout error:", err);
    }

    localStorage.removeItem("guard");
    localStorage.removeItem("token");

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
            <CreditsBar
              credits={guard?.credits ?? 0}
              totalVerified={guard?.total_verified ?? 0}
            />

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