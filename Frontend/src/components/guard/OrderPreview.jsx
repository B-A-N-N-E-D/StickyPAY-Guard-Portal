import React from 'react';
import { Package, CheckCircle2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

export default function OrderPreview({ order, onVerify, onCancel, loading, alreadyVerified }) {
  if (!order) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-accent/10 border border-accent/30 rounded-2xl p-5 space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${alreadyVerified ? 'bg-red-500/20 text-red-500' : 'bg-accent/20 text-accent'}`}>
            {alreadyVerified ? <AlertCircle className="w-7 h-7" /> : <Package className="w-7 h-7" />}
          </div>
          <div>
            <p className={`font-bold text-lg ${alreadyVerified ? 'text-red-500' : 'text-accent'}`}>
              {alreadyVerified ? 'Already Verified' : 'Order Scanned'}
            </p>
            <p className="text-muted-foreground text-xs">
              {alreadyVerified ? 'This receipt cannot be used again' : 'Review details before verifying'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-secondary rounded-xl p-4 space-y-2.5 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Transaction ID</span>
          <span className="text-foreground font-medium font-mono text-xs">{order.transaction_id}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Store</span>
          <span className="text-foreground font-medium">{order.store_name || '—'}</span>
        </div>
        {order.customer_name && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Customer</span>
            <span className="text-foreground font-medium">{order.customer_name}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total Paid</span>
          <span className="text-accent font-bold">
            {order.currency === 'INR' ? '₹' : '$'}{order.total_amount?.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Payment</span>
          <span className="text-foreground capitalize">{order.payment_method || '—'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Date</span>
          <span className="text-foreground text-xs">
            {order.created_date
              ? format(new Date(order.created_date), 'dd MMM yyyy, hh:mm a')
              : '—'}
          </span>
        </div>
        
        {alreadyVerified && order.verified_at && (
          <div className="flex justify-between border-t border-red-500/20 pt-2 mt-2">
            <span className="text-red-500 font-semibold">Verified At</span>
            <span className="text-red-500 text-xs font-semibold">
              {format(new Date(order.verified_at), 'dd MMM yyyy, hh:mm a')}
            </span>
          </div>
        )}
      </div>

      {order.items?.length > 0 && (
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
                  {order.currency === 'INR' ? '₹' : '$'}{(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ACTION BUTTONS */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onCancel}
          disabled={loading}
          className="flex-1 py-3 rounded-xl border border-secondary text-muted-foreground font-medium hover:bg-secondary transition-colors"
        >
          Cancel
        </button>
        
        {!alreadyVerified && (
          <button
            onClick={() => onVerify(order.transaction_id)}
            disabled={loading}
            className="flex-1 py-3 rounded-xl gradient-banner text-black font-bold flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Verify Order
              </>
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
}
