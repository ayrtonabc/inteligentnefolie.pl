import { CmsText, CmsImage } from '@/components/cms/CmsServerComponents';
import { CMSEditable } from '@/components/CMSEditable';
import { PageData } from '@/lib/pageData';
import Image from 'next/image';

export default function Prices({ pageData }: { pageData?: PageData }) {
  const prices = [
    { price: '1250', desc: 'Opcja podstawowa (Basic)' },
    { price: '1750', desc: 'Dom, biuro, łazienka' },
    { price: '1950', desc: 'Hotel, galerie handlowe' },
    { price: '2150', desc: 'Fasady zewnętrzne' },
    { price: '2550', desc: 'Zastosowania premium' },
  ];

  const applications = [
    { 
      name: 'Domy i mieszkania', 
      imageOn: '/images/bano-on.webp', 
      imageOff: '/images/bano-off.webp' 
    },
    { 
      name: 'Biura', 
      imageOn: '/images/biuro-on.webp', 
      imageOff: '/images/biuro-off.webp' 
    },
    { 
      name: 'Hotele', 
      imageOn: '/images/hotel-on.webp', 
      imageOff: '/images/hotel-off.webp' 
    },
    { 
      name: 'Centra handlowe', 
      imageOn: '/images/oficina-on.webp', 
      imageOff: '/images/oficina-off.webp' 
    },
    { 
      name: 'Lotniska', 
      imageOn: '/images/conferencia-on.webp', 
      imageOff: '/images/conferencia-off.webp' 
    },
    { 
      name: 'Obiekty zabytkowe', 
      imageOn: '/images/on.webp', 
      imageOff: '/images/off.webp' 
    },
  ];

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Top Header Section */}
        <div className="text-center mb-16">
          <CMSEditable cmsKey="home_apps_subtitle">
            <CmsText pageData={pageData} sectionKey="home_apps_subtitle" fallback="ZASTOSOWANIE" as="p" className="text-cyan font-medium text-xs tracking-[0.2em] uppercase mb-4" />
          </CMSEditable>
          <CMSEditable cmsKey="home_apps_title">
            <CmsText pageData={pageData} sectionKey="home_apps_title" fallback="Gdzie sprawdzi się inteligentna folia?" as="h2" className="text-4xl md:text-5xl font-light text-gray-900 leading-tight" />
          </CMSEditable>
        </div>

        {/* Applications Grid with Hover Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
          {applications.map((app, idx) => (
            <div key={idx} className="group relative rounded-2xl overflow-hidden aspect-[4/3] cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500">
              
              {/* Image ON (Default) */}
              <CMSEditable cmsKey={`home_apps_image_on_${idx}`} className="block w-full h-full">
                <CmsImage 
                  pageData={pageData}
                  sectionKey={`home_apps_image_on_${idx}`}
                  fallback={app.imageOn} 
                  alt={`${app.name} - ON`}
                  fill
                  className="object-cover transition-opacity duration-500 group-hover:opacity-0"
                />
              </CMSEditable>
              
              {/* Image OFF (Hover) */}
              <CMSEditable cmsKey={`home_apps_image_off_${idx}`} className="block absolute inset-0">
                <CmsImage 
                  pageData={pageData}
                  sectionKey={`home_apps_image_off_${idx}`}
                  fallback={app.imageOff} 
                  alt={`${app.name} - OFF`}
                  fill
                  className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />
              </CMSEditable>
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-500 pointer-events-none"></div>
              
              {/* Text Label */}
              <div className="absolute bottom-0 left-0 right-0 p-6 flex items-center justify-between">
                <CMSEditable cmsKey={`home_apps_name_${idx}`}>
                  <CmsText pageData={pageData} sectionKey={`home_apps_name_${idx}`} fallback={app.name} as="h3" className="font-medium text-white text-lg md:text-xl" />
                </CMSEditable>
                <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-3 py-1 text-[10px] text-white uppercase tracking-wider font-medium flex gap-2">
                  <span className="opacity-100 group-hover:opacity-50 transition-opacity">ON</span>
                  <span className="opacity-50 group-hover:opacity-100 transition-opacity">OFF</span>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Prices Section (Centered below) */}
        <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-3xl border border-gray-100 shadow-sm">
          <div className="text-center mb-10">
            <CMSEditable cmsKey="home_prices_subtitle">
              <CmsText pageData={pageData} sectionKey="home_prices_subtitle" fallback="CENNIK" as="p" className="text-cyan font-medium text-xs tracking-[0.2em] uppercase mb-3" />
            </CMSEditable>
            <CMSEditable cmsKey="home_prices_title">
              <CmsText pageData={pageData} sectionKey="home_prices_title" fallback="Przykładowe ceny z montażem" as="h3" className="text-3xl font-light text-gray-900" />
            </CMSEditable>
          </div>
          
          <div className="space-y-4">
            {prices.map((p, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-5 rounded-xl bg-gray-50 border border-gray-100 hover:border-cyan/30 transition-colors gap-2">
                <CMSEditable cmsKey={`home_prices_desc_${idx}`}>
                  <CmsText pageData={pageData} sectionKey={`home_prices_desc_${idx}`} fallback={p.desc} as="span" className="text-gray-700 font-medium" />
                </CMSEditable>
                <div className="text-left sm:text-right">
                  <span className="text-2xl font-bold text-gray-900">{p.price}</span>
                  <span className="text-sm text-gray-500 ml-1">zł/m²</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-6 text-center">* Ceny są orientacyjne i mogą ulec zmianie w zależności od specyfiki projektu.</p>
        </div>

      </div>
    </section>
  );
}