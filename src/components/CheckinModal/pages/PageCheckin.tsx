// src/components/CheckinModal/pages/PageCheckin.tsx
import { useState, useCallback } from 'react'
import { useAuthStore } from '../../../stores/authStore'
import { useWheelStore } from '../../../stores/wheelStore'
import MoodSection from '../sections/MoodSection'

interface PageCheckinProps {
  onCheckinCreated: (id: string) => void
  checkinId: string | null
}

function Hero({ name }: { name: string }) {
  const now     = new Date()
  const hr      = now.getHours()
  const greet   = hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening'
  const dateStr = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })
  const timeStr = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

  return (
    <div
      className="relative rounded-2xl overflow-hidden px-8 py-10 text-white mb-5"
      style={{ background: 'linear-gradient(180deg, #162838 0%, #1F3649 100%)' }}
    >
      {/* Gradient bars */}
      <div className="absolute inset-0 flex gap-1 pointer-events-none overflow-hidden opacity-30">
        {Array.from({ length: 14 }).map((_, i) => (
          <div
            key={i}
            className="flex-1"
            style={{
              background: 'linear-gradient(to top, rgba(255,255,255,0.18), transparent)',
              height: `${42 + (i % 5) * 10}%`,
              alignSelf: 'flex-end',
            }}
          />
        ))}
      </div>
      <div className="relative z-10">
        <div className="text-[11px] font-bold tracking-[0.14em] text-white/55 uppercase mb-2">
          {dateStr} · {timeStr}
        </div>
        <h1 className="text-[40px] font-extrabold tracking-tight leading-[1.08] text-white">
          {greet}, {name}.
        </h1>
        <p className="mt-2.5 text-white/60 text-[15px] max-w-sm leading-relaxed">
          A quiet moment before the day asks anything of you. Let's set the shape of it.
        </p>
      </div>
    </div>
  )
}

export default function PageCheckin({ onCheckinCreated, checkinId }: PageCheckinProps) {
  const { user }        = useAuthStore()
  const { createCheckin } = useWheelStore()
  const [words,  setWords]  = useState<string[]>([])
  const [energy, setEnergy] = useState<number | null>(null)
  const [showErrors, setShowErrors] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const name = (user?.user_metadata?.full_name as string | undefined)?.split(' ')[0]
    ?? user?.email?.split('@')[0]
    ?? 'there'

  const handleSubmit = useCallback(async () => {
    if (checkinId) return // already submitted — idempotent
    if (words.length === 0 || energy == null) {
      setShowErrors(true)
      return
    }
    setSubmitting(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      await createCheckin({
        user_id:              user!.id,
        date:                 today,
        scores:               {},
        sub_scores:           null,
        reflection_answers:   null,
        notes:                null,
        context:              null,
        energy_level:         energy,
        mood_words:           words,
        intention:            null,
        gratitude:            null,
        meditation_completed: null,
      })
      // Pull the newly created checkin id from the store
      const { checkins } = useWheelStore.getState()
      const newest = checkins[0]
      if (newest) onCheckinCreated(newest.id)
    } finally {
      setSubmitting(false)
    }
  }, [checkinId, words, energy, user, createCheckin, onCheckinCreated])

  return (
    <div>
      <Hero name={name} />
      <MoodSection
        words={words}
        energy={energy}
        onWordsChange={setWords}
        onEnergyChange={setEnergy}
        showErrors={showErrors}
      />
      {/* Submit is triggered by the modal's "Next" button — we expose it via a data attr */}
      <button
        id="checkin-page-submit"
        onClick={handleSubmit}
        disabled={submitting}
        className="sr-only"
        aria-hidden
      />
    </div>
  )
}
