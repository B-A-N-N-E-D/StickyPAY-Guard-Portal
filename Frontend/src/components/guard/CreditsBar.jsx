import React from 'react';
import { Coins, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CreditsBar({ credits, totalVerified }) {
  const maxCredits = 100;
  const pct = Math.min(100, ((credits ?? 0) / maxCredits) * 100);

  const getBarColor = () => {
    if (pct > 60) return 'bg-accent';
    if (pct > 30) return 'bg-primary';
    return 'bg-destructive';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl px-5 py-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Coins className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-foreground">Credits</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <TrendingUp className="w-3.5 h-3.5 text-accent" />
          <span>{totalVerified ?? 0} scans today</span>
        </div>
      </div>

      <div className="flex items-end gap-3">
        <div className="flex-1">
          <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full ${getBarColor()}`}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-muted-foreground">0</span>
            <span className="text-xs text-muted-foreground">{maxCredits}</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-primary">{credits ?? 0}</span>
          <span className="text-xs text-muted-foreground ml-1">tokens</span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-2">
        Each verification uses <span className="text-primary font-semibold">1 credit</span>. Credits reset daily.
      </p>
    </motion.div>
  );
}