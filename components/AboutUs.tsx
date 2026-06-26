'use client';

import { useState, useEffect } from 'react';
import { PageData, getPageContentValue } from '@/lib/pageData';
import { CMSEditable } from '@/components/CMSEditable';
import { CmsText, CmsImage } from '@/components/cms/CmsServerComponents';
import {
  Shield, Award, CheckCircle, Wrench, Package,
  Settings, Recycle, Building2, Phone, Mail,
  MapPin, HardHat, Sparkles
} from 'lucide-react';
import Image from 'next/image';

interface AboutUsProps {
  pageData?: PageData;
  lang?: string;
}

export default function AboutUs({ pageData, lang = 'pl' }: AboutUsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getContent = (key: string, fallback: string = '') => {
    return getPageContentValue(pageData, key, fallback, lang);
  };

  if (!mounted) {
    return (
      <div className="w-full min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  const heroImage = getContent('about_hero_image', 'https://pb.fullwork.pl/api/files/pbc_2708086759/1254rurqm6zjscj/1_opt_dy0ut72lqr.webp');
  const welcomeTitle = getContent('about_welcome_title', 'Jesteśmy Altra');
  const welcomeText = getContent('about_welcome_text', 'Jesteśmy wiodącym producentem i instalatorem konstrukcji szklanych w Polsce. Działamy pod firmą Altra Sp. z o.o. Specjalizujemy się w produkcji ścianek szklanych, balustrad, drzwi szklanych, schodów szklanych, podłóg szklanych oraz innowacyjnych rozwiązań z wykorzystaniem folii inteligentnych.');
  const companyName = getContent('about_company_name', 'Altra sp. z o.o.');
  const companyAddress = getContent('about_company_address', 'Polska');
  const companyPhone = getContent('about_company_phone', '+48 790 555 900');
  const email1 = getContent('about_email_1', 'biuro@scianki-szklane.com');
  const email2 = getContent('about_email_2', 'biuro@inteligentnefolie.pl');
  
  const statProjects = getContent('about_stat_projects', '500+');
  const statYears = getContent('about_stat_years', '15+');
  const statClients = getContent('about_stat_clients', '300+');
  const statCities = getContent('about_stat_cities', '50+');
  const statProjectsLabel = getContent('about_stat_projects_label', 'Zrealizowanych projektów');
  const statYearsLabel = getContent('about_stat_years_label', 'Lat doświadczenia');
  const statClientsLabel = getContent('about_stat_clients_label', 'Zadowolonych klientów');
  const statCitiesLabel = getContent('about_stat_cities_label', 'Miast w Polsce');
  
  const missionTitle = getContent('about_mission_title', 'Nasza misja');
  const missionText = getContent('about_mission_text', 'Dostarczamy naszym klientom najwyższej jakości rozwiązania szklane, które łączą funkcjonalność z estetyką. Dzięki indywidualnemu podejściu do każdego projektu realizujemy nawet najbardziej wymagające oczekiwania.');
  const missionImage = getContent('about_mission_image', 'https://pb.fullwork.pl/api/files/pbc_2708086759/cmkxjebmhp97nt9/folia_pdlc_samoprzylepna_opt_bjjxds81vd.webp');
  
  const whyTitle = getContent('about_why_title', 'Dlaczego wybrać Altra i Inteligentne Folie?');
  const whyItem1 = getContent('about_why_item_1', 'Altra i Inteligentne Folie to ta sama firma - lider w branży konstrukcji szklanych w Polsce, działająca pod firmą Altra Sp. z o.o.');
  const whyItem2 = getContent('about_why_item_2', 'Autoryzowany partner DORMA');
  const whyItem3 = getContent('about_why_item_3', 'Szkło hartowane i laminowane najwyższej jakości');
  const whyItem4 = getContent('about_why_item_4', 'Indywidualne podejście do każdego projektu');
  const whyItem5 = getContent('about_why_item_5', 'Realizacje od A do Z - pomiar, produkcja, montaż');
  
  const productsTitle = getContent('about_products_title', 'Nasze produkty');
  const productsSubtitle = getContent('about_products_subtitle', 'Kompleksowa oferta systemów szklanych');
  
  const servicesTitle = getContent('about_services_title', 'Usługi');
  const servicesSubtitle = getContent('about_services_subtitle', 'Od projektu po montaż');
  const servicesOffer = getContent('about_services_offer', 'Oferujemy kompleksowe usługi montażu i wsparcia w budowie oraz projektowaniu nietypowych konstrukcji szklanych.');
  const servicesWarranty = getContent('about_services_warranty', 'Świadczymy również usługi gwarancyjne i pogwarancyjne.');
  
  const ecoTitle = getContent('about_eco_title', 'Świadomi ekologicznie');
  const ecoText = getContent('about_eco_text', 'Dla ochrony środowiska zajmujemy się również zbieraniem i utylizacją odpadów szklanych.');
  const ecoImage = getContent('about_eco_image', '/images/reciclaje.webp');
  
  const polandLabel = getContent('about_poland_label', 'ZASIĘG DZIAŁANIA');
  const polandTitle = getContent('about_poland_title', 'Pracujemy w całej Polsce');
  const polandText = getContent('about_poland_text', 'Realizujemy projekty w każdym zakątku Polski. Niezależnie od lokalizacji, gwarantujemy profesjonalną obsługę i najwyższą jakość wykonania.');
  const polandButton = getContent('about_poland_button', 'Skontaktuj się z nami');
  const polandMap = getContent('about_poland_map', '/images/mapa.webp');

  const sectionAboutLabel = getContent('about_section_about', 'O NASZEJ FIRMIE');
  const sectionValuesLabel = getContent('about_section_values', 'NASZE WARTOŚCI');
  const contactButton = getContent('about_contact_button', 'Skontaktuj się z nami');
  const productsLabel = getContent('about_products_label', 'Nasze produkty');
  const servicesLabel = getContent('about_services_label', 'Usługi');

  const gallery1 = getContent('about_gallery_1', 'https://pb.fullwork.pl/api/files/pbc_2708086759/x7q797h6qe0dd3y/1_opt_obexbktemf.webp');
  const gallery2 = getContent('about_gallery_2', 'https://pb.fullwork.pl/api/files/pbc_2708086759/wg9ahnw1frou3uk/2_opt_eo1mdtfefa.webp');
  const gallery3 = getContent('about_gallery_3', 'https://pb.fullwork.pl/api/files/pbc_2708086759/v4zsnc7xcgdjjph/5_opt_ws5689txcb.webp');
  const gallery4 = getContent('about_gallery_4', 'https://pb.fullwork.pl/api/files/pbc_2708086759/0ktlug4rf8yphba/6_opt_rw6svqnzgf.webp');
  const gallery5 = getContent('about_gallery_5', 'https://pb.fullwork.pl/api/files/pbc_2708086759/s0aba7uyv90ochb/3_opt_95lrets5in.webp');
  const gallery6 = getContent('about_gallery_6', 'https://pb.fullwork.pl/api/files/pbc_2708086759/vyjwnfmzd524oyw/4_opt_76euw20l8o.webp');

  const productDoorTitle = getContent('about_product_door_title', 'Systemy akcesoriów do drzwi');
  const productDoor1 = getContent('about_product_door_1', 'Studio Rondo');
  const productDoor2 = getContent('about_product_door_2', 'Studio Classic');
  const productDoor3 = getContent('about_product_door_3', 'Studio Gala 2');
  const productDoor4 = getContent('about_product_door_4', 'Studio Arcos');
  const productDoor5 = getContent('about_product_door_5', 'Office Junior');
  const productDoor6 = getContent('about_product_door_6', 'Manet Compact');
  const productDoor7 = getContent('about_product_door_7', 'MUTO');
  const productDoor8 = getContent('about_product_door_8', '+12 więcej');

  const productWallsTitle = getContent('about_product_walls_title', 'Ścianki mobilne');
  const productWalls1 = getContent('about_product_walls_1', 'HSW-G');
  const productWalls2 = getContent('about_product_walls_2', 'HSW-GP');
  const productWalls3 = getContent('about_product_walls_3', 'HSW-R');
  const productWalls4 = getContent('about_product_walls_4', 'HSW-ISO');
  const productWalls5 = getContent('about_product_walls_5', 'FSW');

  const productProfilesTitle = getContent('about_product_profiles_title', 'Profile systemowe');
  const productProfiles1 = getContent('about_product_profiles_1', 'TP/TA');
  const productProfiles2 = getContent('about_product_profiles_2', 'LM');
  const productProfiles3 = getContent('about_product_profiles_3', 'MR 22/28');

  const productSmartTitle = getContent('about_product_smart_title', 'Folie inteligentne');
  const productSmart1 = getContent('about_product_smart_1', 'PDLC');
  const productSmart2 = getContent('about_product_smart_2', 'LCD');
  const productSmart3 = getContent('about_product_smart_3', 'Integracja między szybowa');

  const service1Title = getContent('about_service_1_title', 'Profesjonalny montaż');
  const service1Desc = getContent('about_service_1_desc', 'Nasi doświadczeni монтаżownicy realizują instalacje w całej Polsce, gwarantując najwyższą jakość wykonania.');
  const service2Title = getContent('about_service_2_title', 'Doradztwo techniczne');
  const service2Desc = getContent('about_service_2_desc', 'Pomagamy w doborze odpowiednich rozwiązań szklanych, uwzględniając indywidualne potrzeby każdego projektu.');
  const service3Title = getContent('about_service_3_title', 'Gwarancja i serwis');
  const service3Desc = getContent('about_service_3_desc', 'Oferujemy roczną gwarancję na wszystkie realizacje oraz profesjonalny serwis pogwarancyjny.');
  const service4Title = getContent('about_service_4_title', 'Ekologia i recykling');
  const service4Desc = getContent('about_service_4_desc', 'Dbamy o środowisko - zajmujemy się zbieraniem i utylizacją odpadów szklanych.');

  const products = {
    doorAccessories: { icon: Building2, title: productDoorTitle, items: [productDoor1, productDoor2, productDoor3, productDoor4, productDoor5, productDoor6, productDoor7, productDoor8] },
    movableWalls: { icon: Settings, title: productWallsTitle, items: [productWalls1, productWalls2, productWalls3, productWalls4, productWalls5] },
    profiles: { icon: Package, title: productProfilesTitle, items: [productProfiles1, productProfiles2, productProfiles3] },
    smartGlass: { icon: Sparkles, title: productSmartTitle, items: [productSmart1, productSmart2, productSmart3] }
  };

  const services = [
    { icon: HardHat, title: service1Title, desc: service1Desc },
    { icon: Wrench, title: service2Title, desc: service2Desc },
    { icon: Shield, title: service3Title, desc: service3Desc },
    { icon: Recycle, title: service4Title, desc: service4Desc }
  ];

  return (
    <div className="w-full bg-white">
      <section className="relative w-full h-[50vh] min-h-[300px] md:h-[70vh] md:min-h-[500px] flex items-center justify-center bg-gray-100 mt-16">
        <CMSEditable cmsKey="about_hero_image">
          <Image src={heroImage} alt="Altra - Profesjonalne konstrukcje szklane" fill className="object-contain md:object-contain" />
        </CMSEditable>
      </section>

      <section className="py-12 md:py-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-start lg:items-center">
            <div className="order-2 lg:order-1">
              <CMSEditable cmsKey="about_section_about" as="p" className="text-cyan font-semibold tracking-[0.2em] uppercase text-xs md:text-sm mb-3 md:mb-4">
                {sectionAboutLabel}
              </CMSEditable>
              <CMSEditable cmsKey="about_welcome_title" as="h1" className="text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-4 md:mb-6">
                {welcomeTitle}
              </CMSEditable>
              <CMSEditable cmsKey="about_welcome_text" as="p" className="text-base md:text-lg text-gray-600 leading-relaxed mb-6 md:mb-8">
                {welcomeText}
              </CMSEditable>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-cyan/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-cyan" />
                  </div>
                  <div>
                    <CMSEditable cmsKey="about_company_name" as="p" className="font-semibold text-black">{companyName}</CMSEditable>
                    <CMSEditable cmsKey="about_company_address" as="p" className="text-gray-600">{companyAddress}</CMSEditable>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-cyan/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-cyan" />
                  </div>
                  <CMSEditable cmsKey="about_company_phone" as="p" className="text-gray-600">{companyPhone}</CMSEditable>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-cyan/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-cyan" />
                  </div>
                  <div>
                    <CMSEditable cmsKey="about_email_1" as="p" className="text-gray-600">{email1}</CMSEditable>
                    <CMSEditable cmsKey="about_email_2" as="p" className="text-gray-600">{email2}</CMSEditable>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {[
                { src: gallery1, key: 'about_gallery_1' },
                { src: gallery2, key: 'about_gallery_2' },
                { src: gallery3, key: 'about_gallery_3' },
                { src: gallery4, key: 'about_gallery_4' },
                { src: gallery5, key: 'about_gallery_5' },
                { src: gallery6, key: 'about_gallery_6' }
              ].map((img, i) => (
                <CMSEditable key={i} cmsKey={img.key} className="relative h-32 md:h-48 lg:h-64 rounded-xl overflow-hidden group cursor-pointer block">
                  <Image src={img.src} alt={`Gallery ${i + 1}`} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                </CMSEditable>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-black text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {[
              { value: statProjects, label: statProjectsLabel, keyVal: 'about_stat_projects', keyLabel: 'about_stat_projects_label' },
              { value: statYears, label: statYearsLabel, keyVal: 'about_stat_years', keyLabel: 'about_stat_years_label' },
              { value: statClients, label: statClientsLabel, keyVal: 'about_stat_clients', keyLabel: 'about_stat_clients_label' },
              { value: statCities, label: statCitiesLabel, keyVal: 'about_stat_cities', keyLabel: 'about_stat_cities_label' }
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <CMSEditable cmsKey={stat.keyVal} as="p" className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-cyan mb-1 md:mb-2">{stat.value}</CMSEditable>
                <CMSEditable cmsKey={stat.keyLabel} as="p" className="text-xs md:text-sm text-gray-400 uppercase tracking-wider">{stat.label}</CMSEditable>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <CMSEditable cmsKey="about_mission_image" className="relative h-[250px] md:h-[350px] lg:h-[500px] rounded-2xl overflow-hidden block">
                <Image src={missionImage} alt="Nasza misja" fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 md:bottom-8 md:left-8 md:right-8">
                  <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                    <div className="w-8 h-8 md:w-12 md:h-12 bg-cyan rounded-full flex items-center justify-center">
                      <Award className="w-4 h-4 md:w-6 md:h-6 text-black" />
                    </div>
                    <CMSEditable cmsKey="about_mission_title" as="p" className="text-cyan font-semibold tracking-wider uppercase text-xs md:text-sm">{missionTitle}</CMSEditable>
                  </div>
                  <CMSEditable cmsKey="about_mission_text" as="p" className="text-white text-sm md:text-lg leading-relaxed">{missionText}</CMSEditable>
                </div>
              </CMSEditable>
            </div>

            <div className="order-1 lg:order-2">
              <CMSEditable cmsKey="about_section_values" as="p" className="text-cyan font-semibold tracking-[0.2em] uppercase text-xs md:text-sm mb-2 md:mb-4">
                {sectionValuesLabel}
              </CMSEditable>
              <CMSEditable cmsKey="about_why_title" as="h2" className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-black mb-4 md:mb-8">
                {whyTitle}
              </CMSEditable>

              <div className="space-y-6">
                {[
                  { text: whyItem1, key: 'about_why_item_1' },
                  { text: whyItem2, key: 'about_why_item_2' },
                  { text: whyItem3, key: 'about_why_item_3' },
                  { text: whyItem4, key: 'about_why_item_4' },
                  { text: whyItem5, key: 'about_why_item_5' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <CheckCircle className="w-6 h-6 text-cyan flex-shrink-0 mt-0.5" />
                    <CMSEditable cmsKey={item.key} as="p" className="text-gray-700 text-lg">{item.text}</CMSEditable>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <CMSEditable cmsKey="about_products_label" as="p" className="text-cyan font-semibold tracking-[0.2em] uppercase text-sm mb-4">
              {productsLabel}
            </CMSEditable>
            <CMSEditable cmsKey="about_products_title" as="h2" className="text-4xl md:text-5xl font-bold text-black mb-4">
              {productsTitle}
            </CMSEditable>
            <CMSEditable cmsKey="about_products_subtitle" as="p" className="text-gray-600 text-lg">
              {productsSubtitle}
            </CMSEditable>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(products).map(([key, category]) => (
              <div key={key} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                <CMSEditable cmsKey={`about_product_${key}_title`} className="w-14 h-14 bg-cyan/10 rounded-xl flex items-center justify-center mb-6 block">
                  <category.icon className="w-7 h-7 text-cyan" />
                </CMSEditable>
                <CMSEditable cmsKey={`about_product_${key}_title`} as="h4" className="text-xl font-bold text-black mb-4">{category.title}</CMSEditable>
                <ul className="space-y-2">
                  {category.items.map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan" />
                      <CMSEditable cmsKey={`about_product_${key}_${i + 1}`} as="span" className="text-gray-600 text-sm">{item}</CMSEditable>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <CMSEditable cmsKey="about_services_label" as="p" className="text-cyan font-semibold tracking-[0.2em] uppercase text-sm mb-4">
              {servicesLabel}
            </CMSEditable>
            <CMSEditable cmsKey="about_services_title" as="h2" className="text-4xl md:text-5xl font-bold text-black mb-4">
              {servicesTitle}
            </CMSEditable>
            <CMSEditable cmsKey="about_services_subtitle" as="p" className="text-gray-600 text-lg max-w-2xl mx-auto">
              {servicesSubtitle}
            </CMSEditable>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {services.map((service, idx) => (
              <div key={idx} className="bg-white border border-gray-200 rounded-2xl p-4 md:p-6 lg:p-8 hover:border-cyan/30 transition-colors group">
                <div className="flex items-start gap-4 md:gap-6">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-black rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-cyan transition-colors">
                    <service.icon className="w-6 h-6 md:w-8 md:h-8 text-white group-hover:text-black transition-colors" />
                  </div>
                  <div>
                    <CMSEditable cmsKey={`about_service_${idx + 1}_title`} as="h4" className="text-lg md:text-xl font-bold text-black mb-2 md:mb-3">{service.title}</CMSEditable>
                    <CMSEditable cmsKey={`about_service_${idx + 1}_desc`} as="p" className="text-gray-600 text-sm md:text-base leading-relaxed">{service.desc}</CMSEditable>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 md:mt-12 bg-gradient-to-r from-cyan to-cyan/80 rounded-xl md:rounded-2xl p-4 md:p-8 text-center">
            <CMSEditable cmsKey="about_services_offer" as="p" className="text-black text-lg md:text-xl font-medium mb-6">
              {servicesOffer}
            </CMSEditable>
            <CMSEditable cmsKey="about_services_warranty" as="p" className="text-black text-lg md:text-xl font-medium mb-6">
              {servicesWarranty}
            </CMSEditable>
            <CMSEditable cmsKey="about_contact_button" as="a" href="/kontakt" className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 font-semibold hover:bg-gray-800 transition-colors">
              {contactButton}
            </CMSEditable>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20 px-4 md:px-6 bg-black text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start gap-8 md:gap-12">
            <div className="flex-1">
              <CMSEditable cmsKey="about_eco_title" as="h3" className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">{ecoTitle}</CMSEditable>
              <CMSEditable cmsKey="about_eco_text" as="p" className="text-gray-400 text-base md:text-lg leading-relaxed max-w-xl">{ecoText}</CMSEditable>
            </div>
            <CMSEditable cmsKey="about_eco_image" className="w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 relative flex-shrink-0 block">
              <Image src={ecoImage} alt="Recycling" fill className="object-contain" />
            </CMSEditable>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20 px-4 md:px-6 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <CMSEditable cmsKey="about_poland_map" className="relative h-[250px] md:h-[350px] lg:h-[400px] rounded-2xl overflow-hidden block order-2 lg:order-1">
              <Image src={polandMap} alt="Mapa Polski" fill className="object-contain" />
            </CMSEditable>
            <div className="text-center lg:text-left order-1 lg:order-2">
              <CMSEditable cmsKey="about_poland_label" as="p" className="text-cyan font-semibold tracking-[0.2em] uppercase text-xs md:text-sm mb-2 md:mb-4">
                {polandLabel}
              </CMSEditable>
              <CMSEditable cmsKey="about_poland_title" as="h2" className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-black mb-4 md:mb-6">
                {polandTitle}
              </CMSEditable>
              <CMSEditable cmsKey="about_poland_text" as="p" className="text-base md:text-lg text-gray-600 leading-relaxed mb-6 md:mb-8">
                {polandText}
              </CMSEditable>
              <CMSEditable cmsKey="about_poland_button" as="a" href="/kontakt" className="inline-flex items-center gap-2 bg-black text-white px-6 md:px-8 py-3 md:py-4 font-semibold hover:bg-gray-800 transition-colors">
                {polandButton}
              </CMSEditable>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}