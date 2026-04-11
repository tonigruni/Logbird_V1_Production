import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Fingerprint,
  ChartLine,
  ChartBar,
  Flag,
  CheckSquare,
  Leaf,
  Plus,
  X,
  Target,
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
  'Health': '#22c55e',
  'Career': '#3b82f6',
  'Finance': '#f59e0b',
  'Relationships': '#ec4899',
  'Personal Growth': '#8b5cf6',
  'Fun': '#f97316',
  'Physical Environment': '#06b6d4',
  'Family/Friends': '#ec4899',
}

const TIMELINE_OPTIONS = [
  { label: 'Quarterly (90 Days)', value: 'quarterly' },
  { label: 'Annual (365 Days)', value: 'annual' },
  { label: 'Multi-Year (2–5 Years)', value: 'multi_year' },
] as const
type TimelineValue = typeof TIMELINE_OPTIONS[number]['value']

const PRIORITY_OPTIONS = [
  { label: 'High Impact', bg: 'bg-blue-50', text: 'text-blue-700', activeBg: 'bg-blue-100' },
  { label: 'Low Effort', bg: 'bg-green-50', text: 'text-green-700', activeBg: 'bg-green-100' },
  { label: 'Core Value', bg: 'bg-purple-50', text: 'text-purple-700', activeBg: 'bg-purple-100' },
  { label: 'Urgent', bg: 'bg-red-50', text: 'text-red-700', activeBg: 'bg-red-100' },
]

const TASK_PRIORITY_OPTIONS = ['urgent', 'high', 'normal', 'low'] as const
type TaskPriorityOption = typeof TASK_PRIORITY_OPTIONS[number]

const TASK_PRIORITY_COLORS: Record<TaskPriorityOption, string> = {
  urgent: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  normal: 'bg-blue-100 text-blue-700',
  low: 'bg-gray-100 text-gray-600',
}

const TIME_OPTIONS = [
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '60 min', value: 60 },
  { label: '90 min', value: 90 },
  { label: '120 min', value: 120 },
]

const PRESET_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ec4899', '#8b5cf6', '#f97316']

const VALUES_TAGS = [
  'Growth Mindset',
  'Discipline',
  'Creativity',
  'Health First',
  'Financial Freedom',
  'Deep Work',
  'Relationships',
  'Balance',
]

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface KPIItem {
  id: string
  label: string
  value: string
}

interface DoneItem {
  id: string
  text: string
}

interface Phase {
  id: string
  title: string
  description: string
  date: string
}

interface TaskDraft {
  id: string
  title: string
  priority: TaskPriorityOption
  estimated_minutes: number
}

// ---------------------------------------------------------------------------
// Section Header
// ---------------------------------------------------------------------------

function SectionHeader({ icon, title, description }: {
  icon: React.ReactNode
  title: string
  description?: string
}) {
  return (
    <div className="flex items-start gap-3 mb-5">
      <div className="p-2 rounded-[10px] bg-[#F0F3F3] text-[#0C1629] shrink-0">
        {icon}
      </div>
      <div>
        <h2 className="text-sm font-bold text-[#0C1629]">{title}</h2>
        {description && <p className="text-xs text-[#727A84] mt-0.5">{description}</p>}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function GoalCreate() {
  const navigate = useNavigate()
  const { categories, createTask, fetchAll } = useWheelStore()
  const { projects, createProject } = useProjectStore()
  const { user } = useAuthStore()

  // ----- Core Identity -----
  const [title, setTitle] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [timeline, setTimeline] = useState<TimelineValue | ''>('')
  const [why, setWhy] = useState('')

  // ----- Strategic Alignment -----
  const [priority, setPriority] = useState('')
  const [linkedProjectId, setLinkedProjectId] = useState('')
  const [showProjectDropdown, setShowProjectDropdown] = useState(false)
  const [showNewProjectForm, setShowNewProjectForm] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectColor, setNewProjectColor] = useState(PRESET_COLORS[0])
  const [creatingProject, setCreatingProject] = useState(false)

  // ----- Success Metrics -----
  const [kpis, setKpis] = useState<KPIItem[]>([{ id: crypto.randomUUID(), label: '', value: '' }])
  const [doneItems, setDoneItems] = useState<DoneItem[]>([])

  // ----- Milestones -----
  const [phases, setPhases] = useState<Phase[]>([
    { id: crypto.randomUUID(), title: '', description: '', date: '' },
    { id: crypto.randomUUID(), title: '', description: '', date: '' },
  ])

  // ----- Tasks -----
  const [taskTitle, setTaskTitle] = useState('')
  const [taskPriority, setTaskPriority] = useState<TaskPriorityOption>('normal')
  const [taskMinutes, setTaskMinutes] = useState(30)
  const [tasks, setTasks] = useState<TaskDraft[]>([])

  // ----- Values -----
  const [selectedValues, setSelectedValues] = useState<string[]>([])
  const [notes, setNotes] = useState('')

  // ----- Errors & Loading -----
  const [errors, setErrors] = useState<{ title?: string; category?: string }>({})
  const [saving, setSaving] = useState(false)

  // ---------------------------------------------------------------------------
  // Derived
  // ---------------------------------------------------------------------------

  const linkedProject = projects.find(p => p.id === linkedProjectId) ?? null

  // ---------------------------------------------------------------------------
  // Handlers — KPIs
  // ---------------------------------------------------------------------------

  function addKPI() {
    setKpis(prev => [...prev, { id: crypto.randomUUID(), label: '', value: '' }])
  }

  function removeKPI(id: string) {
    setKpis(prev => prev.filter(k => k.id !== id))
  }

  function updateKPI(id: string, field: 'label' | 'value', val: string) {
    setKpis(prev => prev.map(k => k.id === id ? { ...k, [field]: val } : k))
  }

  // ---------------------------------------------------------------------------
  // Handlers — Done Items
  // ---------------------------------------------------------------------------

  function addDoneItem() {
    setDoneItems(prev => [...prev, { id: crypto.randomUUID(), text: '' }])
  }

  function removeDoneItem(id: string) {
    setDoneItems(prev => prev.filter(d => d.id !== id))
  }

  function updateDoneItem(id: string, text: string) {
    setDoneItems(prev => prev.map(d => d.id === id ? { ...d, text } : d))
  }

  // ---------------------------------------------------------------------------
  // Handlers — Phases
  // ---------------------------------------------------------------------------

  function addPhase() {
    setPhases(prev => [...prev, { id: crypto.randomUUID(), title: '', description: '', date: '' }])
  }

  function removePhase(id: string) {
    if (phases.length <= 1) return
    setPhases(prev => prev.filter(p => p.id !== id))
  }

  function updatePhase(id: string, field: keyof Omit<Phase, 'id'>, val: string) {
    setPhases(prev => prev.map(p => p.id === id ? { ...p, [field]: val } : p))
  }

  // ---------------------------------------------------------------------------
  // Handlers — Tasks
  // ---------------------------------------------------------------------------

  function addTask() {
    if (!taskTitle.trim()) return
    setTasks(prev => [...prev, {
      id: crypto.randomUUID(),
      title: taskTitle.trim(),
      priority: taskPriority,
      estimated_minutes: taskMinutes,
    }])
    setTaskTitle('')
    setTaskPriority('normal')
    setTaskMinutes(30)
  }

  function removeTask(id: string) {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  // ---------------------------------------------------------------------------
  // Handlers — New Project
  // ---------------------------------------------------------------------------

  async function handleCreateProject() {
    if (!newProjectName.trim() || !user) return
    setCreatingProject(true)
    try {
      const created = await createProject({
        user_id: user.id,
        title: newProjectName.trim(),
        description: null,
        color: newProjectColor,
        status: 'active',
        goal_id: null,
        cover_url: null,
        target_date: null,
      })
      if (created) {
        setLinkedProjectId(created.id)
        setShowNewProjectForm(false)
        setNewProjectName('')
        setNewProjectColor(PRESET_COLORS[0])
      }
    } finally {
      setCreatingProject(false)
    }
  }

  // ---------------------------------------------------------------------------
  // Save
  // ---------------------------------------------------------------------------

  async function handleSave() {
    const newErrors: typeof errors = {}
    if (!title.trim()) newErrors.title = 'Goal title is required.'
    if (!categoryId) newErrors.category = 'Please select a category.'
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    setErrors({})
    if (!user) return
    setSaving(true)

    try {
      const today = new Date()
      let target_date: string | null = null
      if (timeline === 'quarterly') {
        const d = new Date(today); d.setDate(d.getDate() + 90); target_date = d.toISOString().split('T')[0]
      } else if (timeline === 'annual') {
        const d = new Date(today); d.setDate(d.getDate() + 365); target_date = d.toISOString().split('T')[0]
      } else if (timeline === 'multi_year') {
        const d = new Date(today); d.setDate(d.getDate() + 730); target_date = d.toISOString().split('T')[0]
      }

      const { data: newGoal, error } = await supabase
        .from('goals')
        .insert({
          user_id: user.id,
          category_id: categoryId,
          title: title.trim(),
          description: why.trim() || null,
          project_id: linkedProjectId || null,
          status: 'active',
          target_date,
        })
        .select()
        .single()

      if (error || !newGoal) throw error ?? new Error('Failed to create goal')

      // Create tasks linked to new goal
      for (const t of tasks) {
        await createTask({
          user_id: user.id,
          goal_id: newGoal.id,
          category_id: categoryId,
          project_id: linkedProjectId || null,
          title: t.title,
          completed: false,
          priority: t.priority,
          energy: 2,
          estimated_minutes: t.estimated_minutes,
          due_date: null,
        })
      }

      await fetchAll(user.id)
      navigate(`/goals/${newGoal.id}`)
    } finally {
      setSaving(false)
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const activeCategories = categories.filter(c => c.is_active)

  return (
    <div className="pb-32 max-w-3xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-8">
        <button
          onClick={() => navigate('/goals')}
          className="inline-flex items-center gap-2 font-semibold text-[#727A84] hover:text-[#0C1629] transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          Goals
        </button>
        <span className="text-[#D6DCE0]">/</span>
        <span className="font-semibold text-[#0C1629]">New Blueprint</span>
      </div>

      {/* Page heading + title input */}
      <div className="mb-8 space-y-1">
        <div className="flex items-center gap-2 mb-3">
          <Target size={18} className="text-[#727A84]" />
          <span className="text-xs font-bold text-[#B5C1C8] uppercase tracking-wider">Goal Blueprint</span>
        </div>
        <input
          value={title}
          onChange={e => { setTitle(e.target.value); if (errors.title) setErrors(p => ({ ...p, title: undefined })) }}
          placeholder="Give your goal a name…"
          className={cn(
            'w-full text-2xl font-black text-[#0C1629] placeholder-[#D6DCE0] bg-transparent outline-none border-b-2 pb-3 transition-colors',
            errors.title ? 'border-red-400' : 'border-[#F0F3F3] focus:border-[#0C1629]'
          )}
        />
        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
      </div>

      <div className="space-y-5">
        {/* ------------------------------------------------------------------ */}
        {/* 1. Core Identity */}
        {/* ------------------------------------------------------------------ */}
        <div className="rounded-[15px] border border-[#D6DCE0] bg-white p-8">
          <SectionHeader
            icon={<Fingerprint size={18} />}
            title="Core Identity"
            description="Define the essence of this goal."
          />

          {/* Category */}
          <div className="space-y-2 mb-5">
            <label className="text-[10px] font-bold text-[#B5C1C8] uppercase tracking-wider block">
              Category
            </label>
            {errors.category && <p className="text-xs text-red-500">{errors.category}</p>}
            <div className="flex flex-wrap gap-2">
              {activeCategories.map(cat => {
                const color = CATEGORY_COLORS[cat.name] ?? '#727A84'
                const isSelected = categoryId === cat.id
                return (
                  <button
                    key={cat.id}
                    onClick={() => { setCategoryId(cat.id); if (errors.category) setErrors(p => ({ ...p, category: undefined })) }}
                    className={cn(
                      'px-3 py-1.5 text-xs font-semibold rounded-full border transition-all cursor-pointer',
                      isSelected
                        ? 'text-white border-transparent'
                        : 'text-[#727A84] border-[#D6DCE0] bg-[#F0F3F3] hover:border-current'
                    )}
                    style={isSelected ? { backgroundColor: color, borderColor: color } : {}}
                  >
                    {cat.name}
                  </button>
                )
              })}
              {activeCategories.length === 0 && (
                <p className="text-xs text-[#B5C1C8]">No active categories found.</p>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-2 mb-5">
            <label className="text-[10px] font-bold text-[#B5C1C8] uppercase tracking-wider block">
              Timeline
            </label>
            <div className="flex flex-wrap gap-2">
              {TIMELINE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setTimeline(opt.value)}
                  className={cn(
                    'px-4 py-2 text-xs font-semibold rounded-[10px] border transition-all cursor-pointer',
                    timeline === opt.value
                      ? 'bg-[#0C1629] text-white border-[#0C1629]'
                      : 'text-[#727A84] border-[#D6DCE0] bg-[#F0F3F3] hover:bg-white'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Why */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[#B5C1C8] uppercase tracking-wider block">
              The 'Why' Statement
            </label>
            <textarea
              value={why}
              onChange={e => setWhy(e.target.value)}
              placeholder="What's the deeper reason behind this goal?"
              rows={3}
              className="w-full text-sm text-[#0C1629] placeholder-[#B5C1C8] bg-[#F0F3F3] rounded-[10px] border border-[#D6DCE0] px-4 py-3 outline-none focus:ring-2 focus:ring-[#0C1629]/10 transition-shadow resize-none"
            />
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* 2. Strategic Alignment */}
        {/* ------------------------------------------------------------------ */}
        <div className="rounded-[15px] border border-[#D6DCE0] bg-white p-8">
          <SectionHeader
            icon={<ChartLine size={18} />}
            title="Strategic Alignment"
            description="Position this goal within your larger strategy."
          />

          {/* Priority */}
          <div className="space-y-2 mb-5">
            <label className="text-[10px] font-bold text-[#B5C1C8] uppercase tracking-wider block">
              Priority
            </label>
            <div className="flex flex-wrap gap-2">
              {PRIORITY_OPTIONS.map(opt => {
                const isSelected = priority === opt.label
                return (
                  <button
                    key={opt.label}
                    onClick={() => setPriority(isSelected ? '' : opt.label)}
                    className={cn(
                      'px-4 py-2 text-xs font-semibold rounded-[10px] border transition-all cursor-pointer',
                      isSelected
                        ? cn(opt.activeBg, opt.text, 'border-current')
                        : 'text-[#727A84] border-[#D6DCE0] bg-[#F0F3F3] hover:bg-white'
                    )}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Linked Project */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[#B5C1C8] uppercase tracking-wider block">
              Linked Project
            </label>

            {linkedProject ? (
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-white rounded-full"
                  style={{ backgroundColor: linkedProject.color ?? '#727A84' }}
                >
                  {linkedProject.title}
                  <button
                    onClick={() => setLinkedProjectId('')}
                    className="hover:opacity-70 transition-opacity cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </span>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <button
                    onClick={() => { setShowProjectDropdown(p => !p); setShowNewProjectForm(false) }}
                    className="px-4 py-2 text-xs font-semibold text-[#727A84] bg-[#F0F3F3] rounded-[10px] border border-[#D6DCE0] hover:bg-white transition-colors cursor-pointer"
                  >
                    Link Existing Project
                  </button>
                  {showProjectDropdown && (
                    <div className="absolute top-full left-0 mt-1 z-10 min-w-[200px] bg-white rounded-[10px] border border-[#D6DCE0] shadow-lg py-1">
                      {projects.length === 0 ? (
                        <p className="px-4 py-2 text-xs text-[#B5C1C8]">No projects found.</p>
                      ) : (
                        projects.map(p => (
                          <button
                            key={p.id}
                            onClick={() => { setLinkedProjectId(p.id); setShowProjectDropdown(false) }}
                            className="w-full text-left px-4 py-2 text-xs font-semibold text-[#0C1629] hover:bg-[#F0F3F3] transition-colors flex items-center gap-2 cursor-pointer"
                          >
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: p.color ?? '#727A84' }}
                            />
                            {p.title}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => { setShowNewProjectForm(p => !p); setShowProjectDropdown(false) }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#0C1629] bg-[#F0F3F3] rounded-[10px] border border-[#D6DCE0] hover:bg-white transition-colors cursor-pointer"
                >
                  <Plus size={12} />
                  Create New Project
                </button>
              </div>
            )}

            {/* Inline new project form */}
            {showNewProjectForm && (
              <div className="mt-3 p-4 rounded-[10px] border border-[#D6DCE0] bg-[#F0F3F3] space-y-3">
                <p className="text-[10px] font-bold text-[#B5C1C8] uppercase tracking-wider">New Project</p>
                <input
                  value={newProjectName}
                  onChange={e => setNewProjectName(e.target.value)}
                  placeholder="Project name…"
                  className="w-full text-sm text-[#0C1629] placeholder-[#B5C1C8] bg-white rounded-[10px] border border-[#D6DCE0] px-3 py-2 outline-none focus:ring-2 focus:ring-[#0C1629]/10 transition-shadow"
                />
                <div>
                  <p className="text-[10px] font-bold text-[#B5C1C8] uppercase tracking-wider mb-2">Color</p>
                  <div className="flex gap-2">
                    {PRESET_COLORS.map(c => (
                      <button
                        key={c}
                        onClick={() => setNewProjectColor(c)}
                        className={cn(
                          'w-6 h-6 rounded-full transition-transform cursor-pointer',
                          newProjectColor === c ? 'scale-125 ring-2 ring-offset-1 ring-[#0C1629]' : 'hover:scale-110'
                        )}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateProject}
                    disabled={!newProjectName.trim() || creatingProject}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#0C1629] rounded-[10px] hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {creatingProject ? 'Creating…' : 'Create & Link'}
                  </button>
                  <button
                    onClick={() => setShowNewProjectForm(false)}
                    className="px-4 py-2 text-xs font-semibold text-[#727A84] bg-white rounded-[10px] border border-[#D6DCE0] hover:bg-[#F0F3F3] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* 3. Success Metrics */}
        {/* ------------------------------------------------------------------ */}
        <div className="rounded-[15px] border border-[#D6DCE0] bg-white p-8">
          <SectionHeader
            icon={<ChartBar size={18} />}
            title="Success Metrics"
            description="How will you know this goal is complete?"
          />

          {/* KPIs */}
          <div className="space-y-2 mb-6">
            <label className="text-[10px] font-bold text-[#B5C1C8] uppercase tracking-wider block">
              KPIs
            </label>
            <div className="space-y-2">
              {kpis.map(kpi => (
                <div key={kpi.id} className="flex items-center gap-2">
                  <input
                    value={kpi.label}
                    onChange={e => updateKPI(kpi.id, 'label', e.target.value)}
                    placeholder="Metric label…"
                    className="flex-1 text-sm text-[#0C1629] placeholder-[#B5C1C8] bg-[#F0F3F3] rounded-[10px] border border-[#D6DCE0] px-3 py-2 outline-none focus:ring-2 focus:ring-[#0C1629]/10 transition-shadow"
                  />
                  <input
                    value={kpi.value}
                    onChange={e => updateKPI(kpi.id, 'value', e.target.value)}
                    placeholder="Target value…"
                    className="w-32 text-sm text-[#0C1629] placeholder-[#B5C1C8] bg-[#F0F3F3] rounded-[10px] border border-[#D6DCE0] px-3 py-2 outline-none focus:ring-2 focus:ring-[#0C1629]/10 transition-shadow"
                  />
                  <button
                    onClick={() => removeKPI(kpi.id)}
                    className="p-1.5 hover:bg-[#F0F3F3] rounded-full transition-colors cursor-pointer"
                  >
                    <X size={14} className="text-[#B5C1C8]" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={addKPI}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#727A84] hover:text-[#0C1629] transition-colors cursor-pointer mt-1"
            >
              <Plus size={14} />
              Add KPI
            </button>
          </div>

          {/* Definition of Done */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[#B5C1C8] uppercase tracking-wider block">
              Definition of Done
            </label>
            <div className="space-y-2">
              {doneItems.map(item => (
                <div key={item.id} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border border-[#D6DCE0] bg-white shrink-0" />
                  <input
                    value={item.text}
                    onChange={e => updateDoneItem(item.id, e.target.value)}
                    placeholder="Completion criterion…"
                    className="flex-1 text-sm text-[#0C1629] placeholder-[#B5C1C8] bg-[#F0F3F3] rounded-[10px] border border-[#D6DCE0] px-3 py-2 outline-none focus:ring-2 focus:ring-[#0C1629]/10 transition-shadow"
                  />
                  <button
                    onClick={() => removeDoneItem(item.id)}
                    className="p-1.5 hover:bg-[#F0F3F3] rounded-full transition-colors cursor-pointer"
                  >
                    <X size={14} className="text-[#B5C1C8]" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={addDoneItem}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#727A84] hover:text-[#0C1629] transition-colors cursor-pointer mt-1"
            >
              <Plus size={14} />
              Add Item
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* 4. Milestones & Phases */}
        {/* ------------------------------------------------------------------ */}
        <div className="rounded-[15px] border border-[#D6DCE0] bg-white p-8">
          <SectionHeader
            icon={<Flag size={18} />}
            title="Milestones & Phases"
            description="Break this goal into sequential phases."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {phases.map((phase, idx) => (
              <div key={phase.id} className="rounded-[10px] border border-[#D6DCE0] bg-[#F0F3F3] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#0C1629] text-white text-[10px] font-bold">
                    {idx + 1}
                  </span>
                  <button
                    onClick={() => removePhase(phase.id)}
                    disabled={phases.length <= 1}
                    className="p-1 hover:bg-white rounded-full transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <X size={13} className="text-[#B5C1C8]" />
                  </button>
                </div>
                <input
                  value={phase.title}
                  onChange={e => updatePhase(phase.id, 'title', e.target.value)}
                  placeholder="Phase title…"
                  className="w-full text-sm font-semibold text-[#0C1629] placeholder-[#B5C1C8] bg-white rounded-[10px] border border-[#D6DCE0] px-3 py-2 outline-none focus:ring-2 focus:ring-[#0C1629]/10 transition-shadow"
                />
                <textarea
                  value={phase.description}
                  onChange={e => updatePhase(phase.id, 'description', e.target.value)}
                  placeholder="Description…"
                  rows={2}
                  className="w-full text-xs text-[#0C1629] placeholder-[#B5C1C8] bg-white rounded-[10px] border border-[#D6DCE0] px-3 py-2 outline-none focus:ring-2 focus:ring-[#0C1629]/10 transition-shadow resize-none"
                />
                <input
                  type="date"
                  value={phase.date}
                  onChange={e => updatePhase(phase.id, 'date', e.target.value)}
                  className="w-full text-xs text-[#0C1629] bg-white rounded-[10px] border border-[#D6DCE0] px-3 py-2 outline-none focus:ring-2 focus:ring-[#0C1629]/10 transition-shadow cursor-pointer"
                />
              </div>
            ))}
          </div>

          <button
            onClick={addPhase}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#727A84] hover:text-[#0C1629] transition-colors cursor-pointer"
          >
            <Plus size={14} />
            Add Phase
          </button>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* 5. Tasks */}
        {/* ------------------------------------------------------------------ */}
        <div className="rounded-[15px] border border-[#D6DCE0] bg-white p-8">
          <SectionHeader
            icon={<CheckSquare size={18} />}
            title="Tasks"
            description="Add tasks directly to this goal — they'll be created and linked automatically."
          />

          {/* Task input row */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <input
              value={taskTitle}
              onChange={e => setTaskTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTask()}
              placeholder="Task title…"
              className="flex-1 min-w-[160px] text-sm text-[#0C1629] placeholder-[#B5C1C8] bg-[#F0F3F3] rounded-[10px] border border-[#D6DCE0] px-3 py-2 outline-none focus:ring-2 focus:ring-[#0C1629]/10 transition-shadow"
            />
            <select
              value={taskPriority}
              onChange={e => setTaskPriority(e.target.value as TaskPriorityOption)}
              className="text-xs font-semibold text-[#727A84] bg-[#F0F3F3] rounded-[10px] border border-[#D6DCE0] px-3 py-2 outline-none cursor-pointer"
            >
              {TASK_PRIORITY_OPTIONS.map(p => (
                <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
              ))}
            </select>
            <select
              value={taskMinutes}
              onChange={e => setTaskMinutes(Number(e.target.value))}
              className="text-xs font-semibold text-[#727A84] bg-[#F0F3F3] rounded-[10px] border border-[#D6DCE0] px-3 py-2 outline-none cursor-pointer"
            >
              {TIME_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button
              onClick={addTask}
              disabled={!taskTitle.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0C1629] rounded-[10px] hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus size={13} />
              Add
            </button>
          </div>

          {/* Task list */}
          {tasks.length > 0 && (
            <div className="space-y-2">
              {tasks.map(t => (
                <div key={t.id} className="flex items-center gap-3 bg-[#F0F3F3] rounded-[10px] px-4 py-2.5">
                  <span className="flex-1 text-sm font-semibold text-[#0C1629] truncate">{t.title}</span>
                  <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', TASK_PRIORITY_COLORS[t.priority])}>
                    {t.priority}
                  </span>
                  <span className="text-xs text-[#B5C1C8] shrink-0">{t.estimated_minutes}m</span>
                  <button
                    onClick={() => removeTask(t.id)}
                    className="p-1 hover:bg-white rounded-full transition-colors cursor-pointer shrink-0"
                  >
                    <X size={13} className="text-[#B5C1C8]" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* 6. Impact & Values */}
        {/* ------------------------------------------------------------------ */}
        <div className="rounded-[15px] border border-[#D6DCE0] bg-white p-8">
          <SectionHeader
            icon={<Leaf size={18} />}
            title="Impact & Values"
            description="Anchor this goal to your core values."
          />

          {/* Value tags */}
          <div className="space-y-2 mb-5">
            <label className="text-[10px] font-bold text-[#B5C1C8] uppercase tracking-wider block">
              Values
            </label>
            <div className="flex flex-wrap gap-2">
              {VALUES_TAGS.map(tag => {
                const isSelected = selectedValues.includes(tag)
                return (
                  <button
                    key={tag}
                    onClick={() => setSelectedValues(prev =>
                      isSelected ? prev.filter(v => v !== tag) : [...prev, tag]
                    )}
                    className={cn(
                      'px-3 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer',
                      isSelected
                        ? 'bg-[#0C1629] text-white'
                        : 'bg-[#F0F3F3] text-[#727A84] hover:bg-[#E8EDEF]'
                    )}
                  >
                    {tag}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Personal notes */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[#B5C1C8] uppercase tracking-wider block">
              Personal Notes
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any extra context or personal reflections…"
              rows={3}
              className="w-full text-sm text-[#0C1629] placeholder-[#B5C1C8] bg-[#F0F3F3] rounded-[10px] border border-[#D6DCE0] px-4 py-3 outline-none focus:ring-2 focus:ring-[#0C1629]/10 transition-shadow resize-none"
            />
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* Sticky Bottom Bar */}
      {/* -------------------------------------------------------------------- */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#D6DCE0] px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={() => navigate('/goals')}
            className="text-sm font-semibold text-[#727A84] hover:text-[#0C1629] transition-colors cursor-pointer"
          >
            Discard
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#0C1629] rounded-[10px] hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Target size={16} weight="fill" />
            {saving ? 'Activating…' : 'Activate Blueprint'}
          </button>
        </div>
      </div>
    </div>
  )
}
