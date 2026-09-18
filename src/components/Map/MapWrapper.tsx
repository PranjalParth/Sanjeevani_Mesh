'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { FacilityNode, MedicineBatch, RebalanceTransfer } from '@/types';
import { Loader2 } from 'lucide-react';

interface MapWrapperProps {
  facilities: FacilityNode[];
  batches: MedicineBatch[];
  activeTransfers: RebalanceTransfer[];
  recommendedTransfers: RebalanceTransfer[];
  onSelectTransfer?: (transfer: RebalanceTransfer) => void;
}

const DynamicDistrictMap = dynamic(
  () => import('./DistrictMap').then((mod) => mod.DistrictMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[480px] w-full flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-900/60">
        <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
        <span className="mt-2 text-xs font-medium text-slate-400">
          Loading Geospatial District Mesh...
        </span>
      </div>
    ),
  }
);

export const MapWrapper: React.FC<MapWrapperProps> = (props) => {
  return <DynamicDistrictMap {...props} />;
};
