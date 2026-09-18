import { NextResponse } from 'next/server';
import store from '@/services/store';

export async function GET() {
  const plan = store.detectRebalanceOpportunities();
  return NextResponse.json(plan);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.action === 'execute_all') {
      const result = store.executeAllRecommended();
      return NextResponse.json({
        success: true,
        executedCount: result.executedCount,
        manifests: result.manifests,
        updatedFacilities: store.getFacilities(),
        updatedBatches: store.getBatches(),
        updatedKpis: store.getKPIs(),
        updatedTransfers: store.getTransfers(),
      });
    }

    if (body.action === 'execute_single' && body.transfer) {
      const result = store.executeTransfer(body.transfer);
      return NextResponse.json({
        success: true,
        manifest: result.manifest,
        updatedFacilities: store.getFacilities(),
        updatedBatches: store.getBatches(),
        updatedKpis: store.getKPIs(),
        updatedTransfers: store.getTransfers(),
      });
    }

    return NextResponse.json({ error: 'Unknown rebalancing action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
