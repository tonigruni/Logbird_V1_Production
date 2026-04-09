import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Star, Frown, Meh, Smile } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { useAuthStore } from '../stores/authStore'
import { useJournalStore } from '../stores/journalStore'
import { useWheelStore } from '../stores/wheelStore'
import { format } from 'date-fns'
import GradientBarsBackground from '../components/ui/GradientBarsBackground'
import { cn } from '../lib/utils'

const JOURNAL_CAT_COLORS: Record<string, { bg: string; text: string }> = {
  Personal:  { bg: 'bg-primary/10',  text: 'text-primary' },
  Work:      { bg: 'bg-[#586062]/10',  text: 'text-[#586062]' },
  Dreams:    { bg: 'bg-[#9f403d]/10',  text: 'text-[#9f403d]' },
  Ideas:     { bg: 'bg-[#162838]/10',  text: 'text-[#162838]' },
  Travel:    { bg: 'bg-[#22c55e]/10',  text: 'text-[#22c55e]' },
  Health:    { bg: 'bg-[#16a34a]/10',  text: 'text-[#16a34a]' },
  Gratitude: { bg: 'bg-[#ca8a04]/10',  text: 'text-[#ca8a04]' },
}
function getJournalCatColor(cat: string) {
  return JOURNAL_CAT_COLORS[cat] ?? { bg: 'bg-[#ebeeef]', text: 'text-on-surface-variant' }
}
const MOOD_META: Record<number, { short: string; chipClass: string; icon: typeof Frown }> = {
  1: { short: 'Very Low', chipClass: 'bg-red-100 text-red-700',         icon: Frown },
  2: { short: 'Low',      chipClass: 'bg-orange-100 text-orange-700',   icon: Frown },
  3: { short: 'Neutral',  chipClass: 'bg-[#ebeeef] text-on-surface-variant',     icon: Meh   },
  4: { short: 'Good',     chipClass: 'bg-green-100 text-green-700',     icon: Smile },
  5: { short: 'Excellent',chipClass: 'bg-emerald-100 text-emerald-800', icon: Smile },
}
function stripMd(text: string): string {
  return text.replace(/#{1,6}\s/g, '').replace(/[*_`~]/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim()
}
function countWords(content: string): string {
  const n = content.trim().split(/\s+/).filter(Boolean).length
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k words` : `${n} words`
}

const CATEGORY_COLORS: Record<string, string> = {
  Health: '#22c55e',
  Career: '#6b63f5',
  Finance: '#f59e0b',
  Relationships: '#ef4444',
  'Personal Growth': '#3b82f6',
  Fun: '#ec4899',
  Environment: '#14b8a6',
  'Family/Friends': '#f97316',
}

export default function Dashboard() {
  const { user } = useAuthStore()
  const { entries, fetchEntries, updateEntry } = useJournalStore()
  const { checkins, goals, tasks, fetchAll, toggleTask } = useWheelStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      Promise.all([fetchEntries(user.id), fetchAll(user.id)]).finally(() =>
        setLoading(false)
      )
    } else {
      setLoading(false)
    }
  }, [user])

  const latestCheckin = checkins[0]
  const scores = latestCheckin?.scores ?? {}
  const scoreEntries = Object.entries(scores)
  const avgScore = scoreEntries.length
    ? Math.round(
        (scoreEntries.reduce((sum, [, v]) => sum + v, 0) / scoreEntries.length) * 10
      )
    : 0

  const completedGoals = goals.filter((g) => g.status === 'completed').length
  const totalGoals = goals.length
  const pendingTasks = tasks.filter((t) => !t.completed)
  const completedTasks = tasks.filter((t) => t.completed).length

  const recentEntries = entries.slice(0, 3)

  // Donut chart data
  const donutData = scoreEntries.map(([name, value]) => ({
    name,
    value,
  }))
  const donutBackground = scoreEntries.map(([name]) => ({
    name,
    value: 10,
  }))

  if (loading) {
    return (
      <div className="pb-24 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#1F3649] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-on-surface-variant">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-24 space-y-6 md:space-y-8">
      {/* Hero Banner */}
      <div className="relative bg-primary card overflow-hidden px-6 py-10 md:px-10 md:py-14">
        <GradientBarsBackground />
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.07]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(107,99,245,0.4) 0%, transparent 40%), radial-gradient(circle at 60% 80%, rgba(255,255,255,0.2) 0%, transparent 45%)',
            }}
          />
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        <div className="relative z-10">
          <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
            Clarity over Complexity
          </h1>
          <p className="text-white/60 mt-2 text-sm max-w-md">
            Your personal dashboard for life alignment. Track what matters, reflect
            often, and grow intentionally.
          </p>
        </div>
      </div>

      {/* Two stat cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
        {/* Wheel of Life Card */}
        <div className="bg-surface card p-5 md:p-8">
          <h2 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-4">
            Wheel of Life
          </h2>
          <div className="flex items-center gap-6">
            {/* Donut chart */}
            <div className="relative w-36 h-36 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  {/* Background ring */}
                  <Pie
                    data={donutBackground}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={58}
                    stroke="none"
                    isAnimationActive={false}
                  >
                    {donutBackground.map((_, i) => (
                      <Cell key={`bg-${i}`} fill="#ebeeef" />
                    ))}
                  </Pie>
                  {/* Score ring */}
                  <Pie
                    data={donutData}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={58}
                    stroke="none"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {donutData.map((entry, i) => (
                      <Cell
                        key={`cell-${i}`}
                        fill={CATEGORY_COLORS[entry.name] ?? '#6b63f5'}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              {/* Center percentage */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-on-surface">
                  {avgScore}%
                </span>
              </div>
            </div>
            {/* Category list */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 flex-1 min-w-0">
              {scoreEntries.map(([cat, score]) => (
                <div key={cat} className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{
                      backgroundColor: CATEGORY_COLORS[cat] ?? '#6b63f5',
                    }}
                  />
                  <span className="text-xs text-on-surface-variant truncate">{cat}</span>
                  <span className="text-xs font-semibold text-on-surface ml-auto">
                    {score}/10
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* High Priority Tasks Card */}
        <div className="bg-surface card p-5 md:p-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">
              High Priority Tasks
            </h2>
            <span className="text-xs text-on-surface-variant">
              {completedGoals} of {totalGoals} goals completed
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-muted rounded-full h-1.5 mb-5">
            <div
              className="h-1.5 rounded-full bg-primary transition-all"
              style={{
                width: `${tasks.length ? (completedTasks / tasks.length) * 100 : 0}%`,
              }}
            />
          </div>

          <div className="space-y-3">
            {pendingTasks.slice(0, 4).map((task) => (
              <label
                key={task.id}
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => toggleTask(task.id, !task.completed)}
              >
                <div className="w-5 h-5 rounded-md border-2 border-outline-variant flex items-center justify-center shrink-0 group-hover:border-primary transition-colors">
                  {task.completed && <Check size={12} className="text-primary" />}
                </div>
                <span className="text-sm text-on-surface-variant truncate">
                  {task.title}
                </span>
              </label>
            ))}
            {pendingTasks.length === 0 && (
              <p className="text-sm text-on-surface-variant text-center py-4">
                All tasks completed!
              </p>
            )}
          </div>

          {tasks.length > 0 && (
            <div className="mt-4 pt-3 bg-muted -mx-8 -mb-8 px-8 pb-8 rounded-b-xl">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-primary">
                  {Math.round((completedTasks / tasks.length) * 100)}%
                </span>
                <span className="text-xs text-on-surface-variant">tasks completed</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Journal Entries */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg md:text-2xl font-bold text-on-surface">
            Recent Journal Entries
          </h2>
          <button
            onClick={() => navigate('/journal')}
            className="text-sm text-primary font-semibold hover:underline transition-colors cursor-pointer"
          >
            View all
          </button>
        </div>

        {recentEntries.length === 0 ? (
          <div className="bg-surface card p-10 text-center">
            <p className="text-sm text-on-surface-variant">No journal entries yet.</p>
            <button
              onClick={() => navigate('/journal')}
              className="mt-2 text-sm text-primary hover:underline cursor-pointer"
            >
              Write your first entry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {recentEntries.map((entry) => {
              const meta = entry.mood_score ? MOOD_META[entry.mood_score] : null
              const MoodIcon = meta?.icon
              const cc = entry.category ? getJournalCatColor(entry.category) : null
              return (
                <div
                  key={entry.id}
                  onClick={() => navigate('/journal')}
                  className="bg-surface card p-5 hover:shadow-[0_8px_30px_rgba(45,52,53,0.08)] transition-all group cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-[10px] font-bold text-outline-variant uppercase tracking-wider">
                      {format(new Date(entry.created_at), 'MMM d, yyyy')}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); updateEntry(entry.id, { is_favorite: !entry.is_favorite }) }}
                      className={cn('p-1 rounded-lg transition-all cursor-pointer -mt-0.5', entry.is_favorite ? 'text-[#ca8a04]' : 'text-[#dde4e5] hover:text-[#ca8a04]')}
                    >
                      <Star size={12} fill={entry.is_favorite ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                  <h3 className="text-sm font-bold text-on-surface mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {entry.title}
                  </h3>
                  <p className="text-xs text-on-surface-variant line-clamp-3 leading-relaxed mb-4">
                    {stripMd(entry.content).slice(0, 120)}…
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-muted">
                    <span className="text-[10px] font-semibold text-outline-variant">{countWords(entry.content)}</span>
                    <div className="flex items-center gap-1.5">
                      {cc && entry.category && (
                        <span className={cn('inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-[15px]', cc.bg, cc.text)}>
                          {entry.category}
                        </span>
                      )}
                      {meta && MoodIcon && (
                        <span className={cn('inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-[15px]', meta.chipClass)}>
                          <MoodIcon size={9}/>{meta.short}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}
