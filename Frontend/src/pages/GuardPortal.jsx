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

    if (result.error) {
      if (failSound) {
        failSound.currentTime = 0;
        failSound.play().catch(() => {});
      }
      return;
    }

    if (successSound) {
      successSound.currentTime = 0;
      successSound.play().catch(() => {});
    }
  }, [result, successSound, failSound]);

  const lookup = async (code) => {

    const trimmed = (code || inputCode).trim();
    if (!trimmed) return;

    setLoading(true);

    try {
      // @ts-ignore
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/verify/${trimmed}`
      );

      const data = await res.json();

      if (!data.valid) {
        setResult({ error: data.message || "Invalid receipt" });
        setLoading(false);
        return;
      }

      // Deduct guard credits
      if (guard) {
        const newCredits = Math.max(0, (guard.credits ?? 100) - 1);
        const newTotal = (guard.total_verified ?? 0) + 1;

        updateGuard(guard.id, {
          credits: newCredits,
          total_verified: newTotal
        });

        setGuard(prev => ({
          ...prev,
          credits: newCredits,
          total_verified: newTotal
        }));
      }

      setResult({
        order: {
          id: data.order_id,
          total_amount: data.total,
          created_date: data.time
        }
      });

    } catch (err) {

      setResult({
        error: "Server verification failed"
      });

    }

    setLoading(false);
  };

  const reset = () => {
    setResult(null);
    setInputCode('');
  };

  const handleCodeDetected = (code) => {

    if (loading) return; // prevent double scan

    setInputCode(code);
    lookup(code);

    setTimeout(() => {
      reset();
    }, 2000);
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
            <CameraScanner onCodeDetected={handleCodeDetected} />
            <ManualInput
              inputCode={inputCode}
              setInputCode={setInputCode}
              onVerify={() => lookup()}
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
