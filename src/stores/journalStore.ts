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
  is_favorite?: boolean
  sleep_quality?: number | null
  had_alcohol?: boolean | null
  exercised?: boolean | null
  energy_level?: 'low' | 'medium' | 'high' | null
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
    // Always apply optimistic update immediately (handles client-side-only fields like is_favorite)
    set((state) => ({
      entries: state.entries.map((e) =>
        e.id === id ? { ...e, ...updates, updated_at: new Date().toISOString() } : e
      ),
    }))
    if (DEMO_MODE) return

    // Strip client-side-only fields from the DB payload — needs ALTER TABLE migrations first
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { is_favorite, sleep_quality, had_alcohol, exercised, energy_level, ...dbUpdates } = updates as JournalEntry
    if (Object.keys(dbUpdates).length === 0) return   // nothing left to persist

    const { data } = await supabase
      .from('journal_entries')
      .update({ ...dbUpdates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (data) {
      // Merge DB row back but preserve any client-side fields (is_favorite)
      set((state) => ({
        entries: state.entries.map((e) => (e.id === id ? { ...e, ...data } : e)),
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
