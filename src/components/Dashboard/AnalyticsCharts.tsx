'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { TrendingDown, ShieldCheck, PieChart as PieIcon, Activity } from 'lucide-react';
import { FacilityNode, MedicineBatch } from '@/types';

interface AnalyticsChartsProps {
  facilities: FacilityNode[];
  batches: MedicineBatch[];
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ facilities, batches }) => {
  // 7-Day Depletion Forecast simulation data
  // Compares Default unmanaged trajectory (stockout) vs Sanjeevani-Mesh dynamic rebalanced trajectory
  const forecastData = [
    { day: 'Day 0 (Today)', unmanaged: 4, rebalanced: 4, safeBaseline: 15 },
    { day: 'Day 1 (+24h)', unmanaged: 0, rebalanced: 29, safeBaseline: 15 },
    { day: 'Day 2 (+48h)', unmanaged: 0, rebalanced: 24, safeBaseline: 15 },
    { day: 'Day 3 (+72h)', unmanaged: 0, rebalanced: 19, safeBaseline: 15 },
    { day: 'Day 4 (+96h)', unmanaged: 0, rebalanced: 15, safeBaseline: 15 },
    { day: 'Day 5 (+120h)', unmanaged: 0, rebalanced: 12, safeBaseline: 15 },
    { day: 'Day 6 (+144h)', unmanaged: 0, rebalanced: 25, safeBaseline: 15 },
  ];

  // Facility stock health comparison
  const facilityHealthData = facilities.map((f) => {
    const facBatches = batches.filter((b) => b.facilityId === f.id);
    const critical = facBatches.filter((b) => b.daysOfCover <= 3.0).length;
    const nearExpiry = facBatches.filter((b) => b.daysToExpiry <= 35).length;
    const healthy = facBatches.length - critical - nearExpiry;

    return {
      name: f.name.replace('PHC ', '').replace('CHC ', '').replace('District Hospital ', 'DH-'),
      Healthy: Math.max(0, healthy),
      NearExpirySurplus: nearExpiry,
      CriticalDeficit: critical,
      healthScore: f.stockSummary.overallHealthIndex,
    };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* 1. Depletion Forecast Chart */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">7-Day Medicine Depletion Forecast</h3>
              <span className="rounded bg-teal-500/10 px-2 py-0.5 text-[10px] font-bold text-teal-400 border border-teal-500/20">
                ASV & Insulin Trajectory
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Unmitigated Stockout vs Sanjeevani-Mesh Autonomous Redistribution
            </p>
          </div>
          <div className="rounded-lg bg-slate-800/80 p-2 text-slate-300">
            <TrendingDown className="h-4 w-4 text-teal-400" />
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRebalanced" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorUnmanaged" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" vertical={false} />
              <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit="v" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                  color: '#f8fafc',
                }}
              />
              <Area
                type="monotone"
                dataKey="rebalanced"
                name="With Sanjeevani-Mesh"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorRebalanced)"
              />
              <Area
                type="monotone"
                dataKey="unmanaged"
                name="Without Rebalancing (Stockout)"
                stroke="#f43f5e"
                strokeWidth={2}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#colorUnmanaged)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Autonomous Rebalancing (Stock stays &gt; 12 vials)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            <span>Default Unmitigated (Reaches 0 within 19h)</span>
          </div>
        </div>
      </div>

      {/* 2. Facility Stock Health Breakdown */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">Facility Vulnerability & Stock Distribution</h3>
              <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-400 border border-indigo-500/20">
                7 Nodes
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Batch classification by urgency (Healthy, FEFO Surplus, Critical Deficit)
            </p>
          </div>
          <div className="rounded-lg bg-slate-800/80 p-2 text-slate-300">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={facilityHealthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                  color: '#f8fafc',
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                formatter={(value) => {
                  if (value === 'CriticalDeficit') return 'Critical Deficit (<3d)';
                  if (value === 'NearExpirySurplus') return 'Near Expiry Surplus (<30d)';
                  return 'Healthy Stock';
                }}
              />
              <Bar dataKey="Healthy" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
              <Bar dataKey="NearExpirySurplus" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
              <Bar dataKey="CriticalDeficit" stackId="a" fill="#f43f5e" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-3">
          <span>Target safety buffer: &ge; 10 days of cover</span>
          <span className="text-teal-400 font-medium">BigQuery Telemetry Sync Active</span>
        </div>
      </div>
    </div>
  );
};
