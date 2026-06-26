'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingChat from '@/components/FloatingChat';
import { CmsText } from '@/components/cms/CmsComponents';
import BeforeAfterSlider from './BeforeAfterSlider';
import { useVisualEditor } from '@/lib/context/VisualEditorContext';
import { PageData } from '@/lib/pageData';
import { Project } from '@/lib/portfolio';
import AggregateRatingSchema from '@/components/seo/AggregateRatingSchema';

interface RealizacjeClientProps {
  pageData?: PageData;
  heroTitle: string;
  heroSubtitle: string;
  pagePath: string;
  initialProjects: Project[];
}

export default function RealizacjeClient({ pageData, heroTitle, heroSubtitle, pagePath, initialProjects }: RealizacjeClientProps) {
  const { isEditing } = useVisualEditor();

  return (
    <div className="w-full bg-white min-h-screen font-sans">
      <Header pageData={pageData} />

      {/* Hero Section */}
      <section className="pt-48 pb-16 bg-[#0A0A0A] text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <CmsText 
            pagePath={pagePath} 
            sectionKey="hero_title" 
            fallback={heroTitle || 'Nasze projekty'} 
            as="h1" 
            className="text-4xl md:text-5xl font-bold mb-6 tracking-tight" 
          />
          <CmsText 
            pagePath={pagePath} 
            sectionKey="hero_subtitle" 
            fallback={heroSubtitle || 'Przesuń suwak, aby zobaczyć efekt włączenia i wyłączenia.'} 
            as="p" 
            className="text-gray-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed" 
          />
        </div>
      </section>

      {/* Projects Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="space-y-24">
            {initialProjects.length === 0 ? (
              <div className="py-20 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                <p className="text-gray-400">Dodaj projekty w panelu Portfolio, aby pojawiły się tutaj.</p>
              </div>
            ) : (
              initialProjects.map((project, idx) => {
                const isVideo = !!project.video_url;
                const isSlider = !!(project.image_before && project.image_after);
                const hasSingleImage = !!project.image_url;
                
                return (
                  <div 
                    key={project.id} 
                    className={`flex flex-col items-center gap-10 md:gap-16 ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                  >
                    {/* Media Container */}
                    <div className="w-full md:w-[60%] aspect-video md:aspect-[16/10] relative rounded-[2rem] overflow-hidden shadow-2xl shadow-black/10 group">
                      {isSlider ? (
                        <BeforeAfterSlider
                          beforeImage={project.image_before}
                          afterImage={project.image_after}
                          beforeLabel="WYŁĄCZONE"
                          afterLabel="WŁĄCZONE"
                        />
                      ) : isVideo ? (
                        <div className="w-full h-full bg-black">
                          <video 
                            src={project.video_url} 
                            autoPlay 
                            muted 
                            loop 
                            playsInline
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-4 right-4 bg-cyan text-black text-[10px] font-extrabold px-3 py-1.5 rounded uppercase tracking-wider">
                            VIDEO
                          </div>
                        </div>
                      ) : (
                        <img 
                          src={project.image_url || 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1200'} 
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    {/* Content Container */}
                    <div className="w-full md:w-[40%] flex flex-col justify-center">
                      <span className="text-[#00D1FF] text-[11px] font-bold tracking-[0.2em] uppercase mb-3">
                        {project.category || 'Realizacja'}
                      </span>
                      <h3 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-5 tracking-tight">
                        {project.title}
                      </h3>
                      <p className="text-[#666666] text-sm md:text-base leading-relaxed mb-8">
                        {project.description}
                      </p>
                      
                      <button 
                        onClick={() => window.location.href = '/kontakt'}
                        className="bg-black text-white font-bold px-8 py-4 rounded-full hover:bg-gray-800 transition-all active:scale-95 text-sm w-fit shadow-xl shadow-black/20"
                      >
                        Poproś o wycenę
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      <Footer pageData={pageData} />
      <FloatingChat pageData={pageData} />
      <AggregateRatingSchema ratingValue="4.8" reviewCount="135" />
    </div>
  );
}
