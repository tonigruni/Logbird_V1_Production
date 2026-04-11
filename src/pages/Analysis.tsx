import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useJournalStore } from '../stores/journalStore'
import {
  Download,
  Sparkles,
  CheckCircle2,
  BarChart3,
  Brain,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import { fetchAnalysis, loadSavedAnalysis, type AnalysisData } from '../lib/aiAnalysis'

const WEIGHT_STYLES: Record<string, string> = {
  xl: 'px-6 py-4 text-xl font-extrabold shadow-lg shadow-[#0C1629]/20',
  lg: 'px-5 py-3 text-lg font-bold',
  md: 'px-4 py-2 text-base font-semibold',
  sm: 'px-4 py-2 text-sm font-medium',
  xs: 'px-3 py-1.5 text-xs font-medium',
}

export default function Analysis() {
  const { user } = useAuthStore()
  const { entries, fetchEntries } = useJournalStore()
  const navigate = useNavigate()

  const [analysis, setAnalysis] = useState<AnalysisData | null>(null)
  const [loading, setLoading] = useState(false)
  const [dbLoading, setDbLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    fetchEntries(user.id)
    loadSavedAnalysis(user.id).then((saved) => {
      if (saved) setAnalysis(saved)
      setDbLoading(false)
    })
  }, [user])

  const runAnalysis = async () => {
    if (!user) return
    setLoading(true)
    setError('')
    try {
      const data = await fetchAnalysis(entries, user.id)
      setAnalysis(data)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.error('[Analysis] Error:', message)
      if (message === 'NO_API_KEY') {
        setError('Add your Anthropic API key in Settings to enable AI analysis.')
      } else if (message.includes('401')) {
        setError('Invalid API key. Please check your Anthropic API key in Settings.')
      } else if (message.includes('429')) {
        setError('Rate limited. Please wait a moment and try again.')
      } else if (message.includes('overloaded') || message.includes('529')) {
        setError('The AI service is currently overloaded. Please try again in a minute.')
      } else {
        setError(`Failed to generate analysis: ${message.replace('API_ERROR: ', '')}`)
      }
    }
    setLoading(false)
  }

  const exportCSV = () => {
    if (!analysis) return
    const rows = [
      ['Metric', 'Value'],
      ['Clarity Score', String(analysis.clarityScore)],
      ['Clarity Delta', `${analysis.clarityDelta}%`],
      ['Correlation Coefficient', String(analysis.correlationCoeff)],
      ['Impact Level', analysis.impactLevel],
      [''],
      ['Sentiment Trends'],
      ['Period', 'Positive', 'Neutral'],
      ...analysis.sentimentTrend.map((s) => [s.label, String(s.positive), String(s.neutral)]),
      [''],
      ['Keywords'],
      ...analysis.keywords.map((k) => [k.word, k.weight, k.type]),
      [''],
      ['Breakthroughs'],
      ...analysis.breakthroughs.map((b, i) => [`${i + 1}. ${b}`]),
    ]
    const csv = rows.map((r) => (Array.isArray(r) ? r.join(',') : r)).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `journal-analysis-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Loading saved data from DB
  if (dbLoading) {
    return (
      <div className="pb-24 flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-[#0C1629] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className="pb-24 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-[#0C1629] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-[#727A84] font-medium">
            Analyzing {entries.length} journal entries...
          </p>
          <p className="text-xs text-[#727A84] opacity-60">
            This may take a few seconds
          </p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="pb-24 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle size={32} className="text-[#9f403d] mx-auto" />
          <p className="text-sm text-[#0C1629] font-medium">{error}</p>
          <div className="flex gap-3 justify-center">
            {(error.includes('Settings') || error.includes('API key')) && (
              <button
                onClick={() => navigate('/settings')}
                className="bg-[#0C1629] hover:opacity-90 text-white px-6 py-2.5 rounded-[10px] text-sm font-semibold transition-all cursor-pointer"
              >
                Go to Settings
              </button>
            )}
            <button
              onClick={runAnalysis}
              className="bg-[#D6DCE0] hover:bg-[#D6DCE0] text-[#0C1629] px-6 py-2.5 rounded-[10px] text-sm font-semibold transition-colors cursor-pointer flex items-center gap-2"
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
      <div className="pb-24 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Brain size={32} className="text-[#0C1629] mx-auto opacity-40" />
          <p className="text-sm text-[#0C1629] font-medium">
            No journal entries to analyze yet.
          </p>
          <button
            onClick={() => navigate('/journal')}
            className="text-sm text-[#0C1629] font-semibold hover:underline cursor-pointer"
          >
            Write your first entry
          </button>
        </div>
      </div>
    )
  }

  // No analysis generated yet
  if (!analysis) {
    return (
      <div className="pb-24 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-5 max-w-sm">
          <div className="w-16 h-16 rounded-full bg-[#0C1629]/10 flex items-center justify-center mx-auto">
            <Brain size={28} className="text-[#0C1629]" />
          </div>
          <div>
            <p className="text-base font-bold text-[#0C1629] mb-1">No analysis yet</p>
            <p className="text-sm text-[#727A84]">
              Generate AI-powered insights from your {entries.length} journal{' '}
              {entries.length === 1 ? 'entry' : 'entries'}.
            </p>
          </div>
          <button
            onClick={runAnalysis}
            className="bg-[#0C1629] hover:opacity-90 text-white px-8 py-2.5 rounded-[10px] text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 mx-auto shadow-lg shadow-[#0C1629]/20"
          >
            <Sparkles size={15} />
            Generate Analysis
          </button>
        </div>
      </div>
    )
  }

  // Build SVG paths from sentiment data
  const sentimentPath = (key: 'positive' | 'neutral') => {
    const points = analysis.sentimentTrend
    if (points.length === 0) return ''
    const step = 100 / Math.max(points.length - 1, 1)
    return points
      .map((p, i) => {
        const x = i * step
        const y = 100 - p[key]
        return `${i === 0 ? 'M' : 'L'}${x},${y}`
      })
      .join(' ')
  }

  return (
    <div className="pb-24 space-y-8">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 py-8">
        <div>
          <p className="text-[#0C1629] font-bold text-sm tracking-widest uppercase mb-2">
            Deep Intelligence
          </p>
          <h2 className="text-2xl md:text-4xl font-extrabold text-[#0C1629] tracking-tight">
            Journal Analysis
          </h2>
          <p className="text-[#727A84] max-w-lg mt-2">
            AI-powered patterns from your {entries.length} journal{' '}
            {entries.length === 1 ? 'entry' : 'entries'}.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={runAnalysis}
            className="bg-[#D6DCE0] hover:bg-[#D6DCE0] text-[#0C1629] px-6 py-2.5 rounded-[10px] text-sm font-semibold transition-colors cursor-pointer flex items-center gap-2"
          >
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
          <button
            onClick={exportCSV}
            className="bg-[#0C1629] hover:opacity-90 text-white px-6 py-2.5 rounded-[10px] text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-[#0C1629]/20"
          >
            <Download size={14} />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8">
        {/* Sentiment Trends */}
        <div className="md:col-span-8 bg-white card p-5 md:p-8 relative overflow-hidden">
          <div className="flex justify-between items-start mb-12">
            <div>
              <h3 className="text-xl font-bold text-[#0C1629] tracking-tight">
                Sentiment Trends
              </h3>
              <p className="text-sm text-[#727A84]">
                Emotional variance across your entries
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#0C1629]" />
                <span className="text-xs font-semibold text-[#727A84]">
                  Positive
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#4c5456]" />
                <span className="text-xs font-semibold text-[#727A84]">
                  Neutral
                </span>
              </div>
            </div>
          </div>

          <div className="h-64 relative">
            {analysis.sentimentTrend.length > 0 ? (
              <>
                <svg
                  className="w-full h-full overflow-visible"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  <path
                    d={sentimentPath('positive')}
                    fill="none"
                    stroke="#0C1629"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d={sentimentPath('neutral')}
                    fill="none"
                    stroke="#727A84"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="4 2"
                  />
                </svg>
                <div className="absolute -bottom-6 w-full flex justify-between text-[10px] font-bold text-[#727A84] tracking-tighter">
                  {analysis.sentimentTrend.map((p) => (
                    <span key={p.label}>{p.label}</span>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-[#727A84] opacity-60">
                Not enough data for sentiment trends
              </div>
            )}
          </div>
        </div>

        {/* Keyword Frequency */}
        <div className="md:col-span-4 bg-white card p-5 md:p-8 flex flex-col">
          <h3 className="text-xl font-bold text-[#0C1629] tracking-tight mb-2">
            Keyword Frequency
          </h3>
          <p className="text-sm text-[#727A84] mb-8">
            Dominant themes in your narratives
          </p>
          <div className="flex flex-wrap gap-2 flex-1 content-center">
            {analysis.keywords.map((kw) => (
              <span
                key={kw.word}
                className={`rounded-full ${WEIGHT_STYLES[kw.weight] ?? WEIGHT_STYLES.sm} ${
                  kw.type === 'accent'
                    ? kw.weight === 'xl'
                      ? 'bg-[#0C1629] text-white'
                      : 'bg-[#0C1629]/10 text-[#0C1629]'
                    : 'bg-[#727A84]/5 text-[#727A84]'
                }`}
              >
                {kw.word}
              </span>
            ))}
            {analysis.keywords.length === 0 && (
              <p className="text-sm text-[#727A84] opacity-60">
                No keywords detected yet
              </p>
            )}
          </div>
          {analysis.keywordObservation && (
            <div className="mt-8 p-4 bg-[#F0F3F3] rounded-[1rem] border-l-4 border-[#0C1629]">
              <p className="text-xs font-bold text-[#0C1629] uppercase tracking-widest mb-1">
                Observation
              </p>
              <p className="text-xs text-[#727A84] leading-relaxed">
                {analysis.keywordObservation}
              </p>
            </div>
          )}
        </div>

        {/* Monthly Breakthroughs */}
        <div className="md:col-span-5 bg-[#0C1629] card p-5 md:p-8 text-white relative overflow-hidden flex flex-col justify-between min-h-[320px]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-[1rem] flex items-center justify-center mb-6">
              <Sparkles size={24} className="text-white" />
            </div>
            <h3 className="text-2xl font-extrabold tracking-tight mb-4 leading-tight">
              Monthly
              <br />
              Breakthroughs
            </h3>
            <ul className="space-y-4">
              {analysis.breakthroughs.map((text, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2
                    size={18}
                    className="text-[#3f9eff] mt-0.5 shrink-0"
                  />
                  <p className="text-sm font-medium text-white/90">{text}</p>
                </li>
              ))}
              {analysis.breakthroughs.length === 0 && (
                <li className="text-sm text-white/60">
                  Keep journaling to unlock breakthroughs
                </li>
              )}
            </ul>
          </div>
          <div className="relative z-10 pt-6">
            <button
              onClick={() => navigate('/insights')}
              className="w-full py-4 bg-white text-[#0C1629] font-bold rounded-[1rem] hover:bg-[#f8f8ff] transition-all cursor-pointer"
            >
              View Full Insights
            </button>
          </div>
        </div>

        {/* Productivity Correlations */}
        <div className="md:col-span-7 bg-white card p-5 md:p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-xl font-bold text-[#0C1629] tracking-tight">
                Productivity Correlations
              </h3>
              <p className="text-sm text-[#727A84]">
                Journal depth vs. Daily task completion
              </p>
            </div>
            <div className="p-2 bg-[#F0F3F3] rounded-[1rem]">
              <BarChart3 size={20} className="text-[#727A84]" />
            </div>
          </div>

          {/* Visual representation based on correlation */}
          <div className="h-56 w-full flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="text-6xl font-black text-[#0C1629] tracking-tighter">
                {analysis.correlationCoeff.toFixed(2)}
              </div>
              <p className="text-sm text-[#727A84]">
                Correlation between journaling depth and expressed productivity
              </p>
              <div className="w-full h-3 bg-[#F0F3F3] rounded-full overflow-hidden max-w-xs mx-auto">
                <div
                  className="h-full bg-[#0C1629] rounded-full transition-all"
                  style={{ width: `${analysis.correlationCoeff * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="bg-[#F0F3F3] p-4 rounded-[1rem]">
              <div className="text-2xl font-bold text-[#0C1629]">
                {analysis.correlationCoeff.toFixed(2)}
              </div>
              <div className="text-[10px] font-bold text-[#727A84] uppercase tracking-tighter">
                Correlation Coeff.
              </div>
            </div>
            <div className="bg-[#F0F3F3] p-4 rounded-[1rem]">
              <div className="text-2xl font-bold text-[#727A84]">
                {analysis.impactLevel}
              </div>
              <div className="text-[10px] font-bold text-[#727A84] uppercase tracking-tighter">
                Impact Level
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Summary Strip */}
      <div className="bg-[#F0F3F3] card p-5 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-inner">
            <Brain size={28} className="text-[#0C1629]" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-[#0C1629]">
              Mental Clarity Score
            </h4>
            <p className="text-sm text-[#727A84]">
              {analysis.clarityDelta > 0
                ? `Your clarity is ${analysis.clarityDelta}% higher than your baseline.`
                : analysis.clarityDelta < 0
                  ? `Your clarity is ${Math.abs(analysis.clarityDelta)}% below your baseline.`
                  : 'Establishing your clarity baseline.'}
            </p>
          </div>
        </div>
        <div className="h-1.5 flex-1 mx-8 bg-[#D6DCE0] rounded-full overflow-hidden hidden lg:block">
          <div
            className="h-full bg-[#0C1629] rounded-full transition-all"
            style={{ width: `${analysis.clarityScore}%` }}
          />
        </div>
        <div className="text-right">
          <div className="text-3xl font-extrabold text-[#0C1629] tracking-tighter">
            {analysis.clarityScore}/100
          </div>
          <div className="text-[10px] font-bold text-[#727A84] uppercase tracking-widest">
            Clarity Index
          </div>
        </div>
      </div>
    </div>
  )
}
