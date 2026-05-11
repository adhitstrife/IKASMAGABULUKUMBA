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
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Transform Google Drive URLs to bypass restrictions
    if (data.data && data.data.assets) {
      data.data.assets = data.data.assets.map((asset: any) => {
        if (asset.url && asset.url.includes('drive.google.com')) {
          // Extract file ID from Google Drive URL
          const fileIdMatch = asset.url.match(/id=([a-zA-Z0-9-_]+)/);
          if (fileIdMatch) {
            const fileId = fileIdMatch[1];
            // Use direct download URL
            asset.url = `https://drive.google.com/uc?export=download&id=${fileId}`;
          }
        }
        return asset;
      });
    }

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error fetching news detail:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news detail' },
      { status: 500 }
    );
  }
}
