import { NextResponse, NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orgSecretKey = process.env.ORG_SECRET_KEY;
    const backendUrl = process.env.BACKEND_URL;

    if (!orgSecretKey || !backendUrl) {
      return NextResponse.json(
        { error: 'Missing environment variables' },
        { status: 500 }
      );
    }

    const url = `${backendUrl}/eo/landing-page/public/${orgSecretKey}/events/${params.id}/details`;

    console.log('Fetching event detail from:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // console.log('Event detail response:', data);
    // console.log('event additions:', data?.data?.additions[0].tickets);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching event detail:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event detail' },
      { status: 500 }
    );
  }
}
