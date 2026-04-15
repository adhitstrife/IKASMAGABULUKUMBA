import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const orgSecretKey = process.env.ORG_SECRET_KEY;
    const backendUrl = process.env.BACKEND_URL;

    if (!orgSecretKey || !backendUrl) {
      return NextResponse.json(
        { error: 'Missing environment variables' },
        { status: 500 }
      );
    }

    const url = `${backendUrl}/eo/landing-page/public/${orgSecretKey}/payment-channels`;

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
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching payment channels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment channels' },
      { status: 500 }
    );
  }
}
