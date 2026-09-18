import { FacilityNode, MedicineBatch, RebalanceTransfer, DigitalManifest, TransportMode } from '@/types';

// Haversine distance in kilometers
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  // Apply a 1.28x road detour index for rural Indian district roads
  return Math.round(R * c * 1.28 * 10) / 10;
}

// Estimate road transit time in minutes (avg 42 km/h rural road network)
export function estimateTransitMins(distanceKm: number): number {
  const speedKmH = 42;
  return Math.round((distanceKm / speedKmH) * 60);
}

export function determineTransportMode(distanceKm: number, isColdChain: boolean, urgency: string): TransportMode {
  if (urgency === 'CRITICAL' && distanceKm > 40) {
    return 'MED_DRONE_AIR';
  }
  if (isColdChain) {
    if (distanceKm <= 25) {
      return 'RAPID_BIKE_CARRIER';
    }
    return 'COLD_CHAIN_EV';
  }
  return distanceKm > 35 ? 'DISTRICT_VAN' : 'RAPID_BIKE_CARRIER';
}

export interface RebalanceMatchResult {
  matches: RebalanceTransfer[];
  deficitCount: number;
  surplusCount: number;
  potentialWastageSavedUnits: number;
  criticalStockoutsAverted: number;
}

/**
 * Core Algorithmic Rebalancing Engine
 * Evaluates stock cover, FEFO expiry priorities, geographical distance, and cold-chain constraints.
 */
export function calculateRebalancingPlan(
  facilities: FacilityNode[],
  batches: MedicineBatch[]
): RebalanceMatchResult {
  const facilityMap = new Map<string, FacilityNode>();
  facilities.forEach((f) => facilityMap.set(f.id, f));

  // Identify Deficit Nodes (Days of cover <= 3.0 or quantity <= safety buffer * 0.4)
  const deficitBatches = batches.filter(
    (b) => b.daysOfCover <= 3.0 || b.quantityOnHand <= b.safetyBuffer * 0.4
  );

  const matchedTransfers: RebalanceTransfer[] = [];
  let potentialWastageSaved = 0;
  let criticalAverted = 0;

  for (const deficit of deficitBatches) {
    const recipientFac = facilityMap.get(deficit.facilityId);
    if (!recipientFac) continue;

    // Target cover is 10 days
    const neededDays = Math.max(1, 10 - deficit.daysOfCover);
    const idealUnitsNeeded = Math.ceil(neededDays * deficit.dailyConsumptionRate);

    // Find candidate donor batches for the SAME medicine at other facilities
    const candidateDonors = batches.filter((b) => {
      if (b.medicineId !== deficit.medicineId || b.facilityId === deficit.facilityId) {
        return false;
      }
      // Donor must have adequate cover (at least 8 days cover) and surplus above safety buffer
      const safeSurplus = b.quantityOnHand - b.safetyBuffer;
      return b.daysOfCover >= 8.0 && safeSurplus > 2;
    });

    if (candidateDonors.length === 0) continue;

    // Score candidates based on:
    // 1. FEFO (Near expiry is highest donor priority to prevent wastage)
    // 2. Distance (Closer is better for rapid replenishment and cold-chain fidelity)
    // 3. Available surplus volume
    const scoredCandidates = candidateDonors.map((donor) => {
      const donorFac = facilityMap.get(donor.facilityId);
      const distance = donorFac
        ? calculateDistanceKm(
            donorFac.coordinates.lat,
            donorFac.coordinates.lng,
            recipientFac.coordinates.lat,
            recipientFac.coordinates.lng
          )
        : 999;

      // Expiry Urgency Score (0 to 1, higher if expiring sooner)
      const expiryScore = donor.daysToExpiry <= 35 ? 1.0 : Math.max(0.1, 1 - donor.daysToExpiry / 365);

      // Distance Score (0 to 1, closer is higher)
      const distScore = Math.max(0.1, 1 - distance / 100);

      // Surplus Score
      const surplus = donor.quantityOnHand - donor.safetyBuffer;
      const surplusScore = Math.min(1.0, surplus / idealUnitsNeeded);

      // Weighted Multi-Criteria Total Score
      const totalScore = expiryScore * 0.50 + distScore * 0.35 + surplusScore * 0.15;

      return {
        donor,
        donorFac,
        distance,
        totalScore,
        surplus,
        isNearExpiry: donor.daysToExpiry <= 35,
      };
    });

    // Sort by highest score
    scoredCandidates.sort((a, b) => b.totalScore - a.totalScore);
    const best = scoredCandidates[0];
    if (!best || !best.donorFac) continue;

    // Determine safe transfer quantity
    const unitsToTransfer = Math.min(best.surplus, idealUnitsNeeded);
    if (unitsToTransfer <= 0) continue;

    const transitMins = estimateTransitMins(best.distance);
    const urgency = deficit.daysOfCover <= 1.0 ? 'CRITICAL' : 'HIGH';
    const transportMode = determineTransportMode(best.distance, deficit.coldChain.required, urgency);

    const donorRemaining = best.donor.quantityOnHand - unitsToTransfer;
    const donorRemainingDays = Math.round((donorRemaining / best.donor.dailyConsumptionRate) * 10) / 10;
    const recipientDaysGained = Math.round((unitsToTransfer / deficit.dailyConsumptionRate) * 10) / 10;

    let carrierDescription = 'Passive Insulated Carrier (Ambient 15°C-25°C)';
    if (deficit.coldChain.required) {
      carrierDescription = transportMode === 'MED_DRONE_AIR'
        ? 'AeroCold Active Cryo-Pod (2°C-8°C with GSM Temp Tracker)'
        : best.distance <= 25
        ? 'Conditioned PCM Ice-Lined Box (2°C-8°C, 4h Holdover)'
        : 'Smart Refrig-EV Cargo (Active Temp Controlled 3.5°C)';
    }

    const transfer: RebalanceTransfer = {
      id: `TRF-${best.donor.facilityId.split('-')[1]}-${recipientFac.id.split('-')[1]}-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
      sourceFacilityId: best.donorFac.id,
      sourceFacilityName: best.donorFac.name,
      targetFacilityId: recipientFac.id,
      targetFacilityName: recipientFac.name,
      medicineId: deficit.medicineId,
      medicineName: deficit.medicineName,
      batchNumber: best.donor.batchNumber,
      unitsToTransfer,
      unit: deficit.unit,
      expiryDate: best.donor.expiryDate,
      daysToExpiry: best.donor.daysToExpiry,
      distanceKm: best.distance,
      estDurationMins: transitMins,
      transportMode,
      coldChainCarrier: carrierDescription,
      status: 'RECOMMENDED',
      urgency,
      rationale: `Deficit of ${deficit.quantityOnHand} ${deficit.unit} (${deficit.daysOfCover} days cover) at ${recipientFac.name} matched with ${best.donorFac.name} batch ${best.donor.batchNumber} (${best.donor.daysToExpiry} days to expiry). FEFO rebalancing prevents expiry wastage while boosting ${recipientFac.name} to ${(deficit.daysOfCover + recipientDaysGained).toFixed(1)} days of cover.`,
      donorRemainingDaysCover: donorRemainingDays,
      recipientCoverGainedDays: recipientDaysGained,
      trackingNumber: `SM-IND-${Math.floor(100000 + Math.random() * 900000)}`,
    };

    matchedTransfers.push(transfer);
    if (best.isNearExpiry) {
      potentialWastageSaved += unitsToTransfer;
    }
    criticalAverted++;
  }

  return {
    matches: matchedTransfers,
    deficitCount: deficitBatches.length,
    surplusCount: batches.filter((b) => b.daysToExpiry <= 35 && b.daysOfCover > 15).length,
    potentialWastageSavedUnits: potentialWastageSaved,
    criticalStockoutsAverted: criticalAverted,
  };
}

/**
 * Generate official Government Digital Transfer Manifest for a transfer
 */
export function generateDigitalManifest(transfer: RebalanceTransfer): DigitalManifest {
  const departureDate = new Date();
  const arrivalDate = new Date(departureDate.getTime() + transfer.estDurationMins * 60000);

  return {
    manifestId: `MNF-MP-${transfer.id.replace('TRF-', '')}`,
    transferId: transfer.id,
    generatedAt: departureDate.toISOString(),
    authorizedOfficer: 'Dr. R.K. Bhargava (District Health Logistician, CMHO Bhopal Cluster)',
    sourceFacility: {
      name: transfer.sourceFacilityName,
      code: transfer.sourceFacilityId,
      medicalOfficer: 'Verified by Facility MO I/C',
      signatureStatus: 'VERIFIED',
    },
    destinationFacility: {
      name: transfer.targetFacilityName,
      code: transfer.targetFacilityId,
      medicalOfficer: 'Assigned to Receiving Pharmacist',
      acknowledgementStatus: 'PENDING',
    },
    consignment: {
      medicineName: transfer.medicineName,
      batchNumber: transfer.batchNumber,
      quantity: transfer.unitsToTransfer,
      unit: transfer.unit,
      expiryDate: transfer.expiryDate,
      daysRemaining: transfer.daysToExpiry,
    },
    logistics: {
      distanceKm: transfer.distanceKm,
      expectedTransitDuration: `${transfer.estDurationMins} minutes`,
      transportMode: transfer.transportMode,
      carrierType: transfer.coldChainCarrier,
      targetTempRange: '2.0°C - 8.0°C (ILR Standard)',
      departureTime: departureDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      estimatedArrival: arrivalDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
    securityHash: `SHA256-${Math.random().toString(36).substring(2, 12).toUpperCase()}-${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
  };
}
