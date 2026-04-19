import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { DEMO_MODE, DEMO_CATEGORIES, DEMO_CHECKINS, DEMO_GOALS, DEMO_TASKS } from '../lib/demo'

export interface WheelCategory {
  id: string
  user_id: string
  name: string
  is_custom: boolean
  is_active: boolean
}

export interface CheckinContext {
  moodScore: number | null
  sleepQuality: number | null
  energyLevel: 'low' | 'unstable' | 'good' | 'high' | null
  stressLevel: 'very_low' | 'low' | 'moderate' | 'high' | 'overwhelming' | null
  hadAlcohol: boolean | null
  poorSleep: boolean | null
  highScreenTime: boolean | null
  exercised: boolean | null
  location: string
  weather: string
}

export interface WheelCheckin {
  id: string
  user_id: string
  date: string
  scores: Record<string, number>
  sub_scores: Record<string, number> | null
  reflection_answers: Record<string, string[]> | null
  notes: string | null
  context: CheckinContext | null
  created_at: string
  // Daily check-in popup fields (added 2026-04-19)
  energy_level?: number | null       // 1–5
  mood_words?: string[] | null       // selected mood word strings
  intention?: string | null
  gratitude?: string[] | null        // array of up to 3 strings
  meditation_completed?: boolean | null
}

export interface GoalMilestone {
  title: string
  description: string
  date: string
  completed: boolean
}

export interface Goal {
  id: string
  user_id: string
  category_id: string | null
  category_ids: string[] | null
  project_id: string | null
  title: string
  description: string | null
  status: string
  target_date: string | null
  cover_url: string | null
  outcome_metric: string | null
  success_criteria: string | null
  effort_frequency: string | null
  effort_minutes_per_session: number | null
  milestones: GoalMilestone[] | null
  created_at: string
}

export type TaskPriority = 'urgent' | 'high' | 'normal' | 'low'
export type TaskEnergy = 1 | 2 | 3

export interface Task {
  id: string
  user_id: string
  goal_id: string | null
  category_id: string | null
  project_id: string | null
  title: string
  completed: boolean
  priority: TaskPriority
  energy: TaskEnergy
  estimated_minutes: number | null
  due_date: string | null
  created_at: string
}

export const DEFAULT_CATEGORIES = [
  'Health',
  'Career',
  'Finance',
  'Relationships',
  'Personal Growth',
  'Fun',
  'Physical Environment',
  'Family/Friends',
]

interface WheelState {
  categories: WheelCategory[]
  checkins: WheelCheckin[]
  goals: Goal[]
  tasks: Task[]
  loading: boolean
  fetchAll: (userId: string) => Promise<void>
  createCheckin: (checkin: Omit<WheelCheckin, 'id' | 'created_at'>) => Promise<void>
  upsertTodayCheckin: (patch: Partial<WheelCheckin>) => Promise<void>
  todaysCheckin: () => WheelCheckin | undefined
  createGoal: (goal: Omit<Goal, 'id' | 'created_at'>) => Promise<Goal>
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>
  deleteGoal: (id: string) => Promise<void>
  createTask: (task: Omit<Task, 'id' | 'created_at'>) => Promise<void>
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>
  toggleTask: (id: string, completed: boolean) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  addCustomCategory: (userId: string, name: string) => Promise<void>
  toggleCategory: (id: string, isActive: boolean) => Promise<void>
}

export const useWheelStore = create<WheelState>((set) => ({
  categories: [],
  checkins: [],
  goals: [],
  tasks: [],
  loading: false,
  fetchAll: async (userId) => {
    if (DEMO_MODE) {
      set({ categories: DEMO_CATEGORIES, checkins: DEMO_CHECKINS, goals: DEMO_GOALS, tasks: DEMO_TASKS, loading: false })
      return
    }
    set({ loading: true })
    const [cats, checkins, goals, tasks] = await Promise.all([
      supabase.from('wheel_categories').select('*').eq('user_id', userId),
      supabase.from('wheel_checkins').select('*').eq('user_id', userId).order('date', { ascending: false }),
      supabase.from('goals').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('tasks').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    ])
    set({
      categories: cats.data ?? [],
      checkins: checkins.data ?? [],
      goals: goals.data ?? [],
      tasks: tasks.data ?? [],
      loading: false,
    })
  },
  createCheckin: async (checkin) => {
    if (DEMO_MODE) {
      const data = { ...checkin, id: crypto.randomUUID(), created_at: new Date().toISOString() }
      set((state) => ({ checkins: [data, ...state.checkins] })); return
    }
    const { data } = await supabase.from('wheel_checkins').insert(checkin).select().single()
    if (data) set((state) => ({ checkins: [data, ...state.checkins] }))
  },
  upsertTodayCheckin: async (patch) => {
    const { useAuthStore } = await import('./authStore')
    const currentUser = useAuthStore.getState().user
    if (!currentUser) { console.warn('upsertTodayCheckin: no user, skipping'); return }
    const today = new Date().toISOString().split('T')[0]
    const existing = useWheelStore.getState().checkins.find(
      (c) => c.date === today && c.user_id === currentUser.id
    )
    if (existing) {
      // optimistic update
      set((state) => ({
        checkins: state.checkins.map((c) =>
          c.id === existing.id ? { ...c, ...patch } : c
        ),
      }))
      if (!DEMO_MODE) {
        const { data } = await supabase
          .from('wheel_checkins')
          .update(patch)
          .eq('id', existing.id)
          .select()
          .single()
        if (data) {
          set((state) => ({
            checkins: state.checkins.map((c) => (c.id === existing.id ? data : c)),
          }))
        }
      }
    } else {
      const newCheckin = {
        user_id: currentUser.id,
        date: today,
        scores: {},
        sub_scores: null,
        reflection_answers: null,
        notes: null,
        context: null,
        ...patch,
      } as Omit<WheelCheckin, 'id' | 'created_at'>
      if (DEMO_MODE) {
        const data = { ...newCheckin, id: crypto.randomUUID(), created_at: new Date().toISOString() }
        set((state) => ({ checkins: [data, ...state.checkins] })); return
      }
      const { data } = await supabase.from('wheel_checkins').insert(newCheckin).select().single()
      if (data) set((state) => ({ checkins: [data, ...state.checkins] }))
    }
  },
  todaysCheckin: () => {
    const today = new Date().toISOString().split('T')[0]
    return useWheelStore.getState().checkins.find((c) => c.date === today)
  },
  createGoal: async (goal) => {
    if (goal.title && goal.title.length > 500) throw new Error('Goal title must be 500 characters or fewer')
    if (DEMO_MODE) {
      const data: Goal = { ...goal, id: crypto.randomUUID(), created_at: new Date().toISOString() }
      set((state) => ({ goals: [data, ...state.goals] }))
      return data
    }
    const { data, error } = await supabase.from('goals').insert(goal).select().single()
    if (error) throw error
    if (data) set((state) => ({ goals: [data, ...state.goals] }))
    return data as Goal
  },
  updateGoal: async (id, updates) => {
    if (updates.title && updates.title.length > 500) throw new Error('Goal title must be 500 characters or fewer')
    if (DEMO_MODE) {
      set((state) => ({ goals: state.goals.map((g) => g.id === id ? { ...g, ...updates } : g) })); return
    }
    const { data } = await supabase.from('goals').update(updates).eq('id', id).select().single()
    if (data) set((state) => ({ goals: state.goals.map((g) => (g.id === id ? data : g)) }))
  },
  deleteGoal: async (id) => {
    if (!DEMO_MODE) await supabase.from('goals').delete().eq('id', id)
    set((state) => ({ goals: state.goals.filter((g) => g.id !== id) }))
  },
  createTask: async (task) => {
    if (task.title && task.title.length > 500) throw new Error('Task title must be 500 characters or fewer')
    if (DEMO_MODE) {
      const data = { ...task, id: crypto.randomUUID(), created_at: new Date().toISOString() }
      set((state) => ({ tasks: [data, ...state.tasks] })); return
    }
    const { data } = await supabase.from('tasks').insert(task).select().single()
    if (data) set((state) => ({ tasks: [data, ...state.tasks] }))
  },
  updateTask: async (id, updates) => {
    if (updates.title && updates.title.length > 500) throw new Error('Task title must be 500 characters or fewer')
    if (DEMO_MODE) {
      set((state) => ({ tasks: state.tasks.map((t) => t.id === id ? { ...t, ...updates } : t) })); return
    }
    const { data } = await supabase.from('tasks').update(updates).eq('id', id).select().single()
    if (data) set((state) => ({ tasks: state.tasks.map((t) => (t.id === id ? data : t)) }))
  },
  toggleTask: async (id, completed) => {
    if (!DEMO_MODE) await supabase.from('tasks').update({ completed }).eq('id', id)
    set((state) => ({ tasks: state.tasks.map((t) => (t.id === id ? { ...t, completed } : t)) }))
  },
  deleteTask: async (id) => {
    if (!DEMO_MODE) await supabase.from('tasks').delete().eq('id', id)
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }))
  },
  addCustomCategory: async (userId, name) => {
    const newCat = { id: crypto.randomUUID(), user_id: userId, name, is_custom: true, is_active: true }
    if (!DEMO_MODE) {
      const { data } = await supabase.from('wheel_categories').insert({ user_id: userId, name, is_custom: true, is_active: true }).select().single()
      if (data) set((state) => ({ categories: [...state.categories, data] }))
      return
    }
    set((state) => ({ categories: [...state.categories, newCat] }))
  },
  toggleCategory: async (id, isActive) => {
    if (!DEMO_MODE) await supabase.from('wheel_categories').update({ is_active: isActive }).eq('id', id)
    set((state) => ({
      categories: state.categories.map((c) => (c.id === id ? { ...c, is_active: isActive } : c)),
    }))
  },
}))
