import { NextRequest, NextResponse } from 'next/server';

const BUNNY_API_KEY = process.env.BUNNY_API_KEY;
const BUNNY_LIBRARY_ID = process.env.BUNNY_LIBRARY_ID;
const SIGNATURE_SECRET = process.env.VIDEO_SIGNATURE_SECRET;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoId, libraryId } = body;

    if (!videoId) {
      return NextResponse.json(
        { error: 'Missing videoId' },
        { status: 400 }
      );
    }

    if (!BUNNY_API_KEY || !BUNNY_LIBRARY_ID) {
      return NextResponse.json(
        { error: 'Bunny.net not configured' },
        { status: 503 }
      );
    }

    const targetLibraryId = libraryId || BUNNY_LIBRARY_ID;
    const expirationTime = Math.floor(Date.now() / 1000) + 3600;

    const signatureBase = `${videoId}:${targetLibraryId}:${expirationTime}:${SIGNATURE_SECRET || BUNNY_API_KEY}`;
    const signature = await generateSignature(signatureBase);

    const credentials = {
      signature,
      expirationTime,
      libraryId: targetLibraryId,
      uploadUrl: `https://video.bunnycdn.com/library/${targetLibraryId}/videos/upload`,
      headers: {
        AccessKey: BUNNY_API_KEY,
      },
    };

    return NextResponse.json(credentials);
  } catch (error) {
    console.error('Video credentials error:', error);
    return NextResponse.json(
      { error: 'Failed to generate credentials' },
      { status: 500 }
    );
  }
}

async function generateSignature(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const videoId = searchParams.get('videoId');
  const libraryId = searchParams.get('libraryId');

  if (!videoId) {
    return NextResponse.json(
      { error: 'Missing videoId parameter' },
      { status: 400 }
    );
  }

  if (!BUNNY_API_KEY) {
    return NextResponse.json(
      { error: 'Bunny.net not configured' },
      { status: 503 }
    );
  }

  try {
    const targetLibraryId = libraryId || BUNNY_LIBRARY_ID;
    const response = await fetch(
      `https://video.bunnycdn.com/library/${targetLibraryId}/videos/${videoId}`,
      {
        headers: {
          AccessKey: BUNNY_API_KEY,
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    const videoData = await response.json();
    return NextResponse.json({
      id: videoData.id,
      title: videoData.title,
      status: videoData.status,
      length: videoData.length,
      thumbnailUrl: videoData.thumbnailUrl,
    });
  } catch (error) {
    console.error('Video status error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch video status' },
      { status: 500 }
    );
  }
}