import { NextResponse } from 'next/server';
import { pbFetch, getTenantFilter, pb } from '@/lib/pocketbase';

export async function POST() {
  try {
    console.log('[API /api/blog/execute-fix] Starting fix...');
    
    const tenantFilter = getTenantFilter();
    
    // Get all posts
    const allFilter = `${tenantFilter}`;
    const allData = await pbFetch(`blog_posts/records?filter=${encodeURIComponent(allFilter)}&perPage=500`);
    
    const posts = allData.items || [];
    console.log('[API] Total posts found:', posts.length);
    
    const postsNeedingFix = posts.filter((p: any) => 
      p.language_code === 'pl' && (!p.original_id || p.original_id === '')
    );
    
    console.log('[API] Posts needing fix:', postsNeedingFix.length);
    
    const results = { updated: 0, failed: [] as string[] };
    
    for (const post of postsNeedingFix) {
      try {
        console.log(`[API] Updating post ${post.id}: ${post.title}`);
        await pb.collection('blog_posts').update(post.id, {
          original_id: post.id
        });
        results.updated++;
        console.log(`[API] ✓ Updated post ${post.id}`);
      } catch (err: any) {
        console.error(`[API] ✗ Failed to update ${post.id}:`, err.message);
        results.failed.push(`${post.id}: ${err.message}`);
      }
    }
    
    console.log('[API] Fix complete:', results);
    
    return NextResponse.json({
      success: true,
      message: `Zaktualizowano ${results.updated} postów`,
      totalPosts: posts.length,
      updated: results.updated,
      failed: results.failed
    });
  } catch (error: any) {
    console.error('[API /api/blog/execute-fix] Error:', error);
    return NextResponse.json(
      { error: error.message, success: false },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST to this endpoint to execute the original_id fix'
  });
}