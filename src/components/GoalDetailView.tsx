import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Target,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Download,
  CheckCircle2,
  Circle,
  Pencil,
  Calendar,
  Clock,
  Timer,
  Pause,
  Play,
  Square,
  Bold,
  Italic,
  AtSign,
  ThumbsUp,
  Flag,
  User,
  Paperclip,
  Share2,
  Tag,
  Kanban,
  X,
  Image,
  Trash,
} from 'lucide-react'
import ImagePickerModal from './ui/ImagePickerModal'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { useAuthStore } from '../stores/authStore'
import { useWheelStore } from '../stores/wheelStore'
import { useProjectStore } from '../stores/projectStore'
import type { Goal, Task } from '../stores/wheelStore'
import { format } from 'date-fns'
import { cn } from '../lib/utils'

// ---------------------------------------------------------------------------
// Category metadata (mirrors WheelOfLife)
// ---------------------------------------------------------------------------

const CATEGORY_META: Record<string, { color: string; icon: React.ElementType; description: string }> = {
  Health:            { color: '#22c55e', icon: Target, description: 'Physical & mental wellbeing' },
  Career:            { color: '#1F3649', icon: Target, description: 'Professional growth & satisfaction' },
  Finance:           { color: '#f59e0b', icon: Target, description: 'Financial security & freedom' },
  Relationships:     { color: '#ef4444', icon: Target, description: 'Romantic & social connections' },
  'Personal Growth': { color: '#8b5cf6', icon: Target, description: 'Learning & self-improvement' },
  Fun:               { color: '#ec4899', icon: Target, description: 'Recreation & enjoyment' },
  Environment:       { color: '#14b8a6', icon: Target, description: 'Living space & surroundings' },
  'Physical Environment': { color: '#14b8a6', icon: Target, description: 'Living space & surroundings' },
  'Family/Friends':  { color: '#f97316', icon: Target, description: 'Close relationships & community' },
}

const DEFAULT_META = { color: '#6b63f5', icon: Target, description: 'Custom category' }

function getCategoryMeta(name: string) {
  return CATEGORY_META[name] ?? DEFAULT_META
}

// ---------------------------------------------------------------------------
// Score donut (mirrors WheelOfLife)
// ---------------------------------------------------------------------------

function ScoreDonut({ score, maxScore = 10, size = 120, color = '#1F3649' }: {
  score: number; maxScore?: number; size?: number; color?: string
}) {
  const percentage = (score / maxScore) * 100
  const data = [{ value: percentage }, { value: 100 - percentage }]
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data} cx="50%" cy="50%"
            innerRadius={size * 0.33} outerRadius={size * 0.45}
            startAngle={90} endAngle={-270}
            dataKey="value" stroke="none"
          >
            <Cell fill={color} />
            <Cell fill="#f2f4f4" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-bold text-[#1F3649]">
          {score}<span className="text-sm font-normal text-[#5a6061] opacity-60">/{maxScore}</span>
        </span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-goal breakdown helpers
// ---------------------------------------------------------------------------

function quarterLbl(d: string | null): string {
  if (!d) return ''
  const date = new Date(d)
  const q = Math.floor(date.getMonth() / 3) + 1
  return `Q${q} · ${(['JAN–MAR','APR–JUN','JUL–SEP','OCT–DEC'])[q - 1]}`
}
function monthInitial(d: string | null): string {
  return d ? new Date(d).toLocaleString('en-US', { month: 'long' })[0] : '?'
}
function monthFull(d: string | null): string {
  return d ? new Date(d).toLocaleString('en-US', { month: 'long' }).toUpperCase() : ''
}
function statusBadge(s: string) {
  const map: Record<string, { label: string; fg: string; bg: string }> = {
    active:    { label: 'ON TRACK',  fg: '#16a34a', bg: '#dcfce7' },
    completed: { label: 'DONE',      fg: '#0891b2', bg: '#cffafe' },
    paused:    { label: 'PAUSED',    fg: '#d97706', bg: '#fef3c7' },
    abandoned: { label: 'OFF TRACK', fg: '#dc2626', bg: '#fee2e2' },
  }
  return map[s] ?? { label: s.toUpperCase(), fg: '#6b7280', bg: '#f3f4f6' }
}
function childProgress(childId: string, allGoals: Goal[], allTasks: Task[]): number {
  const direct   = allTasks.filter(t => t.goal_id === childId)
  const children = allGoals.filter(g => g.parent_id === childId)
  if (!children.length && !direct.length) return 0
  if (!children.length) return Math.round(direct.filter(t => t.completed).length / direct.length * 100)
  const scores = children.map(c => {
    const ct = allTasks.filter(t => t.goal_id === c.id)
    return ct.length ? Math.round(ct.filter(t => t.completed).length / ct.length * 100) : 0
  })
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
}
function getAllDescendantIds(goalId: string, allGoals: Goal[]): Set<string> {
  const result = new Set<string>()
  const queue = [goalId]
  while (queue.length) {
    const cur = queue.shift()!
    allGoals.filter(g => g.parent_id === cur).forEach(g => { result.add(g.id); queue.push(g.id) })
  }
  return result
}

// ---------------------------------------------------------------------------
// GoalDetailView
// ---------------------------------------------------------------------------

interface Props {
  goal: Goal
  onClose: () => void
}

export default function GoalDetailView({ goal, onClose }: Props) {
  const { user } = useAuthStore()
  const { categories, goals, tasks, updateGoal, deleteGoal, createGoal, createTask, toggleTask, deleteTask } = useWheelStore()
  const { projects, fetchProjects } = useProjectStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) fetchProjects(user.id)
  }, [user?.id])

  const [editingTitle, setEditingTitle]     = useState(false)
  const [editTitle, setEditTitle]           = useState('')
  const [editingDesc, setEditingDesc]       = useState(false)
  const [editDesc, setEditDesc]             = useState('')
  const [timerRunning, setTimerRunning]     = useState(false)
  const [timerSeconds, setTimerSeconds]     = useState(0)
  const [totalLoggedSeconds, setTotalLoggedSeconds] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [commentText, setCommentText]       = useState('')
  const [goalComments, setGoalComments]     = useState<{ id: string; text: string; createdAt: Date }[]>([])
  const [newTaskTitle, setNewTaskTitle]     = useState('')
  const [showImagePicker, setShowImagePicker] = useState(false)
  const [activeTab, setActiveTab]           = useState<'overview' | 'quarters' | 'months' | 'weeks'>(() => {
    if (!goal.timeframe || goal.timeframe === 'life' || goal.timeframe === 'year') return 'quarters'
    if (goal.timeframe === 'quarter') return 'months'
    if (goal.timeframe === 'month') return 'weeks'
    return 'overview'
  })
  const [addingChild, setAddingChild]       = useState(false)
  const [newChildTitle, setNewChildTitle]   = useState('')

  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => setTimerSeconds((s) => s + 1), 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [timerRunning])

  const goalCategoryIds = goal.category_ids?.length ? goal.category_ids : (goal.category_id ? [goal.category_id] : [])
  const goalCats        = categories.filter(c => goalCategoryIds.includes(c.id))
  const cat             = goalCats[0] ?? categories.find(c => c.id === goal.category_id)
  const goalTasks       = tasks.filter((t) => t.goal_id === goal.id)
  const completedCount  = goalTasks.filter((t) => t.completed).length
  const pendingTasks    = goalTasks.filter((t) => !t.completed)
  const doneTasks       = goalTasks.filter((t) => t.completed)
  const progressPercent = goalTasks.length > 0 ? Math.round((completedCount / goalTasks.length) * 100) : 0
  const meta            = getCategoryMeta(cat?.name ?? '')

  const milestonesData  = (goal.milestones ?? []) as Array<{ title: string; description: string; date: string; completed: boolean }>
  const milestoneDone   = milestonesData.filter(m => m.completed).length

  const timeElapsedPercent = (() => {
    if (!goal.target_date) return null
    const start = new Date(goal.created_at).getTime()
    const end   = new Date(goal.target_date).getTime()
    const now   = Date.now()
    if (end <= start) return null
    return Math.min(100, Math.round(((now - start) / (end - start)) * 100))
  })()

  const descendantIds     = getAllDescendantIds(goal.id, goals)
  const quarterGoals      = goals.filter(g => g.timeframe === 'quarter' && descendantIds.has(g.id))
  const monthGoals        = goals.filter(g => g.timeframe === 'month'   && descendantIds.has(g.id))
  const weekGoals         = goals.filter(g => g.timeframe === 'week'    && descendantIds.has(g.id))
  const timeframeTabs: Array<'quarters' | 'months' | 'weeks'> =
    (!goal.timeframe || goal.timeframe === 'life' || goal.timeframe === 'year')
      ? ['quarters', 'months', 'weeks']
      : goal.timeframe === 'quarter' ? ['months', 'weeks']
      : goal.timeframe === 'month'   ? ['weeks']
      : []
  const directChildTimeframe: Goal['timeframe'] =
    (!goal.timeframe || goal.timeframe === 'life' || goal.timeframe === 'year') ? 'quarter'
    : goal.timeframe === 'quarter' ? 'month'
    : goal.timeframe === 'month'   ? 'week'
    : null
  const canAddToTab = activeTab !== 'overview' && timeframeTabs.includes(activeTab as typeof timeframeTabs[number])
  const activeTabGoals  = activeTab === 'quarters' ? quarterGoals : activeTab === 'months' ? monthGoals : weekGoals
  const activeTabLabel  = activeTab === 'quarters' ? 'Quarters' : activeTab === 'months' ? 'Months' : 'Weeks'
  const activeTabTF     = activeTab === 'quarters' ? 'quarter' : activeTab === 'months' ? 'month' : 'week'

  async function toggleMilestone(i: number) {
    if (!milestonesData.length) return
    const updated = milestonesData.map((m, idx) =>
      idx === i ? { ...m, completed: !m.completed } : m
    )
    await updateGoal(goal.id, { milestones: updated })
  }

  const fmtTime = (s: number) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  const stopTimer = () => {
    setTimerRunning(false)
    if (timerSeconds > 0) {
      setTotalLoggedSeconds((prev) => prev + timerSeconds)
      setTimerSeconds(0)
    }
  }

  const handleAddTask = async () => {
    if (!user || !newTaskTitle.trim()) return
    await createTask({
      user_id: user.id,
      goal_id: goal.id,
      project_id: goal.project_id,
      category_id: goal.category_id,
      title: newTaskTitle.trim(),
    })
    setNewTaskTitle('')
  }

  return (
    <div className="pb-24 animate-fade-in">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-2 flex-1 min-w-0">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-sm text-on-surface-variant">
            <button
              onClick={() => { onClose(); setTimerRunning(false); setTimerSeconds(0); setTotalLoggedSeconds(0) }}
              className="hover:text-on-surface transition-colors cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft size={14} />
              Goals
            </button>
            <ChevronRight size={13} className="opacity-40" />
            <span className="text-primary font-medium truncate max-w-xs">{goal.title}</span>
          </div>
          {/* Title — inline editable */}
          {editingTitle ? (
            <input
              autoFocus
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              onBlur={async () => {
                if (editTitle.trim() && editTitle.trim() !== goal.title)
                  await updateGoal(goal.id, { title: editTitle.trim() })
                setEditingTitle(false)
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                if (e.key === 'Escape') { setEditingTitle(false) }
              }}
              className="text-2xl md:text-3xl font-extrabold tracking-tight text-on-surface leading-tight w-full bg-transparent border-none outline-none border-b-2 border-[#1F3649]/20 focus:border-[#1F3649]/50 pb-0.5"
            />
          ) : (
            <h1
              onClick={() => { setEditTitle(goal.title); setEditingTitle(true) }}
              className="text-2xl md:text-3xl font-extrabold tracking-tight text-on-surface leading-tight cursor-text hover:opacity-80 transition-opacity"
            >
              {goal.title}
            </h1>
          )}
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {goalCats.length > 0 ? goalCats.map(c => {
              const m = getCategoryMeta(c.name)
              return (
                <span key={c.id} className="px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: `${m.color}18`, color: m.color }}>
                  {c.name}
                </span>
              )
            }) : (
              <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: `${meta.color}18`, color: meta.color }}>
                General
              </span>
            )}
            <button
              onClick={() => updateGoal(goal.id, { status: goal.status === 'completed' ? 'active' : 'completed' })}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors',
                goal.status === 'completed' ? 'bg-[#22c55e]/10 text-[#16a34a]' : 'bg-[#f59e0b]/10 text-[#b45309]'
              )}
            >
              {goal.status === 'completed' ? 'Completed' : 'In Progress'}
            </button>
            {goal.target_date && (
              <span className="flex items-center gap-1 text-xs text-on-surface-variant bg-[#f2f4f4] px-3 py-1 rounded-full">
                <Calendar size={10} />
                Due {format(new Date(goal.target_date), 'MMM d, yyyy')}
              </span>
            )}
          </div>
        </div>
        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={async () => { await deleteGoal(goal.id); onClose() }}
            className="flex items-center gap-1.5 bg-[#f2f4f4] hover:bg-[#fce8e8] text-on-surface-variant hover:text-[#9f403d] px-4 py-2 text-sm font-semibold rounded-[12px] transition-colors cursor-pointer"
          >
            <Trash2 size={13} />
            Delete
          </button>
          <button
            onClick={() => navigate(`/goals/${goal.id}/edit`)}
            className="flex items-center gap-1.5 bg-[#f2f4f4] hover:bg-[#1F3649]/10 text-on-surface-variant px-4 py-2 text-sm font-semibold rounded-[12px] transition-colors cursor-pointer"
          >
            <Pencil size={13} />
            Edit
          </button>
          <button
            onClick={() => updateGoal(goal.id, { status: 'completed' })}
            disabled={goal.status === 'completed'}
            className="flex items-center gap-1.5 bg-primary hover:opacity-90 disabled:opacity-50 text-white px-4 py-2 text-sm font-semibold rounded-[12px] transition-all cursor-pointer"
          >
            <CheckCircle2 size={13} />
            {goal.status === 'completed' ? 'Completed' : 'Mark Complete'}
          </button>
        </div>
      </div>

      <ImagePickerModal
        open={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onSelect={url => updateGoal(goal.id, { cover_url: url })}
        initialQuery={goal.title}
      />

      {/* Cover image card */}
      {goal.cover_url ? (
        <div className="relative rounded-[15px] overflow-hidden h-44 group mb-5">
          <img src={goal.cover_url} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setShowImagePicker(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-black/50 hover:bg-black/70 text-white rounded-[8px] text-xs font-semibold cursor-pointer backdrop-blur-sm transition-colors"
            >
              <Image size={12} /> Change
            </button>
            <button
              onClick={() => updateGoal(goal.id, { cover_url: null })}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-black/50 hover:bg-[#dc2626]/80 text-white rounded-[8px] text-xs font-semibold cursor-pointer backdrop-blur-sm transition-colors"
            >
              <Trash size={12} /> Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowImagePicker(true)}
          className="w-full h-14 flex items-center justify-center gap-2 bg-white/60 card !border-dashed !border-[#adb3b4]/30 hover:bg-white hover:!border-[#1F3649]/20 transition-all rounded-[15px] cursor-pointer group mb-5"
        >
          <Image size={14} className="text-[#adb3b4] group-hover:text-[#5a6061] transition-colors" />
          <span className="text-xs font-semibold text-[#adb3b4] group-hover:text-[#5a6061] transition-colors">Add cover image</span>
        </button>
      )}

      {/* Main bento grid */}
      <div className="grid grid-cols-12 gap-5">

        {/* ── LEFT PANE ─────────────────────────────────── */}
        <div className="col-span-12 lg:col-span-8 space-y-5">

          {/* Tab bar */}
          {timeframeTabs.length > 0 && (
            <div className="flex gap-6 border-b border-[#ebeeef]">
              {(['overview', ...timeframeTabs] as const).map(tab => {
                const count = tab === 'quarters' ? quarterGoals.length : tab === 'months' ? monthGoals.length : tab === 'weeks' ? weekGoals.length : 0
                const label = tab === 'overview' ? 'Overview' : tab === 'quarters' ? 'Quarters' : tab === 'months' ? 'Months' : 'Weeks'
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      'inline-flex items-center gap-1.5 text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap leading-none pb-[3px] shrink-0 !rounded-none bg-transparent',
                      activeTab === tab
                        ? 'text-[#1F3649] border-b-2 border-[#1F3649]'
                        : 'text-[#5a6061] hover:text-[#1F3649]'
                    )}
                  >
                    {label}
                    {count > 0 && (
                      <span className="text-[10px] bg-[#f2f4f4] px-1.5 py-0.5 rounded-full">{count}</span>
                    )}
                  </button>
                )
              })}
            </div>
          )}

          {activeTab === 'overview' && (<>
          {/* Description */}
          <section className="bg-surface card p-6 md:p-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-on-surface">Description</h3>
              <button
                onClick={() => { setEditingDesc(!editingDesc); setEditDesc(goal.description ?? '') }}
                className="p-1.5 rounded-lg hover:bg-[#f2f4f4] transition-colors cursor-pointer text-on-surface-variant hover:text-primary"
              >
                <Pencil size={13} />
              </button>
            </div>
            {editingDesc ? (
              <div className="space-y-3">
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="input resize-none h-28"
                  placeholder="Add a description for this goal..."
                  autoFocus
                />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setEditingDesc(false)} className="text-sm px-4 py-2 rounded-[12px] bg-[#f2f4f4] text-on-surface font-medium cursor-pointer hover:bg-[#ebeeef] transition-colors">Cancel</button>
                  <button onClick={async () => { await updateGoal(goal.id, { description: editDesc || null }); setEditingDesc(false) }} className="text-sm px-4 py-2 rounded-[12px] bg-primary text-white font-medium cursor-pointer hover:opacity-90 transition-all">Save</button>
                </div>
              </div>
            ) : (
              <div onClick={() => { setEditingDesc(true); setEditDesc(goal.description ?? '') }} className="cursor-text">
                {goal.description
                  ? <p className="text-sm text-on-surface-variant leading-relaxed">{goal.description}</p>
                  : <p className="text-sm italic text-on-surface-variant/30 hover:text-on-surface-variant/50 transition-colors">No description yet — click to add one.</p>
                }
              </div>
            )}
          </section>

          {/* SMART Fields — visible in main flow */}
          {(goal.outcome_metric || goal.success_criteria || goal.effort_minutes_per_session != null) && (
            <section className="bg-surface card p-6 md:p-8 space-y-5">
              <h3 className="text-base font-bold text-on-surface">Goal Definition</h3>
              {goal.outcome_metric && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 mb-1.5">Outcome Metric</p>
                  <p className="text-sm text-on-surface leading-relaxed">{goal.outcome_metric}</p>
                </div>
              )}
              {goal.success_criteria && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 mb-1.5">Success Criteria</p>
                  <p className="text-sm text-on-surface leading-relaxed">{goal.success_criteria}</p>
                </div>
              )}
              {goal.effort_minutes_per_session != null && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 mb-1.5">Weekly Effort</p>
                  <p className="text-sm text-on-surface">{goal.effort_minutes_per_session} hrs / week</p>
                </div>
              )}
            </section>
          )}

          {/* Focus Objectives */}
          <section className="bg-surface card p-6 md:p-8">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-bold text-on-surface">Focus Objectives</h3>
                <span className="bg-[#f2f4f4] text-on-surface-variant px-2 py-0.5 rounded-md text-xs font-bold">{completedCount}/{goalTasks.length}</span>
              </div>
            </div>

            {goalTasks.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center justify-between mb-5.5">
                  <span className="text-xs text-on-surface-variant">{progressPercent}% complete</span>
                  <span className="text-xs text-on-surface-variant">{completedCount} of {goalTasks.length} done</span>
                </div>
                <div className="w-full bg-[#1F3649]/10 rounded-full h-2">
                  <div className="h-2 rounded-full bg-[#1F3649] transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
            )}

            {/* To Do */}
            {pendingTasks.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">To Do</span>
                  <div className="flex-1 h-px bg-[#ebeeef]" />
                  <span className="text-[10px] font-bold text-on-surface-variant/40">{pendingTasks.length}</span>
                </div>
                <div className="space-y-1">
                  {pendingTasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-[#f2f4f4] rounded-xl transition-colors group">
                      <button onClick={() => toggleTask(task.id, true)} className="cursor-pointer shrink-0 text-[#adb3b4] hover:text-primary transition-colors">
                        <Circle size={17} />
                      </button>
                      <span className="text-sm flex-1 text-on-surface">{task.title}</span>
                      {task.due_date && (
                        <span className="flex items-center gap-1 text-[10px] text-on-surface-variant/40 bg-[#f2f4f4] px-2 py-0.5 rounded-full">
                          <Calendar size={9} />{format(new Date(task.due_date), 'MMM d')}
                        </span>
                      )}
                      <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#fce8e8] hover:text-[#9f403d] text-on-surface-variant rounded-lg transition-all cursor-pointer">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Done */}
            {doneTasks.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">Completed</span>
                  <div className="flex-1 h-px bg-[#ebeeef]" />
                  <span className="text-[10px] font-bold text-on-surface-variant/40">{doneTasks.length}</span>
                </div>
                <div className="space-y-1">
                  {doneTasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-[#f2f4f4] rounded-xl transition-colors group">
                      <button onClick={() => toggleTask(task.id, false)} className="cursor-pointer shrink-0 text--[#22c55e]">
                        <CheckCircle2 size={17} className="text-[#22c55e]" />
                      </button>
                      <span className="text-sm flex-1 line-through text-on-surface-variant/40">{task.title}</span>
                      <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#fce8e8] hover:text-[#9f403d] text-on-surface-variant rounded-lg transition-all cursor-pointer">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {goalTasks.length === 0 && (
              <p className="text-sm text-on-surface-variant/40 py-4 text-center">No tasks yet. Add one below.</p>
            )}

            {/* Add task */}
            <div className="flex gap-2 pt-4 border-t border-[#ebeeef]">
              <input
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddTask() }}
                placeholder="Add a new task and press Enter..."
                className="input text-sm"
              />
              <button
                onClick={handleAddTask}
                disabled={!newTaskTitle.trim()}
                className="bg-primary hover:opacity-90 disabled:opacity-40 text-white px-4 py-2.5 rounded-[12px] transition-all cursor-pointer shrink-0"
              >
                <Plus size={15} />
              </button>
            </div>
          </section>

          {/* Milestones */}
          {milestonesData.length > 0 && (
            <section className="bg-surface card p-6 md:p-8">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-bold text-on-surface">Milestones</h3>
                  <span className="bg-[#f2f4f4] text-on-surface-variant px-2 py-0.5 rounded-md text-xs font-bold">{milestoneDone}/{milestonesData.length}</span>
                </div>
              </div>
              {milestonesData.length > 0 && (
                <div className="mb-5">
                  <div className="w-full bg-[#1F3649]/10 rounded-full h-2 mb-4">
                    <div
                      className="h-2 rounded-full bg-[#1F3649] transition-all duration-500"
                      style={{ width: `${milestonesData.length > 0 ? Math.round((milestoneDone / milestonesData.length) * 100) : 0}%` }}
                    />
                  </div>
                </div>
              )}
              <div className="space-y-2">
                {milestonesData.map((m, i) => (
                  <div key={i} className="flex items-start gap-3 px-3 py-2.5 hover:bg-[#f2f4f4] rounded-xl transition-colors">
                    <button onClick={() => toggleMilestone(i)} className="cursor-pointer shrink-0 mt-0.5">
                      {m.completed
                        ? <CheckCircle2 size={17} className="text-[#22c55e]" />
                        : <Circle size={17} className="text-[#adb3b4] hover:text-primary transition-colors" />
                      }
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm font-medium', m.completed ? 'line-through text-on-surface-variant/40' : 'text-on-surface')}>{m.title || `Phase ${i + 1}`}</p>
                      {m.date && (
                        <p className="text-[10px] text-on-surface-variant/40 mt-0.5 flex items-center gap-1">
                          <Calendar size={9} />
                          {format(new Date(m.date), 'MMM d, yyyy')}
                        </p>
                      )}
                    </div>
                    <div className="w-6 h-6 rounded-full bg-[#f2f4f4] flex items-center justify-center shrink-0">
                      <span className="text-[9px] font-black text-[#5a6061]">{String(i + 1).padStart(2, '0')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Activity & Discussion */}
          <section className="bg-surface card p-6 md:p-8">
            <h3 className="text-base font-bold text-on-surface mb-5">Activity & Discussion</h3>

            {goalComments.length > 0 && (
              <div className="space-y-4 mb-5">
                {goalComments.map((c) => (
                  <div key={c.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
                      <User size={14} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2 mb-5">
                        <span className="text-sm font-semibold text-on-surface">You</span>
                        <span className="text-xs text-on-surface-variant/40">{format(c.createdAt, 'MMM d, h:mm a')}</span>
                      </div>
                      <div className="bg-[#f2f4f4] rounded-xl px-4 py-3 text-sm text-on-surface leading-relaxed">{c.text}</div>
                      <div className="flex items-center gap-3 mt-2 px-1">
                        <button className="flex items-center gap-1 text-xs text-on-surface-variant/40 hover:text-primary transition-colors cursor-pointer">
                          <ThumbsUp size={11} /> Like
                        </button>
                        <button className="text-xs text-on-surface-variant/40 hover:text-primary transition-colors cursor-pointer">Reply</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-[15px] border border-[#ebeeef] focus-within:border-primary/30 focus-within:ring-[3px] focus-within:ring-primary/10 transition-all overflow-hidden">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment, note, or reflection..."
                className="w-full bg-surface px-5 py-4 text-sm text-on-surface resize-none h-24 focus:outline-none placeholder:text-on-surface-variant/30"
              />
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-[#ebeeef] bg-[#f2f4f4]/60">
                <div className="flex items-center gap-1">
                  {[{ Icon: Bold, label: 'Bold' }, { Icon: Italic, label: 'Italic' }, { Icon: Paperclip, label: 'Attach' }, { Icon: AtSign, label: 'Mention' }].map(({ Icon, label }) => (
                    <button key={label} title={label} className="p-1.5 rounded-lg text-on-surface-variant/50 hover:text-primary hover:bg-white transition-all cursor-pointer">
                      <Icon size={13} />
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => {
                    if (!commentText.trim()) return
                    setGoalComments((prev) => [...prev, { id: Date.now().toString(), text: commentText.trim(), createdAt: new Date() }])
                    setCommentText('')
                  }}
                  disabled={!commentText.trim()}
                  className="bg-primary hover:opacity-90 disabled:opacity-40 text-white text-xs font-semibold px-4 py-1.5 rounded-[10px] transition-all cursor-pointer"
                >
                  Post
                </button>
              </div>
            </div>

            {goalComments.length === 0 && (
              <p className="text-xs text-on-surface-variant/30 text-center mt-3">
                Write something to track your progress over time
              </p>
            )}
          </section>
          </>)}

          {/* ── BREAKDOWN TAB ─────────────────────────────── */}
          {activeTab !== 'overview' && (
            <section className="bg-surface card p-6 md:p-8">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-bold text-on-surface">{activeTabLabel}</h3>
                  {activeTabGoals.length > 0 && (
                    <span className="bg-[#f2f4f4] text-on-surface-variant px-2 py-0.5 rounded-md text-xs font-bold">{activeTabGoals.length}</span>
                  )}
                </div>
              </div>

              {activeTabGoals.length === 0 ? (
                <p className="text-sm text-on-surface-variant/40 py-8 text-center">
                  No {activeTabLabel.toLowerCase()} yet{canAddToTab ? ' — add one below' : ''}.
                </p>
              ) : (
                <div className="space-y-2 mb-5">
                  {activeTabGoals.map(child => {
                    const prog  = childProgress(child.id, goals, tasks)
                    const badge = statusBadge(child.status)
                    const timeLabel = child.timeframe === 'quarter' ? quarterLbl(child.target_date)
                      : child.timeframe === 'month' ? monthFull(child.target_date) : ''
                    return (
                      <div
                        key={child.id}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#F8FAFB] border border-[#ebeeef] group cursor-pointer transition-colors"
                        onClick={() => navigate(`/goals/${child.id}`)}
                      >
                        {child.timeframe === 'quarter' ? (
                          <div className="w-8 h-8 rounded-lg bg-[#ebeeef] flex items-center justify-center flex-shrink-0">
                            <span className="text-[11px] font-bold text-[#1F3649]">Q</span>
                          </div>
                        ) : child.timeframe === 'month' ? (
                          <div className="w-8 h-8 rounded-full bg-[#ebeeef] flex items-center justify-center flex-shrink-0">
                            <span className="text-[11px] font-bold text-[#1F3649]">{monthInitial(child.target_date)}</span>
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-[#ebeeef] flex items-center justify-center flex-shrink-0">
                            <Target size={14} className="text-[#1F3649]" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          {timeLabel && (
                            <div className="text-[10px] text-[#adb3b4] font-semibold uppercase tracking-wide mb-0.5">{timeLabel}</div>
                          )}
                          <div className="text-[14px] font-medium text-on-surface truncate">{child.title}</div>
                        </div>
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 hidden sm:block"
                          style={{ color: badge.fg, backgroundColor: badge.bg }}
                        >
                          {badge.label}
                        </span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="w-16 bg-[#ebeeef] rounded-full h-1.5 hidden sm:block">
                            <div className="h-full bg-[#0A2342] rounded-full transition-all" style={{ width: `${prog}%` }} />
                          </div>
                          <span className="text-[12px] font-semibold text-on-surface w-8 text-right">{prog}%</span>
                        </div>
                        <button
                          onClick={e => { e.stopPropagation(); deleteGoal(child.id) }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#fce8e8] hover:text-[#9f403d] text-on-surface-variant rounded-lg transition-all cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}

              {user && canAddToTab && (
                <div className={cn(activeTabGoals.length > 0 ? 'border-t border-[#ebeeef] pt-4' : '')}>
                  {addingChild ? (
                    <div className="flex gap-2">
                      <input
                        autoFocus
                        value={newChildTitle}
                        onChange={e => setNewChildTitle(e.target.value)}
                        onKeyDown={async e => {
                          if (e.key === 'Enter' && newChildTitle.trim()) {
                            await createGoal({
                              user_id: user.id,
                              parent_id: goal.id,
                              timeframe: activeTabTF as Goal['timeframe'],
                              title: newChildTitle.trim(),
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
                            setNewChildTitle('')
                            setAddingChild(false)
                          }
                          if (e.key === 'Escape') { setAddingChild(false); setNewChildTitle('') }
                        }}
                        onBlur={() => { if (!newChildTitle.trim()) setAddingChild(false) }}
                        placeholder={`Add ${activeTabLabel.toLowerCase().replace(/s$/, '')} title…`}
                        className="input text-sm flex-1"
                      />
                      <button
                        onClick={() => { setAddingChild(false); setNewChildTitle('') }}
                        className="px-3 py-2 bg-[#f2f4f4] rounded-[12px] text-on-surface-variant hover:bg-[#ebeeef] transition-colors cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingChild(true)}
                      className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                    >
                      <Plus size={14} />
                      Add {activeTabLabel.toLowerCase().replace(/s$/, '')}
                    </button>
                  )}
                </div>
              )}
            </section>
          )}
        </div>

        {/* ── RIGHT PANE ────────────────────────────────── */}
        <div className="col-span-12 lg:col-span-4 space-y-5">

          {/* Details — first */}
          <section className="bg-surface card p-6">
            <div className="flex items-center gap-2 mb-5">
              <Tag size={15} className="text-primary" />
              <h3 className="text-sm font-bold text-on-surface">Details</h3>
            </div>
            <div className="space-y-0">
              <div className="flex items-center justify-between py-3 border-b border-[#ebeeef]">
                <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                  <User size={13} className="text-on-surface-variant/50" />
                  Assignee
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <User size={10} className="text-white" />
                  </div>
                  <span className="text-xs font-semibold text-on-surface">You</span>
                </div>
              </div>
              <div className="flex items-start justify-between py-3 border-b border-[#ebeeef]">
                <div className="flex items-center gap-2 text-xs text-on-surface-variant shrink-0 mt-0.5">
                  <Target size={13} className="text-on-surface-variant/50" />
                  Category
                </div>
                <div className="flex flex-wrap gap-1 justify-end">
                  {goalCats.length > 0 ? goalCats.map(c => {
                    const m = getCategoryMeta(c.name)
                    return (
                      <span key={c.id} className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${m.color}15`, color: m.color }}>
                        {c.name}
                      </span>
                    )
                  }) : (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${meta.color}15`, color: meta.color }}>
                      General
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-[#ebeeef]">
                <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                  <CheckCircle2 size={13} className="text-on-surface-variant/50" />
                  Status
                </div>
                <button
                  onClick={() => updateGoal(goal.id, { status: goal.status === 'completed' ? 'active' : 'completed' })}
                  className={cn(
                    'text-xs font-bold px-2 py-0.5 rounded-full cursor-pointer transition-colors',
                    goal.status === 'completed' ? 'bg-[#22c55e]/10 text-[#16a34a]' : 'bg-[#f59e0b]/10 text-[#b45309]'
                  )}
                >
                  {goal.status === 'completed' ? 'Completed' : 'In Progress'}
                </button>
              </div>
              {goal.target_date && (
                <div className="flex items-center justify-between py-3 border-b border-[#ebeeef]">
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                    <Calendar size={13} className="text-on-surface-variant/50" />
                    Target Date
                  </div>
                  <span className="text-xs font-semibold text-on-surface">{format(new Date(goal.target_date), 'MMM d, yyyy')}</span>
                </div>
              )}
              <div className="flex items-center justify-between py-3 border-b border-[#ebeeef]">
                <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                  <Clock size={13} className="text-on-surface-variant/50" />
                  Last Activity
                </div>
                <span className="text-xs text-on-surface-variant/50">Just now</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                  <Flag size={13} className="text-on-surface-variant/50" />
                  Created
                </div>
                <span className="text-xs font-semibold text-on-surface">{format(new Date(goal.created_at), 'MMM d, yyyy')}</span>
              </div>
            </div>
          </section>

          {/* Time Tracking */}
          <section className="bg-surface card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Timer size={15} className="text-primary" />
              <h3 className="text-sm font-bold text-on-surface">Time Tracking</h3>
            </div>
            <div className="bg-[#f2f4f4] rounded-[15px] p-5 mb-4 text-center">
              <div className="text-3xl font-mono font-bold text-on-surface tracking-tight mb-5">{fmtTime(timerSeconds)}</div>
              <div className="text-xs text-on-surface-variant/50">{timerRunning ? 'Running...' : timerSeconds > 0 ? 'Paused' : 'Ready'}</div>
            </div>
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setTimerRunning((r) => !r)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[12px] text-sm font-semibold transition-all cursor-pointer',
                  timerRunning ? 'bg-[#f59e0b]/10 text-[#b45309] hover:bg-[#f59e0b]/20' : 'bg-primary text-white hover:opacity-90'
                )}
              >
                {timerRunning ? <Pause size={14} /> : <Play size={14} />}
                {timerRunning ? 'Pause' : 'Start'}
              </button>
              <button
                onClick={stopTimer}
                disabled={timerSeconds === 0 && !timerRunning}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-[12px] bg-[#f2f4f4] hover:bg-[#ebeeef] disabled:opacity-40 text-on-surface-variant text-sm font-semibold transition-colors cursor-pointer"
              >
                <Square size={13} />
                Stop
              </button>
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between py-2 border-b border-[#ebeeef]">
                <span className="text-xs text-on-surface-variant">Total Logged</span>
                <span className="text-xs font-bold text-on-surface font-mono">{fmtTime(totalLoggedSeconds)}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-xs text-on-surface-variant">Estimated</span>
                <span className="text-xs font-bold text-on-surface-variant/40">—</span>
              </div>
            </div>
          </section>

          {/* Linked Project */}
          {(() => {
            const linkedProject = projects.find(p => p.id === goal.project_id) ?? null
            const color = linkedProject?.color || '#1F3649'
            return (
              <section className="bg-surface card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Kanban size={15} className="text-primary" />
                  <h3 className="text-sm font-bold text-on-surface">Linked Project</h3>
                </div>
                {linkedProject ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0"
                        style={{ backgroundColor: color + '22' }}
                      >
                        <Kanban size={14} style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-on-surface truncate">{linkedProject.title}</p>
                        <p className="text-[10px] text-on-surface-variant/50 capitalize">{linkedProject.status.replace('_', ' ')}</p>
                      </div>
                      <button
                        onClick={() => updateGoal(goal.id, { project_id: null })}
                        className="p-1 rounded-lg text-on-surface-variant/30 hover:text-[#dc2626] hover:bg-[#fce8e8] transition-all cursor-pointer"
                        title="Unlink project"
                      >
                        <X size={12} />
                      </button>
                    </div>
                    <button
                      onClick={() => navigate(`/projects/${linkedProject.id}`)}
                      className="text-xs font-semibold flex items-center gap-1 hover:gap-2 transition-all cursor-pointer"
                      style={{ color }}
                    >
                      <ChevronRight size={12} />
                      Open Project
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs italic text-on-surface-variant/30">No project linked</p>
                    <select
                      defaultValue=""
                      onChange={async (e) => {
                        if (e.target.value) await updateGoal(goal.id, { project_id: e.target.value })
                        e.target.value = ''
                      }}
                      className="w-full text-xs font-semibold text-on-surface-variant bg-[#f2f4f4] px-3 py-2.5 rounded-xl border-none outline-none cursor-pointer"
                    >
                      <option value="">Link a project…</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                  </div>
                )}
              </section>
            )
          })()}

          {/* Attachments */}
          <section className="bg-surface card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Paperclip size={15} className="text-primary" />
                <h3 className="text-sm font-bold text-on-surface">Attachments</h3>
              </div>
              <button className="text-xs text-primary font-semibold hover:underline cursor-pointer">+ Add</button>
            </div>
            <div className="grid grid-cols-3 gap-1.5 mb-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-square rounded-lg bg-[#f2f4f4] flex items-center justify-center border border-dashed border-[#ebeeef]">
                  <Paperclip size={14} className="opacity-30 text-on-surface-variant" />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#f2f4f4] transition-colors cursor-pointer group">
              <div className="w-8 h-8 rounded-lg bg-[#1F3649]/10 flex items-center justify-center shrink-0">
                <Flag size={12} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-on-surface truncate">goal-brief.pdf</p>
                <p className="text-[10px] text-on-surface-variant/40">2.4 MB</p>
              </div>
              <Download size={13} className="text-on-surface-variant/40 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-[10px] text-on-surface-variant/30 text-center mt-3">Drop files here or click Add</p>
          </section>

          {/* Progress donut */}
          <section className="bg-surface card p-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 mb-4">Overall Progress</p>
            <div className="flex flex-col items-center py-2">
              <ScoreDonut score={progressPercent} maxScore={100} color={meta.color} size={120} />
              <p className="text-xs text-on-surface-variant mt-3">{completedCount} of {goalTasks.length} tasks done</p>
            </div>
          </section>

          {/* Time vs Progress */}
          {timeElapsedPercent !== null && (
            <section className="bg-surface card p-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 mb-4">Time vs Progress</p>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-semibold text-on-surface-variant">Time elapsed</span>
                    <span className="text-[10px] font-bold text-on-surface">{timeElapsedPercent}%</span>
                  </div>
                  <div className="w-full bg-[#1F3649]/8 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ width: `${timeElapsedPercent}%`, backgroundColor: timeElapsedPercent > progressPercent + 15 ? '#ef4444' : '#f59e0b' }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-semibold text-on-surface-variant">Task progress</span>
                    <span className="text-[10px] font-bold text-on-surface">{progressPercent}%</span>
                  </div>
                  <div className="w-full bg-[#1F3649]/8 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-[#22c55e] transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
                {timeElapsedPercent > progressPercent + 15 && (
                  <p className="text-[10px] text-[#ef4444] font-semibold pt-1">Behind schedule — time is outpacing progress.</p>
                )}
                {progressPercent >= timeElapsedPercent && (
                  <p className="text-[10px] text-[#22c55e] font-semibold pt-1">Ahead of schedule — keep going.</p>
                )}
              </div>
            </section>
          )}

          {/* SMART Details */}
          {(goal.outcome_metric || goal.success_criteria || goal.effort_frequency) && (
            <section className="bg-surface card p-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 mb-4">SMART Details</p>
              <div className="space-y-4">
                {goal.outcome_metric && (
                  <div>
                    <p className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-wider mb-1">Outcome Metric</p>
                    <p className="text-xs text-on-surface leading-relaxed">{goal.outcome_metric}</p>
                  </div>
                )}
                {goal.success_criteria && (
                  <div>
                    <p className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-wider mb-1">Success Criteria</p>
                    <p className="text-xs text-on-surface leading-relaxed">{goal.success_criteria}</p>
                  </div>
                )}
                {goal.effort_minutes_per_session != null && (
                  <div>
                    <p className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-wider mb-1">Effort</p>
                    <p className="text-xs text-on-surface">{goal.effort_minutes_per_session} hrs / week</p>
                  </div>
                )}
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  )
}
