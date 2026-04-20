import { useRef, useState, useEffect } from 'react'
import * as Popover from '@radix-ui/react-popover'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { motion, AnimatePresence } from 'motion/react'
import {
  X, List, LayoutGrid, ChevronDown, Star,
  Calendar, Tag, FileText, Hash, Frown, Meh, Smile,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '../../lib/utils'

/* ── Types ──────────────────────────────────────────────────────── */

export interface MoodRange { min: number; max: number }
export type SortOrder = 'newest' | 'oldest' | 'best_mood' | 'worst_mood' | 'longest' | 'shortest'
type FilterType = 'Date Range' | 'Mood' | 'Category' | 'Entry Type'

interface ActiveFilter {
  id: string
  type: FilterType | 'Theme' | 'Starred'
  value: string
}

const filterOptions: Record<FilterType, string[]> = {
  'Date Range': ['Last 7 Days', 'Last 30 Days', 'Last 3 Months'],
  'Mood': ['Bad Days', 'Good Days', '—', 'Very Low', 'Low', 'Neutral', 'Good', 'Excellent'],
  'Category': ['Personal', 'Work', 'Dreams', 'Ideas', 'Travel', 'Health', 'Gratitude'],
  'Entry Type': ['Structured', 'Free writing'],
}

const filterTypeIcon: Record<string, LucideIcon> = {
  'Date Range': Calendar,
  'Mood':       Smile,
  'Category':   Tag,
  'Entry Type': FileText,
  'Theme':      Hash,
  'Starred':    Star,
}

const moodIcon: Record<string, LucideIcon> = {
  'Bad Days': Frown, 'Good Days': Smile,
  'Very Low': Frown, 'Low': Frown, 'Neutral': Meh, 'Good': Smile, 'Excellent': Smile,
}

const moodRangeMap: Record<string, MoodRange> = {
  'Bad Days':  { min: 1, max: 2 },
  'Good Days': { min: 4, max: 5 },
  'Very Low':  { min: 1, max: 1 },
  'Low':       { min: 2, max: 2 },
  'Neutral':   { min: 3, max: 3 },
  'Good':      { min: 4, max: 4 },
  'Excellent': { min: 5, max: 5 },
}

function moodRangeToLabel(r: MoodRange): string {
  if (r.min === 1 && r.max === 2) return 'Bad Days'
  if (r.min === 4 && r.max === 5) return 'Good Days'
  const labels: Record<number, string> = { 1: 'Very Low', 2: 'Low', 3: 'Neutral', 4: 'Good', 5: 'Excellent' }
  return labels[r.min] ?? `${r.min}–${r.max}`
}

const dateMap: Record<string, 'all' | '7d' | '30d' | '3m'> = {
  'Last 7 Days': '7d', 'Last 30 Days': '30d', 'Last 3 Months': '3m',
}
const reverseDateMap: Record<string, string> = {
  '7d': 'Last 7 Days', '30d': 'Last 30 Days', '3m': 'Last 3 Months',
}

const entryTypeMap: Record<string, 'template' | 'freewriting'> = {
  'Structured': 'template', 'Free writing': 'freewriting',
}
const reverseEntryTypeMap: Record<string, string> = {
  'template': 'Structured', 'freewriting': 'Free writing',
}

export const sortLabels: Record<SortOrder, string> = {
  newest:     'Newest first',
  oldest:     'Oldest first',
  best_mood:  'Best mood first',
  worst_mood: 'Worst mood first',
  longest:    'Longest entries',
  shortest:   'Shortest entries',
}

/* ── Animated height wrapper ────────────────────────────────────── */
function AnimatedHeight({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number | 'auto'>('auto')

  useEffect(() => {
    if (!ref.current) return
    const ro = new ResizeObserver(([e]) => setHeight(e.contentRect.height))
    ro.observe(ref.current)
    return () => ro.disconnect()
  }, [])

  return (
    <motion.div
      style={{ height }}
      animate={{ height }}
      transition={{ duration: 0.15, ease: 'easeInOut' }}
      className="overflow-hidden"
    >
      <div ref={ref}>{children}</div>
    </motion.div>
  )
}

/* ── Props ──────────────────────────────────────────────────────── */
interface JournalFilterBarProps {
  dateFilter: 'all' | '7d' | '30d' | '3m'
  setDateFilter: (v: 'all' | '7d' | '30d' | '3m') => void
  moodFilter: MoodRange | null
  setMoodFilter: (v: MoodRange | null) => void
  categoryFilter: string | null
  setCategoryFilter: (v: string | null) => void
  entryTypeFilter: 'template' | 'freewriting' | null
  setEntryTypeFilter: (v: 'template' | 'freewriting' | null) => void
  favoritesOnly: boolean
  setFavoritesOnly: (v: boolean) => void
  searchFilter: string
  setSearchFilter: (v: string) => void
  sortOrder: SortOrder
  setSortOrder: (v: SortOrder) => void
  libraryViewMode: 'list' | 'grid'
  setLibraryViewMode: (v: 'list' | 'grid') => void
}

/* ── Main component ─────────────────────────────────────────────── */
export default function JournalFilterBar({
  dateFilter, setDateFilter,
  moodFilter, setMoodFilter,
  categoryFilter, setCategoryFilter,
  entryTypeFilter, setEntryTypeFilter,
  favoritesOnly, setFavoritesOnly,
  searchFilter, setSearchFilter,
  sortOrder, setSortOrder,
  libraryViewMode, setLibraryViewMode,
}: JournalFilterBarProps) {

  // Build active filters
  const activeFilters: ActiveFilter[] = []
  if (dateFilter !== 'all') activeFilters.push({ id: 'date', type: 'Date Range', value: reverseDateMap[dateFilter] })
  if (moodFilter !== null) activeFilters.push({ id: 'mood', type: 'Mood', value: moodRangeToLabel(moodFilter) })
  if (categoryFilter) activeFilters.push({ id: 'cat', type: 'Category', value: categoryFilter })
  if (entryTypeFilter) activeFilters.push({ id: 'type', type: 'Entry Type', value: reverseEntryTypeMap[entryTypeFilter] })
  if (searchFilter) activeFilters.push({ id: 'theme', type: 'Theme', value: `"${searchFilter}"` })
  if (favoritesOnly) activeFilters.push({ id: 'fav', type: 'Starred', value: 'Only' })

  const removeFilter = (filter: ActiveFilter) => {
    if (filter.type === 'Date Range') setDateFilter('all')
    if (filter.type === 'Mood') setMoodFilter(null)
    if (filter.type === 'Category') setCategoryFilter(null)
    if (filter.type === 'Entry Type') setEntryTypeFilter(null)
    if (filter.type === 'Theme') setSearchFilter('')
    if (filter.type === 'Starred') setFavoritesOnly(false)
  }

  const applyFilter = (type: FilterType, value: string) => {
    if (type === 'Date Range') setDateFilter(dateMap[value] ?? 'all')
    if (type === 'Mood') setMoodFilter(moodRangeMap[value] ?? null)
    if (type === 'Category') setCategoryFilter(value)
    if (type === 'Entry Type') setEntryTypeFilter(entryTypeMap[value])
  }

  const clearAll = () => {
    setDateFilter('all'); setMoodFilter(null); setCategoryFilter(null)
    setEntryTypeFilter(null); setFavoritesOnly(false); setSearchFilter('')
  }

  const usedTypes = new Set(activeFilters.map(f => f.type))
  const availableTypes = (['Date Range', 'Mood', 'Category', 'Entry Type'] as FilterType[]).filter(t => !usedTypes.has(t))

  const chipClass = 'flex items-center bg-[#f2f4f4] text-xs text-[#5a6061] px-2.5 py-1.5 h-7'

  return (
    <div className="flex items-center gap-2 flex-wrap mb-5">

      {/* Active filter chips */}
      <AnimatePresence>
        {activeFilters.map(filter => {
          const TypeIcon = filterTypeIcon[filter.type]
          return (
            <motion.div
              key={filter.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-[1px] text-xs"
            >
              <div className={cn(chipClass, 'rounded-l-[8px] gap-1.5 font-semibold text-[#1F3649]')}>
                {TypeIcon && <TypeIcon size={11} className="shrink-0" />}
                {filter.type}
              </div>
              <div className={cn(chipClass, 'text-[#adb3b4]')}>is</div>
              {(filter.type === 'Theme' || filter.type === 'Starred') ? (
                <div className={cn(chipClass, 'font-medium text-[#1F3649]')}>{filter.value}</div>
              ) : (
                <ValueSelector
                  filter={filter as ActiveFilter & { type: FilterType }}
                  chipClass={chipClass}
                  applyFilter={applyFilter}
                />
              )}
              <button
                onClick={() => removeFilter(filter)}
                className={cn(chipClass, 'rounded-r-[8px] px-1.5 hover:bg-[#f2f4f4] hover:text-[#9f403d] transition-colors cursor-pointer')}
              >
                <X size={11} />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>

      {/* Clear all */}
      {activeFilters.length > 0 && (
        <button onClick={clearAll} className="text-xs text-[#9f403d] hover:underline cursor-pointer px-1 font-semibold">
          Clear
        </button>
      )}

      {/* Inline filter type buttons — shown when that type isn't active yet */}
      {availableTypes.map(type => {
        const Icon = filterTypeIcon[type]
        return (
          <FilterTypeButton
            key={type}
            type={type}
            icon={Icon}
            chipClass={chipClass}
            applyFilter={applyFilter}
          />
        )
      })}

      {/* Starred toggle — shown when not yet active */}
      {!favoritesOnly && (
        <button
          onClick={() => setFavoritesOnly(true)}
          className="flex items-center gap-1.5 h-7 px-2.5 rounded-[8px] text-xs font-semibold transition-colors cursor-pointer bg-[#f2f4f4] text-[#5a6061] hover:bg-[#f2f4f4]"
        >
          <Star size={11} />
          Starred
        </button>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Sort dropdown */}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button className="flex items-center gap-1.5 h-7 px-2.5 rounded-[8px] bg-[#f2f4f4] text-xs text-[#5a6061] font-semibold hover:bg-[#f2f4f4] transition-colors cursor-pointer">
            {sortLabels[sortOrder]}
            <ChevronDown size={11} className="text-[#adb3b4]" />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={6}
            className="z-50 min-w-[160px] rounded-[12px] border border-[#ebeeef] bg-white shadow-[0_12px_44px_rgba(12,22,41,0.08)] p-1 outline-none"
          >
            {(Object.entries(sortLabels) as [SortOrder, string][]).map(([o, label], i) => (
              <DropdownMenu.Item
                key={o}
                onClick={() => setSortOrder(o)}
                className={cn(
                  'flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-[8px] cursor-pointer outline-none transition-colors',
                  sortOrder === o ? 'bg-[#1F3649]/8 text-[#1F3649] font-semibold' : 'text-[#5a6061] hover:bg-[#f2f4f4]',
                  i === 2 && 'mt-1 pt-2 border-t border-[#f2f4f4]'
                )}
              >
                {label}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      {/* View mode toggle */}
      <div className="flex gap-0.5 bg-[#f2f4f4] rounded-[8px] p-1">
        {([['list', List], ['grid', LayoutGrid]] as const).map(([m, Icon]) => (
          <button
            key={m}
            onClick={() => setLibraryViewMode(m)}
            className={cn('p-1 rounded-[6px] transition-all cursor-pointer', libraryViewMode === m ? 'bg-white text-[#1F3649] shadow-sm' : 'text-[#adb3b4] hover:text-[#5a6061]')}
          >
            <Icon size={13} />
          </button>
        ))}
      </div>
    </div>
  )
}

/* ── Inline filter type button (opens popover with values) ──────── */
function FilterTypeButton({ type, icon: Icon, chipClass, applyFilter }: {
  type: FilterType
  icon: LucideIcon
  chipClass: string
  applyFilter: (type: FilterType, value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const options = filterOptions[type].filter(v => v !== '—')

  return (
    <Popover.Root open={open} onOpenChange={(v) => { setOpen(v); if (!v) setSearch('') }}>
      <Popover.Trigger asChild>
        <button className="flex items-center gap-1.5 h-7 px-2.5 rounded-[8px] text-xs font-semibold transition-colors cursor-pointer bg-[#f2f4f4] text-[#5a6061] hover:bg-[#f2f4f4]">
          <Icon size={11} />
          {type}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          className="z-50 w-52 rounded-[12px] border border-[#ebeeef] bg-white shadow-[0_12px_44px_rgba(12,22,41,0.08)] outline-none"
        >
          <AnimatedHeight>
            <div className="p-1">
              <input
                className="w-full px-2.5 py-2 text-xs bg-transparent placeholder:text-[#adb3b4] text-[#1F3649] focus:outline-none border-b border-[#f2f4f4] mb-1"
                placeholder={`Filter by ${type.toLowerCase()}…`}
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoFocus
              />
              {options
                .filter(v => v.toLowerCase().includes(search.toLowerCase()))
                .map((value, i, arr) => {
                  const isMoodPreset = type === 'Mood' && (value === 'Bad Days' || value === 'Good Days')
                  const showDivider = type === 'Mood' && i > 0 && !isMoodPreset && (arr[i - 1] === 'Bad Days' || arr[i - 1] === 'Good Days')
                  const MoodIconComp = type === 'Mood' ? moodIcon[value] : null
                  return (
                    <div key={value}>
                      {showDivider && <div className="mx-2.5 my-1 border-t border-[#f2f4f4]" />}
                      <button
                        onClick={() => { applyFilter(type, value); setOpen(false); setSearch('') }}
                        className={cn(
                          'w-full text-left flex items-center gap-2 px-2.5 py-1.5 text-xs text-[#1F3649] hover:bg-[#f2f4f4] rounded-[8px] transition-colors cursor-pointer',
                          isMoodPreset && 'font-semibold'
                        )}
                      >
                        {MoodIconComp && <MoodIconComp size={12} />}
                        {value}
                        {isMoodPreset && <span className="ml-auto text-[#adb3b4] font-normal text-[10px]">{value === 'Bad Days' ? '1–2' : '4–5'}</span>}
                      </button>
                    </div>
                  )
                })}
            </div>
          </AnimatedHeight>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

/* ── Value selector chip (click to change value) ───────────────── */
function ValueSelector({ filter, chipClass, applyFilter }: {
  filter: ActiveFilter & { type: FilterType }
  chipClass: string
  applyFilter: (type: FilterType, value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const options = filterOptions[filter.type].filter(v => v !== '—')

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button className={cn(chipClass, 'hover:bg-[#f2f4f4] transition-colors cursor-pointer font-medium text-[#1F3649] gap-1.5')}>
          {filter.type === 'Mood' && (() => { const I = moodIcon[filter.value]; return I ? <I size={11} /> : null })()}
          {filter.value}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          className="z-50 w-48 rounded-[12px] border border-[#ebeeef] bg-white shadow-[0_12px_44px_rgba(12,22,41,0.08)] p-1 outline-none"
        >
          {options.map((value, i) => {
            const isMoodPreset = filter.type === 'Mood' && (value === 'Bad Days' || value === 'Good Days')
            const showDivider = filter.type === 'Mood' && i > 0 && !isMoodPreset && (options[i - 1] === 'Bad Days' || options[i - 1] === 'Good Days')
            const MoodIconComp = filter.type === 'Mood' ? moodIcon[value] : null
            return (
              <div key={value}>
                {showDivider && <div className="mx-2.5 my-1 border-t border-[#f2f4f4]" />}
                <button
                  onClick={() => { applyFilter(filter.type, value); setOpen(false) }}
                  className={cn(
                    'w-full text-left flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-[8px] transition-colors cursor-pointer',
                    value === filter.value ? 'bg-[#1F3649]/8 text-[#1F3649] font-semibold' : 'text-[#5a6061] hover:bg-[#f2f4f4]'
                  )}
                >
                  {MoodIconComp && <MoodIconComp size={11} />}
                  {value}
                  {isMoodPreset && <span className="ml-auto text-[#adb3b4] text-[10px]">{value === 'Bad Days' ? '1–2' : '4–5'}</span>}
                </button>
              </div>
            )
          })}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
