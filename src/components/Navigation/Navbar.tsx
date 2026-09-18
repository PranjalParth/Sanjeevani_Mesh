'use client';

import React from 'react';
import { Activity, ShieldAlert, Sparkles, RefreshCw, Radio, ThermometerSnowflake } from 'lucide-react';

interface NavbarProps {
  onOpenAi: () => void;
  onDetectRebalance: () => void;
  onReset: () => void;
  isRebalancing: boolean;
  stockoutCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAi,
  onDetectRebalance,
  onReset,
  isRebalancing,
  stockoutCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#0b1120]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 text-white shadow-lg shadow-teal-500/20">
            <Activity className="h-6 w-6 stroke-[2.5]" />
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-white">SANJEEVANI</span>
              <span className="rounded bg-teal-500/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-400 border border-teal-500/30">
                MESH v2.4
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Cross-District Dynamic Medicine Rebalancing Engine
            </p>
          </div>
        </div>

        {/* Live Status Indicators */}
        <div className="hidden md:flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-2 rounded-full bg-slate-900/80 px-3 py-1.5 border border-slate-800 text-slate-300">
            <Radio className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
            <span>Central MP Cluster: <strong className="text-white">7 Health Nodes</strong></span>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-slate-900/80 px-3 py-1.5 border border-slate-800 text-slate-300">
            <ThermometerSnowflake className="h-3.5 w-3.5 text-cyan-400" />
            <span>Cold-Chain Telemetry: <strong className="text-emerald-400">99.4% Pass</strong></span>
          </div>

          {stockoutCount > 0 && (
            <div className="flex items-center gap-2 rounded-full bg-rose-500/10 px-3 py-1.5 border border-rose-500/30 text-rose-400">
              <ShieldAlert className="h-3.5 w-3.5 text-rose-500 animate-bounce" />
              <span>Critical Deficits: <strong>{stockoutCount}</strong></span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onReset}
            title="Reset dataset to baseline"
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-2 text-xs font-medium text-slate-400 hover:border-slate-700 hover:text-slate-200 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            onClick={onDetectRebalance}
            disabled={isRebalancing}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold text-white shadow-lg transition-all ${
              isRebalancing
                ? 'bg-slate-700 cursor-not-allowed opacity-75'
                : 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 shadow-teal-500/20 active:scale-95'
            }`}
          >
            <Activity className={`h-4 w-4 ${isRebalancing ? 'animate-spin' : ''}`} />
            <span>{isRebalancing ? 'Optimizing Mesh...' : 'Detect & Rebalance'}</span>
          </button>

          <button
            onClick={onOpenAi}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-lg shadow-purple-500/20 hover:from-purple-500 hover:to-indigo-500 active:scale-95 transition-all"
          >
            <Sparkles className="h-4 w-4 text-purple-200 animate-pulse" />
            <span>Gemini Demand AI</span>
          </button>
        </div>
      </div>
    </header>
  );
};
