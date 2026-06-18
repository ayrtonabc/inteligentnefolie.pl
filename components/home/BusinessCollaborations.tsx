'use client'

import { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { Eye, X, Download, FileCheck } from 'lucide-react'
import { pb } from '@/lib/pocketbase'
import { CmsText } from '@/components/cms/CmsServerComponents'
import { PageData } from '@/lib/pageData'
import { useLanguage } from '@/lib/context/LanguageContext'
import Image from 'next/image'
import { PB_URL } from '@/lib/config'

interface CollaborationDoc {
  id: string
  title: string
  fileUrl: string
  description: string
  logoUrl?: string
}

async function fetchCollaborations(languageCode: string = 'pl'): Promise<CollaborationDoc[]> {
  try {
    const filter = `website_id = "dktsle4yev6syo4" && is_active = true && language_code = "${languageCode}"`
    const records = await pb.collection('business_collaborations').getFullList({
      filter,
      sort: 'created',
      requestKey: null,
    })
    
    const normalizeUrl = (record: any, urlField: string, fileField: string) => {
      const fileName = record[urlField] || record[fileField] || ''
      if (!fileName) return ''
      if (fileName.startsWith('http')) return fileName
      if (fileName.startsWith('/api/files')) return `${PB_URL}${fileName}`
      
      const collection = record.collectionId || record.collectionName || 'business_collaborations'
      return `${PB_URL}/api/files/${collection}/${record.id}/${fileName}`
    }
    
    if (records.length === 0 && languageCode !== 'pl') {
      const plFilter = `website_id = "dktsle4yev6syo4" && is_active = true && language_code = "pl"`
      const plRecords = await pb.collection('business_collaborations').getFullList({
        filter: plFilter,
        sort: 'created',
        requestKey: null,
      })
      return plRecords.map(r => ({
        id: r.id,
        title: r.title || '',
        fileUrl: normalizeUrl(r, 'file_url', 'file'),
        description: r.description || '',
        logoUrl: normalizeUrl(r, 'logo_url', 'logo')
      }))
    }
    
    return records.map(r => ({
      id: r.id,
      title: r.title || '',
      fileUrl: normalizeUrl(r, 'file_url', 'file'),
      description: r.description || '',
      logoUrl: normalizeUrl(r, 'logo_url', 'logo')
    }))
  } catch (err) {
    console.error('Error fetching collaborations:', err)
    return []
  }
}

function DocModal({ doc, onClose }: { doc: CollaborationDoc; onClose: () => void }) {
  return ReactDOM.createPortal(
    <div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 999999, display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '16px',
        backgroundColor: 'rgba(0,0,0,0.85)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: 'relative', width: '100%', maxWidth: '900px',
          height: '85vh', backgroundColor: '#fff', borderRadius: '16px',
          overflow: 'hidden', display: 'flex', flexDirection: 'column',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FileCheck style={{ color: '#06b6d4' }} size={24} />
            <div>
              <p style={{ fontWeight: 700, color: '#111827', margin: 0 }}>{doc.title}</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <a href={doc.fileUrl} download style={{ padding: '8px', color: '#6b7280', display: 'flex' }}>
              <Download size={20} />
            </a>
            <button
              onClick={onClose}
              style={{ padding: '8px', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
            >
              <X size={28} />
            </button>
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'hidden', backgroundColor: '#f3f4f6' }}>
          {doc.fileUrl && (
            <iframe
              src={doc.fileUrl + '#toolbar=0&navpanes=0'}
              style={{ width: '100%', height: '100%', border: 'none' }}
              title={doc.title}
            />
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

export default function BusinessCollaborations({ pageData }: { pageData?: PageData }) {
  const [collaborations, setCollaborations] = useState<CollaborationDoc[]>([])
  const [selectedDoc, setSelectedDoc] = useState<CollaborationDoc | null>(null)
  const [mounted, setMounted] = useState(false)
  const { language } = useLanguage()

  useEffect(() => { 
    setMounted(true)
    let cancelled = false
    
    fetchCollaborations(language || 'pl').then(data => {
      if (!cancelled) {
        setCollaborations(data)
      }
    })
    
    return () => {
      cancelled = true
    }
  }, [language])

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16 text-center">
          <CmsText pageData={pageData} sectionKey="home_business_subtitle" fallback="WSPÓŁPRACA" as="p" className="text-cyan font-medium text-xs tracking-[0.2em] uppercase mb-4" />
          <CmsText pageData={pageData} sectionKey="home_business_title" fallback="Współpraca z firmami" as="h2" className="text-4xl md:text-5xl font-light text-gray-900 leading-tight" />
          <CmsText pageData={pageData} sectionKey="home_business_desc" fallback="Dokumenty potwierdzające nasze doświadczenie i współpracę con firmami." as="p" className="text-gray-500 mt-4 max-w-2xl mx-auto" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {collaborations.length > 0 ? (
            collaborations.map((doc) => (
              <div
                key={doc.id}
                onClick={() => setSelectedDoc(doc)}
                className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
              >
                <div className="p-8 flex-1 flex flex-col items-center text-center">
                  {doc.logoUrl ? (
                    <div className="w-32 h-32 relative mb-6">
                      <Image
                        src={doc.logoUrl}
                        alt={doc.title}
                        className="object-contain"
                        fill
                        sizes="128px"
                        loading="lazy"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="w-32 h-32 flex items-center justify-center mb-6 bg-gray-100 rounded-xl">
                      <span className="text-4xl font-bold text-gray-400">{doc.title.charAt(0)}</span>
                    </div>
                  )}
                  <h3 className="font-bold text-gray-900 mb-2">{doc.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">{doc.description}</p>
                </div>
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-center">
                  <div className="flex items-center gap-2 text-cyan text-sm font-bold">
                    <Eye size={16} />
                    <CmsText pageData={pageData} sectionKey="home_business_view_doc" fallback="Zobacz dokument" as="span" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-12 text-gray-500">
              Brak dokumentów do wyświetlenia. Dodaj dokumenty w Panelu Admina.
            </div>
          )}
        </div>
      </div>

      {mounted && selectedDoc && <DocModal doc={selectedDoc} onClose={() => setSelectedDoc(null)} />}
    </section>
  )
}
