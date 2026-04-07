import { useEffect, useState } from 'react'
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
} from 'lucide-react'
import { fetchInsights, loadSavedInsights, type InsightsData } from '../lib/aiAnalysis'

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
  'text-[#0061aa]',
  'text-[#2d3435] opacity-90',
  'text-[#005596]',
  'text-[#586062]',
  'text-[#566165]',
  'text-[#0061aa] opacity-70',
  'text-[#4c5456]',
  'text-[#5a6061]',
  'text-[#2d3435]/40',
  'text-[#586062] opacity-60',
]

export default function Insights() {
  const { user } = useAuthStore()
  const { entries, fetchEntries } = useJournalStore()
  const navigate = useNavigate()

  const [insights, setInsights] = useState<InsightsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [dbLoading, setDbLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    fetchEntries(user.id)
    loadSavedInsights(user.id).then((saved) => {
      if (saved) setInsights(saved)
      setDbLoading(false)
    })
  }, [user])

  const runInsights = async () => {
    if (!user) return
    setLoading(true)
    setError('')
    try {
      const data = await fetchInsights(entries, user.id)
      setInsights(data)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.error('[Insights] Error:', message)
      if (message === 'NO_API_KEY') {
        setError(
          'Add your Anthropic API key in Settings to enable AI insights.'
        )
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

  // Loading saved data from DB
  if (dbLoading) {
    return (
      <div className="px-12 pb-24 max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-[#0061aa] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className="px-12 pb-24 max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-[#0061aa] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-[#5a6061] font-medium">
            Synthesizing insights from {entries.length} entries...
          </p>
          <p className="text-xs text-[#5a6061] opacity-60">
            This may take a few seconds
          </p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="px-12 pb-24 max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle size={32} className="text-[#9f403d] mx-auto" />
          <p className="text-sm text-[#2d3435] font-medium">{error}</p>
          <div className="flex gap-3 justify-center">
            {(error.includes('Settings') || error.includes('API key')) && (
              <button
                onClick={() => navigate('/settings')}
                className="px-5 py-2.5 bg-[#0061aa] text-white text-sm font-bold rounded-full cursor-pointer hover:opacity-90 transition-all"
              >
                Go to Settings
              </button>
            )}
            <button
              onClick={runInsights}
              className="px-5 py-2.5 bg-[#e4e9ea] text-[#586062] text-sm font-bold rounded-full cursor-pointer hover:bg-[#dde4e5] transition-all flex items-center gap-2"
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Empty state
  if (entries.length === 0) {
    return (
      <div className="px-12 pb-24 max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Brain size={32} className="text-[#0061aa] mx-auto opacity-40" />
          <p className="text-sm text-[#2d3435] font-medium">
            No journal entries to analyze yet.
          </p>
          <button
            onClick={() => navigate('/journal')}
            className="text-sm text-[#0061aa] font-semibold hover:underline cursor-pointer"
          >
            Write your first entry
          </button>
        </div>
      </div>
    )
  }

  // No insights generated yet
  if (!insights) {
    return (
      <div className="px-12 pb-24 max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-5 max-w-sm">
          <div className="w-16 h-16 rounded-full bg-[#0061aa]/10 flex items-center justify-center mx-auto">
            <Brain size={28} className="text-[#0061aa]" />
          </div>
          <div>
            <p className="text-base font-bold text-[#2d3435] mb-1">No insights yet</p>
            <p className="text-sm text-[#5a6061]">
              Synthesise AI-powered insights from your {entries.length} journal{' '}
              {entries.length === 1 ? 'entry' : 'entries'}.
            </p>
          </div>
          <button
            onClick={runInsights}
            className="px-8 py-3 bg-[#0061aa] text-white text-sm font-bold rounded-full cursor-pointer hover:opacity-90 shadow-lg shadow-[#0061aa]/20 transition-all flex items-center gap-2 mx-auto"
          >
            <Lightbulb size={15} />
            Generate Insights
          </button>
        </div>
      </div>
    )
  }

  // Sort themes by weight descending
  const sortedThemes = [...insights.themes].sort((a, b) => b.weight - a.weight)

  return (
    <div className="px-12 pb-24 max-w-7xl mx-auto space-y-12">
      {/* Hero Summary Section */}
      <header className="flex flex-col md:flex-row gap-8 items-end justify-between pt-8">
        <div className="space-y-4 max-w-2xl">
          <div className="flex items-center gap-3">
            <h1 className="text-5xl font-extrabold tracking-tight text-[#2d3435]">
              Weekly Synthesis
            </h1>
            <button
              onClick={runInsights}
              className="p-2 text-[#5a6061] hover:text-[#0061aa] hover:bg-[#f2f4f4] rounded-full transition-all cursor-pointer"
              title="Refresh insights"
            >
              <RefreshCw size={18} />
            </button>
          </div>
          <p className="text-[#5a6061] text-lg leading-relaxed">
            {insights.weeklySummary ||
              'Analyzing your journal entries for patterns and insights.'}
            {insights.dominantTheme && (
              <>
                {' '}
                Your dominant theme is{' '}
                <span className="text-[#0061aa] font-bold">
                  {insights.dominantTheme}
                </span>
                .
              </>
            )}
          </p>
        </div>
        <div className="flex gap-4">
          <div className="p-6 bg-white rounded-[2rem] shadow-sm text-center">
            <span className="block text-3xl font-bold text-[#0061aa]">
              {insights.consistency}%
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-[#5a6061]">
              Consistency
            </span>
          </div>
          <div className="p-6 bg-white rounded-[2rem] shadow-sm text-center">
            <span className="block text-3xl font-bold text-[#0061aa]">
              {insights.insightsCount}
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-[#5a6061]">
              Insights
            </span>
          </div>
        </div>
      </header>

      {/* Bento Grid Insights */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Mood Description Card */}
        <section className="md:col-span-8 bg-white rounded-[2rem] p-8 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-xl font-bold text-[#2d3435] mb-1">
                Emotional Resonance
              </h2>
              <p className="text-sm text-[#5a6061]">
                Mood patterns across your entries
              </p>
            </div>
          </div>
          <div className="min-h-[200px] flex items-center">
            {insights.moodDescription ? (
              <p className="text-[#2d3435] text-lg leading-relaxed">
                {insights.moodDescription}
              </p>
            ) : (
              <p className="text-[#5a6061] opacity-60">
                Write more entries to unlock mood analysis.
              </p>
            )}
          </div>
        </section>

        {/* Key Breakthroughs */}
        <section className="md:col-span-4 bg-[#ebeeef] rounded-[2rem] p-8 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-[#0061aa]/10 rounded-full flex items-center justify-center mb-6">
              <Lightbulb size={24} className="text-[#0061aa]" />
            </div>
            <h2 className="text-2xl font-bold text-[#2d3435] mb-4">
              Key Breakthroughs
            </h2>
            <ul className="space-y-6">
              {insights.breakthroughs.map((text, i) => (
                <li key={i} className="flex gap-4">
                  <span className="text-[#0061aa] font-black text-lg">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="text-sm leading-relaxed text-[#5a6061] font-medium">
                    {text}
                  </p>
                </li>
              ))}
              {insights.breakthroughs.length === 0 && (
                <li className="text-sm text-[#5a6061] opacity-60">
                  Keep journaling to unlock breakthroughs.
                </li>
              )}
            </ul>
          </div>
          <button
            onClick={() => navigate('/analysis')}
            className="mt-8 w-full py-4 bg-[#586062] text-white rounded-full font-bold text-sm tracking-wide hover:bg-[#475052] transition-all cursor-pointer active:scale-95"
          >
            Explore Patterns
          </button>
        </section>

        {/* Theme Cloud */}
        <section className="md:col-span-5 bg-white rounded-[2rem] p-8 shadow-sm">
          <h2 className="text-xl font-bold text-[#2d3435] mb-8">
            Theme Cloud
          </h2>
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
              <p className="text-sm text-[#5a6061] opacity-60">
                No themes detected yet
              </p>
            )}
          </div>
        </section>

        {/* Quiet Hours Insight */}
        <section className="md:col-span-7 rounded-[2rem] overflow-hidden relative group h-80">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0061aa] to-[#005596]" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/3 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/3 blur-2xl" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent p-10 flex flex-col justify-end">
            <h3 className="text-3xl font-bold text-white mb-2 tracking-tight">
              The Quiet Hours
            </h3>
            <p className="text-white/80 text-lg max-w-md">
              {insights.quietHoursInsight ||
                'Write more entries at different times to discover your most creative hours.'}
            </p>
          </div>
        </section>
      </div>

      {/* Historical Benchmarks */}
      <section className="bg-[#f2f4f4] rounded-[2rem] p-10">
        <h2 className="text-2xl font-bold text-[#2d3435] mb-10">
          Historical Benchmarks
        </h2>
        <div className="space-y-12">
          {/* Average Sentiment */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-[#dde4e5] rounded-full flex items-center justify-center">
                <SmilePlus size={24} className="text-[#0061aa]" />
              </div>
              <div>
                <p className="text-[#5a6061] text-xs font-bold uppercase tracking-widest mb-1">
                  Average Sentiment
                </p>
                <p className="text-xl font-bold text-[#2d3435]">
                  {insights.benchmarks.sentiment.label} (
                  {insights.benchmarks.sentiment.value > 0 ? '+' : ''}
                  {insights.benchmarks.sentiment.value})
                </p>
              </div>
            </div>
            <div className="text-right">
              <p
                className={`font-bold text-lg ${insights.benchmarks.sentiment.delta >= 0 ? 'text-[#0061aa]' : 'text-[#9f403d]'}`}
              >
                {insights.benchmarks.sentiment.delta >= 0 ? '↑' : '↓'}{' '}
                {Math.abs(insights.benchmarks.sentiment.delta)}%
              </p>
              <p className="text-[#5a6061] text-xs">from baseline</p>
            </div>
          </div>

          {/* Journal Depth */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-[#dde4e5] rounded-full flex items-center justify-center">
                <FileEdit size={24} className="text-[#586062]" />
              </div>
              <div>
                <p className="text-[#5a6061] text-xs font-bold uppercase tracking-widest mb-1">
                  Journal Depth
                </p>
                <p className="text-xl font-bold text-[#2d3435]">
                  {insights.benchmarks.journalDepth.avgWords} Words / Session
                </p>
              </div>
            </div>
            <div className="text-right">
              <p
                className={`font-bold text-lg ${insights.benchmarks.journalDepth.delta >= 0 ? 'text-[#586062]' : 'text-[#9f403d]'}`}
              >
                {insights.benchmarks.journalDepth.delta >= 0 ? '↑' : '↓'}{' '}
                {Math.abs(insights.benchmarks.journalDepth.delta)}%
              </p>
              <p className="text-[#5a6061] text-xs">from baseline</p>
            </div>
          </div>

          {/* Burnout Indicator */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-[#dde4e5] rounded-full flex items-center justify-center">
                <AlertTriangle size={24} className="text-[#9f403d]" />
              </div>
              <div>
                <p className="text-[#5a6061] text-xs font-bold uppercase tracking-widest mb-1">
                  Burnout Indicator
                </p>
                <p className="text-xl font-bold text-[#2d3435]">
                  {insights.benchmarks.burnout.label} (
                  {insights.benchmarks.burnout.probability}%)
                </p>
              </div>
            </div>
            <div className="text-right">
              <p
                className={`font-bold text-lg ${insights.benchmarks.burnout.delta <= 0 ? 'text-[#22c55e]' : 'text-[#9f403d]'}`}
              >
                {insights.benchmarks.burnout.delta <= 0 ? '↓' : '↑'}{' '}
                {Math.abs(insights.benchmarks.burnout.delta)}%
              </p>
              <p className="text-[#5a6061] text-xs">
                {insights.benchmarks.burnout.delta <= 0
                  ? 'improvement'
                  : 'increase'}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
