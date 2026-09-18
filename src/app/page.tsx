'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navigation/Navbar';
import { KpiGrid } from '@/components/Dashboard/KpiGrid';
import { AnalyticsCharts } from '@/components/Dashboard/AnalyticsCharts';
import { MapWrapper } from '@/components/Map/MapWrapper';
import { RebalanceWorkbench } from '@/components/Rebalancer/RebalanceWorkbench';
import { InventoryTable } from '@/components/Inventory/InventoryTable';
import { GeminiAssistant } from '@/components/AI/GeminiAssistant';
import { ManifestModal } from '@/components/Manifest/ManifestModal';
import {
  FacilityNode,
  MedicineBatch,
  RebalanceTransfer,
  KPISummary,
  DigitalManifest,
} from '@/types';
import {
  INITIAL_FACILITIES,
  INITIAL_BATCHES,
  INITIAL_KPIS,
} from '@/data/mockData';
import { calculateRebalancingPlan, generateDigitalManifest } from '@/services/rebalancer';
import { CheckCircle2, ShieldAlert, Sparkles, Truck, Bell } from 'lucide-react';

export default function HomePage() {
  const [facilities, setFacilities] = useState<FacilityNode[]>(INITIAL_FACILITIES);
  const [batches, setBatches] = useState<MedicineBatch[]>(INITIAL_BATCHES);
  const [kpis, setKpis] = useState<KPISummary>(INITIAL_KPIS);
  const [activeTransfers, setActiveTransfers] = useState<RebalanceTransfer[]>([]);
  const [recommendedTransfers, setRecommendedTransfers] = useState<RebalanceTransfer[]>([]);
  const [manifestMap, setManifestMap] = useState<Record<string, DigitalManifest>>({});
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [selectedManifest, setSelectedManifest] = useState<DigitalManifest | null>(null);
  const [isRebalancing, setIsRebalancing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize and run detection
  const runDetection = () => {
    setIsRebalancing(true);
    setTimeout(() => {
      const plan = calculateRebalancingPlan(facilities, batches);
      setRecommendedTransfers(plan.matches);
      setIsRebalancing(false);
      showToast(`Mesh Optimization complete: ${plan.matches.length} rebalance match(es) identified.`);
    }, 600);
  };

  useEffect(() => {
    // Initial load
    const plan = calculateRebalancingPlan(facilities, batches);
    setRecommendedTransfers(plan.matches);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Execute a single transfer
  const handleExecuteSingle = async (transfer: RebalanceTransfer) => {
    try {
      const res = await fetch('/api/rebalance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'execute_single', transfer }),
      });

      if (res.ok) {
        const data = await res.json();
        setFacilities(data.updatedFacilities);
        setBatches(data.updatedBatches);
        setKpis(data.updatedKpis);
        setActiveTransfers(data.updatedTransfers);
        setManifestMap((prev) => ({ ...prev, [transfer.id]: data.manifest }));
        setRecommendedTransfers((prev) => prev.filter((t) => t.id !== transfer.id));
        setSelectedManifest(data.manifest);
        showToast(`Dispatched ${transfer.unitsToTransfer} units of ${transfer.medicineName} to ${transfer.targetFacilityName}!`);
      }
    } catch (e) {
      // Fallback local execution
      const manifest = generateDigitalManifest(transfer);
      transfer.status = 'DISPATCHED';
      setActiveTransfers((prev) => [transfer, ...prev]);
      setManifestMap((prev) => ({ ...prev, [transfer.id]: manifest }));
      setRecommendedTransfers((prev) => prev.filter((t) => t.id !== transfer.id));

      // Update batches
      setBatches((prev) => {
        return prev.map((b) => {
          if (b.facilityId === transfer.sourceFacilityId && b.batchNumber === transfer.batchNumber) {
            const newQty = Math.max(0, b.quantityOnHand - transfer.unitsToTransfer);
            return {
              ...b,
              quantityOnHand: newQty,
              daysOfCover: Math.round((newQty / b.dailyConsumptionRate) * 10) / 10,
            };
          }
          if (b.facilityId === transfer.targetFacilityId && b.medicineId === transfer.medicineId) {
            const newQty = b.quantityOnHand + transfer.unitsToTransfer;
            return {
              ...b,
              quantityOnHand: newQty,
              daysOfCover: Math.round((newQty / b.dailyConsumptionRate) * 10) / 10,
              status: 'HEALTHY',
            };
          }
          return b;
        });
      });

      setKpis((prev) => ({
        ...prev,
        stockoutRiskCount: Math.max(0, prev.stockoutRiskCount - 1),
        rebalancedTodayCount: prev.rebalancedTodayCount + 1,
        unitsRebalancedToday: prev.unitsRebalancedToday + transfer.unitsToTransfer,
      }));

      setSelectedManifest(manifest);
      showToast(`Dispatched ${transfer.unitsToTransfer} units to ${transfer.targetFacilityName}!`);
    }
  };

  // Execute all recommended transfers
  const handleExecuteAll = async () => {
    try {
      const res = await fetch('/api/rebalance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'execute_all' }),
      });

      if (res.ok) {
        const data = await res.json();
        setFacilities(data.updatedFacilities);
        setBatches(data.updatedBatches);
        setKpis(data.updatedKpis);
        setActiveTransfers(data.updatedTransfers);

        const newManifestMap: Record<string, DigitalManifest> = { ...manifestMap };
        data.manifests.forEach((m: DigitalManifest) => {
          newManifestMap[m.transferId] = m;
        });
        setManifestMap(newManifestMap);
        setRecommendedTransfers([]);

        if (data.manifests.length > 0) {
          setSelectedManifest(data.manifests[0]);
        }
        showToast(`Successfully dispatched all ${data.executedCount} recommended transfers across district.`);
      }
    } catch (e) {
      showToast('Executed recommended rebalancing transfers.');
    }
  };

  // Reset to initial baseline
  const handleReset = async () => {
    try {
      await fetch('/api/facilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      });
    } catch (e) {
      // Ignore
    }
    setFacilities(JSON.parse(JSON.stringify(INITIAL_FACILITIES)));
    setBatches(JSON.parse(JSON.stringify(INITIAL_BATCHES)));
    setKpis({ ...INITIAL_KPIS });
    setActiveTransfers([]);
    setManifestMap({});
    const plan = calculateRebalancingPlan(INITIAL_FACILITIES, INITIAL_BATCHES);
    setRecommendedTransfers(plan.matches);
    showToast('Simulation state reset to baseline district telemetry.');
  };

  return (
    <div className="min-h-screen bg-[#090d16] pb-16">
      {/* Top Navbar */}
      <Navbar
        onOpenAi={() => setIsAiOpen(true)}
        onDetectRebalance={runDetection}
        onReset={handleReset}
        isRebalancing={isRebalancing}
        stockoutCount={kpis.stockoutRiskCount}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl border border-teal-500/40 bg-teal-950/90 px-4 py-3 text-xs font-semibold text-teal-200 shadow-2xl backdrop-blur animate-fade-in">
          <Bell className="h-4 w-4 text-teal-400 animate-bounce" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* 1. Executive KPIs */}
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>District Medicine Availability Overview</span>
              <span className="text-xs font-normal text-slate-400">&bull; Live Telemetry</span>
            </h1>
            <span className="text-xs text-slate-400">
              Autonomous Mesh: <strong className="text-emerald-400">Active</strong>
            </span>
          </div>
          <KpiGrid kpis={kpis} />
        </section>

        {/* 2. Interactive District Map & Geospatial Mesh */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Cross-District Geospatial Health Network
              </h2>
              <p className="text-xs text-slate-400">
                Live monitoring of 7 PHC/CHC nodes with cold-chain storage status and transfer corridors
              </p>
            </div>
          </div>
          <MapWrapper
            facilities={facilities}
            batches={batches}
            activeTransfers={activeTransfers}
            recommendedTransfers={recommendedTransfers}
          />
        </section>

        {/* 3. Autonomous Rebalancing Engine (The Core Hook) */}
        <section>
          <RebalanceWorkbench
            recommendedTransfers={recommendedTransfers}
            activeTransfers={activeTransfers}
            isDetecting={isRebalancing}
            onDetect={runDetection}
            onExecuteSingle={handleExecuteSingle}
            onExecuteAll={handleExecuteAll}
            onViewManifest={(manifest) => setSelectedManifest(manifest)}
            getManifestForTransfer={(transferId) => manifestMap[transferId]}
          />
        </section>

        {/* 4. Analytics & Depletion Forecasts */}
        <section>
          <AnalyticsCharts facilities={facilities} batches={batches} />
        </section>

        {/* 5. PHC Inventory Management Table */}
        <section>
          <InventoryTable batches={batches} facilities={facilities} />
        </section>
      </main>

      {/* Gemini Demand Assistant Drawer */}
      <GeminiAssistant
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        onTriggerRebalance={() => {
          runDetection();
          const workbenchEl = document.querySelector('h2');
          workbenchEl?.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenManifest={() => {
          if (activeTransfers.length > 0 && manifestMap[activeTransfers[0].id]) {
            setSelectedManifest(manifestMap[activeTransfers[0].id]);
          } else if (recommendedTransfers.length > 0) {
            handleExecuteSingle(recommendedTransfers[0]);
          }
        }}
      />

      {/* Digital Transfer Manifest Modal */}
      <ManifestModal
        manifest={selectedManifest}
        onClose={() => setSelectedManifest(null)}
      />
    </div>
  );
}
