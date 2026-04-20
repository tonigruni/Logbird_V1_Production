import { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CaretDown, Plus, Square, CheckSquare, MagnifyingGlass, Trophy } from '@phosphor-icons/react'
import type { Goal, Task, WheelCategory } from '../stores/wheelStore'
import { useWheelStore } from '../stores/wheelStore'
import { useAuthStore } from '../stores/authStore'
import { cn } from '../lib/utils'

// ─── Category color map (WheelCategory has no color field) ──────────────────
const CATEGORY_COLORS: Record<string, string> = {
  'Health':               '#22c55e',
  'Career':               '#3b82f6',
  'Finance':              '#f59e0b',
  'Relationships':        '#ec4899',
  'Personal Growth':      '#8b5cf6',
  'Fun':                  '#f97316',
  'Physical Environment': '#06b6d4',
  'Family/Friends':       '#f43f5e',
}

function categoryColor(name: string | null | undefined): string {
  return name ? (CATEGORY_COLORS[name] ?? '#1F3649') : '#1F3649'
}

// ─── Tree builder ────────────────────────────────────────────────────────────
function buildTree(goals: Goal[]): Map<string | null, Goal[]> {
  const map = new Map<string | null, Goal[]>()
  for (const g of goals) {
    const key = g.parent_id ?? null
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(g)
  }
  return map
}

// ─── Recursive progress ──────────────────────────────────────────────────────
function calcProgress(goalId: string, tree: Map<string | null, Goal[]>, tasks: Task[]): number {
  const children = tree.get(goalId) ?? []
  const myTasks  = tasks.filter(t => t.goal_id === goalId)
  if (children.length === 0 && myTasks.length === 0) return 0
  if (children.length === 0) {
    return Math.round(myTasks.filter(t => t.completed).length / myTasks.length * 100)
  }
  const scores = children.map(c => calcProgress(c.id, tree, tasks))
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
}

// ─── Date helpers ────────────────────────────────────────────────────────────
function quarterLabel(d: string | null): string {
  if (!d) return ''
  const date = new Date(d)
  const q = Math.floor(date.getMonth() / 3) + 1
  const ranges = ['JAN–MAR', 'APR–JUN', 'JUL–SEP', 'OCT–DEC']
  return `Q${q} · ${ranges[q - 1]}`
}

function monthInitial(d: string | null): string {
  return d ? new Date(d).toLocaleString('en-US', { month: 'long' })[0] : '?'
}

function monthFull(d: string | null): string {
  return d ? new Date(d).toLocaleString('en-US', { month: 'long' }).toUpperCase() : ''
}

function statusBadge(s: string) {
  const m: Record<string, { label: string; fg: string; bg: string }> = {
    active:    { label: 'ON TRACK',  fg: '#16a34a', bg: '#dcfce7' },
    completed: { label: 'DONE',      fg: '#0891b2', bg: '#cffafe' },
    paused:    { label: 'PAUSED',    fg: '#d97706', bg: '#fef3c7' },
    abandoned: { label: 'OFF TRACK', fg: '#dc2626', bg: '#fee2e2' },
  }
  return m[s] ?? { label: s.toUpperCase(), fg: '#6b7280', bg: '#f3f4f6' }
}

function weekLabel(due: string | null): 'this' | 'next' | 'other' {
  if (!due) return 'other'
  const d   = new Date(due)
  const now = new Date()
  const dow = now.getDay()
  const mon = new Date(now)
  mon.setDate(now.getDate() - ((dow + 6) % 7))
  mon.setHours(0, 0, 0, 0)
  const nmon  = new Date(mon); nmon.setDate(mon.getDate() + 7)
  const nnmon = new Date(mon); nnmon.setDate(mon.getDate() + 14)
  if (d >= mon  && d < nmon)  return 'this'
  if (d >= nmon && d < nnmon) return 'next'
  return 'other'
}

function formatDue(due: string, wl: 'this' | 'next' | 'other'): string {
  const d = new Date(due)
  if (wl === 'this') return d.toLocaleDateString('en-US', { weekday: 'short' })
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ─── Quarter picker ──────────────────────────────────────────────────────────
function QuarterPicker({ goal }: { goal: Goal }) {
  const { updateGoal } = useWheelStore()
  const year = goal.target_date ? new Date(goal.target_date).getFullYear() : new Date().getFullYear()
  const currentQ = goal.target_date ? Math.floor(new Date(goal.target_date).getMonth() / 3) + 1 : 0
  return (
    <select
      value={currentQ || ''}
      onChange={e => {
        e.stopPropagation()
        const q = parseInt(e.target.value)
        if (!q) return
        const d = new Date(year, (q - 1) * 3, 1)
        updateGoal(goal.id, { target_date: d.toISOString().split('T')[0] })
      }}
      onClick={e => e.stopPropagation()}
      className="text-[10px] font-bold text-[#1F3649] bg-[#ebeeef] rounded-lg px-2 py-1 border-none outline-none cursor-pointer flex-shrink-0 appearance-none"
    >
      <option value="">Q?</option>
      {[1,2,3,4].map(q => <option key={q} value={q}>Q{q}</option>)}
    </select>
  )
}

// ─── Month picker ─────────────────────────────────────────────────────────────
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
function MonthPicker({ goal }: { goal: Goal }) {
  const { updateGoal } = useWheelStore()
  const year = goal.target_date ? new Date(goal.target_date).getFullYear() : new Date().getFullYear()
  const currentM = goal.target_date ? new Date(goal.target_date).getMonth() + 1 : 0
  return (
    <select
      value={currentM || ''}
      onChange={e => {
        e.stopPropagation()
        const m = parseInt(e.target.value)
        if (!m) return
        const d = new Date(year, m - 1, 1)
        updateGoal(goal.id, { target_date: d.toISOString().split('T')[0] })
      }}
      onClick={e => e.stopPropagation()}
      className="text-[10px] font-bold text-[#1F3649] bg-[#ebeeef] rounded-full px-2 py-1 border-none outline-none cursor-pointer flex-shrink-0 appearance-none"
    >
      <option value="">?</option>
      {MONTHS.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
    </select>
  )
}

// ─── Reviewed / Achieved toggles ──────────────────────────────────────────────
function GoalToggles({ goal }: { goal: Goal }) {
  const { updateGoal } = useWheelStore()
  return (
    <div className="flex items-center gap-3 flex-shrink-0" onClick={e => e.stopPropagation()}>
      <button
        onClick={() => updateGoal(goal.id, { reviewed: !goal.reviewed })}
        className="flex items-center gap-1 text-[#adb3b4] hover:text-[#2a4a63] transition-colors cursor-pointer"
        title="Reviewed"
      >
        <MagnifyingGlass size={12} />
        {goal.reviewed
          ? <CheckSquare size={14} weight="fill" className="text-[#1F3649]" />
          : <Square size={14} />}
      </button>
      <button
        onClick={() => updateGoal(goal.id, { achieved: !goal.achieved })}
        className="flex items-center gap-1 text-[#adb3b4] hover:text-[#2a4a63] transition-colors cursor-pointer"
        title="Achieved"
      >
        <Trophy size={12} className={goal.achieved ? 'text-[#f59e0b]' : ''} />
        {goal.achieved
          ? <CheckSquare size={14} weight="fill" className="text-[#1F3649]" />
          : <Square size={14} />}
      </button>
    </div>
  )
}

// ─── Circular progress ring ──────────────────────────────────────────────────
function ProgressRing({ value, size = 60 }: { value: number; size?: number }) {
  const stroke = 5
  const r  = (size - stroke) / 2
  const c  = 2 * Math.PI * r
  const cx = size / 2
  const cy = size / 2
  const d  = Math.max(0, Math.min(1, value / 100)) * c
  return (
    <svg width={size} height={size} className="flex-shrink-0">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#ebeeef" strokeWidth={stroke} />
      <circle
        cx={cx} cy={cy} r={r} fill="none" stroke="#1F3649" strokeWidth={stroke}
        strokeDasharray={`${d} ${c - d}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: 'stroke-dasharray 0.4s' }}
      />
      <text
        x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
        fontSize={size < 50 ? 11 : 13} fontWeight="700" fill="#1F3649"
        style={{ userSelect: 'none' }}
      >
        {value}
      </text>
    </svg>
  )
}

// ─── Inline add input ────────────────────────────────────────────────────────
function AddInline({ label, onAdd, indent = 20 }: {
  label: string
  onAdd: (title: string) => Promise<void>
  indent?: number
}) {
  const [open, setOpen] = useState(false)
  const [val,  setVal]  = useState('')
  const [busy, setBusy] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (open) inputRef.current?.focus() }, [open])

  const submit = async () => {
    if (!val.trim() || busy) return
    setBusy(true)
    try { await onAdd(val.trim()) } finally { setBusy(false) }
    setVal('')
    setOpen(false)
  }

  if (!open) {
    return (
      <button
        onClick={e => { e.stopPropagation(); setOpen(true) }}
        className="flex items-center gap-1.5 text-[11px] text-[#adb3b4] hover:text-[#2a4a63] py-2 transition-colors"
        style={{ paddingLeft: indent }}
      >
        <Plus size={11} weight="bold" /> {label}
      </button>
    )
  }

  return (
    <div
      className="flex items-center gap-2 py-2 border-t border-[#ebeeef]"
      style={{ paddingLeft: indent, paddingRight: 20 }}
    >
      <input
        ref={inputRef}
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') submit()
          if (e.key === 'Escape') { setOpen(false); setVal('') }
        }}
        onBlur={() => { if (!val.trim()) setOpen(false) }}
        placeholder={`Add ${label.toLowerCase()}…`}
        className="flex-1 text-sm border-b border-[#1F3649] outline-none text-[#1F3649] placeholder-[#adb3b4] py-1 bg-transparent"
        disabled={busy}
      />
      {val.trim() && (
        <button onClick={submit} disabled={busy} className="text-[11px] font-semibold text-[#1F3649]">
          {busy ? '…' : 'Add'}
        </button>
      )}
    </div>
  )
}

// ─── Task row (leaf) ─────────────────────────────────────────────────────────
function TaskRow({ task }: { task: Task }) {
  const { toggleTask } = useWheelStore()
  const wl = weekLabel(task.due_date)

  return (
    <div
      className="flex items-center gap-3 py-2.5 hover:bg-[#f2f4f4] group"
      style={{ paddingLeft: 60, paddingRight: 20 }}
    >
      <button
        onClick={() => toggleTask(task.id, !task.completed)}
        className="flex-shrink-0 text-[#adb3b4] hover:text-[#2a4a63] transition-colors"
      >
        {task.completed
          ? <CheckSquare size={16} weight="fill" className="text-[#1F3649]" />
          : <Square size={16} />}
      </button>

      <div className="flex-1 min-w-0">
        {wl !== 'other' && (
          <div className="flex items-center gap-1 mb-0.5">
            <span className={cn(
              'text-[10px] font-bold uppercase tracking-wide',
              wl === 'this' ? 'text-[#1F3649]' : 'text-[#adb3b4]'
            )}>
              {wl === 'this' ? 'THIS WEEK' : 'NEXT WEEK'}
            </span>
            {wl === 'this' && <span className="w-1.5 h-1.5 rounded-full bg-[#1F3649] inline-block" />}
          </div>
        )}
        <span className={cn(
          'text-sm',
          task.completed ? 'line-through text-[#adb3b4]' : 'text-[#1F3649]'
        )}>
          {task.title}
        </span>
      </div>

      {task.due_date && (
        <span className="text-[11px] text-[#adb3b4] flex-shrink-0">
          {formatDue(task.due_date, wl)}
        </span>
      )}
    </div>
  )
}

// ─── Month goal row ──────────────────────────────────────────────────────────
function MonthGoalRow({ goal, tree, tasks, isLast, userId }: {
  goal: Goal
  tree: Map<string | null, Goal[]>
  tasks: Task[]
  isLast: boolean
  userId: string | null
}) {
  const [expanded, setExpanded] = useState(true)
  const { createTask } = useWheelStore()
  const navigate = useNavigate()

  const children  = tree.get(goal.id) ?? []
  const myTasks   = tasks.filter(t => t.goal_id === goal.id)
  const hasItems  = children.length > 0 || myTasks.length > 0
  const progress  = calcProgress(goal.id, tree, tasks)
  const initial   = monthInitial(goal.target_date)
  const monthName = monthFull(goal.target_date)

  return (
    <div className={cn(!isLast && 'border-b border-[#ebeeef]')}>
      <div
        className="flex items-center gap-3 py-3 hover:bg-[#f2f4f4] cursor-pointer"
        style={{ paddingLeft: 40, paddingRight: 20 }}
        onClick={() => hasItems ? setExpanded(v => !v) : navigate(`/goals/${goal.id}`)}
      >
        <MonthPicker goal={goal} />

        <div
          className="flex-1 min-w-0 text-sm font-medium text-[#1F3649] hover:text-[#2a4a63] truncate"
          onClick={e => { e.stopPropagation(); navigate(`/goals/${goal.id}`) }}
        >
          {goal.title}
        </div>

        <GoalToggles goal={goal} />

        <span className="text-xs font-medium text-[#5a6061] flex-shrink-0 w-8 text-right">{progress}%</span>

        {hasItems && (
          <CaretDown
            size={13}
            className={cn('text-[#adb3b4] transition-transform flex-shrink-0', !expanded && '-rotate-90')}
          />
        )}
      </div>

      {expanded && (
        <>
          {myTasks.map(t => <TaskRow key={t.id} task={t} />)}
          {children.map((c, i) => (
            <MonthGoalRow
              key={c.id} goal={c} tree={tree} tasks={tasks}
              isLast={i === children.length - 1} userId={userId}
            />
          ))}
          {userId && (
            <AddInline
              label="Add task"
              indent={60}
              onAdd={async (title) => {
                await createTask({
                  user_id: userId,
                  goal_id: goal.id,
                  title,
                  completed: false,
                  priority: 'normal',
                  energy: 2,
                  estimated_minutes: null,
                  due_date: null,
                  category_id: goal.category_id,
                  project_id: goal.project_id,
                })
              }}
            />
          )}
        </>
      )}
    </div>
  )
}

// ─── Quarter goal row ────────────────────────────────────────────────────────
function QuarterGoalRow({ goal, tree, tasks, isLast, userId }: {
  goal: Goal
  tree: Map<string | null, Goal[]>
  tasks: Task[]
  isLast: boolean
  userId: string | null
}) {
  const [expanded, setExpanded] = useState(true)
  const { createGoal } = useWheelStore()
  const navigate = useNavigate()

  const children = tree.get(goal.id) ?? []
  const progress = calcProgress(goal.id, tree, tasks)
  const qLabel   = quarterLabel(goal.target_date)
  const badge    = statusBadge(goal.status)

  return (
    <div className={cn(!isLast && 'border-b border-[#ebeeef]')}>
      <div
        className="flex items-center gap-3 py-3.5 hover:bg-[#f2f4f4] cursor-pointer"
        style={{ paddingLeft: 20, paddingRight: 20 }}
        onClick={() => setExpanded(v => !v)}
      >
        <QuarterPicker goal={goal} />

        <div
          className="flex-1 min-w-0 text-sm font-medium text-[#1F3649] truncate hover:text-[#2a4a63]"
          onClick={e => { e.stopPropagation(); navigate(`/goals/${goal.id}`) }}
        >
          {goal.title}
        </div>

        <GoalToggles goal={goal} />

        <span className="text-sm font-semibold text-[#1F3649] flex-shrink-0 w-8 text-right">{progress}%</span>
        <CaretDown
          size={14}
          className={cn('text-[#adb3b4] transition-transform flex-shrink-0', !expanded && '-rotate-90')}
        />
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-[#ebeeef]" style={{ marginLeft: 20, marginRight: 20 }}>
        <div
          className="h-full bg-[#1F3649] transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      {expanded && (
        <div>
          {children.map((c, i) => (
            <MonthGoalRow
              key={c.id} goal={c} tree={tree} tasks={tasks}
              isLast={i === children.length - 1} userId={userId}
            />
          ))}
          {userId && (
            <AddInline
              label="Add month goal"
              indent={40}
              onAdd={async (title) => {
                const d = new Date()
                d.setMonth(d.getMonth() + 1, 1)
                await createGoal({
                  user_id: userId,
                  parent_id: goal.id,
                  timeframe: 'month',
                  title,
                  status: 'active',
                  category_id: goal.category_id,
                  category_ids: goal.category_ids,
                  project_id: goal.project_id,
                  description: null,
                  target_date: d.toISOString().split('T')[0],
                  cover_url: null,
                  outcome_metric: null,
                  success_criteria: null,
                  effort_frequency: null,
                  effort_minutes_per_session: null,
                  milestones: null,
                })
              }}
            />
          )}
        </div>
      )}
    </div>
  )
}

// ─── Life goal row (root) ────────────────────────────────────────────────────
function LifeGoalRow({ goal, tree, tasks, categories, userId }: {
  goal: Goal
  tree: Map<string | null, Goal[]>
  tasks: Task[]
  categories: WheelCategory[]
  userId: string | null
}) {
  const [expanded, setExpanded] = useState(true)
  const { createGoal } = useWheelStore()
  const navigate = useNavigate()

  const children = tree.get(goal.id) ?? []
  const progress = calcProgress(goal.id, tree, tasks)
  const catId    = goal.category_ids?.[0] ?? goal.category_id
  const category = categories.find(c => c.id === catId)
  const year     = goal.target_date ? new Date(goal.target_date).getFullYear() : null

  return (
    <div className="rounded-xl border border-[#ebeeef] bg-white overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-[#f2f4f4] transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        <ProgressRing value={progress} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {category && (
              <span
                className="text-[10px] font-bold uppercase tracking-widest"
                style={{ color: categoryColor(category.name) }}
              >
                {category.name}
              </span>
            )}
            {year && <span className="text-[10px] text-[#adb3b4]">{year}</span>}
          </div>
          <div
            className="text-sm font-semibold text-[#1F3649] leading-snug hover:text-[#2a4a63] inline"
            onClick={e => { e.stopPropagation(); navigate(`/goals/${goal.id}`) }}
          >
            {goal.title}
          </div>
          {goal.description && (
            <div className="text-[12px] text-[#5a6061] mt-0.5 truncate">{goal.description}</div>
          )}
        </div>

        <GoalToggles goal={goal} />

        <CaretDown
          size={18}
          className={cn('text-[#adb3b4] transition-transform flex-shrink-0', !expanded && '-rotate-90')}
        />
      </div>

      {expanded && (
        <>
          {children.length > 0 && (
            <div className="border-t border-[#ebeeef]">
              {children.map((c, i) => (
                <QuarterGoalRow
                  key={c.id} goal={c} tree={tree} tasks={tasks}
                  isLast={i === children.length - 1} userId={userId}
                />
              ))}
            </div>
          )}
          <div className={cn(children.length > 0 ? 'border-t border-[#ebeeef]' : '')}>
            {userId && (
              <AddInline
                label="Add quarter goal"
                indent={20}
                onAdd={async (title) => {
                  await createGoal({
                    user_id: userId,
                    parent_id: goal.id,
                    timeframe: 'quarter',
                    title,
                    status: 'active',
                    category_id: goal.category_id,
                    category_ids: goal.category_ids,
                    project_id: goal.project_id,
                    description: null,
                    target_date: null,
                    cover_url: null,
                    outcome_metric: null,
                    success_criteria: null,
                    effort_frequency: null,
                    effort_minutes_per_session: null,
                    milestones: null,
                  })
                }}
              />
            )}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Main export ─────────────────────────────────────────────────────────────
export default function GoalHierarchyView({ goals, tasks, categories }: {
  goals: Goal[]
  tasks: Task[]
  categories: WheelCategory[]
}) {
  const { user } = useAuthStore()
  const tree = useMemo(() => buildTree(goals), [goals])
  const rootGoals = useMemo(() => goals.filter(g => !g.parent_id), [goals])

  if (rootGoals.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-[#adb3b4]">No goals yet. Create your first goal above.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {rootGoals.map(goal => (
        <LifeGoalRow
          key={goal.id}
          goal={goal}
          tree={tree}
          tasks={tasks}
          categories={categories}
          userId={user?.id ?? null}
        />
      ))}
    </div>
  )
}
