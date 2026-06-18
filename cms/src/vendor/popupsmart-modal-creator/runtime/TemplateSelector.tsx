import React from 'react'

type TemplateSelectorProps = {
  value: string
  onChange: (id: string) => void
}

const TEMPLATES = [
  { id: 'classic', name: 'Classic' },
  { id: 'minimal', name: 'Minimal' },
]

export function TemplateSelector(props: TemplateSelectorProps) {
  return (
    <div className="p-4 space-y-2">
      <div className="text-sm font-semibold mb-2">Plantillas</div>
      <div className="space-y-2">
        {TEMPLATES.map(t => (
          <button
            key={t.id}
            onClick={() => props.onChange(t.id)}
            className={`w-full text-left px-3 py-2 rounded-md border ${props.value === t.id ? 'border-sky-500 bg-sky-50' : 'border-gray-200'}`}
          >
            {t.name}
          </button>
        ))}
      </div>
    </div>
  )
}

