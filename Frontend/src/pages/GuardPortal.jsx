import React, { useEffect, useMemo, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import GuardSignIn from '../components/guard/GuardSignIn';
import GuardHeader from '../components/guard/GuardHeader';
import CameraScanner from '../components/guard/CameraScanner';
import ManualInput from '../components/guard/ManualInput';
import VerificationResult from '../components/guard/VerificationResult';
import OrderPreview from '../components/guard/OrderPreview';
import CreditsBar from '../components/guard/CreditsBar';
import OrderHistory from '../components/guard/OrderHistory';

export default function GuardPortal() {

  // 🔥 USE ENV VARIABLE (IMPORTANT)
  const API_URL = import.meta.env.VITE_API_URL;

  const [guard, setGuard] = useState(null);
  const [inputCode, setInputCode] = useState('');
  const [scannedOrder, setScannedOrder] = useState(null);
  const [alreadyVerified, setAlreadyVerified] = useState(false);
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
    setScannedOrder(null);
    setInputCode('');
  };

  const fetchOrderDetails = async (code) => {
    if (!code) return;

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      let cleanCode = code.trim();

      // 🔥 handle QR URLs
      if (cleanCode.includes("/")) {
        cleanCode = cleanCode.split("/").pop();
      }

      const res = await fetch(`${API_URL}/api/orders/details`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({ code: cleanCode })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "API error");
      }

      setScannedOrder(data.order);
      setAlreadyVerified(data.order.verified);
      successSound?.play().catch(() => {});

    } catch (err) {
      console.error(err);
      failSound?.play().catch(() => {});
      setResult({ error: err.message || "Server error" });
    }

    setLoading(false);
  };

  const verifyOrderDetails = async (transactionId) => {
    if (!transactionId) return;

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/api/orders/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({ code: transactionId })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "API error");
      }

      // 🔊 Sound feedback
      if (data.success) {
        successSound?.play().catch(() => {});
      } else {
        failSound?.play().catch(() => {});
      }

      setResult(data);
      setScannedOrder(null);

    } catch (err) {
      console.error(err);
      failSound?.play().catch(() => {});
      setResult({ error: err.message || "Server error" });
    }

    setLoading(false);
  };

  const rejectOrderDetails = async (transactionId) => {
    if (!transactionId) return;

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/api/orders/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({ code: transactionId })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "API error");
      }

      setResult(data);
      setScannedOrder(null);

    } catch (err) {
      console.error(err);
      setResult({ error: err.message || "Server error" });
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
                fetchOrderDetails(code);
              }}
            />

            <ManualInput
              inputCode={inputCode}
              setInputCode={setInputCode}
              onVerify={() => fetchOrderDetails(inputCode)}
              onClearResult={() => { setResult(null); setScannedOrder(null); }}
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
              {!loading && scannedOrder && !result && (
                <OrderPreview 
                  order={scannedOrder} 
                  alreadyVerified={alreadyVerified}
                  onVerify={verifyOrderDetails}
                  onReject={rejectOrderDetails}
                  onCancel={() => { setScannedOrder(null); setInputCode(''); }}
                  loading={loading}
                />
              )}
            </AnimatePresence>

            <AnimatePresence>
              {!loading && result && (
                <VerificationResult result={result} onReset={reset} />
              )}
            </AnimatePresence>

            {!result && !scannedOrder && !loading && (
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