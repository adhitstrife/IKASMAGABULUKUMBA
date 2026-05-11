import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  const urlParam = url.searchParams.get('url');

  // Support both id parameter dan full url parameter
  let googleUrl: string;

  if (urlParam) {
    // Parse URL to extract file ID
    const match = urlParam.match(/[?&]id=([a-zA-Z0-9-_]+)/);
    if (match) {
      googleUrl = `https://lh3.googleusercontent.com/d/${match[1]}`;
    } else {
      return new Response('Invalid file URL', { status: 400 });
    }
  } else if (id) {
    googleUrl = `https://lh3.googleusercontent.com/d/${id}`;
  } else {
    return new Response('Missing file id or url parameter', { status: 400 });
  }

  try {
    const response = await fetch(googleUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://drive.google.com/',
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch from Google Drive: ${response.status}`);
      return new Response('Failed to fetch image', {
        status: response.status,
      });
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const buffer = await response.arrayBuffer();

    return new Response(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    console.error('Error proxying image:', err);
    return new Response('Server error', { status: 500 });
  }
}
