import { NextResponse } from 'next/server';
import { pbFetch, getTenantFilter } from '@/lib/pocketbase';

export async function POST() {
  try {
    console.log('[API /api/blog/fix-original-ids] Starting...');
    
    const tenantFilter = getTenantFilter();
    
    // Get all posts
    const allFilter = `${tenantFilter}`;
    const allData = await pbFetch(`blog_posts/records?filter=${encodeURIComponent(allFilter)}&perPage=500`);
    
    console.log('[API] Total posts found:', allData.items?.length || 0);
    
    const posts = allData.items || [];
    const postsNeedingFix = posts.filter((p: any) => 
      p.language_code === 'pl' && (!p.original_id || p.original_id === '')
    );
    
    console.log('[API] Posts needing fix:', postsNeedingFix.length);
    
    if (postsNeedingFix.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Wszystkie posty mają już original_id',
        total: posts.length,
        fixed: 0
      });
    }
    
    return NextResponse.json({
      success: true,
      message: `Znaleziono ${postsNeedingFix.length} postów do naprawy`,
      total: posts.length,
      postsNeedingFix: postsNeedingFix.map((p: any) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        hasOriginalId: !!p.original_id
      }))
    });
  } catch (error: any) {
    console.error('[API /api/blog/fix-original-ids] Error:', error);
    return NextResponse.json(
      { error: error.message, success: false },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST to this endpoint to check which posts need original_id fix'
  });
}