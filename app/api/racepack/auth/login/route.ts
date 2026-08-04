import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/eo-api';
import { eoSessionCookie, RACEPACK_STAFF_COOKIE } from '@/lib/eo-auth';

export async function POST(request: NextRequest) {
  const backendUrl = getBackendUrl();
  if (!backendUrl) return NextResponse.json({ error: 'Konfigurasi server belum lengkap.' }, { status: 500 });
  const body = await request.json().catch(() => null) as { addition_id?: string; pin?: string } | null;
  if (!body?.addition_id || !/^\d{6}$/.test(body.pin || '')) return NextResponse.json({ error: 'Pilih edisi dan masukkan PIN enam digit.' }, { status: 400 });
  try {
    const upstream = await fetch(`${backendUrl.replace(/\/$/, '')}/racepack/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), cache: 'no-store' });
    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok || !data.access_token) return NextResponse.json({ error: data.error || data.message || 'PIN atau edisi tidak valid.' }, { status: upstream.status });
    const response = NextResponse.json({ addition: data.addition });
    response.cookies.set(RACEPACK_STAFF_COOKIE, data.access_token, eoSessionCookie);
    return response;
  } catch {
    return NextResponse.json({ error: 'Layanan racepack tidak dapat dihubungi.' }, { status: 502 });
  }
}
