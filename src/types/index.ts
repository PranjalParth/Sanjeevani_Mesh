export type FacilityType = 'PHC' | 'CHC' | 'SDH' | 'DH';

export type StockStatus = 'HEALTHY' | 'NEAR_EXPIRY_SURPLUS' | 'CRITICAL_DEFICIT' | 'STOCKOUT';

export type TransferStatus = 'RECOMMENDED' | 'DISPATCHED' | 'IN_TRANSIT' | 'DELIVERED';

export type TransportMode = 'COLD_CHAIN_EV' | 'RAPID_BIKE_CARRIER' | 'MED_DRONE_AIR' | 'DISTRICT_VAN';

export interface ColdChainSpec {
  required: boolean;
  minTempC: number;
  maxTempC: number;
  storageType: 'ILR_2_8' | 'DEEP_FREEZER_MINUS_20' | 'ROOM_TEMP';
}

export interface MedicineBatch {
  id: string;
  facilityId: string;
  facilityName: string;
  medicineId: string;
  medicineName: string;
  category: 'Critical Antidote' | 'Vaccine' | 'Endocrine' | 'Maternal Health' | 'Anti-Infective' | 'Essential Fluid';
  batchNumber: string;
  mfgDate: string;
  expiryDate: string;
  daysToExpiry: number;
  quantityOnHand: number;
  unit: string;
  dailyConsumptionRate: number;
  safetyBuffer: number;
  daysOfCover: number;
  status: StockStatus;
  coldChain: ColdChainSpec;
  isLifeSavingPriority: boolean;
}

export interface FacilityNode {
  id: string;
  name: string;
  code: string;
  district: string;
  subDistrict: string;
  type: FacilityType;
  coordinates: {
    lat: number;
    lng: number;
  };
  contactPerson: string;
  contactPhone: string;
  coldChainCapacity: {
    ilrLiters: number;
    freezerLiters: number;
    solarPowered: boolean;
    activeSensors: boolean;
    ambientTempC: number;
    storageTempC: number;
  };
  stockSummary: {
    totalBatches: number;
    criticalDeficits: number;
    nearExpirySurplus: number;
    overallHealthIndex: number; // 0 - 100
  };
}

export interface RebalanceTransfer {
  id: string;
  createdAt: string;
  sourceFacilityId: string;
  sourceFacilityName: string;
  targetFacilityId: string;
  targetFacilityName: string;
  medicineId: string;
  medicineName: string;
  batchNumber: string;
  unitsToTransfer: number;
  unit: string;
  expiryDate: string;
  daysToExpiry: number;
  distanceKm: number;
  estDurationMins: number;
  transportMode: TransportMode;
  coldChainCarrier: string;
  status: TransferStatus;
  urgency: 'HIGH' | 'CRITICAL' | 'MEDIUM';
  rationale: string;
  donorRemainingDaysCover: number;
  recipientCoverGainedDays: number;
  trackingNumber: string;
}

export interface DigitalManifest {
  manifestId: string;
  transferId: string;
  generatedAt: string;
  authorizedOfficer: string;
  sourceFacility: {
    name: string;
    code: string;
    medicalOfficer: string;
    signatureStatus: 'VERIFIED' | 'PENDING';
  };
  destinationFacility: {
    name: string;
    code: string;
    medicalOfficer: string;
    acknowledgementStatus: 'PENDING' | 'ACCEPTED';
  };
  consignment: {
    medicineName: string;
    batchNumber: string;
    quantity: number;
    unit: string;
    expiryDate: string;
    daysRemaining: number;
  };
  logistics: {
    distanceKm: number;
    expectedTransitDuration: string;
    transportMode: string;
    carrierType: string;
    targetTempRange: string;
    departureTime: string;
    estimatedArrival: string;
  };
  securityHash: string;
}

export interface KPISummary {
  totalFacilities: number;
  stockoutRiskCount: number;
  nearExpiryBatchCount: number;
  rebalancedTodayCount: number;
  unitsRebalancedToday: number;
  coldChainComplianceRate: number; // percentage, e.g. 99.2
  vulnerablePopulationsCovered: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  content: string;
  reasoningSteps?: string[];
  suggestedAction?: {
    type: 'NAVIGATE' | 'TRIGGER_REBALANCE' | 'VIEW_MANIFEST';
    payload?: any;
    label: string;
  };
}
