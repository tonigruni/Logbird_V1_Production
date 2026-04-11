import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { DEMO_MODE } from '../lib/demo'

export interface Project {
  id: string
  user_id: string
  title: string
  description: string | null
  status: 'active' | 'in_progress' | 'completed' | 'archived'
  goal_id: string | null
  color: string | null
  cover_url: string | null
  target_date: string | null
  created_at: string
  updated_at: string
}

interface ProjectState {
  projects: Project[]
  loading: boolean
  fetchProjects: (userId: string) => Promise<void>
  createProject: (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => Promise<Project | null>
  updateProject: (id: string, updates: Partial<Omit<Project, 'id' | 'user_id' | 'created_at'>>) => Promise<void>
  deleteProject: (id: string) => Promise<void>
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  loading: false,

  fetchProjects: async (userId) => {
    if (DEMO_MODE) { set({ loading: false }); return }
    set({ loading: true })
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    set({ projects: data ?? [], loading: false })
  },

  createProject: async (project) => {
    if (DEMO_MODE) {
      const data: Project = {
        ...project,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      set((state) => ({ projects: [data, ...state.projects] }))
      return data
    }
    const { data } = await supabase.from('projects').insert(project).select().single()
    if (data) set((state) => ({ projects: [data, ...state.projects] }))
    return data ?? null
  },

  updateProject: async (id, updates) => {
    if (DEMO_MODE) {
      set((state) => ({
        projects: state.projects.map((p) =>
          p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p
        ),
      }))
      return
    }
    const { data } = await supabase
      .from('projects')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (data) set((state) => ({ projects: state.projects.map((p) => (p.id === id ? data : p)) }))
  },

  deleteProject: async (id) => {
    if (!DEMO_MODE) await supabase.from('projects').delete().eq('id', id)
    set((state) => ({ projects: state.projects.filter((p) => p.id !== id) }))
  },
}))
