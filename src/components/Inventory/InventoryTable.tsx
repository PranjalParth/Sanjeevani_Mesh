'use client';

import React, { useState, useMemo } from 'react';
import { MedicineBatch, FacilityNode } from '@/types';
import {
  Search,
  Filter,
  AlertTriangle,
  Clock,
  ThermometerSnowflake,
  ShieldCheck,
  ArrowUpDown,
  Building2,
  CheckCircle2,
} from 'lucide-react';

interface InventoryTableProps {
  batches: MedicineBatch[];
  facilities: FacilityNode[];
}

export const InventoryTable: React.FC<InventoryTableProps> = ({ batches, facilities }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'CRITICAL' | 'EXPIRING_SOON' | 'COLD_CHAIN'>('ALL');
  const [selectedFacility, setSelectedFacility] = useState<string>('ALL');

  const filteredBatches = useMemo(() => {
    return batches.filter((batch) => {
      // Search match
      const searchMatch =
        batch.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.facilityName.toLowerCase().includes(searchTerm.toLowerCase());

      if (!searchMatch) return false;

      // Facility filter
      if (selectedFacility !== 'ALL' && batch.facilityId !== selectedFacility) {
        return false;
      }

      // Category / condition filter
      if (filterType === 'CRITICAL') {
        return batch.daysOfCover <= 3.0;
      }
      if (filterType === 'EXPIRING_SOON') {
        return batch.daysToExpiry <= 35;
      }
      if (filterType === 'COLD_CHAIN') {
        return batch.coldChain.required;
      }

      return true;
    });
  }, [batches, searchTerm, filterType, selectedFacility]);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur">
      {/* Table Header & Title */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white tracking-tight">
              Primary Health Centre Inventory Management
            </h2>
            <span className="rounded bg-slate-800 px-2 py-0.5 text-xs font-semibold text-slate-300">
              {filteredBatches.length} Batches Monitored
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time drug registry with daily consumption burn rates, FEFO expiry trackers, and cold-chain compliance.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search drug, batch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-lg border border-slate-800 bg-slate-950 pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 w-48 sm:w-56"
            />
          </div>

          {/* Facility Dropdown */}
          <select
            value={selectedFacility}
            onChange={(e) => setSelectedFacility(e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-200 focus:border-teal-500 focus:outline-none"
          >
            <option value="ALL">All Facilities (7)</option>
            {facilities.map((fac) => (
              <option key={fac.id} value={fac.id}>
                {fac.name} ({fac.district})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Filter Buttons */}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <button
          onClick={() => setFilterType('ALL')}
          className={`rounded-lg px-3 py-1 font-medium transition-colors ${
            filterType === 'ALL'
              ? 'bg-slate-700 text-white font-semibold'
              : 'bg-slate-800/60 text-slate-400 hover:text-white'
          }`}
        >
          All Drugs ({batches.length})
        </button>

        <button
          onClick={() => setFilterType('CRITICAL')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1 font-medium transition-colors ${
            filterType === 'CRITICAL'
              ? 'bg-rose-600 text-white font-semibold shadow'
              : 'bg-rose-950/40 text-rose-300 border border-rose-800/40 hover:bg-rose-900/50'
          }`}
        >
          <AlertTriangle className="h-3 w-3" />
          <span>Critical Stockout Risk (&lt;3d)</span>
        </button>

        <button
          onClick={() => setFilterType('EXPIRING_SOON')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1 font-medium transition-colors ${
            filterType === 'EXPIRING_SOON'
              ? 'bg-amber-600 text-white font-semibold shadow'
              : 'bg-amber-950/40 text-amber-300 border border-amber-800/40 hover:bg-amber-900/50'
          }`}
        >
          <Clock className="h-3 w-3" />
          <span>Expiring Soon (&lt;30d)</span>
        </button>

        <button
          onClick={() => setFilterType('COLD_CHAIN')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1 font-medium transition-colors ${
            filterType === 'COLD_CHAIN'
              ? 'bg-cyan-600 text-white font-semibold shadow'
              : 'bg-cyan-950/40 text-cyan-300 border border-cyan-800/40 hover:bg-cyan-900/50'
          }`}
        >
          <ThermometerSnowflake className="h-3 w-3" />
          <span>Cold-Chain Only (2°C - 8°C)</span>
        </button>
      </div>

      {/* High-Density Data Table */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="border-b border-slate-800 bg-slate-950/60 text-[11px] uppercase tracking-wider text-slate-400">
            <tr>
              <th className="py-3 px-3">Medicine & Category</th>
              <th className="py-3 px-3">Facility Node</th>
              <th className="py-3 px-3">Batch ID</th>
              <th className="py-3 px-3">Expiry (FEFO)</th>
              <th className="py-3 px-3">Stock on Hand</th>
              <th className="py-3 px-3">Daily Burn Rate</th>
              <th className="py-3 px-3">Days of Cover</th>
              <th className="py-3 px-3">Storage Temp</th>
              <th className="py-3 px-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredBatches.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-500">
                  No medicine batches match your filter criteria.
                </td>
              </tr>
            ) : (
              filteredBatches.map((batch) => {
                const isCritical = batch.daysOfCover <= 3.0;
                const isNearExpiry = batch.daysToExpiry <= 35;
                const coverPercent = Math.min(100, Math.round((batch.daysOfCover / 15) * 100));

                return (
                  <tr
                    key={batch.id}
                    className={`hover:bg-slate-800/30 transition-colors ${
                      isCritical ? 'bg-rose-950/10' : isNearExpiry ? 'bg-amber-950/10' : ''
                    }`}
                  >
                    {/* Medicine Name & Category */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-white">{batch.medicineName}</div>
                      <div className="text-[10px] text-slate-400 font-medium">{batch.category}</div>
                    </td>

                    {/* Facility */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 text-slate-200">
                        <Building2 className="h-3.5 w-3.5 text-slate-500" />
                        <span>{batch.facilityName}</span>
                      </div>
                    </td>

                    {/* Batch Number */}
                    <td className="py-3 px-3 font-mono text-teal-400 text-[11px]">
                      {batch.batchNumber}
                    </td>

                    {/* Expiry Date */}
                    <td className="py-3 px-3">
                      <div className={`font-medium ${isNearExpiry ? 'text-amber-400 font-bold' : 'text-slate-300'}`}>
                        {batch.expiryDate}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {batch.daysToExpiry} days left
                      </div>
                    </td>

                    {/* Stock on Hand */}
                    <td className="py-3 px-3 font-bold text-white">
                      {batch.quantityOnHand} <span className="text-[10px] font-normal text-slate-400">{batch.unit}</span>
                    </td>

                    {/* Daily Consumption Rate */}
                    <td className="py-3 px-3 text-slate-300">
                      {batch.dailyConsumptionRate} {batch.unit}/day
                    </td>

                    {/* Days of Cover */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold ${
                            isCritical ? 'text-rose-400 text-sm' : batch.daysOfCover < 7 ? 'text-amber-400' : 'text-emerald-400'
                          }`}
                        >
                          {batch.daysOfCover}d
                        </span>
                      </div>
                      {/* Visual progress bar */}
                      <div className="mt-1 h-1.5 w-20 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isCritical ? 'bg-rose-500' : batch.daysOfCover < 7 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${coverPercent}%` }}
                        />
                      </div>
                    </td>

                    {/* Cold Chain */}
                    <td className="py-3 px-3">
                      {batch.coldChain.required ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-cyan-300">
                          <ThermometerSnowflake className="h-3 w-3" />
                          2°C - 8°C
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500">Ambient</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-3 text-right">
                      {isCritical ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300 border border-rose-500/40">
                          <AlertTriangle className="h-2.5 w-2.5" />
                          DEFICIT
                        </span>
                      ) : isNearExpiry ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/40">
                          <Clock className="h-2.5 w-2.5" />
                          EXPIRING
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="h-2.5 w-2.5" />
                          OPTIMAL
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
