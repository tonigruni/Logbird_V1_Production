import { useState, useCallback } from 'react'
import IntentionCard     from '../sections/IntentionCard'
import JournalQuick      from '../sections/JournalQuick'
import GratitudeSection  from '../sections/GratitudeSection'
import MeditationSection from '../sections/MeditationSection'
import HabitsSection     from '../sections/HabitsSection'
import QuoteCard         from '../sections/QuoteCard'
import { useCheckin }    from '../../../context/CheckinContext'

interface PageMindProps {
  checkinId: string | null
}

export default function PageMind({ checkinId }: PageMindProps) {
  const { closeCheckin } = useCheckin()
  const [intention,      setIntention]      = useState('')
  const [gratitude,      setGratitude]      = useState<[string,string,string]>(['','',''])
  const [meditationDone, setMeditationDone] = useState(false)

  const persist = useCallback((patch: Record<string, unknown>) => {
    if (!checkinId) return
    console.debug('[PageMind] pending persist:', patch) // wired in future sprint
  }, [checkinId])

  return (
    <div className="space-y-4">
      <IntentionCard
        value={intention}
        onChange={setIntention}
        onBlur={() => persist({ intention })}
      />
      <JournalQuick onClose={closeCheckin} />
      <div onBlur={() => persist({ gratitude: gratitude.filter(Boolean) })}>
        <GratitudeSection values={gratitude} onChange={setGratitude} />
      </div>
      <MeditationSection
        onComplete={() => { setMeditationDone(true); persist({ meditation_completed: true }) }}
        completed={meditationDone}
      />
      <HabitsSection onClose={closeCheckin} />
      <QuoteCard />
    </div>
  )
}
