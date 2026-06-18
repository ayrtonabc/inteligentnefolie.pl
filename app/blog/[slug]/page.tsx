import { Calendar, User, ArrowLeft, Share2, Facebook, Twitter, Linkedin } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingChat from '@/components/FloatingChat';
import { getBlogPostBySlug, getBlogPosts, cleanQuillContent } from '@/lib/cms';
import { PB_URL } from '@/lib/config';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { fetchPageData } from '@/lib/pageData';
import { ArticleSchema } from '@/components/seo/ArticleSchema';
import { getWebsiteUrl } from '@/lib/websiteUrl';
import { getHreflangEntries, formatMetadataLanguages } from '@/lib/hreflang';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ lang?: string }>;
}

function firstFileName(value: unknown): string {
  if (Array.isArray(value)) return typeof value[0] === 'string' ? value[0] : '';
  return typeof value === 'string' ? value : '';
}

function normalizeImageUrl(value: unknown): string {
  if (typeof value !== 'string' || !value) return '';
  if (/^(https?:)?\/\//.test(value) || value.startsWith('data:')) return value;
  return `${PB_URL}${value.startsWith('/') ? '' : '/'}${value}`;
}

function getFirstContentImage(contentHtml: string): string {
  const match = contentHtml.match(/<img[^>]+src=["']([^"']+)["']/i);
  return normalizeImageUrl(match?.[1]);
}

function getPostImageUrl(post: any, contentHtml = ''): string {
  const coverUrl = normalizeImageUrl(post.cover_image_url);
  if (coverUrl) return coverUrl;

  const coverFile = firstFileName(post.cover_image);
  if (coverFile) {
    const collection = post.collectionName || post.collectionId || 'blog_posts';
    return `${PB_URL}/api/files/${collection}/${post.id}/${encodeURIComponent(coverFile)}`;
  }

  return getFirstContentImage(contentHtml);
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const langParams = await searchParams;
  const lang = langParams?.lang || 'pl';
  const post = await getBlogPostBySlug(slug, lang);
  if (!post) return { title: 'Post nie znaleziony' };
  
  const contentHtml = cleanQuillContent(post.content);
  const imageUrl = getPostImageUrl(post, contentHtml);
  const title = post.meta_title || post.title;
  const siteUrl = await getWebsiteUrl();
  
  let description = post.meta_description || post.excerpt || '';
  if (!description && contentHtml) {
    description = contentHtml
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 160);
  }

  try {
    const blogPath = `/blog/${slug}`;
    const hreflangEntries = await getHreflangEntries(blogPath, lang, 'query');
    const languages = formatMetadataLanguages(hreflangEntries.all);

    return {
      title: `${title} | ${post.site_name || 'Inteligentne Folie'}`,
      description: description,
      alternates: {
        canonical: `${siteUrl}${blogPath}?lang=${lang}`,
        languages,
      },
      openGraph: {
        title: title,
        description: description,
        url: `${siteUrl}${blogPath}?lang=${lang}`,
        images: imageUrl ? [{ url: imageUrl }] : [],
        type: 'article',
        publishedTime: post.created_at || post.created,
      },
      twitter: {
        card: 'summary_large_image',
        title: title,
        description: description,
        images: imageUrl ? [imageUrl] : [],
      }
    };
  } catch (error) {
    console.error('Metadata generation error:', error);
    return { title: `${title} | Inteligentne Folie` };
  }
}

export default async function BlogPost({ params, searchParams }: Props) {
  const { slug } = await params;
  const langParams = await searchParams;
  const lang = langParams?.lang || 'pl';
  const post = await getBlogPostBySlug(slug, lang);
  if (!post) notFound();

  // Fetch global page data for the header (languages, settings, etc.)
  const pageData = await fetchPageData(`/blog/${slug}`, lang);

  const contentHtml = cleanQuillContent(post.content);
  const imageUrl = getPostImageUrl(post, contentHtml);
  const relatedPosts = await getBlogPosts(4);
  const filteredRelated = relatedPosts.filter(p => p.id !== post.id).slice(0, 3);

  return (
    <div className="w-full bg-white min-h-screen">
      <Header pageData={pageData} />
      
      <nav className="bg-gray-50 border-b border-gray-200 pt-28 lg:pt-32">
        <div className="max-w-4xl mx-auto px-6 py-3">
          <ol className="flex items-center gap-2 text-sm text-gray-500">
            <li><Link href="/" className="hover:text-cyan transition">Strona główna</Link></li>
            <li>/</li>
            <li><Link href="/blog" className="hover:text-cyan transition">Blog</Link></li>
            <li>/</li>
            <li className="text-gray-900 font-medium truncate max-w-[200px]">{post.title}</li>
          </ol>
        </div>
      </nav>

      <article className="max-w-4xl mx-auto px-6 py-12">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
            <span className="flex items-center gap-2">
              <User size={16} className="text-cyan" />
              <span className="font-medium text-gray-900">Redakcja</span>
            </span>
            <span className="flex items-center gap-2">
              <Calendar size={16} className="text-cyan" />
              {new Date(post.created_at || post.created).toLocaleDateString('pl-PL')}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 flex items-center gap-2">
              <Share2 size={16} /> Udostępnij:
            </span>
            <button className="w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition">
              <Facebook size={16} />
            </button>
            <button className="w-9 h-9 bg-sky-500 text-white rounded-full flex items-center justify-center hover:bg-sky-600 transition">
              <Twitter size={16} />
            </button>
            <button className="w-9 h-9 bg-blue-700 text-white rounded-full flex items-center justify-center hover:bg-blue-800 transition">
              <Linkedin size={16} />
            </button>
          </div>
        </header>

        {imageUrl && (
          <figure className="mb-10">
            <img 
              src={imageUrl}
              alt={post.title} 
              className="w-full h-auto max-h-[500px] object-contain rounded-xl" 
            />
          </figure>
        )}

        <div 
          className="prose prose-lg max-w-none px-0 py-4 blog-content"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />

        <div className="mt-10 pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <Link href="/blog" className="flex items-center gap-2 text-gray-500 hover:text-cyan transition">
              <ArrowLeft size={20} /> Wróć do listy
            </Link>
          </div>
        </div>
      </article>

      {filteredRelated.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Powiązane artykuły</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredRelated.map((p: any) => (
                <article key={p.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition group">
                  <Link href={`/blog/${p.slug}`}>
                    <div className="relative h-48 overflow-hidden">
                      <img src={p.cover_image_url || 'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=400'} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    </div>
                  </Link>
                  <div className="p-5">
                    <Link href={`/blog/${p.slug}`}>
                      <h3 className="font-bold text-gray-900 mb-2 group-hover:text-cyan transition line-clamp-2">{p.title}</h3>
                    </Link>
                    <p className="text-sm text-gray-400">{new Date(p.created_at || p.created).toLocaleDateString('pl-PL')}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer pageData={pageData} />
      <FloatingChat pageData={pageData} />
      <ArticleSchema post={post} />
      
      <style dangerouslySetInnerHTML={{ __html: `
        .blog-content h1 { font-size: 2.25rem; font-weight: 700; margin-top: 2rem; margin-bottom: 1rem; color: #111827; }
        .blog-content h2 { font-size: 1.875rem; font-weight: 700; margin-top: 1.5rem; margin-bottom: 0.75rem; color: #111827; }
        .blog-content h3 { font-size: 1.5rem; font-weight: 700; margin-top: 1.25rem; margin-bottom: 0.5rem; color: #111827; }
        .blog-content p { font-size: 1.125rem; line-height: 1.75; margin-bottom: 1.25rem; color: #374151; }
        .blog-content ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1.25rem; }
        .blog-content ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1.25rem; }
        .blog-content li { margin-bottom: 0.5rem; }
        .blog-content strong { font-weight: 600; color: #111827; }
        .blog-content img { border-radius: 0.75rem; margin: 2rem 0; width: 100%; height: auto; }
      `}} />
    </div>
  );
}
