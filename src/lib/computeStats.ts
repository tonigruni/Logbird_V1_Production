import { differenceInCalendarDays, subDays, subMonths, subYears, format, startOfDay } from 'date-fns'
import type { JournalEntry } from '../stores/journalStore'

export type Period = 'weekly' | 'monthly' | 'yearly' | 'all'

export interface ComputedStats {
  totalEntries: number
  avgWordsPerEntry: number
  currentStreak: number
  longestStreak: number
  moodDistribution: { score: number; count: number }[]
  categoryBreakdown: { category: string; count: number }[]
  entriesPerDayOfWeek: { day: string; count: number }[]
  moodOverTime: { date: string; mood: number }[]
  wordCountOverTime: { date: string; words: number }[]
  avgMood: number
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function filterByPeriod(entries: JournalEntry[], period: Period): JournalEntry[] {
  if (period === 'all') return entries
  const now = new Date()
  const cutoff =
    period === 'weekly' ? subDays(now, 7) :
    period === 'monthly' ? subMonths(now, 1) :
    subYears(now, 1)
  return entries.filter((e) => new Date(e.created_at) >= cutoff)
}

export function computeStats(entries: JournalEntry[], period: Period): ComputedStats {
  const filtered = filterByPeriod(entries, period)

  const totalEntries = filtered.length
  if (totalEntries === 0) return emptyStats()

  // Word counts
  const wordCounts = filtered.map((e) => e.content.split(/\s+/).filter(Boolean).length)
  const avgWordsPerEntry = Math.round(wordCounts.reduce((a, b) => a + b, 0) / totalEntries)

  // Streaks (computed on ALL entries, not filtered)
  const { currentStreak, longestStreak } = computeStreaks(entries)

  // Mood distribution
  const moodCounts: Record<number, number> = {}
  let moodSum = 0
  let moodCount = 0
  for (const e of filtered) {
    if (e.mood_score != null) {
      moodCounts[e.mood_score] = (moodCounts[e.mood_score] || 0) + 1
      moodSum += e.mood_score
      moodCount++
    }
  }
  const moodDistribution = [1, 2, 3, 4, 5].map((score) => ({
    score,
    count: moodCounts[score] || 0,
  }))
  const avgMood = moodCount > 0 ? Math.round((moodSum / moodCount) * 10) / 10 : 0

  // Category breakdown
  const catCounts: Record<string, number> = {}
  for (const e of filtered) {
    const cat = e.category || 'Uncategorized'
    catCounts[cat] = (catCounts[cat] || 0) + 1
  }
  const categoryBreakdown = Object.entries(catCounts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)

  // Entries per day of week
  const dayCounts: Record<number, number> = {}
  for (const e of filtered) {
    const day = new Date(e.created_at).getDay()
    dayCounts[day] = (dayCounts[day] || 0) + 1
  }
  const entriesPerDayOfWeek = DAY_NAMES.map((day, i) => ({
    day,
    count: dayCounts[i] || 0,
  }))

  // Mood over time (one point per day, averaged if multiple entries)
  const moodByDate: Record<string, { sum: number; count: number }> = {}
  for (const e of filtered) {
    if (e.mood_score == null) continue
    const dateKey = format(new Date(e.created_at), 'MMM d')
    if (!moodByDate[dateKey]) moodByDate[dateKey] = { sum: 0, count: 0 }
    moodByDate[dateKey].sum += e.mood_score
    moodByDate[dateKey].count++
  }
  const moodOverTime = Object.entries(moodByDate).map(([date, v]) => ({
    date,
    mood: Math.round((v.sum / v.count) * 10) / 10,
  }))

  // Word count over time
  const wordsByDate: Record<string, { sum: number; count: number }> = {}
  for (const e of filtered) {
    const dateKey = format(new Date(e.created_at), 'MMM d')
    const words = e.content.split(/\s+/).filter(Boolean).length
    if (!wordsByDate[dateKey]) wordsByDate[dateKey] = { sum: 0, count: 0 }
    wordsByDate[dateKey].sum += words
    wordsByDate[dateKey].count++
  }
  const wordCountOverTime = Object.entries(wordsByDate).map(([date, v]) => ({
    date,
    words: Math.round(v.sum / v.count),
  }))

  return {
    totalEntries,
    avgWordsPerEntry,
    currentStreak,
    longestStreak,
    moodDistribution,
    categoryBreakdown,
    entriesPerDayOfWeek,
    moodOverTime,
    wordCountOverTime,
    avgMood,
  }
}

function computeStreaks(entries: JournalEntry[]): { currentStreak: number; longestStreak: number } {
  if (entries.length === 0) return { currentStreak: 0, longestStreak: 0 }

  // Get unique dates (sorted descending — entries are already desc from store)
  const uniqueDates = [
    ...new Set(entries.map((e) => startOfDay(new Date(e.created_at)).getTime())),
  ].sort((a, b) => b - a)

  // Current streak: count consecutive days from today
  let currentStreak = 0
  const today = startOfDay(new Date()).getTime()
  for (let i = 0; i < uniqueDates.length; i++) {
    const expected = startOfDay(subDays(new Date(today), i)).getTime()
    if (uniqueDates[i] === expected) {
      currentStreak++
    } else if (i === 0 && differenceInCalendarDays(today, uniqueDates[0]) === 1) {
      // Allow starting from yesterday if no entry today yet
      currentStreak = 1
      const shifted = uniqueDates.map((_, j) => startOfDay(subDays(new Date(uniqueDates[0]), j)).getTime())
      for (let j = 1; j < uniqueDates.length; j++) {
        if (uniqueDates[j] === shifted[j]) currentStreak++
        else break
      }
      break
    } else {
      break
    }
  }

  // Longest streak
  let longestStreak = 1
  let streak = 1
  for (let i = 1; i < uniqueDates.length; i++) {
    if (differenceInCalendarDays(uniqueDates[i - 1], uniqueDates[i]) === 1) {
      streak++
      longestStreak = Math.max(longestStreak, streak)
    } else {
      streak = 1
    }
  }

  return { currentStreak, longestStreak }
}

function emptyStats(): ComputedStats {
  return {
    totalEntries: 0,
    avgWordsPerEntry: 0,
    currentStreak: 0,
    longestStreak: 0,
    moodDistribution: [1, 2, 3, 4, 5].map((score) => ({ score, count: 0 })),
    categoryBreakdown: [],
    entriesPerDayOfWeek: DAY_NAMES.map((day) => ({ day, count: 0 })),
    moodOverTime: [],
    wordCountOverTime: [],
    avgMood: 0,
  }
}
