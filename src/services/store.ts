import { FacilityNode, MedicineBatch, RebalanceTransfer, KPISummary, DigitalManifest } from '@/types';
import { INITIAL_FACILITIES, INITIAL_BATCHES, INITIAL_KPIS } from '@/data/mockData';
import { calculateRebalancingPlan, generateDigitalManifest } from './rebalancer';

class SanjeevaniStore {
  private facilities: FacilityNode[] = [];
  private batches: MedicineBatch[] = [];
  private transfers: RebalanceTransfer[] = [];
  private manifests: Map<string, DigitalManifest> = new Map();
  private kpis: KPISummary = { ...INITIAL_KPIS };
  private auditLog: Array<{ id: string; timestamp: string; action: string; details: string }> = [];

  constructor() {
    this.resetToDefaults();
  }

  public resetToDefaults() {
    this.facilities = JSON.parse(JSON.stringify(INITIAL_FACILITIES));
    this.batches = JSON.parse(JSON.stringify(INITIAL_BATCHES));
    this.transfers = [];
    this.manifests.clear();
    this.kpis = { ...INITIAL_KPIS };
    this.auditLog = [
      {
        id: 'LOG-INIT',
        timestamp: new Date().toISOString(),
        action: 'SYSTEM_INITIALIZED',
        details: 'Sanjeevani-Mesh connected to 7 district nodes. Inventory baseline synchronized with Firestore mirror.',
      },
    ];
    this.recalculateHealthIndices();
  }

  public getFacilities(): FacilityNode[] {
    return this.facilities;
  }

  public getBatches(): MedicineBatch[] {
    return this.batches;
  }

  public getTransfers(): RebalanceTransfer[] {
    return this.transfers;
  }

  public getManifest(transferId: string): DigitalManifest | undefined {
    return this.manifests.get(transferId);
  }

  public getKPIs(): KPISummary {
    return this.kpis;
  }

  public getAuditLog() {
    return this.auditLog;
  }

  /**
   * Recalculates facility health index based on days of cover and deficits
   */
  private recalculateHealthIndices() {
    const deficitCount = this.batches.filter((b) => b.daysOfCover <= 3.0).length;
    const nearExpiryCount = this.batches.filter((b) => b.daysToExpiry <= 35).length;

    this.kpis.stockoutRiskCount = deficitCount;
    this.kpis.nearExpiryBatchCount = nearExpiryCount;

    for (const facility of this.facilities) {
      const facBatches = this.batches.filter((b) => b.facilityId === facility.id);
      const facDeficits = facBatches.filter((b) => b.daysOfCover <= 3.0).length;
      const facNearExpiry = facBatches.filter((b) => b.daysToExpiry <= 35).length;

      let score = 100;
      score -= facDeficits * 35;
      score -= facNearExpiry * 10;
      facility.stockSummary = {
        totalBatches: facBatches.length,
        criticalDeficits: facDeficits,
        nearExpirySurplus: facNearExpiry,
        overallHealthIndex: Math.max(25, Math.min(100, score)),
      };
    }
  }

  /**
   * Run the algorithmic matcher without committing changes
   */
  public detectRebalanceOpportunities() {
    return calculateRebalancingPlan(this.facilities, this.batches);
  }

  /**
   * Commit and execute a rebalance transfer
   */
  public executeTransfer(transfer: RebalanceTransfer): { success: boolean; manifest: DigitalManifest } {
    const donorBatch = this.batches.find(
      (b) => b.facilityId === transfer.sourceFacilityId && b.batchNumber === transfer.batchNumber
    );

    const recipientBatch = this.batches.find(
      (b) => b.facilityId === transfer.targetFacilityId && b.medicineId === transfer.medicineId
    );

    if (!donorBatch) {
      throw new Error(`Donor batch ${transfer.batchNumber} not found.`);
    }

    // Deduct from donor
    donorBatch.quantityOnHand = Math.max(0, donorBatch.quantityOnHand - transfer.unitsToTransfer);
    donorBatch.daysOfCover = Math.round((donorBatch.quantityOnHand / donorBatch.dailyConsumptionRate) * 10) / 10;
    if (donorBatch.daysOfCover <= 3.0) {
      donorBatch.status = 'CRITICAL_DEFICIT';
    } else if (donorBatch.daysToExpiry <= 35) {
      donorBatch.status = 'NEAR_EXPIRY_SURPLUS';
    } else {
      donorBatch.status = 'HEALTHY';
    }

    // Credit to recipient
    if (recipientBatch) {
      recipientBatch.quantityOnHand += transfer.unitsToTransfer;
      recipientBatch.daysOfCover = Math.round((recipientBatch.quantityOnHand / recipientBatch.dailyConsumptionRate) * 10) / 10;
      recipientBatch.status = recipientBatch.daysOfCover <= 3.0 ? 'CRITICAL_DEFICIT' : 'HEALTHY';
    } else {
      // Create new batch entry at recipient
      const newBatch: MedicineBatch = {
        id: `BAT-REC-${Date.now().toString().slice(-4)}`,
        facilityId: transfer.targetFacilityId,
        facilityName: transfer.targetFacilityName,
        medicineId: transfer.medicineId,
        medicineName: transfer.medicineName,
        category: donorBatch.category,
        batchNumber: transfer.batchNumber,
        mfgDate: donorBatch.mfgDate,
        expiryDate: transfer.expiryDate,
        daysToExpiry: transfer.daysToExpiry,
        quantityOnHand: transfer.unitsToTransfer,
        unit: transfer.unit,
        dailyConsumptionRate: 2.0,
        safetyBuffer: 10,
        daysOfCover: Math.round((transfer.unitsToTransfer / 2.0) * 10) / 10,
        status: 'HEALTHY',
        coldChain: { ...donorBatch.coldChain },
        isLifeSavingPriority: true,
      };
      this.batches.push(newBatch);
    }

    // Generate manifest and update transfer state
    transfer.status = 'DISPATCHED';
    this.transfers.unshift(transfer);
    const manifest = generateDigitalManifest(transfer);
    this.manifests.set(transfer.id, manifest);

    // Update KPIs
    this.kpis.rebalancedTodayCount += 1;
    this.kpis.unitsRebalancedToday += transfer.unitsToTransfer;

    // Recalculate facility health
    this.recalculateHealthIndices();

    // Log to audit
    this.auditLog.unshift({
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'REBALANCE_DISPATCHED',
      details: `Dispatched ${transfer.unitsToTransfer} ${transfer.unit} of ${transfer.medicineName} (${transfer.batchNumber}) from ${transfer.sourceFacilityName} to ${transfer.targetFacilityName} via ${transfer.transportMode}. ETA: ${transfer.estDurationMins}m.`,
    });

    return { success: true, manifest };
  }

  /**
   * Execute all recommended transfers at once
   */
  public executeAllRecommended(): { executedCount: number; manifests: DigitalManifest[] } {
    const plan = this.detectRebalanceOpportunities();
    const manifests: DigitalManifest[] = [];

    for (const match of plan.matches) {
      const res = this.executeTransfer(match);
      manifests.push(res.manifest);
    }

    return { executedCount: plan.matches.length, manifests };
  }
}

// Global singleton instance for the application runtime
const globalStore = (globalThis as any).__sanjeevani_store || new SanjeevaniStore();
if (process.env.NODE_ENV !== 'production') {
  (globalThis as any).__sanjeevani_store = globalStore;
}

export default globalStore as SanjeevaniStore;
