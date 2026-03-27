import React from 'react';
import { CheckCircle2, XCircle, AlertCircle, Package, RefreshCw, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

export default function VerificationResult({ result, onReset }) {
  // ✅ GREEN: Successful verify
  if (result.order && !result.alreadyVerified) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-green-600 flex items-center justify-center z-50"
      >
        <div className="text-center text-white space-y-4">
          <CheckCircle className="w-32 h-32 mx-auto" />
          <h1 className="text-5xl font-bold">VERIFIED</h1>
          <p className="text-xl">Payment Confirmed</p>
        </div>
      </motion.div>
    );
  }

  // ❌ RED: Invalid / fake QR (only shown on bad QR scan)
  if (result.error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-red-600 flex items-center justify-center z-50"
      >
        <div className="text-center text-white space-y-4">
          <XCircle className="w-32 h-32 mx-auto" />
          <h1 className="text-5xl font-bold">INVALID</h1>
          <p className="text-lg">{result.error}</p>
        </div>
      </motion.div>
    );
  }

  // ⚠️ Already verified card (inline)
  if (result.alreadyVerified) {
    const order = result.order;
    return (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10 }}
        className="bg-accent/10 border border-accent/30 rounded-2xl p-5 flex items-start gap-3"
      >
        <AlertCircle className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-bold text-accent">Already Verified</p>
          <p className="text-muted-foreground text-sm mt-1">This receipt was already checked.</p>
          <p className="text-xs text-muted-foreground mt-1 font-mono">{order?.transaction_id}</p>
          {order?.verified_at && (
            <p className="text-xs text-muted-foreground mt-1">
              Verified at: {format(new Date(order.verified_at), 'dd MMM, hh:mm a')}
            </p>
          )}
        </div>
        <button onClick={onReset} className="text-muted-foreground hover:text-foreground transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </motion.div>
    );
  }

  // Fallback: detailed card (after verified — shown briefly before auto-clear)
  const order = result.order;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-accent/10 border border-accent/30 rounded-2xl p-5 space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7 text-background" />
          </div>
          <div>
            <p className="font-bold text-accent text-lg">✓ Access Granted</p>
            <p className="text-muted-foreground text-xs">Customer paid & verified</p>
          </div>
        </div>
        <button onClick={onReset} className="text-muted-foreground hover:text-foreground transition-colors p-2">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-secondary rounded-xl p-4 space-y-2.5 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Store</span>
          <span className="text-foreground font-medium">{order?.store_name || '—'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total Paid</span>
          <span className="text-accent font-bold">₹{Number(order?.total_amount || 0).toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Payment</span>
          <span className="text-foreground capitalize">{order?.payment_method || '—'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Date</span>
          <span className="text-foreground text-xs">
            {order?.created_at ? format(new Date(order.created_at), 'dd MMM yyyy, hh:mm a') : '—'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Status</span>
          <span className="text-accent font-bold uppercase text-xs tracking-wider">verified</span>
        </div>
      </div>
    </motion.div>
  );
}