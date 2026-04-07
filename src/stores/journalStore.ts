import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { DEMO_MODE, DEMO_ENTRIES, DEMO_TEMPLATES } from '../lib/demo'

export interface JournalEntry {
  id: string
  user_id: string
  title: string
  content: string
  mood_score: number | null
  template_id: string | null
  category: string | null
  location: string | null
  weather: string | null
  created_at: string
  updated_at: string
}

export interface JournalTemplate {
  id: string
  user_id: string
  name: string
  structure: Record<string, unknown>
  created_at: string
}

interface JournalState {
  entries: JournalEntry[]
  templates: JournalTemplate[]
  loading: boolean
  fetchEntries: (userId: string) => Promise<void>
  fetchTemplates: (userId: string) => Promise<void>
  createEntry: (entry: Omit<JournalEntry, 'id' | 'created_at' | 'updated_at'>) => Promise<JournalEntry | null>
  updateEntry: (id: string, updates: Partial<JournalEntry>) => Promise<void>
  deleteEntry: (id: string) => Promise<void>
  createTemplate: (template: Omit<JournalTemplate, 'id' | 'created_at'>) => Promise<void>
  deleteTemplate: (id: string) => Promise<void>
}

export const useJournalStore = create<JournalState>((set) => ({
  entries: [],
  templates: [],
  loading: false,
  fetchEntries: async (userId) => {
    if (DEMO_MODE) { set({ entries: DEMO_ENTRIES, loading: false }); return }
    set({ loading: true })
    const { data } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    set({ entries: data ?? [], loading: false })
  },
  fetchTemplates: async (userId) => {
    if (DEMO_MODE) { set({ templates: DEMO_TEMPLATES }); return }
    const { data } = await supabase
      .from('journal_templates')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    set({ templates: data ?? [] })
  },
  createEntry: async (entry) => {
    if (DEMO_MODE) {
      const newEntry = { ...entry, id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
      set((state) => ({ entries: [newEntry, ...state.entries] }))
      return newEntry
    }
    const { data, error } = await supabase
      .from('journal_entries')
      .insert(entry)
      .select()
      .single()
    if (!error && data) {
      set((state) => ({ entries: [data, ...state.entries] }))
      return data
    }
    return null
  },
  updateEntry: async (id, updates) => {
    if (DEMO_MODE) {
      set((state) => ({ entries: state.entries.map((e) => e.id === id ? { ...e, ...updates, updated_at: new Date().toISOString() } : e) }))
      return
    }
    const { data } = await supabase
      .from('journal_entries')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (data) {
      set((state) => ({
        entries: state.entries.map((e) => (e.id === id ? data : e)),
      }))
    }
  },
  deleteEntry: async (id) => {
    if (!DEMO_MODE) await supabase.from('journal_entries').delete().eq('id', id)
    set((state) => ({ entries: state.entries.filter((e) => e.id !== id) }))
  },
  createTemplate: async (template) => {
    if (DEMO_MODE) {
      const t = { ...template, id: crypto.randomUUID(), created_at: new Date().toISOString() }
      set((state) => ({ templates: [t, ...state.templates] }))
      return
    }
    const { data } = await supabase.from('journal_templates').insert(template).select().single()
    if (data) set((state) => ({ templates: [data, ...state.templates] }))
  },
  deleteTemplate: async (id) => {
    if (!DEMO_MODE) await supabase.from('journal_templates').delete().eq('id', id)
    set((state) => ({ templates: state.templates.filter((t) => t.id !== id) }))
  },
}))
