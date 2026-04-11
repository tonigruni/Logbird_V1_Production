import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import * as RadixDropdown from '@radix-ui/react-dropdown-menu'
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
  Trash,
} from '@phosphor-icons/react'
import { cn } from '../lib/utils'
import { LogbirdDatePicker } from '../components/ui/date-range-picker'
import BoardView from '../components/BoardView'
import type { BoardColumn } from '../components/BoardView'
import TaskCreateModal from '../components/TaskCreateModal'
import GradientBarsBackground from '../components/ui/GradientBarsBackground'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuTriggerButton,
} from '../components/ui/dropdown-menu'
import { SidebarFieldLabel, SidebarInput, SidebarTextarea } from '../components/ui/sidebar-field'
import { useWheelStore } from '../stores/wheelStore'
import { useAuthStore } from '../stores/authStore'
import type { Task, TaskPriority } from '../stores/wheelStore'

// ---------------------------------------------------------------------------
// Project lookup (demo) — maps project_id to displayable info
// ---------------------------------------------------------------------------

const PROJECT_MAP: Record<string, { title: string; slug: string; color: string; completion: number }> = {
  'proj-identity-redesign': { title: 'Identity Redesign', slug: 'identity-redesign', color: '#0C1629', completion: 75 },
  'proj-focus-mastery': { title: 'Focus Mastery', slug: 'focus-mastery', color: '#22c55e', completion: 30 },
  'proj-senior-track': { title: 'Senior Track Prep', slug: 'senior-track-prep', color: '#0C1629', completion: 90 },
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const PRIORITY_ORDER: Record<TaskPriority, number> = { urgent: 0, high: 1, normal: 2, low: 3 }

const PRIORITY_STYLES: Record<TaskPriority, { label: string; bg: string; text: string }> = {
  urgent: { label: 'Urgent', bg: 'bg-[#dc2626]/10', text: 'text-[#dc2626]' },
  high:   { label: 'High',   bg: 'bg-[#f59e0b]/10', text: 'text-[#f59e0b]' },
  normal: { label: 'Normal', bg: 'bg-[#0C1629]/10', text: 'text-[#0C1629]' },
  low:    { label: 'Low',    bg: 'bg-[#B5C1C8]/10', text: 'text-[#B5C1C8]' },
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
          className={i <= level ? 'text-[#f59e0b]' : 'text-[#D6DCE0]'}
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
          : <Circle size={22} weight="regular" className="text-[#c3c7cd] hover:text-[#0C1629] transition-colors" />
        }
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className={cn(
          'text-sm font-bold leading-snug group-hover:text-[#0C1629] transition-colors',
          task.completed ? 'line-through text-[#B5C1C8]' : 'text-[#0C1629]'
        )}>
          {task.title}
        </h4>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {categoryName && (
            <span className="text-[10px] font-bold text-[#727A84] uppercase tracking-wider">{categoryName}</span>
          )}
          {goalTitle && (
            <button
              onClick={e => { e.stopPropagation(); navigate('/goals') }}
              className="flex items-center gap-1 text-[10px] font-semibold text-[#B5C1C8] hover:text-[#0C1629] transition-colors cursor-pointer"
            >
              <Target size={10} />
              {goalTitle}
            </button>
          )}
        </div>
      </div>

      {/* Energy */}
      <div className="hidden sm:flex items-center gap-1.5 shrink-0">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#B5C1C8]">Energy</span>
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
        <span className="hidden lg:inline text-[10px] font-bold text-[#B5C1C8] shrink-0">
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
      <ArrowRight size={14} className="text-[#c3c7cd] group-hover:text-[#0C1629] transition-colors shrink-0" />
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
      <h3 className="text-[10px] font-bold text-[#B5C1C8] uppercase tracking-wider">Focus Goal Linked</h3>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-[10px] flex items-center justify-center"
          style={{ backgroundColor: (project?.color || '#0C1629') + '15' }}
        >
          <Target size={14} style={{ color: project?.color || '#0C1629' }} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-[#0C1629]">{goalTitle}</p>
          {project && <p className="text-[10px] text-[#B5C1C8]">Active Project • {project.completion}% Complete</p>}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/goals')}
          className="text-xs font-semibold flex items-center gap-1 hover:gap-2 transition-all cursor-pointer text-[#0C1629]"
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
        <ChartBar size={14} className="text-[#0C1629]" />
        <h3 className="text-[10px] font-bold text-[#B5C1C8] uppercase tracking-wider">Energy Insight</h3>
      </div>
      <p className="text-xs text-[#727A84] leading-relaxed">
        You have <strong className="text-[#0C1629]">{highEnergyRemaining} high-energy tasks</strong> remaining.
        Your historical peak energy is between <strong className="text-[#0C1629]">9:00 AM – 11:30 AM</strong>.
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
      <h3 className="text-[10px] font-bold text-[#B5C1C8] uppercase tracking-wider">Quick Capture</h3>
      <div className="flex items-center gap-2">
        <input
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder="Add a task..."
          className="flex-1 text-sm text-[#0C1629] placeholder-[#B5C1C8] bg-transparent outline-none"
        />
        <button
          onClick={handleSubmit}
          className="w-8 h-8 rounded-full bg-[#0C1629] flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer shrink-0"
        >
          <PaperPlaneTilt size={14} weight="fill" className="text-white" />
        </button>
      </div>
      <p className="text-[10px] text-[#B5C1C8]">Press Enter or click to add</p>
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
    <div className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[#0C1629] text-white px-5 py-3 rounded-[15px] shadow-lg flex items-center gap-3 text-sm font-semibold animate-in fade-in slide-in-from-bottom-4">
      <span>{message}</span>
      <span className="text-[#B5C1C8] text-xs">⌘Z to undo</span>
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
  low: 'bg-[#B5C1C8]/10 text-[#B5C1C8]',
  normal: 'bg-[#0C1629]/10 text-[#0C1629]',
  high: 'bg-[#f59e0b]/10 text-[#f59e0b]',
  urgent: 'bg-[#dc2626]/10 text-[#dc2626]',
}

const SIDE_PRIORITY_ACTIVE: Record<TaskPriority, string> = {
  low: 'bg-[#B5C1C8] text-white',
  normal: 'bg-[#0C1629] text-white',
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
  { id: 'todo', title: 'To Do', color: '#B5C1C8' },
  { id: 'in-progress', title: 'In Progress', color: '#f59e0b' },
  { id: 'done', title: 'Done', color: '#22c55e' },
]

const DEFAULT_COLUMN_IDS = new Set(['todo', 'in-progress', 'done'])

function TaskSidePanel({ taskId, open, onClose, goals, categories, updateTask, toggleTask, deleteTask }: {
  taskId: string | null
  open: boolean
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
  const [description, setDescription] = useState('')
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
    setDescription(task.description || '')
    setProjectId(task.project_id || '')
    setGoalId(task.goal_id || '')
    setCategoryId(task.category_id || '')
    setPriority(task.priority)
    setEnergy(task.energy)
    setEstimatedMinutes(task.estimated_minutes)
    setDueDate(task.due_date || '')
    setSaved(false)
  }, [task])

  async function handleSave() {
    if (!task || !title.trim()) return
    await updateTask(task.id, {
      title: title.trim(),
      description: description.trim() || null,
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
    if (!task) return
    await deleteTask(task.id)
    onClose()
  }

  const selectedCategory = categories.find(c => c.id === categoryId)
  const selectedProject = PROJECT_OPTIONS.find(p => p.id === projectId)
  const selectedGoal = goals.find(g => g.id === goalId)

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/20 transition-opacity duration-300',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Slide-in panel */}
      <div
        className={cn(
          'fixed right-0 top-0 h-full w-[340px] z-50 bg-white shadow-[-4px_0_24px_rgba(12,22,41,0.10)] flex flex-col transition-transform duration-300 ease-in-out',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#F0F3F3] shrink-0">
          <h3 className="text-xs font-bold text-[#B5C1C8] uppercase tracking-wider">Task Details</h3>
          <button onClick={onClose} className="p-1 hover:bg-[#F0F3F3] rounded-[8px] transition-colors cursor-pointer">
            <X size={14} className="text-[#B5C1C8]" />
          </button>
        </div>

        {task ? (
          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            {/* Complete toggle */}
            <div className="px-6 py-5 border-b border-[#F0F3F3]">
              <button
                onClick={() => toggleTask(task.id, !task.completed)}
                className="flex items-center gap-2 cursor-pointer group w-full"
              >
                {task.completed
                  ? <CheckCircle size={22} weight="fill" className="text-[#22c55e]" />
                  : <Circle size={22} weight="regular" className="text-[#c3c7cd] group-hover:text-[#0C1629] transition-colors" />
                }
                <span className={cn(
                  'text-sm font-bold',
                  task.completed ? 'line-through text-[#B5C1C8]' : 'text-[#0C1629]'
                )}>
                  {task.completed ? 'Completed' : 'Mark Complete'}
                </span>
              </button>
            </div>

            {/* Title + Description */}
            <div className="px-6 py-5 border-b border-[#F0F3F3] space-y-4">
              <div>
                <SidebarFieldLabel>Title</SidebarFieldLabel>
                <SidebarInput
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Task title..."
                />
              </div>
              <div>
                <SidebarFieldLabel>Description</SidebarFieldLabel>
                <SidebarTextarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Add a description..."
                  rows={3}
                />
              </div>
            </div>

            {/* Category */}
            <div className="px-6 py-5 border-b border-[#F0F3F3]">
              <SidebarFieldLabel>Category</SidebarFieldLabel>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <DropdownMenuTriggerButton className="w-full justify-between">
                    <span>{selectedCategory?.name ?? 'None'}</span>
                    <CaretDown size={12} />
                  </DropdownMenuTriggerButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[292px]">
                  <DropdownMenuItem onSelect={() => setCategoryId('')}>None</DropdownMenuItem>
                  {categories.map(c => (
                    <DropdownMenuItem key={c.id} onSelect={() => setCategoryId(c.id)}>
                      {c.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Project */}
            <div className="px-6 py-5 border-b border-[#F0F3F3]">
              <SidebarFieldLabel>Project</SidebarFieldLabel>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <DropdownMenuTriggerButton className="w-full justify-between">
                    <span>{selectedProject?.title ?? 'None'}</span>
                    <CaretDown size={12} />
                  </DropdownMenuTriggerButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[292px]">
                  <DropdownMenuItem onSelect={() => setProjectId('')}>None</DropdownMenuItem>
                  {PROJECT_OPTIONS.map(p => (
                    <DropdownMenuItem key={p.id} onSelect={() => setProjectId(p.id)}>
                      {p.title}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Goal */}
            <div className="px-6 py-5 border-b border-[#F0F3F3]">
              <SidebarFieldLabel>Goal</SidebarFieldLabel>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <DropdownMenuTriggerButton className="w-full justify-between">
                    <span>{selectedGoal?.title ?? 'None'}</span>
                    <CaretDown size={12} />
                  </DropdownMenuTriggerButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[292px]">
                  <DropdownMenuItem onSelect={() => setGoalId('')}>None</DropdownMenuItem>
                  {goals.map(g => (
                    <DropdownMenuItem key={g.id} onSelect={() => setGoalId(g.id)}>
                      {g.title}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Priority */}
            <div className="px-6 py-5 border-b border-[#F0F3F3]">
              <SidebarFieldLabel>Priority</SidebarFieldLabel>
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
            <div className="px-6 py-5 border-b border-[#F0F3F3]">
              <SidebarFieldLabel>Energy</SidebarFieldLabel>
              <div className="flex items-center gap-2 bg-[#F0F3F3] rounded-[10px] px-3 py-2.5">
                {([1, 2, 3] as const).map(level => (
                  <button key={level} onClick={() => setEnergy(level)} className="cursor-pointer">
                    <Lightning size={16} weight="fill" className={cn('transition-colors', level <= energy ? 'text-[#f59e0b]' : 'text-[#D6DCE0]')} />
                  </button>
                ))}
                <span className="ml-auto text-[10px] font-bold text-[#B5C1C8]">{energy}/3</span>
              </div>
            </div>

            {/* Time */}
            <div className="px-6 py-5 border-b border-[#F0F3F3]">
              <SidebarFieldLabel>Time</SidebarFieldLabel>
              <div className="flex items-center gap-1">
                {TIME_OPTIONS.map(opt => (
                  <button
                    key={opt.minutes}
                    onClick={() => setEstimatedMinutes(opt.minutes)}
                    className={cn(
                      'flex-1 py-2 text-[9px] font-bold uppercase tracking-wider rounded-[8px] transition-all cursor-pointer',
                      estimatedMinutes === opt.minutes ? 'bg-[#0C1629] text-white' : 'bg-[#F0F3F3] text-[#727A84]'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Due date */}
            <div className="px-6 py-5 border-b border-[#F0F3F3]">
              <LogbirdDatePicker
                label="Due Date"
                value={dueDate || null}
                onChange={(v) => setDueDate(v ?? '')}
              />
            </div>

            {/* Actions */}
            <div className="px-6 py-5 flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={!title.trim()}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-white py-2.5 rounded-[10px] transition-all cursor-pointer disabled:opacity-40',
                  saved ? 'bg-[#22c55e]' : 'bg-[#0C1629] hover:opacity-90'
                )}
              >
                <FloppyDisk size={12} />
                {saved ? 'Saved!' : 'Save'}
              </button>
              <button
                onClick={handleDelete}
                className="p-2.5 text-[#B5C1C8] hover:text-[#dc2626] hover:bg-[#dc2626]/10 rounded-[10px] transition-colors cursor-pointer"
              >
                <Trash size={14} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-[#B5C1C8]">Select a task to view details</p>
          </div>
        )}
      </div>
    </>
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
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const view = (searchParams.get('view') as 'list' | 'board') || 'board'
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

  // Open modal when navigated here with state: { openModal: true }
  useEffect(() => {
    if (location.state?.openModal) {
      setTaskModalOpen(true)
      window.history.replaceState({}, '')
    }
  }, [location.state])

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
      <div className="relative bg-[#2a4a63] card overflow-hidden px-6 py-5 md:px-10 md:py-7">
        <GradientBarsBackground barCount={14} />
        <div className="absolute inset-0 opacity-[0.07]">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(107,99,245,0.4) 0%, transparent 40%), radial-gradient(circle at 60% 80%, rgba(255,255,255,0.2) 0%, transparent 45%)' }} />
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs><pattern id="tasks-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" /></pattern></defs>
            <rect width="100%" height="100%" fill="url(#tasks-grid)" />
          </svg>
        </div>
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">Task Backlog</h1>
            <p className="text-white/70 mt-1 text-sm">{activeTasks.length} tasks active • {highEnergyToday} high energy required today</p>
          </div>
          <div className="flex items-center bg-white/10 rounded-[10px] p-1">
            <button
              onClick={() => navigate('/tasks?view=board')}
              className={cn('p-2 rounded-[8px] transition-all cursor-pointer', view === 'board' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white/80')}
            >
              <SquaresFour size={18} weight="bold" />
            </button>
            <button
              onClick={() => navigate('/tasks?view=list')}
              className={cn('p-2 rounded-[8px] transition-all cursor-pointer', view === 'list' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white/80')}
            >
              <ListBullets size={18} weight="bold" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Sort Bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Project filter dropdown */}
        <RadixDropdown.Root>
          <RadixDropdown.Trigger asChild>
            <button className="flex items-center gap-1.5 h-7 px-2.5 rounded-[8px] bg-[#F0F3F3] text-xs text-[#727A84] font-semibold hover:bg-[#F0F3F3] transition-colors cursor-pointer">
              <FunnelSimple size={11} />
              {filterProject === 'all' ? 'All Projects' : PROJECT_MAP[filterProject]?.title ?? 'Project'}
              <CaretDown size={10} className="text-[#B5C1C8]" />
            </button>
          </RadixDropdown.Trigger>
          <RadixDropdown.Portal>
            <RadixDropdown.Content
              align="start" sideOffset={6}
              className="z-50 min-w-[160px] rounded-[12px] border border-[#D6DCE0] bg-white shadow-[0_12px_44px_rgba(12,22,41,0.08)] p-1 outline-none"
            >
              <RadixDropdown.Item
                onClick={() => setFilterProject('all')}
                className={cn('flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-[8px] cursor-pointer outline-none transition-colors',
                  filterProject === 'all' ? 'bg-[#0C1629]/8 text-[#0C1629] font-semibold' : 'text-[#727A84] hover:bg-[#F0F3F3]')}
              >All Projects</RadixDropdown.Item>
              {taskProjects.map(p => (
                <RadixDropdown.Item
                  key={p.id}
                  onClick={() => setFilterProject(p.id)}
                  className={cn('flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-[8px] cursor-pointer outline-none transition-colors',
                    filterProject === p.id ? 'bg-[#0C1629]/8 text-[#0C1629] font-semibold' : 'text-[#727A84] hover:bg-[#F0F3F3]')}
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                  {p.title}
                </RadixDropdown.Item>
              ))}
            </RadixDropdown.Content>
          </RadixDropdown.Portal>
        </RadixDropdown.Root>

        {/* Priority filter dropdown */}
        <RadixDropdown.Root>
          <RadixDropdown.Trigger asChild>
            <button className="flex items-center gap-1.5 h-7 px-2.5 rounded-[8px] bg-[#F0F3F3] text-xs text-[#727A84] font-semibold hover:bg-[#F0F3F3] transition-colors cursor-pointer">
              {filterPriority === 'all' ? 'All Priorities' : PRIORITY_STYLES[filterPriority].label}
              <CaretDown size={10} className="text-[#B5C1C8]" />
            </button>
          </RadixDropdown.Trigger>
          <RadixDropdown.Portal>
            <RadixDropdown.Content
              align="start" sideOffset={6}
              className="z-50 min-w-[140px] rounded-[12px] border border-[#D6DCE0] bg-white shadow-[0_12px_44px_rgba(12,22,41,0.08)] p-1 outline-none"
            >
              {([['all', 'All Priorities'], ['urgent', 'Urgent'], ['high', 'High'], ['normal', 'Normal'], ['low', 'Low']] as const).map(([val, label]) => (
                <RadixDropdown.Item
                  key={val}
                  onClick={() => setFilterPriority(val)}
                  className={cn('flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-[8px] cursor-pointer outline-none transition-colors',
                    filterPriority === val ? 'bg-[#0C1629]/8 text-[#0C1629] font-semibold' : 'text-[#727A84] hover:bg-[#F0F3F3]')}
                >{label}</RadixDropdown.Item>
              ))}
            </RadixDropdown.Content>
          </RadixDropdown.Portal>
        </RadixDropdown.Root>

        {/* Energy filter dropdown */}
        <RadixDropdown.Root>
          <RadixDropdown.Trigger asChild>
            <button className="flex items-center gap-1.5 h-7 px-2.5 rounded-[8px] bg-[#F0F3F3] text-xs text-[#727A84] font-semibold hover:bg-[#F0F3F3] transition-colors cursor-pointer">
              <Lightning size={11} weight="fill" className="text-[#f59e0b]" />
              {filterEnergy === 'all' ? 'All Energy' : `Energy ${filterEnergy}/3`}
              <CaretDown size={10} className="text-[#B5C1C8]" />
            </button>
          </RadixDropdown.Trigger>
          <RadixDropdown.Portal>
            <RadixDropdown.Content
              align="start" sideOffset={6}
              className="z-50 min-w-[130px] rounded-[12px] border border-[#D6DCE0] bg-white shadow-[0_12px_44px_rgba(12,22,41,0.08)] p-1 outline-none"
            >
              {([['all', 'All Energy'], [3, 'High (3/3)'], [2, 'Medium (2/3)'], [1, 'Low (1/3)']] as const).map(([val, label]) => (
                <RadixDropdown.Item
                  key={String(val)}
                  onClick={() => setFilterEnergy(val as any)}
                  className={cn('flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-[8px] cursor-pointer outline-none transition-colors',
                    filterEnergy === val ? 'bg-[#0C1629]/8 text-[#0C1629] font-semibold' : 'text-[#727A84] hover:bg-[#F0F3F3]')}
                >{label}</RadixDropdown.Item>
              ))}
            </RadixDropdown.Content>
          </RadixDropdown.Portal>
        </RadixDropdown.Root>

        {/* Sort dropdown */}
        <RadixDropdown.Root>
          <RadixDropdown.Trigger asChild>
            <button className="flex items-center gap-1.5 h-7 px-2.5 rounded-[8px] bg-[#F0F3F3] text-xs text-[#727A84] font-semibold hover:bg-[#F0F3F3] transition-colors cursor-pointer">
              <SortAscending size={11} />
              {sortBy === 'priority' ? 'Priority' : sortBy === 'energy' ? 'Energy' : 'Due date'}
              <CaretDown size={10} className="text-[#B5C1C8]" />
            </button>
          </RadixDropdown.Trigger>
          <RadixDropdown.Portal>
            <RadixDropdown.Content
              align="start" sideOffset={6}
              className="z-50 min-w-[140px] rounded-[12px] border border-[#D6DCE0] bg-white shadow-[0_12px_44px_rgba(12,22,41,0.08)] p-1 outline-none"
            >
              {([['priority', 'Priority'], ['energy', 'Energy level'], ['date', 'Due date']] as const).map(([val, label]) => (
                <RadixDropdown.Item
                  key={val}
                  onClick={() => setSortBy(val)}
                  className={cn('flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-[8px] cursor-pointer outline-none transition-colors',
                    sortBy === val ? 'bg-[#0C1629]/8 text-[#0C1629] font-semibold' : 'text-[#727A84] hover:bg-[#F0F3F3]')}
                >{label}</RadixDropdown.Item>
              ))}
            </RadixDropdown.Content>
          </RadixDropdown.Portal>
        </RadixDropdown.Root>

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
                <p className="text-sm text-[#B5C1C8]">No tasks found</p>
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

      {/* Task detail sidebar (board view only — fixed overlay) */}
      <TaskSidePanel
        taskId={selectedTaskId}
        open={!!selectedTaskId && view === 'board'}
        onClose={() => setSelectedTaskId(null)}
        goals={goals}
        categories={categories}
        updateTask={updateTask}
        toggleTask={toggleTask}
        deleteTask={deleteTask}
      />

      {/* Undo toast */}
      {toastMessage && (
        <UndoToast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}

      {/* Task creation modal */}
      <TaskCreateModal open={taskModalOpen} onClose={() => setTaskModalOpen(false)} />
    </div>
  )
}
