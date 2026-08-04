import { NextResponse } from 'next/server';
import { RACEPACK_STAFF_COOKIE } from '@/lib/eo-auth';
export async function POST() { const response = NextResponse.json({ ok: true }); response.cookies.set(RACEPACK_STAFF_COOKIE, '', { path: '/', maxAge: 0 }); return response; }
