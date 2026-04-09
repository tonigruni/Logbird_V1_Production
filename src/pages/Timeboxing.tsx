import { useState, useMemo, useCallback, useEffect } from 'react'
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  Lightning,
  Clock,
  CaretLeft,
  CaretRight,
  DotsSixVertical,
  Timer,
  Flag,
  Lightbulb,
  Plus,
  ChartBar,
  CalendarBlank,
} from '@phosphor-icons/react'
import { cn } from '../lib/utils'
import { useWheelStore } from '../stores/wheelStore'
import { useAuthStore } from '../stores/authStore'
import type { Task, TaskPriority } from '../stores/wheelStore'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ScheduledBlock {
  id: string
  taskId: string | null
  title: string
  startHour: number // 8.25 = 8:15 AM
  durationMinutes: number
  color: string
  category: string
  priority?: TaskPriority
  energy?: 1 | 2 | 3
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatHour(hour: number): string {
  const h = Math.floor(hour)
  const m = Math.round((hour - h) * 60)
  const period = h >= 12 ? 'PM' : 'AM'
  const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h
  return m > 0 ? `${displayH}:${m.toString().padStart(2, '0')} ${period}` : `${displayH}:00 ${period}`
}

function formatTimeRange(start: number, durationMin: number): string {
  const end = start + durationMin / 60
  return `${formatHour(start)} — ${formatHour(end)}`
}

function formatMinutes(min: number | null): string {
  if (!min) return ''
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h === 0) return `${m} min`
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function formatDateTitle(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
}

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  urgent: '#dc2626',
  high: '#f59e0b',
  normal: '#1F3649',
  low: '#adb3b4',
}

const HOUR_SLOTS = Array.from({ length: 12 }, (_, i) => 8 + i) // 8 AM to 7 PM
const SLOT_HEIGHT = 64 // px per hour

// ---------------------------------------------------------------------------
// Demo scheduled blocks
// ---------------------------------------------------------------------------

const INITIAL_SCHEDULED: ScheduledBlock[] = [
  {
    id: 'sched-1',
    taskId: null,
    title: 'Deep Work: Focus Session',
    startHour: 8.25,
    durationMinutes: 60,
    color: '#1F3649',
    category: 'Deep Focus',
  },
  {
    id: 'sched-2',
    taskId: null,
    title: 'Client Strategy Meeting',
    startHour: 9.5,
    durationMinutes: 90,
    color: '#1F3649',
    category: 'Meeting',
  },
]

// ---------------------------------------------------------------------------
// Draggable unscheduled task card (left panel)
// ---------------------------------------------------------------------------

function DraggableTaskCard({ task, categoryName }: { task: Task; categoryName: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { type: 'unscheduled', task },
  })

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'bg-white card p-3 flex items-start gap-2.5 cursor-grab active:cursor-grabbing group transition-all',
        isDragging && 'opacity-40 scale-95'
      )}
    >
      <DotsSixVertical size={14} weight="bold" className="text-[#c3c7cd] shrink-0 mt-1" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={cn(
            'text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full',
            task.priority === 'urgent' || task.priority === 'high'
              ? 'bg-[#1F3649] text-white'
              : task.energy === 3
                ? 'bg-[#f59e0b] text-white'
                : 'bg-[#adb3b4]/20 text-[#5a6061]'
          )}>
            {categoryName || 'Task'}
          </span>
        </div>
        <h4 className="text-xs font-bold text-[#2d3435] leading-snug">{task.title}</h4>
        {task.estimated_minutes && (
          <div className="flex items-center gap-1 mt-1.5 text-[10px] text-[#adb3b4] font-semibold">
            <Clock size={10} />
            {formatMinutes(task.estimated_minutes)}
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Drag overlay preview
// ---------------------------------------------------------------------------

function DragPreview({ task, categoryName }: { task: Task; categoryName: string }) {
  return (
    <div className="bg-white card p-3 flex items-start gap-2.5 shadow-xl rotate-2 w-64 opacity-90">
      <DotsSixVertical size={14} weight="bold" className="text-[#c3c7cd] shrink-0 mt-1" />
      <div className="flex-1 min-w-0">
        <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-[#1F3649] text-white">
          {categoryName || 'Task'}
        </span>
        <h4 className="text-xs font-bold text-[#2d3435] leading-snug mt-1">{task.title}</h4>
        {task.estimated_minutes && (
          <div className="flex items-center gap-1 mt-1 text-[10px] text-[#adb3b4] font-semibold">
            <Clock size={10} />
            {formatMinutes(task.estimated_minutes)}
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Droppable time slot
// ---------------------------------------------------------------------------

function TimeSlotDrop({ hour, isOver }: { hour: number; isOver: boolean }) {
  const { setNodeRef } = useDroppable({ id: `slot-${hour}` })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'absolute left-0 right-0 z-0 transition-colors',
        isOver && 'bg-[#1F3649]/5'
      )}
      style={{
        top: (hour - 8) * SLOT_HEIGHT,
        height: SLOT_HEIGHT,
      }}
    />
  )
}

// ---------------------------------------------------------------------------
// Draggable scheduled block on timeline
// ---------------------------------------------------------------------------

function ScheduledBlockCard({ block, onRemove }: { block: ScheduledBlock; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `scheduled-${block.id}`,
    data: { type: 'scheduled', block },
  })

  const top = (block.startHour - 8) * SLOT_HEIGHT
  const height = (block.durationMinutes / 60) * SLOT_HEIGHT

  const style = {
    top: top + 2,
    height: Math.max(height - 4, 28),
    backgroundColor: block.color + '12',
    borderLeft: `3px solid ${block.color}`,
    ...(transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : {}),
  }

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        'absolute left-16 right-2 z-10 rounded-[12px] overflow-hidden group cursor-grab active:cursor-grabbing transition-shadow hover:shadow-[0_8px_24px_rgba(7,33,51,0.1)]',
        isDragging && 'opacity-40 scale-95'
      )}
      style={style}
    >
      <div className="px-3 py-2 h-full flex flex-col justify-between">
        <div>
          <h4 className="text-xs font-bold text-[#2d3435] leading-snug truncate">{block.title}</h4>
          {height > 40 && (
            <p className="text-[10px] font-semibold mt-0.5" style={{ color: block.color }}>
              {formatTimeRange(block.startHour, block.durationMinutes)}
            </p>
          )}
        </div>
        {height > 56 && (
          <div className="flex items-center gap-2">
            <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-white/80 text-[#5a6061]">
              {block.category}
            </span>
            {block.priority && (
              <span className="flex items-center gap-0.5 text-[10px] font-bold" style={{ color: PRIORITY_COLORS[block.priority] }}>
                <Flag size={9} weight="fill" />
                {block.priority}
              </span>
            )}
            {block.energy && (
              <div className="flex items-center gap-0.5">
                {[1, 2, 3].map(i => (
                  <Lightning key={i} size={8} weight="fill" className={i <= block.energy! ? 'text-[#f59e0b]' : 'text-[#e8eaeb]'} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      {/* Remove button on hover */}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove() }}
        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[#adb3b4] hover:text-[#dc2626]"
      >
        <span className="text-xs font-bold leading-none">&times;</span>
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Droppable unscheduled panel wrapper
// ---------------------------------------------------------------------------

function UnscheduledDropZone({ children, isOver }: { children: React.ReactNode; isOver: boolean }) {
  const { setNodeRef } = useDroppable({ id: 'unscheduled-panel' })

  return (
    <div ref={setNodeRef} className={cn('space-y-3 transition-colors', isOver && 'rounded-[15px] ring-2 ring-[#1F3649]/20 bg-[#1F3649]/[0.03]')}>
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Scheduled block drag preview
// ---------------------------------------------------------------------------

function ScheduledDragPreview({ block }: { block: ScheduledBlock }) {
  return (
    <div
      className="rounded-[12px] px-3 py-2 shadow-xl rotate-[-2deg] w-56 opacity-90"
      style={{ backgroundColor: block.color + '20', borderLeft: `3px solid ${block.color}` }}
    >
      <h4 className="text-xs font-bold text-[#2d3435] leading-snug truncate">{block.title}</h4>
      <p className="text-[10px] font-semibold mt-0.5" style={{ color: block.color }}>
        {block.category} • {formatMinutes(block.durationMinutes)}
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function Timeboxing() {
  const { user } = useAuthStore()
  const { tasks, categories, fetchAll } = useWheelStore()

  useEffect(() => {
    if (user) fetchAll(user.id)
  }, [user?.id])

  const [viewMode, setViewMode] = useState<'day' | 'week'>('day')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [scheduledBlocks, setScheduledBlocks] = useState<ScheduledBlock[]>(INITIAL_SCHEDULED)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [overSlot, setOverSlot] = useState<string | null>(null)

  const categoryMap = useMemo(() => Object.fromEntries(categories.map(c => [c.id, c])), [categories])

  // Tasks not yet scheduled (incomplete, not in scheduledBlocks)
  const scheduledTaskIds = useMemo(() => new Set(scheduledBlocks.filter(b => b.taskId).map(b => b.taskId!)), [scheduledBlocks])
  const unscheduledTasks = useMemo(
    () => tasks.filter(t => !t.completed && !scheduledTaskIds.has(t.id)),
    [tasks, scheduledTaskIds]
  )

  const activeTask = useMemo(
    () => activeId ? tasks.find(t => t.id === activeId) : null,
    [activeId, tasks]
  )

  const activeBlock = useMemo(
    () => activeId ? scheduledBlocks.find(b => `scheduled-${b.id}` === activeId) : null,
    [activeId, scheduledBlocks]
  )

  // Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  // Calculate focus stats
  const totalScheduledMinutes = useMemo(
    () => scheduledBlocks.reduce((sum, b) => sum + b.durationMinutes, 0),
    [scheduledBlocks]
  )
  const focusHours = (totalScheduledMinutes / 60).toFixed(1)
  const focusScore = Math.min(100, Math.round((totalScheduledMinutes / 480) * 100)) // 8h = 100%

  // Workload breakdown
  const workloadBreakdown = useMemo(() => {
    const cats: Record<string, number> = {}
    scheduledBlocks.forEach(b => {
      const key = b.category || 'Other'
      cats[key] = (cats[key] || 0) + b.durationMinutes
    })
    const total = Object.values(cats).reduce((s, v) => s + v, 0) || 1
    return Object.entries(cats).map(([label, mins]) => ({
      label,
      percent: Math.round((mins / total) * 100),
    })).sort((a, b) => b.percent - a.percent)
  }, [scheduledBlocks])

  // Date navigation
  function goToday() { setCurrentDate(new Date()) }
  function goPrev() { setCurrentDate(d => { const n = new Date(d); n.setDate(n.getDate() - 1); return n }) }
  function goNext() { setCurrentDate(d => { const n = new Date(d); n.setDate(n.getDate() + 1); return n }) }

  // DnD handlers
  function handleDragStart(e: DragStartEvent) {
    setActiveId(e.active.id as string)
  }

  function handleDragOver(e: any) {
    setOverSlot(e.over?.id ? String(e.over.id) : null)
  }

  function handleDragEnd(e: DragEndEvent) {
    const dragId = String(e.active.id)
    const overId = e.over?.id ? String(e.over.id) : null

    setActiveId(null)
    setOverSlot(null)

    // Case 1: Dragging a scheduled block back to unscheduled panel
    if (dragId.startsWith('scheduled-') && overId === 'unscheduled-panel') {
      const blockId = dragId.replace('scheduled-', '')
      setScheduledBlocks(prev => prev.filter(b => b.id !== blockId))
      return
    }

    // Case 2: Dragging a scheduled block to a different time slot
    if (dragId.startsWith('scheduled-') && overId?.startsWith('slot-')) {
      const blockId = dragId.replace('scheduled-', '')
      const hour = parseInt(overId.replace('slot-', ''), 10)
      setScheduledBlocks(prev => prev.map(b => b.id === blockId ? { ...b, startHour: hour } : b))
      return
    }

    // Case 3: Dragging an unscheduled task to a time slot
    if (!dragId.startsWith('scheduled-') && overId?.startsWith('slot-')) {
      const hour = parseInt(overId.replace('slot-', ''), 10)
      const task = tasks.find(t => t.id === dragId)
      if (!task) return

      const catName = task.category_id ? categoryMap[task.category_id]?.name : null

      const newBlock: ScheduledBlock = {
        id: `sched-${Date.now()}`,
        taskId: task.id,
        title: task.title,
        startHour: hour,
        durationMinutes: task.estimated_minutes || 60,
        color: PRIORITY_COLORS[task.priority],
        category: catName || (task.priority === 'urgent' ? 'Urgent' : 'Task'),
        priority: task.priority,
        energy: task.energy,
      }

      setScheduledBlocks(prev => [...prev, newBlock])
    }
  }

  function removeBlock(blockId: string) {
    setScheduledBlocks(prev => prev.filter(b => b.id !== blockId))
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
      <div className="space-y-6 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-base font-bold text-[#2d3435] tracking-tight">Calendar & Timeboxing</h2>
            <p className="text-xs text-[#adb3b4] mt-0.5 flex items-center gap-1.5">
              <Timer size={12} />
              {unscheduledTasks.length} tasks unscheduled • {focusHours}h planned today
            </p>
          </div>
        </div>

        {/* Main layout: 3 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_240px] gap-5">
          {/* ---- Left panel: Unscheduled tasks (droppable) ---- */}
          <UnscheduledDropZone isOver={overSlot === 'unscheduled-panel'}>
            <div className="bg-white card p-4">
              <h3 className="text-xs font-bold text-[#2d3435] mb-1">Unscheduled</h3>
              <p className="text-[10px] text-[#adb3b4] font-semibold">
                {activeBlock ? 'Drop here to unschedule' : 'Drag tasks to the timeline'}
              </p>
            </div>
            <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto pr-1">
              {unscheduledTasks.map(task => (
                <DraggableTaskCard
                  key={task.id}
                  task={task}
                  categoryName={task.category_id ? categoryMap[task.category_id]?.name ?? '' : ''}
                />
              ))}
              {unscheduledTasks.length === 0 && !activeBlock && (
                <div className="text-center py-8">
                  <p className="text-xs text-[#adb3b4]">All tasks scheduled</p>
                </div>
              )}
            </div>
          </UnscheduledDropZone>

          {/* ---- Main panel: Day timeline ---- */}
          <div className="bg-white card overflow-hidden">
            {/* Day header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#f2f4f4]">
              <h3 className="text-sm font-bold text-[#2d3435]">{formatDateTitle(currentDate)}</h3>
              <div className="flex items-center gap-3">
                {/* Day/Week toggle */}
                <div className="flex items-center bg-[#f2f4f4] rounded-[10px] p-0.5">
                  <button
                    onClick={() => setViewMode('day')}
                    className={cn(
                      'px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-[8px] transition-all cursor-pointer',
                      viewMode === 'day' ? 'bg-white shadow-sm text-[#1F3649]' : 'text-[#adb3b4]'
                    )}
                  >
                    Day
                  </button>
                  <button
                    onClick={() => setViewMode('week')}
                    className={cn(
                      'px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-[8px] transition-all cursor-pointer',
                      viewMode === 'week' ? 'bg-white shadow-sm text-[#1F3649]' : 'text-[#adb3b4]'
                    )}
                  >
                    Week
                  </button>
                </div>
                {/* Date nav */}
                <div className="flex items-center gap-1">
                  <button onClick={goPrev} className="p-1.5 hover:bg-[#f2f4f4] rounded-[8px] transition-colors cursor-pointer">
                    <CaretLeft size={14} className="text-[#586062]" />
                  </button>
                  <button
                    onClick={goToday}
                    className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#586062] hover:bg-[#f2f4f4] rounded-[8px] transition-colors cursor-pointer"
                  >
                    Today
                  </button>
                  <button onClick={goNext} className="p-1.5 hover:bg-[#f2f4f4] rounded-[8px] transition-colors cursor-pointer">
                    <CaretRight size={14} className="text-[#586062]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Timeline */}
            {viewMode === 'day' ? (
              <div className="relative" style={{ height: HOUR_SLOTS.length * SLOT_HEIGHT }}>
                {/* Hour gridlines */}
                {HOUR_SLOTS.map(hour => (
                  <div
                    key={hour}
                    className="absolute left-0 right-0 border-t border-[#f2f4f4] flex items-start"
                    style={{ top: (hour - 8) * SLOT_HEIGHT }}
                  >
                    <span className="text-[10px] font-semibold text-[#adb3b4] w-16 shrink-0 pt-1 text-right pr-3">
                      {formatHour(hour)}
                    </span>
                  </div>
                ))}

                {/* Droppable slots */}
                {HOUR_SLOTS.map(hour => (
                  <TimeSlotDrop
                    key={`drop-${hour}`}
                    hour={hour}
                    isOver={overSlot === `slot-${hour}`}
                  />
                ))}

                {/* Scheduled blocks */}
                {scheduledBlocks.map(block => (
                  <ScheduledBlockCard
                    key={block.id}
                    block={block}
                    onRemove={() => removeBlock(block.id)}
                  />
                ))}

                {/* Drop hint when dragging */}
                {activeId && !overSlot && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
                    <div className="bg-[#1F3649] text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 whitespace-nowrap animate-pulse">
                      <Plus size={10} weight="bold" />
                      Drop on a time slot to schedule
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Week view */
              <div className="p-5">
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 7 }, (_, i) => {
                    const d = new Date(currentDate)
                    d.setDate(d.getDate() - d.getDay() + i)
                    const isToday = d.toDateString() === new Date().toDateString()
                    return (
                      <div key={i} className="space-y-2">
                        <div className={cn(
                          'text-center py-2 rounded-[10px]',
                          isToday ? 'bg-[#1F3649] text-white' : 'bg-[#f2f4f4]'
                        )}>
                          <span className="text-[10px] font-bold uppercase tracking-wider block">
                            {d.toLocaleDateString('en-US', { weekday: 'short' })}
                          </span>
                          <span className="text-lg font-black">{d.getDate()}</span>
                        </div>
                        {/* Show blocks for today only (simplified) */}
                        {isToday && scheduledBlocks.map(block => (
                          <div
                            key={block.id}
                            className="rounded-[8px] px-2 py-1.5 text-[9px] font-bold truncate"
                            style={{ backgroundColor: block.color + '15', color: block.color }}
                          >
                            {block.title}
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
                <p className="text-xs text-[#adb3b4] text-center mt-6">
                  Switch to Day view to drag & schedule tasks
                </p>
              </div>
            )}
          </div>

          {/* ---- Right panel: Insights ---- */}
          <div className="space-y-4">
            {/* Focus Score */}
            <div className="bg-white card p-5 space-y-3">
              <h3 className="text-[10px] font-bold text-[#adb3b4] uppercase tracking-wider">Focus Score</h3>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-black text-[#1F3649] tracking-tight">{focusScore}</span>
                <span className="text-sm font-bold text-[#adb3b4] mb-1">/ 100</span>
              </div>
              <p className="text-[10px] text-[#5a6061] leading-relaxed">
                You&apos;ve planned <strong className="text-[#2d3435]">{focusHours} hours</strong> of focused work today.
                {Number(focusHours) >= 4
                  ? ' Great planning!'
                  : ' Try scheduling more deep work blocks.'}
              </p>
              {/* Mini progress bar */}
              <div className="w-full h-1.5 bg-[#f2f4f4] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#1F3649] transition-all duration-500"
                  style={{ width: `${focusScore}%` }}
                />
              </div>
            </div>

            {/* Workload Balance */}
            <div className="bg-white card p-5 space-y-3">
              <h3 className="text-[10px] font-bold text-[#adb3b4] uppercase tracking-wider">Workload Balance</h3>
              {workloadBreakdown.length > 0 ? (
                <div className="space-y-2.5">
                  {workloadBreakdown.map(item => (
                    <div key={item.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-[#2d3435]">{item.label}</span>
                        <span className="text-[10px] font-bold text-[#adb3b4]">{item.percent}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#f2f4f4] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#1F3649] transition-all duration-500"
                          style={{ width: `${item.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-[#adb3b4]">Schedule tasks to see your workload distribution</p>
              )}
            </div>

            {/* Insight */}
            <div className="bg-white card p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Lightbulb size={14} weight="fill" className="text-[#f59e0b]" />
                <h3 className="text-[10px] font-bold text-[#adb3b4] uppercase tracking-wider">Logbird Insight</h3>
              </div>
              <p className="text-xs text-[#5a6061] leading-relaxed">
                Your productivity peaks between <strong className="text-[#2d3435]">9 AM and 11 AM</strong>.
                Schedule your most difficult tasks then.
              </p>
            </div>

            {/* Scheduled count */}
            <div className="bg-white card p-5 text-center">
              <span className="text-[10px] font-bold text-[#adb3b4] uppercase tracking-wider block mb-1">
                Blocks Scheduled
              </span>
              <span className="text-2xl font-black text-[#2d3435] tracking-tight">
                {scheduledBlocks.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activeTask && (
          <DragPreview
            task={activeTask}
            categoryName={activeTask.category_id ? categoryMap[activeTask.category_id]?.name ?? '' : ''}
          />
        )}
        {activeBlock && (
          <ScheduledDragPreview block={activeBlock} />
        )}
      </DragOverlay>
    </DndContext>
  )
}
