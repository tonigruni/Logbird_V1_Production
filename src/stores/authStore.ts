import { create } from 'zustand'
import { type User, type Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  avatarUrl: string | null
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setLoading: (loading: boolean) => void
  setAvatarUrl: (url: string | null) => void
  signOut: () => Promise<void>
  /** Fetches user_profiles and caches api key + model in localStorage for sync access */
  loadProfile: (userId: string) => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
  avatarUrl: null,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session, user: session?.user ?? null }),
  setLoading: (loading) => set({ loading }),
  setAvatarUrl: (avatarUrl) => set({ avatarUrl }),
  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, session: null, avatarUrl: null })
  },
  loadProfile: async (userId: string) => {
    const { data } = await supabase
      .from('user_profiles')
      .select('anthropic_api_key, anthropic_model, avatar_url')
      .eq('user_id', userId)
      .single()
    if (data) {
      if (data.avatar_url) set({ avatarUrl: data.avatar_url })
    }
  },
}))
