import { create } from 'zustand'
import { type User, type Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setLoading: (loading: boolean) => void
  signOut: () => Promise<void>
  /** Fetches user_profiles and caches api key + model in localStorage for sync access */
  loadProfile: (userId: string) => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session, user: session?.user ?? null }),
  setLoading: (loading) => set({ loading }),
  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, session: null })
  },
  loadProfile: async (userId: string) => {
    const { data } = await supabase
      .from('user_profiles')
      .select('anthropic_api_key, anthropic_model')
      .eq('user_id', userId)
      .single()
    if (data) {
      if (data.anthropic_api_key) localStorage.setItem('anthropic_api_key', data.anthropic_api_key)
      if (data.anthropic_model) localStorage.setItem('anthropic_model', data.anthropic_model)
    }
  },
}))
