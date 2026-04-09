import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SortAscending, Plus, Lightning, Users, ListBullets, SquaresFour } from '@phosphor-icons/react'
import { cn } from '../lib/utils'
import BoardView from '../components/BoardView'
import type { BoardColumn } from '../components/BoardView'
import GradientBarsBackground from '../components/ui/GradientBarsBackground'

// ---------------------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------------------

const PROJECTS = [
  {
    id: 'LOG-042',
    slug: 'identity-redesign',
    title: 'Identity Redesign',
    category: 'Creative',
    categoryColor: '#1F3649',
    description: 'Reimagining the visual language for the 2024 global expansion strategy.',
    progress: 75,
    image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&h=400&fit=crop&q=80',
  },
  {
    id: 'LOG-019',
    slug: 'focus-mastery',
    title: 'Focus Mastery',
    category: 'Wellness',
    categoryColor: '#22c55e',
    description: 'Internal wellbeing program focused on deep-work habits and cognitive health.',
    progress: 30,
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=400&fit=crop&q=80',
  },
  {
    id: 'LOG-088',
    slug: 'senior-track-prep',
    title: 'Senior Track Prep',
    category: 'Career',
    categoryColor: '#1F3649',
    description: 'Portfolio curation and leadership certification for Q4 promotions.',
    progress: 90,
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop&q=80',
  },
]

const FEATURED_PROJECT = {
  title: 'Sustainable Habitat',
  category: 'Creative',
  categoryColor: '#f59e0b',
  description: 'A zero-footprint housing prototype exploring modular architectural components and natural ventilation.',
  progress: 55,
  contributors: 12,
  image: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=800&h=400&fit=crop&q=80',
}

const STATS = [
  { label: 'Total Active', value: '12' },
  { label: 'In Review', value: '04' },
  { label: 'Upcoming', value: '08' },
  { label: 'Completed', value: '32' },
]

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function ProjectCard({ project, onClick }: { project: typeof PROJECTS[number]; onClick: () => void }) {
  return (
    <article onClick={onClick} className="bg-white card overflow-hidden hover:shadow-[0_20px_40px_rgba(7,33,51,0.05)] transition-all duration-300 group cursor-pointer">
      {/* Cover image */}
      <div className="h-36 relative overflow-hidden bg-[#f2f4f4]">
        <img
          src={project.image}
          alt={project.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <span className="absolute top-3 left-3 text-[10px] font-bold text-white/90 bg-black/25 backdrop-blur-sm px-2.5 py-1 rounded-full uppercase tracking-wider">
          {project.category}
        </span>
      </div>

      {/* Body */}
      <div className="p-5 space-y-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-[#2d3435] text-sm leading-snug group-hover:text-[#1F3649] transition-colors">
              {project.title}
            </h3>
            <span className="text-[10px] font-mono font-medium text-[#adb3b4]">{project.id}</span>
          </div>
          <p className="text-xs text-[#5a6061] leading-relaxed line-clamp-2">
            {project.description}
          </p>
        </div>

        {/* Progress */}
        <div>
          <div className="flex justify-between text-[10px] font-bold mb-1.5">
            <span className="text-[#adb3b4] uppercase tracking-wider">Progress</span>
            <span style={{ color: project.categoryColor }}>{project.progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#f2f4f4] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${project.progress}%`,
                backgroundColor: project.categoryColor,
              }}
            />
          </div>
        </div>
      </div>
    </article>
  )
}

function FeaturedCard({ project, onClick }: { project: typeof FEATURED_PROJECT; onClick: () => void }) {
  return (
    <article onClick={onClick} className="bg-white card overflow-hidden hover:shadow-[0_20px_40px_rgba(7,33,51,0.05)] transition-all duration-300 group cursor-pointer col-span-full lg:col-span-2">
      <div className="flex flex-col md:flex-row">
        {/* Cover image */}
        <div className="h-48 md:h-auto md:w-72 relative overflow-hidden shrink-0 bg-[#f2f4f4]">
          <img
            src={project.image}
            alt={project.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <span className="absolute top-3 left-3 text-[10px] font-bold text-white/90 bg-black/25 backdrop-blur-sm px-2.5 py-1 rounded-full uppercase tracking-wider">
            {project.category}
          </span>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 flex flex-col justify-between gap-4">
          <div>
            <h3 className="font-bold text-[#2d3435] text-base leading-snug group-hover:text-[#1F3649] transition-colors mb-2">
              {project.title}
            </h3>
            <p className="text-sm text-[#5a6061] leading-relaxed">
              {project.description}
            </p>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5a6061]">
              <Users size={14} weight="bold" />
              +{project.contributors} Contributors
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-[#adb3b4] uppercase tracking-wider">Completion Status</span>
              <div className="w-24 h-1.5 bg-[#f2f4f4] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${project.progress}%`,
                    backgroundColor: project.categoryColor,
                  }}
                />
              </div>
              <span className="text-xs font-bold" style={{ color: project.categoryColor }}>{project.progress}%</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

function NewInitiativeCard({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="group flex flex-col items-center justify-center bg-white/60 card min-h-[220px] !border-2 !border-dashed !border-[#adb3b4]/30 hover:bg-white hover:shadow-[0_20px_40px_rgba(7,33,51,0.05)] transition-all duration-300 cursor-pointer">
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

const ALL_PROJECTS_FOR_BOARD = [...PROJECTS, {
  id: 'LOG-099',
  slug: 'sustainable-habitat',
  title: FEATURED_PROJECT.title,
  category: FEATURED_PROJECT.category,
  categoryColor: FEATURED_PROJECT.categoryColor,
  description: FEATURED_PROJECT.description,
  progress: FEATURED_PROJECT.progress,
  gradient: FEATURED_PROJECT.gradient,
}]

const PROJECT_BOARD_COLUMNS: BoardColumn[] = [
  {
    id: 'active',
    title: 'Active',
    cards: ALL_PROJECTS_FOR_BOARD.filter(p => p.progress < 100).map(p => ({
      id: p.id,
      title: p.title,
      description: p.description,
      tag: p.category,
      accentColor: p.categoryColor,
      priority: p.progress >= 80 ? 'high' as const : p.progress >= 50 ? 'medium' as const : 'low' as const,
    })),
  },
  {
    id: 'in-review',
    title: 'In Review',
    cards: [],
  },
  {
    id: 'completed',
    title: 'Completed',
    cards: [],
  },
]

export default function ProjectsOverview() {
  const navigate = useNavigate()
  const [view, setView] = useState<'grid' | 'board'>('grid')
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'progress'>('recent')

  const sortedProjects = [...PROJECTS].sort((a, b) => {
    if (sortBy === 'name') return a.title.localeCompare(b.title)
    if (sortBy === 'progress') return b.progress - a.progress
    return 0 // recent = default order
  })

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
              Track every initiative from concept to completion. Your projects, organised and always in motion.
            </p>
          </div>
          <div className="flex items-center bg-white/10 rounded-[10px] p-0.5">
            <button
              onClick={() => setView('grid')}
              className={cn(
                'p-1.5 rounded-[8px] transition-all',
                view === 'grid' ? 'bg-white/20 text-white' : 'text-white/50'
              )}
            >
              <SquaresFour size={14} weight="bold" />
            </button>
            <button
              onClick={() => setView('board')}
              className={cn(
                'p-1.5 rounded-[8px] transition-all',
                view === 'board' ? 'bg-white/20 text-white' : 'text-white/50'
              )}
            >
              <ListBullets size={14} weight="bold" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Sort Bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setSortBy(s => s === 'recent' ? 'name' : s === 'name' ? 'progress' : 'recent')}
          className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-[8px] bg-[#f2f4f4] text-xs text-[#5a6061] font-semibold hover:bg-[#ebeeef] transition-colors cursor-pointer"
        >
          <SortAscending size={11} />
          Sort: {sortBy === 'recent' ? 'Recent' : sortBy === 'name' ? 'Name' : 'Progress'}
        </button>
      </div>

      {view === 'board' ? (
        <BoardView columns={PROJECT_BOARD_COLUMNS} />
      ) : (
        <>
          {/* Project grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {sortedProjects.map(project => (
              <ProjectCard key={project.id} project={project} onClick={() => navigate(`/projects/${project.slug}`)} />
            ))}
          </div>

          {/* Featured + CTA row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <FeaturedCard project={FEATURED_PROJECT} onClick={() => navigate('/projects/sustainable-habitat')} />
            <NewInitiativeCard onClick={() => navigate('/projects/new')} />
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map(stat => (
              <div key={stat.label} className="bg-white card p-5 text-center">
                <span className="text-[10px] font-bold text-[#adb3b4] uppercase tracking-wider block mb-1">
                  {stat.label}
                </span>
                <span className="text-2xl font-black text-[#2d3435] tracking-tight">{stat.value}</span>
              </div>
            ))}
          </div>

          {/* Global status */}
          <div className="bg-white card p-5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#1F3649]/10 flex items-center justify-center">
              <Lightning size={16} weight="fill" className="text-[#1F3649]" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#adb3b4] uppercase tracking-wider block">Global Status</span>
              <span className="text-sm font-bold text-[#2d3435]">Architecture System Optimal</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
