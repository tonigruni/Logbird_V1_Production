import { useState, useMemo, useEffect } from 'react'
import {
  Flame,
  CheckCircle,
  Circle,
  Sun,
  Moon,
  Lightning,
  Plus,
  Drop,
  BookOpen,
  Barbell,
  Brain,
  Leaf,
  Sparkle,
  DotsSixVertical,
  CaretRight,
  Trash,
} from '@phosphor-icons/react'
import { cn } from '../lib/utils'
import { useHabitsStore, type Habit, type NewHabitFields, ICON_MAP } from '../stores/habitsStore'
import { useAuthStore } from '../stores/authStore'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type HabitCadence = 'daily' | 'weekdays' | 'weekly'
type HabitKind = 'binary' | 'quantity'

const WEEK_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

// Computed from real date — Mon=0, Sun=6
const TODAY_IDX = (() => {
  const d = new Date().getDay()
  return d === 0 ? 6 : d - 1
})()

// ---------------------------------------------------------------------------
// Small UI primitives
// ---------------------------------------------------------------------------

function Section({ title, subtitle, right, children }: {
  title: string
  subtitle?: string
  right?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="mb-10">
      <div className="flex items-end justify-between mb-4">
        <div>
          <h2 className="text-[15px] font-bold tracking-tight text-[#1F3649]">{title}</h2>
          {subtitle && (
            <p className="text-[12.5px] text-[#5a6061] mt-0.5">{subtitle}</p>
          )}
        </div>
        {right}
      </div>
      {children}
    </section>
  )
}

function StreakBadge({ n, size = 'sm' }: { n: number; size?: 'sm' | 'md' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-bold text-[#b45309] bg-[#fef3c7] rounded-full',
        size === 'md' ? 'text-[11.5px] px-2.5 py-1' : 'text-[10.5px] px-2 py-[3px]'
      )}
    >
      <Flame size={size === 'md' ? 11 : 10} weight="fill" />
      {n}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Hero / stats strip
// ---------------------------------------------------------------------------

function HeroStrip({ habits, todayDone, todayTotal }: {
  habits: Habit[]
  todayDone: number
  todayTotal: number
}) {
  const longestStreak = Math.max(...habits.map(h => h.streak))
  const weekDone = habits.reduce((s, h) => s + h.week.filter(Boolean).length, 0)
  const weekTotal = habits.reduce((s, h) => s + h.week.length, 0)
  const weekPct = weekTotal > 0 ? Math.round((weekDone / weekTotal) * 100) : 0
  const perfectDays = habits.length > 0
    ? Array.from({ length: 7 }, (_, di) => habits.every(h => h.week[di])).filter(Boolean).length
    : 0
  const longestHabit = habits.find(h => h.streak === longestStreak)

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8">
      {/* Today */}
      <div className="card bg-white p-5">
        <div className="text-[11px] uppercase tracking-wider text-[#adb3b4] font-bold mb-2">Today</div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-[32px] font-black tracking-tight text-[#1F3649] leading-none">{todayDone}</span>
          <span className="text-[15px] font-semibold text-[#5a6061]">/ {todayTotal}</span>
        </div>
        <div className="flex items-center gap-1 mt-3">
          {Array.from({ length: todayTotal }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-1.5 flex-1 rounded-full',
                i < todayDone ? 'bg-[#1F3649]' : 'bg-[#f2f4f4]'
              )}
            />
          ))}
        </div>
      </div>

      {/* This week */}
      <div className="card bg-white p-5">
        <div className="text-[11px] uppercase tracking-wider text-[#adb3b4] font-bold mb-2">This week</div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-[32px] font-black tracking-tight text-[#1F3649] leading-none">{weekPct}%</span>
        </div>
        <div className="text-[11.5px] text-[#5a6061] mt-3 font-semibold">{weekDone} of {weekTotal} completions</div>
      </div>

      {/* Longest streak */}
      <div className="card bg-white p-5">
        <div className="text-[11px] uppercase tracking-wider text-[#adb3b4] font-bold mb-2">Longest streak</div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-[32px] font-black tracking-tight text-[#1F3649] leading-none">{longestStreak}</span>
          <span className="text-[13px] font-semibold text-[#5a6061]">days</span>
        </div>
        {longestHabit && (
          <div className="text-[11.5px] text-[#5a6061] mt-3 font-semibold flex items-center gap-1">
            <Flame size={11} weight="fill" className="text-[#f59e0b]" />
            {longestHabit.name}
          </div>
        )}
      </div>

      {/* Perfect days */}
      <div className="card p-5 text-white" style={{ background: '#1F3649' }}>
        <div className="text-[11px] uppercase tracking-wider text-white/50 font-bold mb-2">Perfect days</div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-[32px] font-black tracking-tight leading-none">{perfectDays}</span>
          <span className="text-[13px] font-semibold text-white/60">/ 7 this wk</span>
        </div>
        <div className="text-[11.5px] text-white/50 mt-3 font-semibold">Every habit, start to finish</div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Today list — each row is a habit due today
// ---------------------------------------------------------------------------

function TodayRow({ habit, done, onToggle }: {
  habit: Habit
  done: boolean
  onToggle: () => void
}) {
  const Icon = habit.icon
  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-[14px] border transition-all cursor-pointer',
        done ? 'bg-[#f2f4f4]/50 border-transparent' : 'bg-white border-[#ECEFF2] hover:border-[#ebeeef]'
      )}
      onClick={onToggle}
    >
      <button
        onClick={e => { e.stopPropagation(); onToggle() }}
        className="shrink-0 cursor-pointer"
        aria-label={done ? 'Mark incomplete' : 'Mark complete'}
      >
        {done
          ? <CheckCircle size={22} weight="fill" className="text-[#22c55e]" />
          : <Circle size={22} className="text-[#adb3b4]" />}
      </button>

      <div
        className="w-8 h-8 rounded-[9px] flex items-center justify-center shrink-0"
        style={{ background: `${habit.color}18` }}
      >
        <Icon size={15} weight="bold" style={{ color: habit.color }} />
      </div>

      <div className="flex-1 min-w-0">
        <div className={cn('text-[13.5px] font-semibold truncate', done ? 'text-[#5a6061] line-through' : 'text-[#1F3649]')}>
          {habit.name}
        </div>
        {habit.kind === 'quantity' && habit.weekTarget && (
          <div className="text-[11px] text-[#5a6061] font-medium mt-0.5">
            {habit.weekProgress} / {habit.weekTarget} {habit.unit} this week
          </div>
        )}
      </div>

      <StreakBadge n={habit.streak} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Streak heatmap — 12 weeks × 7 days
// ---------------------------------------------------------------------------

function StreakHeatmap({ habits }: { habits: Habit[] }) {
  const [selected, setSelected] = useState<string>('all')

  // Aggregate across all, or single habit
  const data = useMemo(() => {
    if (selected === 'all') {
      const out: number[] = []
      for (let i = 0; i < 84; i++) {
        const dayValues = habits.map(h => h.history[i])
        const doneCount = dayValues.filter(v => v === 2).length
        const partialCount = dayValues.filter(v => v === 1).length
        const pct = habits.length > 0 ? (doneCount + partialCount * 0.5) / habits.length : 0
        out.push(pct >= 0.85 ? 4 : pct >= 0.6 ? 3 : pct >= 0.35 ? 2 : pct > 0 ? 1 : 0)
      }
      return out
    }
    const h = habits.find(x => x.id === selected)
    if (!h) return []
    return h.history.map(v => v === 2 ? 4 : v === 1 ? 2 : 0)
  }, [selected, habits])

  const colorFor = (v: number, accent: string) => {
    if (v === 0) return '#f2f4f4'
    if (v === 1) return `${accent}22`
    if (v === 2) return `${accent}55`
    if (v === 3) return `${accent}99`
    return accent
  }
  const accent = selected === 'all' ? '#1F3649' : (habits.find(x => x.id === selected)?.color ?? '#1F3649')

  // Build columns of 7 (weeks)
  const weeks: number[][] = []
  for (let w = 0; w < 12; w++) {
    weeks.push(data.slice(w * 7, w * 7 + 7))
  }

  const monthLabels = ['Aug', '', '', '', 'Sep', '', '', '', 'Oct', '', '', 'Nov']

  return (
    <div className="card bg-white p-5">
      {/* Filter pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-3 -mx-1 px-1">
        <button
          onClick={() => setSelected('all')}
          className={cn(
            'px-3 py-1.5 text-[11.5px] font-bold rounded-full whitespace-nowrap transition-all cursor-pointer',
            selected === 'all' ? 'bg-[#1F3649] text-white' : 'bg-[#f2f4f4] text-[#5a6061] hover:text-[#1F3649]'
          )}
        >
          All habits
        </button>
        {habits.map(h => (
          <button
            key={h.id}
            onClick={() => setSelected(h.id)}
            className={cn(
              'px-3 py-1.5 text-[11.5px] font-bold rounded-full whitespace-nowrap transition-all cursor-pointer',
              selected === h.id ? 'text-white' : 'bg-[#f2f4f4] text-[#5a6061] hover:text-[#1F3649]'
            )}
            style={selected === h.id ? { background: h.color } : undefined}
          >
            {h.name}
          </button>
        ))}
      </div>

      {/* Heatmap */}
      <div className="flex gap-3 mt-2">
        {/* Day labels */}
        <div className="flex flex-col gap-[5px] pt-[18px] shrink-0">
          {['M', 'W', 'F'].map((d, i) => (
            <div
              key={d}
              className="text-[9.5px] font-bold text-[#adb3b4]"
              style={{ height: 14, lineHeight: '14px', marginTop: i === 0 ? 0 : 14 }}
            >
              {d}
            </div>
          ))}
        </div>

        <div className="flex-1 min-w-0">
          {/* Month row */}
          <div className="grid gap-[5px] mb-1" style={{ gridTemplateColumns: `repeat(12, 1fr)` }}>
            {monthLabels.map((m, i) => (
              <div key={i} className="text-[9.5px] font-bold text-[#adb3b4] truncate">
                {m}
              </div>
            ))}
          </div>
          {/* Weeks — fill full width */}
          <div className="grid gap-[5px]" style={{ gridTemplateColumns: `repeat(12, 1fr)` }}>
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[5px]">
                {week.map((v, di) => (
                  <div
                    key={di}
                    className="rounded-[3px] w-full aspect-square"
                    style={{ background: colorFor(v, accent) }}
                    title={`Intensity ${v}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1.5 text-[10.5px] font-semibold text-[#adb3b4] mt-3">
        Less
        {[0, 1, 2, 3, 4].map(v => (
          <div key={v} className="rounded-[3px]" style={{ width: 10, height: 10, background: colorFor(v, accent) }} />
        ))}
        More
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Weekly grid — habits × 7 days
// ---------------------------------------------------------------------------

function WeeklyGrid({ habits, weekState, onToggleCell }: {
  habits: Habit[]
  weekState: Record<string, boolean[]>
  onToggleCell: (habitId: string, dayIdx: number) => void
}) {
  return (
    <div className="card bg-white overflow-hidden">
      <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 1.5fr) repeat(7, minmax(0, 1fr)) 80px' }}>
        {/* Header */}
        <div className="px-5 py-3 text-[10.5px] font-bold uppercase tracking-wider text-[#adb3b4]">Habit</div>
        {WEEK_LABELS.map((d, i) => (
          <div
            key={i}
            className={cn(
              'text-center py-3 text-[10.5px] font-bold uppercase tracking-wider',
              i === TODAY_IDX ? 'text-[#1F3649]' : 'text-[#adb3b4]'
            )}
          >
            {d}
          </div>
        ))}
        <div className="text-center py-3 text-[10.5px] font-bold uppercase tracking-wider text-[#adb3b4]">Streak</div>

        {/* Rows */}
        {habits.map((h, rowIdx) => {
          const Icon = h.icon
          const row = weekState[h.id] ?? h.week
          return (
            <div key={h.id} className="contents">
              {/* Habit cell */}
              <div
                className={cn(
                  'flex items-center gap-2.5 px-5 py-3.5 border-t border-[#f2f4f4] min-w-0',
                  rowIdx === 0 && 'border-t-0'
                )}
              >
                <div
                  className="w-7 h-7 rounded-[8px] flex items-center justify-center shrink-0"
                  style={{ background: `${h.color}18` }}
                >
                  <Icon size={13} weight="bold" style={{ color: h.color }} />
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold text-[#1F3649] truncate">{h.name}</div>
                  <div className="text-[10.5px] text-[#adb3b4] font-semibold uppercase tracking-wider">
                    {h.cadence === 'daily' ? 'Daily' : h.cadence === 'weekdays' ? 'Mon–Fri' : 'Weekly'}
                  </div>
                </div>
              </div>

              {/* Day cells */}
              {row.map((done, di) => {
                const isToday = di === TODAY_IDX
                const isFuture = di > TODAY_IDX
                return (
                  <div
                    key={di}
                    className={cn(
                      'flex items-center justify-center border-t border-[#f2f4f4]',
                      rowIdx === 0 && 'border-t-0',
                      isToday && 'bg-[#1F3649]/[0.03]'
                    )}
                  >
                    <button
                      disabled={isFuture}
                      onClick={() => onToggleCell(h.id, di)}
                      className={cn(
                        'w-7 h-7 rounded-full flex items-center justify-center transition-all',
                        isFuture ? 'cursor-default' : 'cursor-pointer hover:scale-110'
                      )}
                      style={done ? { background: h.color } : { background: isFuture ? 'transparent' : '#f2f4f4' }}
                    >
                      {done && <CheckCircle size={14} weight="fill" className="text-white" />}
                      {!done && !isFuture && <Circle size={14} className="text-[#ebeeef]" weight="bold" />}
                    </button>
                  </div>
                )
              })}

              {/* Streak cell */}
              <div
                className={cn(
                  'flex items-center justify-center border-t border-[#f2f4f4]',
                  rowIdx === 0 && 'border-t-0'
                )}
              >
                <StreakBadge n={h.streak} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Ritual stacks — chained habits
// ---------------------------------------------------------------------------

function RitualStack({
  title,
  icon: IconC,
  accent,
  habits,
  state,
  onToggle,
}: {
  title: string
  icon: typeof Sun
  accent: string
  habits: Habit[]
  state: Record<string, boolean>
  onToggle: (id: string) => void
}) {
  const done = habits.filter(h => state[h.id]).length
  const total = habits.length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div className="card bg-white p-5 relative overflow-hidden">
      {/* Accent wedge */}
      <div
        className="absolute top-0 right-0 w-24 h-24 opacity-10 rounded-full blur-2xl"
        style={{ background: accent }}
      />

      <div className="flex items-start justify-between mb-4 relative">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-[11px] flex items-center justify-center"
            style={{ background: `${accent}18` }}
          >
            <IconC size={18} weight="bold" style={{ color: accent }} />
          </div>
          <div>
            <div className="text-[14px] font-bold text-[#1F3649] tracking-tight">{title}</div>
            <div className="text-[11px] font-semibold text-[#5a6061]">
              {done} of {total} done
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[18px] font-black tracking-tight" style={{ color: accent }}>{pct}%</div>
        </div>
      </div>

      {/* Chain */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[13px] top-3 bottom-3 w-[2px] bg-[#f2f4f4]" />
        <div className="space-y-1.5 relative">
          {habits.map((h, i) => {
            const isDone = !!state[h.id]
            const prevDone = i === 0 ? true : !!state[habits[i - 1].id]
            const Icon = h.icon
            return (
              <button
                key={h.id}
                onClick={() => onToggle(h.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-2 py-2 rounded-[10px] transition-all cursor-pointer text-left',
                  !prevDone && !isDone && 'opacity-55',
                  'hover:bg-[#f2f4f4]/50'
                )}
              >
                {/* Step dot */}
                <div
                  className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 transition-all',
                    isDone ? 'border-transparent' : 'border-[#f2f4f4] bg-white'
                  )}
                  style={isDone ? { background: accent } : undefined}
                >
                  {isDone
                    ? <CheckCircle size={14} weight="fill" className="text-white" />
                    : <Icon size={12} weight="bold" style={{ color: h.color }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={cn('text-[13px] font-semibold truncate', isDone ? 'text-[#5a6061] line-through' : 'text-[#1F3649]')}>
                    {h.name}
                  </div>
                </div>
                <StreakBadge n={h.streak} />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Weekly slider — for quantity habits
// ---------------------------------------------------------------------------

function WeeklySlider({ habit, value, onChange }: {
  habit: Habit
  value: number
  onChange: (v: number) => void
}) {
  if (!habit.weekTarget) return null
  const pct = Math.min(100, Math.round((value / habit.weekTarget) * 100))
  const Icon = habit.icon

  return (
    <div className="card bg-white p-5">
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-9 h-9 rounded-[10px] flex items-center justify-center"
          style={{ background: `${habit.color}18` }}
        >
          <Icon size={16} weight="bold" style={{ color: habit.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13.5px] font-bold text-[#1F3649]">{habit.name}</div>
          <div className="text-[11px] text-[#5a6061] font-semibold">
            {value} / {habit.weekTarget} {habit.unit} this week
          </div>
        </div>
        <div className="text-[20px] font-black tracking-tight" style={{ color: habit.color }}>
          {pct}%
        </div>
      </div>

      {/* Slider track */}
      <div className="relative">
        <input
          type="range"
          min={0}
          max={habit.weekTarget}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="habits-range"
          style={{ ['--accent' as any]: habit.color, ['--pct' as any]: `${pct}%` }}
        />
      </div>

      {/* Segment markers (per day of week) */}
      <div className="grid grid-cols-7 gap-1 mt-3">
        {WEEK_LABELS.map((d, i) => {
          const dayTarget = habit.weekTarget! / 7
          const filled = value >= dayTarget * (i + 1)
          const partial = !filled && value > dayTarget * i
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <div
                className="h-1.5 w-full rounded-full"
                style={{
                  background: filled
                    ? habit.color
                    : partial
                    ? `${habit.color}55`
                    : '#f2f4f4',
                }}
              />
              <span className={cn('text-[9.5px] font-bold', i === TODAY_IDX ? 'text-[#1F3649]' : 'text-[#adb3b4]')}>
                {d}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// New Habit Modal
// ---------------------------------------------------------------------------

const COLOR_PRESETS = [
  '#6b63f5', '#8b5cf6', '#3b82f6', '#06b6d4',
  '#22c55e', '#16a34a', '#f59e0b', '#ca8a04',
  '#f97316', '#ec4899', '#9f403d', '#1F3649',
]

const ICON_NAMES = Object.keys(ICON_MAP)

function NewHabitModal({ onClose, onSave }: {
  onClose: () => void
  onSave: (fields: NewHabitFields) => void
}) {
  const [name, setName] = useState('')
  const [iconName, setIconName] = useState('Flame')
  const [color, setColor] = useState('#6b63f5')
  const [cadence, setCadence] = useState<'daily' | 'weekdays' | 'weekly'>('daily')
  const [kind, setKind] = useState<'binary' | 'quantity'>('binary')
  const [stack, setStack] = useState<'morning' | 'evening' | ''>('')
  const [unit, setUnit] = useState('')
  const [weekTarget, setWeekTarget] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    setError(null)
    const fields: NewHabitFields = {
      name: name.trim(),
      iconName,
      color,
      cadence,
      kind,
      stack: stack || undefined,
      unit: kind === 'quantity' && unit.trim() ? unit.trim() : undefined,
      weekTarget: kind === 'quantity' && weekTarget ? Number(weekTarget) : undefined,
    }
    try {
      await onSave(fields)
      onClose()
    } catch (e: any) {
      setError(e?.message ?? 'Failed to save habit')
      setSaving(false)
    }
  }

  const SelectedIcon = ICON_MAP[iconName]

  const pill = (active: boolean) =>
    cn(
      'px-3 py-1.5 text-[12px] font-bold rounded-full cursor-pointer transition-all',
      active ? 'bg-[#1F3649] text-white' : 'bg-[#f2f4f4] text-[#5a6061] hover:text-[#1F3649]'
    )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div
        className="bg-white rounded-[20px] shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#f2f4f4]">
          <h2 className="text-[17px] font-black tracking-tight text-[#1F3649]">New habit</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f2f4f4] flex items-center justify-center text-[#5a6061] hover:text-[#1F3649] cursor-pointer transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Name */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#adb3b4] mb-1.5 block">
              Name
            </label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Morning run"
              className="w-full px-4 py-2.5 rounded-[12px] border border-[#ECEFF2] text-[14px] font-semibold text-[#1F3649] placeholder:text-[#adb3b4] focus:outline-none focus:border-[#1F3649] transition-colors"
            />
          </div>

          {/* Icon + color row */}
          <div className="flex gap-4">
            {/* Preview */}
            <div
              className="w-14 h-14 rounded-[14px] flex items-center justify-center shrink-0"
              style={{ background: `${color}18` }}
            >
              {SelectedIcon && <SelectedIcon size={26} weight="bold" style={{ color }} />}
            </div>

            <div className="flex-1 space-y-2 min-w-0">
              {/* Color presets */}
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#adb3b4] block">Color</label>
              <div className="flex flex-wrap gap-1.5">
                {COLOR_PRESETS.map(c => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={cn(
                      'w-6 h-6 rounded-full cursor-pointer transition-all',
                      color === c ? 'ring-2 ring-offset-1 ring-[#1F3649] scale-110' : 'hover:scale-105'
                    )}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Icon picker */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#adb3b4] mb-1.5 block">Icon</label>
            <div className="grid grid-cols-10 gap-1.5">
              {ICON_NAMES.map(name => {
                const Icon = ICON_MAP[name]
                return (
                  <button
                    key={name}
                    onClick={() => setIconName(name)}
                    className={cn(
                      'w-9 h-9 rounded-[9px] flex items-center justify-center cursor-pointer transition-all',
                      iconName === name ? 'text-white' : 'bg-[#f2f4f4] text-[#5a6061] hover:text-[#1F3649]'
                    )}
                    style={iconName === name ? { background: color } : undefined}
                    title={name}
                  >
                    <Icon size={16} weight="bold" />
                  </button>
                )
              })}
            </div>
          </div>

          {/* Cadence */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#adb3b4] mb-1.5 block">Frequency</label>
            <div className="flex gap-2 flex-wrap">
              {(['daily', 'weekdays', 'weekly'] as const).map(c => (
                <button key={c} onClick={() => setCadence(c)} className={pill(cadence === c)}>
                  {c === 'daily' ? 'Every day' : c === 'weekdays' ? 'Mon – Fri' : 'Weekly'}
                </button>
              ))}
            </div>
          </div>

          {/* Kind */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#adb3b4] mb-1.5 block">Tracking</label>
            <div className="flex gap-2">
              <button onClick={() => setKind('binary')} className={pill(kind === 'binary')}>Done / not done</button>
              <button onClick={() => setKind('quantity')} className={pill(kind === 'quantity')}>Amount</button>
            </div>
          </div>

          {/* Quantity fields */}
          {kind === 'quantity' && (
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#adb3b4] mb-1.5 block">Unit</label>
                <input
                  type="text"
                  value={unit}
                  onChange={e => setUnit(e.target.value)}
                  placeholder="glasses, pages…"
                  className="w-full px-3 py-2 rounded-[10px] border border-[#ECEFF2] text-[13px] font-semibold text-[#1F3649] placeholder:text-[#adb3b4] focus:outline-none focus:border-[#1F3649] transition-colors"
                />
              </div>
              <div className="w-28">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#adb3b4] mb-1.5 block">Weekly goal</label>
                <input
                  type="number"
                  min={1}
                  value={weekTarget}
                  onChange={e => setWeekTarget(e.target.value)}
                  placeholder="56"
                  className="w-full px-3 py-2 rounded-[10px] border border-[#ECEFF2] text-[13px] font-semibold text-[#1F3649] placeholder:text-[#adb3b4] focus:outline-none focus:border-[#1F3649] transition-colors"
                />
              </div>
            </div>
          )}

          {/* Stack */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#adb3b4] mb-1.5 block">Ritual stack</label>
            <div className="flex gap-2 flex-wrap">
              {([['', 'None'], ['morning', 'Morning'], ['evening', 'Evening']] as const).map(([val, label]) => (
                <button key={val} onClick={() => setStack(val)} className={pill(stack === val)}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 space-y-3">
          {error && (
            <p className="text-[12px] font-semibold text-red-500 bg-red-50 rounded-[10px] px-3 py-2">{error}</p>
          )}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-[12px] border border-[#ECEFF2] text-[13px] font-bold text-[#5a6061] hover:text-[#1F3649] cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!name.trim() || saving}
              className="flex-1 py-2.5 rounded-[12px] bg-[#1F3649] text-white text-[13px] font-bold cursor-pointer hover:bg-[#1a2740] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving…' : 'Add habit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function Habits() {
  const { habits, loading, fetchHabits, createHabit, deleteHabit, toggleCompletion, setQuantity } = useHabitsStore()
  const { user } = useAuthStore()
  const [showNewHabit, setShowNewHabit] = useState(false)

  const todayStr = new Date().toISOString().split('T')[0]

  // Monday of the current week — used to compute date strings for each day cell
  const getMondayOffset = (dayIdx: number): string => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const d = new Date(today)
    d.setDate(today.getDate() + mondayOffset + dayIdx)
    return d.toISOString().split('T')[0]
  }

  useEffect(() => {
    if (user?.id) fetchHabits(user.id)
  }, [user?.id])

  // Local UI state — synced when habits first load from DB
  const [todayState, setTodayState] = useState<Record<string, boolean>>({})
  const [weekState, setWeekState] = useState<Record<string, boolean[]>>({})
  const [qtyState, setQtyState] = useState<Record<string, number>>({})

  // Re-initialize local state when the habit list arrives
  const habitIds = habits.map(h => h.id).join(',')
  useEffect(() => {
    if (!habits.length) return
    setTodayState(Object.fromEntries(habits.map(h => [h.id, h.week[TODAY_IDX]])))
    setWeekState(Object.fromEntries(habits.map(h => [h.id, [...h.week]])))
    setQtyState(Object.fromEntries(
      habits.filter(h => h.kind === 'quantity').map(h => [h.id, h.weekProgress ?? 0])
    ))
  }, [habitIds])

  const toggleToday = (id: string) => {
    const newDone = !todayState[id]
    setTodayState(s => ({ ...s, [id]: newDone }))
    setWeekState(s => {
      const row = [...(s[id] ?? [])]
      row[TODAY_IDX] = newDone
      return { ...s, [id]: row }
    })
    toggleCompletion(id, todayStr, newDone)
  }

  const toggleCell = (id: string, di: number) =>
    setWeekState(s => {
      const row = [...(s[id] ?? [])]
      row[di] = !row[di]
      if (di === TODAY_IDX) setTodayState(t => ({ ...t, [id]: row[di] }))
      toggleCompletion(id, getMondayOffset(di), row[di])
      return { ...s, [id]: row }
    })

  const todayHabits = habits.filter(h =>
    h.cadence === 'daily' || (h.cadence === 'weekdays' && TODAY_IDX < 5)
  )
  const todayDone = todayHabits.filter(h => todayState[h.id]).length
  const todayTotal = todayHabits.length

  const morningHabits = habits.filter(h => h.stack === 'morning')
  const eveningHabits = habits.filter(h => h.stack === 'evening')
  const quantityHabits = habits.filter(h => h.kind === 'quantity')

  if (loading && !habits.length) {
    return (
      <div className="flex items-center justify-center h-64 text-[#5a6061] text-sm font-semibold">
        Loading habits…
      </div>
    )
  }

  return (
    <div className="pb-20">
      {/* Slider CSS */}
      <style>{`
        .habits-range {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 8px;
          border-radius: 999px;
          background: linear-gradient(to right, var(--accent) 0%, var(--accent) var(--pct), #f2f4f4 var(--pct), #f2f4f4 100%);
          outline: none;
          cursor: pointer;
        }
        .habits-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #fff;
          border: 3px solid var(--accent);
          box-shadow: 0 2px 6px rgba(7,33,51,0.15);
          cursor: grab;
        }
        .habits-range::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #fff;
          border: 3px solid var(--accent);
          box-shadow: 0 2px 6px rgba(7,33,51,0.15);
          cursor: grab;
        }
      `}</style>

      {/* Page header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[26px] font-black tracking-tight text-[#1F3649] leading-tight">
            Habits
          </h1>
          <p className="text-[13px] text-[#5a6061] mt-1">
            Small, repeatable actions you're building into the person you want to become.
          </p>
        </div>
        <button
          onClick={() => setShowNewHabit(true)}
          className="inline-flex items-center gap-1.5 bg-[#1F3649] hover:bg-[#1a2740] text-white text-[13px] font-semibold px-4 py-2.5 rounded-[12px] transition-all cursor-pointer shrink-0"
        >
          <Plus size={14} weight="bold" />
          New habit
        </button>
      </div>

      {/* Stats strip */}
      <HeroStrip habits={habits} todayDone={todayDone} todayTotal={todayTotal} />

      {/* Three-column: Today list + Morning stack + Evening stack */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <Section
          title="Today"
          subtitle={`${todayDone} of ${todayTotal} done so far`}
          right={
            <button className="text-[11.5px] font-bold text-[#5a6061] hover:text-[#1F3649] inline-flex items-center gap-1 cursor-pointer">
              Edit order <DotsSixVertical size={12} weight="bold" />
            </button>
          }
        >
          <div className="space-y-2">
            {todayHabits.map(h => (
              <TodayRow
                key={h.id}
                habit={h}
                done={!!todayState[h.id]}
                onToggle={() => toggleToday(h.id)}
              />
            ))}
          </div>
        </Section>

        <Section title="Morning stack" subtitle="Do them in order — they compound">
          <RitualStack
            title="Morning stack"
            icon={Sun}
            accent="#f59e0b"
            habits={morningHabits}
            state={todayState}
            onToggle={toggleToday}
          />
        </Section>

        <Section title="Evening wind-down" subtitle="Close the day with intention">
          <RitualStack
            title="Evening wind-down"
            icon={Moon}
            accent="#6b63f5"
            habits={eveningHabits}
            state={todayState}
            onToggle={toggleToday}
          />
        </Section>
      </div>

      {/* Weekly grid */}
      <Section
        title="This week"
        subtitle="Tap any cell to mark a habit done for that day"
        right={
          <div className="flex items-center gap-1.5 bg-[#f2f4f4] p-1 rounded-[10px]">
            <button className="px-3 py-1 text-[11px] font-bold rounded-[7px] bg-white text-[#1F3649] shadow-sm cursor-pointer">
              This week
            </button>
            <button className="px-3 py-1 text-[11px] font-bold rounded-[7px] text-[#5a6061] hover:text-[#1F3649] cursor-pointer">
              Last week
            </button>
          </div>
        }
      >
        <WeeklyGrid habits={habits} weekState={weekState} onToggleCell={toggleCell} />
      </Section>

      {/* Weekly sliders — quantity habits */}
      <Section
        title="Weekly targets"
        subtitle="Habits tracked by amount — drag to log, daily marks show pace"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quantityHabits.map(h => (
            <WeeklySlider
              key={h.id}
              habit={h}
              value={qtyState[h.id] ?? 0}
              onChange={v => {
                setQtyState(s => ({ ...s, [h.id]: v }))
                setQuantity(h.id, todayStr, v)
              }}
            />
          ))}
        </div>
      </Section>

      {/* All habits list — footer */}
      <Section
        title="All habits"
        subtitle="Manage cadence, reminders, and retirement"
      >
        <div className="card bg-white overflow-hidden">
          {habits.map((h, i) => {
            const Icon = h.icon
            return (
              <div
                key={h.id}
                className={cn(
                  'flex items-center gap-3 px-5 py-3.5 cursor-pointer hover:bg-[#f2f4f4]/40 transition-colors',
                  i !== 0 && 'border-t border-[#f2f4f4]'
                )}
              >
                <div
                  className="w-8 h-8 rounded-[9px] flex items-center justify-center shrink-0"
                  style={{ background: `${h.color}18` }}
                >
                  <Icon size={14} weight="bold" style={{ color: h.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-semibold text-[#1F3649] truncate">{h.name}</div>
                  <div className="text-[11px] text-[#5a6061] font-medium">
                    {h.cadence === 'daily' ? 'Every day' : h.cadence === 'weekdays' ? 'Weekdays' : 'Weekly'}
                    {h.kind === 'quantity' && ` · ${h.weekTarget} ${h.unit}/wk`}
                  </div>
                </div>
                <StreakBadge n={h.streak} />
                <div className="text-[11px] font-semibold text-[#adb3b4] w-16 text-right hidden md:block">
                  Best {h.bestStreak}
                </div>
                <button
                  onClick={e => { e.stopPropagation(); deleteHabit(h.id) }}
                  className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-[#ebeeef] hover:text-red-400 hover:bg-red-50 transition-colors cursor-pointer"
                  aria-label="Delete habit"
                >
                  <Trash size={14} weight="bold" />
                </button>
              </div>
            )
          })}
        </div>
      </Section>

      {showNewHabit && (
        <NewHabitModal
          onClose={() => setShowNewHabit(false)}
          onSave={fields => createHabit(user?.id ?? '', fields)}
        />
      )}
    </div>
  )
}
