import { redirect } from 'next/navigation';

interface PreviewPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PreviewSlugPage({ params, searchParams }: PreviewPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  
  // Build the target URL
  let targetPath = slug === 'home' ? '/' : `/${slug}`;
  
  // Maintain the search parameters (like modo=editor)
  const query = new URLSearchParams();
  Object.entries(resolvedSearchParams).forEach(([key, value]) => {
    if (typeof value === 'string') {
      query.append(key, value);
    }
  });
  
  const queryString = query.toString();
  const finalUrl = `${targetPath}${queryString ? `?${queryString}` : ''}`;
  
  // Redirect to the actual page
  redirect(finalUrl);
}
