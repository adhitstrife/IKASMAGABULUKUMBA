import { NextResponse } from 'next/server';

const SAFE_HEADERS = ['content-disposition', 'content-type'];

export function getBackendUrl() {
  return process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
}

export async function forwardEoRequest({
  path,
  request,
  token,
}: {
  path: string;
  request: Request;
  token: string;
}) {
  const backendUrl = getBackendUrl();
  if (!backendUrl) {
    return NextResponse.json({ error: 'Konfigurasi server belum lengkap.' }, { status: 500 });
  }

  const headers = new Headers({ Authorization: `Bearer ${token}` });
  const contentType = request.headers.get('content-type');
  if (contentType) headers.set('content-type', contentType);

  const method = request.method;
  const response = await fetch(`${backendUrl.replace(/\/$/, '')}/${path}`, {
    method,
    headers,
    body: method === 'GET' || method === 'HEAD' ? undefined : request.body,
    // Required when streaming a request body in Node.js.
    // @ts-expect-error Next.js runs on an Undici-compatible fetch implementation.
    duplex: 'half',
    cache: 'no-store',
  });

  const responseHeaders = new Headers();
  for (const header of SAFE_HEADERS) {
    const value = response.headers.get(header);
    if (value) responseHeaders.set(header, value);
  }

  return new NextResponse(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
}
