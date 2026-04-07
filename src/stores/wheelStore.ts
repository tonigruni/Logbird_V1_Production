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

export interface WheelCheckin {
  id: string
  user_id: string
  date: string
  scores: Record<string, number>
  notes: string | null
  created_at: string
}

export interface Goal {
  id: string
  user_id: string
  category_id: string
  title: string
  description: string | null
  status: string
  target_date: string | null
  created_at: string
}

export interface Task {
  id: string
  user_id: string
  goal_id: string | null
  category_id: string | null
  title: string
  completed: boolean
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
  createGoal: (goal: Omit<Goal, 'id' | 'created_at'>) => Promise<void>
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>
  deleteGoal: (id: string) => Promise<void>
  createTask: (task: Omit<Task, 'id' | 'created_at'>) => Promise<void>
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
  createGoal: async (goal) => {
    if (DEMO_MODE) {
      const data = { ...goal, id: crypto.randomUUID(), created_at: new Date().toISOString() }
      set((state) => ({ goals: [data, ...state.goals] })); return
    }
    const { data } = await supabase.from('goals').insert(goal).select().single()
    if (data) set((state) => ({ goals: [data, ...state.goals] }))
  },
  updateGoal: async (id, updates) => {
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
    if (DEMO_MODE) {
      const data = { ...task, id: crypto.randomUUID(), created_at: new Date().toISOString() }
      set((state) => ({ tasks: [data, ...state.tasks] })); return
    }
    const { data } = await supabase.from('tasks').insert(task).select().single()
    if (data) set((state) => ({ tasks: [data, ...state.tasks] }))
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
