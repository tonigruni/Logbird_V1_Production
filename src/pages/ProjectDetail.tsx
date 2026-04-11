import { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Lightning,
  ArrowRight,
  CheckCircle,
  Clock,
  Circle,
  Target,
  CheckSquare,
  PaperPlaneTilt,
  Plus,
  PaintBrush,
} from '@phosphor-icons/react'
import { cn } from '../lib/utils'
import { useWheelStore } from '../stores/wheelStore'
import { useProjectStore } from '../stores/projectStore'
import type { Project } from '../stores/projectStore'
import { useAuthStore } from '../stores/authStore'
import type { Task as StoreTask } from '../stores/wheelStore'
import { Popover, PopoverTrigger, PopoverContent, PopoverBody } from '../components/ui/popover'
import { CARD_PALETTE_OPTIONS, ICON_OPTIONS, ICON_MAP } from './ProjectsOverview'
import { LogbirdDateRangePicker } from '../components/ui/date-range-picker'

// ---------------------------------------------------------------------------
// Palette helpers
// ---------------------------------------------------------------------------

const CARD_PALETTES = ['#f6fee7', '#f0faff', '#f1f8f4', '#fff7eb', '#fafaf9', '#fef6ee']
function paletteColor(id: string) {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  return CARD_PALETTES[hash % CARD_PALETTES.length]
}

// ---------------------------------------------------------------------------
// Status helpers
// ---------------------------------------------------------------------------

const PRIORITY_STYLES: Record<string, { bg: string; text: string }> = {
  urgent: { bg: 'bg-[#dc2626]/10', text: 'text-[#dc2626]' },
  high:   { bg: 'bg-[#f59e0b]/10', text: 'text-[#f59e0b]' },
  normal: { bg: 'bg-[#0C1629]/10', text: 'text-[#0C1629]' },
  low:    { bg: 'bg-[#B5C1C8]/10', text: 'text-[#727A84]' },
}

// ---------------------------------------------------------------------------
// Task row
// ---------------------------------------------------------------------------

function TaskRow({ task, goalTitle, accentColor, onToggle, onClick }: {
  task: StoreTask
  goalTitle: string | null
  accentColor: string
  onToggle: (e: React.MouseEvent) => void
  onClick: () => void
}) {
  const p = PRIORITY_STYLES[task.priority] ?? PRIORITY_STYLES.normal
  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-4 px-5 py-4 bg-white card group cursor-pointer transition-all duration-300',
        task.completed ? 'opacity-60' : 'hover:shadow-[0_20px_40px_rgba(7,33,51,0.05)]'
      )}
    >
      <button
        onClick={onToggle}
        className="shrink-0 cursor-pointer"
      >
        {task.completed
          ? <CheckCircle size={22} weight="fill" className="text-[#22c55e]" />
          : <Circle size={22} weight="regular" className="text-[#c3c7cd] hover:text-[#0C1629] transition-colors" />
        }
      </button>
      <div className="flex-1 min-w-0">
        <h4 className={cn(
          'text-sm font-bold leading-snug',
          task.completed ? 'line-through text-[#B5C1C8]' : 'text-[#0C1629]'
        )}>
          {task.title}
        </h4>
        {goalTitle && (
          <p className="text-[11px] text-[#B5C1C8] mt-0.5 flex items-center gap-1">
            <Target size={10} />
            {goalTitle}
          </p>
        )}
      </div>
      <span className={cn('text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0', p.bg, p.text)}>
        {task.priority}
      </span>
      <ArrowRight size={14} className="text-[#c3c7cd] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Add Task Form
// ---------------------------------------------------------------------------

function AddTaskForm({ accentColor, goals, onAdd }: {
  accentColor: string
  goals: Array<{ id: string; title: string }>
  onAdd: (title: string, goalId: string | null) => void
}) {
  const [title, setTitle] = useState('')
  const [goalId, setGoalId] = useState<string>('')
  const [isOpen, setIsOpen] = useState(false)

  function handleSubmit() {
    if (!title.trim()) return
    onAdd(title.trim(), goalId || null)
    setTitle('')
    setGoalId('')
    setIsOpen(false)
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-center gap-1.5 py-3 card !border-2 !border-dashed !border-[#D6DCE0] text-xs font-semibold text-[#B5C1C8] hover:border-[#0C1629]/30 hover:text-[#0C1629] hover:bg-[#0C1629]/[0.02] transition-all cursor-pointer"
      >
        <Plus size={12} weight="bold" />
        Add Task to Project
      </button>
    )
  }

  return (
    <div className="bg-white card p-5 space-y-3">
      <h4 className="text-[10px] font-bold text-[#B5C1C8] uppercase tracking-wider">New Task</h4>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        placeholder="Task title..."
        className="w-full text-sm text-[#0C1629] placeholder-[#B5C1C8] bg-[#F0F3F3] rounded-[10px] px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#0C1629]/10"
        autoFocus
      />
      <div className="flex items-center gap-3">
        <select
          value={goalId}
          onChange={(e) => setGoalId(e.target.value)}
          className="flex-1 text-xs font-semibold text-[#727A84] bg-[#F0F3F3] px-3 py-2 rounded-[10px] border-none outline-none cursor-pointer"
        >
          <option value="">No goal linked</option>
          {goals.map((g) => (
            <option key={g.id} value={g.id}>{g.title}</option>
          ))}
        </select>
        <button
          onClick={handleSubmit}
          disabled={!title.trim()}
          className="flex items-center gap-1.5 text-xs font-semibold text-white px-4 py-2 rounded-[10px] transition-opacity cursor-pointer disabled:opacity-40"
          style={{ backgroundColor: accentColor }}
        >
          <PaperPlaneTilt size={13} weight="fill" />
          Add
        </button>
        <button
          onClick={() => { setIsOpen(false); setTitle(''); setGoalId('') }}
          className="text-xs font-semibold text-[#B5C1C8] hover:text-[#0C1629] transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Metadata card
// ---------------------------------------------------------------------------

function MetaCard({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="bg-white card p-5">
      <span className="text-[10px] font-bold text-[#B5C1C8] uppercase tracking-wider block mb-1">{label}</span>
      <span className="text-sm font-bold text-[#0C1629]" style={color ? { color } : undefined}>{value}</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { projects, fetchProjects, updateProject } = useProjectStore()
  const { tasks, goals, fetchAll, createTask, toggleTask } = useWheelStore()

  useEffect(() => {
    if (user) {
      fetchProjects(user.id)
      fetchAll(user.id)
    }
  }, [user?.id])

  const project = useMemo(() => projects.find((p) => p.id === id), [projects, id])
  const accentColor = project?.color || '#0C1629'

  const projectTasks = useMemo(
    () => tasks.filter((t) => t.project_id === id),
    [tasks, id]
  )

  const linkedGoal = useMemo(
    () => (project?.goal_id ? goals.find((g) => g.id === project.goal_id) ?? null : null),
    [goals, project]
  )

  const allGoals = useMemo(() => goals.map((g) => ({ id: g.id, title: g.title })), [goals])
  const goalMap = useMemo(() => Object.fromEntries(goals.map((g) => [g.id, g])), [goals])

  const completedCount = projectTasks.filter((t) => t.completed).length
  const progress = projectTasks.length > 0 ? Math.round((completedCount / projectTasks.length) * 100) : 0

  const [linkGoalId, setLinkGoalId] = useState('')
  const [editingTitle, setEditingTitle] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editingDesc, setEditingDesc] = useState(false)
  const [editDesc, setEditDesc] = useState('')

  function handleAddTask(title: string, goalId: string | null) {
    if (!user || !project) return
    createTask({
      user_id: user.id,
      goal_id: goalId,
      category_id: null,
      project_id: project.id,
      title,
      completed: false,
      priority: 'normal',
      energy: 2,
      estimated_minutes: null,
      due_date: null,
    })
  }

  if (!project) {
    return (
      <div className="space-y-8 pb-24">
        <button
          onClick={() => navigate('/projects')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#727A84] hover:text-[#0C1629] transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          Back to Projects
        </button>
        <div className="text-center py-16">
          <p className="text-sm text-[#B5C1C8]">Project not found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-24">
      {/* Back button */}
      <button
        onClick={() => navigate('/projects')}
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#727A84] hover:text-[#0C1629] transition-colors cursor-pointer"
      >
        <ArrowLeft size={16} />
        Back to Projects
      </button>

      {/* Hero card */}
      <div className="card overflow-hidden relative" style={{ backgroundColor: project.card_color || paletteColor(project.id) }}>

        {/* Customise picker — top right */}
        <div className="absolute top-4 right-4 z-10">
          <Popover>
            <PopoverTrigger asChild>
              <button className="w-8 h-8 flex items-center justify-center rounded-[10px] bg-[#0C1629]/[0.06] hover:bg-[#0C1629]/10 text-[#727A84] transition-colors cursor-pointer" aria-label="Customise card">
                <PaintBrush size={14} />
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-64 p-0">
              <PopoverBody className="p-3 space-y-3">
                <p className="text-[10px] font-bold text-[#B5C1C8] uppercase tracking-wider">Card Color</p>
                <div className="grid grid-cols-5 gap-2">
                  {CARD_PALETTE_OPTIONS.map(c => (
                    <button
                      key={c}
                      onClick={() => updateProject(project.id, { card_color: c })}
                      className={cn(
                        'w-9 h-9 rounded-[8px] border-2 transition-all cursor-pointer',
                        (project.card_color || paletteColor(project.id)) === c ? 'border-[#0C1629] scale-110' : 'border-transparent hover:border-[#D6DCE0]'
                      )}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <p className="text-[10px] font-bold text-[#B5C1C8] uppercase tracking-wider pt-1">Icon</p>
                <div className="overflow-y-auto max-h-52 scrollbar-hide">
                  <div className="grid grid-cols-5 gap-1.5">
                    {ICON_OPTIONS.map(({ name, Icon }) => (
                      <button
                        key={name}
                        onClick={() => updateProject(project.id, { card_icon: name })}
                        title={name}
                        className={cn(
                          'w-9 h-9 flex items-center justify-center rounded-[8px] transition-all cursor-pointer',
                          (project.card_icon || 'Kanban') === name
                            ? 'bg-[#0C1629] text-white'
                            : 'bg-[#0C1629]/[0.06] text-[#727A84] hover:bg-[#0C1629]/10 hover:text-[#0C1629]'
                        )}
                      >
                        <Icon size={15} />
                      </button>
                    ))}
                  </div>
                </div>
              </PopoverBody>
            </PopoverContent>
          </Popover>
        </div>

        <div className="p-8 md:p-10">
          {/* Icon + status */}
          <div className="flex items-center gap-2 mb-4">
            {(() => { const HeroIcon = ICON_MAP[project.card_icon || ''] || Kanban; return <HeroIcon size={16} weight="bold" className="text-[#0C1629] shrink-0" /> })()}
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-[#0C1629]/10 text-[#0C1629]">
              {project.status.replace('_', ' ')}
            </span>
          </div>

          {editingTitle ? (
            <input
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              onBlur={() => { updateProject(project.id, { title: editTitle.trim() || project.title }); setEditingTitle(false) }}
              onKeyDown={e => { if (e.key === 'Enter') { updateProject(project.id, { title: editTitle.trim() || project.title }); setEditingTitle(false) } if (e.key === 'Escape') setEditingTitle(false) }}
              className="text-2xl md:text-3xl font-black text-[#0C1629] tracking-tight mb-3 bg-transparent border-b-2 border-[#0C1629]/30 focus:border-[#0C1629] outline-none w-full max-w-2xl"
              autoFocus
            />
          ) : (
            <h1
              onClick={() => { setEditingTitle(true); setEditTitle(project.title) }}
              className="text-2xl md:text-3xl font-black text-[#0C1629] tracking-tight mb-3 cursor-text hover:opacity-75 transition-opacity"
            >
              {project.title}
            </h1>
          )}

          {editingDesc ? (
            <textarea
              value={editDesc}
              onChange={e => setEditDesc(e.target.value)}
              onBlur={() => { updateProject(project.id, { description: editDesc.trim() || null }); setEditingDesc(false) }}
              onKeyDown={e => { if (e.key === 'Escape') { updateProject(project.id, { description: editDesc.trim() || null }); setEditingDesc(false) } }}
              rows={3}
              className="text-sm text-[#727A84] leading-relaxed max-w-2xl bg-transparent border-b border-[#D6DCE0] focus:border-[#0C1629]/40 outline-none w-full resize-none"
              autoFocus
            />
          ) : (
            <p
              onClick={() => { setEditingDesc(true); setEditDesc(project.description || '') }}
              className="text-sm text-[#727A84] leading-relaxed max-w-2xl cursor-text hover:opacity-75 transition-opacity min-h-[1.5rem]"
            >
              {project.description || <span className="italic opacity-40">Add a description…</span>}
            </p>
          )}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Main column — Tasks */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#0C1629] tracking-tight">
              Tasks
              <span className="ml-2 text-xs font-semibold text-[#B5C1C8]">{projectTasks.length}</span>
            </h2>
            {projectTasks.length > 0 && (
              <span className="text-xs text-[#B5C1C8]">
                {completedCount}/{projectTasks.length} done
              </span>
            )}
          </div>

          {projectTasks.length === 0 && (
            <p className="text-sm text-[#B5C1C8] py-4">No tasks yet — add the first one below.</p>
          )}

          <div className="space-y-2">
            {projectTasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                goalTitle={task.goal_id ? goalMap[task.goal_id]?.title ?? null : null}
                accentColor={accentColor}
                onToggle={(e) => { e.stopPropagation(); toggleTask(task.id, !task.completed) }}
                onClick={() => navigate(`/tasks/${task.id}`)}
              />
            ))}
          </div>

          <AddTaskForm
            accentColor={accentColor}
            goals={allGoals}
            onAdd={handleAddTask}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <h2 className="text-base font-bold text-[#0C1629] tracking-tight">Details</h2>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-3">
            {/* Status — editable select */}
            <div className="bg-white card p-5">
              <span className="text-[10px] font-bold text-[#B5C1C8] uppercase tracking-wider block mb-1">Status</span>
              <select
                value={project.status}
                onChange={e => updateProject(project.id, { status: e.target.value as Project['status'] })}
                className="text-sm font-bold text-[#0C1629] bg-transparent border-none outline-none cursor-pointer w-full -ml-0.5"
              >
                <option value="active">Active</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <MetaCard label="Tasks" value={projectTasks.length} />

            {/* Project Dates — editable range, full width */}
            <div className="col-span-2 bg-white card p-5">
              <LogbirdDateRangePicker
                label="Timeline"
                value={{ start: project.start_date ?? null, end: project.end_date ?? null }}
                onChange={({ start, end }) =>
                  updateProject(project.id, { start_date: start, end_date: end })
                }
              />
            </div>

            {/* Progress — read-only, full width */}
            <div className="col-span-2 bg-white card p-5">
              <span className="text-[10px] font-bold text-[#B5C1C8] uppercase tracking-wider block mb-2">Progress</span>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-[#0C1629]/10 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-[#0C1629] transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
                <span className="text-sm font-bold text-[#0C1629]">{progress}%</span>
              </div>
            </div>
          </div>

          {/* Linked Goal */}
          <div className="bg-white card p-5 space-y-3">
            <h3 className="text-[10px] font-bold text-[#B5C1C8] uppercase tracking-wider">Linked Goal</h3>
            {linkedGoal ? (
              <>
                <button
                  onClick={() => navigate(`/goals/${linkedGoal.id}`)}
                  className="w-full flex items-center gap-3 text-left hover:bg-[#F0F3F3] px-3 py-2 rounded-[10px] transition-colors cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0" style={{ backgroundColor: accentColor + '20' }}>
                    <Target size={14} style={{ color: accentColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#0C1629] truncate">{linkedGoal.title}</p>
                    <p className="text-[10px] text-[#B5C1C8] capitalize">{linkedGoal.status}</p>
                  </div>
                  <ArrowRight size={12} className="text-[#B5C1C8] opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                <button
                  onClick={() => updateProject(project.id, { goal_id: null })}
                  className="text-[10px] font-semibold text-[#B5C1C8] hover:text-[#dc2626] transition-colors cursor-pointer"
                >
                  Unlink goal
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-[#B5C1C8] italic">No goal linked</p>
                <select
                  value={linkGoalId}
                  onChange={async (e) => {
                    if (!e.target.value) return
                    setLinkGoalId(e.target.value)
                    await updateProject(project.id, { goal_id: e.target.value })
                    setLinkGoalId('')
                  }}
                  className="w-full text-xs font-semibold text-[#727A84] bg-[#F0F3F3] px-3 py-2.5 rounded-[10px] border-none outline-none cursor-pointer"
                >
                  <option value="">Link a goal...</option>
                  {goals.map((g) => (
                    <option key={g.id} value={g.id}>{g.title}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
