'use client';

import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingChat from '@/components/FloatingChat';
import { PageData, getPageContentValue } from '@/lib/pageData';
import { CmsText } from '@/components/cms/CmsComponents';
import { PB_URL, TENANT_ID } from '@/lib/config';
import AggregateRatingSchema from '@/components/seo/AggregateRatingSchema';

interface KontaktClientProps {
  heroTitle: string;
  heroSubtitle: string;
  pageData?: PageData;
}

export default function KontaktClient({ heroTitle, heroSubtitle, pageData }: KontaktClientProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const phone2 = getPageContentValue(pageData, 'header_phone_2', '+48 790 555 900') || '+48 790 555 900'
  const email = getPageContentValue(pageData, 'header_email', 'biuro@inteligentnefolie.pl') || 'biuro@inteligentnefolie.pl'
  const workHours = getPageContentValue(pageData, 'contact_work_hours', 'Pn-Pt: 8:00 - 17:00') || 'Pn-Pt: 8:00 - 17:00'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const websiteId = TENANT_ID;
      const apiUrl = `${PB_URL}/api/collections/leads/records`;
      
      console.log('Sending message to:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          website_id: websiteId,
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || null,
          subject: formData.subject,
          message: formData.message.trim(),
          source: 'website',
          page_path: '/kontakt',
          status: 'new',
          priority: 'medium',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error del servidor: ${response.status}`);
      }

      setIsSubmitted(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (err) {
      console.error('Submission error:', err);
      const msg = err instanceof Error ? err.message : 'Wystapil blad podczas wysylania wiadomosci.';
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-white min-h-screen">
      <Header pageData={pageData} />

      <section className="bg-dark-bg text-white pt-48 pb-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <CmsText pagePath="kontakt" sectionKey="hero_title" fallback={heroTitle} />
          </h1>
          <div className="text-gray-400 max-w-2xl mx-auto">
            <CmsText pagePath="kontakt" sectionKey="hero_subtitle" fallback={heroSubtitle} />
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
              <div className="w-14 h-14 bg-cyan/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="text-cyan" size={28} />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-4">
                <CmsText pagePath="kontakt" sectionKey="contact_info_phone_title" fallback="Telefon" />
              </h3>
              <div className="space-y-2">
                <p className="font-semibold text-gray-900 text-lg">
                  <a href={`tel:${phone2.replace(/\s/g, '')}`} data-contact="phone-2" className="hover:text-cyan transition-colors">
                    {phone2}
                  </a>
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
              <div className="w-14 h-14 bg-cyan/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="text-cyan" size={28} />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-4">
                <CmsText pagePath="kontakt" sectionKey="contact_info_email_title" fallback="Email" />
              </h3>
              <div className="space-y-2">
                <p className="font-semibold text-gray-900 text-lg">
                  <a href={`mailto:${email}`} className="hover:text-cyan transition-colors">
                    {email}
                  </a>
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
              <div className="w-14 h-14 bg-cyan/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="text-cyan" size={28} />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-4">
                <CmsText pagePath="kontakt" sectionKey="contact_info_hours_title" fallback="Godziny pracy" />
              </h3>
              <div className="space-y-2">
                <p className="font-semibold text-gray-900 text-lg">
                  {workHours}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                <CmsText pagePath="kontakt" sectionKey="form_title" fallback="Wyślij wiadomość" />
              </h2>
              <div className="text-gray-500 mb-6">
                <CmsText pagePath="kontakt" sectionKey="form_subtitle" fallback="Wypełnij formularz, a skontaktujemy się z Tobą w ciągu 24h." />
              </div>

              {isSubmitted ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                  <CheckCircle className="text-green-500 mx-auto mb-3" size={48} />
                  <h3 className="font-bold text-green-800 text-lg mb-2">
                    <CmsText pagePath="kontakt" sectionKey="form_success_title" fallback="Wiadomość wysłana!" />
                  </h3>
                  <div className="text-green-600">
                    <CmsText pagePath="kontakt" sectionKey="form_success_message" fallback="Dziękujemy za kontakt. Odpowiemy najszybciej jak to możliwe." />
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {submitError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">{submitError}</div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <CmsText pagePath="kontakt" sectionKey="form_label_name" fallback="Imię i nazwisko *" />
                      </label>
                      <input type="text" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan outline-none" placeholder="" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <CmsText pagePath="kontakt" sectionKey="form_label_phone" fallback="Telefon" />
                      </label>
                      <input type="tel" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan outline-none" placeholder="" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <CmsText pagePath="kontakt" sectionKey="form_label_email" fallback="Email *" />
                    </label>
                    <input type="email" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan outline-none" placeholder="" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <CmsText pagePath="kontakt" sectionKey="form_label_subject" fallback="Temat *" />
                    </label>
                    <select required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan outline-none" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })}>
                      <option value="">Wybierz temat</option>
                      <option value="wycena">Wycena projektu</option>
                      <option value="pomiar">Umowienie pomiaru</option>
                      <option value="pytanie">Pytanie o produkt</option>
                      <option value="serwis">Serwis / reklamacja</option>
                      <option value="inne">Inne</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <CmsText pagePath="kontakt" sectionKey="form_label_message" fallback="Wiadomość *" />
                    </label>
                    <textarea required rows={5} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan outline-none resize-none" placeholder="" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-black text-white font-semibold py-3 rounded-lg hover:bg-gray-800 transition inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Wysylanie...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        <CmsText pagePath="kontakt" sectionKey="form_button_text" fallback="Wyślij wiadomość" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            <div className="bg-gray-100 rounded-xl overflow-hidden h-full min-h-[400px]">
              <iframe
                src={`https://www.google.com/maps?q=${encodeURIComponent('ul. Wspólna 3, 41-200 Sosnowiec, Polska')}&output=embed&hl=pl&z=15`}
                className="w-full h-full min-h-[400px] border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Lokalizacja"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-cyan">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            <CmsText pagePath="kontakt" sectionKey="whatsapp_title" fallback="Potrzebujesz pilnej wyceny?" />
          </h2>
          <div className="text-gray-700 mb-6">
            <CmsText pagePath="kontakt" sectionKey="whatsapp_subtitle" fallback="Zadzwoń teraz lub wyślij zdjęcia przez WhatsApp. Odpowiadamy natychmiast!" />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={`tel:${'+48 790 555 900'.replace(/\s/g, '')}`} className="bg-black text-white font-semibold px-8 py-3 rounded-lg hover:bg-gray-800 transition inline-flex items-center justify-center gap-2">
                <Phone size={20} />
                <CmsText pagePath="kontakt" sectionKey="whatsapp_phone" fallback="+48 790 555 900" />
            </a>
            <a href={getPageContentValue(pageData, 'whatsapp_link', 'https://wa.me/48600959905') || 'https://wa.me/48600959905'} target="_blank" rel="noopener noreferrer" className="bg-green-500 text-white font-semibold px-8 py-3 rounded-lg hover:bg-green-600 transition inline-flex items-center justify-center gap-2">
              <CmsText pagePath="kontakt" sectionKey="whatsapp_button_text" fallback="WhatsApp" />
            </a>
          </div>
        </div>
      </section>

      <Footer pageData={pageData} />
      <FloatingChat pageData={pageData} />
      <AggregateRatingSchema ratingValue="4.8" reviewCount="135" />
    </div>
  );
}
