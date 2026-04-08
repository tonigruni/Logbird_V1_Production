import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useJournalStore } from '../stores/journalStore'
import {
  Lightbulb,
  SmilePlus,
  FileEdit,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  Brain,
  Download,
  Save,
  TrendingUp,
  Flame,
  BookOpen,
  Heart,
  Leaf,
  Target,
} from 'lucide-react'
import { fetchInsights, loadSavedInsights, persistInsights, type InsightsData } from '../lib/aiAnalysis'
import { computeStats, filterByPeriod, type Period } from '../lib/computeStats'
import { exportInsightsPdf } from '../lib/exportPdf'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

const PERIODS: { key: Period; label: string }[] = [
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'yearly', label: 'Yearly' },
  { key: 'all', label: 'All Time' },
]

const PIE_COLORS = ['#1F3649', '#2a4a63', '#586062', '#8a9a9d', '#b8c4c6', '#dde4e5']

const MOOD_LABELS: Record<number, string> = {
  1: 'Very Low',
  2: 'Low',
  3: 'Neutral',
  4: 'Good',
  5: 'Excellent',
}

const THEME_SIZES = [
  'text-5xl font-black tracking-tighter',
  'text-4xl font-extrabold tracking-tighter',
  'text-3xl font-bold',
  'text-2xl font-bold',
  'text-2xl font-semibold',
  'text-xl font-semibold',
  'text-xl font-medium',
  'text-lg font-medium',
  'text-base font-normal',
  'text-sm font-normal',
]

const THEME_COLORS = [
  'text-[#1F3649]',
  'text-[#2d3435] opacity-90',
  'text-[#162838]',
  'text-[#586062]',
  'text-[#566165]',
  'text-[#1F3649] opacity-70',
  'text-[#4c5456]',
  'text-[#5a6061]',
  'text-[#2d3435]/40',
  'text-[#586062] opacity-60',
]

const WELLNESS_ICONS: Record<string, typeof Heart> = {
  'Mental Clarity': Brain,
  'Stress Management': Leaf,
  'Work-Life Balance': Target,
}

function StatusBadge({ status }: { status: string }) {
  const color =
    status === 'Strong' ? 'bg-[#22c55e]/10 text-[#16a34a]' :
    status === 'Moderate' ? 'bg-[#f59e0b]/10 text-[#d97706]' :
    'bg-[#9f403d]/10 text-[#9f403d]'
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${color}`}>
      {status}
    </span>
  )
}

export default function Insights() {
  const { user } = useAuthStore()
  const { entries, fetchEntries } = useJournalStore()
  const navigate = useNavigate()

  const [period, setPeriod] = useState<Period>('all')
  const [insights, setInsights] = useState<InsightsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [dbLoading, setDbLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)

  // Computed stats (instant, no AI)
  const filteredEntries = useMemo(() => filterByPeriod(entries, period), [entries, period])
  const stats = useMemo(() => computeStats(entries, period), [entries, period])

  useEffect(() => {
    if (!user) return
    fetchEntries(user.id)
    loadSavedInsights(user.id, period).then((saved) => {
      if (saved) setInsights(saved)
      setDbLoading(false)
    })
  }, [user])

  // When period changes, try to load cached insights for that period
  useEffect(() => {
    if (!user) return
    loadSavedInsights(user.id, period).then((saved) => {
      if (saved) setInsights(saved)
      else setInsights(null)
    })
  }, [period, user])

  const runInsights = async () => {
    if (!user) return
    setLoading(true)
    setError('')
    try {
      const data = await fetchInsights(filteredEntries, user.id, period)
      setInsights(data)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.error('[Insights] Error:', message)
      if (message === 'NO_API_KEY') {
        setError('Add your Anthropic API key in Settings to enable AI insights.')
      } else if (message.includes('401')) {
        setError('Invalid API key. Please check your Anthropic API key in Settings.')
      } else if (message.includes('429')) {
        setError('Rate limited. Please wait a moment and try again.')
      } else if (message.includes('overloaded') || message.includes('529')) {
        setError('The AI service is currently overloaded. Please try again in a minute.')
      } else {
        setError(`Failed to generate insights: ${message.replace('API_ERROR: ', '')}`)
      }
    }
    setLoading(false)
  }

  const handleSave = async () => {
    if (!user || !insights) return
    setSaving(true)
    await persistInsights(user.id, insights, period)
    setSaving(false)
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      await exportInsightsPdf()
    } catch (err) {
      console.error('[Insights] PDF export error:', err)
    }
    setExporting(false)
  }

  // Loading saved data from DB
  if (dbLoading) {
    return (
      <div className="pb-24 flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-[#1F3649] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Empty state
  if (entries.length === 0) {
    return (
      <div className="pb-24 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Brain size={32} className="text-[#1F3649] mx-auto opacity-40" />
          <p className="text-sm text-[#2d3435] font-medium">
            No journal entries to analyze yet.
          </p>
          <button
            onClick={() => navigate('/journal')}
            className="text-sm text-[#1F3649] font-semibold hover:underline cursor-pointer"
          >
            Write your first entry
          </button>
        </div>
      </div>
    )
  }

  const sortedThemes = insights ? [...insights.themes].sort((a, b) => b.weight - a.weight) : []

  return (
    <div id="insights-content" className="pb-24 space-y-6 md:space-y-8">
      {/* Header */}
      <header className="flex flex-col gap-6 pt-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-[#1F3649] font-bold text-sm tracking-widest uppercase mb-2">
              Deep Intelligence
            </p>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-[#2d3435]">
              Journal Insights
            </h1>
            <p className="text-[#5a6061] max-w-lg mt-2">
              Data-driven patterns and AI-powered analysis from your {entries.length} journal{' '}
              {entries.length === 1 ? 'entry' : 'entries'}.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {insights && (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-[#e4e9ea] hover:bg-[#dde4e5] text-[#2d3435] px-5 py-2.5 rounded-[10px] text-sm font-semibold transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  <Save size={14} />
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleExport}
                  disabled={exporting}
                  className="bg-[#e4e9ea] hover:bg-[#dde4e5] text-[#2d3435] px-5 py-2.5 rounded-[10px] text-sm font-semibold transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  <Download size={14} />
                  {exporting ? 'Exporting...' : 'Export PDF'}
                </button>
              </>
            )}
            <button
              onClick={runInsights}
              disabled={loading}
              className="bg-[#1F3649] hover:opacity-90 text-white px-5 py-2.5 rounded-[10px] text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-[#1F3649]/20 disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Generating...' : insights ? 'Refresh' : 'Generate Insights'}
            </button>
          </div>
        </div>

        {/* Period Tabs */}
        <div className="flex gap-1 bg-[#f2f4f4] p-1 rounded-[12px] w-fit">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-5 py-2 rounded-[10px] text-sm font-semibold transition-all cursor-pointer ${
                period === p.key
                  ? 'bg-white text-[#1F3649] shadow-sm'
                  : 'text-[#5a6061] hover:text-[#2d3435]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </header>

      {/* Error banner */}
      {error && (
        <div className="bg-[#9f403d]/10 border border-[#9f403d]/20 rounded-[15px] p-4 flex items-center gap-3">
          <AlertCircle size={18} className="text-[#9f403d] shrink-0" />
          <p className="text-sm text-[#2d3435] flex-1">{error}</p>
          {(error.includes('Settings') || error.includes('API key')) && (
            <button
              onClick={() => navigate('/settings')}
              className="text-sm text-[#1F3649] font-semibold hover:underline cursor-pointer shrink-0"
            >
              Go to Settings
            </button>
          )}
        </div>
      )}

      {/* Stats Overview Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white card p-5 text-center">
          <div className="w-10 h-10 bg-[#1F3649]/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <BookOpen size={18} className="text-[#1F3649]" />
          </div>
          <span className="block text-2xl font-bold text-[#1F3649]">{stats.totalEntries}</span>
          <span className="text-xs font-bold uppercase tracking-widest text-[#5a6061]">Entries</span>
        </div>
        <div className="bg-white card p-5 text-center">
          <div className="w-10 h-10 bg-[#1F3649]/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <FileEdit size={18} className="text-[#1F3649]" />
          </div>
          <span className="block text-2xl font-bold text-[#1F3649]">{stats.avgWordsPerEntry}</span>
          <span className="text-xs font-bold uppercase tracking-widest text-[#5a6061]">Avg Words</span>
        </div>
        <div className="bg-white card p-5 text-center">
          <div className="w-10 h-10 bg-[#1F3649]/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <Flame size={18} className="text-[#1F3649]" />
          </div>
          <span className="block text-2xl font-bold text-[#1F3649]">{stats.currentStreak}</span>
          <span className="text-xs font-bold uppercase tracking-widest text-[#5a6061]">Day Streak</span>
        </div>
        <div className="bg-white card p-5 text-center">
          <div className="w-10 h-10 bg-[#1F3649]/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <SmilePlus size={18} className="text-[#1F3649]" />
          </div>
          <span className="block text-2xl font-bold text-[#1F3649]">{stats.avgMood || '—'}</span>
          <span className="text-xs font-bold uppercase tracking-widest text-[#5a6061]">Avg Mood</span>
        </div>
      </div>

      {/* Charts Row 1 — Mood Over Time + Category Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
        <section className="md:col-span-8 bg-white card p-5 md:p-8">
          <h3 className="text-lg font-bold text-[#2d3435] mb-1">Mood Over Time</h3>
          <p className="text-sm text-[#5a6061] mb-6">Daily mood scores across your entries</p>
          <div className="h-64">
            {stats.moodOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.moodOverTime}>
                  <defs>
                    <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1F3649" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#1F3649" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8eaeb" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#5a6061' }} />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: '#5a6061' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: '1px solid #e8eaeb', fontSize: 13 }}
                    formatter={(value: number) => [MOOD_LABELS[Math.round(value)] || value, 'Mood']}
                  />
                  <Area type="monotone" dataKey="mood" stroke="#1F3649" strokeWidth={2} fill="url(#moodGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-[#5a6061] opacity-60">
                Add mood scores to your entries to see trends
              </div>
            )}
          </div>
        </section>

        <section className="md:col-span-4 bg-white card p-5 md:p-8">
          <h3 className="text-lg font-bold text-[#2d3435] mb-1">Categories</h3>
          <p className="text-sm text-[#5a6061] mb-6">Entry distribution by category</p>
          <div className="h-64">
            {stats.categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.categoryBreakdown}
                    dataKey="count"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={40}
                    strokeWidth={2}
                    stroke="#fff"
                  >
                    {stats.categoryBreakdown.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e8eaeb', fontSize: 13 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-[#5a6061] opacity-60">
                Categorize entries to see breakdown
              </div>
            )}
            {stats.categoryBreakdown.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2 justify-center">
                {stats.categoryBreakdown.slice(0, 5).map((c, i) => (
                  <span key={c.category} className="flex items-center gap-1.5 text-xs text-[#5a6061]">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    {c.category}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Charts Row 2 — Word Count Trend + Day of Week */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
        <section className="md:col-span-7 bg-white card p-5 md:p-8">
          <h3 className="text-lg font-bold text-[#2d3435] mb-1">Writing Depth</h3>
          <p className="text-sm text-[#5a6061] mb-6">Average words per entry over time</p>
          <div className="h-56">
            {stats.wordCountOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.wordCountOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8eaeb" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#5a6061' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#5a6061' }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e8eaeb', fontSize: 13 }} />
                  <Bar dataKey="words" fill="#1F3649" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-[#5a6061] opacity-60">
                Not enough data yet
              </div>
            )}
          </div>
        </section>

        <section className="md:col-span-5 bg-white card p-5 md:p-8">
          <h3 className="text-lg font-bold text-[#2d3435] mb-1">Journaling Days</h3>
          <p className="text-sm text-[#5a6061] mb-6">Which days you write the most</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.entriesPerDayOfWeek}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8eaeb" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#5a6061' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#5a6061' }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e8eaeb', fontSize: 13 }} />
                <Bar dataKey="count" fill="#586062" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Mood Distribution */}
      <section className="bg-white card p-5 md:p-8">
        <h3 className="text-lg font-bold text-[#2d3435] mb-1">Mood Distribution</h3>
        <p className="text-sm text-[#5a6061] mb-6">How your mood scores are distributed</p>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.moodDistribution.map((d) => ({ ...d, label: MOOD_LABELS[d.score] }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8eaeb" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#5a6061' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#5a6061' }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e8eaeb', fontSize: 13 }} />
              <Bar dataKey="count" fill="#2a4a63" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  AI-Powered Insights Section                                  */}
      {/* ============================================================ */}

      <div className="border-t border-[#e8eaeb] pt-8 mt-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#1F3649]/10 rounded-full flex items-center justify-center">
            <Brain size={20} className="text-[#1F3649]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#2d3435]">AI-Powered Insights</h2>
            <p className="text-sm text-[#5a6061]">Deep analysis generated by AI from your journal entries</p>
          </div>
        </div>

        {/* Loading state for AI */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-4">
              <div className="w-10 h-10 border-2 border-[#1F3649] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-[#5a6061] font-medium">
                Synthesizing insights from {filteredEntries.length} entries...
              </p>
            </div>
          </div>
        )}

        {/* No AI insights yet */}
        {!loading && !insights && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-5 max-w-sm">
              <div className="w-16 h-16 rounded-full bg-[#1F3649]/10 flex items-center justify-center mx-auto">
                <Brain size={28} className="text-[#1F3649]" />
              </div>
              <div>
                <p className="text-base font-bold text-[#2d3435] mb-1">No AI insights yet</p>
                <p className="text-sm text-[#5a6061]">
                  Generate AI-powered insights from your {filteredEntries.length} journal{' '}
                  {filteredEntries.length === 1 ? 'entry' : 'entries'}.
                </p>
              </div>
              <button
                onClick={runInsights}
                className="bg-[#1F3649] hover:opacity-90 text-white px-8 py-2.5 rounded-[10px] text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 mx-auto shadow-lg shadow-[#1F3649]/20"
              >
                <Lightbulb size={15} />
                Generate Insights
              </button>
            </div>
          </div>
        )}

        {/* AI Insights Content */}
        {!loading && insights && (
          <div className="space-y-6">
            {/* Summary + Breakthroughs */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
              {/* Summary Card */}
              <section className="md:col-span-8 bg-white card p-8 relative overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-[#2d3435] mb-1">Emotional Resonance</h3>
                    <p className="text-sm text-[#5a6061]">Mood patterns across your entries</p>
                  </div>
                  {insights.dominantTheme && (
                    <span className="bg-[#1F3649]/10 text-[#1F3649] text-xs font-bold px-3 py-1.5 rounded-full">
                      {insights.dominantTheme}
                    </span>
                  )}
                </div>
                <p className="text-[#2d3435] text-lg leading-relaxed mb-6">
                  {insights.weeklySummary || 'Analyzing your journal entries for patterns and insights.'}
                </p>
                {insights.moodDescription && (
                  <p className="text-[#5a6061] leading-relaxed">
                    {insights.moodDescription}
                  </p>
                )}
              </section>

              {/* Breakthroughs */}
              <section className="md:col-span-4 bg-[#ebeeef] card p-8 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-[#1F3649]/10 rounded-full flex items-center justify-center mb-6">
                    <Lightbulb size={24} className="text-[#1F3649]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#2d3435] mb-4">Key Breakthroughs</h3>
                  <ul className="space-y-5">
                    {insights.breakthroughs.map((text, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="text-[#1F3649] font-black text-lg shrink-0">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <p className="text-sm leading-relaxed text-[#5a6061] font-medium">{text}</p>
                      </li>
                    ))}
                    {insights.breakthroughs.length === 0 && (
                      <li className="text-sm text-[#5a6061] opacity-60">Keep journaling to unlock breakthroughs.</li>
                    )}
                  </ul>
                </div>
              </section>
            </div>

            {/* Theme Cloud + Quiet Hours */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
              <section className="md:col-span-5 bg-white card p-8">
                <h3 className="text-xl font-bold text-[#2d3435] mb-8">Theme Cloud</h3>
                <div className="flex flex-wrap gap-x-6 gap-y-4 items-center justify-center min-h-[200px]">
                  {sortedThemes.map((theme, i) => (
                    <span
                      key={theme.word}
                      className={`${THEME_SIZES[Math.min(i, THEME_SIZES.length - 1)]} ${THEME_COLORS[Math.min(i, THEME_COLORS.length - 1)]}`}
                    >
                      {theme.word}
                    </span>
                  ))}
                  {sortedThemes.length === 0 && (
                    <p className="text-sm text-[#5a6061] opacity-60">No themes detected yet</p>
                  )}
                </div>
              </section>

              <section className="md:col-span-7 card overflow-hidden relative group h-80">
                <div className="absolute inset-0 bg-gradient-to-br from-[#1F3649] to-[#162838]" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/3 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/3 blur-2xl" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent p-10 flex flex-col justify-end">
                  <h3 className="text-3xl font-bold text-white mb-2 tracking-tight">The Quiet Hours</h3>
                  <p className="text-white/80 text-lg max-w-md">
                    {insights.quietHoursInsight || 'Write more entries at different times to discover your most creative hours.'}
                  </p>
                </div>
              </section>
            </div>

            {/* Emotional Patterns + Growth Observations */}
            {(insights.emotionalPatterns?.length || insights.growthObservations?.length) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {insights.emotionalPatterns && insights.emotionalPatterns.length > 0 && (
                  <section className="bg-white card p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-[#1F3649]/10 rounded-full flex items-center justify-center">
                        <Heart size={18} className="text-[#1F3649]" />
                      </div>
                      <h3 className="text-lg font-bold text-[#2d3435]">Emotional Patterns</h3>
                    </div>
                    <ul className="space-y-4">
                      {insights.emotionalPatterns.map((pattern, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="w-1.5 h-1.5 bg-[#1F3649] rounded-full mt-2 shrink-0" />
                          <p className="text-sm text-[#5a6061] leading-relaxed">{pattern}</p>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {insights.growthObservations && insights.growthObservations.length > 0 && (
                  <section className="bg-white card p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-[#22c55e]/10 rounded-full flex items-center justify-center">
                        <TrendingUp size={18} className="text-[#22c55e]" />
                      </div>
                      <h3 className="text-lg font-bold text-[#2d3435]">Growth Observations</h3>
                    </div>
                    <ul className="space-y-4">
                      {insights.growthObservations.map((obs, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="w-1.5 h-1.5 bg-[#22c55e] rounded-full mt-2 shrink-0" />
                          <p className="text-sm text-[#5a6061] leading-relaxed">{obs}</p>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>
            )}

            {/* Wellness Indicators */}
            {insights.wellnessIndicators && insights.wellnessIndicators.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                {insights.wellnessIndicators.map((indicator) => {
                  const Icon = WELLNESS_ICONS[indicator.area] || Heart
                  return (
                    <section key={indicator.area} className="bg-white card p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#1F3649]/10 rounded-full flex items-center justify-center">
                            <Icon size={18} className="text-[#1F3649]" />
                          </div>
                          <h4 className="text-sm font-bold text-[#2d3435]">{indicator.area}</h4>
                        </div>
                        <StatusBadge status={indicator.status} />
                      </div>
                      <p className="text-sm text-[#5a6061] leading-relaxed">{indicator.suggestion}</p>
                    </section>
                  )
                })}
              </div>
            )}

            {/* Historical Benchmarks */}
            <section className="bg-[#f2f4f4] card p-5 md:p-10">
              <h3 className="text-xl md:text-2xl font-bold text-[#2d3435] mb-6 md:mb-10">
                Historical Benchmarks
              </h3>
              <div className="space-y-6 md:space-y-10">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-[#dde4e5] rounded-full flex items-center justify-center">
                      <SmilePlus size={24} className="text-[#1F3649]" />
                    </div>
                    <div>
                      <p className="text-[#5a6061] text-xs font-bold uppercase tracking-widest mb-1">Average Sentiment</p>
                      <p className="text-xl font-bold text-[#2d3435]">
                        {insights.benchmarks.sentiment.label} ({insights.benchmarks.sentiment.value > 0 ? '+' : ''}
                        {insights.benchmarks.sentiment.value})
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-lg ${insights.benchmarks.sentiment.delta >= 0 ? 'text-[#1F3649]' : 'text-[#9f403d]'}`}>
                      {insights.benchmarks.sentiment.delta >= 0 ? '\u2191' : '\u2193'} {Math.abs(insights.benchmarks.sentiment.delta)}%
                    </p>
                    <p className="text-[#5a6061] text-xs">from baseline</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-[#dde4e5] rounded-full flex items-center justify-center">
                      <FileEdit size={24} className="text-[#586062]" />
                    </div>
                    <div>
                      <p className="text-[#5a6061] text-xs font-bold uppercase tracking-widest mb-1">Journal Depth</p>
                      <p className="text-xl font-bold text-[#2d3435]">
                        {insights.benchmarks.journalDepth.avgWords} Words / Session
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-lg ${insights.benchmarks.journalDepth.delta >= 0 ? 'text-[#586062]' : 'text-[#9f403d]'}`}>
                      {insights.benchmarks.journalDepth.delta >= 0 ? '\u2191' : '\u2193'} {Math.abs(insights.benchmarks.journalDepth.delta)}%
                    </p>
                    <p className="text-[#5a6061] text-xs">from baseline</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-[#dde4e5] rounded-full flex items-center justify-center">
                      <AlertTriangle size={24} className="text-[#9f403d]" />
                    </div>
                    <div>
                      <p className="text-[#5a6061] text-xs font-bold uppercase tracking-widest mb-1">Burnout Indicator</p>
                      <p className="text-xl font-bold text-[#2d3435]">
                        {insights.benchmarks.burnout.label} ({insights.benchmarks.burnout.probability}%)
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-lg ${insights.benchmarks.burnout.delta <= 0 ? 'text-[#22c55e]' : 'text-[#9f403d]'}`}>
                      {insights.benchmarks.burnout.delta <= 0 ? '\u2193' : '\u2191'} {Math.abs(insights.benchmarks.burnout.delta)}%
                    </p>
                    <p className="text-[#5a6061] text-xs">{insights.benchmarks.burnout.delta <= 0 ? 'improvement' : 'increase'}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Key Takeaways */}
            {insights.keyTakeaways && insights.keyTakeaways.length > 0 && (
              <section className="bg-[#1F3649] card p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-6">Key Takeaways</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {insights.keyTakeaways.map((takeaway, i) => (
                      <div key={i} className="flex gap-3">
                        <span className="text-white/40 font-black text-2xl shrink-0">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <p className="text-sm text-white/80 leading-relaxed font-medium">{takeaway}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
