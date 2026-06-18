import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Wand2, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Globe
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { pb, TENANT_ID } from '@/lib/pocketbase'
import { useWebsiteId, useTranslationProgress } from '@/features/languages/hooks'

async function translateJsonRecursive(obj: any, langName: string): Promise<any> {
  if (typeof obj === 'string') {
    if (obj.trim().length > 0) {
      try {
        return await translateText(obj, langName)
      } catch {
        return obj
      }
    }
    return obj
  }
  
  if (Array.isArray(obj)) {
    const translated = []
    for (const item of obj) {
      translated.push(await translateJsonRecursive(item, langName))
    }
    return translated
  }
  
  if (obj && typeof obj === 'object') {
    const translated: any = {}
    for (const key of Object.keys(obj)) {
      translated[key] = await translateJsonRecursive(obj[key], langName)
    }
    return translated
  }
  
  return obj
}

// Get translatable fields for each collection type
function getTranslatableFields(collection: string, item: any): Array<{field: string, value: string}> {
  const fields: Array<{field: string, value: string}> = [];
  
  switch (collection) {
    case 'site_content':
      if (item.content_value) fields.push({ field: 'content_value', value: item.content_value });
      if (item.section_key) fields.push({ field: 'section_key', value: item.section_key });
      break;
    case 'site_custom_content':
      if (item.content_value) fields.push({ field: 'content_value', value: item.content_value });
      if (item.content_key) fields.push({ field: 'content_key', value: item.content_key });
      if (item.title) fields.push({ field: 'title', value: item.title });
      break;
    case 'blog_posts':
      if (item.title) fields.push({ field: 'title', value: item.title });
      if (item.content) fields.push({ field: 'content', value: item.content });
      if (item.excerpt) fields.push({ field: 'excerpt', value: item.excerpt });
      if (item.meta_title) fields.push({ field: 'meta_title', value: item.meta_title });
      if (item.meta_description) fields.push({ field: 'meta_description', value: item.meta_description });
      if (item.slug) fields.push({ field: 'slug', value: item.slug });
      break;
    case 'blog_categories':
      if (item.name) fields.push({ field: 'name', value: item.name });
      if (item.description) fields.push({ field: 'description', value: item.description });
      if (item.slug) fields.push({ field: 'slug', value: item.slug });
      break;
    case 'products':
    case 'shop_products':
      if (item.name) fields.push({ field: 'name', value: item.name });
      if (item.description) fields.push({ field: 'description', value: item.description });
      if (item.short_description) fields.push({ field: 'short_description', value: item.short_description });
      if (item.meta_title) fields.push({ field: 'meta_title', value: item.meta_title });
      if (item.meta_description) fields.push({ field: 'meta_description', value: item.meta_description });
      if (item.category_name) fields.push({ field: 'category_name', value: item.category_name });
      break;
    case 'shop_categories':
      if (item.name) fields.push({ field: 'name', value: item.name });
      if (item.description) fields.push({ field: 'description', value: item.description });
      if (item.slug) fields.push({ field: 'slug', value: item.slug });
      break;
    case 'projects':
    case 'web_offers':
      if (item.title) fields.push({ field: 'title', value: item.title });
      if (item.description) fields.push({ field: 'description', value: item.description });
      if (item.content) fields.push({ field: 'content', value: item.content });
      if (item.category) fields.push({ field: 'category', value: item.category });
      break;
    case 'cms_pages':
      if (item.title) fields.push({ field: 'title', value: item.title });
      if (item.content) fields.push({ field: 'content', value: item.content });
      if (item.slug) fields.push({ field: 'slug', value: item.slug });
      break;
    case 'testimonials':
      if (item.name) fields.push({ field: 'name', value: item.name });
      if (item.content) fields.push({ field: 'content', value: item.content });
      if (item.text) fields.push({ field: 'text', value: item.text });
      if (item.review_text) fields.push({ field: 'review_text', value: item.review_text });
      if (item.role) fields.push({ field: 'role', value: item.role });
      if (item.company) fields.push({ field: 'company', value: item.company });
      if (item.title) fields.push({ field: 'title', value: item.title });
      if (item.description) fields.push({ field: 'description', value: item.description });
      if (item.quote) fields.push({ field: 'quote', value: item.quote });
      break;
    case 'business_collaborations':
      if (item.name) fields.push({ field: 'name', value: item.name });
      if (item.title) fields.push({ field: 'title', value: item.title });
      if (item.description) fields.push({ field: 'description', value: item.description });
      break;
    case 'menu_items':
      if (item.label) fields.push({ field: 'label', value: item.label });
      if (item.title) fields.push({ field: 'title', value: item.title });
      if (item.description) fields.push({ field: 'description', value: item.description });
      break;
    case 'footer_links':
      if (item.label) fields.push({ field: 'label', value: item.label });
      if (item.title) fields.push({ field: 'title', value: item.title });
      if (item.url) fields.push({ field: 'url', value: item.url });
      break;
    case 'popups':
      if (item.name) fields.push({ field: 'name', value: item.name });
      if (item.title) fields.push({ field: 'title', value: item.title });
      if (item.content) fields.push({ field: 'content', value: item.content });
      if (item.button_text) fields.push({ field: 'button_text', value: item.button_text });
      break;
    case 'faq_items':
      if (item.question) fields.push({ field: 'question', value: item.question });
      if (item.answer) fields.push({ field: 'answer', value: item.answer });
      if (item.title) fields.push({ field: 'title', value: item.title });
      break;
    default:
      // Try common fields for any collection
      if (item.title) fields.push({ field: 'title', value: item.title });
      if (item.name) fields.push({ field: 'name', value: item.name });
      if (item.description) fields.push({ field: 'description', value: item.description });
      if (item.content) fields.push({ field: 'content', value: item.content });
      if (item.text) fields.push({ field: 'text', value: item.text });
      break;
  }
  
  return fields;
}

async function translateText(text: string, targetLang: string, sourceLang: string = 'Polish'): Promise<string> {
  if (!text || text.trim() === '') {
    return text;
  }
  
  const maxRetries = 2;
  let lastError = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { 
              role: 'user', 
              content: `Translate from ${sourceLang} to ${targetLang}. Keep HTML tags. Return only translated text.

${text}` 
            }
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      return data.response?.trim() || text;
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries - 1) {
        await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
      }
    }
  }
  
  throw lastError || new Error('Translation failed');
}

export default function AutoTranslatePage() {
  const navigate = useNavigate()
  const { data: websiteId } = useWebsiteId()
  const { data: progress = [] } = useTranslationProgress(websiteId || '')
  
  const [selectedLangs, setSelectedLangs] = useState<string[]>([])
  const [isTranslating, setIsTranslating] = useState(false)
  const [currentTask, setCurrentTask] = useState('')
  const [logs, setLogs] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({ total: 0, current: 0 })
  const [customLangs, setCustomLangs] = useState<string[]>([])
  const SUPPORTED_LANGS = [
    { code: 'en', name: 'English', flag: 'https://flagcdn.com/w40/gb.png' },
    { code: 'es', name: 'Español', flag: 'https://flagcdn.com/w40/es.png' },
    { code: 'de', name: 'Deutsch', flag: 'https://flagcdn.com/w40/de.png' },
    { code: 'fr', name: 'Français', flag: 'https://flagcdn.com/w40/fr.png' },
    { code: 'ua', name: 'Українська', flag: 'https://flagcdn.com/w40/ua.png' },
    { code: 'cz', name: 'Čeština', flag: 'https://flagcdn.com/w40/cz.png' },
  ]

  const FLAG_URLS: Record<string, string> = {
    pl: 'https://flagcdn.com/w40/pl.png',
    en: 'https://flagcdn.com/w40/gb.png',
    es: 'https://flagcdn.com/w40/es.png',
    de: 'https://flagcdn.com/w40/de.png',
    fr: 'https://flagcdn.com/w40/fr.png',
    ua: 'https://flagcdn.com/w40/ua.png',
    uk: 'https://flagcdn.com/w40/ua.png',
    cz: 'https://flagcdn.com/w40/cz.png',
  }

  const getFlagUrl = (code: string) => FLAG_URLS[code.toLowerCase()] || FLAG_URLS.pl

  const availableLangs = [
    ...progress.filter(p => !p.is_default),
    ...SUPPORTED_LANGS.filter(sl => 
      !progress.some(p => p.language_code === sl.code) && sl.code !== 'pl'
    ).map(sl => ({
      language_code: sl.code,
      language_name: sl.name,
      flag_emoji: sl.flag,
      is_default: false,
      progress_percentage: 0
    }))
  ]

  // Auto-select if only one language
  useEffect(() => {
    if (availableLangs.length === 1 && selectedLangs.length === 0) {
      setSelectedLangs([availableLangs[0].language_code])
    }
  }, [availableLangs.length])

  const toggleLang = (code: string) => {
    setSelectedLangs(prev => 
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    )
  }

  const startTranslation = async () => {
    if (selectedLangs.length === 0) return
    
    setIsTranslating(true)
    setError(null)
    setLogs([])
    
    try {
      // Collections for frontend content + city pages translation
      const TRANSLATABLE_COLLECTIONS = [
        'site_content',
        'cms_pages',
        'blog_posts',
        'shop_products',
        'projects',
        'testimonials',
        'business_collaborations',
        'web_offers',
      ];
      
      // Get all content from all translatable collections
      const allContentByCollection: Record<string, any[]> = {};
      
      for (const collection of TRANSLATABLE_COLLECTIONS) {
        try {
          // Get ALL items with language_code = "pl" for this website
          const filter = `language_code = "pl" && website_id = "${websiteId || TENANT_ID}"`;
          console.log(`[Translate] Querying ${collection} with filter: ${filter}`);
          
          const content = await pb.collection(collection).getFullList({
            filter: filter,
            requestKey: null,
          }).catch(async (e) => {
            console.error(`[Translate] Error querying ${collection}:`, e);
            // Try without website_id filter if first query fails
            return pb.collection(collection).getFullList({
              filter: `language_code = "pl"`,
              requestKey: null,
            }).catch((e2) => {
              console.error(`[Translate] Fallback also failed for ${collection}:`, e2);
              return [];
            });
          });
          
          if (content.length > 0) {
            allContentByCollection[collection] = content;
            console.log(`[Translate] ✓ ${collection}: ${content.length} items found`);
          } else {
            console.log(`[Translate] ✗ ${collection}: no items with language_code = "pl"`);
          }
        } catch (err) {
          console.error(`[Translate] ${collection}: exception`, err);
        }
      }
      
      // Combine all content
      const allSourceContent = Object.values(allContentByCollection).flat();
      
      if (allSourceContent.length === 0) {
        throw new Error('Brak treści do przetłumaczenia.');
      }
      
      console.log(`[Translate] Total Polish content: ${allSourceContent.length} items from ${Object.keys(allContentByCollection).length} collections`);

      setStats({ total: allSourceContent.length * selectedLangs.length, current: 0 })
      let processed = 0

      for (const langCode of selectedLangs) {
        const langData = availableLangs.find(p => p.language_code === langCode)
        const langName = langData?.language_name || langCode
        setLogs(prev => [`Rozpoczynanie tłumaczenia na: ${langName}`, ...prev])

        // Ensure website_language record exists
        try {
          const langsRes = await pb.collection('languages').getFirstListItem(`code = "${langCode}"`).catch(() => null);
          if (!langsRes) {
            console.error('Language not found in languages collection:', langCode);
          } else {
            const filter = `website_id = "${websiteId || TENANT_ID}" && language_id = "${langsRes.id}"`;
            const existingLang = await pb.collection('website_languages').getFirstListItem(filter).catch(() => null);
            
            if (!existingLang) {
              await pb.collection('website_languages').create({
                website_id: websiteId || TENANT_ID,
                language_id: langsRes.id,
                is_default: false,
                is_active: true,
                translation_status: 'translated'
              });
              setLogs(prev => [`✓ Zainstalowano: ${langName}`, ...prev]);
            }
          }
        } catch (err) {
          console.error('Error ensuring website_language exists:', err);
        }

        // Translate content from each collection
        for (const [collection, items] of Object.entries(allContentByCollection)) {
          console.log(`[Translate] Processing ${collection} for ${langName}...`);
          
          for (const item of items) {
            processed++
            setStats(s => ({ ...s, current: processed }))
            setCurrentTask(`${collection}: ${item.title || item.name || item.id || item.section_key} (${langCode})`)

            // Build filter based on collection type
            let existingFilter = '';
            try {
              if (collection === 'site_content') {
                existingFilter = `language_code = "${langCode}" && website_id = "${item.website_id || websiteId || TENANT_ID}" && section_key = "${item.section_key || ''}" && page_path = "${item.page_path || ''}"`;
              } else if (collection === 'blog_posts') {
                existingFilter = `language_code = "${langCode}" && slug = "${item.slug || ''}"`;
              } else if (collection === 'testimonials') {
                existingFilter = `language_code = "${langCode}" && name = "${item.name || ''}"`;
              } else if (collection === 'shop_products' || collection === 'products') {
                existingFilter = `language_code = "${langCode}" && name = "${item.name || ''}"`;
              } else if (collection === 'projects' || collection === 'web_offers') {
                existingFilter = `language_code = "${langCode}" && title = "${item.title || ''}"`;
              } else {
                existingFilter = `language_code = "${langCode}" && website_id = "${item.website_id || websiteId || TENANT_ID}"`;
              }
              
              // Check if translation already exists
              const existingCheck = await pb.collection(collection).getFirstListItem(
                existingFilter,
                { requestKey: null }
              ).catch(() => null);
              
              if (existingCheck) {
                console.log(`[Translate] Skipping ${collection}/${item.id} - already translated to ${langCode}`);
                continue;
              }
            } catch {}

            // Get translatable fields based on collection
            const translatableFields = getTranslatableFields(collection, item);
            
            if (translatableFields.length === 0) continue;

            const translatedData: Record<string, any> = { 
              language_code: langCode,
            };

            // Copy reference fields for each collection type
            switch (collection) {
              case 'site_content':
                if (item.website_id) translatedData.website_id = item.website_id;
                if (item.section_key) translatedData.section_key = item.section_key;
                if (item.page_path) translatedData.page_path = item.page_path;
                if (item.is_active !== undefined) translatedData.is_active = item.is_active;
                break;
              case 'cms_pages':
                if (item.website_id) translatedData.website_id = item.website_id;
                translatedData.path = item.path || '/' + (item.slug || '');
                translatedData.title = item.title || '';
                translatedData.slug = item.slug || '';
                if (item.status) translatedData.status = item.status;
                if (item.meta_title) translatedData.meta_title = item.meta_title;
                if (item.meta_description) translatedData.meta_description = item.meta_description;
                if (item.content) translatedData.content = item.content;
                if (item.seo) translatedData.seo = item.seo;
                if (item.is_published !== undefined) translatedData.is_published = item.is_published;
                if (item.is_active !== undefined) translatedData.is_active = item.is_active;
                break;
              case 'blog_posts':
                if (item.website_id) translatedData.website_id = item.website_id;
                translatedData.title = item.title || '';
                translatedData.slug = item.slug || '';
                if (item.category_id) translatedData.category_id = item.category_id;
                translatedData.status = item.status || 'draft';
                if (item.excerpt) translatedData.excerpt = item.excerpt;
                if (item.cover_image) translatedData.cover_image = item.cover_image;
                if (item.author_id) translatedData.author_id = item.author_id;
                if (item.content) translatedData.content = item.content;
                if (item.is_published !== undefined) translatedData.is_published = item.is_published;
                if (item.published_at) translatedData.published_at = item.published_at;
                if (item.is_active !== undefined) translatedData.is_active = item.is_active;
                break;
              case 'shop_products':
                if (item.website_id) translatedData.website_id = item.website_id;
                translatedData.name = item.name || '';
                translatedData.slug = item.slug || '';
                if (item.category_id) translatedData.category_id = item.category_id;
                if (item.category_name) translatedData.category_name = item.category_name;
                if (item.price) translatedData.price = item.price;
                if (item.stock !== undefined) translatedData.stock = item.stock;
                if (item.is_active !== undefined) translatedData.is_active = item.is_active;
                if (item.images_json) translatedData.images_json = item.images_json;
                if (item.short_description) translatedData.short_description = item.short_description;
                if (item.features) translatedData.features = item.features;
                break;
              case 'projects':
                if (item.website_id) translatedData.website_id = item.website_id;
                translatedData.title = item.title || '';
                if (item.description) translatedData.description = item.description;
                if (item.image) translatedData.image = item.image;
                if (item.image_before) translatedData.image_before = item.image_before;
                if (item.image_after) translatedData.image_after = item.image_after;
                if (item.video_url) translatedData.video_url = item.video_url;
                if (item.short_description) translatedData.short_description = item.short_description;
                translatedData.status = item.status || 'draft';
                if (item.is_featured !== undefined) translatedData.is_featured = item.is_featured;
                if (item.layout) translatedData.layout = item.layout;
                if (item.category_name) translatedData.category_name = item.category_name;
                const projSlug = item.slug || (translatedData.title ? translatedData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : '');
                if (projSlug) translatedData.slug = projSlug;
                break;
              case 'testimonials':
                if (item.website_id) translatedData.website_id = item.website_id;
                if (item.name) translatedData.name = item.name;
                if (item.review_text) translatedData.review_text = item.review_text;
                if (item.avatar_url) translatedData.avatar_url = item.avatar_url;
                if (item.rating !== undefined) translatedData.rating = item.rating;
                if (item.is_active !== undefined) translatedData.is_active = item.is_active;
                break;
              case 'business_collaborations':
                if (item.website_id) translatedData.website_id = item.website_id;
                if (item.title) translatedData.title = item.title;
                if (item.description) translatedData.description = item.description;
                if (item.file_url) translatedData.file_url = item.file_url;
                if (item.logo_url) translatedData.logo_url = item.logo_url;
                if (item.is_active !== undefined) translatedData.is_active = item.is_active;
                break;
              case 'web_offers':
                if (item.website_id) translatedData.website_id = item.website_id;
                translatedData.title = item.title || '';
                if (item.slug) translatedData.slug = item.slug;
                if (item.description) translatedData.description = item.description;
                if (item.image) translatedData.image = item.image;
                if (item.image_url) translatedData.image_url = item.image_url;
                if (item.category) translatedData.category = item.category;
                if (item.text) translatedData.text = item.text;
                if (item.is_active !== undefined) translatedData.is_active = item.is_active;
                break;
              default:
                if (item.section_key) translatedData.section_key = item.section_key;
                if (item.page_path) translatedData.page_path = item.page_path;
            }

            for (const { field, value } of translatableFields) {
              if (!value || typeof value !== 'string') continue;
              
              try {
                await new Promise(resolve => setTimeout(resolve, 200));
                
                const translated = await translateText(value, langName);
                translatedData[field] = translated;
                console.log(`[Translate] ✓ ${collection}.${field}: ${value.substring(0, 30)}... -> ${translated.substring(0, 30)}...`);
              } catch (err) {
                console.warn(`Translation failed for ${collection}.${item.id}.${field}:`, err);
              }
            }

            // Save translated content with detailed error handling
            try {
              await pb.collection(collection).create(translatedData);
              setLogs(prev => [`✓ ${collection}: ${item.title || item.name || item.section_key || item.id} (${langCode})`, ...prev]);
            } catch (err: any) {
              const errorMsg = err?.message || err?.response?.data || err?.originalError?.message || 'Unknown error';
              console.error(`[Translate] Save error for ${collection}.${item.id}:`, errorMsg);
              
              // Extract specific field errors from PocketBase response
              if (err?.response?.data) {
                const fieldErrors = Object.keys(err.response.data);
                console.error(`[Translate] Missing required fields: ${fieldErrors.join(', ')}`);
              }
            }
          }
        }
        
        setLogs(prev => [`✅ Ukończono: ${langName}`, ...prev]);
      }

      setCurrentTask('Tłumaczenie zakończone!')
    } catch (err: any) {
      setError(err.message || 'Wystąpił nieoczekiwany błąd')
    } finally {
      setIsTranslating(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <button 
        onClick={() => navigate('/languages')}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Powrót do języków
      </button>

      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center">
            <Wand2 className="w-6 h-6 text-sky-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Auto-Tłumaczenie AI</h1>
            <p className="text-gray-500 text-sm">Przetłumacz całą treść strony w kilka sekund.</p>
          </div>
        </div>

        {!isTranslating ? (
          <>
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
                Wybierz języki docelowe
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableLangs.map((lang) => (
                  <button
                    key={lang.language_code}
                    onClick={() => toggleLang(lang.language_code)}
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${
                      selectedLangs.includes(lang.language_code)
                        ? 'border-sky-600 bg-sky-50 ring-1 ring-sky-600'
                        : 'border-gray-200 hover:border-sky-300 bg-white'
                    }`}
                  >
                    <img 
                      src={getFlagUrl(lang.language_code)} 
                      alt={lang.language_code}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{lang.language_name}</p>
                      <p className="text-xs text-gray-500">{lang.language_code.toUpperCase()}</p>
                    </div>
                    {selectedLangs.includes(lang.language_code) && (
                      <CheckCircle2 className="w-5 h-5 text-sky-600" />
                    )}
                  </button>
                ))}
              </div>
              
              {availableLangs.length === 0 && (
                <div className="p-6 bg-gray-50 rounded-xl text-center border border-dashed border-gray-200">
                  <Globe className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Brak dostępnych języków. Dodaj języki w panelu głównym lub skontaktuj się z administratorem.</p>
                </div>
              )}
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <Button 
              className="w-full py-6 text-lg font-bold shadow-lg shadow-sky-100"
              disabled={selectedLangs.length === 0 || availableLangs.length === 0}
              onClick={startTranslation}
            >
              <Wand2 className="w-5 h-5 mr-2" />
              Rozpocznij tłumaczenie
            </Button>
          </>
        ) : (
          <div className="space-y-8">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-sky-600 animate-spin mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">{currentTask}</h3>
              <p className="text-gray-500 text-sm">To może potrwać kilka minut. Proszę nie zamykać okna.</p>
            </div>

            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-sky-600 bg-sky-200">
                    Postęp
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-sky-600">
                    {stats.total > 0 ? Math.round((stats.current / stats.total) * 100) : 0}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-sky-200">
                <div 
                  style={{ width: `${stats.total > 0 ? (stats.current / stats.total) * 100 : 0}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-sky-600 transition-all duration-500"
                />
              </div>
            </div>

            <div className="bg-gray-900 rounded-xl p-6 font-mono text-xs text-green-400 h-48 overflow-y-auto">
              {logs.map((log, i) => (
                <div key={i} className="mb-1 leading-relaxed">
                  <span className="text-gray-600 mr-2">[{new Date().toLocaleTimeString()}]</span>
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}

        {!isTranslating && stats.current > 0 && !error && (
          <div className="mt-8 p-6 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-4 text-emerald-800">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
            <div>
              <h4 className="font-bold">Sukces!</h4>
              <p className="text-sm opacity-90">Wszystkie treści zostały przetłumaczone i są gotowe do publikacji.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
