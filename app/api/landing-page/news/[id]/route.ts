import { NextResponse, NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orgSecretKey = process.env.ORG_SECRET_KEY;
    const backendUrl = process.env.BACKEND_URL;
    const { id } = params;

    if (!orgSecretKey || !backendUrl) {
      return NextResponse.json(
        { error: 'Missing environment variables' },
        { status: 500 }
      );
    }

    const url = `${backendUrl}/eo/landing-page/public/${orgSecretKey}/news/${id}`;

    console.log('Fetching news detail from:', url);

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
    console.error('Error fetching news detail:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news detail' },
      { status: 500 }
    );
  }
}
