import { NextRequest, NextResponse } from 'next/server';

const PAGESPEED_API_URL = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';

interface PagespeedResponse {
  lighthouseResult?: {
    categories?: {
      performance?: {
        score?: number;
      };
    };
  };
  loadingExperience?: {
    metrics?: Record<string, {
      percentiles?: {
        p75?: number;
      };
    }>;
  };
  runtimeError?: {
    code?: string;
    message?: string;
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const strategy = searchParams.get('strategy') || 'mobile';

  if (!url) {
    return NextResponse.json(
      { error: 'URL parameter is required' },
      { status: 400 }
    );
  }

  try {
    const apiKey = process.env.PAGESPEED_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'PageSpeed API key not configured' },
        { status: 500 }
      );
    }

    const params = new URLSearchParams({
      url,
      key: apiKey,
      strategy,
      category: 'performance',
    });

    const response = await fetch(`${PAGESPEED_API_URL}?${params}`, {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('PageSpeed API error:', response.status, errorText);
      return NextResponse.json(
        { error: `PageSpeed API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data: PagespeedResponse = await response.json();

    if (data.runtimeError) {
      return NextResponse.json(
        { error: data.runtimeError.message || 'PageSpeed runtime error' },
        { status: 400 }
      );
    }

    const lighthouseScore = data.lighthouseResult?.categories?.performance?.score;
    const fcp = data.loadingExperience?.metrics?.FIRST_CONTENTFUL_PAINT?.percentiles?.p75;
    const cls = data.loadingExperience?.metrics?.CUMULATIVE_LAYOUT_SHIFT?.percentiles?.p75;
    const inp = data.loadingExperience?.metrics?.INTERACTION_TO_NEXT_PAINT?.percentiles?.p75;
    const lcp = data.loadingExperience?.metrics?.LARGEST_CONTENTFUL_PAINT?.percentiles?.p75;
    const tbt = data.loadingExperience?.metrics?.TOTAL_BLOCKING_TIME?.percentiles?.p75;

    return NextResponse.json({
      score: lighthouseScore !== undefined ? Math.round(lighthouseScore * 100) : null,
      metrics: {
        fcp: fcp !== undefined ? Math.round(fcp) : null,
        cls: cls !== undefined ? cls : null,
        inp: inp !== undefined ? Math.round(inp) : null,
        lcp: lcp !== undefined ? Math.round(lcp) : null,
        tbt: tbt !== undefined ? Math.round(tbt) : null,
      },
      strategy,
      checkedUrl: url,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('PageSpeed proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch PageSpeed data' },
      { status: 500 }
    );
  }
}
