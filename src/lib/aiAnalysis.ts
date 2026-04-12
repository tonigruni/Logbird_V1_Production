/**
 * AI-powered journal analysis service.
 * Uses the Anthropic API to analyze journal entries and return structured insights.
 * Results are persisted to Supabase (ai_insights table) per user.
 */

import { supabase } from './supabase'
import type { JournalEntry } from '../stores/journalStore'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface SentimentPoint {
  label: string
  positive: number
  neutral: number
}

export interface KeywordItem {
  word: string
  weight: 'xl' | 'lg' | 'md' | 'sm' | 'xs'
  type: 'accent' | 'primary'
}

export interface AnalysisData {
  sentimentTrend: SentimentPoint[]
  keywords: KeywordItem[]
  keywordObservation: string
  breakthroughs: string[]
  correlationCoeff: number
  impactLevel: string
  clarityScore: number
  clarityDelta: number
}

export interface InsightsData {
  weeklySummary: string
  dominantTheme: string
  consistency: number
  insightsCount: number
  moodDescription: string
  breakthroughs: string[]
  themes: { word: string; weight: number }[]
  quietHoursInsight: string
  benchmarks: {
    sentiment: { label: string; value: number; delta: number }
    journalDepth: { avgWords: number; delta: number }
    burnout: { label: string; probability: number; delta: number }
  }
  emotionalPatterns?: string[]
  growthObservations?: string[]
  wellnessIndicators?: { area: string; status: string; suggestion: string }[]
  keyTakeaways?: string[]
}

/* ------------------------------------------------------------------ */
/*  Supabase persistence                                               */
/* ------------------------------------------------------------------ */

export async function loadSavedAnalysis(userId: string): Promise<AnalysisData | null> {
  // Same-session fast path — return in-memory cache immediately
  if (analysisCache) return analysisCache.data

  // Cross-session: query Supabase
  try {
    const { data, error } = await supabase
      .from('ai_insights')
      .select('data')
      .eq('user_id', userId)
      .eq('type', 'analysis')
      .single()
    if (error || !data) return null
    const result = data.data as unknown as AnalysisData
    // Warm the cache so future navigations are instant
    analysisCache = { data: result, timestamp: Date.now(), entryCount: -1 }
    return result
  } catch {
    return null
  }
}

export async function loadSavedInsights(userId: string, period = 'all'): Promise<InsightsData | null> {
  const typeKey = `insights_${period}`
  // Same-session fast path — return in-memory cache immediately
  const cached = insightsCacheMap[typeKey]
  if (cached) return cached.data

  // Cross-session: query Supabase
  try {
    const { data, error } = await supabase
      .from('ai_insights')
      .select('data')
      .eq('user_id', userId)
      .eq('type', typeKey)
      .single()
    if (error || !data) return null
    const result = data.data as unknown as InsightsData
    // Warm the cache so future navigations are instant
    insightsCacheMap[typeKey] = { data: result, timestamp: Date.now(), entryCount: -1 }
    return result
  } catch {
    return null
  }
}

async function persistAnalysis(userId: string, data: AnalysisData) {
  await supabase.from('ai_insights').upsert(
    { user_id: userId, type: 'analysis', data: data as unknown as Record<string, unknown>, updated_at: new Date().toISOString() },
    { onConflict: 'user_id,type' }
  )
}

async function persistInsights(userId: string, data: InsightsData, period = 'all') {
  const typeKey = `insights_${period}`
  await supabase.from('ai_insights').upsert(
    { user_id: userId, type: typeKey, data: data as unknown as Record<string, unknown>, updated_at: new Date().toISOString() },
    { onConflict: 'user_id,type' }
  )
}

export { persistInsights }

/* ------------------------------------------------------------------ */
/*  In-memory cache (dedup rapid repeat calls within a session)        */
/* ------------------------------------------------------------------ */

interface CacheEntry<T> {
  data: T
  timestamp: number
  entryCount: number
}

const CACHE_TTL = 10 * 60 * 1000 // 10 minutes
let analysisCache: CacheEntry<AnalysisData> | null = null
let insightsCacheMap: Record<string, CacheEntry<InsightsData>> = {}

function isCacheValid<T>(cache: CacheEntry<T> | null, currentEntryCount: number): cache is CacheEntry<T> {
  if (!cache) return false
  if (Date.now() - cache.timestamp > CACHE_TTL) return false
  if (cache.entryCount !== currentEntryCount) return false
  return true
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''

const MOOD_LABELS: Record<number, string> = {
  1: 'Very Low',
  2: 'Low',
  3: 'Neutral',
  4: 'Good',
  5: 'Excellent',
}

function formatEntries(entries: JournalEntry[], limit = 30): string {
  return entries
    .slice(0, limit)
    .map((e) => {
      const d = new Date(e.created_at)
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      const mood = e.mood_score != null ? ` | Mood: ${MOOD_LABELS[e.mood_score]} (${e.mood_score}/5)` : ''
      const category = e.category ? ` | Category: ${e.category}` : ''
      const location = e.location ? ` | Location: ${e.location}` : ''
      const weather = e.weather ? ` | Weather: ${e.weather}` : ''
      return `[${dateStr}${mood}${category}${location}${weather}] ${e.title}:\n${e.content}`
    })
    .join('\n\n---\n\n')
}

async function callAnthropic(systemPrompt: string, userPrompt: string): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) throw new Error('NO_API_KEY')

  const edgeFunctionUrl = `${SUPABASE_URL}/functions/v1/anthropic-proxy`

  const res = await fetch(edgeFunctionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  })

  let data: Record<string, unknown> = {}
  try {
    data = await res.json()
  } catch {
    throw new Error(`AI analysis request failed (${res.status})`)
  }

  if (!res.ok) {
    const errMsg: string = (data?.error as string) ?? ''
    console.error('[AI Analysis] Proxy error:', res.status, errMsg)
    if (errMsg.includes('NO_API_KEY')) throw new Error('NO_API_KEY')
    if (errMsg.startsWith('API_ERROR:')) throw new Error(errMsg)
    throw new Error(errMsg || `AI analysis request failed (${res.status})`)
  }

  const block = data.content?.[0]
  const text = block?.type === 'text' ? block.text : ''
  if (!text) {
    console.error('[AI Analysis] Empty response from API')
    throw new Error('API returned an empty response')
  }
  return text
}

function parseJSON<T>(text: string): T {
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  const jsonStr = jsonMatch ? jsonMatch[1].trim() : text.trim()
  return JSON.parse(jsonStr)
}

/* ------------------------------------------------------------------ */
/*  Analysis (for Analysis page)                                       */
/* ------------------------------------------------------------------ */

export async function fetchAnalysis(entries: JournalEntry[], userId: string): Promise<AnalysisData> {
  if (isCacheValid(analysisCache, entries.length)) {
    return analysisCache.data
  }

  if (entries.length === 0) {
    return getEmptyAnalysis()
  }

  const context = formatEntries(entries)

  const systemPrompt = `You are a journal analysis AI. Analyze the provided journal entries and return ONLY valid JSON (no markdown, no explanation) matching this exact structure:

{
  "sentimentTrend": [{"label": "Week 1", "positive": 70, "neutral": 30}, ...],
  "keywords": [{"word": "Focus", "weight": "xl", "type": "accent"}, ...],
  "keywordObservation": "One sentence about the most notable keyword trend.",
  "breakthroughs": ["Breakthrough insight 1", "Breakthrough insight 2"],
  "correlationCoeff": 0.84,
  "impactLevel": "Strong",
  "clarityScore": 85,
  "clarityDelta": 12
}

Rules:
- sentimentTrend: 4-6 data points showing emotional valence over time (positive + neutral should roughly sum to 100)
- keywords: 5-8 dominant themes. weight is one of: xl, lg, md, sm, xs. type is "accent" for positive themes, "primary" for neutral/negative
- breakthroughs: 2-3 specific, actionable insights derived from the entries
- correlationCoeff: estimated correlation between journaling depth and expressed productivity (0-1)
- clarityScore: overall mental clarity score (0-100) based on entries
- clarityDelta: percentage change compared to what earlier entries suggest

Base everything on ACTUAL content from the entries. Do not invent data that contradicts the entries.`

  const userPrompt = `Analyze these journal entries:\n\n${context}`

  const raw = await callAnthropic(systemPrompt, userPrompt)
  const data = parseJSON<AnalysisData>(raw)

  analysisCache = { data, timestamp: Date.now(), entryCount: entries.length }
  await persistAnalysis(userId, data)
  return data
}

/* ------------------------------------------------------------------ */
/*  Insights (for Insights page)                                       */
/* ------------------------------------------------------------------ */

export async function fetchInsights(entries: JournalEntry[], userId: string, period = 'all'): Promise<InsightsData> {
  const typeKey = `insights_${period}`
  const cached = insightsCacheMap[typeKey]
  if (isCacheValid(cached ?? null, entries.length)) {
    return cached!.data
  }

  if (entries.length === 0) {
    return getEmptyInsights()
  }

  const context = formatEntries(entries)
  const totalWords = entries.reduce((sum, e) => sum + e.content.split(/\s+/).length, 0)
  const avgWords = Math.round(totalWords / entries.length)

  const systemPrompt = `You are a journal insights AI. Analyze the provided journal entries and return ONLY valid JSON (no markdown, no explanation) matching this exact structure:

{
  "weeklySummary": "2-3 sentence synthesis of the overall emotional and thematic arc of these entries.",
  "dominantTheme": "OneWord",
  "consistency": 84,
  "insightsCount": 12,
  "moodDescription": "Brief description of mood patterns across the entries.",
  "breakthroughs": ["Specific breakthrough 1", "Specific breakthrough 2"],
  "themes": [{"word": "Gratitude", "weight": 9}, {"word": "Growth", "weight": 7}, ...],
  "quietHoursInsight": "An observation about when the most reflective or creative entries are written.",
  "benchmarks": {
    "sentiment": {"label": "Highly Positive", "value": 0.82, "delta": 12},
    "journalDepth": {"avgWords": ${avgWords}, "delta": 5},
    "burnout": {"label": "Low Probability", "probability": 14, "delta": -30}
  },
  "emotionalPatterns": [
    "Pattern 1: A specific emotional pattern observed across entries",
    "Pattern 2: Another pattern with evidence from the entries",
    "Pattern 3: A third observation about emotional trends"
  ],
  "growthObservations": [
    "Growth observation 1: Evidence of personal development",
    "Growth observation 2: Another area of growth or learning"
  ],
  "wellnessIndicators": [
    {"area": "Mental Clarity", "status": "Strong", "suggestion": "Continue reflective journaling"},
    {"area": "Stress Management", "status": "Moderate", "suggestion": "Consider adding breathing exercises"},
    {"area": "Work-Life Balance", "status": "Needs Attention", "suggestion": "Schedule dedicated downtime"}
  ],
  "keyTakeaways": [
    "Actionable takeaway 1",
    "Actionable takeaway 2",
    "Actionable takeaway 3"
  ]
}

Rules:
- weeklySummary: Based on actual entry content, noting specific themes mentioned
- dominantTheme: Single word capturing the overall emotional direction
- consistency: Estimated journaling consistency percentage (how regular the entries are)
- insightsCount: Number of distinct insights you can extract from the entries
- breakthroughs: 2 specific, evidence-based observations from the entry content
- themes: 7-10 theme words with weight 1-10 based on prominence in entries
- benchmarks.journalDepth.avgWords must be ${avgWords} (the actual average)
- benchmarks.sentiment.delta and burnout.delta are estimated % changes
- emotionalPatterns: 3-4 specific emotional patterns with evidence from entries
- growthObservations: 2-3 observations about personal growth or learning
- wellnessIndicators: exactly 3 wellness areas with status (Strong/Moderate/Needs Attention) and actionable suggestion
- keyTakeaways: 3 concise, actionable takeaways the user can act on

Base everything on ACTUAL content from the entries. Do not invent data that contradicts what was written.`

  const userPrompt = `Analyze these journal entries for deep insights:\n\n${context}`

  const raw = await callAnthropic(systemPrompt, userPrompt)
  const data = parseJSON<InsightsData>(raw)

  insightsCacheMap[typeKey] = { data, timestamp: Date.now(), entryCount: entries.length }
  await persistInsights(userId, data, period)
  return data
}

/* ------------------------------------------------------------------ */
/*  Empty / fallback data                                              */
/* ------------------------------------------------------------------ */

function getEmptyAnalysis(): AnalysisData {
  return {
    sentimentTrend: [],
    keywords: [],
    keywordObservation: 'Write some journal entries to see keyword analysis.',
    breakthroughs: [],
    correlationCoeff: 0,
    impactLevel: 'N/A',
    clarityScore: 0,
    clarityDelta: 0,
  }
}

function getEmptyInsights(): InsightsData {
  return {
    weeklySummary: 'Start journaling to receive AI-powered insights about your emotional patterns and growth.',
    dominantTheme: '',
    consistency: 0,
    insightsCount: 0,
    moodDescription: '',
    breakthroughs: [],
    themes: [],
    quietHoursInsight: '',
    benchmarks: {
      sentiment: { label: 'No data', value: 0, delta: 0 },
      journalDepth: { avgWords: 0, delta: 0 },
      burnout: { label: 'No data', probability: 0, delta: 0 },
    },
  }
}

/* ------------------------------------------------------------------ */
/*  Wheel of Life AI Insights                                         */
/* ------------------------------------------------------------------ */

export interface WheelAIInsightsData {
  mode: 'quick' | 'deep'
  sections: { title: string; content: string }[]
  generatedAt: string
}

let wheelInsightsCache: CacheEntry<WheelAIInsightsData> | null = null

export async function loadSavedWheelInsights(userId: string): Promise<WheelAIInsightsData | null> {
  if (wheelInsightsCache) return wheelInsightsCache.data
  try {
    const { data, error } = await supabase
      .from('ai_insights')
      .select('data')
      .eq('user_id', userId)
      .eq('type', 'wheel_insights')
      .single()
    if (error || !data) return null
    const result = data.data as unknown as WheelAIInsightsData
    wheelInsightsCache = { data: result, timestamp: Date.now(), entryCount: -1 }
    return result
  } catch {
    return null
  }
}

export async function fetchWheelInsights(
  payload: { overall_score: number; dimensions: Record<string, number>; areas: Record<string, number> },
  userId: string,
  mode: 'quick' | 'deep'
): Promise<WheelAIInsightsData> {
  const systemPrompt = `You are a high-performance life strategist.

Your job is NOT to summarize the user's data. Your job is to analyze it as a system and identify what is actually holding the user back.

Follow this exact process:
1. Diagnose the system: identify weakest/strongest areas and imbalances
2. Find contradictions: high in one area but weak in a dependent area
3. Identify the primary constraint: the ONE thing that if improved would have the biggest positive ripple effect
4. Explain WHY: specific to the user's data — no generic advice
5. Set a clear priority: one main focus, max two
6. Create a practical 7-day action plan: 3–5 specific, doable actions

Rules:
- Be direct, specific, and diagnostic
- Avoid generic self-help language
- Do not list everything — prioritize leverage over completeness
- Output must feel like a diagnosis, not a motivational blog post
${mode === 'quick' ? '- This is a QUICK INSIGHT — keep it punchy and under 250 words total.' : '- This is a DEEP STRATEGY — be thorough and fully developed.'}

Use EXACTLY these section headers (nothing else):

## Your Focus Right Now
[1–2 sentences: the main constraint]

## What's Actually Going On
[Diagnosis: patterns, contradictions, specific to the data]

## Why This Matters
[Consequence if unchanged — be specific]

## What To Focus On
[Clear priority, not a list]

## Action Plan (Next 7 Days)
1. ...
2. ...
3. ...${mode === 'deep' ? `

## Strategic Note
[One insight about the longer-term pattern this data reveals]` : ''}`

  const userPrompt = `Analyze this life system data (scores are 1–10):\n\n${JSON.stringify(payload, null, 2)}\n\nProvide a ${mode === 'quick' ? 'concise quick insight' : 'full deep strategy'}.`

  const raw = await callAnthropic(systemPrompt, userPrompt)

  const sections = raw
    .split(/^## /m)
    .filter(s => s.trim())
    .map(s => {
      const lines = s.trim().split('\n')
      return { title: lines[0].trim(), content: lines.slice(1).join('\n').trim() }
    })

  const result: WheelAIInsightsData = { mode, sections, generatedAt: new Date().toISOString() }
  wheelInsightsCache = { data: result, timestamp: Date.now(), entryCount: -1 }
  await supabase.from('ai_insights').upsert(
    { user_id: userId, type: 'wheel_insights', data: result as unknown as Record<string, unknown>, updated_at: new Date().toISOString() },
    { onConflict: 'user_id,type' }
  )
  return result
}

/* ------------------------------------------------------------------ */
/*  Clear cache                                                        */
/* ------------------------------------------------------------------ */

export function clearAnalysisCache() {
  analysisCache = null
  insightsCacheMap = {}
  wheelInsightsCache = null
}
