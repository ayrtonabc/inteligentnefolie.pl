-- Blog Categories Table
CREATE TABLE IF NOT EXISTS public.blog_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Blog Posts Table
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    content TEXT NOT NULL,
    excerpt TEXT,
    meta_title VARCHAR(255),
    meta_description TEXT,
    cover_image_url TEXT,
    category_id UUID REFERENCES public.blog_categories(id) ON DELETE SET NULL,
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    published BOOLEAN DEFAULT false NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Update timestamp trigger for blog_posts
CREATE OR REPLACE FUNCTION update_modified_column() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_blog_posts_modtime ON public.blog_posts;
CREATE TRIGGER update_blog_posts_modtime
    BEFORE UPDATE ON public.blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- Enable RLS
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Categories Policies
CREATE POLICY "Categories are viewable by everyone" ON public.blog_categories
    FOR SELECT USING (true);

CREATE POLICY "Categories are insertable by authenticated users only" ON public.blog_categories
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Categories are updatable by authenticated users only" ON public.blog_categories
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Categories are deletable by authenticated users only" ON public.blog_categories
    FOR DELETE USING (auth.role() = 'authenticated');

-- Posts Policies
CREATE POLICY "Published posts are viewable by everyone" ON public.blog_posts
    FOR SELECT USING (published = true OR auth.role() = 'authenticated');

CREATE POLICY "Posts are insertable by authenticated users only" ON public.blog_posts
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Posts are updatable by authenticated users only" ON public.blog_posts
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Posts are deletable by authenticated users only" ON public.blog_posts
    FOR DELETE USING (auth.role() = 'authenticated');

-- Insert a default category to start with
INSERT INTO public.blog_categories (name, slug, description) 
VALUES ('General', 'general', 'General topics')
ON CONFLICT (slug) DO NOTHING;
