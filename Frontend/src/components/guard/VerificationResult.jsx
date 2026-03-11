import React from 'react';
import { CheckCircle2, XCircle, AlertCircle, Package, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

export default function VerificationResult({ result, onReset }) {
  if (!result) return null;

  if (result.error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10 }}
        className="bg-destructive/10 border border-destructive/30 rounded-2xl p-5 flex items-start gap-3"
      >
        <XCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-bold text-destructive">Not Found</p>
          <p className="text-muted-foreground text-sm mt-1">{result.error}</p>
        </div>
        <button onClick={onReset} className="text-muted-foreground hover:text-foreground transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </motion.div>
    );
  }

  if (result.alreadyVerified) {
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
          <p className="text-xs text-muted-foreground mt-1 font-mono">{result.order?.transaction_id}</p>
          {result.order?.verified_date && (
            <p className="text-xs text-muted-foreground mt-1">
              Verified at: {format(new Date(result.order.verified_date), 'dd MMM, hh:mm a')}
            </p>
          )}
        </div>
        <button onClick={onReset} className="text-muted-foreground hover:text-foreground transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </motion.div>
    );
  }

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
        {order?.customer_name && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Customer</span>
            <span className="text-foreground font-medium">{order.customer_name}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total Paid</span>
          <span className="text-accent font-bold">
            {order?.currency === 'INR' ? '₹' : '$'}{order?.total_amount?.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Payment</span>
          <span className="text-foreground capitalize">{order?.payment_method || '—'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Date</span>
          <span className="text-foreground text-xs">
            {order?.created_date
              ? format(new Date(order.created_date), 'dd MMM yyyy, hh:mm a')
              : '—'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Status</span>
          <span className="text-accent font-bold uppercase text-xs tracking-wider">verified</span>
        </div>
      </div>

      {order?.items?.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-4 h-4 text-muted-foreground" />
            <p className="text-muted-foreground text-xs uppercase tracking-wider">
              Items ({order.items.length})
            </p>
          </div>
          <div className="space-y-1.5">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between bg-secondary rounded-xl px-3 py-2.5 text-sm">
                <div>
                  <p className="font-medium text-foreground">{item.name}</p>
                  <p className="text-muted-foreground text-xs">Qty: {item.quantity}</p>
                </div>
                <p className="text-accent font-semibold">
                  {order?.currency === 'INR' ? '₹' : '$'}{(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}