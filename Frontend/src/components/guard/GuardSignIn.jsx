import React, { useState } from 'react';
import { ShieldCheck, Eye, EyeOff, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const API_URL = "https://stickypay-guard-portal.onrender.com";

export default function GuardSignIn({ onSignIn }) {
  const [guardId, setGuardId] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!guardId || !pin) {
      setError("Please enter Guard ID and PIN");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/guard/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          guard_id: guardId,
          pin: pin
        })
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Server response:", text);
        throw new Error("Login API failed");
      }

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      // ✅ Save session
      localStorage.setItem("guard", JSON.stringify(data.guard));
      localStorage.setItem("token", data.token);

      onSignIn(data.guard);

    } catch (err) {
      console.error(err);
      setError("Server error. Check backend.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5">
      
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center mb-10"
      >
        <div className="w-16 h-16 stickypay-logo-bg rounded-2xl flex items-center justify-center shadow-2xl mb-4">
          <span className="text-white font-black text-3xl">S</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-white font-bold text-3xl">Sticky</span>
          <span className="text-primary font-black text-3xl">PAY</span>
        </div>
        <p className="text-muted-foreground text-sm mt-1">Security Guard Portal</p>
      </motion.div>

      {/* Sign In Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-card border border-border rounded-2xl p-6 space-y-4"
      >
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Guard Sign In</h2>
        </div>

        {/* Guard ID */}
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
            Guard ID
          </label>
          <input
            value={guardId}
            onChange={(e) => {
              setGuardId(e.target.value);
              setError('');
            }}
            placeholder="e.g. GRD-001"
            className="w-full bg-secondary border border-border rounded-xl px-3 py-3 text-sm text-foreground outline-none font-mono focus:border-primary"
          />
        </div>

        {/* PIN */}
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
            PIN
          </label>
          <div className="relative">
            <input
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError('');
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              type={showPin ? 'text' : 'password'}
              placeholder="Enter PIN"
              className="w-full bg-secondary border border-border rounded-xl px-3 py-3 text-sm text-foreground outline-none font-mono pr-10 focus:border-primary"
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {/* Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 gradient-banner text-black font-bold rounded-xl text-sm disabled:opacity-60"
        >
          <UserCheck className="w-4 h-4" />
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <p className="text-muted-foreground text-xs text-center pt-1">
          Demo: <span className="text-primary font-mono">GRD-001</span> / PIN <span className="text-primary font-mono">1234</span>
        </p>
      </motion.div>
    </div>
  );
}