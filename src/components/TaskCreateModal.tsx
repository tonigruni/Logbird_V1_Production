import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  Lightning,
  CalendarBlank,
  RocketLaunch,
} from '@phosphor-icons/react'
import { cn } from '../lib/utils'
import { useWheelStore } from '../stores/wheelStore'
import { useAuthStore } from '../stores/authStore'
import type { TaskPriority, TaskEnergy } from '../stores/wheelStore'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TaskCreateModalProps {
  open: boolean
  onClose: () => void
  defaultProjectId?: string | null
  defaultGoalId?: string | null
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

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
// Project lookup
// ---------------------------------------------------------------------------

const PROJECT_OPTIONS = [
  { id: 'proj-identity-redesign', title: 'Identity Redesign' },
  { id: 'proj-focus-mastery', title: 'Focus Mastery' },
  { id: 'proj-senior-track', title: 'Senior Track Prep' },
]

// ---------------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------------

export default function TaskCreateModal({ open, onClose, defaultProjectId, defaultGoalId }: TaskCreateModalProps) {
  const { user } = useAuthStore()
  const { goals, createTask } = useWheelStore()

  const [title, setTitle] = useState('')
  const [projectId, setProjectId] = useState(defaultProjectId || '')
  const [goalId, setGoalId] = useState(defaultGoalId || '')
  const [priority, setPriority] = useState<TaskPriority>('normal')
  const [energy, setEnergy] = useState<TaskEnergy>(2)
  const [estimatedMinutes, setEstimatedMinutes] = useState<number | null>(60)
  const [dueDate, setDueDate] = useState('')

  const inputRef = useRef<HTMLInputElement>(null)

  // Focus title input on open
  useEffect(() => {
    if (open) {
      setTitle('')
      setProjectId(defaultProjectId || '')
      setGoalId(defaultGoalId || '')
      setPriority('normal')
      setEnergy(2)
      setEstimatedMinutes(60)
      setDueDate('')
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open, defaultProjectId, defaultGoalId])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  function handleCreate() {
    if (!title.trim() || !user) return
    createTask({
      user_id: user.id,
      goal_id: goalId || null,
      category_id: null,
      project_id: projectId || null,
      title: title.trim(),
      completed: false,
      priority,
      energy,
      estimated_minutes: estimatedMinutes,
      due_date: dueDate || null,
    })
    onClose()
  }

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-[20px] w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-[#ECEFF2]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#f2f4f4]">
          <h2 className="text-base font-black text-[#2d3435] tracking-tight">New Task</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#f2f4f4] rounded-full transition-colors cursor-pointer"
          >
            <X size={18} className="text-[#586062]" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[#adb3b4] uppercase tracking-wider block">
              Task Title
            </label>
            <input
              ref={inputRef}
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              placeholder="What needs to be done?"
              className="w-full text-sm text-[#2d3435] placeholder-[#adb3b4] bg-[#f2f4f4] rounded-[10px] px-4 py-3 outline-none focus:ring-2 focus:ring-[#1F3649]/10 transition-shadow"
            />
          </div>

          {/* Project + Goal row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#adb3b4] uppercase tracking-wider block">
                Project
              </label>
              <select
                value={projectId}
                onChange={e => setProjectId(e.target.value)}
                className="w-full text-xs font-semibold text-[#2d3435] bg-[#f2f4f4] rounded-[10px] px-3 py-3 border-none outline-none cursor-pointer focus:ring-2 focus:ring-[#1F3649]/10"
              >
                <option value="">No project</option>
                {PROJECT_OPTIONS.map(p => (
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
                className="w-full text-xs font-semibold text-[#2d3435] bg-[#f2f4f4] rounded-[10px] px-3 py-3 border-none outline-none cursor-pointer focus:ring-2 focus:ring-[#1F3649]/10"
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

          {/* Energy + Time row */}
          <div className="grid grid-cols-2 gap-3">
            {/* Energy */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#adb3b4] uppercase tracking-wider block">
                Energy Cost
              </label>
              <div className="flex items-center gap-2 bg-[#f2f4f4] rounded-[10px] px-4 py-3">
                {([1, 2, 3] as TaskEnergy[]).map(level => (
                  <button
                    key={level}
                    onClick={() => setEnergy(level)}
                    className="cursor-pointer"
                  >
                    <Lightning
                      size={18}
                      weight="fill"
                      className={cn(
                        'transition-colors',
                        level <= energy ? 'text-[#f59e0b]' : 'text-[#e8eaeb]'
                      )}
                    />
                  </button>
                ))}
                <span className="ml-auto text-xs font-bold text-[#adb3b4]">{energy}/3</span>
              </div>
            </div>

            {/* Time */}
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
                        : 'bg-[#f2f4f4] text-[#5a6061]'
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
            <div className="flex items-center gap-2 bg-[#f2f4f4] rounded-[10px] px-4 py-3">
              <CalendarBlank size={14} className="text-[#adb3b4] shrink-0" />
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="flex-1 text-sm font-semibold text-[#2d3435] bg-transparent outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-5 border-t border-[#f2f4f4]">
          <button
            onClick={handleCreate}
            disabled={!title.trim()}
            className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-[#1F3649] px-5 py-2.5 rounded-[10px] hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RocketLaunch size={14} weight="fill" />
            Create Task
          </button>
          <button
            onClick={onClose}
            className="text-sm font-semibold text-[#586062] hover:text-[#2d3435] px-4 py-2.5 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
