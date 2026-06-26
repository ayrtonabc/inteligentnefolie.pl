'use client';

import { ArrowRight, Building2, Layout, DoorOpen, AppWindow, Layers, Wrench } from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';
import Image from 'next/image';

const servicesData = {
  subtitle: {
    pl: 'SPECJALIZACJA TECHNICZNA',
    en: 'TECHNICAL SPECIALIZATION',
    de: 'TECHNISCHE SPEZIALISIERUNG',
    cz: 'TECHNICKÁ SPECIALIZACE',
    es: 'ESPECIALIZACIÓN TÉCNICA',
    ua: 'ТЕХНІЧНА СПЕЦІАЛІЗАЦІЯ'
  },
  title: {
    pl: 'Kompleksowa produkcja i instalacja systemów PDLC',
    en: 'Complete production and installation of PDLC systems',
    de: 'Komplette Produktion und Installation von PDLC-Systemen',
    cz: 'Kompletní výroba a instalace systémů PDLC',
    es: 'Producción e instalación completa de sistemas PDLC',
    ua: 'Повне виробництво та встановлення систем PDLC'
  },
  intro: {
    pl: 'Oferujemy pełen zakres usług – od doradztwa technicznego, przez produkcję, aż po profesjonalny montaż folii i gotowych rozwiązań szklanych.',
    en: 'We offer the full range of services – from technical advice, through production, to professional installation of film and finished glass solutions.',
    de: 'Wir bieten das vollständige Leistungsspektrum – von technischer Beratung über Produktion bis zur professionellen Installation von Folie und Fertigglaslösungen.',
    cz: 'Nabízíme kompletní škálu služeb – od technického poradenství, přes výrobu, až po profesionální instalaci fólie a hotových skleněných řešení.',
    es: 'Ofrecemos la gama completa de servicios: desde asesoramiento técnico, pasando por la producción, hasta la instalación profesional de películas y soluciones de vidrio.',
    ua: 'Ми пропонуємо повний спектр послуг – від технічної консультації, через виробництво, до професійного встановлення плівки та готових скляних рішень.'
  },
  items: [
    {
      title: {
        pl: 'Fasady aluminiowo-szklane',
        en: 'Aluminum-glass facades',
        de: 'Aluminium-Glas-Fassaden',
        cz: 'Hliníkové-skleněné fasády',
        es: 'Fachadas de aluminio-vidrio',
        ua: 'Алюмінієво-скляні фасади'
      },
      desc: {
        pl: 'Projektowanie i montaż nowoczesnych fasad z wykorzystaniem szkła z inteligentną folią. Zapewniamy pełną kontrolę nad nasłonecznieniem i prywatnością w budynkach komercyjnych.',
        en: 'Design and installation of modern facades using smart glass film. We provide full control over sunlight and privacy in commercial buildings.',
        de: 'Design und Installation moderner Fassaden mit intelligentem Glasfilm. Wir bieten volle Kontrolle über Sonnenlicht und Privatsphäre in Gewerbegebäuden.',
        cz: 'Návrh a instalace moderních fasád s využitím inteligentní skleněné fólie. Zajišťujeme plnou kontrolu nad slunečním světlem a soukromím v komerčních budovách.',
        es: 'Diseño e instalación de fachadas modernas con película de vidrio inteligente. Proporcionamos control total sobre la luz solar y la privacidad en edificios comerciales.',
        ua: 'Проектування та встановлення сучасних фасадів з використанням розумної скляної плівки. Ми забезпечуємо повний контроль над сонячним світлом та приватністю в комерційних будівлях.'
      },
      icon: Building2
    },
    {
      title: {
        pl: 'Ścianki szklane',
        en: 'Glass partitions',
        de: 'Glaswände',
        cz: 'Skleněné příčky',
        es: 'Particiones de vidrio',
        ua: 'Скляні перегородки'
      },
      desc: {
        pl: 'Systemy podziału przestrzeni biurowych i domowych z aktywną folią PDLC, umożliwiające błyskawiczną zmianę z przeziernych na matowe za pomocą jednego kliknięcia.',
        en: 'Office and home space division systems with active PDLC film, enabling instant change from transparent to matte with a single click.',
        de: 'Büro- und Raumteilungssysteme mit aktiver PDLC-Folie, die sofortige Änderung von transparent zu matt mit einem Klick ermöglichen.',
        cz: 'Systémy dělení kancelářských a domácích prostor s aktivní PDLC fólií, umožňující okamžitou změnu z průhledné na matnou jedním kliknutím.',
        es: 'Sistemas de división de espacios de oficina y hogar con película PDLC activa, permitiendo el cambio instantáneo de transparente a mate con un solo clic.',
        ua: 'Системи поділу офісних та домашніх просторів з активною плівкою PDLC, що дозволяє миттєву зміну з прозорого на матовий одним кліком.'
      },
      icon: Layout
    },
    {
      title: {
        pl: 'Drzwi szklane',
        en: 'Glass doors',
        de: 'Glastüren',
        cz: 'Skleněné dveře',
        es: 'Puertas de vidrio',
        ua: 'Скляні двері'
      },
      desc: {
        pl: 'Produkcja i instalacja drzwi wahadłowych, przesuwnych i przymykowych ze zintegrowanym systemem smart glass, łączącym minimalistyczny design z funkcjonalnością.',
        en: 'Production and installation of swing, sliding and hinged doors with integrated smart glass system, combining minimalist design with functionality.',
        de: 'Produktion und Installation von Dreh-, Schiebe- und Anschlagtüren mit integriertem Smart-Glass-System, das minimalistisches Design mit Funktionalität verbindet.',
        cz: 'Výroba a instalace kyvných, posuvných a závěsných dveří s integrovaným systémem smart glass, kombinující minimalistický design s funkčností.',
        es: 'Producción e instalación de puertas batientes, correderas y de bisagra con sistema smart glass integrado, combinando diseño minimalista con funcionalidad.',
        ua: 'Виробництво та встановлення розпашних, розсувних та підвісних дверей з інтегрованою системою smart glass, що поєднує мінімалістичний дизайн з функціональністю.'
      },
      icon: DoorOpen
    },
    {
      title: {
        pl: 'Okna',
        en: 'Windows',
        de: 'Fenster',
        cz: 'Okna',
        es: 'Ventanas',
        ua: 'Вікна'
      },
      desc: {
        pl: 'Integracja folii ciekłokrystalicznej z tradycyjnymi i nowoczesnymi systemami okiennymi, eliminująca potrzebę stosowania tradycyjnych rolet czy żaluzji.',
        en: 'Integration of liquid crystal film with traditional and modern window systems, eliminating the need for traditional blinds or shutters.',
        de: 'Integration von Flüssigkristallfolie in traditionelle und moderne Fenstersysteme, wodurch der Bedarf an traditionellen Rollläden oder Jalousien entfällt.',
        cz: 'Integrace tekutokrystalické fólie s tradičními a moderními okenními systémy, čímž odpadá potřeba tradičních žaluzií nebo rolet.',
        es: 'Integración de película de cristal líquido con sistemas de ventanas tradicionales y modernos, eliminando la necesidad de persianas tradicionales.',
        ua: 'Інтеграція рідкокристалічної плівки з традиційними та сучасними віконними системами, усуваючи потребу в традиційних жалюзі.'
      },
      icon: AppWindow
    },
    {
      title: {
        pl: 'Integracja folii między szybami',
        en: 'Interlayer film integration',
        de: 'Folienintegration zwischen Glas',
        cz: 'Integrace fólie mezi skly',
        es: 'Integración de película entre vidrios',
        ua: 'Інтеграція плівки між склами'
      },
      desc: {
        pl: 'Zaawansowany proces laminacji folii PDLC bezpośrednio między dwiema taflami szkła, gwarantujący maksymalną trwałość, izolację akustyczną i ochronę przed uszkodzeniami zewnętrznymi.',
        en: 'Advanced PDLC film lamination process directly between two panes of glass, ensuring maximum durability, acoustic insulation and protection against external damage.',
        de: 'Fortschrittlicher PDLC-Folien-Laminierungsprozess direkt zwischen zwei Glasscheiben, der maximale Haltbarkeit, Schalldämmung und Schutz vor äußeren Beschädigungen gewährleistet.',
        cz: 'Pokročilý proces laminace PDLC fólie přímo mezi dvěma skleněnými tabulemi, zajišťující maximální odolnost, akustickou izolaci a ochranu proti vnějšímu poškození.',
        es: 'Proceso avanzado de laminación de película PDLC directamente entre dos paneles de vidrio, garantizando máxima durabilidad, aislamiento acústico y protección contra daños externos.',
        ua: 'Вдосконалений процес ламінації плівки PDLC безпосередньо між двома скляними панелями, що забезпечує максимальну довговічність, акустичну ізоляцію та захист від зовнішніх пошкоджень.'
      },
      icon: Layers
    }
  ],
  extraTitle: {
    pl: 'Gotowe konstrukcje z montażem',
    en: 'Finished constructions with installation',
    de: 'Fertige Konstruktionen mit Installation',
    cz: 'Hotové konstrukce s instalací',
    es: 'Construcciones terminadas con instalación',
    ua: 'Готові конструкції з встановленням'
  },
  extraDesc: {
    pl: 'Oprócz instalacji samej folii, produkujemy kompletne konstrukcje z możliwością integracji folii w niemal każdym systemie budowlanym. Zapewniamy realizację inwestycji od A do Z.',
    en: 'In addition to film installation, we produce complete constructions with the possibility of film integration in almost any building system. We provide investment implementation from A to Z.',
    de: 'Neben der Folieninstallation produzieren wir komplette Konstruktionen mit der Möglichkeit der Folienintegration in nahezu jedem Bausystem. Wir bieten Investitionsumsetzung von A bis Z.',
    cz: 'Kromě instalace fólie vyrábíme kompletní konstrukce s možností integrace fólie v téměř jakémkoli stavebním systému. Zajišťujeme realizaci investic od A do Z.',
    es: 'Además de la instalación de la película, producimos construcciones completas con posibilidad de integración de película en casi cualquier sistema de construcción. Proporcionamos implementación de inversión de la A a la Z.',
    ua: 'Окрім встановлення плівки, ми виробляємо повні конструкції з можливістю інтеграції плівки в майже будь-якій будівельній системі. Ми забезпечуємо реалізацію інвестицій від А до Я.'
  },
  extraLink: {
    pl: 'Sprawdź naszą ofertę ścianek szklanych',
    en: 'Check our glass partitions offer',
    de: 'Unser Angebot an Glaswänden prüfen',
    cz: 'Podívejte se na naši nabídku skleněných příček',
    es: 'Consulta nuestra oferta de particiones de vidrio',
    ua: 'Перевірте нашу пропозицію скляних перегородок'
  },
  quote: {
    pl: 'Instalacja folii inteligentnej w biurze',
    en: 'Smart film installation in office',
    de: 'Intelligente Folieninstallation im Büro',
    cz: 'Instalace inteligentní fólie v kanceláři',
    es: 'Instalación de película inteligente en oficina',
    ua: 'Встановлення розумної плівки в офісі'
  },
  signature: {
    pl: 'Nasze rozwiązania łączą nowoczesną architekturę z zaawansowaną technologią prywatności na żądanie, dostarczając innowacje bezpośrednio do Twojego biura lub domu.',
    en: 'Our solutions combine modern architecture with advanced on-demand privacy technology, delivering innovation directly to your office or home.',
    de: 'Unsere Lösungen kombinieren moderne Architektur mit fortschrittlicher Technologie für Privatsphäre auf Abruf und liefern Innovation direkt in Ihr Büro oder Zuhause.',
    cz: 'Naše řešení kombinují moderní architekturu s pokročilou technologií soukromí na vyžádání a přinášejí inovace přímo do vaší kanceláře nebo domova.',
    es: 'Nuestras soluciones combinan arquitectura moderna con tecnología avanzada de privacidad bajo demanda, entregando innovación directamente a tu oficina o hogar.',
    ua: 'Наші рішення поєднують сучасну архітектуру з передовою технологією приватності на вимогу, доставляючи інновації безпосередньо до вашого офісу чи дому.'
  },
  brand: {
    pl: 'Intelligent Solutions',
    en: 'Intelligent Solutions',
    de: 'Intelligente Lösungen',
    cz: 'Inteligentní řešení',
    es: 'Soluciones Inteligentes',
    ua: 'Розумні рішення'
  }
};

function getText(lang: string, obj: Record<string, string>): string {
  return obj[lang] || obj.pl || Object.values(obj)[0] || '';
}

export default function Services() {
  const { language } = useLanguage();
  const lang = language || 'pl';

  return (
    <section data-section="services" className="py-24 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          
          {/* Left Column: Services Content */}
          <div>
            <p className="text-cyan font-medium text-xs tracking-[0.2em] uppercase mb-4">
              {getText(lang, servicesData.subtitle)}
            </p>
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 leading-tight mb-6">
              {getText(lang, servicesData.title)}
            </h2>
            <p className="text-gray-500 mb-10 leading-relaxed">
              {getText(lang, servicesData.intro)}
            </p>
            
            <div className="space-y-4">
              {servicesData.items.map((service, idx) => {
                const Icon = service.icon;
                return (
                  <div key={idx} className="flex items-start gap-4 p-5 bg-gray-50 border border-gray-100 rounded-xl hover:border-cyan/30 hover:bg-white transition-all shadow-sm group">
                    <div className="w-10 h-10 rounded-lg bg-cyan/10 flex items-center justify-center flex-shrink-0 group-hover:bg-cyan group-hover:text-white transition-colors">
                      <Icon className="text-cyan group-hover:text-white" size={20} />
                    </div>
                    <div>
                      <h3 className="text-gray-900 font-medium mb-1.5">
                        {getText(lang, service.title)}
                      </h3>
                      <p className="text-gray-500 text-sm leading-relaxed">
                        {getText(lang, service.desc)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Extra Box: Complete structures */}
            <div className="mt-8 bg-gray-900 p-6 md:p-8 rounded-2xl border border-gray-800 text-white shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-white/10 p-2 rounded-lg"><Wrench className="text-cyan" size={20} /></div>
                <h4 className="font-medium text-lg">{getText(lang, servicesData.extraTitle)}</h4>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                {getText(lang, servicesData.extraDesc)}
              </p>
              <a 
                href="https://www.scianki-szklane.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 text-sm font-medium hover:bg-cyan transition-colors px-5 py-3 rounded-lg"
              >
                {getText(lang, servicesData.extraLink)} <ArrowRight size={16} />
              </a>
            </div>
          </div>

          {/* Right Column: Image and Quote */}
          <div className="lg:sticky lg:top-32 relative h-[500px] lg:h-[800px] rounded-3xl overflow-hidden shadow-2xl">
            <Image
              src="/images/biuro-on.webp"
              alt="Smart glass installation"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority={false}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
              <div 
                className="bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl"
                style={{ boxShadow: '0 20px 40px -15px rgba(0,0,0,0.5)' }}
              >
                <div className="mb-4 opacity-50">
                  <svg width="32" height="24" viewBox="0 0 32 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 24V11.2308L4.92308 0H10.5846L6.89231 11.2308H11.3231V24H0ZM19.2 24V11.2308L24.1231 0H29.7846L26.0923 11.2308H30.5231V24H19.2Z" fill="white"/>
                  </svg>
                </div>
                <p className="text-white text-lg md:text-xl font-light leading-relaxed italic tracking-wide">
                  {getText(lang, servicesData.signature)}
                </p>
                <div className="mt-6 flex items-center gap-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-cyan/50 to-transparent" />
                  <span className="text-cyan text-[10px] uppercase tracking-[0.3em] font-medium">
                    {getText(lang, servicesData.brand)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
