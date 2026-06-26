import { NextResponse } from 'next/server';
import { translateBlogPostToAllLanguages } from '@/lib/blogTranslate';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { postId, title, slug, excerpt, content, meta_title, meta_description } = body;

    if (!postId || !title) {
      return NextResponse.json(
        { error: 'Post ID and title are required' },
        { status: 400 }
      );
    }

    const post = {
      id: postId,
      title,
      slug: slug || '',
      excerpt: excerpt || '',
      content: content || '',
      meta_title: meta_title || '',
      meta_description: meta_description || '',
    };

    console.log('[API /blog/translate] Starting translation for post:', postId);
    
    const results = await translateBlogPostToAllLanguages(post);
    
    console.log('[API /blog/translate] Translation results:', results);

    return NextResponse.json(results);
  } catch (error: any) {
    console.error('[API /blog/translate] Error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Translation failed', success: [], failed: [] },
      { status: 500 }
    );
  }
}