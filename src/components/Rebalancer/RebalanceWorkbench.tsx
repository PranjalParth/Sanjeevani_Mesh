'use client';

import React, { useState } from 'react';
import {
  RebalanceTransfer,
  DigitalManifest,
  FacilityNode,
  MedicineBatch,
} from '@/types';
import {
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Navigation,
  Truck,
  CheckCircle2,
  FileText,
  Sparkles,
  Zap,
  ChevronRight,
  Plane,
  Bike,
} from 'lucide-react';

interface RebalanceWorkbenchProps {
  recommendedTransfers: RebalanceTransfer[];
  activeTransfers: RebalanceTransfer[];
  isDetecting: boolean;
  onDetect: () => void;
  onExecuteSingle: (transfer: RebalanceTransfer) => void;
  onExecuteAll: () => void;
  onViewManifest: (manifest: DigitalManifest) => void;
  getManifestForTransfer: (transferId: string) => DigitalManifest | undefined;
}

export const RebalanceWorkbench: React.FC<RebalanceWorkbenchProps> = ({
  recommendedTransfers,
  activeTransfers,
  isDetecting,
  onDetect,
  onExecuteSingle,
  onExecuteAll,
  onViewManifest,
  getManifestForTransfer,
}) => {
  const [selectedTab, setSelectedTab] = useState<'RECOMMENDATIONS' | 'ACTIVE_LOGISTICS'>('RECOMMENDATIONS');

  const getTransportIcon = (mode: string) => {
    switch (mode) {
      case 'MED_DRONE_AIR':
        return <Plane className="h-4 w-4 text-purple-400" />;
      case 'RAPID_BIKE_CARRIER':
        return <Bike className="h-4 w-4 text-amber-400" />;
      default:
        return <Truck className="h-4 w-4 text-teal-400" />;
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-teal-500/10 p-1.5 text-teal-400">
              <Zap className="h-5 w-5" />
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Autonomous Dynamic Rebalancing Engine
            </h2>
            <span className="rounded bg-teal-500/20 px-2 py-0.5 text-[10px] font-bold text-teal-300 border border-teal-500/40 uppercase">
              FEFO Optimizer
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Algorithmic multi-criteria matching: Expiry urgency (FEFO), road distance, burn rates & cold-chain integrity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-slate-800 bg-slate-950 p-0.5 text-xs font-medium">
            <button
              onClick={() => setSelectedTab('RECOMMENDATIONS')}
              className={`rounded-md px-3 py-1.5 transition-colors ${
                selectedTab === 'RECOMMENDATIONS'
                  ? 'bg-teal-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Recommended Matches ({recommendedTransfers.length})
            </button>
            <button
              onClick={() => setSelectedTab('ACTIVE_LOGISTICS')}
              className={`rounded-md px-3 py-1.5 transition-colors ${
                selectedTab === 'ACTIVE_LOGISTICS'
                  ? 'bg-teal-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Active Transfers ({activeTransfers.length})
            </button>
          </div>

          {recommendedTransfers.length > 0 && selectedTab === 'RECOMMENDATIONS' && (
            <button
              onClick={onExecuteAll}
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 hover:from-emerald-500 hover:to-teal-500 transition-all active:scale-95"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Approve & Dispatch All ({recommendedTransfers.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="mt-5">
        {selectedTab === 'RECOMMENDATIONS' ? (
          <div>
            {recommendedTransfers.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 p-8 text-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-400 mb-2" />
                <h4 className="text-sm font-bold text-white">All Health Nodes Currently Balanced</h4>
                <p className="text-xs text-slate-400 max-w-md mt-1">
                  No critical deficits detected. All monitored facilities have sufficient days of cover, or existing transfers have stabilized stock levels.
                </p>
                <button
                  onClick={onDetect}
                  disabled={isDetecting}
                  className="mt-4 flex items-center gap-2 rounded-lg border border-teal-500/30 bg-teal-950/40 px-3.5 py-2 text-xs font-semibold text-teal-300 hover:bg-teal-900/50 transition-colors"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Run Sensor Re-Scan</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {recommendedTransfers.map((match) => (
                  <div
                    key={match.id}
                    className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-950/60 p-4 transition-all hover:border-teal-500/50"
                  >
                    {/* Urgency Ribbon */}
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            match.urgency === 'CRITICAL'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {match.urgency} Priority Match
                        </span>
                        <span className="text-xs font-bold text-white">{match.medicineName}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span>Batch: <strong className="text-teal-300 font-mono">{match.batchNumber}</strong></span>
                        <span>&bull;</span>
                        <span className="text-amber-300 font-semibold">Exp: {match.expiryDate} ({match.daysToExpiry}d left)</span>
                      </div>
                    </div>

                    {/* Node Matching Flow */}
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-12 items-center gap-4">
                      {/* 1. Recipient (Deficit) */}
                      <div className="md:col-span-4 rounded-lg border border-rose-500/30 bg-rose-950/20 p-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-rose-300">REQUESTING NODE (DEFICIT)</span>
                          <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-bold text-rose-400">
                            Imminent Stockout
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white mt-1.5">{match.targetFacilityName}</h4>
                        <div className="mt-2 text-xs text-slate-300 space-y-1">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Incoming Rebalance:</span>
                            <span className="font-bold text-emerald-400">+{match.unitsToTransfer} {match.unit}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Cover Gained:</span>
                            <span className="font-bold text-emerald-400">+{match.recipientCoverGainedDays} days</span>
                          </div>
                        </div>
                      </div>

                      {/* 2. Middle Route & Logistics Metrics */}
                      <div className="md:col-span-4 flex flex-col items-center justify-center p-2 text-center">
                        <div className="flex items-center gap-2 text-xs font-semibold text-teal-300">
                          {getTransportIcon(match.transportMode)}
                          <span>{match.distanceKm} km &bull; {match.estDurationMins} mins ETA</span>
                        </div>
                        <div className="my-2 flex w-full items-center justify-center gap-2">
                          <div className="h-0.5 w-full bg-gradient-to-r from-teal-500 via-emerald-400 to-rose-500" />
                          <ArrowRight className="h-4 w-4 text-emerald-400 shrink-0" />
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium max-w-xs">
                          {match.coldChainCarrier}
                        </span>
                      </div>

                      {/* 3. Donor (Surplus / Near Expiry) */}
                      <div className="md:col-span-4 rounded-lg border border-amber-500/30 bg-amber-950/20 p-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-amber-300">DONOR NODE (FEFO SURPLUS)</span>
                          <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-400">
                            Expiring in {match.daysToExpiry}d
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white mt-1.5">{match.sourceFacilityName}</h4>
                        <div className="mt-2 text-xs text-slate-300 space-y-1">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Transfer Allocation:</span>
                            <span className="font-bold text-amber-300">-{match.unitsToTransfer} {match.unit}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Donor Retention Cover:</span>
                            <span className="font-bold text-slate-200">{match.donorRemainingDaysCover} days left (Safe)</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Algorithmic Rationale & Dispatch Button */}
                    <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-800/80 pt-3 text-xs">
                      <p className="text-slate-400 text-[11px] leading-relaxed max-w-2xl">
                        <strong className="text-teal-400">Rebalance Rationale:</strong> {match.rationale}
                      </p>
                      <button
                        onClick={() => onExecuteSingle(match)}
                        className="shrink-0 flex items-center justify-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-teal-500 active:scale-95 transition-all"
                      >
                        <Truck className="h-3.5 w-3.5" />
                        <span>Dispatch Transfer</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Active Logistics Tab */
          <div>
            {activeTransfers.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center text-slate-400 text-xs">
                No transfers currently in transit. Approve recommended matches to initiate dispatch.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="border-b border-slate-800 bg-slate-950/50 text-[11px] uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="py-3 px-3">Tracking / ID</th>
                      <th className="py-3 px-3">Medicine & Batch</th>
                      <th className="py-3 px-3">Origin &bull; Destination</th>
                      <th className="py-3 px-3">Quantity</th>
                      <th className="py-3 px-3">Logistics Carrier</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Manifest</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {activeTransfers.map((item) => {
                      const manifest = getManifestForTransfer(item.id);
                      return (
                        <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-3 font-mono text-teal-400 font-semibold">
                            {item.trackingNumber}
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-semibold text-white">{item.medicineName}</div>
                            <div className="text-[10px] text-slate-400 font-mono">Batch: {item.batchNumber}</div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="text-slate-200">
                              <span className="text-amber-400">{item.sourceFacilityName}</span> &rarr;{' '}
                              <span className="text-emerald-400 font-semibold">{item.targetFacilityName}</span>
                            </div>
                            <div className="text-[10px] text-slate-400">{item.distanceKm} km &bull; ETA {item.estDurationMins}m</div>
                          </td>
                          <td className="py-3 px-3 font-bold text-white">
                            {item.unitsToTransfer} {item.unit}
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5 text-slate-300">
                              {getTransportIcon(item.transportMode)}
                              <span className="text-[11px] truncate max-w-[180px]">{item.coldChainCarrier}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                              IN TRANSIT
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            {manifest ? (
                              <button
                                onClick={() => onViewManifest(manifest)}
                                className="inline-flex items-center gap-1 rounded-md border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-teal-300 hover:bg-slate-700 hover:text-white transition-colors"
                              >
                                <FileText className="h-3 w-3" />
                                <span>Manifest</span>
                              </button>
                            ) : (
                              <span className="text-slate-500 text-[10px]">Processing</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
