import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/eo-api';

async function handler(request: NextRequest, { params }: { params: { path: string[] } }) {
  const backendUrl = getBackendUrl();
  if (!backendUrl) return NextResponse.json({ error: 'Konfigurasi server belum lengkap.' }, { status: 500 });
  try {
    const response = await fetch(`${backendUrl.replace(/\/$/, '')}/${params.path.join('/')}`, {
      method: request.method,
      headers: { 'Content-Type': 'application/json' },
      body: request.method === 'GET' ? undefined : JSON.stringify(await request.json()),
      cache: 'no-store',
    });
    const payload = await response.json().catch(() => ({}));
    return NextResponse.json(payload, { status: response.status });
  } catch {
    return NextResponse.json({ error: 'Layanan autentikasi tidak dapat dihubungi.' }, { status: 502 });
  }
}

export const POST = handler;
