import { NextRequest, NextResponse } from 'next/server';
import { eoSessionCookie, EO_SESSION_COOKIE } from '@/lib/eo-auth';
import { getBackendUrl } from '@/lib/eo-api';

export async function POST(request: NextRequest) {
  const backendUrl = getBackendUrl();
  if (!backendUrl) {
    return NextResponse.json({ error: 'Konfigurasi server belum lengkap.' }, { status: 500 });
  }

  let credentials: { email?: string; password?: string };
  try {
    credentials = await request.json();
  } catch {
    return NextResponse.json({ error: 'Data login tidak valid.' }, { status: 400 });
  }

  if (!credentials.email || !credentials.password) {
    return NextResponse.json({ error: 'Email dan password wajib diisi.' }, { status: 400 });
  }

  try {
    const upstream = await fetch(`${backendUrl.replace(/\/$/, '')}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
      cache: 'no-store',
    });
    const data = await upstream.json().catch(() => ({}));

    if (!upstream.ok || !data.access_token) {
      return NextResponse.json(
        { error: data.message || data.error || 'Email atau password tidak valid.' },
        { status: upstream.status || 401 },
      );
    }

    const response = NextResponse.json({
      organization_id: data.organization_id,
      organization_name: data.organization_name,
    });
    response.cookies.set(EO_SESSION_COOKIE, data.access_token, eoSessionCookie);
    return response;
  } catch {
    return NextResponse.json({ error: 'Tidak dapat terhubung ke server.' }, { status: 502 });
  }
}
