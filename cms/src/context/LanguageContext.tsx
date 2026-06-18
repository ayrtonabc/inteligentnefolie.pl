import React, { createContext, useContext } from 'react'

type Language = 'pl'

type LanguageContextValue = {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations: Record<string, string> = {
  welcome_back: 'Panel administracyjny',
  login_subtitle: 'Zaloguj się, aby zarządzać stroną Opieka Ilawa 24.',
  username: 'Email',
  password: 'Hasło',
  login: 'Zaloguj się',
  sign_in: 'Zaloguj się',
  invalid_credentials: 'Nieprawidłowy email lub hasło',

  profile: 'Profil',
  logout: 'Wyloguj się',

  website_management: 'Strona',
  website_management_desc: 'Treści, statystyki i blog.',
  metrics: 'Statystyki',
  content: 'Treści strony',
  leads: 'Kontakty',
  blog: 'Blog',

  blog_posts_title: 'Wpisy na blogu',
  new_post: 'Nowy wpis',
  edit_post: 'Edytuj wpis',
  post_title: 'Tytuł',
  post_category: 'Kategoria',
  post_status: 'Status',
  post_date: 'Data',
  published: 'Opublikowany',
  draft: 'Szkic',
  categories: 'Kategorie',
  uncategorized: 'Bez kategorii',
  no_posts_yet: 'Brak wpisów',

  loading: 'Ładowanie...',
  saving: 'Zapisywanie...',
  save: 'Zapisz',
  save_changes: 'Zapisz zmiany',
  cancel: 'Anuluj',
  delete: 'Usuń',
  edit: 'Edytuj',
  actions: 'Akcje',
  confirm_delete: 'Na pewno usunąć?',

  configuration: 'Ustawienia',
  slug_url: 'Slug / URL',
  cover_image: 'Obrazek okładki',
  image_url: 'URL obrazka',
  image_url_placeholder: 'https://...',
  cover_preview: 'Podgląd okładki',
  content_rich_text: 'Treść',
  excerpt: 'Zajawka',
  seo_metadata: 'SEO',
  title_placeholder: 'Wpisz tytuł...',

  blog_categories: 'Kategorie bloga',
  new_category: 'Nowa kategoria',
  edit_category: 'Edytuj kategorię',
  save_category: 'Zapisz kategorię',
  category_saved_success: 'Zapisano kategorię',
  error_saving_category: 'Błąd zapisu',
  error_deleting: 'Błąd usuwania',
  no_categories_yet: 'Brak kategorii',
  category_name: 'Nazwa',
  category_slug: 'Slug',
  category_description: 'Opis',
  category_name_placeholder: 'Np. Porady',
  category_slug_placeholder: 'np-porady',
  category_description_placeholder: 'Krótki opis...',

  metrics_title: 'Statystyki',
  metrics_subtitle: 'Odwiedziny i zachowanie użytkowników',
  last_7_days: 'Ostatnie 7 dni',
  last_30_days: 'Ostatnie 30 dni',
  last_90_days: 'Ostatnie 90 dni',
  all_time: 'Cały okres',
  refresh: 'Odśwież',
  export: 'Eksportuj',
  data_exported_success: 'Wyeksportowano dane',
  total_visits: 'Wizyty',
  unique_visits_label: 'unikalne',
  today: 'Dzisiaj',
  this_week: 'Ten tydzień',
  this_month: 'Ten miesiąc',
  uniques: 'unik.',
  most_visited_pages: 'Najczęściej odwiedzane strony',
  devices: 'Urządzenia',
  browsers: 'Przeglądarki',
  visits_by_day: 'Wizyty dziennie',
  no_data_available: 'Brak danych',

  contacts: 'Kontakty',
  add_contact: 'Dodaj kontakt',
  add_new_contact: 'Dodaj nowy kontakt',
  fill_contact_info: 'Uzupełnij dane kontaktu.',
  name_email_required: 'Imię i email są wymagane',
  contact_added_success: 'Dodano kontakt',
  recently_active: 'Ostatnio',
  just_created: 'Utworzono',
  error_loading: 'Błąd ładowania',
  search_contacts: 'Szukaj kontaktów...',
  contact_name: 'Imię i nazwisko',
  phone: 'Telefon',
  email: 'Email',
  primary_notes: 'Notatki',
  created: 'Utworzono',
  last_activity: 'Aktywność',
  tags: 'Tagi',
  loading_contacts: 'Ładowanie kontaktów...',
  page_of: 'Strona {current} z {total}',
  prev: 'Wstecz',
  next: 'Dalej',
  full_name: 'Imię i nazwisko',
  email_address: 'Adres email',
  phone_number: 'Numer telefonu',
  priority: 'Priorytet',
  low: 'Niski',
  medium: 'Średni',
  high: 'Wysoki',
  primary_message: 'Wiadomość',
  details_placeholder: 'Szczegóły...',
  save_contact: 'Zapisz kontakt',
  all: 'Wszystkie',
  advanced_filters: 'Filtry',
  sort: 'Sortuj',
  no_data: 'Brak danych',
  no_data_available_label: 'Brak danych',
  no_data_available_contacts: 'Brak kontaktów',
  no_data_available_posts: 'Brak wpisów',

  no_data_available_metrics: 'Brak danych',
  no_data_available_browsers: 'Brak danych',
  no_data_available_devices: 'Brak danych',

  no_data_available_pages: 'Brak danych',
  no_data_available_days: 'Brak danych',

  no_data_available_categories: 'Brak kategorii',
  no_data_available_leads: 'Brak kontaktów',

  no_data_available_blog: 'Brak wpisów',
  no_data_available_site: 'Brak danych',

  no_data_available_table: 'Brak danych',

  no_data_available_list: 'Brak danych',

  no_data_available_chart: 'Brak danych',
  no_data_available_export: 'Brak danych',
  no_data_available_stats: 'Brak danych',
  no_data_available_total: 'Brak danych',
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const value: LanguageContextValue = {
    language: 'pl',
    setLanguage: () => {},
    t: (key: string) => translations[key] || key,
  }

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
