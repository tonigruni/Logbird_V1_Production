import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  FloppyDisk,
  Lightning,
  CalendarBlank,
  Target,
  Kanban,
  Trash,
  CheckCircle,
  Circle,
  ArrowRight,
} from '@phosphor-icons/react'
import { cn } from '../lib/utils'
import { useWheelStore } from '../stores/wheelStore'
import { useProjectStore } from '../stores/projectStore'
import { useAuthStore } from '../stores/authStore'
import type { TaskPriority, TaskEnergy } from '../stores/wheelStore'

const PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

const PRIORITY_STYLES: Record<TaskPriority, string> = {
  low: 'bg-[#adb3b4]/10 text-[#adb3b4]',
  normal: 'bg-[#1F3649]/10 text-[#1F3649]',
  high: 'bg-[#f59e0b]/10 text-[#f59e0b]',
  urgent: 'bg-[#dc2626]/10 text-[#dc2626]',
}

const PRIORITY_ACTIVE: Record<TaskPriority, string> = {
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

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function TaskEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { tasks, goals, categories, updateTask, deleteTask, toggleTask, fetchAll } = useWheelStore()
  const { projects, fetchProjects } = useProjectStore()

  useEffect(() => {
    if (user) { fetchAll(user.id); fetchProjects(user.id) }
  }, [user?.id])

  const task = useMemo(() => tasks.find(t => t.id === id), [tasks, id])

  // Form state
  const [title, setTitle] = useState('')
  const [projectId, setProjectId] = useState('')
  const [goalId, setGoalId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('normal')
  const [energy, setEnergy] = useState<TaskEnergy>(2)
  const [estimatedMinutes, setEstimatedMinutes] = useState<number | null>(60)
  const [dueDate, setDueDate] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [saved, setSaved] = useState(false)

  // Sync form when task loads
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
  }, [task])

  const linkedGoal = useMemo(() => {
    if (!goalId) return null
    return goals.find(g => g.id === goalId) ?? null
  }, [goalId, goals])

  const linkedProject = useMemo(() => {
    if (!projectId) return null
    return projects.find(p => p.id === projectId) ?? null
  }, [projectId, projects])

  if (!task) {
    return (
      <div className="space-y-8 pb-24 max-w-3xl">
        <button
          onClick={() => navigate('/tasks')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#586062] hover:text-[#1F3649] transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          Tasks
        </button>
        <div className="text-center py-16">
          <p className="text-sm text-[#adb3b4]">Task not found</p>
        </div>
      </div>
    )
  }

  async function handleSave() {
    if (!title.trim()) return
    await updateTask(task!.id, {
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
    await deleteTask(task!.id)
    navigate('/tasks')
  }

  async function handleToggleComplete() {
    await toggleTask(task!.id, !task!.completed)
  }

  return (
    <div className="space-y-8 pb-24">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <button
          onClick={() => navigate('/tasks')}
          className="inline-flex items-center gap-2 font-semibold text-[#586062] hover:text-[#1F3649] transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          Tasks
        </button>
        <span className="text-[#c3c7cd]">/</span>
        <span className="font-semibold text-[#1F3649]">Edit Task</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Completion toggle */}
          <button onClick={handleToggleComplete} className="flex items-center gap-3 cursor-pointer group">
            {task.completed
              ? <CheckCircle size={28} weight="fill" className="text-[#22c55e]" />
              : <Circle size={28} weight="regular" className="text-[#c3c7cd] group-hover:text-[#1F3649] transition-colors" />
            }
            <span className={cn(
              'text-lg font-black tracking-tight',
              task.completed ? 'line-through text-[#adb3b4]' : 'text-[#2d3435]'
            )}>
              {task.completed ? 'Completed' : 'Mark as Complete'}
            </span>
          </button>

          {/* Title */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[#adb3b4] uppercase tracking-wider block">
              Task Title
            </label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full text-sm text-[#2d3435] placeholder-[#adb3b4] bg-white card px-5 py-4 outline-none focus:ring-2 focus:ring-[#1F3649]/10 transition-shadow"
            />
          </div>

          {/* Category + Project + Goal */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#adb3b4] uppercase tracking-wider block">
                Category
              </label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full text-xs font-semibold text-[#2d3435] bg-white card px-4 py-3.5 border-none outline-none cursor-pointer focus:ring-2 focus:ring-[#1F3649]/10"
              >
                <option value="">No category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#adb3b4] uppercase tracking-wider block">
                Project
              </label>
              <select
                value={projectId}
                onChange={e => setProjectId(e.target.value)}
                className="w-full text-xs font-semibold text-[#2d3435] bg-white card px-4 py-3.5 border-none outline-none cursor-pointer focus:ring-2 focus:ring-[#1F3649]/10"
              >
                <option value="">No project</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#adb3b4] uppercase tracking-wider block">
                Goal Alignment
              </label>
              <select
                value={goalId}
                onChange={e => setGoalId(e.target.value)}
                className="w-full text-xs font-semibold text-[#2d3435] bg-white card px-4 py-3.5 border-none outline-none cursor-pointer focus:ring-2 focus:ring-[#1F3649]/10"
              >
                <option value="">No goal</option>
                {goals.map(g => (
                  <option key={g.id} value={g.id}>{g.title}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[#adb3b4] uppercase tracking-wider block">
              Priority Matrix
            </label>
            <div className="flex items-center gap-2">
              {PRIORITIES.map(p => (
                <button
                  key={p.value}
                  onClick={() => setPriority(p.value)}
                  className={cn(
                    'flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-[10px] transition-all cursor-pointer',
                    priority === p.value ? PRIORITY_ACTIVE[p.value] : PRIORITY_STYLES[p.value]
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Energy + Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#adb3b4] uppercase tracking-wider block">
                Energy Cost
              </label>
              <div className="flex items-center gap-2 bg-white card px-5 py-3.5">
                {([1, 2, 3] as TaskEnergy[]).map(level => (
                  <button key={level} onClick={() => setEnergy(level)} className="cursor-pointer">
                    <Lightning
                      size={18}
                      weight="fill"
                      className={cn('transition-colors', level <= energy ? 'text-[#f59e0b]' : 'text-[#e8eaeb]')}
                    />
                  </button>
                ))}
                <span className="ml-auto text-xs font-bold text-[#adb3b4]">{energy}/3</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#adb3b4] uppercase tracking-wider block">
                Time Allocation
              </label>
              <div className="flex items-center gap-1">
                {TIME_OPTIONS.map(opt => (
                  <button
                    key={opt.minutes}
                    onClick={() => setEstimatedMinutes(opt.minutes)}
                    className={cn(
                      'flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-[10px] transition-all cursor-pointer',
                      estimatedMinutes === opt.minutes
                        ? 'bg-[#1F3649] text-white'
                        : 'bg-white card text-[#5a6061]'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[#adb3b4] uppercase tracking-wider block">
              Schedule
            </label>
            <div className="flex items-center gap-2 bg-white card px-5 py-3.5">
              <CalendarBlank size={14} className="text-[#adb3b4] shrink-0" />
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="flex-1 text-sm font-semibold text-[#2d3435] bg-transparent outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-[#f2f4f4]">
            <button
              onClick={handleSave}
              disabled={!title.trim()}
              className={cn(
                'inline-flex items-center gap-2 text-sm font-semibold text-white px-6 py-3 rounded-[10px] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed',
                saved ? 'bg-[#22c55e]' : 'bg-[#1F3649] hover:opacity-90'
              )}
            >
              <FloppyDisk size={16} />
              {saved ? 'Saved!' : 'Save Changes'}
            </button>
            <button
              onClick={() => navigate('/tasks')}
              className="text-sm font-semibold text-[#586062] px-4 py-3 hover:text-[#2d3435] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <div className="flex-1" />
            {showDeleteConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#dc2626] font-semibold">Are you sure?</span>
                <button
                  onClick={handleDelete}
                  className="text-xs font-semibold text-white bg-[#dc2626] px-3 py-2 rounded-[10px] hover:opacity-90 cursor-pointer"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-xs font-semibold text-[#586062] px-3 py-2 cursor-pointer"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#dc2626]/60 hover:text-[#dc2626] transition-colors cursor-pointer"
              >
                <Trash size={14} />
                Delete
              </button>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">
          {/* Linked Goal */}
          {linkedGoal && (
            <div className="bg-white card p-5 space-y-3">
              <h3 className="text-[10px] font-bold text-[#adb3b4] uppercase tracking-wider">Linked Goal</h3>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-[10px] bg-[#1F3649]/10 flex items-center justify-center">
                  <Target size={14} className="text-[#1F3649]" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#2d3435] truncate">{linkedGoal.title}</p>
                  <p className="text-[10px] text-[#adb3b4]">{linkedGoal.status}</p>
                </div>
              </div>
              <button
                onClick={() => navigate(`/goals/${linkedGoal.id}`)}
                className="text-xs font-semibold flex items-center gap-1 hover:gap-2 transition-all cursor-pointer text-[#1F3649]"
              >
                <Target size={12} />
                View Goal
                <ArrowRight size={12} />
              </button>
            </div>
          )}

          {/* Linked Project */}
          {linkedProject && (
            <div className="bg-white card p-5 space-y-3">
              <h3 className="text-[10px] font-bold text-[#adb3b4] uppercase tracking-wider">Linked Project</h3>
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-[10px] flex items-center justify-center"
                  style={{ backgroundColor: (linkedProject.color || '#1F3649') + '15' }}
                >
                  <Kanban size={14} style={{ color: linkedProject.color || '#1F3649' }} />
                </div>
                <p className="text-sm font-bold text-[#2d3435] truncate">{linkedProject.title}</p>
              </div>
              <button
                onClick={() => navigate(`/projects/${linkedProject.id}`)}
                className="text-xs font-semibold flex items-center gap-1 hover:gap-2 transition-all cursor-pointer"
                style={{ color: linkedProject.color || '#1F3649' }}
              >
                <Kanban size={12} />
                View Project
                <ArrowRight size={12} />
              </button>
            </div>
          )}

          {/* Task Info summary */}
          <div className="bg-white card p-5 space-y-4">
            <h3 className="text-[10px] font-bold text-[#adb3b4] uppercase tracking-wider">Task Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#adb3b4] uppercase tracking-wider">Priority</span>
                <span className={cn(
                  'text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider',
                  PRIORITY_STYLES[priority]
                )}>
                  {PRIORITIES.find(p => p.value === priority)?.label}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#adb3b4] uppercase tracking-wider">Energy</span>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3].map(i => (
                    <Lightning
                      key={i}
                      size={12}
                      weight="fill"
                      className={i <= energy ? 'text-[#f59e0b]' : 'text-[#e8eaeb]'}
                    />
                  ))}
                </div>
              </div>
              {estimatedMinutes && (
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#adb3b4] uppercase tracking-wider">Time Est.</span>
                  <span className="text-xs font-bold text-[#2d3435]">
                    {estimatedMinutes >= 60
                      ? `${Math.floor(estimatedMinutes / 60)}h${estimatedMinutes % 60 > 0 ? ` ${estimatedMinutes % 60}m` : ''}`
                      : `${estimatedMinutes}m`
                    }
                  </span>
                </div>
              )}
              {dueDate && (
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#adb3b4] uppercase tracking-wider">Due</span>
                  <span className="text-xs font-bold text-[#2d3435]">
                    {new Date(dueDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#adb3b4] uppercase tracking-wider">Status</span>
                <span className={cn(
                  'text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider',
                  task.completed ? 'bg-[#22c55e]/10 text-[#22c55e]' : 'bg-[#1F3649]/10 text-[#1F3649]'
                )}>
                  {task.completed ? 'Completed' : 'Active'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
