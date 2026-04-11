import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Target,
  Plus,
  X,
  RocketLaunch,
  CalendarBlank,
  CheckSquare,
  Kanban,
  Flag,
} from '@phosphor-icons/react'
import { cn } from '../lib/utils'
import { useWheelStore } from '../stores/wheelStore'
import { useProjectStore } from '../stores/projectStore'
import { useAuthStore } from '../stores/authStore'
import { supabase } from '../lib/supabase'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CATEGORY_COLORS: Record<string, string> = {
  Health:               '#22c55e',
  Career:               '#3b82f6',
  Finance:              '#f59e0b',
  Relationships:        '#ec4899',
  'Personal Growth':    '#8b5cf6',
  Fun:                  '#f97316',
  'Physical Environment': '#06b6d4',
  'Family/Friends':     '#ec4899',
}

const TIMELINE_OPTIONS = [
  { label: 'Quarterly', sub: '90 days',   value: 'quarterly',  days: 90  },
  { label: 'Annual',    sub: '365 days',  value: 'annual',     days: 365 },
  { label: 'Multi-Year',sub: '2–5 years', value: 'multi_year', days: 730 },
] as const
type TimelineValue = typeof TIMELINE_OPTIONS[number]['value']

const PRIORITY_OPTIONS = [
  { label: 'High Impact', color: '#3b82f6' },
  { label: 'Low Effort',  color: '#22c55e' },
  { label: 'Core Value',  color: '#8b5cf6' },
  { label: 'Urgent',      color: '#ef4444' },
]

const TASK_PRIORITY_COLORS: Record<string, string> = {
  urgent: 'bg-red-50 text-red-600',
  high:   'bg-orange-50 text-orange-600',
  normal: 'bg-blue-50 text-blue-600',
  low:    'bg-[#F0F3F3] text-[#727A84]',
}

const PROJECT_COLORS = ['#3b82f6','#22c55e','#f59e0b','#8b5cf6','#ec4899','#0C1629']

const VALUE_TAGS = [
  'Growth Mindset','Discipline','Creativity','Health First',
  'Financial Freedom','Deep Work','Relationships','Balance',
]

interface StagedTask {
  title: string
  priority: string
  estimated_minutes: number | null
}

interface Milestone {
  title: string
  description: string
  date: string
}

// ---------------------------------------------------------------------------
// Small reusable label
// ---------------------------------------------------------------------------
function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] font-bold text-[#B5C1C8] uppercase tracking-wider block">
      {children}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function GoalCreate() {
  const navigate = useNavigate()
  const { categories, createTask, fetchAll } = useWheelStore()
  const { projects, createProject, updateProject, fetchProjects } = useProjectStore()
  const { user } = useAuthStore()

  // ── Core Identity ──
  const [title, setTitle]           = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [timeline, setTimeline]     = useState<TimelineValue>('quarterly')
  const [why, setWhy]               = useState('')

  // ── Milestones ──
  const [milestones, setMilestones] = useState<Milestone[]>([
    { title: '', description: '', date: '' },
    { title: '', description: '', date: '' },
  ])

  // ── Tasks ──
  const [tasks, setTasks]             = useState<StagedTask[]>([])
  const [taskTitle, setTaskTitle]     = useState('')
  const [taskPriority, setTaskPriority] = useState('normal')
  const [taskTime, setTaskTime]       = useState<number | null>(30)

  // ── Strategic (right column) ──
  const [priority, setPriority]           = useState('')
  const [linkedProjectId, setLinkedProjectId] = useState<string | null>(null)
  const [showNewProject, setShowNewProject] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectColor, setNewProjectColor] = useState(PROJECT_COLORS[0])
  const [creatingProject, setCreatingProject] = useState(false)

  // ── Values ──
  const [values, setValues] = useState<string[]>([])
  const [notes, setNotes]   = useState('')

  // ── UI state ──
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<{ title?: string; category?: string }>({})

  // Bug fix 3: load projects on mount so dropdown is populated on direct nav
  useEffect(() => {
    if (user) fetchProjects(user.id)
  }, [user?.id])

  const activeCategories = categories.filter(c => c.is_active)
  const linkedProject    = projects.find(p => p.id === linkedProjectId)

  // ── Milestones helpers ──
  function updateMilestone(i: number, field: keyof Milestone, val: string) {
    setMilestones(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: val } : m))
  }
  function addMilestone() {
    setMilestones(prev => [...prev, { title: '', description: '', date: '' }])
  }
  function removeMilestone(i: number) {
    if (milestones.length <= 1) return
    setMilestones(prev => prev.filter((_, idx) => idx !== i))
  }

  // ── Task helpers ──
  function addTask() {
    if (!taskTitle.trim()) return
    setTasks(prev => [...prev, { title: taskTitle.trim(), priority: taskPriority, estimated_minutes: taskTime }])
    setTaskTitle('')
    setTaskPriority('normal')
    setTaskTime(30)
  }

  // ── Inline project create ──
  async function handleCreateProject() {
    if (!newProjectName.trim() || !user) return
    setCreatingProject(true)
    try {
      const created = await createProject({
        user_id: user.id, title: newProjectName.trim(), description: null,
        color: newProjectColor, status: 'active', goal_id: null, cover_url: null, target_date: null,
      })
      // Bug fix 2: pass userId to fetchProjects
      await fetchProjects(user.id)
      if (created) setLinkedProjectId(created.id)
      setNewProjectName('')
      setShowNewProject(false)
    } finally {
      setCreatingProject(false)
    }
  }

  // ── Save ──
  async function handleSave() {
    const errs: typeof errors = {}
    if (!title.trim()) errs.title = 'Goal name is required'
    if (!categoryId)   errs.category = 'Please select a category'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    try {
      const days = TIMELINE_OPTIONS.find(t => t.value === timeline)?.days ?? 90
      const target_date = new Date(Date.now() + days * 86400000).toISOString().split('T')[0]

      const { data: goal, error } = await supabase
        .from('goals')
        .insert({ user_id: user!.id, category_id: categoryId, title: title.trim(), description: why.trim() || null, project_id: linkedProjectId, status: 'active', target_date })
        .select()
        .single()

      if (error || !goal) throw error

      // Bug fix 4: keep project.goal_id in sync with goal.project_id
      if (linkedProjectId) {
        await updateProject(linkedProjectId, { goal_id: goal.id })
      }

      for (const t of tasks) {
        await createTask({ user_id: user!.id, goal_id: goal.id, category_id: categoryId, project_id: linkedProjectId, title: t.title, completed: false, priority: t.priority as any, energy: 2, estimated_minutes: t.estimated_minutes, due_date: null })
      }

      await fetchAll(user!.id)
      await fetchProjects(user!.id)
      navigate(`/goals/${goal.id}`)
    } catch (e) {
      console.error(e)
      setSaving(false)
    }
  }

  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-6 pb-10">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <button
          onClick={() => navigate('/goals')}
          className="inline-flex items-center gap-2 font-semibold text-[#727A84] hover:text-[#0C1629] transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          Goals
        </button>
        <span className="text-[#D6DCE0]">/</span>
        <span className="font-semibold text-[#0C1629]">New Goal</span>
      </div>

      {/* Page header — title + actions inline */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-[#0C1629] tracking-tight">Create Goal Blueprint</h1>
          <p className="text-sm text-[#727A84] mt-1">Define what you want to achieve and how you'll get there.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => navigate('/goals')}
            className="text-sm font-semibold text-[#727A84] bg-white card px-4 py-2.5 hover:bg-[#F0F3F3] transition-colors cursor-pointer"
          >
            Discard
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-[#0C1629] px-5 py-2.5 rounded-[10px] hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
          >
            <RocketLaunch size={15} weight="fill" />
            {saving ? 'Saving…' : 'Activate Blueprint'}
          </button>
        </div>
      </div>

      {/* ── Two-column grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ══ LEFT CARD ══════════════════════════════════════════════════════ */}
        <div className="lg:col-span-2 bg-white card p-6 space-y-6">

          {/* Goal name */}
          <div className="space-y-2">
            <Label>Goal Name</Label>
            <input
              value={title}
              onChange={e => { setTitle(e.target.value); setErrors(prev => ({ ...prev, title: undefined })) }}
              placeholder="What do you want to achieve?"
              className={cn(
                'w-full text-base font-semibold text-[#0C1629] placeholder-[#B5C1C8] bg-[#F0F3F3] rounded-[10px] px-4 py-3.5 outline-none focus:ring-2 focus:ring-[#0C1629]/10 transition-shadow',
                errors.title && 'ring-2 ring-red-300'
              )}
            />
            {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
          </div>

          <div className="border-t border-[#F0F3F3]" />

          {/* Category */}
          <div className="space-y-3">
            <Label>Category</Label>
            {errors.category && <p className="text-xs text-red-500">{errors.category}</p>}
            <div className="flex flex-wrap gap-2">
              {activeCategories.map(cat => {
                const color = CATEGORY_COLORS[cat.name] ?? '#727A84'
                const active = categoryId === cat.id
                return (
                  <button
                    key={cat.id}
                    onClick={() => { setCategoryId(cat.id); setErrors(prev => ({ ...prev, category: undefined })) }}
                    className={cn(
                      'px-3.5 py-2 text-xs font-semibold rounded-[10px] transition-all cursor-pointer border',
                      active ? 'text-white border-transparent' : 'bg-white text-[#727A84] border-[#D6DCE0] hover:bg-[#F0F3F3]'
                    )}
                    style={active ? { backgroundColor: color, borderColor: color } : {}}
                  >
                    {cat.name}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="border-t border-[#F0F3F3]" />

          {/* Timeline */}
          <div className="space-y-3">
            <Label>Timeline</Label>
            <div className="grid grid-cols-3 gap-3">
              {TIMELINE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setTimeline(opt.value)}
                  className={cn(
                    'flex flex-col items-center py-3 px-2 rounded-[10px] border text-center transition-all cursor-pointer',
                    timeline === opt.value
                      ? 'bg-[#0C1629] border-[#0C1629] text-white'
                      : 'bg-white border-[#D6DCE0] text-[#727A84] hover:bg-[#F0F3F3]'
                  )}
                >
                  <span className={cn('text-xs font-bold', timeline === opt.value ? 'text-white' : 'text-[#0C1629]')}>{opt.label}</span>
                  <span className={cn('text-[10px] mt-0.5', timeline === opt.value ? 'text-white/70' : 'text-[#B5C1C8]')}>{opt.sub}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-[#F0F3F3]" />

          {/* Why Statement */}
          <div className="space-y-2">
            <Label>The 'Why' Statement</Label>
            <textarea
              value={why}
              onChange={e => setWhy(e.target.value)}
              placeholder="What's the deeper reason behind this goal?"
              rows={3}
              className="w-full text-sm text-[#0C1629] placeholder-[#B5C1C8] bg-[#F0F3F3] rounded-[10px] px-4 py-3 outline-none focus:ring-2 focus:ring-[#0C1629]/10 transition-shadow resize-none"
            />
          </div>

          <div className="border-t border-[#F0F3F3]" />

          {/* Milestones */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Milestones &amp; Phases</Label>
              <button onClick={addMilestone} className="inline-flex items-center gap-1 text-[10px] font-bold text-[#727A84] hover:text-[#0C1629] transition-colors cursor-pointer uppercase tracking-wider">
                <Plus size={11} weight="bold" /> Add Phase
              </button>
            </div>
            <div className="space-y-3">
              {milestones.map((m, i) => (
                <div key={i} className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 items-start">
                  <div className="w-6 h-6 rounded-full bg-[#F0F3F3] flex items-center justify-center mt-2.5 shrink-0">
                    <span className="text-[9px] font-black text-[#727A84]">{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <input
                    value={m.title}
                    onChange={e => updateMilestone(i, 'title', e.target.value)}
                    placeholder="Phase title"
                    className="text-sm text-[#0C1629] placeholder-[#B5C1C8] bg-[#F0F3F3] rounded-[10px] px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#0C1629]/10 transition-shadow"
                  />
                  <input
                    type="date"
                    value={m.date}
                    onChange={e => updateMilestone(i, 'date', e.target.value)}
                    className="text-sm text-[#0C1629] bg-[#F0F3F3] rounded-[10px] px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#0C1629]/10 transition-shadow cursor-pointer"
                  />
                  <button
                    onClick={() => removeMilestone(i)}
                    disabled={milestones.length <= 1}
                    className="p-1.5 mt-1.5 hover:bg-[#F0F3F3] rounded-full transition-colors cursor-pointer disabled:opacity-30"
                  >
                    <X size={13} className="text-[#B5C1C8]" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-[#F0F3F3]" />

          {/* Tasks */}
          <div className="space-y-3">
            <Label>Tasks</Label>
            <p className="text-xs text-[#B5C1C8] -mt-1">Add tasks now — they'll be linked to this goal on save.</p>

            {/* Staged tasks */}
            {tasks.length > 0 && (
              <div className="space-y-2">
                {tasks.map((t, i) => (
                  <div key={i} className="flex items-center gap-3 bg-[#F0F3F3] rounded-[10px] px-4 py-2.5">
                    <CheckSquare size={14} className="text-[#B5C1C8] shrink-0" />
                    <span className="flex-1 text-sm font-medium text-[#0C1629]">{t.title}</span>
                    <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', TASK_PRIORITY_COLORS[t.priority])}>{t.priority}</span>
                    {t.estimated_minutes && (
                      <span className="text-[10px] text-[#B5C1C8]">{t.estimated_minutes}m</span>
                    )}
                    <button onClick={() => setTasks(prev => prev.filter((_, idx) => idx !== i))} className="p-1 hover:bg-white rounded-full transition-colors cursor-pointer">
                      <X size={12} className="text-[#B5C1C8]" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add task row */}
            <div className="flex items-center gap-2">
              <input
                value={taskTitle}
                onChange={e => setTaskTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addTask()}
                placeholder="Add a task…"
                className="flex-1 text-sm text-[#0C1629] placeholder-[#B5C1C8] bg-[#F0F3F3] rounded-[10px] px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#0C1629]/10 transition-shadow"
              />
              <select
                value={taskPriority}
                onChange={e => setTaskPriority(e.target.value)}
                className="text-xs font-semibold text-[#727A84] bg-[#F0F3F3] border border-[#D6DCE0] rounded-[10px] px-3 py-2.5 outline-none cursor-pointer"
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="normal">Normal</option>
                <option value="low">Low</option>
              </select>
              <select
                value={taskTime ?? ''}
                onChange={e => setTaskTime(e.target.value ? Number(e.target.value) : null)}
                className="text-xs font-semibold text-[#727A84] bg-[#F0F3F3] border border-[#D6DCE0] rounded-[10px] px-3 py-2.5 outline-none cursor-pointer"
              >
                <option value="">No est.</option>
                <option value="15">15m</option>
                <option value="30">30m</option>
                <option value="60">1h</option>
                <option value="90">90m</option>
                <option value="120">2h</option>
              </select>
              <button
                onClick={addTask}
                disabled={!taskTitle.trim()}
                className="p-2.5 bg-[#0C1629] text-white rounded-[10px] hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-30"
              >
                <Plus size={15} weight="bold" />
              </button>
            </div>
          </div>
        </div>

        {/* ══ RIGHT COLUMN ══════════════════════════════════════════════════ */}
        <div className="space-y-5">

          {/* Priority card */}
          <div className="bg-white card p-5 space-y-3">
            <Label>Priority</Label>
            <div className="grid grid-cols-2 gap-2">
              {PRIORITY_OPTIONS.map(opt => {
                const active = priority === opt.label
                return (
                  <button
                    key={opt.label}
                    onClick={() => setPriority(active ? '' : opt.label)}
                    className={cn(
                      'py-2.5 px-3 text-xs font-semibold rounded-[10px] border transition-all cursor-pointer text-left',
                      active ? 'text-white border-transparent' : 'bg-white border-[#D6DCE0] text-[#727A84] hover:bg-[#F0F3F3]'
                    )}
                    style={active ? { backgroundColor: opt.color, borderColor: opt.color } : {}}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Linked Project card */}
          <div className="bg-white card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Label>Linked Project</Label>
              {!showNewProject && (
                <button
                  onClick={() => setShowNewProject(true)}
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-[#727A84] hover:text-[#0C1629] transition-colors cursor-pointer uppercase tracking-wider"
                >
                  <Plus size={10} weight="bold" /> New
                </button>
              )}
            </div>

            {/* Linked project chip */}
            {linkedProject ? (
              <div className="flex items-center gap-2 bg-[#F0F3F3] rounded-[10px] px-3 py-2.5">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: linkedProject.color || '#0C1629' }} />
                <span className="flex-1 text-sm font-semibold text-[#0C1629] truncate">{linkedProject.title}</span>
                <button onClick={() => setLinkedProjectId(null)} className="p-0.5 hover:bg-[#D6DCE0] rounded-full transition-colors cursor-pointer">
                  <X size={12} className="text-[#727A84]" />
                </button>
              </div>
            ) : (
              <select
                value={linkedProjectId ?? ''}
                onChange={e => setLinkedProjectId(e.target.value || null)}
                className="w-full text-sm text-[#727A84] bg-[#F0F3F3] rounded-[10px] px-3 py-2.5 outline-none cursor-pointer border border-[#D6DCE0]"
              >
                <option value="">No project linked</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            )}

            {/* Inline project creation */}
            {showNewProject && (
              <div className="space-y-3 pt-1 border-t border-[#F0F3F3]">
                <input
                  value={newProjectName}
                  onChange={e => setNewProjectName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreateProject()}
                  placeholder="Project name…"
                  className="w-full text-sm text-[#0C1629] placeholder-[#B5C1C8] bg-[#F0F3F3] rounded-[10px] px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#0C1629]/10 transition-shadow"
                  autoFocus
                />
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#B5C1C8] uppercase tracking-wider shrink-0">Colour</span>
                  <div className="flex items-center gap-1.5">
                    {PROJECT_COLORS.map(c => (
                      <button
                        key={c}
                        onClick={() => setNewProjectColor(c)}
                        className={cn('w-5 h-5 rounded-full transition-transform cursor-pointer', newProjectColor === c && 'ring-2 ring-offset-1 ring-[#0C1629] scale-110')}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateProject}
                    disabled={!newProjectName.trim() || creatingProject}
                    className="flex-1 text-xs font-semibold text-white bg-[#0C1629] py-2 rounded-[8px] hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-40"
                  >
                    {creatingProject ? 'Creating…' : 'Create & Link'}
                  </button>
                  <button
                    onClick={() => { setShowNewProject(false); setNewProjectName('') }}
                    className="px-3 text-xs font-semibold text-[#727A84] bg-[#F0F3F3] rounded-[8px] hover:bg-[#D6DCE0] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Milestones icon reference card */}
          <div className="bg-white card p-5 space-y-3">
            <Label>Target Date Preview</Label>
            <div className="flex items-center gap-3 bg-[#F0F3F3] rounded-[10px] px-4 py-3">
              <CalendarBlank size={16} className="text-[#727A84] shrink-0" />
              <div>
                <p className="text-sm font-bold text-[#0C1629]">
                  {(() => {
                    const days = TIMELINE_OPTIONS.find(t => t.value === timeline)?.days ?? 90
                    const d = new Date(Date.now() + days * 86400000)
                    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                  })()}
                </p>
                <p className="text-[10px] text-[#B5C1C8] mt-0.5 capitalize">{timeline.replace('_', ' ')} goal</p>
              </div>
            </div>
          </div>

          {/* Values card */}
          <div className="bg-white card p-5 space-y-3">
            <Label>Values</Label>
            <div className="flex flex-wrap gap-2">
              {VALUE_TAGS.map(tag => {
                const active = values.includes(tag)
                return (
                  <button
                    key={tag}
                    onClick={() => setValues(prev => active ? prev.filter(v => v !== tag) : [...prev, tag])}
                    className={cn(
                      'text-xs font-semibold px-3 py-1.5 rounded-full transition-all cursor-pointer',
                      active ? 'bg-[#0C1629] text-white' : 'bg-[#F0F3F3] text-[#727A84] hover:bg-[#D6DCE0]'
                    )}
                  >
                    {tag}
                  </button>
                )
              })}
            </div>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any extra context or notes…"
              rows={2}
              className="w-full text-sm text-[#0C1629] placeholder-[#B5C1C8] bg-[#F0F3F3] rounded-[10px] px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#0C1629]/10 transition-shadow resize-none"
            />
          </div>

        </div>{/* end right column */}
      </div>{/* end grid */}
    </div>
  )
}
