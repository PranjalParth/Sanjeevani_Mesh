'use client';

import React from 'react';
import { Building2, AlertTriangle, Clock, ArrowLeftRight, ThermometerSnowflake, Users } from 'lucide-react';
import { KPISummary } from '@/types';

interface KpiGridProps {
  kpis: KPISummary;
}

export const KpiGrid: React.FC<KpiGridProps> = ({ kpis }) => {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
      {/* 1. Active PHC Nodes */}
      <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm backdrop-blur transition-all hover:border-slate-700">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Active Health Nodes</span>
          <div className="rounded-lg bg-teal-500/10 p-2 text-teal-400">
            <Building2 className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-white">{kpis.totalFacilities}</span>
          <span className="text-xs font-medium text-emerald-400">100% Online</span>
        </div>
        <p className="mt-1 text-[11px] text-slate-400">Bhopal, Sehore & Raisen cluster</p>
      </div>

      {/* 2. Critical Stock-Out Risk */}
      <div className={`relative overflow-hidden rounded-xl border p-4 shadow-sm backdrop-blur transition-all ${
        kpis.stockoutRiskCount > 0
          ? 'border-rose-500/40 bg-rose-950/20 hover:border-rose-500/60'
          : 'border-slate-800 bg-slate-900/60'
      }`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Stock-Out Risk (&lt;72h)</span>
          <div className="rounded-lg bg-rose-500/10 p-2 text-rose-400">
            <AlertTriangle className="h-4 w-4 animate-bounce" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-rose-400">{kpis.stockoutRiskCount}</span>
          <span className="text-[11px] font-semibold text-rose-400/90 uppercase tracking-wider">
            {kpis.stockoutRiskCount > 0 ? 'Urgent Deficit' : 'Safe'}
          </span>
        </div>
        <p className="mt-1 text-[11px] text-slate-400">Anti-Snake Venom, ARV & Insulin</p>
      </div>

      {/* 3. Batches Near Expiry */}
      <div className="relative overflow-hidden rounded-xl border border-amber-500/30 bg-amber-950/10 p-4 shadow-sm backdrop-blur transition-all hover:border-amber-500/50">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Near Expiry (&lt;30 Days)</span>
          <div className="rounded-lg bg-amber-500/10 p-2 text-amber-400">
            <Clock className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-amber-400">{kpis.nearExpiryBatchCount}</span>
          <span className="text-[11px] font-medium text-amber-300">FEFO Donors</span>
        </div>
        <p className="mt-1 text-[11px] text-slate-400">Candidates for zero-waste redistribution</p>
      </div>

      {/* 4. Rebalanced Today */}
      <div className="relative overflow-hidden rounded-xl border border-emerald-500/30 bg-emerald-950/10 p-4 shadow-sm backdrop-blur transition-all hover:border-emerald-500/50">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Rebalanced Today</span>
          <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
            <ArrowLeftRight className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-emerald-400">{kpis.rebalancedTodayCount}</span>
          <span className="text-xs font-medium text-slate-300">({kpis.unitsRebalancedToday} units)</span>
        </div>
        <p className="mt-1 text-[11px] text-slate-400">Cross-district transfer manifests</p>
      </div>

      {/* 5. Cold-Chain Compliance */}
      <div className="col-span-2 sm:col-span-1 relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm backdrop-blur transition-all hover:border-slate-700">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Cold-Chain Pass Rate</span>
          <div className="rounded-lg bg-cyan-500/10 p-2 text-cyan-400">
            <ThermometerSnowflake className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-cyan-400">{kpis.coldChainComplianceRate}%</span>
          <span className="text-[11px] font-medium text-emerald-400">2°C - 8°C</span>
        </div>
        <p className="mt-1 text-[11px] text-slate-400">12 IoT sensor probes active</p>
      </div>
    </div>
  );
};
