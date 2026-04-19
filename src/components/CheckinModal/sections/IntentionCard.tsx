// src/components/CheckinModal/sections/IntentionCard.tsx
import { Target } from '@phosphor-icons/react'

const QUICK_FILLS = [
  'Move slowly.',
  'Finish the hard thing first.',
  'Be kind in writing.',
  'Say no once.',
]

interface IntentionCardProps {
  value: string
  onChange: (v: string) => void
  onBlur?: () => void
}

export default function IntentionCard({ value, onChange, onBlur }: IntentionCardProps) {
  return (
    <div className="rounded-2xl border border-[#ECEFF2] bg-white p-6 relative overflow-hidden">
      <div className="absolute right-4 top-4 opacity-[0.04] pointer-events-none">
        <Target size={120} />
      </div>
      <div className="relative">
        <div className="text-[10px] font-bold tracking-[0.14em] text-[#adb3b4] uppercase mb-2">
          Intention for today
        </div>
        <textarea
          rows={2}
          placeholder="Today I want to…"
          value={value}
          onChange={e => onChange(e.target.value)}
          onBlur={onBlur}
          className="w-full resize-none rounded-xl border border-[#ECEFF2] bg-[#fafbfb] px-4 py-3 text-[14px] text-[#2d3435] leading-relaxed outline-none focus:border-[#1F3649]/30 focus:ring-2 focus:ring-[#1F3649]/10 transition-all"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {QUICK_FILLS.map(s => (
            <button
              key={s}
              onClick={() => onChange(s)}
              className="text-[12px] font-medium px-3 py-1.5 rounded-full border border-[#ECEFF2] bg-white text-[#5a6061] hover:border-[#1F3649]/25 transition-colors cursor-pointer"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
