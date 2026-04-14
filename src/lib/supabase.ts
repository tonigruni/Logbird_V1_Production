import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zgbwmoypiaegxciymogc.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnYndtb3lwaWFlZ3hjaXltb2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MTQ3NTMsImV4cCI6MjA5MTA5MDc1M30.7VOd7y6mvkUWjcn9Gm3PQHaUPh8VWPnyZkwhP4L7ar0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      journal_entries: {
        Row: { id: string; user_id: string; title: string; content: string; mood_score: number | null; template_id: string | null; category: string | null; location: string | null; weather: string | null; is_favorite: boolean; created_at: string; updated_at: string }
        Insert: { id?: string; user_id: string; title: string; content: string; mood_score?: number | null; template_id?: string | null; category?: string | null; location?: string | null; weather?: string | null; is_favorite?: boolean; created_at?: string; updated_at?: string }
        Update: { title?: string; content?: string; mood_score?: number | null; template_id?: string | null; category?: string | null; location?: string | null; weather?: string | null; is_favorite?: boolean; updated_at?: string }
      }
      journal_templates: {
        Row: { id: string; user_id: string; name: string; structure: Record<string, unknown>; created_at: string }
        Insert: { id?: string; user_id: string; name: string; structure: Record<string, unknown>; created_at?: string }
        Update: { name?: string; structure?: Record<string, unknown> }
      }
      wheel_categories: {
        Row: { id: string; user_id: string; name: string; is_custom: boolean; is_active: boolean }
        Insert: { id?: string; user_id: string; name: string; is_custom?: boolean; is_active?: boolean }
        Update: { name?: string; is_active?: boolean }
      }
      wheel_checkins: {
        Row: { id: string; user_id: string; date: string; scores: Record<string, number>; notes: string | null; created_at: string }
        Insert: { id?: string; user_id: string; date: string; scores: Record<string, number>; notes?: string | null; created_at?: string }
        Update: { scores?: Record<string, number>; notes?: string | null }
      }
      goals: {
        Row: { id: string; user_id: string; category_id: string; title: string; description: string | null; status: string; target_date: string | null; created_at: string }
        Insert: { id?: string; user_id: string; category_id: string; title: string; description?: string | null; status?: string; target_date?: string | null }
        Update: { title?: string; description?: string | null; status?: string; target_date?: string | null }
      }
      tasks: {
        Row: { id: string; user_id: string; goal_id: string | null; category_id: string | null; title: string; completed: boolean; due_date: string | null; created_at: string }
        Insert: { id?: string; user_id: string; goal_id?: string | null; category_id?: string | null; title: string; completed?: boolean; due_date?: string | null }
        Update: { title?: string; completed?: boolean; due_date?: string | null }
      }
      user_profiles: {
        Row: { id: string; user_id: string; full_name: string | null; avatar_url: string | null; anthropic_api_key: string | null; anthropic_model: string | null; created_at: string }
        Insert: { id?: string; user_id: string; full_name?: string | null; avatar_url?: string | null; anthropic_api_key?: string | null; anthropic_model?: string | null }
        Update: { full_name?: string | null; avatar_url?: string | null; anthropic_api_key?: string | null; anthropic_model?: string | null }
      }
      ai_insights: {
        Row: { id: string; user_id: string; type: 'analysis' | 'insights'; data: Record<string, unknown>; created_at: string; updated_at: string }
        Insert: { id?: string; user_id: string; type: 'analysis' | 'insights'; data: Record<string, unknown>; created_at?: string; updated_at?: string }
        Update: { data?: Record<string, unknown>; updated_at?: string }
      }
    }
  }
}
