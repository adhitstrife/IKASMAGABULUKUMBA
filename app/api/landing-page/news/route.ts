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

    const url = `${backendUrl}/eo/landing-page/public/${orgSecretKey}/news`;

    console.log('Fetching news from:', url);

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
    if (data.data && Array.isArray(data.data)) {
      data.data = data.data.map((news: any) => {
        if (news.assets && Array.isArray(news.assets)) {
          news.assets = news.assets.map((asset: any) => {
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
        return news;
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
    console.error('Error fetching news data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news data' },
      { status: 500 }
    );
  }
}
