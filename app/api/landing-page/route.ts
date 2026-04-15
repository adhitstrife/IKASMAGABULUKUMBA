import { NextResponse, NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orgSecretKey = process.env.ORG_SECRET_KEY;
    const backendUrl = process.env.BACKEND_URL;

    if (!orgSecretKey || !backendUrl) {
      return NextResponse.json(
        { error: 'Missing environment variables or ORG_SECRET_KEY' },
        { status: 500 }
      );
    }

    const url = `${backendUrl}/eo/landing-page/public/${orgSecretKey}`;

    console.log('Fetching from:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    console.log('Landing page data received:', data);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching landing page data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch landing page data' },
      { status: 500 }
    );
  }
}
