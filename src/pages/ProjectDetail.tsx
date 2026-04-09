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
} from '@phosphor-icons/react'
import { cn } from '../lib/utils'
import { useWheelStore } from '../stores/wheelStore'
import { useAuthStore } from '../stores/authStore'
import type { Task as StoreTask } from '../stores/wheelStore'

// ---------------------------------------------------------------------------
// Demo data — keyed by slug
// ---------------------------------------------------------------------------

interface DemoTask {
  id: string
  title: string
  goal: string
  status: 'IN REVIEW' | 'IN PROGRESS' | 'TODO' | 'DONE'
  energy: 'high' | 'medium' | 'low'
}

interface ProjectData {
  projectId: string       // maps to project_id in the store
  title: string
  description: string
  category: string
  categoryColor: string
  gradient: string
  priority: string
  status: string
  timeline: string
  budget: string
  completion: number
  demoTasks: DemoTask[]
}

const ENERGY_ORDER = { high: 0, medium: 1, low: 2 }

const PROJECTS: Record<string, ProjectData> = {
  'identity-redesign': {
    projectId: 'proj-identity-redesign',
    title: 'Identity Redesign',
    description: 'Reimagining the visual language for the 2024 global expansion strategy. A comprehensive brand overhaul spanning digital touchpoints, physical spaces, and internal culture artifacts.',
    category: 'Creative',
    categoryColor: '#1F3649',
    gradient: 'from-[#1F3649] to-[#4a6175]',
    priority: 'High Priority',
    status: 'Active Build',
    timeline: 'Mar 24 — Sep 24',
    budget: '$48.2K',
    completion: 75,
    demoTasks: [
      { id: 'IR-042', title: 'Finalize brand color system', goal: 'Visual Consistency', status: 'IN REVIEW', energy: 'high' },
      { id: 'IR-089', title: 'Typography scale — responsive breakpoints', goal: 'Design System', status: 'IN PROGRESS', energy: 'medium' },
      { id: 'IR-112', title: 'Stakeholder review: logo variants', goal: 'Sign-off', status: 'TODO', energy: 'low' },
    ],
  },
  'focus-mastery': {
    projectId: 'proj-focus-mastery',
    title: 'Focus Mastery',
    description: 'Internal wellbeing program focused on deep-work habits and cognitive health. Building frameworks for sustained attention in a distraction-heavy environment.',
    category: 'Wellness',
    categoryColor: '#22c55e',
    gradient: 'from-[#22c55e] to-[#86efac]',
    priority: 'Medium Priority',
    status: 'In Progress',
    timeline: 'Jan 24 — Jun 25',
    budget: '$12.8K',
    completion: 30,
    demoTasks: [
      { id: 'FM-015', title: 'Design deep-work protocol template', goal: 'Cognitive Framework', status: 'IN PROGRESS', energy: 'high' },
      { id: 'FM-023', title: 'Pilot program — Team Alpha', goal: 'Validation', status: 'TODO', energy: 'medium' },
      { id: 'FM-031', title: 'Metrics dashboard for focus scoring', goal: 'Tracking', status: 'TODO', energy: 'low' },
    ],
  },
  'senior-track-prep': {
    projectId: 'proj-senior-track',
    title: 'Senior Track Prep',
    description: 'Portfolio curation and leadership certification for Q4 promotions. A structured path to senior-level readiness through mentorship, artifacts, and milestone reviews.',
    category: 'Career',
    categoryColor: '#1F3649',
    gradient: 'from-[#1F3649] to-[#4a6175]',
    priority: 'High Priority',
    status: 'Active Build',
    timeline: 'Feb 24 — Dec 24',
    budget: '$8.5K',
    completion: 90,
    demoTasks: [
      { id: 'ST-088', title: 'Compile leadership artifact portfolio', goal: 'Promotion Review', status: 'IN REVIEW', energy: 'high' },
      { id: 'ST-091', title: 'Schedule mock panel interview', goal: 'Readiness', status: 'DONE', energy: 'medium' },
      { id: 'ST-095', title: 'Final mentor debrief session', goal: 'Closure', status: 'IN PROGRESS', energy: 'low' },
    ],
  },
}

const DEFAULT_PROJECT = PROJECTS['identity-redesign']

// ---------------------------------------------------------------------------
// Status helpers
// ---------------------------------------------------------------------------

const STATUS_ORDER: Record<string, number> = { 'IN PROGRESS': 0, 'IN REVIEW': 1, 'TODO': 2, 'DONE': 3 }

const STATUS_STYLES: Record<DemoTask['status'], { bg: string; text: string; icon: typeof CheckCircle }> = {
  'IN REVIEW': { bg: 'bg-[#1F3649]/10', text: 'text-[#1F3649]', icon: Clock },
  'IN PROGRESS': { bg: 'bg-[#f59e0b]/10', text: 'text-[#f59e0b]', icon: Lightning },
  'TODO': { bg: 'bg-[#adb3b4]/10', text: 'text-[#5a6061]', icon: Circle },
  'DONE': { bg: 'bg-[#22c55e]/10', text: 'text-[#22c55e]', icon: CheckCircle },
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function DemoTaskRow({ task, accentColor }: { task: DemoTask; accentColor: string }) {
  const navigate = useNavigate()
  const style = STATUS_STYLES[task.status]
  const StatusIcon = style.icon

  return (
    <div
      onClick={() => navigate('/tasks')}
      className="flex items-center gap-4 px-5 py-4 bg-white card group hover:shadow-[0_20px_40px_rgba(7,33,51,0.05)] transition-all duration-300 cursor-pointer"
    >
      <div className="w-1 h-10 rounded-full shrink-0" style={{ backgroundColor: accentColor }} />
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-[#2d3435] leading-snug group-hover:text-[#1F3649] transition-colors">{task.title}</h4>
        <p className="text-[11px] text-[#adb3b4] mt-0.5">
          <span className="font-mono">ID: {task.id}</span>
          <span className="mx-1.5">•</span>
          <Target size={10} className="inline -mt-[1px] mr-0.5" />
          {task.goal}
        </p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Lightning size={12} weight="fill" style={{ color: accentColor }} />
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#adb3b4]">{task.energy}</span>
      </div>
      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 ${style.bg} ${style.text}`}>
        <StatusIcon size={10} weight="bold" className="inline mr-1 -mt-[1px]" />
        {task.status}
      </span>
      <ArrowRight size={14} className="text-[#c3c7cd] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </div>
  )
}

function StoreTaskRow({ task, goalTitle, accentColor, onToggle }: {
  task: StoreTask
  goalTitle: string | null
  accentColor: string
  onToggle: () => void
}) {
  return (
    <div className={cn(
      'flex items-center gap-4 px-5 py-4 bg-white card group transition-all duration-300',
      task.completed ? 'opacity-60' : 'hover:shadow-[0_20px_40px_rgba(7,33,51,0.05)]'
    )}>
      <button onClick={onToggle} className="shrink-0 cursor-pointer">
        {task.completed
          ? <CheckCircle size={22} weight="fill" className="text-[#22c55e]" />
          : <Circle size={22} weight="regular" className="text-[#c3c7cd] hover:text-[#1F3649] transition-colors" />
        }
      </button>
      <div className="flex-1 min-w-0">
        <h4 className={cn(
          'text-sm font-bold leading-snug',
          task.completed ? 'line-through text-[#adb3b4]' : 'text-[#2d3435]'
        )}>
          {task.title}
        </h4>
        {goalTitle && (
          <p className="text-[11px] text-[#adb3b4] mt-0.5 flex items-center gap-1">
            <Target size={10} />
            {goalTitle}
          </p>
        )}
      </div>
      <span className={cn(
        'text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0',
        task.completed ? 'bg-[#22c55e]/10 text-[#22c55e]' : 'bg-[#adb3b4]/10 text-[#5a6061]'
      )}>
        {task.completed ? 'Done' : 'To Do'}
      </span>
    </div>
  )
}

function MetadataCard({ label, value, accentColor }: { label: string; value: string | number; accentColor?: string }) {
  return (
    <div className="bg-white card p-5">
      <span className="text-[10px] font-bold text-[#adb3b4] uppercase tracking-wider block mb-1">{label}</span>
      <span className="text-sm font-bold text-[#2d3435]" style={accentColor ? { color: accentColor } : undefined}>
        {value}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Add Task Form
// ---------------------------------------------------------------------------

function AddTaskForm({ projectId, accentColor, goals, onAdd }: {
  projectId: string
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
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-center gap-1.5 py-3 card !border-2 !border-dashed !border-[#e8eaeb] text-xs font-semibold text-[#adb3b4] hover:border-[#1F3649]/30 hover:text-[#1F3649] hover:bg-[#1F3649]/[0.02] transition-all cursor-pointer"
      >
        <Plus size={12} weight="bold" />
        Add Task to Project
      </button>
    )
  }

  return (
    <div className="bg-white card p-5 space-y-3">
      <h4 className="text-[10px] font-bold text-[#adb3b4] uppercase tracking-wider">New Task</h4>
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        placeholder="Task title..."
        className="w-full text-sm text-[#2d3435] placeholder-[#adb3b4] bg-[#f2f4f4] rounded-[10px] px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#1F3649]/10"
        autoFocus
      />
      <div className="flex items-center gap-3">
        <select
          value={goalId}
          onChange={e => setGoalId(e.target.value)}
          className="flex-1 text-xs font-semibold text-[#5a6061] bg-[#f2f4f4] px-3 py-2 rounded-[10px] border-none outline-none cursor-pointer"
        >
          <option value="">No goal linked</option>
          {goals.map(g => (
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
          className="text-xs font-semibold text-[#adb3b4] hover:text-[#2d3435] transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const project = (slug && PROJECTS[slug]) || DEFAULT_PROJECT
  const { user } = useAuthStore()
  const { tasks, goals, fetchAll, createTask, toggleTask } = useWheelStore()

  useEffect(() => {
    if (user) fetchAll(user.id)
  }, [user?.id])

  const [sortBy, setSortBy] = useState<'status' | 'energy'>('status')

  // Store tasks linked to this project
  const projectTasks = useMemo(
    () => tasks.filter(t => t.project_id === project.projectId),
    [tasks, project.projectId]
  )

  // Goals linked to this project (for the add task dropdown)
  const projectGoals = useMemo(
    () => goals.filter(g => g.project_id === project.projectId).map(g => ({ id: g.id, title: g.title })),
    [goals, project.projectId]
  )

  // All goals for linking (in case user wants to link to any goal)
  const allGoals = useMemo(
    () => goals.map(g => ({ id: g.id, title: g.title })),
    [goals]
  )

  const goalMap = useMemo(() => Object.fromEntries(goals.map(g => [g.id, g])), [goals])

  const sortedDemoTasks = [...project.demoTasks].sort((a, b) => {
    if (sortBy === 'status') return STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
    return ENERGY_ORDER[a.energy] - ENERGY_ORDER[b.energy]
  })

  const totalTaskCount = project.demoTasks.length + projectTasks.length

  function handleAddTask(title: string, goalId: string | null) {
    if (!user) return
    createTask({
      user_id: user.id,
      goal_id: goalId,
      category_id: null,
      project_id: project.projectId,
      title,
      completed: false,
      priority: 'normal',
      energy: 2,
      estimated_minutes: null,
      due_date: null,
    })
  }

  return (
    <div className="space-y-8 pb-24">
      {/* Back button */}
      <button
        onClick={() => navigate('/projects')}
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#586062] hover:text-[#1F3649] transition-colors cursor-pointer"
      >
        <ArrowLeft size={16} />
        Back to Projects
      </button>

      {/* Hero banner */}
      <div className={`bg-gradient-to-br ${project.gradient} rounded-[15px] relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
            backgroundSize: '16px 16px',
          }}
        />
        <div className="relative p-8 md:p-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] font-bold text-white/90 bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full uppercase tracking-wider">
              {project.status}
            </span>
            <span className="text-[10px] font-bold text-white/90 bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full uppercase tracking-wider">
              {project.priority}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-3">
            {project.title}
          </h1>
          <p className="text-sm text-white/80 leading-relaxed max-w-2xl">
            {project.description}
          </p>

          <div className="flex items-center gap-2 mt-6">
            <button
              onClick={() => navigate('/tasks')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/90 bg-white/15 backdrop-blur-sm hover:bg-white/25 px-3.5 py-2 rounded-[10px] transition-all cursor-pointer"
            >
              <CheckSquare size={13} /> View All Tasks
            </button>
            <button
              onClick={() => navigate('/goals')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/90 bg-white/15 backdrop-blur-sm hover:bg-white/25 px-3.5 py-2 rounded-[10px] transition-all cursor-pointer"
            >
              <Target size={13} /> View Goals
            </button>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column — Tasks */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#2d3435] tracking-tight">
              Project Tasks
              <span className="ml-2 text-xs font-semibold text-[#adb3b4]">{totalTaskCount}</span>
            </h2>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSortBy('energy')}
                className={`text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  sortBy === 'energy' ? 'text-[#1F3649] border-b border-[#1F3649]' : 'text-[#adb3b4] hover:text-[#1F3649]'
                }`}
              >
                By Energy
              </button>
              <button
                onClick={() => setSortBy('status')}
                className={`text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  sortBy === 'status' ? 'text-[#1F3649] border-b border-[#1F3649]' : 'text-[#adb3b4] hover:text-[#1F3649]'
                }`}
              >
                By Status
              </button>
            </div>
          </div>

          {/* Store tasks (real, toggleable) */}
          {projectTasks.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-[#adb3b4] uppercase tracking-wider px-1">Your Tasks</span>
              {projectTasks.map(task => (
                <StoreTaskRow
                  key={task.id}
                  task={task}
                  goalTitle={task.goal_id ? goalMap[task.goal_id]?.title ?? null : null}
                  accentColor={project.categoryColor}
                  onToggle={() => toggleTask(task.id, !task.completed)}
                />
              ))}
            </div>
          )}

          {/* Demo tasks (static) */}
          <div className="space-y-2">
            {projectTasks.length > 0 && (
              <span className="text-[10px] font-bold text-[#adb3b4] uppercase tracking-wider px-1">Sample Tasks</span>
            )}
            {sortedDemoTasks.map(task => (
              <DemoTaskRow key={task.id} task={task} accentColor={project.categoryColor} />
            ))}
          </div>

          {/* Add task */}
          <AddTaskForm
            projectId={project.projectId}
            accentColor={project.categoryColor}
            goals={allGoals}
            onAdd={handleAddTask}
          />
        </div>

        {/* Sidebar column — Metadata */}
        <div className="space-y-5">
          <h2 className="text-base font-bold text-[#2d3435] tracking-tight">Project Metadata</h2>

          <div className="grid grid-cols-2 gap-3">
            <MetadataCard label="Timeline" value={project.timeline} />
            <MetadataCard label="Total Budget" value={project.budget} />
            <MetadataCard label="Total Tasks" value={totalTaskCount} />
            <div className="bg-white card p-5">
              <span className="text-[10px] font-bold text-[#adb3b4] uppercase tracking-wider block mb-2">Completion</span>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-[#f2f4f4] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${project.completion}%`, backgroundColor: project.categoryColor }}
                  />
                </div>
                <span className="text-sm font-bold" style={{ color: project.categoryColor }}>{project.completion}%</span>
              </div>
            </div>
          </div>

          {/* Linked Goals */}
          {projectGoals.length > 0 && (
            <div className="bg-white card p-5 space-y-3">
              <h3 className="text-[10px] font-bold text-[#adb3b4] uppercase tracking-wider">Linked Goals</h3>
              <div className="space-y-2">
                {projectGoals.map(g => (
                  <button
                    key={g.id}
                    onClick={() => navigate('/goals')}
                    className="w-full flex items-center gap-2 text-left hover:bg-[#f2f4f4] px-3 py-2 rounded-[10px] transition-colors cursor-pointer"
                  >
                    <Target size={14} style={{ color: project.categoryColor }} />
                    <span className="text-xs font-semibold text-[#2d3435]">{g.title}</span>
                    <ArrowRight size={10} className="text-[#adb3b4] ml-auto" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
