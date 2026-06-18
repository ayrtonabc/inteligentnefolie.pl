'use client';

import { useState, useEffect } from 'react';
import { PageData, getPageContentValue } from '@/lib/pageData';
import { CMSEditable } from '@/components/CMSEditable';
import { MapPin, Phone, Mail, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface AboutSectionProps {
  pageData?: PageData;
  lang?: string;
}

export default function AboutSection({ pageData, lang = 'pl' }: AboutSectionProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getContent = (key: string, fallback: string = '') => {
    return getPageContentValue(pageData, key, fallback, lang);
  };

  const sectionLabel = getContent('about_section_about', 'O NASZEJ FIRMIE');
  const title = getContent('about_welcome_title', 'Jesteśmy HETOR');
  const description = getContent('about_welcome_text', 'Jesteśmy wiodącym producentem i instalatorem konstrukcji szklanych w Polsce. Działamy pod firmą HETOR Sp. z o.o. Specjalizujemy się w produkcji ścianek szklanych, balustrad, drzwi szklanych, schodów szklanych, podłóg szklanych oraz innowacyjnych rozwiązań z wykorzystaniem folii inteligentnych.');
  const companyName = getContent('about_company_name', 'HETOR Sp. z o.o.');
  const address = getContent('about_company_address', 'ul. Starołęcka 45, 61-361 Poznań');
  const phone = getContent('about_company_phone', '+48 790 555 900');
  const email1 = getContent('about_email_1', 'biuro@scianki-szklane.com');
  const email2 = getContent('about_email_2', 'biuro@inteligentnefolie.pl');
  const ctaText = getContent('about_contact_button', 'Poznaj nas');
  const ctaLink = '/o-nas';
  const endToEndText = getContent('about_why_item_5', 'Realizacje od A do Z - pomiar, produkcja, montaż');

  const gallery1 = getContent('about_gallery_1', 'https://pb.fullwork.pl/api/files/pbc_2708086759/x7q797h6qe0dd3y/1_opt_obexbktemf.webp');
  const gallery2 = getContent('about_gallery_2', 'https://pb.fullwork.pl/api/files/pbc_2708086759/wg9ahnw1frou3uk/2_opt_eo1mdtfefa.webp');
  const gallery3 = getContent('about_gallery_3', 'https://pb.fullwork.pl/api/files/pbc_2708086759/v4zsnc7xcgdjjph/5_opt_ws5689txcb.webp');
  const gallery4 = getContent('about_gallery_4', 'https://pb.fullwork.pl/api/files/pbc_2708086759/0ktlug4rf8yphba/6_opt_rw6svqnzgf.webp');
  const gallery5 = getContent('about_gallery_5', 'https://pb.fullwork.pl/api/files/pbc_2708086759/s0aba7uyv90ochb/3_opt_95lrets5in.webp');
  const gallery6 = getContent('about_gallery_6', 'https://pb.fullwork.pl/api/files/pbc_2708086759/vyjwnfmzd524oyw/4_opt_76euw20l8o.webp');

  return (
    <section className="py-20 px-6 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <CMSEditable cmsKey="about_section_about" as="p" className="text-cyan font-semibold tracking-[0.2em] uppercase text-sm mb-4">
              {sectionLabel}
            </CMSEditable>
            <CMSEditable cmsKey="about_welcome_title" as="h2" className="text-4xl md:text-5xl font-bold text-black mb-6">
              {title}
            </CMSEditable>
            <CMSEditable cmsKey="about_welcome_text" as="p" className="text-lg text-gray-600 leading-relaxed mb-8">
              {description}
            </CMSEditable>

            <div className="bg-gradient-to-r from-cyan/10 to-transparent border-l-4 border-cyan pl-6 py-4 mb-8 rounded-r-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-cyan flex-shrink-0 mt-0.5" />
                <CMSEditable cmsKey="about_why_item_5" as="p" className="text-black font-medium text-lg">
                  {endToEndText}
                </CMSEditable>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-cyan/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-cyan" />
                </div>
                <div>
                  <CMSEditable cmsKey="about_company_name" as="p" className="font-semibold text-black">{companyName}</CMSEditable>
                  <CMSEditable cmsKey="about_company_address" as="p" className="text-gray-600">{address}</CMSEditable>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-cyan/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-cyan" />
                </div>
                <CMSEditable cmsKey="about_company_phone" as="a" href={`tel:${phone}`} className="text-gray-600 hover:text-cyan transition-colors">{phone}</CMSEditable>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-cyan/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-cyan" />
                </div>
                <div className="flex flex-col gap-1">
                  <CMSEditable cmsKey="about_email_1" as="a" href={`mailto:${email1}`} className="text-gray-600 hover:text-cyan transition-colors">{email1}</CMSEditable>
                  <CMSEditable cmsKey="about_email_2" as="a" href={`mailto:${email2}`} className="text-gray-600 hover:text-cyan transition-colors">{email2}</CMSEditable>
                </div>
              </div>
            </div>

            <CMSEditable cmsKey="about_contact_button" as={Link} href={ctaLink} className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 font-semibold hover:bg-gray-800 transition-colors">
              {ctaText}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </CMSEditable>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { src: gallery1, key: 'about_gallery_1' },
              { src: gallery2, key: 'about_gallery_2' },
              { src: gallery3, key: 'about_gallery_3' },
              { src: gallery4, key: 'about_gallery_4' },
              { src: gallery5, key: 'about_gallery_5' },
              { src: gallery6, key: 'about_gallery_6' }
            ].map((img, i) => (
              <CMSEditable key={i} cmsKey={img.key} className="relative h-64 rounded-xl overflow-hidden group cursor-pointer block">
                <Image src={img.src} alt={`Galeria ${i + 1}`} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
              </CMSEditable>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}