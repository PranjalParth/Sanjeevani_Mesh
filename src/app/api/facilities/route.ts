import { NextResponse } from 'next/server';
import store from '@/services/store';

export async function GET() {
  const facilities = store.getFacilities();
  const batches = store.getBatches();
  const transfers = store.getTransfers();
  const kpis = store.getKPIs();
  const auditLog = store.getAuditLog();

  return NextResponse.json({
    facilities,
    batches,
    transfers,
    kpis,
    auditLog,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body.action === 'reset') {
      store.resetToDefaults();
      return NextResponse.json({
        success: true,
        message: 'Store reset to baseline',
        facilities: store.getFacilities(),
        batches: store.getBatches(),
        kpis: store.getKPIs(),
      });
    }
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
