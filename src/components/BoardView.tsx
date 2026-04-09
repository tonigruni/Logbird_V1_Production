import { useState, useCallback, useEffect, useRef } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core'
import type { DragStartEvent, DragEndEvent, DragOverEvent, UniqueIdentifier } from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Lightning, Plus, Clock, ChatCircle, PencilSimpleLine, X, CaretLeft, CaretRight } from '@phosphor-icons/react'
import { cn } from '../lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BoardCard {
  id: string
  title: string
  description?: string
  priority?: 'urgent' | 'high' | 'medium' | 'low'
  dueDate?: string
  comments?: number
  energy?: 1 | 2 | 3
  accentColor?: string
  tag?: string
  onClick?: () => void
}

export interface BoardColumn {
  id: string
  title: string
  cards: BoardCard[]
  color?: string
}

interface BoardViewProps {
  columns: BoardColumn[]
  onAddCard?: (columnId: string) => void
  onMoveCard?: (cardId: string, fromColumnId: string, toColumnId: string) => void
  onCardClick?: (cardId: string) => void
  onRenameColumn?: (columnId: string, newTitle: string) => void
  onAddColumn?: (title: string, color: string) => void
  onChangeColumnColor?: (columnId: string, color: string) => void
  onDeleteColumn?: (columnId: string) => void
}

// ---------------------------------------------------------------------------
// Priority styles
// ---------------------------------------------------------------------------

const PRIORITY_STYLES: Record<string, { label: string; bg: string; text: string }> = {
  urgent: { label: 'URGENT', bg: 'bg-[#dc2626]/10', text: 'text-[#dc2626]' },
  high:   { label: 'HIGH',   bg: 'bg-[#f59e0b]/10', text: 'text-[#f59e0b]' },
  medium: { label: 'MEDIUM', bg: 'bg-[#1F3649]/10', text: 'text-[#1F3649]' },
  low:    { label: 'LOW',    bg: 'bg-[#adb3b4]/10', text: 'text-[#adb3b4]' },
}

// ---------------------------------------------------------------------------
// Column header color indicators
// ---------------------------------------------------------------------------

const COLUMN_COLORS: Record<string, string> = {
  'To Do': '#adb3b4',
  'In Progress': '#f59e0b',
  'In Review': '#1F3649',
  'Done': '#22c55e',
  'Active': '#1F3649',
  'Paused': '#f59e0b',
  'Completed': '#22c55e',
  'Backlog': '#adb3b4',
}

const PRESET_COLORS = ['#adb3b4', '#1F3649', '#f59e0b', '#22c55e', '#dc2626', '#8b5cf6', '#3b82f6', '#ec4899']

// ---------------------------------------------------------------------------
// Card content (shared between sortable card and drag overlay)
// ---------------------------------------------------------------------------

function CardContent({ card, isDragging, isClickable }: { card: BoardCard; isDragging?: boolean; isClickable?: boolean }) {
  const priority = card.priority ? PRIORITY_STYLES[card.priority] : null

  return (
    <div
      className={cn(
        'bg-white card p-4 space-y-3 transition-all duration-200',
        isDragging && 'shadow-[0_20px_40px_rgba(7,33,51,0.12)] rotate-[2deg] scale-[1.02]',
        !isDragging && (card.onClick || isClickable) && 'cursor-pointer hover:shadow-[0_20px_40px_rgba(7,33,51,0.05)]'
      )}
    >
      {/* Top row — priority / tag */}
      <div className="flex items-center justify-between">
        {priority ? (
          <span className={cn('text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider', priority.bg, priority.text)}>
            {priority.label}
          </span>
        ) : card.tag ? (
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-[#1F3649]/10 text-[#1F3649]">
            {card.tag}
          </span>
        ) : (
          <span />
        )}
      </div>

      {/* Accent bar */}
      {card.accentColor && (
        <div className="w-full h-0.5 rounded-full" style={{ backgroundColor: card.accentColor }} />
      )}

      {/* Title */}
      <h4 className="text-sm font-bold text-[#2d3435] leading-snug">{card.title}</h4>

      {/* Description */}
      {card.description && (
        <p className="text-xs text-[#5a6061] leading-relaxed line-clamp-2">{card.description}</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          {card.dueDate && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-[#adb3b4]">
              <Clock size={10} />
              {card.dueDate}
            </span>
          )}
          {card.comments !== undefined && card.comments > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-[#adb3b4]">
              <ChatCircle size={10} />
              {card.comments}
            </span>
          )}
        </div>

        {card.energy && (
          <div className="flex items-center gap-0.5">
            {[1, 2, 3].map(i => (
              <Lightning
                key={i}
                size={9}
                weight="fill"
                className={i <= card.energy! ? 'text-[#f59e0b]' : 'text-[#e8eaeb]'}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sortable card (draggable)
// ---------------------------------------------------------------------------

function SortableCard({ card, onCardClick }: { card: BoardCard; onCardClick?: (cardId: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id })

  const dragOccurred = useRef(false)

  useEffect(() => {
    if (isDragging) dragOccurred.current = true
  }, [isDragging])

  const handleClick = () => {
    if (!dragOccurred.current && onCardClick) {
      onCardClick(card.id)
    }
    dragOccurred.current = false
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} onClick={handleClick} className="touch-manipulation">
      <CardContent card={card} isClickable={!!onCardClick} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Droppable column
// ---------------------------------------------------------------------------

function DroppableColumn({ column, onAddCard, onRenameColumn, onChangeColumnColor, onDeleteColumn, children }: {
  column: BoardColumn
  onAddCard?: (columnId: string) => void
  onRenameColumn?: (columnId: string, newTitle: string) => void
  onChangeColumnColor?: (columnId: string, color: string) => void
  onDeleteColumn?: (columnId: string) => void
  children: React.ReactNode
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })
  const color = column.color || COLUMN_COLORS[column.title] || '#adb3b4'

  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(column.title)
  const [showColorPicker, setShowColorPicker] = useState(false)

  function handleTitleSave() {
    if (editTitle.trim() && onRenameColumn) {
      onRenameColumn(column.id, editTitle.trim())
    }
    setIsEditing(false)
  }

  return (
    <div className="shrink-0 w-[320px]">
      {/* Column header */}
      <div className="flex items-center justify-between mb-4 px-1 group/header">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onChangeColumnColor && setShowColorPicker(prev => !prev)}
            className={cn('w-2 h-2 rounded-full transition-transform', onChangeColumnColor && 'cursor-pointer hover:scale-150')}
            style={{ backgroundColor: color }}
          />
          {isEditing ? (
            <input
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={e => { if (e.key === 'Enter') handleTitleSave(); if (e.key === 'Escape') setIsEditing(false) }}
              autoFocus
              className="text-xs font-bold text-[#2d3435] uppercase tracking-wider bg-[#f2f4f4] rounded-[6px] px-2 py-0.5 outline-none focus:ring-2 focus:ring-[#1F3649]/10 w-28"
            />
          ) : (
            <h3
              onDoubleClick={() => { if (onRenameColumn) { setEditTitle(column.title); setIsEditing(true) } }}
              className={cn('text-xs font-bold text-[#2d3435] uppercase tracking-wider', onRenameColumn && 'cursor-pointer hover:text-[#1F3649]')}
            >
              {column.title}
            </h3>
          )}
          <span className="text-[10px] font-bold text-[#adb3b4] bg-[#f2f4f4] px-1.5 py-0.5 rounded-full">
            {String(column.cards.length).padStart(2, '0')}
          </span>
          {onRenameColumn && !isEditing && (
            <button
              onClick={() => { setEditTitle(column.title); setIsEditing(true) }}
              className="opacity-0 group-hover/header:opacity-100 p-0.5 hover:bg-[#f2f4f4] rounded transition-all cursor-pointer"
            >
              <PencilSimpleLine size={10} className="text-[#adb3b4]" />
            </button>
          )}
        </div>
        {onDeleteColumn && column.cards.length === 0 && (
          <button
            onClick={() => onDeleteColumn(column.id)}
            className="opacity-0 group-hover/header:opacity-100 p-0.5 hover:bg-[#dc2626]/10 rounded transition-all cursor-pointer"
          >
            <X size={10} className="text-[#adb3b4] hover:text-[#dc2626]" />
          </button>
        )}
      </div>

      {/* Color picker */}
      {showColorPicker && (
        <div className="flex items-center gap-1.5 mb-3 px-1 animate-in fade-in duration-150">
          {PRESET_COLORS.map(c => (
            <button
              key={c}
              onClick={() => { onChangeColumnColor?.(column.id, c); setShowColorPicker(false) }}
              className={cn(
                'w-4 h-4 rounded-full cursor-pointer hover:scale-125 transition-transform ring-offset-1',
                color === c && 'ring-2 ring-[#2d3435]'
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      )}

      {/* Cards droppable area */}
      <div
        ref={setNodeRef}
        className={cn(
          'space-y-3 min-h-[80px] rounded-[15px] transition-colors duration-200 p-1.5 -m-1.5',
          isOver && 'bg-[#1F3649]/[0.04] ring-2 ring-[#1F3649]/10 ring-inset'
        )}
      >
        {children}

        {column.cards.length === 0 && !isOver && (
          <div className="flex items-center justify-center py-8 text-[10px] font-semibold text-[#c3c7cd] uppercase tracking-wider">
            Drop items here
          </div>
        )}

        {/* Add card button */}
        {onAddCard && (
          <button
            onClick={() => onAddCard(column.id)}
            className="w-full flex items-center justify-center gap-1.5 py-3 card !border-2 !border-dashed !border-[#e8eaeb] text-xs font-semibold text-[#adb3b4] hover:border-[#1F3649]/30 hover:text-[#1F3649] hover:bg-[#1F3649]/[0.02] transition-all cursor-pointer"
          >
            <Plus size={12} weight="bold" />
            Add Task
          </button>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Add Column Card
// ---------------------------------------------------------------------------

function AddColumnCard({ onAdd }: { onAdd: (title: string, color: string) => void }) {
  return (
    <div className="shrink-0 w-[160px] pt-8">
      <button
        onClick={() => onAdd('New Section', PRESET_COLORS[0])}
        className="w-full flex items-center justify-center gap-1.5 py-3 card !border-2 !border-dashed !border-[#e8eaeb] text-xs font-semibold text-[#adb3b4] hover:border-[#1F3649]/30 hover:text-[#1F3649] hover:bg-[#1F3649]/[0.02] transition-all cursor-pointer"
      >
        <Plus size={12} weight="bold" />
        Add Section
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Board View
// ---------------------------------------------------------------------------

export default function BoardView({ columns, onAddCard, onMoveCard, onCardClick, onRenameColumn, onAddColumn, onChangeColumnColor, onDeleteColumn }: BoardViewProps) {
  const [internalColumns, setInternalColumns] = useState<BoardColumn[]>(columns)
  const [activeCard, setActiveCard] = useState<BoardCard | null>(null)
  const [sourceColumnId, setSourceColumnId] = useState<string | null>(null)

  // Scroll indicators
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 2)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2)
  }, [])

  useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', checkScroll, { passive: true })
    window.addEventListener('resize', checkScroll)
    return () => {
      el.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [checkScroll, internalColumns])

  // Sync internal state when parent columns change (store updates)
  useEffect(() => {
    setInternalColumns(columns)
  }, [columns])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  // Find which column a card currently belongs to
  const findColumnOfCard = useCallback((cardId: UniqueIdentifier): string | null => {
    for (const col of internalColumns) {
      if (col.cards.some(c => c.id === String(cardId))) return col.id
    }
    // cardId might be a column id (when dragging over empty column)
    if (internalColumns.some(c => c.id === String(cardId))) return String(cardId)
    return null
  }, [internalColumns])

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const card = internalColumns.flatMap(c => c.cards).find(c => c.id === String(event.active.id))
    setActiveCard(card || null)
    setSourceColumnId(findColumnOfCard(event.active.id))
  }, [internalColumns, findColumnOfCard])

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeColId = findColumnOfCard(active.id)
    let overColId = findColumnOfCard(over.id)

    // If hovering over a column container itself (not a card)
    if (internalColumns.some(c => c.id === String(over.id))) {
      overColId = String(over.id)
    }

    if (!activeColId || !overColId || activeColId === overColId) return

    setInternalColumns(prev => {
      const next = prev.map(col => ({ ...col, cards: [...col.cards] }))
      const srcCol = next.find(c => c.id === activeColId)!
      const dstCol = next.find(c => c.id === overColId)!

      const cardIdx = srcCol.cards.findIndex(c => c.id === String(active.id))
      if (cardIdx === -1) return prev

      const [card] = srcCol.cards.splice(cardIdx, 1)
      const overIdx = dstCol.cards.findIndex(c => c.id === String(over.id))
      if (overIdx >= 0) {
        dstCol.cards.splice(overIdx, 0, card)
      } else {
        dstCol.cards.push(card)
      }

      return next
    })
  }, [findColumnOfCard, internalColumns])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active } = event
    setActiveCard(null)

    // Determine final column
    const destColId = findColumnOfCard(active.id)

    if (sourceColumnId && destColId && sourceColumnId !== destColId && onMoveCard) {
      onMoveCard(String(active.id), sourceColumnId, destColId)
    }

    setSourceColumnId(null)
  }, [findColumnOfCard, sourceColumnId, onMoveCard])

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="relative overflow-hidden">
        {/* Left scroll indicator */}
        <div
          className={cn(
            'absolute left-0 top-0 bottom-0 w-10 z-10 pointer-events-none transition-opacity duration-300',
            canScrollLeft ? 'opacity-100' : 'opacity-0'
          )}
          style={{ background: 'linear-gradient(to right, white 0%, rgba(255,255,255,0.6) 50%, transparent 100%)' }}
        >
          <button
            onClick={() => scrollRef.current?.scrollBy({ left: -340, behavior: 'smooth' })}
            className={cn(
              'pointer-events-auto absolute left-0.5 top-[30%] -translate-y-1/2 w-7 h-7 rounded-full bg-white shadow-[0_2px_12px_rgba(0,0,0,0.1)] border border-[#ECEFF2] flex items-center justify-center hover:bg-[#f2f4f4] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-all cursor-pointer',
              !canScrollLeft && 'pointer-events-none'
            )}
          >
            <CaretLeft size={13} weight="bold" className="text-[#5a6061]" />
          </button>
        </div>

        <div ref={scrollRef} className="flex gap-5 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
          {internalColumns.map(column => (
            <DroppableColumn key={column.id} column={column} onAddCard={onAddCard} onRenameColumn={onRenameColumn} onChangeColumnColor={onChangeColumnColor} onDeleteColumn={onDeleteColumn}>
              <SortableContext items={column.cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
                {column.cards.map(card => (
                  <SortableCard key={card.id} card={card} onCardClick={onCardClick} />
                ))}
              </SortableContext>
            </DroppableColumn>
          ))}
          {onAddColumn && <AddColumnCard onAdd={onAddColumn} />}
        </div>

        {/* Right scroll indicator */}
        <div
          className={cn(
            'absolute right-0 top-0 bottom-0 w-10 z-10 pointer-events-none transition-opacity duration-300',
            canScrollRight ? 'opacity-100' : 'opacity-0'
          )}
          style={{ background: 'linear-gradient(to left, white 0%, rgba(255,255,255,0.6) 50%, transparent 100%)' }}
        >
          <button
            onClick={() => scrollRef.current?.scrollBy({ left: 340, behavior: 'smooth' })}
            className={cn(
              'pointer-events-auto absolute right-0.5 top-[30%] -translate-y-1/2 w-7 h-7 rounded-full bg-white shadow-[0_2px_12px_rgba(0,0,0,0.1)] border border-[#ECEFF2] flex items-center justify-center hover:bg-[#f2f4f4] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-all cursor-pointer',
              !canScrollRight && 'pointer-events-none'
            )}
          >
            <CaretRight size={13} weight="bold" className="text-[#5a6061]" />
          </button>
        </div>
      </div>

      <DragOverlay dropAnimation={{ duration: 200, easing: 'ease' }}>
        {activeCard ? <CardContent card={activeCard} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  )
}
