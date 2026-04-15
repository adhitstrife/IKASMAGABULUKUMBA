import { NextResponse, NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const orgSecretKey = process.env.ORG_SECRET_KEY;
    const backendUrl = process.env.BACKEND_URL;

    if (!orgSecretKey || !backendUrl) {
      return NextResponse.json(
        { error: 'Missing environment variables' },
        { status: 500 }
      );
    }

    const code = request.nextUrl.searchParams.get('code');
    const amount = request.nextUrl.searchParams.get('amount');

    if (!code || !amount) {
      return NextResponse.json(
        { error: 'Missing code or amount parameter' },
        { status: 400 }
      );
    }

    const url = `${backendUrl}/eo/landing-page/public/${orgSecretKey}/fee-calculator?code=${encodeURIComponent(code)}&amount=${encodeURIComponent(amount)}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching fee calculation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fee calculation' },
      { status: 500 }
    );
  }
}
