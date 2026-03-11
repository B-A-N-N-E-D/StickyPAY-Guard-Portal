import React from 'react';
import { motion } from 'framer-motion';
import { Hash, Search } from 'lucide-react';

export default function ManualInput({ inputCode, setInputCode, onVerify, onClearResult }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-card rounded-2xl border border-border px-5 py-5 space-y-3"
    >
      <p className="text-sm font-semibold text-foreground flex items-center gap-2">
        <Hash className="w-4 h-4 text-primary" />
        Manual Transaction ID
      </p>
      <div className="flex gap-2">
        <input
          value={inputCode}
          onChange={e => {
            setInputCode(e.target.value);
            onClearResult();
          }}
          onKeyDown={e => e.key === 'Enter' && onVerify()}
          placeholder="Enter TXN-... or Order ID"
          className="flex-1 bg-secondary border border-border rounded-xl px-3 py-3 text-sm text-foreground placeholder-muted-foreground outline-none font-mono focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
        />
        <button
          onClick={onVerify}
          className="gradient-banner text-black font-bold px-5 rounded-xl text-sm transition-opacity hover:opacity-90 active:opacity-80 flex items-center gap-1.5"
        >
          <Search className="w-4 h-4" />
          Verify
        </button>
      </div>
    </motion.div>
  );
}