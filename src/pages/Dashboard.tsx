import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { useAuthStore } from '../stores/authStore'
import { useJournalStore } from '../stores/journalStore'
import { useWheelStore } from '../stores/wheelStore'
import { format } from 'date-fns'

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
  const { entries, fetchEntries } = useJournalStore()
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
      <div className="px-4 md:px-12 pb-24 max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#0061aa] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-[#5a6061]">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 md:px-12 pb-24 max-w-7xl mx-auto space-y-6 md:space-y-8">
      {/* Hero Banner */}
      <div className="relative bg-[#586062] rounded-xl overflow-hidden px-6 py-10 md:px-10 md:py-14 shadow-sm">
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
        <div className="bg-white rounded-xl p-5 md:p-8 shadow-sm">
          <h2 className="text-sm font-bold text-[#5a6061] uppercase tracking-wider mb-4">
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
                <span className="text-2xl font-bold text-[#2d3435]">
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
                  <span className="text-xs text-[#5a6061] truncate">{cat}</span>
                  <span className="text-xs font-semibold text-[#2d3435] ml-auto">
                    {score}/10
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* High Priority Tasks Card */}
        <div className="bg-white rounded-xl p-5 md:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-[#5a6061] uppercase tracking-wider">
              High Priority Tasks
            </h2>
            <span className="text-xs text-[#5a6061]">
              {completedGoals} of {totalGoals} goals completed
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-[#f2f4f4] rounded-full h-1.5 mb-5">
            <div
              className="h-1.5 rounded-full bg-[#0061aa] transition-all"
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
                <div className="w-5 h-5 rounded-md border-2 border-[#adb3b4] flex items-center justify-center shrink-0 group-hover:border-[#0061aa] transition-colors">
                  {task.completed && <Check size={12} className="text-[#0061aa]" />}
                </div>
                <span className="text-sm text-[#5a6061] truncate">
                  {task.title}
                </span>
              </label>
            ))}
            {pendingTasks.length === 0 && (
              <p className="text-sm text-[#5a6061] text-center py-4">
                All tasks completed!
              </p>
            )}
          </div>

          {tasks.length > 0 && (
            <div className="mt-4 pt-3 bg-[#f2f4f4] -mx-8 -mb-8 px-8 pb-8 rounded-b-xl">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#0061aa]">
                  {Math.round((completedTasks / tasks.length) * 100)}%
                </span>
                <span className="text-xs text-[#5a6061]">tasks completed</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Journal Entries */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg md:text-2xl font-bold text-[#2d3435]">
            Recent Journal Entries
          </h2>
          <button
            onClick={() => navigate('/journal')}
            className="text-sm text-[#0061aa] font-semibold hover:underline transition-colors cursor-pointer"
          >
            View all
          </button>
        </div>

        {recentEntries.length === 0 ? (
          <div className="bg-white rounded-xl p-10 shadow-sm text-center">
            <p className="text-sm text-[#5a6061]">No journal entries yet.</p>
            <button
              onClick={() => navigate('/journal')}
              className="mt-2 text-sm text-[#0061aa] hover:underline cursor-pointer"
            >
              Write your first entry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {recentEntries.map((entry) => {
              const date = new Date(entry.created_at)
              return (
                <div
                  key={entry.id}
                  onClick={() => navigate('/journal')}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-[0_10px_40px_rgba(45,52,53,0.06)] cursor-pointer transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#0061aa] uppercase tracking-wider">
                      {format(date, 'MMM d')}
                    </span>
                    {entry.mood_score && (
                      <span className="text-base leading-none">
                        {['', '😞', '😕', '😐', '🙂', '😄'][entry.mood_score]}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-[#2d3435] mb-1.5 truncate group-hover:text-[#0061aa] transition-colors">
                    {entry.title}
                  </h3>
                  <p className="text-xs text-[#5a6061] leading-relaxed line-clamp-3">
                    {entry.content.slice(0, 120)}
                    {entry.content.length > 120 ? '...' : ''}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}
