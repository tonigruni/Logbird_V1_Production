import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  RocketLaunch,
  FloppyDisk,
  Plus,
  X,
  CalendarBlank,
  Clock,
} from '@phosphor-icons/react'
import { cn } from '../lib/utils'

// ---------------------------------------------------------------------------
// Project Type options
// ---------------------------------------------------------------------------

const PROJECT_TYPES = ['Personal', 'Work', 'Side Project'] as const
type ProjectType = typeof PROJECT_TYPES[number]

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function ProjectCreate() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [projectType, setProjectType] = useState<ProjectType>('Personal')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [objectives, setObjectives] = useState<string[]>([])
  const [newObjective, setNewObjective] = useState('')

  // Calculate duration
  const duration = (() => {
    if (!startDate || !endDate) return null
    const diff = new Date(endDate).getTime() - new Date(startDate).getTime()
    const weeks = Math.round(diff / (7 * 24 * 60 * 60 * 1000))
    if (weeks <= 0) return null
    return `${weeks} Week${weeks !== 1 ? 's' : ''}`
  })()

  function addObjective() {
    if (!newObjective.trim()) return
    setObjectives(prev => [...prev, newObjective.trim()])
    setNewObjective('')
  }

  function removeObjective(index: number) {
    setObjectives(prev => prev.filter((_, i) => i !== index))
  }

  function handleCreate() {
    // In a full implementation, this would persist to the store/db
    navigate('/projects')
  }

  const isValid = name.trim().length > 0

  return (
    <div className="space-y-8 pb-24 max-w-3xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <button
          onClick={() => navigate('/projects')}
          className="inline-flex items-center gap-2 font-semibold text-[#586062] hover:text-[#1F3649] transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          Projects
        </button>
        <span className="text-[#c3c7cd]">/</span>
        <span className="font-semibold text-[#1F3649]">Create New</span>
      </div>

      {/* Title */}
      <div>
        <h1 className="text-xl font-black text-[#2d3435] tracking-tight">Initiate New Project</h1>
        <p className="text-sm text-[#5a6061] mt-1">Define the structural foundations and objectives for your next endeavor.</p>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Project Name */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-[#adb3b4] uppercase tracking-wider block">
            Project Name
          </label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter project name..."
            className="w-full text-sm text-[#2d3435] placeholder-[#adb3b4] bg-white card px-5 py-4 outline-none focus:ring-2 focus:ring-[#1F3649]/10 transition-shadow"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-[#adb3b4] uppercase tracking-wider block">
            Description / Vision
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe the project vision and scope..."
            rows={4}
            className="w-full text-sm text-[#2d3435] placeholder-[#adb3b4] bg-white card px-5 py-4 outline-none focus:ring-2 focus:ring-[#1F3649]/10 transition-shadow resize-none"
          />
        </div>

        {/* Project Type */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-[#adb3b4] uppercase tracking-wider block">
            Project Type
          </label>
          <div className="flex items-center gap-2">
            {PROJECT_TYPES.map(type => (
              <button
                key={type}
                onClick={() => setProjectType(type)}
                className={cn(
                  'px-4 py-2.5 text-xs font-semibold rounded-[10px] transition-all cursor-pointer',
                  projectType === type
                    ? 'bg-[#1F3649] text-white'
                    : 'bg-white card text-[#5a6061] hover:bg-[#f2f4f4]'
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Project Timeline */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-[#adb3b4] uppercase tracking-wider block">
            Project Timeline
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white card p-4 space-y-1.5">
              <span className="text-[10px] font-bold text-[#adb3b4] uppercase tracking-wider flex items-center gap-1">
                <CalendarBlank size={10} />
                Start Date
              </span>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full text-sm font-semibold text-[#2d3435] bg-transparent outline-none cursor-pointer"
              />
            </div>
            <div className="bg-white card p-4 space-y-1.5">
              <span className="text-[10px] font-bold text-[#adb3b4] uppercase tracking-wider flex items-center gap-1">
                <CalendarBlank size={10} />
                Expected Completion
              </span>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full text-sm font-semibold text-[#2d3435] bg-transparent outline-none cursor-pointer"
              />
            </div>
            <div className="bg-white card p-4 space-y-1.5">
              <span className="text-[10px] font-bold text-[#adb3b4] uppercase tracking-wider flex items-center gap-1">
                <Clock size={10} />
                Total Duration
              </span>
              <span className="text-sm font-bold text-[#1F3649]">
                {duration || '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Key Objectives */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-[#adb3b4] uppercase tracking-wider block">
            Key Objectives
          </label>

          {objectives.length > 0 && (
            <div className="space-y-2">
              {objectives.map((obj, i) => (
                <div key={i} className="flex items-center gap-3 bg-white card px-4 py-3">
                  <span className="flex-1 text-sm font-semibold text-[#2d3435]">{obj}</span>
                  <button
                    onClick={() => removeObjective(i)}
                    className="p-1 hover:bg-[#f2f4f4] rounded-full transition-colors cursor-pointer shrink-0"
                  >
                    <X size={14} className="text-[#adb3b4]" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              value={newObjective}
              onChange={e => setNewObjective(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addObjective()}
              placeholder="Add an objective..."
              className="flex-1 text-sm text-[#2d3435] placeholder-[#adb3b4] bg-white card px-4 py-3 outline-none focus:ring-2 focus:ring-[#1F3649]/10 transition-shadow"
            />
            <button
              onClick={addObjective}
              className="p-3 bg-white card hover:bg-[#f2f4f4] transition-colors cursor-pointer shrink-0"
            >
              <Plus size={16} className="text-[#1F3649]" />
            </button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t border-[#f2f4f4]">
        <button
          onClick={handleCreate}
          disabled={!isValid}
          className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-[#1F3649] px-6 py-3 rounded-[10px] hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <RocketLaunch size={16} weight="fill" />
          Deploy Project
        </button>
        <button
          onClick={() => navigate('/projects')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#586062] bg-white card px-6 py-3 hover:bg-[#f2f4f4] transition-colors cursor-pointer"
        >
          <FloppyDisk size={16} />
          Save as Draft
        </button>
      </div>
    </div>
  )
}
