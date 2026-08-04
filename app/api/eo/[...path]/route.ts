import { NextRequest, NextResponse } from 'next/server';
import { getEoToken } from '@/lib/eo-auth';
import { forwardEoRequest } from '@/lib/eo-api';

async function handler(request: NextRequest, { params }: { params: { path: string[] } }) {
  const token = getEoToken();
  if (!token) {
    return NextResponse.json({ error: 'Sesi EO tidak ditemukan.' }, { status: 401 });
  }

  const query = request.nextUrl.search;
  try {
    return await forwardEoRequest({ path: `${params.path.join('/')}${query}`, request, token });
  } catch {
    return NextResponse.json({ error: 'Layanan EO sedang tidak dapat dihubungi.' }, { status: 502 });
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
