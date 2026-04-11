import { useState, useMemo, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Goal } from '../stores/wheelStore'
import {
  Target,
  Lightning,
  ListBullets,
  SquaresFour,
  Columns,
  Plus,
  ArrowRight,
  Calendar,
  CheckCircle,
  CheckSquare,
} from '@phosphor-icons/react'
import { cn } from '../lib/utils'
import { useWheelStore } from '../stores/wheelStore'
import { useAuthStore } from '../stores/authStore'
import BoardView from '../components/BoardView'
import type { BoardColumn } from '../components/BoardView'
import GradientBarsBackground from '../components/ui/GradientBarsBackground'

// ---------------------------------------------------------------------------
// Project lookup (demo)
// ---------------------------------------------------------------------------

const PROJECT_MAP: Record<string, { title: string; slug: string; color: string }> = {
  'proj-identity-redesign': { title: 'Identity Redesign', slug: 'identity-redesign', color: '#0C1629' },
  'proj-focus-mastery': { title: 'Focus Mastery', slug: 'focus-mastery', color: '#22c55e' },
  'proj-senior-track': { title: 'Senior Track Prep', slug: 'senior-track-prep', color: '#0C1629' },
}

// ---------------------------------------------------------------------------
// Category colour palette
// ---------------------------------------------------------------------------

const CATEGORY_COLORS: Record<string, string> = {
  'Health': '#22c55e',
  'Career': '#0C1629',
  'Finance': '#f59e0b',
  'Relationships': '#ec4899',
  'Personal Growth': '#8b5cf6',
  'Fun': '#f97316',
  'Environment': '#06b6d4',
  'Family/Friends': '#e11d48',
}

function getCategoryColor(name: string | null): string {
  return (name && CATEGORY_COLORS[name]) || '#0C1629'
}

// ---------------------------------------------------------------------------
// Goal Card (portfolio view)
// ---------------------------------------------------------------------------

function GoalCard({ goal, categoryName, taskCount, completedCount, onClick }: {
  goal: Goal
  categoryName: string | null
  taskCount: number
  completedCount: number
  onClick?: () => void
}) {
  const progress = taskCount > 0 ? Math.round(completedCount / taskCount * 100) : 0
  const color = getCategoryColor(categoryName)

  return (
    <article onClick={onClick} className="bg-white card overflow-hidden hover:shadow-[0_20px_40px_rgba(7,33,51,0.05)] transition-all duration-300 group cursor-pointer">
      {/* Coloured header */}
      <div className="h-28 relative overflow-hidden" style={{ backgroundColor: color + '18' }}>
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(135deg, ${color}28 0%, ${color}08 100%)` }}
        />
        <Target
          size={64}
          weight="bold"
          className="absolute -bottom-3 -right-3 opacity-[0.08]"
          style={{ color }}
        />
        <span
          className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
          style={{ color, backgroundColor: color + '20' }}
        >
          {categoryName || 'Goal'}
        </span>
        <span className={cn(
          'absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider',
          goal.status === 'active' ? 'bg-[#0C1629]/10 text-[#0C1629]' :
          goal.status === 'completed' ? 'bg-[#22c55e]/10 text-[#22c55e]' :
          'bg-[#B5C1C8]/10 text-[#B5C1C8]'
        )}>
          {goal.status}
        </span>
      </div>

      {/* Body */}
      <div className="p-5 space-y-3">
        <div>
          <h3 className="font-bold text-[#0C1629] text-sm leading-snug group-hover:text-[#0C1629] transition-colors">
            {goal.title}
          </h3>
          {goal.description && (
            <p className="text-xs text-[#727A84] leading-relaxed line-clamp-2 mt-1">
              {goal.description}
            </p>
          )}
        </div>

        {/* Progress */}
        <div>
          <div className="flex justify-between text-[10px] font-bold mb-1.5">
            <span className="text-[#B5C1C8] uppercase tracking-wider">Progress</span>
            <span style={{ color }}>{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#F0F3F3] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, backgroundColor: color }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-[10px] text-[#B5C1C8]">
            <CheckSquare size={10} />
            {completedCount}/{taskCount} tasks
          </span>
          {goal.target_date && (
            <span className="flex items-center gap-1 text-[10px] text-[#B5C1C8]">
              <Calendar size={10} />
              {new Date(goal.target_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}

function NewGoalCard() {
  return (
    <button className="group flex flex-col items-center justify-center bg-white/60 card min-h-[220px] !border-2 !border-dashed !border-[#B5C1C8]/30 hover:bg-white hover:shadow-[0_20px_40px_rgba(7,33,51,0.05)] transition-all duration-300 cursor-pointer w-full">
      <div className="w-12 h-12 rounded-full bg-[#F0F3F3] flex items-center justify-center group-hover:bg-[#0C1629]/10 transition-colors mb-3">
        <Plus size={22} weight="bold" className="text-[#727A84] group-hover:text-[#0C1629] transition-colors" />
      </div>
      <span className="text-sm font-bold text-[#0C1629] group-hover:text-[#0C1629] transition-colors">
        Set a New Goal
      </span>
      <p className="text-xs text-[#B5C1C8] mt-1 max-w-[180px] text-center">
        Define what you want to achieve and start making progress.
      </p>
    </button>
  )
}

// ---------------------------------------------------------------------------
// Goal Row (list view)
// ---------------------------------------------------------------------------

function GoalRow({ goal, categoryName, taskCount, completedCount, project, onClick }: {
  goal: Goal
  categoryName: string | null
  taskCount: number
  completedCount: number
  project: { title: string; slug: string; color: string } | null
  onClick?: () => void
}) {
  const navigate = useNavigate()
  const progress = taskCount > 0 ? Math.round(completedCount / taskCount * 100) : 0

  return (
    <div onClick={onClick} className="flex items-center gap-4 px-5 py-4 bg-white card group hover:shadow-[0_20px_40px_rgba(7,33,51,0.05)] transition-all duration-300 cursor-pointer">
      {/* Icon */}
      <div className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0"
        style={{ backgroundColor: project ? project.color + '15' : '#0C1629' + '15' }}
      >
        <Target size={18} weight="bold" style={{ color: project?.color || '#0C1629' }} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-[#0C1629] leading-snug">{goal.title}</h4>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {categoryName && (
            <span className="text-[10px] font-bold text-[#727A84] uppercase tracking-wider">{categoryName}</span>
          )}
          {goal.description && (
            <span className="text-[10px] text-[#B5C1C8] truncate max-w-[200px]">{goal.description}</span>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="hidden sm:flex items-center gap-2 shrink-0 w-32">
        <div className="flex-1 h-1.5 bg-[#F0F3F3] rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{
            width: `${progress}%`,
            backgroundColor: project?.color || '#0C1629',
          }} />
        </div>
        <span className="text-[10px] font-bold text-[#B5C1C8] w-8 text-right">{progress}%</span>
      </div>

      {/* Tasks count — clickable to view tasks */}
      <button
        onClick={() => navigate('/tasks')}
        className="hidden md:flex items-center gap-1 shrink-0 hover:text-[#0C1629] transition-colors cursor-pointer"
      >
        <CheckSquare size={12} className="text-[#B5C1C8]" />
        <span className="text-[10px] font-bold text-[#B5C1C8]">{completedCount}/{taskCount} tasks</span>
      </button>

      {/* Due date */}
      {goal.target_date && (
        <span className="hidden lg:flex items-center gap-1 text-[10px] font-semibold text-[#B5C1C8] shrink-0">
          <Calendar size={10} />
          {new Date(goal.target_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      )}

      {/* Status badge */}
      <span className={cn(
        'text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0',
        goal.status === 'active' ? 'bg-[#0C1629]/10 text-[#0C1629]' :
        goal.status === 'completed' ? 'bg-[#22c55e]/10 text-[#22c55e]' :
        'bg-[#B5C1C8]/10 text-[#B5C1C8]'
      )}>
        {goal.status}
      </span>

      {/* Project link */}
      {project && (
        <button
          onClick={() => navigate(`/projects/${project.slug}`)}
          className="hidden xl:flex items-center gap-1 text-[10px] font-semibold hover:underline shrink-0 cursor-pointer"
          style={{ color: project.color }}
        >
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: project.color }} />
          {project.title}
          <ArrowRight size={10} />
        </button>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function Goals() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { goals, tasks, categories, fetchAll, updateGoal } = useWheelStore()

  const [view, setView] = useState<'portfolio' | 'list' | 'board'>('portfolio')

  // Handle board card moves — update goal status
  const handleBoardMove = useCallback((cardId: string, _fromColumnId: string, toColumnId: string) => {
    const statusMap: Record<string, string> = { active: 'active', paused: 'paused', completed: 'completed' }
    const newStatus = statusMap[toColumnId]
    if (newStatus) updateGoal(cardId, { status: newStatus })
  }, [updateGoal])

  useEffect(() => {
    if (user) fetchAll(user.id)
  }, [user?.id])

  const categoryMap = useMemo(() => Object.fromEntries(categories.map(c => [c.id, c])), [categories])

  // Task counts per goal
  const goalTaskCounts = useMemo(() => {
    const counts: Record<string, { total: number; completed: number }> = {}
    for (const t of tasks) {
      if (!t.goal_id) continue
      if (!counts[t.goal_id]) counts[t.goal_id] = { total: 0, completed: 0 }
      counts[t.goal_id].total++
      if (t.completed) counts[t.goal_id].completed++
    }
    return counts
  }, [tasks])

  // Board columns
  const boardColumns: BoardColumn[] = useMemo(() => {
    const active = goals.filter(g => g.status === 'active')
    const completed = goals.filter(g => g.status === 'completed')
    const paused = goals.filter(g => g.status !== 'active' && g.status !== 'completed')

    const toCard = (g: Goal) => {
      const project = g.project_id ? PROJECT_MAP[g.project_id] : null
      const counts = goalTaskCounts[g.id]
      const progress = counts ? Math.round(counts.completed / counts.total * 100) : 0
      return {
        id: g.id,
        title: g.title,
        description: g.description || undefined,
        tag: categoryMap[g.category_id]?.name,
        accentColor: project?.color,
        dueDate: g.target_date ? new Date(g.target_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase() : undefined,
      }
    }

    return [
      { id: 'active', title: 'Active', cards: active.map(toCard) },
      { id: 'paused', title: 'Paused', cards: paused.map(toCard) },
      { id: 'completed', title: 'Completed', cards: completed.map(toCard) },
    ]
  }, [goals, goalTaskCounts, categoryMap])

  const activeGoals = goals.filter(g => g.status === 'active')

  return (
    <div className="pb-24 space-y-6 md:space-y-8">
      {/* Hero Banner */}
      <div className="relative bg-primary card overflow-hidden px-6 py-5 md:px-10 md:py-7">
        <GradientBarsBackground barCount={10} />
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
              <pattern id="goals-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#goals-grid)" />
          </svg>
        </div>
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
              Life Goals
            </h1>
            <p className="text-white/60 mt-1 text-xs max-w-md">
              {activeGoals.length} active goals • {goals.length} total — align your actions with your vision.
            </p>
          </div>
          <div className="flex items-center bg-white/10 rounded-[10px] p-0.5">
            <button
              onClick={() => setView('portfolio')}
              className={cn(
                'p-1.5 rounded-[8px] transition-all',
                view === 'portfolio' ? 'bg-white/20 text-white' : 'text-white/50'
              )}
            >
              <SquaresFour size={14} weight="bold" />
            </button>
            <button
              onClick={() => setView('list')}
              className={cn(
                'p-1.5 rounded-[8px] transition-all',
                view === 'list' ? 'bg-white/20 text-white' : 'text-white/50'
              )}
            >
              <ListBullets size={14} weight="bold" />
            </button>
            <button
              onClick={() => setView('board')}
              className={cn(
                'p-1.5 rounded-[8px] transition-all',
                view === 'board' ? 'bg-white/20 text-white' : 'text-white/50'
              )}
            >
              <Columns size={14} weight="bold" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {view === 'board' && (
        <BoardView
          columns={boardColumns}
          onMoveCard={handleBoardMove}
          onCardClick={(cardId) => {
            const goal = goals.find(g => g.id === cardId)
            if (goal) navigate(`/goals/${goal.id}`)
          }}
        />
      )}

      {view === 'list' && (
        <div className="space-y-2">
          {goals.map(goal => {
            const counts = goalTaskCounts[goal.id] || { total: 0, completed: 0 }
            const project = goal.project_id ? PROJECT_MAP[goal.project_id] : null
            return (
              <GoalRow
                key={goal.id}
                goal={goal}
                categoryName={categoryMap[goal.category_id]?.name ?? null}
                taskCount={counts.total}
                completedCount={counts.completed}
                project={project}
                onClick={() => navigate(`/goals/${goal.id}`)}
              />
            )
          })}
          {goals.length === 0 && (
            <div className="text-center py-16">
              <p className="text-sm text-[#B5C1C8]">No goals yet. Create goals in Wheel of Life.</p>
            </div>
          )}
        </div>
      )}

      {view === 'portfolio' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {goals.map(goal => {
            const counts = goalTaskCounts[goal.id] || { total: 0, completed: 0 }
            const categoryName = categoryMap[goal.category_id]?.name ?? null
            return (
              <GoalCard
                key={goal.id}
                goal={goal}
                categoryName={categoryName}
                taskCount={counts.total}
                completedCount={counts.completed}
                onClick={() => navigate(`/goals/${goal.id}`)}
              />
            )
          })}
          <NewGoalCard />
        </div>
      )}


    </div>
  )
}
