// src/components/CheckinModal/sections/JournalQuick.tsx
import { useState, useCallback } from 'react'
import { BookOpen, ArrowRight } from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'
import { useJournalStore } from '../../../stores/journalStore'
import { useAuthStore } from '../../../stores/authStore'

interface JournalQuickProps {
  onClose: () => void
}

export default function JournalQuick({ onClose }: JournalQuickProps) {
  const navigate      = useNavigate()
  const { user }      = useAuthStore()
  const { createEntry } = useJournalStore()
  const [value, setValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)

  const wordCount = value.trim().split(/\s+/).filter(Boolean).length

  const save = useCallback(async () => {
    if (!value.trim() || !user || saving || saved) return
    setSaving(true)
    try {
      const today = new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })
      await createEntry({
        user_id:      user.id,
        title:        `Morning Pages — ${today}`,
        content:      value.trim(),
        mood_score:   null,
        template_id:  null,
        category:     'morning-pages',
        location:     null,
        weather:      null,
        is_favorite:  false,
        sleep_quality:null,
        had_alcohol:  null,
        exercised:    null,
        energy_level: null,
      })
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }, [value, user, createEntry, saving, saved])

  const openInJournal = () => {
    onClose()
    navigate('/journal', { state: { openNew: true } })
  }

  return (
    <div className="rounded-2xl border border-[#ECEFF2] bg-white p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[16px] font-bold tracking-tight flex items-center gap-2">
          <BookOpen size={16} className="text-[#1F3649]" /> Morning pages
        </h3>
        <span className="text-[11px] text-[#adb3b4]">{wordCount} words</span>
      </div>
      <textarea
        value={value}
        onChange={e => { setValue(e.target.value); setSaved(false) }}
        placeholder="Write freely. Nothing here needs to be good. Just true."
        rows={5}
        className="w-full resize-none rounded-xl border border-[#ECEFF2] bg-[#fafbfb] px-4 py-3 text-[14px] text-[#2d3435] leading-relaxed outline-none focus:border-[#1F3649]/30 focus:ring-2 focus:ring-[#1F3649]/10 transition-all"
      />
      <div className="flex items-center justify-between mt-3">
        <span className="text-[11px] text-[#adb3b4]">
          {saved ? '✓ Saved to Journal' : 'Saves to Journal'}
        </span>
        <div className="flex gap-2">
          {value.trim() && !saved && (
            <button
              onClick={save}
              disabled={saving}
              className="text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-[#1F3649] text-white hover:bg-[#162838] transition-colors disabled:opacity-60 cursor-pointer"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          )}
          <button
            onClick={openInJournal}
            className="inline-flex items-center gap-1 text-[12px] font-semibold px-3 py-1.5 rounded-lg border border-[#ECEFF2] text-[#5a6061] hover:bg-[#f7f9fa] transition-colors cursor-pointer"
          >
            Expand <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  )
}
