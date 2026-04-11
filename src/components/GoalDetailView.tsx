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
} from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { useAuthStore } from '../stores/authStore'
import { useWheelStore } from '../stores/wheelStore'
import { useProjectStore } from '../stores/projectStore'
import type { Goal } from '../stores/wheelStore'
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
            <Cell fill="#ebeeef" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-bold text-[#2d3435]">
          {score}<span className="text-sm font-normal text-[#5a6061] opacity-60">/{maxScore}</span>
        </span>
      </div>
    </div>
  )
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
  const { categories, tasks, updateGoal, deleteGoal, createTask, toggleTask, deleteTask } = useWheelStore()
  const { projects, fetchProjects } = useProjectStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) fetchProjects(user.id)
  }, [user?.id])

  const [editingDesc, setEditingDesc]       = useState(false)
  const [editDesc, setEditDesc]             = useState('')
  const [timerRunning, setTimerRunning]     = useState(false)
  const [timerSeconds, setTimerSeconds]     = useState(0)
  const [totalLoggedSeconds, setTotalLoggedSeconds] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [commentText, setCommentText]       = useState('')
  const [goalComments, setGoalComments]     = useState<{ id: string; text: string; createdAt: Date }[]>([])
  const [newTaskTitle, setNewTaskTitle]     = useState('')

  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => setTimerSeconds((s) => s + 1), 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [timerRunning])

  const cat            = categories.find((c) => c.id === goal.category_id)
  const goalTasks      = tasks.filter((t) => t.goal_id === goal.id)
  const completedCount = goalTasks.filter((t) => t.completed).length
  const pendingTasks   = goalTasks.filter((t) => !t.completed)
  const doneTasks      = goalTasks.filter((t) => t.completed)
  const progressPercent = goalTasks.length > 0 ? Math.round((completedCount / goalTasks.length) * 100) : 0
  const meta           = getCategoryMeta(cat?.name ?? '')

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
          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-on-surface leading-tight">
            {goal.title}
          </h1>
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span
              className="px-3 py-1 rounded-full text-xs font-bold"
              style={{ backgroundColor: `${meta.color}18`, color: meta.color }}
            >
              {cat?.name ?? 'General'}
            </span>
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
            onClick={() => navigate('/journal', { state: { prefill: `## ${goal.title}\n\n` } })}
            className="flex items-center gap-1.5 bg-[#f2f4f4] hover:bg-[#e4e9ea] text-on-surface-variant px-4 py-2 text-sm font-semibold rounded-[12px] transition-colors cursor-pointer"
          >
            <Share2 size={13} />
            Send to Journal
          </button>
          <button
            onClick={async () => { await deleteGoal(goal.id); onClose() }}
            className="flex items-center gap-1.5 bg-[#f2f4f4] hover:bg-[#fce8e8] text-on-surface-variant hover:text-[#9f403d] px-4 py-2 text-sm font-semibold rounded-[12px] transition-colors cursor-pointer"
          >
            <Trash2 size={13} />
            Delete
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

      {/* Main bento grid */}
      <div className="grid grid-cols-12 gap-5">

        {/* ── LEFT PANE ─────────────────────────────────── */}
        <div className="col-span-12 lg:col-span-8 space-y-5">

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
                  <button onClick={() => setEditingDesc(false)} className="text-sm px-4 py-2 rounded-[12px] bg-[#f2f4f4] text-on-surface font-medium cursor-pointer hover:bg-[#e4e9ea] transition-colors">Cancel</button>
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
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-on-surface-variant">{progressPercent}% complete</span>
                  <span className="text-xs text-on-surface-variant">{completedCount} of {goalTasks.length} done</span>
                </div>
                <div className="w-full bg-[#f2f4f4] rounded-full h-2">
                  <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%`, backgroundColor: meta.color }} />
                </div>
              </div>
            )}

            {/* To Do */}
            {pendingTasks.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">To Do</span>
                  <div className="flex-1 h-px bg-[#ECEFF2]" />
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
                  <div className="flex-1 h-px bg-[#ECEFF2]" />
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
            <div className="flex gap-2 pt-4 border-t border-[#ECEFF2]">
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
                      <div className="flex items-baseline gap-2 mb-1">
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

            <div className="rounded-[15px] border border-[#ECEFF2] focus-within:border-primary/30 focus-within:ring-[3px] focus-within:ring-primary/10 transition-all overflow-hidden">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment, note, or reflection..."
                className="w-full bg-surface px-5 py-4 text-sm text-on-surface resize-none h-24 focus:outline-none placeholder:text-on-surface-variant/30"
              />
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-[#ECEFF2] bg-[#f2f4f4]/60">
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
        </div>

        {/* ── RIGHT PANE ────────────────────────────────── */}
        <div className="col-span-12 lg:col-span-4 space-y-5">

          {/* Time Tracking */}
          <section className="bg-surface card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Timer size={15} className="text-primary" />
              <h3 className="text-sm font-bold text-on-surface">Time Tracking</h3>
            </div>
            <div className="bg-[#f2f4f4] rounded-2xl p-5 mb-4 text-center">
              <div className="text-3xl font-mono font-bold text-on-surface tracking-tight mb-1">{fmtTime(timerSeconds)}</div>
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
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-[12px] bg-[#f2f4f4] hover:bg-[#e4e9ea] disabled:opacity-40 text-on-surface-variant text-sm font-semibold transition-colors cursor-pointer"
              >
                <Square size={13} />
                Stop
              </button>
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between py-2 border-b border-[#ECEFF2]">
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
                <div key={i} className="aspect-square rounded-lg bg-[#f2f4f4] flex items-center justify-center border border-dashed border-[#ECEFF2]">
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

          {/* Details */}
          <section className="bg-surface card p-6">
            <div className="flex items-center gap-2 mb-5">
              <Tag size={15} className="text-primary" />
              <h3 className="text-sm font-bold text-on-surface">Details</h3>
            </div>
            <div className="space-y-0">
              <div className="flex items-center justify-between py-3 border-b border-[#ECEFF2]">
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
              <div className="flex items-center justify-between py-3 border-b border-[#ECEFF2]">
                <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                  <Target size={13} className="text-on-surface-variant/50" />
                  Category
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${meta.color}15`, color: meta.color }}>
                  {cat?.name ?? 'General'}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-[#ECEFF2]">
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
                <div className="flex items-center justify-between py-3 border-b border-[#ECEFF2]">
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                    <Calendar size={13} className="text-on-surface-variant/50" />
                    Target Date
                  </div>
                  <span className="text-xs font-semibold text-on-surface">{format(new Date(goal.target_date), 'MMM d, yyyy')}</span>
                </div>
              )}
              <div className="flex items-center justify-between py-3 border-b border-[#ECEFF2]">
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

          {/* Progress donut */}
          <section className="bg-surface card p-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 mb-4">Overall Progress</p>
            <div className="flex flex-col items-center py-2">
              <ScoreDonut score={progressPercent} maxScore={100} color={meta.color} size={120} />
              <p className="text-xs text-on-surface-variant mt-3">{completedCount} of {goalTasks.length} tasks done</p>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
