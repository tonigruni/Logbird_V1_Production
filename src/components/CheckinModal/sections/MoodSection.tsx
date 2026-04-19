// src/components/CheckinModal/sections/MoodSection.tsx
import { Lightning } from '@phosphor-icons/react'

const MOOD_WORDS: { w: string; tone: 'positive' | 'neutral' | 'negative' }[] = [
  { w: 'Focused',      tone: 'positive' },
  { w: 'Energised',    tone: 'positive' },
  { w: 'Grateful',     tone: 'positive' },
  { w: 'Calm',         tone: 'positive' },
  { w: 'Motivated',    tone: 'positive' },
  { w: 'Creative',     tone: 'positive' },
  { w: 'Hopeful',      tone: 'positive' },
  { w: 'Confident',    tone: 'positive' },
  { w: 'Content',      tone: 'positive' },
  { w: 'Inspired',     tone: 'positive' },
  { w: 'Neutral',      tone: 'neutral'  },
  { w: 'Tired',        tone: 'neutral'  },
  { w: 'Distracted',   tone: 'neutral'  },
  { w: 'Restless',     tone: 'neutral'  },
  { w: 'Uncertain',    tone: 'neutral'  },
  { w: 'Pensive',      tone: 'neutral'  },
  { w: 'Anxious',      tone: 'negative' },
  { w: 'Stressed',     tone: 'negative' },
  { w: 'Overwhelmed',  tone: 'negative' },
  { w: 'Sad',          tone: 'negative' },
  { w: 'Frustrated',   tone: 'negative' },
  { w: 'Drained',      tone: 'negative' },
]

const TONE_ACTIVE: Record<string, string> = {
  positive: 'bg-[#1F3649] border-[#1F3649] text-white',
  neutral:  'bg-[#5a6061] border-[#5a6061] text-white',
  negative: 'bg-[#9f403d] border-[#9f403d] text-white',
}

interface MoodSectionProps {
  words: string[]
  energy: number | null
  onWordsChange: (words: string[]) => void
  onEnergyChange: (energy: number) => void
  showErrors?: boolean
}

export default function MoodSection({
  words, energy, onWordsChange, onEnergyChange, showErrors = false,
}: MoodSectionProps) {
  const toggle = (w: string) => {
    onWordsChange(words.includes(w) ? words.filter(x => x !== w) : [...words, w])
  }

  const wordsMissing  = words.length === 0
  const energyMissing = energy == null

  return (
    <div className={[
      'rounded-2xl border p-5',
      showErrors && wordsMissing ? 'border-red-300 bg-red-50/30' : 'border-[#ECEFF2] bg-white',
    ].join(' ')}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-[17px] font-bold tracking-tight text-[#2d3435]">
            How's the weather inside?
          </h3>
          <p className="text-[12.5px] text-[#5a6061] mt-0.5">
            {showErrors && wordsMissing
              ? 'Pick at least one — there are no wrong answers.'
              : 'No wrong answers. Just honest weather.'}
          </p>
        </div>
        {showErrors && wordsMissing && (
          <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full tracking-wide uppercase">
            Required
          </span>
        )}
      </div>

      {/* Word cloud */}
      <div className="flex flex-wrap gap-2">
        {MOOD_WORDS.map(({ w, tone }) => {
          const on = words.includes(w)
          return (
            <button
              key={w}
              onClick={() => toggle(w)}
              className={[
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[13px] font-semibold transition-all duration-150 cursor-pointer',
                on ? TONE_ACTIVE[tone] : 'border-[#ECEFF2] bg-white text-[#5a6061] hover:border-[#1F3649]/30',
              ].join(' ')}
            >
              <span className={[
                'w-1.5 h-1.5 rounded-full shrink-0',
                on
                  ? 'bg-white opacity-80'
                  : tone === 'positive' ? 'bg-[#1F3649] opacity-50'
                  : tone === 'neutral'  ? 'bg-[#5a6061] opacity-50'
                  : 'bg-[#9f403d] opacity-50',
              ].join(' ')} />
              {w}
            </button>
          )
        })}
      </div>

      {/* Energy */}
      <div className={['mt-5 pt-4 border-t border-[#ECEFF2]', showErrors && energyMissing ? 'animate-[shake_420ms_ease]' : ''].join(' ')}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[12.5px] font-bold text-[#2d3435]">Energy level</span>
            {showErrors && energyMissing && (
              <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full tracking-wide uppercase">
                Required
              </span>
            )}
          </div>
          <span className="text-[11px] text-[#adb3b4]">where are you starting from?</span>
        </div>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map(i => {
            const on = energy != null && i <= energy
            return (
              <button
                key={i}
                onClick={() => onEnergyChange(i)}
                className={[
                  'flex-1 h-9 rounded-[10px] border-2 flex items-center justify-center transition-all duration-150 cursor-pointer',
                  on
                    ? 'border-amber-400 bg-amber-50'
                    : showErrors && energyMissing
                    ? 'border-red-300 bg-white'
                    : 'border-[#ECEFF2] bg-white hover:border-amber-200',
                ].join(' ')}
              >
                <Lightning size={15} weight={on ? 'fill' : 'regular'} className={on ? 'text-amber-400' : 'text-[#D6DCE0]'} />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
