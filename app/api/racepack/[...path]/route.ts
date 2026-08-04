import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/eo-api';
import { getRacepackStaffToken } from '@/lib/eo-auth';

async function handler(request: NextRequest, { params }: { params: { path: string[] } }) {
  const token = getRacepackStaffToken();
  const backendUrl = getBackendUrl();
  if (!token) return NextResponse.json({ error: 'Sesi staff racepack tidak ditemukan.' }, { status: 401 });
  if (!backendUrl) return NextResponse.json({ error: 'Konfigurasi server belum lengkap.' }, { status: 500 });
  try {
    const response = await fetch(`${backendUrl.replace(/\/$/, '')}/racepack/${params.path.join('/')}${request.nextUrl.search}`, { method: request.method, headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
    return new NextResponse(response.body, { status: response.status, headers: { 'content-type': response.headers.get('content-type') || 'application/json' } });
  } catch { return NextResponse.json({ error: 'Layanan racepack tidak dapat dihubungi.' }, { status: 502 }); }
}
export const GET = handler;
export const PATCH = handler;
