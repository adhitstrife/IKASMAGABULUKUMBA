import { NextResponse } from 'next/server';
import { EO_SESSION_COOKIE } from '@/lib/eo-auth';

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(EO_SESSION_COOKIE, '', { path: '/', maxAge: 0 });
  return response;
}
