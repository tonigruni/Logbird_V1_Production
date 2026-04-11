import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { SortAscending, Plus, ListBullets, SquaresFour, Target } from '@phosphor-icons/react'
import { cn } from '../lib/utils'
import BoardView from '../components/BoardView'
import type { BoardColumn } from '../components/BoardView'
import GradientBarsBackground from '../components/ui/GradientBarsBackground'
import { useProjectStore } from '../stores/projectStore'
import { useWheelStore } from '../stores/wheelStore'
import { useAuthStore } from '../stores/authStore'
import type { Project } from '../stores/projectStore'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function projectProgress(projectId: string, tasks: { project_id: string | null; completed: boolean }[]): number {
  const pts = tasks.filter((t) => t.project_id === projectId)
  if (pts.length === 0) return 0
  return Math.round((pts.filter((t) => t.completed).length / pts.length) * 100)
}

const STATUS_LABEL: Record<Project['status'], string> = {
  active: 'Active',
  in_progress: 'In Progress',
  completed: 'Completed',
  archived: 'Archived',
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function ProjectCard({ project, progress, goalTitle, onClick }: {
  project: Project
  progress: number
  goalTitle: string | null
  onClick: () => void
}) {
  const color = project.color || '#1F3649'
  return (
    <article
      onClick={onClick}
      className="bg-white card overflow-hidden hover:shadow-[0_20px_40px_rgba(7,33,51,0.05)] transition-all duration-300 group cursor-pointer"
    >
      {/* Cover / colour strip */}
      {project.cover_url ? (
        <div className="h-36 relative overflow-hidden bg-[#f2f4f4]">
          <img
            src={project.cover_url}
            alt={project.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <span className="absolute top-3 left-3 text-[10px] font-bold text-white/90 bg-black/25 backdrop-blur-sm px-2.5 py-1 rounded-full uppercase tracking-wider">
            {STATUS_LABEL[project.status]}
          </span>
        </div>
      ) : (
        <div className="h-10 w-full" style={{ backgroundColor: color + '22' }}>
          <div className="h-full w-1.5" style={{ backgroundColor: color }} />
        </div>
      )}

      {/* Body */}
      <div className="p-5 space-y-3">
        <div>
          <h3 className="font-bold text-[#2d3435] text-sm leading-snug group-hover:text-[#1F3649] transition-colors mb-0.5">
            {project.title}
          </h3>
          {goalTitle && (
            <p className="text-[10px] text-[#adb3b4] flex items-center gap-1">
              <Target size={9} />
              {goalTitle}
            </p>
          )}
          {project.description && (
            <p className="text-xs text-[#5a6061] leading-relaxed line-clamp-2 mt-1">
              {project.description}
            </p>
          )}
        </div>

        {/* Progress */}
        <div>
          <div className="flex justify-between text-[10px] font-bold mb-1.5">
            <span className="text-[#adb3b4] uppercase tracking-wider">Progress</span>
            <span style={{ color }}>{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#f2f4f4] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, backgroundColor: color }}
            />
          </div>
        </div>

        {project.target_date && (
          <p className="text-[10px] text-[#adb3b4]">
            Due {new Date(project.target_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        )}
      </div>
    </article>
  )
}

function NewInitiativeCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center justify-center bg-white/60 card min-h-[220px] !border-2 !border-dashed !border-[#adb3b4]/30 hover:bg-white hover:shadow-[0_20px_40px_rgba(7,33,51,0.05)] transition-all duration-300 cursor-pointer"
    >
      <div className="w-12 h-12 rounded-full bg-[#f2f4f4] flex items-center justify-center group-hover:bg-[#1F3649]/10 transition-colors mb-3">
        <Plus size={22} weight="bold" className="text-[#5a6061] group-hover:text-[#1F3649] transition-colors" />
      </div>
      <span className="text-sm font-bold text-[#2d3435] group-hover:text-[#1F3649] transition-colors">
        Launch New Initiative
      </span>
      <p className="text-xs text-[#adb3b4] mt-1 max-w-[200px] text-center">
        Create a structured space for your next breakthrough idea.
      </p>
    </button>
  )
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function ProjectsOverview() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { projects, fetchProjects } = useProjectStore()
  const { tasks, goals, fetchAll } = useWheelStore()

  const [view, setView] = useState<'grid' | 'board'>('grid')
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'progress'>('recent')

  useEffect(() => {
    if (user) {
      fetchProjects(user.id)
      fetchAll(user.id)
    }
  }, [user?.id])

  const goalMap = useMemo(() => Object.fromEntries(goals.map((g) => [g.id, g])), [goals])

  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => {
      if (sortBy === 'name') return a.title.localeCompare(b.title)
      if (sortBy === 'progress') {
        return projectProgress(b.id, tasks) - projectProgress(a.id, tasks)
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }, [projects, sortBy, tasks])

  const boardColumns: BoardColumn[] = useMemo(() => [
    {
      id: 'active',
      title: 'Active',
      cards: projects
        .filter((p) => p.status === 'active' || p.status === 'in_progress')
        .map((p) => ({
          id: p.id,
          title: p.title,
          description: p.description ?? undefined,
          tag: goalMap[p.goal_id ?? '']?.title,
          accentColor: p.color || '#1F3649',
          priority: 'medium' as const,
        })),
    },
    {
      id: 'completed',
      title: 'Completed',
      cards: projects
        .filter((p) => p.status === 'completed')
        .map((p) => ({
          id: p.id,
          title: p.title,
          description: p.description ?? undefined,
          tag: goalMap[p.goal_id ?? '']?.title,
          accentColor: p.color || '#1F3649',
          priority: 'low' as const,
        })),
    },
    {
      id: 'archived',
      title: 'Archived',
      cards: projects
        .filter((p) => p.status === 'archived')
        .map((p) => ({
          id: p.id,
          title: p.title,
          description: p.description ?? undefined,
          accentColor: p.color || '#1F3649',
          priority: 'low' as const,
        })),
    },
  ], [projects, goalMap])

  return (
    <div className="pb-24 space-y-6 md:space-y-8">
      {/* Hero Banner */}
      <div className="relative bg-primary card overflow-hidden px-6 py-5 md:px-10 md:py-7">
        <GradientBarsBackground barCount={16} />
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
              <pattern id="proj-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#proj-grid)" />
          </svg>
        </div>
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
              Project Overview
            </h1>
            <p className="text-white/60 mt-1 text-xs max-w-md">
              {projects.length > 0
                ? `${projects.filter((p) => p.status !== 'archived').length} active projects — track every initiative from concept to completion.`
                : 'Track every initiative from concept to completion. Your projects, organised and always in motion.'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white/10 rounded-[10px] p-0.5">
              <button
                onClick={() => setView('grid')}
                className={cn('p-1.5 rounded-[8px] transition-all', view === 'grid' ? 'bg-white/20 text-white' : 'text-white/50')}
              >
                <SquaresFour size={14} weight="bold" />
              </button>
              <button
                onClick={() => setView('board')}
                className={cn('p-1.5 rounded-[8px] transition-all', view === 'board' ? 'bg-white/20 text-white' : 'text-white/50')}
              >
                <ListBullets size={14} weight="bold" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {view === 'grid' ? (
        <>
          {/* Sort bar */}
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#2d3435]">
              All Projects
              <span className="ml-2 text-xs font-semibold text-[#adb3b4]">{projects.length}</span>
            </h2>
            <div className="flex items-center gap-1 text-[10px] font-bold text-[#adb3b4]">
              <SortAscending size={13} />
              {(['recent', 'name', 'progress'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSortBy(s)}
                  className={cn(
                    'px-2 py-1 rounded-md uppercase tracking-wider transition-colors cursor-pointer',
                    sortBy === s ? 'text-[#1F3649] bg-[#1F3649]/10' : 'hover:text-[#1F3649]'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {sortedProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                progress={projectProgress(project.id, tasks)}
                goalTitle={project.goal_id ? goalMap[project.goal_id]?.title ?? null : null}
                onClick={() => navigate(`/projects/${project.id}`)}
              />
            ))}
            <NewInitiativeCard onClick={() => navigate('/projects/new')} />
          </div>

          {projects.length === 0 && (
            <div className="text-center py-16 text-sm text-[#adb3b4]">
              No projects yet — launch your first initiative above.
            </div>
          )}
        </>
      ) : (
        <BoardView
          columns={boardColumns}
          onCardClick={(cardId) => navigate(`/projects/${cardId}`)}
          onCardMove={() => {}}
        />
      )}
    </div>
  )
}
