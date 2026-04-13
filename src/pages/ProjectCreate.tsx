import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  RocketLaunch,
  FloppyDisk,
  Plus,
  X,
  Clock,
  Image,
  Trash,
} from '@phosphor-icons/react'
import ImagePickerModal from '../components/ui/ImagePickerModal'
import { LogbirdDateRangePicker } from '../components/ui/date-range-picker'
import { cn } from '../lib/utils'
import { useProjectStore } from '../stores/projectStore'
import { useAuthStore } from '../stores/authStore'

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
  const { createProject } = useProjectStore()
  const { user } = useAuthStore()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [projectType, setProjectType] = useState<ProjectType>('Personal')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [objectives, setObjectives] = useState<string[]>([])
  const [newObjective, setNewObjective] = useState('')
  const [saving, setSaving] = useState(false)
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [showImagePicker, setShowImagePicker] = useState(false)

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

  async function fetchAutocover(title: string): Promise<string | null> {
    const apiKey = import.meta.env.VITE_PEXELS_API_KEY as string | undefined
    if (!apiKey || !title.trim()) return null
    try {
      const res = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(title)}&per_page=1&orientation=landscape`,
        { headers: { Authorization: apiKey } }
      )
      const data = await res.json()
      return data.photos?.[0]?.src?.large ?? null
    } catch {
      return null
    }
  }

  async function handleCreate() {
    if (!user || !name.trim()) return
    setSaving(true)
    try {
      const resolvedCover = coverUrl ?? await fetchAutocover(name.trim())
      const project = await createProject({
        user_id: user.id,
        title: name.trim(),
        description: [description.trim(), objectives.length ? `Objectives:\n${objectives.map(o => `• ${o}`).join('\n')}` : ''].filter(Boolean).join('\n\n') || null,
        status: 'active',
        goal_id: null,
        color: '#0C1629',
        cover_url: resolvedCover,
        target_date: endDate || null,
        start_date: startDate || null,
        end_date: endDate || null,
      })
      if (project) navigate(`/projects/${project.id}`)
      else navigate('/projects')
    } catch (e) {
      console.error(e)
      setSaving(false)
    }
  }

  const isValid = name.trim().length > 0

  return (
    <div className="space-y-8 pb-24 max-w-3xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <button
          onClick={() => navigate('/projects')}
          className="inline-flex items-center gap-2 font-semibold text-[#727A84] hover:text-[#0C1629] transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          Projects
        </button>
        <span className="text-[#c3c7cd]">/</span>
        <span className="font-semibold text-[#0C1629]">Create New</span>
      </div>

      {/* Title */}
      <div>
        <h1 className="text-xl font-black text-[#0C1629] tracking-tight">Initiate New Project</h1>
        <p className="text-sm text-[#727A84] mt-1">Define the structural foundations and objectives for your next endeavor.</p>
      </div>

      <ImagePickerModal
        open={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onSelect={url => setCoverUrl(url)}
      />

      {/* Form */}
      <div className="space-y-6">
        {/* Cover Image */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-[#B5C1C8] uppercase tracking-wider block">
            Cover Image
          </label>
          {coverUrl ? (
            <div className="relative rounded-[12px] overflow-hidden h-40 group">
              <img src={coverUrl} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button
                  onClick={() => setShowImagePicker(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white/90 rounded-[8px] text-xs font-semibold text-[#0C1629] cursor-pointer"
                >
                  <Image size={13} /> Change
                </button>
                <button
                  onClick={() => setCoverUrl(null)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white/90 rounded-[8px] text-xs font-semibold text-[#dc2626] cursor-pointer"
                >
                  <Trash size={13} /> Remove
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowImagePicker(true)}
              className="w-full h-32 flex flex-col items-center justify-center gap-2 bg-white card !border-2 !border-dashed !border-[#B5C1C8]/30 hover:!border-[#0C1629]/20 hover:bg-[#F7F8F9] transition-all rounded-[12px] cursor-pointer group"
            >
              <Image size={20} className="text-[#B5C1C8] group-hover:text-[#727A84] transition-colors" />
              <span className="text-xs font-semibold text-[#B5C1C8] group-hover:text-[#727A84] transition-colors">
                Add cover image
              </span>
            </button>
          )}
        </div>

        {/* Project Name */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-[#B5C1C8] uppercase tracking-wider block">
            Project Name
          </label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter project name..."
            className="w-full text-sm text-[#0C1629] placeholder-[#B5C1C8] bg-white card px-5 py-4 outline-none focus:ring-2 focus:ring-[#0C1629]/10 transition-shadow"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-[#B5C1C8] uppercase tracking-wider block">
            Description / Vision
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe the project vision and scope..."
            rows={4}
            className="w-full text-sm text-[#0C1629] placeholder-[#B5C1C8] bg-white card px-5 py-4 outline-none focus:ring-2 focus:ring-[#0C1629]/10 transition-shadow resize-none"
          />
        </div>

        {/* Project Type */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-[#B5C1C8] uppercase tracking-wider block">
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
                    ? 'bg-[#0C1629] text-white'
                    : 'bg-white card text-[#727A84] hover:bg-[#F0F3F3]'
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Project Timeline */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div className="sm:col-span-2 bg-white card p-4">
              <LogbirdDateRangePicker
                label="Project Timeline"
                value={{ start: startDate || null, end: endDate || null }}
                onChange={({ start, end }) => {
                  setStartDate(start ?? '')
                  setEndDate(end ?? '')
                }}
              />
            </div>
            <div className="bg-white card p-4 space-y-1.5">
              <span className="text-[10px] font-bold text-[#B5C1C8] uppercase tracking-wider flex items-center gap-1">
                <Clock size={10} />
                Total Duration
              </span>
              <span className="text-sm font-bold text-[#0C1629]">
                {duration || '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Key Objectives */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-[#B5C1C8] uppercase tracking-wider block">
            Key Objectives
          </label>

          {objectives.length > 0 && (
            <div className="space-y-2">
              {objectives.map((obj, i) => (
                <div key={i} className="flex items-center gap-3 bg-white card px-4 py-3">
                  <span className="flex-1 text-sm font-semibold text-[#0C1629]">{obj}</span>
                  <button
                    onClick={() => removeObjective(i)}
                    className="p-1 hover:bg-[#F0F3F3] rounded-full transition-colors cursor-pointer shrink-0"
                  >
                    <X size={14} className="text-[#B5C1C8]" />
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
              className="flex-1 text-sm text-[#0C1629] placeholder-[#B5C1C8] bg-white card px-4 py-3 outline-none focus:ring-2 focus:ring-[#0C1629]/10 transition-shadow"
            />
            <button
              onClick={addObjective}
              className="p-3 bg-white card hover:bg-[#F0F3F3] transition-colors cursor-pointer shrink-0"
            >
              <Plus size={16} className="text-[#0C1629]" />
            </button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t border-[#F0F3F3]">
        <button
          onClick={handleCreate}
          disabled={!isValid}
          className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-[#0C1629] px-6 py-3 rounded-[10px] hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <RocketLaunch size={16} weight="fill" />
          Deploy Project
        </button>
        <button
          onClick={() => navigate('/projects')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#727A84] bg-white card px-6 py-3 hover:bg-[#F0F3F3] transition-colors cursor-pointer"
        >
          <FloppyDisk size={16} />
          Save as Draft
        </button>
      </div>
    </div>
  )
}
