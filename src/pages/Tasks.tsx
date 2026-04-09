import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import {
  Lightning,
  CheckCircle,
  Circle,
  SortAscending,
  ListBullets,
  SquaresFour,
  Target,
  ArrowRight,
  PaperPlaneTilt,
  PencilSimpleLine,
  ChartBar,
  Kanban,
  CaretDown,
  FunnelSimple,
  X,
  FloppyDisk,
  CalendarBlank,
  Trash,
} from '@phosphor-icons/react'
import { cn } from '../lib/utils'
import BoardView from '../components/BoardView'
import type { BoardColumn } from '../components/BoardView'
import TaskCreateModal from '../components/TaskCreateModal'
import GradientBarsBackground from '../components/ui/GradientBarsBackground'
import { useWheelStore } from '../stores/wheelStore'
import { useAuthStore } from '../stores/authStore'
import type { Task, TaskPriority } from '../stores/wheelStore'

// ---------------------------------------------------------------------------
// Project lookup (demo) — maps project_id to displayable info
// ---------------------------------------------------------------------------

const PROJECT_MAP: Record<string, { title: string; slug: string; color: string; completion: number }> = {
  'proj-identity-redesign': { title: 'Identity Redesign', slug: 'identity-redesign', color: '#1F3649', completion: 75 },
  'proj-focus-mastery': { title: 'Focus Mastery', slug: 'focus-mastery', color: '#22c55e', completion: 30 },
  'proj-senior-track': { title: 'Senior Track Prep', slug: 'senior-track-prep', color: '#1F3649', completion: 90 },
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const PRIORITY_ORDER: Record<TaskPriority, number> = { urgent: 0, high: 1, normal: 2, low: 3 }

const PRIORITY_STYLES: Record<TaskPriority, { label: string; bg: string; text: string }> = {
  urgent: { label: 'Urgent', bg: 'bg-[#dc2626]/10', text: 'text-[#dc2626]' },
  high:   { label: 'High',   bg: 'bg-[#f59e0b]/10', text: 'text-[#f59e0b]' },
  normal: { label: 'Normal', bg: 'bg-[#1F3649]/10', text: 'text-[#1F3649]' },
  low:    { label: 'Low',    bg: 'bg-[#adb3b4]/10', text: 'text-[#adb3b4]' },
}

function formatTime(minutes: number | null): string {
  if (!minutes) return ''
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  return m > 0 ? `${h}h ${m.toString().padStart(2, '0')}m` : `${h}h`
}

function EnergyDots({ level }: { level: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3].map(i => (
        <Lightning
          key={i}
          size={10}
          weight="fill"
          className={i <= level ? 'text-[#f59e0b]' : 'text-[#e8eaeb]'}
        />
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Task Row — with links to goal & project
// ---------------------------------------------------------------------------

function TaskRow({
  task,
  goalTitle,
  categoryName,
  projectSlug,
  onToggle,
}: {
  task: Task
  goalTitle: string | null
  categoryName: string | null
  projectSlug: string | null
  onToggle: () => void
}) {
  const navigate = useNavigate()
  const priority = PRIORITY_STYLES[task.priority]
  const project = task.project_id ? PROJECT_MAP[task.project_id] : null

  return (
    <div
      onClick={() => navigate(`/tasks/${task.id}`)}
      className={cn(
        'flex items-center gap-4 px-5 py-4 bg-white card group transition-all duration-300 cursor-pointer',
        task.completed
          ? 'opacity-60'
          : 'hover:shadow-[0_20px_40px_rgba(7,33,51,0.05)]'
      )}
    >
      {/* Checkbox */}
      <button onClick={e => { e.stopPropagation(); onToggle() }} className="shrink-0 cursor-pointer">
        {task.completed
          ? <CheckCircle size={22} weight="fill" className="text-[#22c55e]" />
          : <Circle size={22} weight="regular" className="text-[#c3c7cd] hover:text-[#1F3649] transition-colors" />
        }
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className={cn(
          'text-sm font-bold leading-snug group-hover:text-[#1F3649] transition-colors',
          task.completed ? 'line-through text-[#adb3b4]' : 'text-[#2d3435]'
        )}>
          {task.title}
        </h4>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {categoryName && (
            <span className="text-[10px] font-bold text-[#5a6061] uppercase tracking-wider">{categoryName}</span>
          )}
          {goalTitle && (
            <button
              onClick={e => { e.stopPropagation(); navigate('/goals') }}
              className="flex items-center gap-1 text-[10px] font-semibold text-[#adb3b4] hover:text-[#1F3649] transition-colors cursor-pointer"
            >
              <Target size={10} />
              {goalTitle}
            </button>
          )}
        </div>
      </div>

      {/* Energy */}
      <div className="hidden sm:flex items-center gap-1.5 shrink-0">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#adb3b4]">Energy</span>
        <EnergyDots level={task.energy} />
      </div>

      {/* Priority */}
      <span className={cn(
        'hidden md:inline-flex text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0',
        priority.bg, priority.text
      )}>
        {priority.label}
      </span>

      {/* Time */}
      {task.estimated_minutes && (
        <span className="hidden lg:inline text-[10px] font-bold text-[#adb3b4] shrink-0">
          {formatTime(task.estimated_minutes)}
        </span>
      )}

      {/* Project link */}
      {project && projectSlug && (
        <button
          onClick={e => { e.stopPropagation(); navigate(`/projects/${projectSlug}`) }}
          className="hidden xl:flex items-center gap-1 text-[10px] font-semibold hover:underline shrink-0 cursor-pointer"
          style={{ color: project.color }}
        >
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: project.color }} />
          {project.title}
          <ArrowRight size={10} />
        </button>
      )}

      {/* Edit arrow */}
      <ArrowRight size={14} className="text-[#c3c7cd] group-hover:text-[#1F3649] transition-colors shrink-0" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sidebar panels
// ---------------------------------------------------------------------------

function GoalLinkedPanel({ goalTitle, project }: {
  goalTitle: string
  project: { title: string; slug: string; color: string; completion: number } | null
}) {
  const navigate = useNavigate()

  return (
    <div className="bg-white card p-5 space-y-3">
      <h3 className="text-[10px] font-bold text-[#adb3b4] uppercase tracking-wider">Focus Goal Linked</h3>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-[10px] flex items-center justify-center"
          style={{ backgroundColor: (project?.color || '#1F3649') + '15' }}
        >
          <Target size={14} style={{ color: project?.color || '#1F3649' }} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-[#2d3435]">{goalTitle}</p>
          {project && <p className="text-[10px] text-[#adb3b4]">Active Project • {project.completion}% Complete</p>}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/goals')}
          className="text-xs font-semibold flex items-center gap-1 hover:gap-2 transition-all cursor-pointer text-[#1F3649]"
        >
          <Target size={12} />
          View Goal
          <ArrowRight size={12} />
        </button>
        {project && (
          <button
            onClick={() => navigate(`/projects/${project.slug}`)}
            className="text-xs font-semibold flex items-center gap-1 hover:gap-2 transition-all cursor-pointer"
            style={{ color: project.color }}
          >
            <Kanban size={12} />
            View Project
            <ArrowRight size={12} />
          </button>
        )}
      </div>
    </div>
  )
}

function EnergyInsightPanel({ tasks }: { tasks: Task[] }) {
  const highEnergyRemaining = tasks.filter(t => !t.completed && t.energy === 3).length
  return (
    <div className="bg-white card p-5 space-y-3">
      <div className="flex items-center gap-2">
        <ChartBar size={14} className="text-[#1F3649]" />
        <h3 className="text-[10px] font-bold text-[#adb3b4] uppercase tracking-wider">Energy Insight</h3>
      </div>
      <p className="text-xs text-[#5a6061] leading-relaxed">
        You have <strong className="text-[#2d3435]">{highEnergyRemaining} high-energy tasks</strong> remaining.
        Your historical peak energy is between <strong className="text-[#2d3435]">9:00 AM – 11:30 AM</strong>.
      </p>
    </div>
  )
}

function QuickCapturePanel({ onAdd }: { onAdd: (title: string) => void }) {
  const [value, setValue] = useState('')

  function handleSubmit() {
    if (!value.trim()) return
    onAdd(value.trim())
    setValue('')
  }

  return (
    <div className="bg-white card p-5 space-y-3">
      <h3 className="text-[10px] font-bold text-[#adb3b4] uppercase tracking-wider">Quick Capture</h3>
      <div className="flex items-center gap-2">
        <input
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder="Add a task..."
          className="flex-1 text-sm text-[#2d3435] placeholder-[#adb3b4] bg-transparent outline-none"
        />
        <button
          onClick={handleSubmit}
          className="w-8 h-8 rounded-full bg-[#1F3649] flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer shrink-0"
        >
          <PaperPlaneTilt size={14} weight="fill" className="text-white" />
        </button>
      </div>
      <p className="text-[10px] text-[#adb3b4]">Press Enter or click to add</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Undo toast
// ---------------------------------------------------------------------------

function UndoToast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[#2d3435] text-white px-5 py-3 rounded-[15px] shadow-lg flex items-center gap-3 text-sm font-semibold animate-in fade-in slide-in-from-bottom-4">
      <span>{message}</span>
      <span className="text-[#adb3b4] text-xs">⌘Z to undo</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Side panel for task detail (board view)
// ---------------------------------------------------------------------------

const SIDE_PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Med' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urg' },
]

const SIDE_PRIORITY_STYLES: Record<TaskPriority, string> = {
  low: 'bg-[#adb3b4]/10 text-[#adb3b4]',
  normal: 'bg-[#1F3649]/10 text-[#1F3649]',
  high: 'bg-[#f59e0b]/10 text-[#f59e0b]',
  urgent: 'bg-[#dc2626]/10 text-[#dc2626]',
}

const SIDE_PRIORITY_ACTIVE: Record<TaskPriority, string> = {
  low: 'bg-[#adb3b4] text-white',
  normal: 'bg-[#1F3649] text-white',
  high: 'bg-[#f59e0b] text-white',
  urgent: 'bg-[#dc2626] text-white',
}

const TIME_OPTIONS = [
  { label: '30m', minutes: 30 },
  { label: '1h', minutes: 60 },
  { label: '2h', minutes: 120 },
  { label: '4h+', minutes: 240 },
]

const PROJECT_OPTIONS = [
  { id: 'proj-identity-redesign', title: 'Identity Redesign' },
  { id: 'proj-focus-mastery', title: 'Focus Mastery' },
  { id: 'proj-senior-track', title: 'Senior Track Prep' },
]

// Column configs for board view
interface ColumnConfig {
  id: string
  title: string
  color: string
}

const DEFAULT_COLUMN_CONFIGS: ColumnConfig[] = [
  { id: 'todo', title: 'To Do', color: '#adb3b4' },
  { id: 'in-progress', title: 'In Progress', color: '#f59e0b' },
  { id: 'done', title: 'Done', color: '#22c55e' },
]

const DEFAULT_COLUMN_IDS = new Set(['todo', 'in-progress', 'done'])

function TaskSidePanel({ taskId, onClose, goals, categories, updateTask, toggleTask, deleteTask }: {
  taskId: string
  onClose: () => void
  goals: Array<{ id: string; title: string }>
  categories: Array<{ id: string; name: string }>
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>
  toggleTask: (id: string, completed: boolean) => Promise<void>
  deleteTask: (id: string) => Promise<void>
}) {
  const { tasks } = useWheelStore()
  const task = useMemo(() => tasks.find(t => t.id === taskId), [tasks, taskId])

  const [title, setTitle] = useState('')
  const [projectId, setProjectId] = useState('')
  const [goalId, setGoalId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('normal')
  const [energy, setEnergy] = useState<1 | 2 | 3>(2)
  const [estimatedMinutes, setEstimatedMinutes] = useState<number | null>(60)
  const [dueDate, setDueDate] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!task) return
    setTitle(task.title)
    setProjectId(task.project_id || '')
    setGoalId(task.goal_id || '')
    setCategoryId(task.category_id || '')
    setPriority(task.priority)
    setEnergy(task.energy)
    setEstimatedMinutes(task.estimated_minutes)
    setDueDate(task.due_date || '')
    setSaved(false)
  }, [task])

  if (!task) return null

  async function handleSave() {
    if (!title.trim()) return
    await updateTask(taskId, {
      title: title.trim(),
      project_id: projectId || null,
      goal_id: goalId || null,
      category_id: categoryId || null,
      priority,
      energy,
      estimated_minutes: estimatedMinutes,
      due_date: dueDate || null,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleDelete() {
    await deleteTask(taskId)
    onClose()
  }

  return (
    <div className="bg-white card p-5 space-y-5 animate-in slide-in-from-right-4 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-[#adb3b4] uppercase tracking-wider">Task Details</h3>
        <button onClick={onClose} className="p-1 hover:bg-[#f2f4f4] rounded-[8px] transition-colors cursor-pointer">
          <X size={14} className="text-[#adb3b4]" />
        </button>
      </div>

      {/* Complete toggle */}
      <button
        onClick={() => toggleTask(task.id, !task.completed)}
        className="flex items-center gap-2 cursor-pointer group w-full"
      >
        {task.completed
          ? <CheckCircle size={22} weight="fill" className="text-[#22c55e]" />
          : <Circle size={22} weight="regular" className="text-[#c3c7cd] group-hover:text-[#1F3649] transition-colors" />
        }
        <span className={cn(
          'text-sm font-bold',
          task.completed ? 'line-through text-[#adb3b4]' : 'text-[#2d3435]'
        )}>
          {task.completed ? 'Completed' : 'Mark Complete'}
        </span>
      </button>

      {/* Title */}
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        className="w-full text-sm font-bold text-[#2d3435] bg-[#f2f4f4] rounded-[10px] px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#1F3649]/10"
        placeholder="Task title..."
      />

      {/* Category */}
      <div className="space-y-1.5">
        <label className="text-[9px] font-bold text-[#adb3b4] uppercase tracking-wider block">Category</label>
        <select
          value={categoryId}
          onChange={e => setCategoryId(e.target.value)}
          className="w-full text-xs font-semibold text-[#2d3435] bg-[#f2f4f4] rounded-[10px] px-3 py-2.5 border-none outline-none cursor-pointer"
        >
          <option value="">None</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Project */}
      <div className="space-y-1.5">
        <label className="text-[9px] font-bold text-[#adb3b4] uppercase tracking-wider block">Project</label>
        <select
          value={projectId}
          onChange={e => setProjectId(e.target.value)}
          className="w-full text-xs font-semibold text-[#2d3435] bg-[#f2f4f4] rounded-[10px] px-3 py-2.5 border-none outline-none cursor-pointer"
        >
          <option value="">None</option>
          {PROJECT_OPTIONS.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
      </div>

      {/* Goal */}
      <div className="space-y-1.5">
        <label className="text-[9px] font-bold text-[#adb3b4] uppercase tracking-wider block">Goal</label>
        <select
          value={goalId}
          onChange={e => setGoalId(e.target.value)}
          className="w-full text-xs font-semibold text-[#2d3435] bg-[#f2f4f4] rounded-[10px] px-3 py-2.5 border-none outline-none cursor-pointer"
        >
          <option value="">None</option>
          {goals.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
        </select>
      </div>

      {/* Priority */}
      <div className="space-y-1.5">
        <label className="text-[9px] font-bold text-[#adb3b4] uppercase tracking-wider block">Priority</label>
        <div className="flex items-center gap-1">
          {SIDE_PRIORITIES.map(p => (
            <button
              key={p.value}
              onClick={() => setPriority(p.value)}
              className={cn(
                'flex-1 py-2 text-[9px] font-bold uppercase tracking-wider rounded-[8px] transition-all cursor-pointer',
                priority === p.value ? SIDE_PRIORITY_ACTIVE[p.value] : SIDE_PRIORITY_STYLES[p.value]
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Energy */}
      <div className="space-y-1.5">
        <label className="text-[9px] font-bold text-[#adb3b4] uppercase tracking-wider block">Energy</label>
        <div className="flex items-center gap-2 bg-[#f2f4f4] rounded-[10px] px-3 py-2.5">
          {([1, 2, 3] as const).map(level => (
            <button key={level} onClick={() => setEnergy(level)} className="cursor-pointer">
              <Lightning size={16} weight="fill" className={cn('transition-colors', level <= energy ? 'text-[#f59e0b]' : 'text-[#e8eaeb]')} />
            </button>
          ))}
          <span className="ml-auto text-[10px] font-bold text-[#adb3b4]">{energy}/3</span>
        </div>
      </div>

      {/* Time */}
      <div className="space-y-1.5">
        <label className="text-[9px] font-bold text-[#adb3b4] uppercase tracking-wider block">Time</label>
        <div className="flex items-center gap-1">
          {TIME_OPTIONS.map(opt => (
            <button
              key={opt.minutes}
              onClick={() => setEstimatedMinutes(opt.minutes)}
              className={cn(
                'flex-1 py-2 text-[9px] font-bold uppercase tracking-wider rounded-[8px] transition-all cursor-pointer',
                estimatedMinutes === opt.minutes ? 'bg-[#1F3649] text-white' : 'bg-[#f2f4f4] text-[#5a6061]'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Due date */}
      <div className="space-y-1.5">
        <label className="text-[9px] font-bold text-[#adb3b4] uppercase tracking-wider block">Due Date</label>
        <div className="flex items-center gap-2 bg-[#f2f4f4] rounded-[10px] px-3 py-2.5">
          <CalendarBlank size={12} className="text-[#adb3b4]" />
          <input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            className="flex-1 text-xs font-semibold text-[#2d3435] bg-transparent outline-none cursor-pointer"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-[#f2f4f4]">
        <button
          onClick={handleSave}
          disabled={!title.trim()}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-white py-2.5 rounded-[10px] transition-all cursor-pointer disabled:opacity-40',
            saved ? 'bg-[#22c55e]' : 'bg-[#1F3649] hover:opacity-90'
          )}
        >
          <FloppyDisk size={12} />
          {saved ? 'Saved!' : 'Save'}
        </button>
        <button
          onClick={handleDelete}
          className="p-2.5 text-[#adb3b4] hover:text-[#dc2626] hover:bg-[#dc2626]/10 rounded-[10px] transition-colors cursor-pointer"
        >
          <Trash size={14} />
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

type FilterProject = string | 'all'
type SortBy = 'priority' | 'energy' | 'date'

export default function Tasks() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { tasks, goals, categories, toggleTask, updateTask, createTask, deleteTask, fetchAll } = useWheelStore()

  useEffect(() => {
    if (user) fetchAll(user.id)
  }, [user?.id])

  const [filterProject, setFilterProject] = useState<FilterProject>('all')
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'all'>('all')
  const [filterEnergy, setFilterEnergy] = useState<1 | 2 | 3 | 'all'>('all')
  const [sortBy, setSortBy] = useState<SortBy>('priority')
  const [view, setView] = useState<'list' | 'board'>('board')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [columnConfigs, setColumnConfigs] = useState<ColumnConfig[]>(DEFAULT_COLUMN_CONFIGS)
  const [customTaskColumns, setCustomTaskColumns] = useState<Record<string, string>>({})

  // Undo tracking
  const undoStackRef = useRef<Array<{ taskId: string; wasCompleted: boolean; wasPriority?: TaskPriority }>>([])

  // Build lookup maps
  const goalMap = useMemo(() => Object.fromEntries(goals.map(g => [g.id, g])), [goals])
  const categoryMap = useMemo(() => Object.fromEntries(categories.map(c => [c.id, c])), [categories])

  // Unique projects appearing in tasks
  const taskProjects = useMemo(() => {
    const ids = new Set(tasks.map(t => t.project_id).filter(Boolean) as string[])
    return Array.from(ids).map(id => ({ id, ...PROJECT_MAP[id] })).filter(p => p.title)
  }, [tasks])

  // Filter + sort
  const displayTasks = useMemo(() => {
    let filtered = [...tasks]
    if (filterProject !== 'all') filtered = filtered.filter(t => t.project_id === filterProject)
    if (filterPriority !== 'all') filtered = filtered.filter(t => t.priority === filterPriority)
    if (filterEnergy !== 'all') filtered = filtered.filter(t => t.energy === filterEnergy)
    filtered.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1
      if (sortBy === 'priority') return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
      if (sortBy === 'energy') return b.energy - a.energy
      return new Date(a.due_date || '9999').getTime() - new Date(b.due_date || '9999').getTime()
    })
    return filtered
  }, [tasks, filterProject, filterPriority, filterEnergy, sortBy])

  const activeTasks = displayTasks.filter(t => !t.completed)
  const highEnergyToday = tasks.filter(t => !t.completed && t.energy === 3).length

  // Toggle with undo tracking
  const handleToggle = useCallback((taskId: string, newCompleted: boolean) => {
    undoStackRef.current.push({ taskId, wasCompleted: !newCompleted })
    toggleTask(taskId, newCompleted)
    setToastMessage(newCompleted ? 'Task completed' : 'Task reopened')
  }, [toggleTask])

  // Cmd+Z / Ctrl+Z undo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault()
        const last = undoStackRef.current.pop()
        if (last) {
          toggleTask(last.taskId, last.wasCompleted)
          if (last.wasPriority !== undefined) {
            updateTask(last.taskId, { priority: last.wasPriority })
          }
          setToastMessage('Action undone')
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleTask, updateTask])

  // Board columns
  const boardColumns: BoardColumn[] = useMemo(() => {
    const toCard = (t: Task) => ({
      id: t.id,
      title: t.title,
      description: t.goal_id ? goalMap[t.goal_id]?.title : undefined,
      priority: t.priority === 'urgent' ? 'urgent' as const : t.priority === 'high' ? 'high' as const : t.priority === 'low' ? 'low' as const : 'medium' as const,
      energy: t.energy,
      dueDate: t.due_date ? new Date(t.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase() : undefined,
      accentColor: t.project_id ? PROJECT_MAP[t.project_id]?.color : undefined,
      tag: t.category_id ? categoryMap[t.category_id]?.name : undefined,
    })

    const customTaskIds = new Set(Object.keys(customTaskColumns))

    return columnConfigs.map(config => {
      let columnTasks: Task[]
      if (config.id === 'todo') {
        columnTasks = displayTasks.filter(t => !t.completed && t.priority !== 'urgent' && !customTaskIds.has(t.id))
      } else if (config.id === 'in-progress') {
        columnTasks = displayTasks.filter(t => !t.completed && t.priority === 'urgent' && !customTaskIds.has(t.id))
      } else if (config.id === 'done') {
        columnTasks = displayTasks.filter(t => t.completed && !customTaskIds.has(t.id))
      } else {
        columnTasks = displayTasks.filter(t => customTaskColumns[t.id] === config.id)
      }
      return {
        id: config.id,
        title: config.title,
        color: config.color,
        cards: columnTasks.map(toCard),
      }
    })
  }, [displayTasks, columnConfigs, customTaskColumns, goalMap, categoryMap])

  // Handle board card moves
  const handleBoardMove = useCallback((cardId: string, fromColumnId: string, toColumnId: string) => {
    const task = tasks.find(t => t.id === cardId)
    if (!task) return

    const isDefault = (id: string) => DEFAULT_COLUMN_IDS.has(id)

    if (isDefault(toColumnId)) {
      // Moving to a default column — remove from custom map and update task
      setCustomTaskColumns(prev => {
        const next = { ...prev }
        delete next[cardId]
        return next
      })

      if (toColumnId === 'done') {
        undoStackRef.current.push({ taskId: cardId, wasCompleted: false })
        toggleTask(cardId, true)
        setToastMessage('Task completed')
      } else if (fromColumnId === 'done' || task.completed) {
        undoStackRef.current.push({ taskId: cardId, wasCompleted: true })
        toggleTask(cardId, false)
        if (toColumnId === 'in-progress') updateTask(cardId, { priority: 'urgent' })
        else updateTask(cardId, { priority: 'normal' })
        setToastMessage('Task reopened')
      } else if (toColumnId === 'in-progress') {
        undoStackRef.current.push({ taskId: cardId, wasCompleted: false, wasPriority: task.priority })
        updateTask(cardId, { priority: 'urgent' })
        setToastMessage('Marked as urgent')
      } else if (toColumnId === 'todo') {
        undoStackRef.current.push({ taskId: cardId, wasCompleted: false, wasPriority: task.priority })
        updateTask(cardId, { priority: 'normal' })
        setToastMessage('Priority set to normal')
      }
    } else {
      // Moving to a custom column
      setCustomTaskColumns(prev => ({ ...prev, [cardId]: toColumnId }))
      setToastMessage(`Moved to ${columnConfigs.find(c => c.id === toColumnId)?.title || 'column'}`)
    }
  }, [tasks, toggleTask, updateTask, columnConfigs])

  // Column management handlers
  const handleRenameColumn = useCallback((columnId: string, newTitle: string) => {
    setColumnConfigs(prev => prev.map(c => c.id === columnId ? { ...c, title: newTitle } : c))
  }, [])

  const handleAddColumn = useCallback((title: string, color: string) => {
    const id = `col-${Date.now()}`
    setColumnConfigs(prev => [...prev, { id, title, color }])
  }, [])

  const handleChangeColumnColor = useCallback((columnId: string, color: string) => {
    setColumnConfigs(prev => prev.map(c => c.id === columnId ? { ...c, color } : c))
  }, [])

  const handleDeleteColumn = useCallback((columnId: string) => {
    // Move any tasks back to default columns
    setCustomTaskColumns(prev => {
      const next = { ...prev }
      for (const [taskId, colId] of Object.entries(next)) {
        if (colId === columnId) delete next[taskId]
      }
      return next
    })
    setColumnConfigs(prev => prev.filter(c => c.id !== columnId))
  }, [])

  // Selected task for sidebar — first incomplete task's goal link
  const firstActiveGoal = useMemo(() => {
    const first = activeTasks.find(t => t.goal_id)
    if (!first?.goal_id) return null
    const goal = goalMap[first.goal_id]
    if (!goal) return null
    const project = goal.project_id ? PROJECT_MAP[goal.project_id] : null
    return { goalTitle: goal.title, project }
  }, [activeTasks, goalMap])

  function handleQuickAdd(title: string) {
    if (!user) return
    createTask({
      user_id: user.id,
      goal_id: null,
      category_id: null,
      project_id: null,
      title,
      completed: false,
      priority: 'normal',
      energy: 2,
      estimated_minutes: null,
      due_date: new Date().toISOString().split('T')[0],
    })
    setToastMessage('Task created')
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start pb-24">
      <div className="flex-1 min-w-0 w-full space-y-6 md:space-y-8">
      {/* Hero Banner */}
      <div className="relative bg-primary card overflow-hidden px-6 py-5 md:px-10 md:py-7">
        <GradientBarsBackground barCount={14} />
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
              <pattern id="tasks-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#tasks-grid)" />
          </svg>
        </div>
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
              Task Backlog
            </h1>
            <p className="text-white mt-1 text-sm max-w-md">
              {activeTasks.length} tasks active • {highEnergyToday} high energy required today
            </p>
          </div>
          <div className="flex items-center bg-white/10 rounded-[10px] p-1">
            <button
              onClick={() => setView('list')}
              className={cn(
                'p-2 rounded-[8px] transition-all',
                view === 'list' ? 'bg-white/20 text-white' : 'text-white/50'
              )}
            >
              <ListBullets size={18} weight="bold" />
            </button>
            <button
              onClick={() => setView('board')}
              className={cn(
                'p-2 rounded-[8px] transition-all',
                view === 'board' ? 'bg-white/20 text-white' : 'text-white/50'
              )}
            >
              <SquaresFour size={18} weight="bold" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Sort Bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Project filter dropdown */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center gap-1.5 h-7 px-2.5 rounded-[8px] bg-[#f2f4f4] text-xs text-[#5a6061] font-semibold hover:bg-[#ebeeef] transition-colors cursor-pointer">
              <FunnelSimple size={11} />
              {filterProject === 'all' ? 'All Projects' : PROJECT_MAP[filterProject]?.title ?? 'Project'}
              <CaretDown size={10} className="text-[#adb3b4]" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="start" sideOffset={6}
              className="z-50 min-w-[160px] rounded-[12px] border border-[#ECEFF2] bg-white shadow-[0_12px_44px_rgba(45,52,53,0.08)] p-1 outline-none"
            >
              <DropdownMenu.Item
                onClick={() => setFilterProject('all')}
                className={cn('flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-[8px] cursor-pointer outline-none transition-colors',
                  filterProject === 'all' ? 'bg-[#1F3649]/8 text-[#1F3649] font-semibold' : 'text-[#5a6061] hover:bg-[#f2f4f4]')}
              >All Projects</DropdownMenu.Item>
              {taskProjects.map(p => (
                <DropdownMenu.Item
                  key={p.id}
                  onClick={() => setFilterProject(p.id)}
                  className={cn('flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-[8px] cursor-pointer outline-none transition-colors',
                    filterProject === p.id ? 'bg-[#1F3649]/8 text-[#1F3649] font-semibold' : 'text-[#5a6061] hover:bg-[#f2f4f4]')}
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                  {p.title}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        {/* Priority filter dropdown */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center gap-1.5 h-7 px-2.5 rounded-[8px] bg-[#f2f4f4] text-xs text-[#5a6061] font-semibold hover:bg-[#ebeeef] transition-colors cursor-pointer">
              {filterPriority === 'all' ? 'All Priorities' : PRIORITY_STYLES[filterPriority].label}
              <CaretDown size={10} className="text-[#adb3b4]" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="start" sideOffset={6}
              className="z-50 min-w-[140px] rounded-[12px] border border-[#ECEFF2] bg-white shadow-[0_12px_44px_rgba(45,52,53,0.08)] p-1 outline-none"
            >
              {([['all', 'All Priorities'], ['urgent', 'Urgent'], ['high', 'High'], ['normal', 'Normal'], ['low', 'Low']] as const).map(([val, label]) => (
                <DropdownMenu.Item
                  key={val}
                  onClick={() => setFilterPriority(val)}
                  className={cn('flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-[8px] cursor-pointer outline-none transition-colors',
                    filterPriority === val ? 'bg-[#1F3649]/8 text-[#1F3649] font-semibold' : 'text-[#5a6061] hover:bg-[#f2f4f4]')}
                >{label}</DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        {/* Energy filter dropdown */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center gap-1.5 h-7 px-2.5 rounded-[8px] bg-[#f2f4f4] text-xs text-[#5a6061] font-semibold hover:bg-[#ebeeef] transition-colors cursor-pointer">
              <Lightning size={11} weight="fill" className="text-[#f59e0b]" />
              {filterEnergy === 'all' ? 'All Energy' : `Energy ${filterEnergy}/3`}
              <CaretDown size={10} className="text-[#adb3b4]" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="start" sideOffset={6}
              className="z-50 min-w-[130px] rounded-[12px] border border-[#ECEFF2] bg-white shadow-[0_12px_44px_rgba(45,52,53,0.08)] p-1 outline-none"
            >
              {([['all', 'All Energy'], [3, 'High (3/3)'], [2, 'Medium (2/3)'], [1, 'Low (1/3)']] as const).map(([val, label]) => (
                <DropdownMenu.Item
                  key={String(val)}
                  onClick={() => setFilterEnergy(val as any)}
                  className={cn('flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-[8px] cursor-pointer outline-none transition-colors',
                    filterEnergy === val ? 'bg-[#1F3649]/8 text-[#1F3649] font-semibold' : 'text-[#5a6061] hover:bg-[#f2f4f4]')}
                >{label}</DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        <div className="flex-1" />

        {/* Sort dropdown */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center gap-1.5 h-7 px-2.5 rounded-[8px] bg-[#f2f4f4] text-xs text-[#5a6061] font-semibold hover:bg-[#ebeeef] transition-colors cursor-pointer">
              <SortAscending size={11} />
              {sortBy === 'priority' ? 'Priority' : sortBy === 'energy' ? 'Energy' : 'Due date'}
              <CaretDown size={10} className="text-[#adb3b4]" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end" sideOffset={6}
              className="z-50 min-w-[140px] rounded-[12px] border border-[#ECEFF2] bg-white shadow-[0_12px_44px_rgba(45,52,53,0.08)] p-1 outline-none"
            >
              {([['priority', 'Priority'], ['energy', 'Energy level'], ['date', 'Due date']] as const).map(([val, label]) => (
                <DropdownMenu.Item
                  key={val}
                  onClick={() => setSortBy(val)}
                  className={cn('flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-[8px] cursor-pointer outline-none transition-colors',
                    sortBy === val ? 'bg-[#1F3649]/8 text-[#1F3649] font-semibold' : 'text-[#5a6061] hover:bg-[#f2f4f4]')}
                >{label}</DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        <button
          onClick={() => setTaskModalOpen(true)}
          className="flex items-center gap-1.5 text-xs font-semibold text-white bg-[#1F3649] h-7 px-3 rounded-[8px] hover:opacity-90 transition-opacity cursor-pointer"
        >
          <PencilSimpleLine size={12} />
          Create Task
        </button>
      </div>

      {/* Main content */}
      {view === 'board' ? (
        <BoardView
          columns={boardColumns}
          onAddCard={() => setTaskModalOpen(true)}
          onMoveCard={handleBoardMove}
          onCardClick={(cardId) => setSelectedTaskId(cardId === selectedTaskId ? null : cardId)}
          onRenameColumn={handleRenameColumn}
          onAddColumn={handleAddColumn}
          onChangeColumnColor={handleChangeColumnColor}
          onDeleteColumn={handleDeleteColumn}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Task list */}
          <div className="lg:col-span-2 space-y-2">
            {displayTasks.map(task => {
              const goal = task.goal_id ? goalMap[task.goal_id] : null
              const project = task.project_id ? PROJECT_MAP[task.project_id] : null
              return (
                <TaskRow
                  key={task.id}
                  task={task}
                  goalTitle={goal?.title ?? null}
                  categoryName={task.category_id ? categoryMap[task.category_id]?.name ?? null : null}
                  projectSlug={project?.slug ?? null}
                  onToggle={() => handleToggle(task.id, !task.completed)}
                />
              )
            })}

            {displayTasks.length === 0 && (
              <div className="text-center py-16">
                <p className="text-sm text-[#adb3b4]">No tasks found</p>
              </div>
            )}
          </div>

          {/* Sidebar panels */}
          <div className="space-y-5">
            {firstActiveGoal && (
              <GoalLinkedPanel goalTitle={firstActiveGoal.goalTitle} project={firstActiveGoal.project} />
            )}
            <EnergyInsightPanel tasks={tasks} />
            <QuickCapturePanel onAdd={handleQuickAdd} />
          </div>
        </div>
      )}
      </div>

      {/* Task detail sidebar (board view only) */}
      {selectedTaskId && view === 'board' && (
        <div className="w-full lg:w-72 lg:shrink-0 lg:sticky lg:top-6 space-y-0 lg:overflow-y-auto lg:max-h-[calc(100vh-6rem)]" style={{ scrollbarWidth: 'none' }}>
          <TaskSidePanel
            taskId={selectedTaskId}
            onClose={() => setSelectedTaskId(null)}
            goals={goals}
            categories={categories}
            updateTask={updateTask}
            toggleTask={toggleTask}
            deleteTask={deleteTask}
          />
        </div>
      )}

      {/* Undo toast */}
      {toastMessage && (
        <UndoToast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}

      {/* Task creation modal */}
      <TaskCreateModal open={taskModalOpen} onClose={() => setTaskModalOpen(false)} />
    </div>
  )
}
