import { fetchPageData } from '@/lib/pageData';

export default async function DebugCms() {
  const pageData = await fetchPageData('/');
  
  return (
    <div className="p-8 font-mono text-sm">
      <h1 className="text-2xl font-bold mb-4">CMS Debug - Home Page Data</h1>
      
      <h2 className="text-lg font-bold mt-6 mb-2">Content count: {pageData.content.length}</h2>
      <div className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
        {pageData.content.map((c: any, i: number) => (
          <div key={i} className="border-b border-gray-300 py-2">
            <span className="font-bold">{c.section_key}</span>: 
            <span className="text-blue-600">{JSON.stringify(c.content_value)}</span>
          </div>
        ))}
      </div>
      
      <h2 className="text-lg font-bold mt-6 mb-2">Settings count: {Object.keys(pageData.settings).length}</h2>
      <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-48">
        {JSON.stringify(pageData.settings, null, 2)}
      </pre>
    </div>
  );
}
