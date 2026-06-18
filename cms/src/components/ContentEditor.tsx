import { useState, useEffect } from 'react';

interface ContentEditorProps {
  sectionKey: string;
  contentType: string;
  value: string;
  onChange: (newValue: string) => void;
}

// Parse content based on content type
function parseContent(value: string, contentType: string): any {
  if (!value) return contentType === 'json' ? {} : '';
  if (contentType === 'json') {
    try {
      return JSON.parse(value);
    } catch {
      console.error('Failed to parse JSON:', value);
      return {};
    }
  }
  return value;
}

// Convert form data back to storage format
function serializeContent(data: any, contentType: string): string {
  if (contentType === 'json') {
    return JSON.stringify(data);
  }
  return String(data);
}

export function ContentEditor({ sectionKey, contentType, value, onChange }: ContentEditorProps) {
  const [formData, setFormData] = useState<any>(null);
  
  useEffect(() => {
    console.log('ContentEditor props:', { sectionKey, contentType, value });
    const parsed = parseContent(value, contentType);
    console.log('Parsed data:', parsed);
    setFormData(parsed);
  }, [value, contentType]);
  
  // Render null until data is loaded
  if (formData === null) {
    return <div className="text-sm text-gray-500">Ładowanie...</div>;
  }
  
  const handleChange = (newVal: any) => {
    setFormData(newVal);
    onChange(serializeContent(newVal, contentType));
  };
  
  // For simple text content
  if (contentType === 'text') {
    return (
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Treść</label>
        <textarea
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 text-sm min-h-[150px]"
          value={formData || ''}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Wpisz treść..."
        />
        <div className="text-xs text-gray-400 mt-1">
          {(formData || '').length} znaków
        </div>
      </div>
    );
  }
  
  // For JSON content
  if (contentType === 'json') {
    const data = formData || {};
    
    // Button/CTA JSON: {"text": "...", "href": "..."}
    if (sectionKey.includes('button') || sectionKey.includes('cta')) {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Tekst przycisku</label>
            <input
              className="input w-full"
              value={data.text || ''}
              onChange={(e) => handleChange({ ...data, text: e.target.value })}
              placeholder="Np. Zobacz więcej"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Link (URL)</label>
            <input
              className="input w-full"
              value={data.href || ''}
              onChange={(e) => handleChange({ ...data, href: e.target.value })}
              placeholder="Np. /kontakt"
            />
          </div>
        </div>
      );
    }
    
    // Array content (badges, lists, products, etc.)
    if (Array.isArray(data)) {
      const isStringArray = data.length === 0 || typeof data[0] === 'string';
      
      if (isStringArray) {
        // Array of strings
        const items = data.length > 0 ? data : [];
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-gray-600">Elementy</label>
              <button
                type="button"
                onClick={() => handleChange([...items, ''])}
                className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
              >
                + Dodaj
              </button>
            </div>
            <div className="space-y-2">
              {items.map((item: string, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    className="input flex-1"
                    value={item}
                    onChange={(e) => {
                      const newItems = [...items];
                      newItems[index] = e.target.value;
                      handleChange(newItems);
                    }}
                    placeholder={`Element ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => handleChange(items.filter((_, i) => i !== index))}
                    className="p-2 text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      } else {
        // Array of objects (products, features, etc.)
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-gray-600">Elementy</label>
              <button
                type="button"
                onClick={() => handleChange([...data, { title: '', description: '' }])}
                className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
              >
                + Dodaj
              </button>
            </div>
            <div className="space-y-3">
              {data.map((item: any, index: number) => (
                <div key={index} className="border rounded-lg p-3 space-y-2 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500">Element {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleChange(data.filter((_: any, i: number) => i !== index))}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Usuń
                    </button>
                  </div>
                  <input
                    className="input w-full"
                    value={item.title || item.text || item.name || ''}
                    onChange={(e) => {
                      const newItems = [...data];
                      newItems[index] = { ...item, title: e.target.value };
                      handleChange(newItems);
                    }}
                    placeholder="Tytuł..."
                  />
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm min-h-[60px]"
                    value={item.description || item.desc || ''}
                    onChange={(e) => {
                      const newItems = [...data];
                      newItems[index] = { ...item, description: e.target.value };
                      handleChange(newItems);
                    }}
                    placeholder="Opis..."
                  />
                </div>
              ))}
            </div>
          </div>
        );
      }
    }
    
    // Generic object editor
    return (
      <div className="space-y-3">
        {Object.entries(data).map(([key, val]) => (
          <div key={key}>
            <label className="block text-xs font-semibold text-gray-600 mb-1 capitalize">{key}</label>
            {typeof val === 'string' && (val as string).length > 50 ? (
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm min-h-[80px]"
                value={val as string}
                onChange={(e) => handleChange({ ...data, [key]: e.target.value })}
                placeholder={key}
              />
            ) : (
              <input
                className="input w-full"
                value={val as string}
                onChange={(e) => handleChange({ ...data, [key]: e.target.value })}
                placeholder={key}
              />
            )}
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <div className="text-sm text-gray-500">
      Nieznany typ treści: {contentType}
    </div>
  );
}
