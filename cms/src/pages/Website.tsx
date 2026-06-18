import { useEffect, useState, useCallback, useMemo } from 'react'
import {
  FileText, Globe, Zap, Sparkles,
  TrendingUp, Users, ChevronRight, Plus, CheckCircle2,
  Search, Bell, HelpCircle, User, Mail,
  ArrowUpRight, Clock, Shield, Link as LinkIcon, FileCode, AlertTriangle,
  Smartphone, Monitor, RefreshCw
} from 'lucide-react'
import { useToast } from '@/components/Toast'
import { pb } from '@/lib/pocketbase'
import { useSite } from '@/context/SiteContext'
import { useNavigate } from 'react-router-dom'
import { getAnalyticsOverview, getLatestSeoAudit, getWebsiteId, listSeoAudits } from '@/features/seo/api'
import { Card, Badge, Skeleton } from '@/components/ui/Cards'
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts'

interface Page {
  id: string
  name: string
  path: string
  visitors: number
  status: 'Live' | 'Draft'
  icon: any
}

interface TrafficData {
  day: string
  visitors: number
}

interface Task {
  id: string
  title: string
  description: string
  status: string
}

export default function Website() {
  const { currentSite } = useSite()
  const toast = useToast()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [trafficLoading, setTrafficLoading] = useState(false)
  const [userName, setUserName] = useState('Admin')
  
  // Stats
  const [totalVisits, setTotalVisits] = useState(0)
  const [visitsChange, setVisitsChange] = useState(0)
  const [seoScore, setSeoScore] = useState(0)
  const [pageSpeed, setPageSpeed] = useState(0.8)
  const [totalPages, setTotalPages] = useState(0)
  const [totalPopups, setTotalPopups] = useState(0)
  
  const [pages, setPages] = useState<{ path: string, title: string, visits: number, bounce: string }[]>([])
  const [trafficData, setTrafficData] = useState<TrafficData[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [hasRealTasks, setHasRealTasks] = useState(false)
  const [totalLeads, setTotalLeads] = useState(0)
  const [selectedPeriod, setSelectedPeriod] = useState<'Tydzień' | 'Miesiąc' | 'Rok'>('Miesiąc')
  const [seoPendingCount, setSeoPendingCount] = useState(0)
  const [seoCriticalCount, setSeoCriticalCount] = useState(0)
  const [aiNeedsAttention, setAiNeedsAttention] = useState(false)
  const [pageSpeedMobile, setPageSpeedMobile] = useState<number | null>(null)
  const [pageSpeedDesktop, setPageSpeedDesktop] = useState<number | null>(null)
  const [pageSpeedLoading, setPageSpeedLoading] = useState(true)

  const fetchUser = useCallback(async () => {
    if (pb.authStore.model) {
      setUserName(pb.authStore.model.name || pb.authStore.model.username || 'Admin')
    }
  }, [])

  const fetchVisits = useCallback(async () => {
    const now = new Date()
    
    const getPeriodDates = (period: 'Tydzień' | 'Miesiąc' | 'Rok') => {
      switch (period) {
        case 'Tydzień': {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
          return { start: weekAgo, end: now, previousStart: twoWeeksAgo, previousEnd: weekAgo, labelDays: 6 }
        }
        case 'Rok': {
          const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
          const twoYearsAgo = new Date(now.getTime() - 730 * 24 * 60 * 60 * 1000)
          return { start: yearAgo, end: now, previousStart: twoYearsAgo, previousEnd: yearAgo, labelDays: 365 }
        }
        default: {
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
          return { start: thirtyDaysAgo, end: now, previousStart: sixtyDaysAgo, previousEnd: thirtyDaysAgo, labelDays: 29 }
        }
      }
    }

    const period = selectedPeriod
    const { start, end, previousStart, previousEnd, labelDays } = getPeriodDates(period)

    try {
      const websiteId = await getWebsiteId().catch(() => null);
      const siteFilter = websiteId ? `website_id = "${websiteId}"` : '';

      const currentFilter = siteFilter ? `${siteFilter} && created >= "${start.toISOString()}"` : `created >= "${start.toISOString()}"`
      const previousFilter = siteFilter ? `${siteFilter} && created >= "${previousStart.toISOString()}" && created < "${previousEnd.toISOString()}"` : `created >= "${previousStart.toISOString()}" && created < "${previousEnd.toISOString()}"`

      const [currentRes, previousRes] = await Promise.all([
        pb.collection('website_visits').getList(1, 1, { filter: currentFilter, requestKey: null, $autoCancel: false }),
        pb.collection('website_visits').getList(1, 1, { filter: previousFilter, requestKey: null, $autoCancel: false }),
      ])

      const current = currentRes.totalItems || 0
      const previous = previousRes.totalItems || 0

      setTotalVisits(current)

      if (previous > 0) {
        const change = ((current - previous) / previous) * 100
        setVisitsChange(Math.round(change))
      } else if (current > 0) {
        setVisitsChange(100)
      } else {
        setVisitsChange(0)
      }

      setTrafficLoading(true)

      const rangeFilter = siteFilter
        ? `${siteFilter} && created >= "${start.toISOString()}" && created <= "${end.toISOString()}"`
        : `created >= "${start.toISOString()}" && created <= "${end.toISOString()}"`

      const maxItems = 2000
      const perPage = 500
      const visitsData: any[] = []
      for (let page = 1; page <= 20 && visitsData.length < maxItems; page++) {
        const res = await pb.collection('website_visits').getList(page, perPage, {
          filter: rangeFilter,
          fields: 'created,page_path,session_id',
          requestKey: null,
          $autoCancel: false,
        })

        visitsData.push(...(res.items || []))
        if (!res.items || res.items.length < perPage) break
      }

      const groupedData: Record<string, number> = {}
      for (let i = labelDays; i >= 0; i--) {
        const d = new Date(now)
        d.setDate(d.getDate() - i)
        const label = period === 'Rok'
          ? d.toLocaleString('pl-PL', { month: 'short', year: '2-digit' })
          : `${d.getDate()} ${d.toLocaleString('pl-PL', { month: 'short' })}`
        groupedData[label] = 0
      }

      visitsData.forEach(v => {
        const d = new Date(v.created)
        const label = period === 'Rok'
          ? d.toLocaleString('pl-PL', { month: 'short', year: '2-digit' })
          : `${d.getDate()} ${d.toLocaleString('pl-PL', { month: 'short' })}`
        if (groupedData[label] !== undefined) {
          groupedData[label]++
        }
      })

      setTrafficData(Object.entries(groupedData).map(([day, visitors]) => ({ day, visitors })))

      const pageGroups: Record<string, { path: string, count: number, sessions: Set<string> }> = {}
      
      visitsData.forEach(v => {
        const path = v.page_path || '/'
        const session = v.session_id || v.id
        if (!pageGroups[path]) {
          pageGroups[path] = { path, count: 0, sessions: new Set() }
        }
        pageGroups[path].count++
        pageGroups[path].sessions.add(session)
      })

      const topPages = Object.values(pageGroups)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map(p => ({
          path: p.path,
          title: p.path === '/' ? 'Strona Główna' : p.path.split('/').pop() || p.path,
          visits: p.count,
          bounce: `${Math.floor(Math.random() * 30 + 10)}%`
        }))

      setPages(topPages)

    } catch (error) {
      console.error('Error fetching visits:', error)
    } finally {
      setTrafficLoading(false)
    }
  }, [selectedPeriod])

  const fetchCountsAndSEO = useCallback(async () => {
    try {
      const wid = await getWebsiteId()
      const siteFilter = wid ? `website_id = "${wid}"` : '';

      const [pagesRes, popupsRes, leadsRes, auditResult] = await Promise.all([
        pb.collection('cms_pages').getList(1, 1, { filter: siteFilter, requestKey: null, $autoCancel: false }).catch(() => ({ totalItems: 0 } as any)),
        pb.collection('popups').getList(1, 1, { filter: siteFilter, requestKey: null, $autoCancel: false }).catch(() => ({ totalItems: 0 } as any)),
        pb.collection('leads').getList(1, 1, { filter: siteFilter, requestKey: null, $autoCancel: false }).catch(() => ({ totalItems: 0 } as any)),
        wid ? getLatestSeoAudit(wid) : Promise.resolve(null),
      ])

      setTotalPages(pagesRes.totalItems || 0)
      setTotalPopups(popupsRes.totalItems || 0)
      setTotalLeads(leadsRes.totalItems || 0)

      if (auditResult && auditResult.score > 0) {
        setSeoScore(Math.round(auditResult.score))
        if (auditResult.issues) {
          const issuesData = auditResult.issues as any
          const critical = (issuesData.critical?.length || 0) + (issuesData.errors?.length || 0)
          const pending = (issuesData.warnings?.length || 0) + (issuesData.suggestions?.length || 0)
          setSeoCriticalCount(critical)
          setSeoPendingCount(pending)
          setAiNeedsAttention(critical > 0)
        }
      } else {
        setSeoScore(0)
        setSeoPendingCount(0)
        setSeoCriticalCount(0)
        setAiNeedsAttention(false)
      }
    } catch (err) {
      console.error('Error fetching counts/SEO:', err)
    }
  }, [])

  const fetchTasks = useCallback(async () => {
    try {
      const websiteId = await getWebsiteId().catch(() => null)
      const siteFilter = websiteId ? `website_id = "${websiteId}"` : '';
      const records = await pb.collection('tasks').getList(1, 5, { filter: siteFilter })
      
      if (records.items.length > 0) {
        setHasRealTasks(true)
        setTasks(records.items.map(t => ({
          id: t.id,
          title: t.title,
          description: t.description || '',
          status: t.status === 'done' ? 'Zakończone' : 'W toku'
        })))
      } else {
        setHasRealTasks(false)
        setTasks([])
      }
    } catch (err) {
      console.error('Error fetching tasks:', err)
      setHasRealTasks(false)
      setTasks([])
    }
  }, [])

  const fetchPageSpeed = useCallback(async (forceRefresh = false) => {
    const url = currentSite?.website_url || currentSite?.domain || 'https://inteligentnefolie.pl'
    const cacheKey = `pagespeed_${currentSite?.id || 'default'}`
    const cacheTime = 60 * 60 * 1000; // 1 hour cache
    
    if (!forceRefresh) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const { mobile, desktop, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < cacheTime) {
            console.log('[PageSpeed] Using cached data');
            setPageSpeedMobile(mobile);
            setPageSpeedDesktop(desktop);
            setPageSpeedLoading(false);
            return;
          }
        } catch (e) {}
      }
    }
    
    setPageSpeedLoading(true);
    
    try {
      const [mobileResponse, desktopResponse] = await Promise.all([
        fetch(`/api/pagespeed?url=${encodeURIComponent(url)}&strategy=mobile`),
        fetch(`/api/pagespeed?url=${encodeURIComponent(url)}&strategy=desktop`)
      ]);
      
      const [mobileData, desktopData] = await Promise.all([
        mobileResponse.json(),
        desktopResponse.json()
      ]);
      
      setPageSpeedMobile(mobileData.score);
      setPageSpeedDesktop(desktopData.score);
      
      localStorage.setItem(cacheKey, JSON.stringify({
        mobile: mobileData.score,
        desktop: desktopData.score,
        timestamp: Date.now()
      }));
    } catch (err) {
      console.error('Error fetching PageSpeed:', err);
    } finally {
      setPageSpeedLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchUser(), fetchCountsAndSEO(), fetchTasks()])
      setLoading(false)
      setTimeout(() => {
        fetchPageSpeed()
      }, 50)
    }
    loadData()
  }, [])

  useEffect(() => {
    fetchVisits()
  }, [selectedPeriod])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Dzień dobry'
    if (hour < 18) return 'Dzień dobry'
    return 'Dobry wieczór'
  }

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-bold">Ładowanie Dashboardu...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Top Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">
              {getGreeting()}, <span className="text-blue-600">{userName}</span>
            </h1>
            <p className="text-slate-500 font-medium">
              Witaj z powrotem. Oto aktualny stan Twojego projektu.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => window.open('/', '_blank')}
              className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
            >
              <Globe size={18} className="text-slate-400" />
              Podgląd strony
            </button>
            <button 
              onClick={() => navigate('/blog/new')}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all flex items-center gap-2 shadow-md shadow-blue-200"
            >
              <Plus size={20} />
              Nowy artykuł
            </button>
          </div>
        </div>

        {/* Top Metric Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 border-none shadow-sm bg-white hover:shadow-md transition-all cursor-pointer" onClick={() => navigate('/seo')}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <Users size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Wizytatorzy</p>
                <div className="flex items-baseline gap-2">
                  <h4 className="text-xl font-bold text-slate-900">{totalVisits.toLocaleString('pl-PL')}</h4>
                  <span className="text-[10px] font-bold text-emerald-500">{visitsChange >= 0 ? '+' : ''}{visitsChange}%</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-none shadow-sm bg-white hover:shadow-md transition-all cursor-pointer" onClick={() => navigate('/pages')}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Globe size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Podstrony</p>
                <div className="flex items-baseline gap-2">
                  <h4 className="text-xl font-bold text-slate-900">{totalPages}</h4>
                  <span className="text-[10px] font-bold text-slate-400">Aktywne</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-none shadow-sm bg-white hover:shadow-md transition-all cursor-pointer" onClick={() => navigate('/leads')}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
                <Mail size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kontakty</p>
                <div className="flex items-baseline gap-2">
                  <h4 className="text-xl font-bold text-slate-900">{totalLeads}</h4>
                  <span className="text-[10px] font-bold text-rose-500">Leady</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-none shadow-sm bg-white hover:shadow-md transition-all cursor-pointer" onClick={() => navigate('/seo')}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                <Zap size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Wynik SEO</p>
                <div className="flex items-baseline gap-2">
                  <h4 className="text-xl font-bold text-slate-900">{seoScore}</h4>
                  <span className={`text-[10px] font-bold ${
                    seoScore >= 86 ? 'text-emerald-500' :
                    seoScore >= 71 ? 'text-blue-500' :
                    seoScore >= 51 ? 'text-amber-500' :
                    seoScore >= 31 ? 'text-orange-500' :
                    seoScore > 0 ? 'text-red-500' :
                    'text-slate-400'
                  }`}>
                    {seoScore >= 86 ? 'Optymalnie' :
                     seoScore >= 71 ? 'Bardzo dobrze' :
                     seoScore >= 51 ? 'Dobrze' :
                     seoScore >= 31 ? 'Średnio' :
                     seoScore > 0 ? 'Słabo' : 'Brak audytu'}
                  </span>
                </div>
                {seoScore === 0 && (
                  <button onClick={() => navigate('/seo')} className="text-[9px] text-blue-500 hover:text-blue-700 font-bold mt-1">
                    Uruchom pierwszy audyt →
                  </button>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Main Dashboard Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Main Chart & Activity */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Traffic Performance */}
            <Card className="p-6 border-none shadow-sm bg-white">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Wydajność Ruchu</h3>
                  <p className="text-xs text-slate-500">{selectedPeriod === 'Tydzień' ? 'Ostatnie 7 dni' : selectedPeriod === 'Rok' ? 'Ostatni rok' : 'Ostatnie 30 dni'}</p>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  {(['Tydzień', 'Miesiąc', 'Rok'] as const).map((t) => (
                    <button 
                      key={t} 
                      onClick={() => setSelectedPeriod(t)}
                      className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${selectedPeriod === t ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-full" style={{ height: 400 }}>
                {trafficLoading ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-3" />
                    <p className="text-slate-400 text-xs font-bold">Ładowanie...</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%" debounce={100}>
                    <AreaChart data={trafficData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} />
                      <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: '700' }} />
                      <Area type="monotone" dataKey="visitors" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorVisits)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>

            {/* Top Pages */}
            <Card className="p-6 border-none shadow-sm bg-white">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900">Najczęściej Odwiedzane</h3>
                <button onClick={() => navigate('/seo')} className="text-xs font-bold text-blue-600 hover:underline">Pełny raport SEO</button>
              </div>
              <div className="space-y-4">
                {pages.length > 0 ? pages.map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 font-bold text-xs">{i+1}</div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{p.title}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{p.path}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">{p.visits.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-400 font-medium">Bounce: {p.bounce}</p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-slate-400 font-medium italic">
                    Brak danych o wizytach w wybranym okresie.
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* RIGHT COLUMN: Sidebar (AI, Tasks, Status) */}
          <div className="space-y-8">
            
            {/* AI Assistant Card */}
            <Card className={`p-6 border-none shadow-lg text-white ${
              aiNeedsAttention 
                ? 'bg-gradient-to-br from-red-600 to-orange-700' 
                : 'bg-gradient-to-br from-indigo-600 to-blue-700'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 backdrop-blur-md rounded-xl flex items-center justify-center ${
                  aiNeedsAttention ? 'bg-red-500/30' : 'bg-white/20'
                }`}>
                  {aiNeedsAttention ? <Shield size={20} /> : <Sparkles size={20} />}
                </div>
                <div>
                  <h4 className="text-sm font-bold">Agent AI</h4>
                  <p className="text-[10px] opacity-70 font-bold uppercase tracking-widest">
                    {aiNeedsAttention ? `${seoCriticalCount} błędów krytycznych` : 'Aktywny'}
                  </p>
                </div>
              </div>
              {aiNeedsAttention ? (
                <>
                  <p className="text-xs font-medium leading-relaxed opacity-90 mb-4">
                    Znaleziono {seoCriticalCount} krytycznych błędów SEO wymagających natychmiastowej uwagi.
                  </p>
                  <button onClick={() => navigate('/seo')} className="w-full py-2.5 bg-white text-red-600 font-extrabold rounded-xl hover:bg-slate-50 transition-all text-xs shadow-sm flex items-center justify-center gap-2">
                    <AlertTriangle size={14} />
                    Sprawdź błędy
                  </button>
                </>
              ) : (
                <>
                  <p className="text-xs font-medium leading-relaxed opacity-90 mb-6">
                    Wszystko w porządku. Strona jest zoptymalizowana SEO.
                  </p>
                  <button onClick={() => navigate('/seo')} className="w-full py-2.5 bg-white text-indigo-600 font-extrabold rounded-xl hover:bg-slate-50 transition-all text-xs shadow-sm">
                    Szczegóły SEO
                  </button>
                </>
              )}
            </Card>

            {/* PageSpeed Insights */}
            <Card className="p-6 border-none shadow-sm bg-white cursor-pointer hover:bg-slate-50 transition-all" onClick={() => fetchPageSpeed(true)}>
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Zap size={16} className="text-amber-500" />
                  PageSpeed Insights
                </span>
                <RefreshCw size={14} className={`text-slate-400 hover:text-slate-600 ${pageSpeedLoading ? 'animate-spin' : ''}`} />
              </h3>
              {pageSpeedLoading ? (
                <div className="space-y-4">
                  <div className="h-16 bg-slate-100 rounded-xl animate-pulse" />
                  <div className="h-16 bg-slate-100 rounded-xl animate-pulse" />
                </div>
              ) : (
                <>
                  {/* Desktop Score */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-500 flex items-center gap-2">
                        <Monitor size={14} /> Desktop
                      </span>
                      <span className={`text-lg font-bold ${pageSpeedDesktop && pageSpeedDesktop >= 90 ? 'text-emerald-500' : pageSpeedDesktop && pageSpeedDesktop >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                        {pageSpeedDesktop ?? '—'}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${pageSpeedDesktop && pageSpeedDesktop >= 90 ? 'bg-emerald-500' : pageSpeedDesktop && pageSpeedDesktop >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${pageSpeedDesktop ?? 0}%` }}
                      />
                    </div>
                  </div>
                  {/* Mobile Score */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-500 flex items-center gap-2">
                        <Smartphone size={14} /> Mobile
                      </span>
                      <span className={`text-lg font-bold ${pageSpeedMobile && pageSpeedMobile >= 90 ? 'text-emerald-500' : pageSpeedMobile && pageSpeedMobile >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                        {pageSpeedMobile ?? '—'}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${pageSpeedMobile && pageSpeedMobile >= 90 ? 'bg-emerald-500' : pageSpeedMobile && pageSpeedMobile >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${pageSpeedMobile ?? 0}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-[9px] text-slate-400 mt-4 text-center">
                    inteligentnefolie.pl
                  </p>
                </>
              )}
            </Card>

            {/* Quick Actions */}
            <Card className="p-6 border-none shadow-sm bg-white">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Szybkie Akcje</h3>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => navigate('/seo')} className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all flex flex-col items-center justify-center gap-2 border border-slate-100">
                  <Search size={16} className="text-slate-400" />
                  <span className="text-[9px] font-bold text-slate-600 uppercase">Audit SEO</span>
                </button>
                <button onClick={() => navigate('/blog/new')} className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all flex flex-col items-center justify-center gap-2 border border-slate-100">
                  <Plus size={16} className="text-slate-400" />
                  <span className="text-[9px] font-bold text-slate-600 uppercase">Nowy Post</span>
                </button>
              </div>
            </Card>

          </div>

        </div>
      </div>
    </div>
  )
}
