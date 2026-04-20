import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { DEMO_MODE } from '../lib/demo'
import {
  Flame,
  BookOpen,
  Sparkle,
  Barbell,
  Brain,
  Leaf,
  Drop,
  Sun,
  Moon,
  Heart,
  Lightning,
  Star,
  Timer,
  Target,
  CheckSquare,
  Kanban,
  Pencil,
  SunHorizon,
  Bed,
  Bicycle,
} from '@phosphor-icons/react'

// ---------------------------------------------------------------------------
// Icon registry — maps DB string → Phosphor component
// ---------------------------------------------------------------------------
export const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Flame,
  BookOpen,
  Sparkle,
  Barbell,
  Brain,
  Leaf,
  Drop,
  Sun,
  Moon,
  Heart,
  Lightning,
  Star,
  Timer,
  Target,
  CheckSquare,
  Kanban,
  Pencil,
  SunHorizon,
  Bed,
  Bicycle,
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type HabitCadence = 'daily' | 'weekdays' | 'weekly'
type HabitKind = 'binary' | 'quantity'

export interface Habit {
  id: string
  name: string
  icon: React.ComponentType<any>
  iconName: string
  color: string
  cadence: HabitCadence
  kind: HabitKind
  streak: number
  bestStreak: number
  history: number[]  // last 84 days: 0=none, 1=partial, 2=done. Index 0 = oldest.
  week: boolean[]    // Mon..Sun, true = done
  unit?: string
  weekTarget?: number
  weekProgress?: number
  stack?: 'morning' | 'evening'
}

// ---------------------------------------------------------------------------
// Demo habits (identical to the original static data in the page)
// ---------------------------------------------------------------------------
function makeHistory(seed: number, density: number): number[] {
  const arr: number[] = []
  let s = seed
  for (let i = 0; i < 84; i++) {
    s = (s * 9301 + 49297) % 233280
    const r = s / 233280
    if (r < density * 0.85) arr.push(2)
    else if (r < density) arr.push(1)
    else arr.push(0)
  }
  for (let i = 84 - 10; i < 84; i++) arr[i] = Math.random() > 0.2 ? 2 : 1
  return arr
}

const DEMO_HABITS: Habit[] = [
  { id: 'morning-pages', name: 'Morning pages', icon: BookOpen, iconName: 'BookOpen', color: '#6b63f5', cadence: 'daily', kind: 'binary', streak: 41, bestStreak: 58, history: makeHistory(7, 0.82), week: [true, true, true, true, false, false, false], stack: 'morning' },
  { id: 'no-phone', name: 'No phone first hour', icon: Sparkle, iconName: 'Sparkle', color: '#f59e0b', cadence: 'daily', kind: 'binary', streak: 12, bestStreak: 20, history: makeHistory(13, 0.7), week: [true, false, true, true, false, false, false], stack: 'morning' },
  { id: 'meditate', name: 'Meditate', icon: Brain, iconName: 'Brain', color: '#8b5cf6', cadence: 'daily', kind: 'binary', streak: 8, bestStreak: 31, history: makeHistory(23, 0.6), week: [true, true, false, true, false, false, false], stack: 'morning' },
  { id: 'workout', name: 'Workout', icon: Barbell, iconName: 'Barbell', color: '#16a34a', cadence: 'weekdays', kind: 'binary', streak: 5, bestStreak: 14, history: makeHistory(31, 0.55), week: [true, false, true, false, false, false, false] },
  { id: 'water', name: 'Hydration', icon: Drop, iconName: 'Drop', color: '#3b82f6', cadence: 'daily', kind: 'quantity', streak: 3, bestStreak: 9, history: makeHistory(41, 0.65), week: [true, true, true, false, false, false, false], unit: 'glasses', weekTarget: 56, weekProgress: 32 },
  { id: 'reading', name: 'Read before bed', icon: BookOpen, iconName: 'BookOpen', color: '#9f403d', cadence: 'daily', kind: 'quantity', streak: 22, bestStreak: 22, history: makeHistory(59, 0.78), week: [true, true, true, true, false, false, false], unit: 'minutes', weekTarget: 210, weekProgress: 140, stack: 'evening' },
  { id: 'stretch', name: 'Evening stretch', icon: Leaf, iconName: 'Leaf', color: '#22c55e', cadence: 'daily', kind: 'binary', streak: 2, bestStreak: 11, history: makeHistory(71, 0.45), week: [false, true, true, false, false, false, false], stack: 'evening' },
  { id: 'gratitude', name: 'Gratitude — 3 things', icon: Sparkle, iconName: 'Sparkle', color: '#ca8a04', cadence: 'daily', kind: 'binary', streak: 17, bestStreak: 29, history: makeHistory(83, 0.75), week: [true, true, true, true, false, false, false], stack: 'evening' },
]

// ---------------------------------------------------------------------------
// Default habit seeds (for new users' first load)
// ---------------------------------------------------------------------------
const DB_HABIT_SEEDS = [
  { name: 'Morning pages',       icon_name: 'BookOpen', color: '#6b63f5', cadence: 'daily',    kind: 'binary',   stack: 'morning', unit: null, week_target: null, sort_order: 0 },
  { name: 'No phone first hour', icon_name: 'Sparkle',  color: '#f59e0b', cadence: 'daily',    kind: 'binary',   stack: 'morning', unit: null, week_target: null, sort_order: 1 },
  { name: 'Meditate',            icon_name: 'Brain',    color: '#8b5cf6', cadence: 'daily',    kind: 'binary',   stack: 'morning', unit: null, week_target: null, sort_order: 2 },
  { name: 'Workout',             icon_name: 'Barbell',  color: '#16a34a', cadence: 'weekdays', kind: 'binary',   stack: null,      unit: null, week_target: null, sort_order: 3 },
  { name: 'Hydration',           icon_name: 'Drop',     color: '#3b82f6', cadence: 'daily',    kind: 'quantity', stack: null,      unit: 'glasses', week_target: 56,  sort_order: 4 },
  { name: 'Read before bed',     icon_name: 'BookOpen', color: '#9f403d', cadence: 'daily',    kind: 'quantity', stack: 'evening', unit: 'minutes', week_target: 210, sort_order: 5 },
  { name: 'Evening stretch',     icon_name: 'Leaf',     color: '#22c55e', cadence: 'daily',    kind: 'binary',   stack: 'evening', unit: null, week_target: null, sort_order: 6 },
  { name: 'Gratitude — 3 things', icon_name: 'Sparkle', color: '#ca8a04', cadence: 'daily',   kind: 'binary',   stack: 'evening', unit: null, week_target: null, sort_order: 7 },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getMondayDate(): Date {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const day = today.getDay()
  const offset = day === 0 ? -6 : 1 - day
  const monday = new Date(today)
  monday.setDate(today.getDate() + offset)
  return monday
}

function computeHabit(
  dbHabit: Record<string, any>,
  completions: { date: string; value: number }[]
): Habit {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const monday = getMondayDate()

  // History: last 84 days, index 0 = oldest
  const history: number[] = []
  for (let i = 83; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const comp = completions.find(c => c.date === dateStr)
    history.push(comp ? (comp.value >= 2 ? 2 : 1) : 0)
  }

  // Week: Mon..Sun
  const week: boolean[] = Array(7).fill(false)
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const dateStr = d.toISOString().split('T')[0]
    const comp = completions.find(c => c.date === dateStr)
    week[i] = comp ? comp.value >= 2 : false
  }

  // Streak: consecutive done days counting back from today
  let streak = 0
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i] >= 2) streak++
    else break
  }

  // Week progress for quantity habits
  let weekProgress = 0
  if (dbHabit.kind === 'quantity') {
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      if (d > today) break
      const dateStr = d.toISOString().split('T')[0]
      const comp = completions.find(c => c.date === dateStr)
      if (comp) weekProgress += comp.value
    }
  }

  return {
    id: dbHabit.id,
    name: dbHabit.name,
    icon: ICON_MAP[dbHabit.icon_name] ?? Flame,
    iconName: dbHabit.icon_name,
    color: dbHabit.color,
    cadence: dbHabit.cadence as HabitCadence,
    kind: dbHabit.kind as HabitKind,
    stack: dbHabit.stack ?? undefined,
    unit: dbHabit.unit ?? undefined,
    weekTarget: dbHabit.week_target ?? undefined,
    weekProgress: dbHabit.kind === 'quantity' ? weekProgress : undefined,
    streak,
    bestStreak: streak,
    history,
    week,
  }
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------
export interface NewHabitFields {
  name: string
  iconName: string
  color: string
  cadence: HabitCadence
  kind: HabitKind
  stack?: 'morning' | 'evening'
  unit?: string
  weekTarget?: number
}

interface HabitsState {
  habits: Habit[]
  loading: boolean
  fetchHabits: (userId: string) => Promise<void>
  createHabit: (userId: string, fields: NewHabitFields) => Promise<void>
  deleteHabit: (habitId: string) => Promise<void>
  toggleCompletion: (habitId: string, date: string, done: boolean) => void
  setQuantity: (habitId: string, date: string, value: number) => void
}

export const useHabitsStore = create<HabitsState>((set) => ({
  habits: [],
  loading: false,

  fetchHabits: async (userId) => {
    if (DEMO_MODE) { set({ habits: DEMO_HABITS, loading: false }); return }
    set({ loading: true })

    // Seed default habits for new users
    const { data: existing } = await supabase
      .from('habits')
      .select('id')
      .eq('user_id', userId)
      .limit(1)

    if (!existing?.length) {
      await supabase.from('habits').insert(
        DB_HABIT_SEEDS.map(h => ({ ...h, user_id: userId }))
      )
    }

    const { data: habitsData } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('sort_order')

    if (!habitsData) { set({ loading: false }); return }

    // Completions for the last 90 days
    const since = new Date()
    since.setDate(since.getDate() - 90)

    const { data: completionsData } = await supabase
      .from('habit_completions')
      .select('habit_id, date, value')
      .eq('user_id', userId)
      .gte('date', since.toISOString().split('T')[0])

    const byHabit: Record<string, { date: string; value: number }[]> = {}
    for (const c of completionsData ?? []) {
      if (!byHabit[c.habit_id]) byHabit[c.habit_id] = []
      byHabit[c.habit_id].push({ date: c.date, value: c.value })
    }

    set({
      habits: habitsData.map(h => computeHabit(h, byHabit[h.id] ?? [])),
      loading: false,
    })
  },

  createHabit: async (_userId, fields) => {
    if (DEMO_MODE) {
      const newHabit: Habit = {
        id: crypto.randomUUID(),
        name: fields.name,
        icon: ICON_MAP[fields.iconName] ?? Flame,
        iconName: fields.iconName,
        color: fields.color,
        cadence: fields.cadence,
        kind: fields.kind,
        stack: fields.stack,
        unit: fields.unit,
        weekTarget: fields.weekTarget,
        weekProgress: 0,
        streak: 0,
        bestStreak: 0,
        history: Array(84).fill(0),
        week: Array(7).fill(false),
      }
      set(state => ({ habits: [...state.habits, newHabit] }))
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: last } = await supabase
      .from('habits')
      .select('sort_order')
      .eq('user_id', user.id)
      .order('sort_order', { ascending: false })
      .limit(1)

    const sort_order = (last?.[0]?.sort_order ?? -1) + 1

    const { data, error } = await supabase
      .from('habits')
      .insert({
        user_id: user.id,
        name: fields.name,
        icon_name: fields.iconName,
        color: fields.color,
        cadence: fields.cadence,
        kind: fields.kind,
        stack: fields.stack ?? null,
        unit: fields.unit ?? null,
        week_target: fields.weekTarget ?? null,
        sort_order,
      })
      .select()
      .single()

    if (error) throw new Error(error.message)

    if (data) {
      set(state => ({ habits: [...state.habits, computeHabit(data, [])] }))
    }
  },

  deleteHabit: async (habitId) => {
    // Optimistic remove
    set(state => ({ habits: state.habits.filter(h => h.id !== habitId) }))

    if (DEMO_MODE) return

    const { error } = await supabase.from('habits').delete().eq('id', habitId)
    if (error) {
      // Re-fetch to restore if delete failed
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('habits').select('*').eq('user_id', user.id).eq('is_active', true).order('sort_order')
        if (data) set(state => ({ habits: data.map(h => state.habits.find(x => x.id === h.id) ?? h as any) }))
      }
    }
  },

  toggleCompletion: (habitId, date, done) => {
    // Optimistic update of the week row
    const monday = getMondayDate()
    const targetDate = new Date(date + 'T00:00:00')
    const dayIdx = Math.round((targetDate.getTime() - monday.getTime()) / 86400000)

    set(state => ({
      habits: state.habits.map(h => {
        if (h.id !== habitId) return h
        const newWeek = [...h.week]
        if (dayIdx >= 0 && dayIdx < 7) newWeek[dayIdx] = done
        return { ...h, week: newWeek }
      }),
    }))

    // Persist to DB
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      if (done) {
        supabase.from('habit_completions').upsert(
          { habit_id: habitId, user_id: user.id, date, value: 2 },
          { onConflict: 'habit_id,date' }
        )
      } else {
        supabase.from('habit_completions')
          .delete()
          .eq('habit_id', habitId)
          .eq('date', date)
      }
    })
  },

  setQuantity: (habitId, date, value) => {
    // Optimistic update
    set(state => ({
      habits: state.habits.map(h =>
        h.id === habitId ? { ...h, weekProgress: value } : h
      ),
    }))

    // Persist to DB
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('habit_completions').upsert(
        { habit_id: habitId, user_id: user.id, date, value },
        { onConflict: 'habit_id,date' }
      )
    })
  },
}))
