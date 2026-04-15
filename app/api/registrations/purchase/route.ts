import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const backendUrl = process.env.BACKEND_URL;
  const orgSecretKey = process.env.ORG_SECRET_KEY;

  if (!backendUrl || !orgSecretKey) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const response = await fetch(`${backendUrl}/api/v1/registrations/purchase`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Org-Secret-Key': orgSecretKey,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
