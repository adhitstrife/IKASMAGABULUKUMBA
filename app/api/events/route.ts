import { NextResponse, NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orgSecretKey = searchParams.get('key') || process.env.ORG_SECRET_KEY;
    const backendUrl = process.env.BACKEND_URL;

    if (!orgSecretKey || !backendUrl) {
      return NextResponse.json(
        { error: 'Missing environment variables or ORG_SECRET_KEY' },
        { status: 500 }
      );
    }

    const url = `${backendUrl}/eo/landing-page/public/${orgSecretKey}/events`;

    console.log('Fetching events from:', url);

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

    console.log('Events data received:', data);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching events data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events data' },
      { status: 500 }
    );
  }
}
