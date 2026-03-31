import React, { useState, useEffect } from 'react';
import { ShieldCheck, LogOut, Coins, History } from 'lucide-react';

export default function GuardHeader({ guard, credits, onSignOut, activeTab, setActiveTab }) {
  return (
    <div className="bg-card border-b border-border px-4 py-3">
      {/* StickyPAY Logo Row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-green-500 flex items-center justify-center">
                            <span className="text-black font-bold text-sm">S</span>
          </div>
          <div className="flex items-baseline gap-0.5">
            <span className="text-white font-bold text-xl">Sticky</span>
            <span className="text-primary font-black text-xl">PAY</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Credits badge */}
          <div className="flex items-center gap-1.5 bg-primary/15 border border-primary/30 px-2.5 py-1 rounded-full">
            <Coins className="w-3.5 h-3.5 text-primary" />
            <span className="text-primary text-xs font-bold">{credits ?? 0}</span>
          </div>

          {/* Sign out */}
          <button
            onClick={onSignOut}
            className="flex items-center gap-1.5 bg-secondary border border-border px-2.5 py-1 rounded-full text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors text-xs"
          >
            <LogOut className="w-3 h-3" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Guard info + Guard Mode badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary/20 rounded-lg flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-foreground text-sm font-semibold leading-tight">{guard?.guard_name || 'Guard'}</p>
            <p className="text-muted-foreground text-xs">ID: {guard?.guard_id || '—'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-accent/10 border border-accent/30 px-2.5 py-1 rounded-full">
          <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
          <span className="text-accent text-xs font-bold tracking-wide">GUARD MODE</span>
        </div>
      </div>

      {/* Tab Nav */}
      <div className="flex mt-3 gap-1 bg-secondary rounded-xl p-1">
        <button
          onClick={() => setActiveTab('scan')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'scan'
              ? 'bg-primary text-primary-foreground shadow'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Scan & Verify
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'history'
              ? 'bg-primary text-primary-foreground shadow'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          History
        </button>
      </div>
    </div>
  );
}