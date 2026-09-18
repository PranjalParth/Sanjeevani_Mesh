'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip as LeafletTooltip } from 'react-leaflet';
import L from 'leaflet';
import { FacilityNode, MedicineBatch, RebalanceTransfer } from '@/types';
import { Building2, AlertTriangle, ThermometerSnowflake, Truck, Navigation, CheckCircle2 } from 'lucide-react';

interface DistrictMapProps {
  facilities: FacilityNode[];
  batches: MedicineBatch[];
  activeTransfers: RebalanceTransfer[];
  recommendedTransfers: RebalanceTransfer[];
  onSelectTransfer?: (transfer: RebalanceTransfer) => void;
}

// Custom Leaflet DivIcons using SVGs with pulsing effects
function createNodeIcon(status: 'HEALTHY' | 'SURPLUS' | 'DEFICIT', label: string) {
  let color = '#10b981'; // green
  let pulseClass = '';
  let badgeColor = 'bg-emerald-500';

  if (status === 'DEFICIT') {
    color = '#f43f5e'; // red
    pulseClass = 'critical-pulse';
    badgeColor = 'bg-rose-500';
  } else if (status === 'SURPLUS') {
    color = '#f59e0b'; // amber
    badgeColor = 'bg-amber-500';
  }

  const html = `
    <div class="relative flex items-center justify-center">
      <div class="h-9 w-9 rounded-full ${pulseClass} flex items-center justify-center shadow-lg" style="background: ${color}; border: 2.5px solid #ffffff;">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2v20M2 12h20"/>
        </svg>
      </div>
      <div class="absolute -bottom-5 whitespace-nowrap rounded bg-slate-900/90 px-1.5 py-0.5 text-[9px] font-bold text-white shadow border border-slate-700">
        ${label}
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-node-pin',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
}

export const DistrictMap: React.FC<DistrictMapProps> = ({
  facilities,
  batches,
  activeTransfers,
  recommendedTransfers,
  onSelectTransfer,
}) => {
  // Center around Central Madhya Pradesh (Bhopal / Sehore / Raisen region)
  const centerPosition: [number, number] = [23.2599, 77.4126];

  // Combine transfers to draw connecting lines
  const allRoutes = [...recommendedTransfers, ...activeTransfers];

  return (
    <div className="relative h-[480px] w-full overflow-hidden rounded-xl border border-slate-800 bg-[#090d16] shadow-xl">
      {/* Top Map Overlay Info Header */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-wrap items-center gap-2 rounded-lg bg-slate-900/90 p-2 text-xs font-medium text-slate-300 backdrop-blur border border-slate-700/80 shadow-lg">
        <span className="flex items-center gap-1.5 text-white font-semibold">
          <Navigation className="h-3.5 w-3.5 text-teal-400" />
          Central MP District Mesh
        </span>
        <span className="h-3 w-px bg-slate-700" />
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-500 critical-pulse" />
          <span className="text-[11px] text-rose-300 font-semibold">Deficit (&lt;3d)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          <span className="text-[11px] text-amber-300 font-semibold">Near Expiry Donor</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span className="text-[11px] text-emerald-300 font-semibold">Healthy</span>
        </div>
      </div>

      {/* Rebalance Route Badge Overlay */}
      {allRoutes.length > 0 && (
        <div className="absolute top-3 right-3 z-[1000] rounded-lg bg-teal-950/90 p-2 text-xs font-medium text-teal-300 backdrop-blur border border-teal-600/40 shadow-lg flex items-center gap-2">
          <Truck className="h-4 w-4 text-teal-400 animate-pulse" />
          <span>{allRoutes.length} Active Transfer Corridor(s)</span>
        </div>
      )}

      <MapContainer
        center={centerPosition}
        zoom={10}
        scrollWheelZoom={false}
        className="h-full w-full dark-tiles"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Facility Markers */}
        {facilities.map((facility) => {
          const facBatches = batches.filter((b) => b.facilityId === facility.id);
          const hasDeficit = facBatches.some((b) => b.daysOfCover <= 3.0);
          const hasNearExpiry = facBatches.some((b) => b.daysToExpiry <= 35 && b.quantityOnHand > b.safetyBuffer);

          const status = hasDeficit ? 'DEFICIT' : hasNearExpiry ? 'SURPLUS' : 'HEALTHY';
          const icon = createNodeIcon(status, facility.code.split('-')[2]);

          const criticalBatch = facBatches.find((b) => b.daysOfCover <= 3.0);
          const surplusBatch = facBatches.find((b) => b.daysToExpiry <= 35);

          return (
            <Marker
              key={facility.id}
              position={[facility.coordinates.lat, facility.coordinates.lng]}
              icon={icon}
            >
              <Popup className="custom-popup">
                <div className="p-1 min-w-[240px]">
                  <div className="flex items-start justify-between border-b border-slate-700/80 pb-2">
                    <div>
                      <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                        <Building2 className="h-4 w-4 text-teal-400" />
                        {facility.name}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {facility.type} &bull; {facility.district} District ({facility.code})
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        hasDeficit
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          : hasNearExpiry
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      }`}
                    >
                      {status}
                    </span>
                  </div>

                  <div className="mt-2 space-y-1.5 text-xs text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Medical Officer:</span>
                      <span className="font-medium text-slate-200">{facility.contactPerson}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 flex items-center gap-1">
                        <ThermometerSnowflake className="h-3 w-3 text-cyan-400" /> Cold Storage:
                      </span>
                      <span className="font-medium text-emerald-400">
                        {facility.coldChainCapacity.storageTempC}°C (ILR: {facility.coldChainCapacity.ilrLiters}L)
                      </span>
                    </div>

                    {hasDeficit && criticalBatch && (
                      <div className="mt-2 rounded bg-rose-950/40 p-1.5 border border-rose-800/60 text-[11px] text-rose-300">
                        <span className="font-bold text-rose-200">Deficit Alert:</span> {criticalBatch.medicineName}
                        <br />
                        Stock: <strong>{criticalBatch.quantityOnHand} {criticalBatch.unit}</strong> ({criticalBatch.daysOfCover} days cover remaining!)
                      </div>
                    )}

                    {hasNearExpiry && surplusBatch && (
                      <div className="mt-2 rounded bg-amber-950/40 p-1.5 border border-amber-800/60 text-[11px] text-amber-300">
                        <span className="font-bold text-amber-200">FEFO Donor Stock:</span> {surplusBatch.medicineName}
                        <br />
                        Expiring in: <strong>{surplusBatch.daysToExpiry} days</strong> (Qty: {surplusBatch.quantityOnHand})
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Transfer Corridors (Polylines) */}
        {allRoutes.map((route) => {
          const source = facilities.find((f) => f.id === route.sourceFacilityId);
          const target = facilities.find((f) => f.id === route.targetFacilityId);
          if (!source || !target) return null;

          const positions: [number, number][] = [
            [source.coordinates.lat, source.coordinates.lng],
            [target.coordinates.lat, target.coordinates.lng],
          ];

          const isDispatched = route.status === 'DISPATCHED' || route.status === 'IN_TRANSIT';

          return (
            <React.Fragment key={route.id}>
              <Polyline
                positions={positions}
                pathOptions={{
                  color: isDispatched ? '#10b981' : '#0ea5e9',
                  weight: 3.5,
                  dashArray: isDispatched ? undefined : '6, 8',
                  opacity: 0.85,
                }}
              >
                <LeafletTooltip sticky className="custom-route-tooltip">
                  <div className="text-xs p-1">
                    <div className="font-bold text-teal-300">
                      {route.medicineName.split('(')[0]}
                    </div>
                    <div>
                      {route.sourceFacilityName} ➔ {route.targetFacilityName}
                    </div>
                    <div className="text-slate-400 text-[10px]">
                      Distance: <strong>{route.distanceKm} km</strong> &bull; ETA: <strong>{route.estDurationMins}m</strong>
                    </div>
                    <div className="text-cyan-300 text-[10px]">
                      Carrier: {route.coldChainCarrier}
                    </div>
                  </div>
                </LeafletTooltip>
              </Polyline>
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
};
