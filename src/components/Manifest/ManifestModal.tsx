'use client';

import React from 'react';
import { DigitalManifest } from '@/types';
import { X, Printer, ShieldCheck, QrCode, FileText, CheckCircle2, ThermometerSnowflake, Truck, Clock } from 'lucide-react';

interface ManifestModalProps {
  manifest: DigitalManifest | null;
  onClose: () => void;
}

export const ManifestModal: React.FC<ManifestModalProps> = ({ manifest, onClose }) => {
  if (!manifest) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-700 bg-[#0f172a] shadow-2xl text-slate-100 max-h-[90vh] flex flex-col">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-teal-500/10 p-2 text-teal-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Government Digital Medicine Transfer Manifest</h3>
              <p className="text-xs text-slate-400">National Health Mission &bull; Inter-Facility Cold-Chain Redistribution</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Printable Manifest Document Area */}
        <div className="overflow-y-auto p-6 space-y-5 print:p-0 print:bg-white print:text-black">
          {/* Official Document Banner */}
          <div className="rounded-xl border border-teal-500/30 bg-teal-950/20 p-4 text-center">
            <div className="text-[11px] font-bold uppercase tracking-widest text-teal-400">
              Directorate of Health Services &bull; Madhya Pradesh
            </div>
            <h2 className="text-lg font-black text-white mt-0.5">
              OFFICIAL DRUG REDISTRIBUTION & DISPATCH CONSIGNMENT
            </h2>
            <div className="mt-1 flex justify-center items-center gap-3 text-xs text-slate-400">
              <span>Manifest ID: <strong className="text-slate-200">{manifest.manifestId}</strong></span>
              <span>&bull;</span>
              <span>Timestamp: <strong className="text-slate-200">{new Date(manifest.generatedAt).toLocaleString()}</strong></span>
            </div>
          </div>

          {/* Consignment Item Details */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400 mb-3 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> 1. Medicine & Batch Information
            </h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400">Medicine Description:</span>
                <p className="font-semibold text-white mt-0.5">{manifest.consignment.medicineName}</p>
              </div>
              <div>
                <span className="text-slate-400">Batch Number:</span>
                <p className="font-semibold text-teal-300 font-mono mt-0.5">{manifest.consignment.batchNumber}</p>
              </div>
              <div>
                <span className="text-slate-400">Quantity Dispatched:</span>
                <p className="text-sm font-bold text-emerald-400 mt-0.5">
                  {manifest.consignment.quantity} {manifest.consignment.unit}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Expiry Date (FEFO Audit):</span>
                <p className="font-semibold text-amber-300 mt-0.5">
                  {manifest.consignment.expiryDate} ({manifest.consignment.daysRemaining} days remaining)
                </p>
              </div>
            </div>
          </div>

          {/* Origin & Destination Nodes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Donor Facility (Source)</span>
              <p className="font-bold text-white text-sm mt-1">{manifest.sourceFacility.name}</p>
              <p className="text-xs text-slate-400">Code: {manifest.sourceFacility.code}</p>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
                <span>MO Sign-Off: {manifest.sourceFacility.signatureStatus}</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Recipient Facility (Deficit)</span>
              <p className="font-bold text-white text-sm mt-1">{manifest.destinationFacility.name}</p>
              <p className="text-xs text-slate-400">Code: {manifest.destinationFacility.code}</p>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-400">
                <Clock className="h-4 w-4" />
                <span>Status: In-Transit (ETA {manifest.logistics.expectedTransitDuration})</span>
              </div>
            </div>
          </div>

          {/* Logistics & Cold-Chain Protocol */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-1.5">
              <ThermometerSnowflake className="h-4 w-4" /> 2. Logistics & Cold-Chain Verification
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-400">Transit Distance:</span>
                <p className="font-semibold text-white">{manifest.logistics.distanceKm} km</p>
              </div>
              <div>
                <span className="text-slate-400">Transport Carrier:</span>
                <p className="font-semibold text-white">{manifest.logistics.transportMode}</p>
              </div>
              <div>
                <span className="text-slate-400">Cold-Chain Specification:</span>
                <p className="font-semibold text-cyan-300">{manifest.logistics.targetTempRange}</p>
              </div>
              <div>
                <span className="text-slate-400">Carrier Equipment:</span>
                <p className="font-semibold text-slate-200">{manifest.logistics.carrierType}</p>
              </div>
              <div>
                <span className="text-slate-400">Departure Timestamp:</span>
                <p className="font-semibold text-slate-200">{manifest.logistics.departureTime}</p>
              </div>
              <div>
                <span className="text-slate-400">Expected Arrival:</span>
                <p className="font-semibold text-emerald-400">{manifest.logistics.estimatedArrival}</p>
              </div>
            </div>
          </div>

          {/* Cryptographic Verification & QR */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950/80 p-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-white p-2 text-slate-950">
                <QrCode className="h-10 w-10" />
              </div>
              <div>
                <span className="font-semibold text-slate-300">Digital Audit Trail & Hash</span>
                <p className="font-mono text-[10px] text-teal-400/90 break-all">{manifest.securityHash}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">GCP Vertex AI & BigQuery Ledger Traceability Token</p>
              </div>
            </div>
            <div className="text-right sm:border-l sm:border-slate-800 sm:pl-4">
              <span className="text-slate-400 text-[11px]">Authorized Controller:</span>
              <p className="font-bold text-white text-xs">{manifest.authorizedOfficer}</p>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between border-t border-slate-800 bg-slate-900/90 px-6 py-3">
          <span className="text-xs text-slate-400">Status: Dispatched & Under GPS/Temperature Telemetry</span>
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
            >
              <Printer className="h-4 w-4" />
              <span>Print Manifest</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg bg-teal-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-teal-500 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
