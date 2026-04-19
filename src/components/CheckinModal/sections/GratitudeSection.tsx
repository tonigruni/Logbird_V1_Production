// src/components/CheckinModal/sections/GratitudeSection.tsx
import { Heart } from '@phosphor-icons/react'

const PLACEHOLDERS = [
  'the coffee this morning',
  'someone who made you smile',
  'something easy you take for granted',
]

interface GratitudeSectionProps {
  values: [string, string, string]
  onChange: (values: [string, string, string]) => void
}

export default function GratitudeSection({ values, onChange }: GratitudeSectionProps) {
  const set = (i: number, v: string) => {
    const next = [...values] as [string, string, string]
    next[i] = v
    onChange(next)
  }

  return (
    <div className="rounded-2xl border border-[#f5ecd6] bg-[#fefcf7] p-5">
      <div className="flex items-center gap-2 mb-4">
        <Heart size={16} weight="fill" className="text-yellow-600" />
        <h3 className="text-[16px] font-bold tracking-tight text-[#78350f]">
          Three things, small or loud.
        </h3>
      </div>
      {([0, 1, 2] as const).map(i => (
        <div key={i} className={['relative', i < 2 ? 'mb-2.5' : ''].join(' ')}>
          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[11px] font-semibold text-yellow-600">
            0{i + 1}
          </span>
          <input
            value={values[i]}
            onChange={e => set(i, e.target.value)}
            placeholder={PLACEHOLDERS[i]}
            className="w-full pl-9 pr-4 h-10 rounded-xl border border-[#f5ecd6] bg-white text-[13.5px] text-[#2d3435] outline-none focus:border-yellow-300 focus:ring-2 focus:ring-yellow-100 transition-all"
          />
        </div>
      ))}
    </div>
  )
}
